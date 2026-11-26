// Node tool: edit anchors and Bézier handles of a path object; tap on the
// outline to add a node; optional mirror symmetry while editing.
import { apply, invert } from '../core/model.js';
import { toItem, itemD, P } from '../core/geometry.js';
import { transformD } from '../core/svgpath.js';
import { toast } from '../ui/dom.js';

const NODE_HIT = 22;

export const NodesTool = {
  id: 'nodes',
  target(app) { const o = app.one; return o && o.type === 'path' ? o : null; },
  cpFor(o) {
    if (this.cpId !== o.id || this.cpD !== o.d) {
      const it = toItem(o.d);
      this.cp = it;
      this.cpId = o.id;
      this.cpD = o.d;
    }
    return this.cp;
  },
  write(app, o) {
    o.d = itemD(this.cp, 2);
    this.cpD = o.d;
    app.render();
  },
  sel(app) { return app.toolState.nodes || []; },
  seg(key) { const [ci, si] = key.split(':').map(Number); return this.cp.children[ci]?.segments[si]; },
  screen(cv, o, pt) { return cv.toScreen(...apply(o.m, pt.x, pt.y)); },

  overlay(cv) {
    const app = cv.app;
    const o = this.target(app);
    if (!o) return '';
    const cp = this.cpFor(o);
    const V = [cv.z, 0, 0, cv.z, cv.tx, cv.ty];
    const m = o.m;
    const full = [V[0] * m[0], V[0] * m[1], V[0] * m[2], V[0] * m[3], V[0] * m[4] + V[4], V[0] * m[5] + V[5]];
    let s = `<path class="nodepath" d="${transformD(o.d, full)}"/>`;
    const sel = new Set(this.sel(app));
    const total = cp.children.reduce((n, c) => n + c.segments.length, 0);
    const small = total > 400;
    cp.children.forEach((c, ci) => c.segments.forEach((seg, si) => {
      const key = `${ci}:${si}`;
      const [x, y] = this.screen(cv, o, seg.point);
      if (sel.has(key)) {
        for (const [hk, hv] of [['hi', seg.handleIn], ['ho', seg.handleOut]]) {
          if (hv.isZero()) continue;
          const [hx, hy] = this.screen(cv, o, seg.point.add(hv));
          s += `<line class="hline" x1="${x}" y1="${y}" x2="${hx}" y2="${hy}"/><circle class="hit" data-handle="${hk}:${key}" cx="${hx}" cy="${hy}" r="${NODE_HIT}"/><circle class="hdot" cx="${hx}" cy="${hy}" r="7"/>`;
        }
      }
      const r = small ? 4 : 6;
      s += `<circle class="hit" data-handle="n:${key}" cx="${x}" cy="${y}" r="${small ? 12 : NODE_HIT}"/><rect class="node ${sel.has(key) ? 'on' : ''} ${seg.hasHandles() ? 'curve' : ''}" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}"/>`;
    }));
    if (this.marquee) {
      const q = this.marquee;
      s += `<rect class="marquee" x="${Math.min(q.sx0, q.sx1)}" y="${Math.min(q.sy0, q.sy1)}" width="${Math.abs(q.sx1 - q.sx0)}" height="${Math.abs(q.sy1 - q.sy0)}"/>`;
    }
    return s;
  },

  localDelta(o, ev, start) {
    const inv = invert([o.m[0], o.m[1], o.m[2], o.m[3], 0, 0]);
    return apply(inv, ev.x - start.x, ev.y - start.y);
  },

  mirrorPartners(app, o, keys) {
    const mode = app.settings.mirror;
    if (!mode || mode === 'none') return [];
    const b = this.cp.bounds;
    const cx = b.center.x, cy = b.center.y;
    const tol = Math.max(b.width, b.height) * 0.03;
    const out = [];
    for (const k of keys) {
      const p = this.seg(k).point;
      const target = mode === 'x' ? new P.Point(2 * cx - p.x, p.y) : new P.Point(p.x, 2 * cy - p.y);
      let best = null, bd = tol;
      this.cp.children.forEach((c, ci) => c.segments.forEach((sg, si) => {
        const kk = `${ci}:${si}`;
        if (keys.includes(kk)) return;
        const d = sg.point.getDistance(target);
        if (d < bd) { bd = d; best = kk; }
      }));
      if (best) out.push(best);
    }
    return out;
  },

  down(ev, cv) {
    const app = cv.app;
    const o = this.target(app);
    if (!o) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      if (hit?.type === 'path') { app.select(hit.id); app.setTool('nodes'); }
      else toast(hit ? 'حوّل العنصر إلى أشكال أولًا لتعديل نقاطه' : 'اختر شكلًا لتعديل نقاطه');
      return;
    }
    this.cpFor(o);
    this.s0 = [ev.sx, ev.sy];
    this.moved = false;
    const h = ev.target.closest?.('[data-handle]');
    if (h) {
      const v = h.getAttribute('data-handle');
      const [kind, ci, si] = v.split(':');
      const key = `${ci}:${si}`;
      if (kind === 'n') {
        let sel = this.sel(app);
        if (ev.shift || ev.ctrl) sel = sel.includes(key) ? sel.filter((k) => k !== key) : [...sel, key];
        else if (!sel.includes(key)) sel = [key];
        app.toolState.nodes = sel;
        const segs = sel.map((k) => this.seg(k)).filter(Boolean);
        const partners = this.mirrorPartners(app, o, sel).map((k) => this.seg(k));
        this.op = { kind: 'node', start: { x: ev.x, y: ev.y }, segs, p0: segs.map((s) => s.point.clone()), partners, pp0: partners.map((s) => s.point.clone()) };
        cv.drawOverlay();
        app.render({ panels: true });
      } else {
        const seg = this.seg(key);
        const smooth = seg.handleIn.isCollinear?.(seg.handleOut) ?? false;
        this.op = { kind, seg, start: { x: ev.x, y: ev.y }, h0: (kind === 'hi' ? seg.handleIn : seg.handleOut).clone(), smooth: smooth && !ev.alt };
      }
      return;
    }
    // tap on the outline → add a node there
    const [lx, ly] = apply(invert(o.m), ev.x, ev.y);
    const loc = this.cp.getNearestLocation(new P.Point(lx, ly));
    const scale = Math.hypot(o.m[0], o.m[1]) * cv.z;
    if (loc && loc.point.getDistance(new P.Point(lx, ly)) * scale < 14) {
      const path = loc.path;
      const seg = path.divideAt(loc);
      if (seg) {
        const ci = this.cp.children.indexOf(path);
        const key = `${ci}:${seg.index}`;
        app.toolState.nodes = [key];
        this.write(app, o);
        this.cpD = o.d; // keep the same Paper object
        app.commit('إضافة عقدة');
        this.op = { kind: 'node', start: { x: ev.x, y: ev.y }, segs: [seg], p0: [seg.point.clone()], partners: [], pp0: [] };
        app.render({ panels: true });
        return;
      }
    }
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit && hit.id !== o.id) { app.setTool('select'); app.select(hit.id); return; }
    if (ev.pointerType === 'mouse') this.marquee = { sx0: ev.sx, sy0: ev.sy, sx1: ev.sx, sy1: ev.sy, add: ev.shift };
    else this.pan = { sx: ev.sx, sy: ev.sy, tx: cv.tx, ty: cv.ty, moved: false };
  },

  move(ev, cv) {
    const app = cv.app;
    const o = this.target(app);
    if (this.marquee) { this.marquee.sx1 = ev.sx; this.marquee.sy1 = ev.sy; cv.drawOverlay(); return; }
    if (this.pan) { const p = this.pan; if (Math.hypot(ev.sx - p.sx, ev.sy - p.sy) > 6) p.moved = true; cv.tx = p.tx + ev.sx - p.sx; cv.ty = p.ty + ev.sy - p.sy; cv.draw(); return; }
    const op = this.op;
    if (!op || !o) return;
    if (!this.moved && Math.hypot(ev.sx - this.s0[0], ev.sy - this.s0[1]) < 3) return;
    this.moved = true;
    const [dx, dy] = this.localDelta(o, ev, op.start);
    if (op.kind === 'node') {
      op.segs.forEach((s, i) => { s.point = op.p0[i].add([dx, dy]); });
      const mode = app.settings.mirror;
      op.partners.forEach((s, i) => { s.point = op.pp0[i].add(mode === 'x' ? [-dx, dy] : [dx, -dy]); });
    } else {
      const nh = op.h0.add([dx, dy]);
      if (op.kind === 'hi') { op.seg.handleIn = nh; if (op.smooth) op.seg.handleOut = nh.normalize(-op.seg.handleOut.length || -nh.length); }
      else { op.seg.handleOut = nh; if (op.smooth) op.seg.handleIn = nh.normalize(-op.seg.handleIn.length || -nh.length); }
    }
    this.write(app, o);
  },

  up(ev, cv) {
    const app = cv.app;
    const o = this.target(app);
    if (this.marquee) {
      const q = this.marquee; this.marquee = null;
      const x0 = Math.min(q.sx0, q.sx1), x1 = Math.max(q.sx0, q.sx1), y0 = Math.min(q.sy0, q.sy1), y1 = Math.max(q.sy0, q.sy1);
      if (x1 - x0 < 3 && y1 - y0 < 3) { app.toolState.nodes = []; app.render({ panels: true }); return; }
      const keys = [];
      this.cp.children.forEach((c, ci) => c.segments.forEach((s, si) => {
        const [x, y] = this.screen(cv, o, s.point);
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1) keys.push(`${ci}:${si}`);
      }));
      app.toolState.nodes = q.add ? [...new Set([...this.sel(app), ...keys])] : keys;
      app.render({ panels: true });
      return;
    }
    if (this.pan) { const moved = this.pan.moved; this.pan = null; if (!moved) { app.toolState.nodes = []; app.render({ panels: true }); } return; }
    if (this.op) {
      this.op = null;
      if (this.moved) app.commit('تعديل العقد');
      app.render({ panels: true });
    }
  },
  cancel(cv) { this.op = null; this.marquee = null; this.pan = null; cv.app.revert(); },

  // panel actions
  deleteNodes(app) {
    const o = this.target(app);
    if (!o) return;
    this.cpFor(o);
    const keys = this.sel(app).map((k) => k.split(':').map(Number)).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    if (!keys.length) return toast('حدّد عقدة أولًا');
    for (const [ci, si] of keys) this.cp.children[ci]?.segments[si]?.remove();
    for (const c of [...this.cp.children]) if (c.segments.length < 2) c.remove();
    app.toolState.nodes = [];
    this.write(app, o);
    app.commit('حذف عقد');
    app.render({ panels: true });
  },
  setType(app, type) {
    const o = this.target(app);
    if (!o) return;
    this.cpFor(o);
    const segs = this.sel(app).map((k) => this.seg(k)).filter(Boolean);
    if (!segs.length) return toast('حدّد عقدة أولًا');
    for (const s of segs) {
      if (type === 'corner') { s.handleIn = new P.Point(0, 0); s.handleOut = new P.Point(0, 0); } else s.smooth({ type: 'catmull-rom', factor: 0.5 });
    }
    this.write(app, o);
    app.commit(type === 'corner' ? 'عقدة حادة' : 'عقدة منحنية');
    app.render({ panels: true });
  },
};
