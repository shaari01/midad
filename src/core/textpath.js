// Text on a drawn path (circle, arc, free curve): every outline point of the
// laid-out text is carried along the path, so joined Arabic letters bend
// smoothly instead of being placed as stiff separate glyphs.
import { toItem } from './geometry.js';
import { mapD } from './warp.js';

/** Sampled lookup table of a path: positions + upward normals by length. */
export function pathTable(d, reverse = false) {
  const it = toItem(d);
  const kids = (it.className === 'CompoundPath' ? it.children : [it]).filter((c) => c.segments.length > 1);
  if (!kids.length) return null;
  const path = kids.reduce((a, b) => (b.length > a.length ? b : a));
  if (reverse) path.reverse();
  const L = path.length;
  const n = Math.max(16, Math.min(4000, Math.ceil(L / 2)));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = (L * i) / n;
    const p = path.getPointAt(Math.min(s, L - 1e-6)) || path.lastSegment.point;
    const nr = path.getNormalAt(Math.min(s, L - 1e-6)) || { x: 0, y: 1 };
    pts.push([p.x, p.y, -nr.x, -nr.y]); // upward (left) normal in y-down space
  }
  return { L, n, pts, closed: path.closed };
}

function at(tab, s) {
  const { L, n, pts, closed } = tab;
  if (closed) s = ((s % L) + L) % L;
  if (!closed && (s < 0 || s > L)) {
    // extend straight along the end tangent
    const [a, b] = s < 0 ? [pts[0], pts[1]] : [pts[n - 1], pts[n]];
    const tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    const base = s < 0 ? pts[0] : pts[n];
    const k = s < 0 ? s : s - L;
    return [base[0] + (tx / tl) * k, base[1] + (ty / tl) * k, base[2], base[3]];
  }
  const f = (s / L) * n;
  const i = Math.min(n - 1, Math.floor(f)), t = f - i;
  const p = pts[i], q = pts[i + 1];
  const nx = p[2] + (q[2] - p[2]) * t, ny = p[3] + (q[3] - p[3]) * t, nl = Math.hypot(nx, ny) || 1;
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, nx / nl, ny / nl];
}

/**
 * Bend text outline d (text-local, baseline at `base`, width `width`) along
 * the path. opts: {start: 0..1 position of the text centre, shift: baseline
 * offset in px, reverse: other side of the path}.
 */
export function bendAlong(d, pathD, { width, base, start = 0.5, shift = 0, reverse = false, size = 100 }) {
  const tab = pathTable(pathD, reverse);
  if (!tab) return d;
  const s0 = start * tab.L - width / 2;
  const f = ([x, y]) => {
    // text runs right→left; x grows to the right along the path direction
    const [px, py, nx, ny] = at(tab, s0 + x);
    const up = base - y + shift;
    return [px + nx * up, py + ny * up];
  };
  return mapD(d, f, Math.max(0.6, size / 90), true);
}
