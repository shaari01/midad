// Selection + transform box (move / scale / rotate), marquee, and tap logic.
import { mul, translate, scaleM, rotateM } from '../core/model.js';
import { worldBounds } from '../core/geometry.js';

export const HANDLE_R = 11; // visual radius (px); hit area is larger
const HIT_R = 24;

export function handleMarkup(id, sx, sy, cls = 'h') {
  return `<circle class="hit" data-handle="${id}" cx="${sx}" cy="${sy}" r="${HIT_R}"/><circle class="${cls}" cx="${sx}" cy="${sy}" r="${HANDLE_R}" pointer-events="none"/>`;
}

export function boxOverlay(cv, b, { handles = true, rotate = true } = {}) {
  if (!b) return '';
  const [x0, y0] = cv.toScreen(b.x, b.y);
  const [x1, y1] = cv.toScreen(b.x + b.w, b.y + b.h);
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  let s = `<rect class="selbox" x="${x0}" y="${y0}" width="${Math.max(1, x1 - x0)}" height="${Math.max(1, y1 - y0)}"/>`;
  if (!handles) return s;
  if (rotate) s += `<line class="selline" x1="${mx}" y1="${y0}" x2="${mx}" y2="${y0 - 40}"/>` + handleMarkup('rot', mx, y0 - 40, 'h rot');
  const pts = { nw: [x0, y0], ne: [x1, y0], sw: [x0, y1], se: [x1, y1], n: [mx, y0], s: [mx, y1], w: [x0, my], e: [x1, my] };
  for (const [k, [x, y]] of Object.entries(pts)) s += handleMarkup(k, x, y, k.length === 1 ? 'h side' : 'h');
  return s;
}

export function snapLinesMarkup(cv, lines) {
  const r = cv.host.getBoundingClientRect();
  return (lines || []).map((l) => {
    if (l.axis === 'x') { const [sx] = cv.toScreen(l.pos, 0); return `<line class="snapline" x1="${sx}" y1="0" x2="${sx}" y2="${r.height}"/>`; }
    const [, sy] = cv.toScreen(0, l.pos); return `<line class="snapline" x1="0" y1="${sy}" x2="${r.width}" y2="${sy}"/>`;
  }).join('');
}

/** Generic transform-drag used by the select tool and the letters tool. */
export function startTransform(kind, ev, b, items, opts = {}) {
  const start = { x: ev.x, y: ev.y };
  const orig = items.map((o) => o.m.slice());
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const anchors = {
    nw: [b.x + b.w, b.y + b.h], ne: [b.x, b.y + b.h], sw: [b.x + b.w, b.y], se: [b.x, b.y],
    n: [cx, b.y + b.h], s: [cx, b.y], w: [b.x + b.w, cy], e: [b.x, cy],
  };
  return {
    kind,
    apply(ev2, { keepRatio = true, snap = null } = {}) {
      let D;
      if (kind === 'move') {
        let dx = ev2.x - start.x, dy = ev2.y - start.y;
        let lines = [];
        if (snap) { const r = snap({ x: b.x + dx, y: b.y + dy, w: b.w, h: b.h }); dx += r.dx; dy += r.dy; lines = r.lines; }
        D = translate(dx, dy);
        this.lines = lines;
      } else if (kind === 'rot') {
        let a = Math.atan2(ev2.y - cy, ev2.x - cx) - Math.atan2(start.y - cy, start.x - cx);
        let deg = (a * 180) / Math.PI;
        const snapTo = ev2.shift ? 15 : 0;
        if (snapTo) deg = Math.round(deg / snapTo) * snapTo;
        else { const near = Math.round(deg / 45) * 45; if (Math.abs(near - deg) < 3) deg = near; }
        this.angle = deg;
        D = rotateM(deg, cx, cy);
      } else {
        const [ax, ay] = anchors[kind];
        const fx = (v, s0) => (Math.abs(s0) < 1e-6 ? 1 : v / s0);
        let sx = fx(ev2.x - ax, start.x - ax);
        let sy = fx(ev2.y - ay, start.y - ay);
        if (kind === 'n' || kind === 's') sx = keepRatio && opts.ratioOnSides ? sy : 1;
        if (kind === 'e' || kind === 'w') sy = keepRatio && opts.ratioOnSides ? sx : 1;
        if (kind.length === 2 && keepRatio !== ev2.shift) {
          const s = Math.abs(sx) > Math.abs(sy) ? sx : sy;
          sx = Math.sign(sx || 1) * Math.abs(s); sy = Math.sign(sy || 1) * Math.abs(s);
        }
        if (Math.abs(sx) < 0.01) sx = 0.01 * Math.sign(sx || 1);
        if (Math.abs(sy) < 0.01) sy = 0.01 * Math.sign(sy || 1);
        D = scaleM(sx, sy, ax, ay);
      }
      items.forEach((o, i) => { o.m = mul(D, orig[i]); });
      return D;
    },
  };
}

export const SelectTool = {
  id: 'select',
  down(ev, cv) {
    const { app } = cv;
    this.s0 = [ev.sx, ev.sy];
    const h = ev.target.closest?.('[data-handle]');
    const b = cv.selectionBounds();
    if (h && b && app.selection.length) {
      const items = app.selected.filter((o) => !o.locked);
      this.op = startTransform(h.getAttribute('data-handle'), ev, b, items);
      this.moved = false;
      return;
    }
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit) {
      if (ev.shift || ev.ctrl) {
        app.select(app.selection.includes(hit.id) ? app.selection.filter((i) => i !== hit.id) : [...app.selection, hit.id]);
      } else if (!app.selection.includes(hit.id)) app.select(hit.id);
      const items = app.selected.filter((o) => !o.locked);
      const bb = cv.selectionBounds();
      this.op = bb ? startTransform('move', ev, bb, items) : null;
      this.moved = false;
      return;
    }
    // empty space
    if (ev.pointerType === 'mouse') {
      this.marquee = { x0: ev.x, y0: ev.y, x1: ev.x, y1: ev.y, add: ev.shift };
    } else {
      this.panning = { sx: ev.sx, sy: ev.sy, tx: cv.tx, ty: cv.ty, moved: false };
    }
  },
  move(ev, cv) {
    if (this.op) {
      if (!this.moved && Math.hypot(ev.sx - this.s0[0], ev.sy - this.s0[1]) < 4) return;
      this.moved = true;
      this.op.apply(ev, { keepRatio: cv.app.settings.keepRatio, snap: this.op.kind === 'move' ? (bb) => cv.snapBox(bb) : null });
      cv.app.render();
      return;
    }
    if (this.marquee) { this.marquee.x1 = ev.x; this.marquee.y1 = ev.y; cv.drawOverlay(); return; }
    if (this.panning) {
      const p = this.panning;
      if (Math.hypot(ev.sx - p.sx, ev.sy - p.sy) > 6) p.moved = true;
      cv.tx = p.tx + ev.sx - p.sx; cv.ty = p.ty + ev.sy - p.sy; cv.draw();
    }
  },
  up(ev, cv) {
    const { app } = cv;
    if (this.op) {
      const kind = this.op.kind;
      this.op = null;
      if (this.moved) app.commit(kind === 'move' ? 'نقل' : kind === 'rot' ? 'تدوير' : 'تحجيم');
      app.render({ panels: true });
      return;
    }
    if (this.marquee) {
      const m = this.marquee; this.marquee = null;
      const x0 = Math.min(m.x0, m.x1), x1 = Math.max(m.x0, m.x1), y0 = Math.min(m.y0, m.y1), y1 = Math.max(m.y0, m.y1);
      if (x1 - x0 < 2 / cv.z && y1 - y0 < 2 / cv.z) { if (!m.add) app.select([]); return; }
      const ids = app.doc.objects.filter((o) => {
        if (o.visible === false || o.locked) return false;
        const b = worldBounds(o);
        return b.x >= x0 && b.y >= y0 && b.x + b.w <= x1 && b.y + b.h <= y1;
      }).map((o) => o.id);
      app.select(ids, { add: m.add });
      return;
    }
    if (this.panning) {
      const moved = this.panning.moved; this.panning = null;
      if (!moved) app.select([]);
    }
  },
  cancel(cv) {
    if (this.op) { this.op = null; cv.app.revert(); }
    this.marquee = null; this.panning = null;
  },
  dbl(ev, cv) {
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (!hit) return;
    cv.app.select(hit.id);
    if (hit.type === 'text') cv.app.emit('editText');
    else if (hit.type === 'letters') cv.app.setTool('letters');
    else if (hit.type === 'path') cv.app.setTool('nodes');
    else if (hit.type === 'kufi') cv.app.setTool('kufi');
  },
  overlay(cv) {
    let s = '';
    const app = cv.app;
    if (app.selection.length) {
      const b = cv.selectionBounds();
      const locked = app.selected.every((o) => o.locked);
      s += boxOverlay(cv, b, { handles: !locked });
      if (app.selection.length > 1) for (const o of app.selected) s += boxOverlay(cv, worldBounds(o), { handles: false });
    }
    if (this.op?.lines) s += snapLinesMarkup(cv, this.op.lines);
    if (this.op?.kind === 'rot' && this.op.angle != null) {
      const b = cv.selectionBounds();
      const [x, y] = cv.toScreen(b.x + b.w / 2, b.y + b.h / 2);
      s += `<text class="badge" x="${x}" y="${y}">${Math.round(this.op.angle)}°</text>`;
    }
    if (this.marquee) {
      const m = this.marquee;
      const [x0, y0] = cv.toScreen(Math.min(m.x0, m.x1), Math.min(m.y0, m.y1));
      const [x1, y1] = cv.toScreen(Math.max(m.x0, m.x1), Math.max(m.y0, m.y1));
      s += `<rect class="marquee" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
    }
    return s;
  },
};

export const PanTool = { id: 'pan' };
