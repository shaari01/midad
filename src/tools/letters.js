// Letters tool: select individual live letters inside a «حروف حيّة» object and
// move / scale / rotate / smart-stretch them, with the connection magnet.
import { apply, invert, mul, translate } from '../core/model.js';
import { getFontSync } from '../core/fonts.js';
import { itemPolygon, pointInPoly, itemJoints, itemPlaced, defaultT } from '../core/letters.js';
import { handleMarkup } from './select.js';
import { toast } from '../ui/dom.js';

const poly = (cv, o, pts) => pts.map(([x, y]) => cv.toScreen(...apply(o.m, x, y)).join(',')).join(' ');

export const LettersTool = {
  id: 'letters',
  target(app) { const o = app.one; return o && o.type === 'letters' ? o : null; },
  selItems(app) {
    const o = this.target(app);
    const ids = app.toolState.items || [];
    return o ? o.items.filter((i) => ids.includes(i.id)) : [];
  },
  overlay(cv) {
    const app = cv.app;
    const o = this.target(app);
    if (!o) return '';
    const fh = getFontSync(o.fontId);
    if (!fh) return '';
    const sel = new Set(app.toolState.items || []);
    let s = '';
    for (const it of o.items) {
      const p = itemPolygon(fh, o, it);
      s += `<polygon class="${sel.has(it.id) ? 'lsel' : 'lbox'}" points="${poly(cv, o, p)}"/>`;
    }
    const items = this.selItems(app);
    if (items.length === 1) {
      let p = itemPolygon(fh, o, items[0]).map(([x, y]) => cv.toScreen(...apply(o.m, x, y)));
      // push the handles outwards so they never cover a small letter
      const cx0 = p.reduce((a, q) => a + q[0], 0) / 4, cy0 = p.reduce((a, q) => a + q[1], 0) / 4;
      p = p.map(([x, y]) => { const dx = x - cx0, dy = y - cy0, l = Math.hypot(dx, dy) || 1; return [x + (dx / l) * 26, y + (dy / l) * 26]; });
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const [p0, p1, p2, p3] = p;
      const top = mid(p0, p1);
      const c = mid(p0, p2);
      const dir = [top[0] - c[0], top[1] - c[1]];
      const len = Math.hypot(...dir) || 1;
      const rot = [top[0] + (dir[0] / len) * 40, top[1] + (dir[1] / len) * 40];
      s += `<line class="selline" x1="${top[0]}" y1="${top[1]}" x2="${rot[0]}" y2="${rot[1]}"/>`;
      s += handleMarkup('rot', rot[0], rot[1], 'h rot');
      s += handleMarkup('scale', p2[0], p2[1], 'h');
      s += handleMarkup('scale', p0[0], p0[1], 'h');
      s += handleMarkup('stretchL', ...mid(p0, p3), 'h side str');
      s += handleMarkup('stretchR', ...mid(p1, p2), 'h side str');
      s += handleMarkup('stretchT', ...top, 'h side str');
      s += handleMarkup('stretchB', ...mid(p3, p2), 'h side str');
    }
    if (this.snapPt) { const [x, y] = cv.toScreen(...apply(o.m, ...this.snapPt)); s += `<circle class="magnet" cx="${x}" cy="${y}" r="14"/>`; }
    return s;
  },
  hitItem(cv, o, x, y) {
    const fh = getFontSync(o.fontId);
    const [lx, ly] = apply(invert(o.m), x, y);
    // marks first (small, on top of letters), then reverse depth order
    const list = [...o.items].reverse().sort((a, b) => (b.kind === 'mark') - (a.kind === 'mark'));
    for (const it of list) if (pointInPoly([lx, ly], itemPolygon(fh, o, it))) return it;
    return null;
  },
  down(ev, cv) {
    const app = cv.app;
    const o = this.target(app);
    if (!o) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      if (hit?.type === 'letters') { app.select(hit.id); app.setTool('letters'); return; }
      if (hit?.type === 'text') { app.select(hit.id); app.emit('explodeText', hit); return; }
      toast('المس كلمة لفكّها إلى حروف');
      return;
    }
    const fh = getFontSync(o.fontId);
    const h = ev.target.closest?.('[data-handle]');
    const local = apply(invert(o.m), ev.x, ev.y);
    // a touch inside the selected letter itself always moves it (handles of
    // tiny letters can overlap the letter)
    const insideSel = this.selItems(app).length === 1 && this.hitItem(cv, o, ev.x, ev.y)?.id === this.selItems(app)[0].id;
    if (h && this.selItems(app).length === 1 && (!insideSel || h.getAttribute('data-handle') === 'rot')) {
      const it = this.selItems(app)[0];
      const { bb, M } = itemPlaced(fh, o, it);
      const c = apply(M, bb.x + bb.w / 2, bb.y + bb.h / 2);
      this.op = { kind: h.getAttribute('data-handle'), it, t0: { ...it.t }, start: local, c, invM: invert(M), bb };
      return;
    }
    const it = this.hitItem(cv, o, ev.x, ev.y);
    if (it) {
      const ids = app.toolState.items || [];
      if (ev.shift || ev.ctrl || app.settings.lettersMulti) app.toolState.items = ids.includes(it.id) ? ids.filter((i) => i !== it.id) : [...ids, it.id];
      else if (!ids.includes(it.id)) app.toolState.items = [it.id];
      const items = this.selItems(app);
      this.op = { kind: 'move', start: local, t0s: items.map((i) => ({ ...i.t })), items };
      app.render({ panels: true });
      return;
    }
    // outside letters: leave the tool if tapping elsewhere
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit && hit.id !== o.id) { app.setTool('select'); app.select(hit.id); return; }
    app.toolState.items = [];
    app.render({ panels: true });
  },
  move(ev, cv) {
    const op = this.op;
    if (!op) return;
    const app = cv.app;
    const o = this.target(app);
    const fh = getFontSync(o.fontId);
    const local = apply(invert(o.m), ev.x, ev.y);
    const dx = local[0] - op.start[0], dy = local[1] - op.start[1];
    if (op.kind === 'move') {
      op.items.forEach((it, i) => { it.t.dx = op.t0s[i].dx + dx; it.t.dy = op.t0s[i].dy + dy; });
      this.snapPt = null;
      if (app.settings.snap !== false && op.items.length === 1) this.magnet(cv, o, fh, op.items[0]);
    } else if (op.kind === 'rot') {
      const a0 = Math.atan2(op.start[1] - op.c[1], op.start[0] - op.c[0]);
      const a1 = Math.atan2(local[1] - op.c[1], local[0] - op.c[0]);
      let deg = op.t0.rot + ((a1 - a0) * 180) / Math.PI;
      if (ev.shift) deg = Math.round(deg / 15) * 15;
      op.it.t.rot = Math.round(deg * 10) / 10;
    } else if (op.kind === 'scale') {
      const d0 = Math.hypot(op.start[0] - op.c[0], op.start[1] - op.c[1]) || 1;
      const d1 = Math.hypot(local[0] - op.c[0], local[1] - op.c[1]);
      const k = Math.max(0.05, d1 / d0);
      op.it.t.sx = op.t0.sx * k; op.it.t.sy = op.t0.sy * k;
    } else if (op.kind.startsWith('stretch')) {
      // movement measured along the letter's own axes
      const p0 = apply(op.invM, ...op.start), p1 = apply(op.invM, ...local);
      const ddx = p1[0] - p0[0], ddy = p1[1] - p0[1];
      const sgnX = op.kind === 'stretchR' ? 1 : -1, sgnY = op.kind === 'stretchB' ? 1 : -1;
      if (op.kind === 'stretchL' || op.kind === 'stretchR') op.it.t.stretchX = Math.max(-op.bb.w * 0.6, op.t0.stretchX + 2 * sgnX * ddx);
      else op.it.t.stretchY = Math.max(-op.bb.h * 0.6, op.t0.stretchY + 2 * sgnY * ddy);
    }
    app.render();
  },
  /** Connection magnet: glue this letter's entry/exit to a neighbour's. */
  magnet(cv, o, fh, it) {
    if (it.kind === 'mark') return;
    const th = 14 / cv.z / Math.hypot(o.m[0], o.m[1]);
    const mine = itemJoints(fh, o, it);
    let best = null;
    for (const other of o.items) {
      if (other === it || other.kind === 'mark') continue;
      const j = itemJoints(fh, o, other);
      for (const [a, b] of [[mine.entry, j.exit], [mine.exit, j.entry]]) {
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (d < th && (!best || d < best.d)) best = { d, dx: b[0] - a[0], dy: b[1] - a[1], pt: b };
      }
    }
    if (best && best.d > 0.01) { it.t.dx += best.dx; it.t.dy += best.dy; this.snapPt = best.pt; }
  },
  up(ev, cv) {
    if (!this.op) return;
    const kind = this.op.kind;
    this.op = null;
    this.snapPt = null;
    cv.app.commit(kind === 'move' ? 'نقل حرف' : kind === 'rot' ? 'تدوير حرف' : kind === 'scale' ? 'تحجيم حرف' : 'مدّ حرف');
    cv.app.render({ panels: true });
  },
  cancel(cv) { if (this.op) { this.op = null; cv.app.revert(); } },
  dbl(ev, cv) {
    const o = this.target(cv.app);
    if (!o || !this.hitItem(cv, o, ev.x, ev.y)) cv.app.setTool('select');
  },
};

/** Nudge / delete for the keyboard. */
export function lettersKeys(app) {
  app.on('nudge', ([dx, dy]) => {
    if (app.tool !== 'letters') return;
    const o = app.one;
    if (!o || o.type !== 'letters') return;
    const ids = app.toolState.items || [];
    const inv = invert([o.m[0], o.m[1], o.m[2], o.m[3], 0, 0]);
    const [lx, ly] = apply(inv, dx, dy);
    o.items.filter((i) => ids.includes(i.id)).forEach((i) => { i.t.dx += lx; i.t.dy += ly; });
    app.commit('نقل حرف');
    app.render({ panels: true });
  });
  app.on('deleteKey', () => {
    if (app.tool !== 'letters') return;
    const o = app.one;
    if (!o || o.type !== 'letters') return;
    const ids = app.toolState.items || [];
    if (!ids.length) return;
    o.items = o.items.filter((i) => !ids.includes(i.id));
    app.toolState.items = [];
    app.commit('حذف حرف');
    app.render({ panels: true });
  });
}

export { defaultT, mul, translate };
