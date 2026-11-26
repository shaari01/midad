// Image trace: turn a picture into a flat one-colour editable shape.
// 1) a mask: alpha (transparent PNG) or black/white threshold (photos/scans)
// 2) boundary loops between filled and empty pixels (filled on the left)
// 3) loops smoothed into Bézier curves.
import { P, itemD } from './geometry.js';

/** Decide the mask source automatically: transparent images use alpha. */
export function hasTransparency(data) {
  let n = 0;
  const total = data.length / 4;
  for (let i = 3; i < data.length; i += 16) if (data[i] < 250) n++;
  return n / (total / 4) > 0.02;
}

/**
 * Build a binary mask. opts: {mode:'auto'|'alpha'|'dark'|'light', threshold 0..255, invert}
 * Returns Uint8Array(w*h) of 0/1.
 */
export function makeMask(data, w, h, { mode = 'auto', threshold = 128, invert = false } = {}) {
  const m = new Uint8Array(w * h);
  const useAlpha = mode === 'alpha' || (mode === 'auto' && hasTransparency(data));
  for (let i = 0, j = 0; j < m.length; i += 4, j++) {
    const a = data[i + 3];
    let on;
    if (useAlpha) on = a > 127;
    else {
      // composite on white, then luminance
      const k = a / 255;
      const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * k + 255 * (1 - k);
      on = mode === 'light' ? lum >= threshold : lum < threshold;
    }
    m[j] = (invert ? !on : on) ? 1 : 0;
  }
  return m;
}

/** Remove specks: connected components smaller than minArea pixels are flipped. */
export function despeckle(mask, w, h, minArea) {
  if (minArea <= 1) return mask;
  const seen = new Uint8Array(mask.length);
  const stack = new Int32Array(mask.length);
  for (let s = 0; s < mask.length; s++) {
    if (seen[s]) continue;
    const v = mask[s];
    let top = 0, n = 0;
    stack[top++] = s; seen[s] = 1;
    const comp = [];
    while (top) {
      const p = stack[--top]; comp.push(p); n++;
      const x = p % w, y = (p / w) | 0;
      if (x > 0 && !seen[p - 1] && mask[p - 1] === v) { seen[p - 1] = 1; stack[top++] = p - 1; }
      if (x < w - 1 && !seen[p + 1] && mask[p + 1] === v) { seen[p + 1] = 1; stack[top++] = p + 1; }
      if (y > 0 && !seen[p - w] && mask[p - w] === v) { seen[p - w] = 1; stack[top++] = p - w; }
      if (y < h - 1 && !seen[p + w] && mask[p + w] === v) { seen[p + w] = 1; stack[top++] = p + w; }
    }
    if (n < minArea) for (const p of comp) mask[p] = v ? 0 : 1;
  }
  return mask;
}

/**
 * Boundary loops of the mask as point lists (edge midpoints, so the stair
 * steps are already halved). Filled area is always on the same side, so
 * outer contours and holes get opposite winding (nonzero fill works).
 */
export function traceLoops(mask, w, h) {
  const at = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? mask[y * w + x] : 0);
  // directed unit edges on the pixel-corner grid, keyed by start corner
  const W = w + 1;
  const out = new Map(); // corner -> array of [dx,dy]
  const add = (x, y, dx, dy) => { const k = y * W + x; const a = out.get(k); if (a) a.push([dx, dy]); else out.set(k, [[dx, dy]]); };
  for (let y = 0; y <= h; y++) {
    for (let x = 0; x <= w; x++) {
      // horizontal edge from (x,y) to (x+1,y): between pixel (x,y-1) above and (x,y) below
      if (x < w) {
        const up = at(x, y - 1), dn = at(x, y);
        if (dn && !up) add(x + 1, y, -1, 0); // filled below → walk leftwards (filled on left in y-down)
        else if (up && !dn) add(x, y, 1, 0);
      }
      if (y < h) {
        const lf = at(x - 1, y), rt = at(x, y);
        if (rt && !lf) add(x, y, 0, 1);
        else if (lf && !rt) add(x, y + 1, 0, -1);
      }
    }
  }
  const loops = [];
  while (out.size) {
    const [startK, arr] = out.entries().next().value;
    let k = startK, d = arr.pop();
    if (!arr.length) out.delete(k);
    const pts = [];
    let x = k % W, y = (k / W) | 0;
    let guard = 0;
    for (;;) {
      pts.push([x + d[0] / 2, y + d[1] / 2]);
      x += d[0]; y += d[1];
      k = y * W + x;
      const cand = out.get(k);
      if (!cand) break;
      // at a saddle choose the left turn first (keeps diagonal pixels separate)
      let pick = 0;
      if (cand.length > 1) {
        const left = [d[1], -d[0]];
        const i = cand.findIndex((c) => c[0] === left[0] && c[1] === left[1]);
        pick = i >= 0 ? i : 0;
      }
      d = cand.splice(pick, 1)[0];
      if (!cand.length) out.delete(k);
      if (++guard > 4e6) break;
    }
    if (pts.length > 2) loops.push(pts);
  }
  return loops;
}

const polyArea = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], r = q[(i + 1) % q.length]; a += p[0] * r[1] - r[0] * p[1]; } return a / 2; };

/** Douglas–Peucker on an open run of points. */
function dp(pts, tol) {
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const L = Math.hypot(bx - ax, by - ay) || 1;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Closed loop → few points (DP) → smooth curves through them, with real
 *  corners kept sharp. Interpolating keeps the area true (Paper's own
 *  simplify cuts closed loops short). */
function fitLoop(q, tol) {
  // split the loop at its two farthest-apart points
  let far = 0, fd = -1;
  for (let i = 0; i < q.length; i++) { const d = (q[i][0] - q[0][0]) ** 2 + (q[i][1] - q[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const A = dp(q.slice(0, far + 1), tol), B = dp([...q.slice(far), q[0]], tol);
  const v = [...A.slice(0, -1), ...B.slice(0, -1)];
  const n = v.length;
  const segs = v.map((p, i) => {
    const a = v[(i + n - 1) % n], b = v[(i + 1) % n];
    const u1 = [p[0] - a[0], p[1] - a[1]], u2 = [b[0] - p[0], b[1] - p[1]];
    const l1 = Math.hypot(...u1) || 1, l2 = Math.hypot(...u2) || 1;
    const cos = (u1[0] * u2[0] + u1[1] * u2[1]) / (l1 * l2);
    if (cos < 0.55) return new P.Segment(new P.Point(p)); // corner
    const t = [b[0] - a[0], b[1] - a[1]], tl = Math.hypot(...t) || 1;
    const hi = new P.Point((-t[0] / tl) * l1 / 3, (-t[1] / tl) * l1 / 3), ho = new P.Point((t[0] / tl) * l2 / 3, (t[1] / tl) * l2 / 3);
    return new P.Segment(new P.Point(p), hi, ho);
  });
  return new P.Path({ segments: segs, closed: true, insert: false });
}

/** Full pipeline from RGBA pixels to path data in pixel units. */
export function traceImageData(data, w, h, { mode = 'auto', threshold = 128, invert = false, despeckle: sp = 4, smooth = 1 } = {}) {
  const mask = despeckle(makeMask(data, w, h, { mode, threshold, invert }), w, h, sp);
  const loops = traceLoops(mask, w, h);
  const parts = [];
  for (const pts of loops) {
    let q = pts;
    // relax the pixel staircase first (neighbour averaging keeps the area
    // close), then fit curves with a modest tolerance
    for (let pass = 0; pass < (smooth > 0 ? 1 : 0); pass++) {
      const n = q.length;
      q = q.map((p, i) => { const a = q[(i + n - 1) % n], b = q[(i + 1) % n]; return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4]; });
    }
    if (Math.abs(polyArea(q)) < Math.max(2, sp)) continue;
    const path = smooth > 0 ? fitLoop(q, 0.25 + smooth * 0.35) : new P.Path({ segments: q, closed: true, insert: false });
    parts.push(path);
  }
  if (!parts.length) return '';
  const cp = new P.CompoundPath({ children: parts, insert: false, fillRule: 'nonzero' });
  return itemD(cp, 2);
}
