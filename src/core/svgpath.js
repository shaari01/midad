// Minimal SVG path toolkit for absolute M/L/Q/C/Z paths (harfbuzz output and
// everything this app writes). Imported paths are normalised through Paper.js
// first (see geometry.normalize), so we never need H/V/S/T/A here.

const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/** Parse path data into [{c, p:[x0,y0,...]}] with absolute coordinates. */
export function parsePath(d) {
  const out = [];
  if (!d) return out;
  const re = /([MLQCZmlqczHhVv])([^MLQCZmlqczHhVv]*)/g;
  let m;
  let cx = 0, cy = 0, sx = 0, sy = 0;
  while ((m = re.exec(d))) {
    const c = m[1];
    const nums = (m[2].match(NUM) || []).map(Number);
    const C = c.toUpperCase();
    const rel = c !== C;
    if (C === 'Z') { out.push({ c: 'Z', p: [] }); cx = sx; cy = sy; continue; }
    const step = C === 'M' || C === 'L' ? 2 : C === 'Q' ? 4 : C === 'C' ? 6 : 1;
    for (let i = 0; i + step <= nums.length; i += step) {
      const seg = nums.slice(i, i + step);
      if (C === 'H') { const x = rel ? cx + seg[0] : seg[0]; out.push({ c: 'L', p: [x, cy] }); cx = x; continue; }
      if (C === 'V') { const y = rel ? cy + seg[0] : seg[0]; out.push({ c: 'L', p: [cx, y] }); cy = y; continue; }
      if (rel) for (let k = 0; k < seg.length; k += 2) { seg[k] += cx; seg[k + 1] += cy; }
      const cmd = C === 'M' && i > 0 ? 'L' : C;
      out.push({ c: cmd, p: seg });
      cx = seg[seg.length - 2]; cy = seg[seg.length - 1];
      if (cmd === 'M') { sx = cx; sy = cy; }
    }
  }
  return out;
}

const fmt = (n, prec) => {
  const v = Math.round(n * prec) / prec;
  return Object.is(v, -0) ? '0' : String(v);
};

export function toD(cmds, precision = 2) {
  const prec = 10 ** precision;
  let s = '';
  for (const { c, p } of cmds) {
    s += c;
    for (let i = 0; i < p.length; i++) s += (i ? ',' : '') + fmt(p[i], prec);
    s += c === 'Z' ? '' : ' ';
  }
  return s.trim();
}

/** Map every point (anchors and control points) through fn(x,y,info)->[x,y]. */
export function mapPoints(cmds, fn) {
  return cmds.map(({ c, p }) => {
    const q = new Array(p.length);
    for (let i = 0; i < p.length; i += 2) {
      const r = fn(p[i], p[i + 1], { c, anchor: i === p.length - 2 });
      q[i] = r[0]; q[i + 1] = r[1];
    }
    return { c, p: q };
  });
}

export function transformD(d, m, precision = 2) {
  const [a, b, c, dd, e, f] = m;
  return toD(mapPoints(parsePath(d), (x, y) => [a * x + c * y + e, b * x + dd * y + f]), precision);
}

/** Reverse the drawing direction of each subpath (keeps fill under nonzero). */
export function reverseCmds(cmds) {
  const subs = [];
  let cur = null;
  for (const s of cmds) {
    if (s.c === 'M') { cur = { start: s.p, segs: [], closed: false }; subs.push(cur); }
    else if (s.c === 'Z') { if (cur) cur.closed = true; }
    else if (cur) cur.segs.push(s);
  }
  const out = [];
  for (const sub of subs) {
    // build list of points: start, then each seg end
    const pts = [sub.start];
    for (const s of sub.segs) pts.push(s.p.slice(-2));
    const n = sub.segs.length;
    out.push({ c: 'M', p: pts[n].slice() });
    for (let i = n - 1; i >= 0; i--) {
      const s = sub.segs[i];
      const to = pts[i];
      if (s.c === 'L') out.push({ c: 'L', p: to.slice() });
      else if (s.c === 'Q') out.push({ c: 'Q', p: [s.p[0], s.p[1], to[0], to[1]] });
      else if (s.c === 'C') out.push({ c: 'C', p: [s.p[2], s.p[3], s.p[0], s.p[1], to[0], to[1]] });
    }
    if (sub.closed) out.push({ c: 'Z', p: [] });
  }
  return out;
}

/** Rough bbox from all points (control points included: conservative). */
export function cmdsBBox(cmds) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const { p } of cmds) for (let i = 0; i < p.length; i += 2) {
    if (p[i] < x0) x0 = p[i]; if (p[i] > x1) x1 = p[i];
    if (p[i + 1] < y0) y0 = p[i + 1]; if (p[i + 1] > y1) y1 = p[i + 1];
  }
  if (x0 === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/**
 * "Smart stretch": insert extra width/height at a split line instead of
 * scaling, so stroke thickness of the pen is preserved. Points on the far side
 * of the split move by `amount`; points near the split move proportionally
 * inside a soft band so curves crossing the line stay smooth.
 */
export function smartStretch(cmds, axis, split, amount, band = 0) {
  if (!amount) return cmds;
  const k = axis === 'x' ? 0 : 1;
  return cmds.map(({ c, p }) => {
    const q = p.slice();
    for (let i = k; i < q.length; i += 2) {
      const v = q[i];
      let t;
      if (band > 0) t = Math.min(1, Math.max(0, (v - (split - band)) / (2 * band)));
      else t = v >= split ? 1 : 0;
      q[i] = v + (t - 0.5) * amount;
    }
    return { c, p: q };
  });
}
