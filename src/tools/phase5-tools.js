// Square Kufic painting, hand writing with pen/finger, envelope & warp.
import { apply, invert, mul, translate, clone, pathObject } from '../core/model.js';
import { localD } from '../core/geometry.js';
import { transformD } from '../core/svgpath.js';
import { kufiObject, getCell, setCells, symmetric } from '../core/kufi.js';
import { streamline, pressureOf, strokeRawD, strokeToPath } from '../core/handwriting.js';
import { warpD, boxOf, defaultMesh } from '../core/warp.js';
import { handleMarkup } from './select.js';
import { toast } from '../ui/dom.js';

const V = (cv) => [cv.z, 0, 0, cv.z, cv.tx, cv.ty];

/* ---------------- Square Kufic ---------------- */
export const KufiTool = {
  id: 'kufi',
  target(app) { const o = app.one; return o && o.type === 'kufi' ? o : null; },
  cellAt(o, x, y) {
    const [lx, ly] = apply(invert(o.m), x, y);
    return [Math.floor(lx / o.cell), Math.floor(ly / o.cell)];
  },
  overlay(cv) {
    const o = this.target(cv.app);
    if (!o) return `<text class="badge" x="50%" y="60">المس اللوحة لإنشاء شبكة كوفي مربع</text>`;
    const M = mul(V(cv), o.m);
    const W = o.cols * o.cell, H = o.rows * o.cell;
    let d = '';
    for (let c = 0; c <= o.cols; c++) d += `M${c * o.cell},0 L${c * o.cell},${H} `;
    for (let r = 0; r <= o.rows; r++) d += `M0,${r * o.cell} L${W},${r * o.cell} `;
    const mid = `M${W / 2},0 L${W / 2},${H} M0,${H / 2} L${W},${H / 2}`;
    return `<path class="kgrid" d="${transformD(d, M)}"/><path class="kmid" d="${transformD(mid, M)}"/>`;
  },
  paint(app, o, c, r) {
    if (c < 0 || r < 0 || c >= o.cols || r >= o.rows) return false;
    const key = c + ':' + r;
    if (this.done.has(key)) return false;
    this.done.add(key);
    setCells(o, symmetric(o, c, r, app.settings.kufiSym || 'none'), this.value);
    return true;
  },
  down(ev, cv) {
    const app = cv.app;
    let o = this.target(app);
    if (!o) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      if (hit?.type === 'kufi') { app.select([hit.id]); return; }
      const n = app.settings.kufiSize || 21, cell = 30;
      o = kufiObject(n, n, cell, { m: translate(ev.x - (n * cell) / 2, ev.y - (n * cell) / 2) });
      app.add(o);
      app.commit('شبكة كوفي');
      app.render({ panels: true });
      return;
    }
    const [c, r] = this.cellAt(o, ev.x, ev.y);
    if (c < 0 || r < 0 || c >= o.cols || r >= o.rows) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      app.select(hit ? [hit.id] : []);
      app.render({ panels: true });
      return;
    }
    this.active = true;
    this.done = new Set();
    this.value = app.settings.kufiErase ? false : !getCell(o, c, r);
    if (this.paint(app, o, c, r)) app.render();
  },
  move(ev, cv) {
    if (!this.active) return;
    const o = this.target(cv.app);
    if (!o) return;
    const [c, r] = this.cellAt(o, ev.x, ev.y);
    if (this.paint(cv.app, o, c, r)) cv.app.render();
  },
  up(ev, cv) {
    if (!this.active) return;
    this.active = false;
    cv.app.commit('رسم كوفي');
    cv.app.render({ panels: true });
  },
  cancel() { this.active = false; },
};

/* ---------------- Hand writing ---------------- */
export const PenTool = {
  id: 'pen',
  wantsCoalesced: true,
  opts(app) {
    const s = app.settings;
    return { pen: s.penType || 'qalam', width: s.penWidth || 14, angle: s.penAngle ?? 35, taper: true };
  },
  down(ev, cv) {
    const t = performance.now();
    const p = { x: ev.x, y: ev.y, p: pressureOf(ev, null, t, t) };
    this.pts = [p]; this.raw = p; this.t = t;
  },
  move(ev, cv) {
    if (!this.pts) return;
    const t = performance.now();
    const last = this.pts[this.pts.length - 1];
    const raw = { x: ev.x, y: ev.y, p: pressureOf(ev, this.raw, t, this.t) };
    this.raw = raw; this.t = t;
    const p = streamline(last, raw, cv.app.settings.penSmooth ?? 0.5);
    if (Math.hypot(p.x - last.x, p.y - last.y) * cv.z < 1.5) return;
    this.pts.push(p);
    cv.drawOverlay();
  },
  up(ev, cv) {
    const pts = this.pts; this.pts = null;
    if (!pts) return;
    const app = cv.app;
    if (pts.length === 1) pts.push({ ...pts[0], x: pts[0].x + 0.5 });
    let d = '';
    try { d = strokeToPath(pts, this.opts(app)); } catch (e) { console.error(e); }
    cv.drawOverlay();
    if (!d) return;
    const color = app.settings.penColor || '#1b1b1b';
    const o = pathObject(d, { name: 'كتابة يدوية', style: { fills: [{ type: 'solid', color, opacity: 1 }], strokes: [], opacity: 1 } });
    app.add(o, { select: false });
    app.commit('كتابة يدوية');
    app.render();
  },
  cancel(cv) { this.pts = null; cv.drawOverlay(); },
  overlay(cv) {
    if (!this.pts) return '';
    const d = strokeRawD(this.pts, this.opts(cv.app));
    return `<path class="penpreview" fill="${cv.app.settings.penColor || '#1b1b1b'}" d="${transformD(d, V(cv))}"/>`;
  },
};

/* ---------------- Envelope & warp ---------------- */
export function warpState(app) {
  const o = app.one;
  if (!o || o.type === 'image') return null;
  let st = app.toolState.warp;
  if (!st || st.id !== o.id) {
    const d = localD(o);
    if (!d) return null;
    const box = boxOf(d);
    st = app.toolState.warp = { id: o.id, d, box, mode: app.settings.warpMode || 'arc', amount: app.settings.warpAmount ?? 0.5, mesh: defaultMesh(box), cache: null };
  }
  return st;
}

export function warpPreview(st) {
  const key = st.mode + st.amount + JSON.stringify(st.mesh);
  if (!st.cache || st.cache.key !== key) st.cache = { key, d: warpD(st.d, { mode: st.mode, amount: st.amount, mesh: st.mesh, box: st.box, smooth: false }) };
  return st.cache.d;
}

export function applyWarp(app) {
  const o = app.one;
  const st = warpState(app);
  if (!o || !st) return;
  let d;
  try { d = warpD(st.d, { mode: st.mode, amount: st.amount, mesh: st.mesh, box: st.box }); } catch (e) { console.error(e); return toast('تعذّر تطبيق التشويه على هذا العنصر', 'error'); }
  const p = pathObject(d, {
    name: (o.name || 'شكل').replace(/ \(مُشوّه\)$/, '') + ' (مُشوّه)', m: o.m.slice(), style: clone(o.style || {}),
    live: app.settings.keepLive !== false ? clone(o.live || o) : null,
  });
  app.replace(o.id, p);
  app.selection = [p.id];
  app.toolState.warp = null;
  app.setTool('select');
  app.commit('غلاف وتشويه');
  app.render({ panels: true });
}

export const WarpTool = {
  id: 'warp',
  overlay(cv) {
    const app = cv.app;
    const o = app.one;
    const st = o && warpState(app);
    if (!st) return `<text class="badge" x="50%" y="60">حدّد عنصرًا واحدًا لتشويهه</text>`;
    const M = mul(V(cv), o.m);
    let s = `<path class="warpprev" d="${transformD(warpPreview(st), M)}"/>`;
    if (st.mode === 'mesh') {
      const P = st.mesh.map(([x, y]) => apply(M, x, y));
      const idx = [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]];
      s += idx.map(([a, b]) => `<line class="selline" x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}"/>`).join('');
      s += P.map(([x, y], i) => handleMarkup('m' + i, x, y, i === 4 ? 'h side' : 'h')).join('');
    }
    return s;
  },
  down(ev, cv) {
    const app = cv.app;
    const st = app.one && warpState(app);
    const hd = ev.target?.closest?.('[data-handle]')?.getAttribute('data-handle');
    if (st && st.mode === 'mesh' && hd?.startsWith('m')) {
      this.drag = { i: +hd.slice(1), inv: invert(app.one.m) };
      return;
    }
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit && hit.id !== app.one?.id) { app.select([hit.id]); app.toolState.warp = null; app.render({ panels: true }); }
  },
  move(ev, cv) {
    if (!this.drag) return;
    const st = warpState(cv.app);
    st.mesh[this.drag.i] = apply(this.drag.inv, ev.x, ev.y);
    cv.drawOverlay();
  },
  up() { this.drag = null; },
  cancel() { this.drag = null; },
};
