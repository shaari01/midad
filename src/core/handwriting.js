// Hand-drawn strokes: streamline smoothing, pressure (S Pen) or simulated
// pressure, round pen or a fixed-angle nib (قلم القصب), then conversion to
// a clean editable vector outline.
import { P, itemD } from './geometry.js';

/** Streamline: each new point moves only part of the way to the finger. */
export function streamline(prev, raw, amount) {
  if (!prev) return raw;
  const k = 1 - Math.min(0.95, Math.max(0, amount)) ;
  return { x: prev.x + (raw.x - prev.x) * k, y: prev.y + (raw.y - prev.y) * k, p: prev.p + (raw.p - prev.p) * k };
}

/** Pressure 0..1: real pen pressure, or simulated from speed for finger/mouse. */
export function pressureOf(ev, last, now, lastT) {
  if (ev.pointerType === 'pen' && ev.pressure > 0) return ev.pressure;
  if (!last) return 0.6;
  const dt = Math.max(1, now - lastT);
  const v = Math.hypot(ev.x - last.x, ev.y - last.y) / dt; // doc px per ms
  return Math.max(0.25, Math.min(1, 1.05 - v * 0.35));
}

function quad(a, b, c, d) {
  const pts = [a, b, c, d];
  let s = 0;
  for (let i = 0; i < 4; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % 4]; s += x1 * y2 - x2 * y1; }
  return s < 0 ? pts.reverse() : pts;
}
const polyD = (pts) => 'M' + pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' L') + ' Z';
const r2 = (n) => Math.round(n * 100) / 100;
function circleD(x, y, r) {
  const k = 0.5523 * r;
  return `M${r2(x + r)},${r2(y)} C${r2(x + r)},${r2(y + k)} ${r2(x + k)},${r2(y + r)} ${r2(x)},${r2(y + r)} C${r2(x - k)},${r2(y + r)} ${r2(x - r)},${r2(y + k)} ${r2(x - r)},${r2(y)} C${r2(x - r)},${r2(y - k)} ${r2(x - k)},${r2(y - r)} ${r2(x)},${r2(y - r)} C${r2(x + k)},${r2(y - r)} ${r2(x + r)},${r2(y - k)} ${r2(x + r)},${r2(y)} Z`;
}

/**
 * Raw (overlapping, nonzero) outline of a stroke — fast enough for live
 * preview. pts: [{x,y,p}], opts: {pen:'round'|'qalam'|'mono', width, angle}
 */
export function strokeRawD(pts, { pen = 'round', width = 12, angle = 35, taper = true } = {}) {
  if (!pts.length) return '';
  const parts = [];
  if (pen === 'qalam') {
    const a = (angle * Math.PI) / 180;
    const ux = Math.cos(a), uy = -Math.sin(a);
    const nib = (p) => (width / 2) * (0.55 + 0.45 * p.p);
    if (pts.length === 1) { const p = pts[0], w = nib(p); return polyD([[p.x + ux * w, p.y + uy * w], [p.x + ux * w + 0.5, p.y + uy * w + 0.5], [p.x - ux * w + 0.5, p.y - uy * w + 0.5], [p.x - ux * w, p.y - uy * w]]); }
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i];
      const w1 = nib(p), w2 = nib(q);
      parts.push(polyD(quad([p.x + ux * w1, p.y + uy * w1], [q.x + ux * w2, q.y + uy * w2], [q.x - ux * w2, q.y - uy * w2], [p.x - ux * w1, p.y - uy * w1])));
    }
    return parts.join(' ');
  }
  const rad = (p, i) => {
    let r = (width / 2) * (pen === 'mono' ? 1 : 0.35 + 0.65 * p.p);
    if (taper && pen === 'round') {
      const n = pts.length, k = Math.min(i, n - 1 - i);
      if (k < 4) r *= 0.45 + 0.55 * (k / 4);
    }
    return Math.max(0.3, r);
  };
  pts.forEach((p, i) => parts.push(circleD(p.x, p.y, rad(p, i))));
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i];
    const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
    if (L < 1e-6) continue;
    const nx = -dy / L, ny = dx / L;
    const r1 = rad(p, i - 1), r2_ = rad(q, i);
    parts.push(polyD(quad([p.x + nx * r1, p.y + ny * r1], [q.x + nx * r2_, q.y + ny * r2_], [q.x - nx * r2_, q.y - ny * r2_], [p.x - nx * r1, p.y - ny * r1])));
  }
  return parts.join(' ');
}

/** Drop points closer than `min` to keep the outline light. */
export function decimate(pts, min) {
  const out = [];
  for (const p of pts) {
    const l = out[out.length - 1];
    if (!l || Math.hypot(p.x - l.x, p.y - l.y) >= min) out.push(p);
  }
  if (pts.length > 1 && out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1]);
  return out;
}

/** Final clean vector outline (one merged, simplified path). */
export function strokeToPath(pts, opts) {
  const w = opts.width || 12;
  const light = decimate(pts, Math.max(0.8, w / 5));
  const raw = strokeRawD(light, opts);
  const cp = new P.CompoundPath({ pathData: raw, insert: false, fillRule: 'nonzero' });
  const merged = cp.unite(new P.Path({ insert: false }), { insert: false });
  const kids = merged.className === 'CompoundPath' ? merged.children : [merged];
  for (const c of kids) if (c.segments.length > 8) c.simplify(Math.max(0.15, w * 0.03));
  return itemD(merged);
}
