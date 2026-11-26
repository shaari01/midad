// Envelope & warp: every outline is sampled densely (corners kept), each point
// is mapped through a function of its position inside the bounding box, and
// the result is smoothed back into curves.
import { P, toItem, itemD } from './geometry.js';

export const WARP_MODES = [
  ['arc', 'قوس'], ['wave', 'موجة'], ['bulge', 'انتفاخ'], ['rise', 'سحب مائل'],
  ['circle', 'غلاف دائري'], ['ring', 'غلاف قوسي'], ['square', 'غلاف مربع'], ['mesh', 'غلاف حر (شبكة)'],
];

/** Default 3x3 control grid (row-major, top-left first) over a box. */
export function defaultMesh(b) {
  const out = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) out.push([b.x + (b.w * i) / 2, b.y + (b.h * j) / 2]);
  return out;
}

const bern = (t) => [(1 - t) * (1 - t), 2 * t * (1 - t), t * t];

/** Point mapper for a mode. a = amount (-1..1 typically). b = bbox. */
export function mapper(mode, a, b, mesh) {
  const { x: bx, y: by, w: bw, h: bh } = b;
  const cx = bx + bw / 2, cy = by + bh / 2;
  const U = (x) => (bw ? (x - bx) / bw : 0.5), V = (y) => (bh ? (y - by) / bh : 0.5);
  switch (mode) {
    case 'arc': return ([x, y]) => { const s = 2 * U(x) - 1; return [x, y - a * bh * 0.6 * (1 - s * s)]; };
    case 'wave': return ([x, y]) => [x, y + a * bh * 0.3 * Math.sin(U(x) * Math.PI * 2)];
    case 'bulge': return ([x, y]) => { const s = 2 * U(x) - 1; return [x, cy + (y - cy) * (1 + a * (1 - s * s))]; };
    case 'rise': return ([x, y]) => [x, y - a * bh * 0.8 * (0.5 - U(x)) * 2 * (1 - V(y) * 0.5)];
    case 'square': { const S = Math.max(bw, bh); return ([x, y]) => [cx - S / 2 + U(x) * S, cy - S / 2 + V(y) * S]; }
    case 'circle': {
      const R = Math.max(bw, bh) / 2;
      return ([x, y]) => {
        const u = 2 * U(x) - 1, v = 2 * V(y) - 1;
        return [cx + R * u * Math.sqrt(Math.max(0, 1 - (v * v) / 2)), cy + R * v * Math.sqrt(Math.max(0, 1 - (u * u) / 2))];
      };
    }
    case 'ring': {
      // text bent around an arc: a = fraction of a full turn (0.05..1)
      const th = Math.max(0.05, Math.min(1.95, Math.abs(a || 0.5))) * Math.PI * (a < 0 ? -1 : 1);
      const R0 = bw / Math.abs(th);
      const sgn = Math.sign(th);
      const oy = sgn > 0 ? by + bh + R0 : by - R0;
      return ([x, y]) => {
        const phi = (U(x) - 0.5) * Math.abs(th);
        const r = sgn > 0 ? R0 + (1 - V(y)) * bh : R0 + V(y) * bh;
        return [cx + r * Math.sin(phi), sgn > 0 ? oy - r * Math.cos(phi) : oy + r * Math.cos(phi)];
      };
    }
    case 'mesh': {
      const g = mesh || defaultMesh(b);
      return ([x, y]) => {
        const bu = bern(Math.max(0, Math.min(1, U(x)))), bv = bern(Math.max(0, Math.min(1, V(y))));
        let X = 0, Y = 0;
        for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { const k = bu[i] * bv[j]; X += k * g[j * 3 + i][0]; Y += k * g[j * 3 + i][1]; }
        return [X, Y];
      };
    }
    default: return (p) => p;
  }
}

/** Densely sample each contour keeping original corners. */
function sampleContours(d, step) {
  const it = toItem(d);
  const kids = it.className === 'CompoundPath' ? it.children : [it];
  const out = [];
  for (const c of kids) {
    if (c.segments.length < 2) continue;
    const pts = [];
    for (const cu of c.curves) {
      const L = cu.length;
      const n = Math.max(1, Math.ceil(L / step));
      for (let k = 0; k < n; k++) { const p = cu.getPointAtTime(k / n); pts.push([p.x, p.y]); }
    }
    if (!c.closed) { const p = c.lastSegment.point; pts.push([p.x, p.y]); }
    out.push({ pts, closed: c.closed });
  }
  return out;
}

export function boxOf(d) {
  const r = toItem(d).bounds;
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}

/** Warp path data. opts: {mode, amount, mesh, box, smooth} */
export function warpD(d, { mode = 'arc', amount = 0.5, mesh = null, box = null, smooth = true } = {}) {
  if (!d) return '';
  const b = box || boxOf(d);
  const step = Math.max(b.w, b.h) / 160 || 1;
  return mapD(d, mapper(mode, amount, b, mesh), step, smooth);
}

/** Map every point of a path through f (dense sampling, then smoothing). */
export function mapD(d, f, step, smooth = true) {
  if (!d) return '';
  const cont = sampleContours(d, step);
  const r = (n) => Math.round(n * 100) / 100;
  const raw = cont.map(({ pts, closed }) => 'M' + pts.map((p) => { const [x, y] = f(p); return `${r(x)},${r(y)}`; }).join(' L') + (closed ? ' Z' : '')).join(' ');
  if (!smooth) return raw;
  const it = toItem(raw);
  const kids = it.className === 'CompoundPath' ? it.children : [it];
  for (const c of kids) if (c.segments.length > 6) c.simplify(Math.max(0.05, step * 0.08));
  return itemD(it);
}

export { P };
