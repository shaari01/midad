// Geometry engine: turns any object into path data, and runs vector
// operations (outlines, booleans, simplify, bounds) through a headless
// Paper.js scope.
import paper from 'paper';
import { getFontSync, ensureFont } from './fonts.js';
import { layoutText, layoutToD } from './shaper.js';
import { transformD } from './svgpath.js';
import { apply, clone, pathObject, uid } from './model.js';

export const P = new paper.PaperScope();
P.setup(new P.Size(16, 16));
P.settings.insertItems = false;

const cache = new Map();
function cached(key, fn) {
  if (cache.has(key)) return cache.get(key);
  const v = fn();
  if (cache.size > 800) cache.delete(cache.keys().next().value);
  cache.set(key, v);
  return v;
}

/** Fonts referenced by an object tree (so callers can preload them). */
export function fontsUsed(obj, out = new Set()) {
  if (!obj) return out;
  if (obj.fontId) out.add(obj.fontId);
  if (obj.children) obj.children.forEach((c) => fontsUsed(c, out));
  if (obj.live) fontsUsed(obj.live, out);
  return out;
}
export async function preloadFonts(objs) {
  const ids = new Set();
  objs.forEach((o) => fontsUsed(o, ids));
  await Promise.all([...ids].map((id) => ensureFont(id).catch(() => ensureFont('amiri'))));
}

const textKey = (o) => JSON.stringify([o.text, o.fontId, o.size, o.letterSpacing, o.wordSpacing, o.lineHeight, o.align, o.features, o.kashida, o.kashidaCurve]);

export function textLayout(o) {
  const fh = getFontSync(o.fontId) || getFontSync('amiri');
  if (!fh) return null;
  return cached('L' + fh.id + textKey(o), () => layoutText(fh, o.text || ' ', o));
}

// Text-on-path bending (installed by the text-path module).
let textPathHook = null;
export function setTextPathHook(fn) { textPathHook = fn; }

// Extra geometry providers registered by later modules (letters, kufi, ...)
const providers = {};
export function registerGeometry(type, fn) { providers[type] = fn; }

/** Path data of an object in its own (local) coordinates. */
export function localD(o) {
  if (!o) return '';
  switch (o.type) {
    case 'text': {
      const fh = getFontSync(o.fontId) || getFontSync('amiri');
      if (!fh) return '';
      const flat = cached('D' + fh.id + textKey(o), () => layoutToD(fh, textLayout(o)));
      if (!o.onPath?.d || !textPathHook) return flat;
      return cached('TP' + fh.id + textKey(o) + JSON.stringify(o.onPath), () => textPathHook(o, flat, fh, textLayout(o)));
    }
    case 'path': return o.d || '';
    case 'image': return `M0,0 L${o.w},0 L${o.w},${o.h} L0,${o.h} Z`;
    case 'group': return o.children.map((c) => transformD(localD(c), c.m)).join(' ');
    default: return providers[o.type] ? providers[o.type](o) : '';
  }
}

export function worldD(o) { return transformD(localD(o), o.m); }

export function toItem(d) {
  return new P.CompoundPath({ pathData: d || '', insert: false, fillRule: 'nonzero' });
}
export function itemD(item, precision = 2) {
  if (!item) return '';
  if (item.className === 'Group' || item.className === 'Layer') {
    return item.children.map((c) => itemD(c, precision)).join(' ');
  }
  // Paper's pathData uses relative commands; that's valid SVG.
  return item.getPathData(null, precision);
}

export function localBounds(o) {
  if (o.type === 'image') return { x: 0, y: 0, w: o.w, h: o.h };
  const d = localD(o);
  return cached('B' + d.length + ':' + hashStr(d), () => {
    if (!d) return { x: 0, y: 0, w: 0, h: 0 };
    const b = toItem(d).bounds;
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
}

export function worldBounds(o) {
  const b = localBounds(o);
  const pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].map(([x, y]) => apply(o.m, x, y));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function unionBounds(list) {
  if (!list.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of list) {
    x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1 + (s.length >> 12)) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** Merge overlapping contours of a nonzero path into clean outlines. */
export function cleanD(d) {
  if (!d) return '';
  const it = toItem(d);
  const res = it.unite(new P.Path({ insert: false }), { insert: false });
  return itemD(res);
}

/** Convert text/letters/… into an editable path object. */
export function toOutlines(o, { keepLive = true } = {}) {
  if (o.type === 'path') return o;
  const d = cleanD(localD(o));
  const p = pathObject(d, {
    name: (o.name || 'شكل') + ' (أشكال)',
    m: o.m.slice(), style: clone(o.style || {}),
    live: keepLive ? clone(o) : null,
  });
  p.id = uid('p');
  return p;
}

/** Boolean operations between world-space shapes. */
export function booleanD(op, dA, dB) {
  const a = toItem(dA), b = toItem(dB);
  const fn = { unite: 'unite', subtract: 'subtract', intersect: 'intersect', exclude: 'exclude' }[op];
  return itemD(a[fn](b, { insert: false }));
}

export function simplifyD(d, tolerance = 2.5) {
  const it = toItem(d);
  for (const c of it.children) if (c.segments.length > 3) c.simplify(tolerance);
  return itemD(it);
}

export function countNodes(d) {
  const it = toItem(d);
  return it.children.reduce((n, c) => n + c.segments.length, 0);
}
