// Shape operations on world-space path data: boolean ops, divide, atomic
// regions (Shape Builder), islands (break apart), knife and eraser.
import { P, toItem, itemD } from './geometry.js';

const EPS_AREA = 0.5;
const nonEmpty = (it) => it && !it.isEmpty() && Math.abs(it.area) > EPS_AREA;

export function unite(ds) {
  let acc = toItem(ds[0]);
  for (let i = 1; i < ds.length; i++) acc = acc.unite(toItem(ds[i]), { insert: false });
  if (ds.length === 1) acc = acc.unite(new P.Path({ insert: false }), { insert: false });
  return itemD(acc);
}
export function subtractFront(ds) {
  // bottom-most minus everything above it (Illustrator «Minus Front»)
  let acc = toItem(ds[0]);
  for (let i = 1; i < ds.length; i++) acc = acc.subtract(toItem(ds[i]), { insert: false });
  return itemD(acc);
}
export function intersectAll(ds) {
  let acc = toItem(ds[0]);
  for (let i = 1; i < ds.length; i++) acc = acc.intersect(toItem(ds[i]), { insert: false });
  return itemD(acc);
}
export function excludeAll(ds) {
  let acc = toItem(ds[0]);
  for (let i = 1; i < ds.length; i++) acc = acc.exclude(toItem(ds[i]), { insert: false });
  return itemD(acc);
}

/**
 * Atomic regions of overlapping shapes (bottom → top order).
 * Each region: {d, owner} where owner is the index of the top-most shape
 * covering it (its style is used for the piece).
 */
export function regions(ds) {
  let pieces = [];
  let covered = null;
  for (let s = 0; s < ds.length; s++) {
    const S = toItem(ds[s]).unite(new P.Path({ insert: false }), { insert: false });
    const next = [];
    for (const p of pieces) {
      const inter = p.item.intersect(S, { insert: false });
      const rest = p.item.subtract(S, { insert: false });
      if (nonEmpty(inter)) next.push({ item: inter, owner: s });
      if (nonEmpty(rest)) next.push({ item: rest, owner: p.owner });
    }
    const fresh = covered ? S.subtract(covered, { insert: false }) : S;
    if (nonEmpty(fresh)) next.push({ item: fresh, owner: s });
    covered = covered ? covered.unite(S, { insert: false }) : S;
    pieces = next;
  }
  // split disjoint parts into their own regions
  const out = [];
  for (const p of pieces) for (const isl of islandsOf(p.item)) out.push({ d: itemD(isl), owner: p.owner, area: Math.abs(isl.area) });
  return out.filter((r) => r.area > EPS_AREA);
}

/** Split a (compound) path into islands: each outer contour with its holes. */
export function islandsOf(item) {
  const kids = item.className === 'CompoundPath' ? item.children.slice() : [item];
  if (kids.length <= 1) return [item];
  const info = kids.map((c) => ({ c, pt: c.interiorPoint || c.firstSegment?.point, area: Math.abs(c.area) }));
  for (const a of info) {
    a.depth = 0;
    a.parent = null;
    for (const b of info) {
      if (a === b || b.area <= a.area) continue;
      if (b.c.contains(a.pt)) { a.depth++; if (!a.parent || b.area < a.parent.area) a.parent = b; }
    }
  }
  const outers = info.filter((a) => a.depth % 2 === 0);
  return outers.map((o) => {
    const holes = info.filter((a) => a.depth % 2 === 1 && a.parent === o);
    return new P.CompoundPath({ children: [o.c.clone({ insert: false }), ...holes.map((h) => h.c.clone({ insert: false }))], insert: false, fillRule: 'nonzero' });
  });
}

export function islands(d) { return islandsOf(toItem(d)).map((i) => itemD(i)); }

/** Thin polygon along a polyline (for the knife) or a fat one (eraser). */
export function strokeOutline(points, width) {
  const r = width / 2;
  const parts = [];
  const circle = (x, y) => new P.Path.Circle({ center: [x, y], radius: r, insert: false });
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (width > 2) parts.push(circle(x, y));
    if (i === 0) continue;
    const [px, py] = points[i - 1];
    const dx = x - px, dy = y - py;
    const L = Math.hypot(dx, dy);
    if (L < 1e-6) continue;
    const nx = (-dy / L) * r, ny = (dx / L) * r;
    parts.push(new P.Path({ segments: [[px + nx, py + ny], [x + nx, y + ny], [x - nx, y - ny], [px - nx, py - ny]], closed: true, insert: false }));
  }
  if (!parts.length) return '';
  // make all pieces wind the same way, then let the boolean resolve overlaps
  parts.forEach((p) => { if (p.clockwise !== true) p.reverse(); });
  const cp = new P.CompoundPath({ children: parts, insert: false, fillRule: 'nonzero' });
  return itemD(cp.unite(new P.Path({ insert: false }), { insert: false }));
}

/** Cut shape d with a polyline; returns the separate pieces. */
export function knife(d, points, gap = 0.6) {
  const cut = strokeOutline(points, gap);
  if (!cut) return [d];
  const res = toItem(d).subtract(toItem(cut), { insert: false });
  return islandsOf(res).map((i) => itemD(i)).filter(Boolean);
}

export function erase(d, points, width) {
  const cut = strokeOutline(points, width);
  if (!cut) return d;
  return itemD(toItem(d).subtract(toItem(cut), { insert: false }));
}

export function area(d) { return Math.abs(toItem(d).area); }
