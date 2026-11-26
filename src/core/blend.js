// Blend: shape + colour interpolation between two shapes in N steps.
import { P, toItem } from './geometry.js';

const N = 160;

function contours(d) {
  const it = toItem(d);
  const kids = (it.className === 'CompoundPath' ? it.children : [it]).filter((c) => c.segments.length > 1);
  return kids.map((c) => {
    const p = c.clone({ insert: false });
    p.closed = true;
    return { path: p, area: Math.abs(p.area), hole: false };
  }).sort((a, b) => b.area - a.area);
}

function sample(path) {
  if (!path.clockwise) path.reverse();
  const L = path.length;
  const pts = [];
  for (let i = 0; i < N; i++) { const p = path.getPointAt((L * i) / N) || path.firstSegment.point; pts.push([p.x, p.y]); }
  // start at the top-most point so both shapes are aligned
  let k = 0;
  for (let i = 1; i < N; i++) if (pts[i][1] < pts[k][1] - 1e-6 || (Math.abs(pts[i][1] - pts[k][1]) < 1e-6 && pts[i][0] < pts[k][0])) k = i;
  return [...pts.slice(k), ...pts.slice(0, k)];
}

function centroid(pts) {
  const n = pts.length;
  return pts.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]);
}

/** Pair up contours of two shapes and pre-sample them. */
export function blendPairs(dA, dB) {
  const a = contours(dA), b = contours(dB);
  const n = Math.max(a.length, b.length);
  const pairs = [];
  for (let i = 0; i < n; i++) {
    const pa = a[i] ? sample(a[i].path) : null;
    const pb = b[i] ? sample(b[i].path) : null;
    const ca = pa ? null : centroid(pb), cb = pb ? null : centroid(pa);
    pairs.push({ A: pa || pb.map(() => ca), B: pb || pa.map(() => cb), holeA: a[i] && i > 0 && isHole(a, i), holeB: b[i] && i > 0 && isHole(b, i) });
  }
  return pairs;
}

function isHole(list, i) {
  const c = list[i].path;
  const pt = c.interiorPoint;
  return list.some((o, j) => j !== i && o.area > list[i].area && o.path.contains(pt));
}

export function blendShape(pairs, t) {
  let d = '';
  for (const pr of pairs) {
    const pts = pr.A.map((p, i) => [p[0] + (pr.B[i][0] - p[0]) * t, p[1] + (pr.B[i][1] - p[1]) * t]);
    const hole = t < 0.5 ? pr.holeA : pr.holeB;
    const ordered = hole ? [...pts].reverse() : pts;
    d += 'M' + ordered.map(([x, y]) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(' L') + ' Z ';
  }
  // smooth the polygon back into curves
  const it = toItem(d.trim());
  for (const c of it.children) c.simplify(0.4);
  return it.getPathData(null, 2);
}

export function mixColor(c1, c2, t) {
  const p = (c) => { const h = (c || '#000000').replace('#', ''); const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h; return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) || 0); };
  const a = p(c1), b = p(c2);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

export function mixStyle(sa, sb, t) {
  const f = (s) => s?.fills?.find((x) => x.visible !== false);
  const col = (x) => (x ? (x.type === 'solid' ? x.color : x.stops?.[0]?.color || x.color || '#000') : null);
  const ca = col(f(sa)), cb = col(f(sb));
  const out = JSON.parse(JSON.stringify(t < 0.5 ? sa : sb));
  out.fills = ca || cb ? [{ type: 'solid', color: mixColor(ca || cb, cb || ca, t), opacity: 1 }] : [];
  const sta = sa?.strokes?.[0], stb = sb?.strokes?.[0];
  if (sta || stb) {
    const A = sta || { ...stb, width: 0 }, B = stb || { ...sta, width: 0 };
    out.strokes = [{ ...A, color: mixColor(A.color, B.color, t), width: A.width + (B.width - A.width) * t }];
  } else out.strokes = [];
  out.shadow = null; out.glow = null; out.extrude = null; out.contour = null;
  return out;
}

export function blendSteps(dA, dB, steps) {
  const pairs = blendPairs(dA, dB);
  const out = [];
  for (let i = 1; i <= steps; i++) out.push({ t: i / (steps + 1), d: blendShape(pairs, i / (steps + 1)) });
  return out;
}

export { P };
