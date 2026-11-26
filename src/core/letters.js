// «الحروف الحيّة»: a word exploded into separate glyphs that stay linked to
// the font. Each item keeps its own transform, smart stretch and alternate
// form; changing the font re-shapes the source text and keeps the edits.
import { hb } from './fonts.js';
import { layoutText, glyphCmds, kashidaCmds } from './shaper.js';
import { mapPoints, toD, reverseCmds, smartStretch, cmdsBBox, parsePath } from './svgpath.js';
import { mul, translate, rotateM, skewM, scaleM, apply, uid, det, clone } from './model.js';

export const defaultT = () => ({ dx: 0, dy: 0, sx: 1, sy: 1, rot: 0, skew: 0, flipX: false, flipY: false, stretchX: 0, stretchY: 0 });

function itemsFromLayout(fh, lay) {
  const occ = new Map();
  return lay.glyphs.map((g) => {
    const n = occ.get(g.cluster) || 0;
    occ.set(g.cluster, n + 1);
    return { key: `${g.cluster}:${n}`, gid: g.gid, cluster: g.cluster, ch: g.ch, mark: g.mark, bx: g.x, by: g.y, adv: g.adv };
  });
}

/** Create a letters object from a text object (keeps transform & style). */
export function explode(fh, textObj, lay = null) {
  lay = lay || layoutText(fh, textObj.text, textObj);
  const items = itemsFromLayout(fh, lay).map((it) => ({ id: uid('l'), ...it, kind: it.mark ? 'mark' : 'base', t: defaultT(), alt: null }));
  // kashidas become their own (font-independent) pieces
  for (const k of lay.kashidas) {
    const cmds = parsePath(k.d);
    const bb = cmdsBBox(cmds);
    items.unshift({
      id: uid('l'), key: `k${k.gap}`, kind: 'kashida', ch: 'ـ', cluster: k.gap,
      d: toD(mapPoints(cmds, (x, y) => [x - bb.x, y - k.y])), bx: bb.x, by: k.y, adv: bb.w, t: defaultT(),
    });
  }
  return {
    id: uid('w'), type: 'letters', name: (textObj.name || textObj.text) + ' (حروف)', visible: true, locked: false,
    sourceText: textObj.text, fontId: fh.id, size: textObj.size, features: [...(textObj.features || [])],
    letterSpacing: textObj.letterSpacing, wordSpacing: textObj.wordSpacing, lineHeight: textObj.lineHeight, align: textObj.align,
    kashidaCurve: textObj.kashidaCurve ?? 0.5, m: textObj.m.slice(), style: clone(textObj.style), items,
  };
}

/** Re-shape with (possibly) another font and keep per-letter edits. */
export function relink(fh, obj) {
  const lay = layoutText(fh, obj.sourceText, { ...obj, kashida: {} });
  const fresh = itemsFromLayout(fh, lay);
  const byKey = new Map(obj.items.filter((i) => i.kind !== 'kashida').map((i) => [i.key, i]));
  const order = obj.items.map((i) => i.key);
  const out = [];
  for (const f of fresh) {
    const old = byKey.get(f.key);
    const it = old ? { ...old, gid: f.gid, bx: f.bx, by: f.by, adv: f.adv, mark: f.mark, ch: f.ch } : { id: uid('l'), ...f, kind: f.mark ? 'mark' : 'base', t: defaultT(), alt: null };
    if (it.d && it.kind !== 'kashida' && !it.detached) delete it.d;
    if (it.alt) it.gid = altGid(fh, obj, it, it.alt) ?? f.gid;
    out.push(it);
  }
  // keep kashida pieces and any detached shapes as they are
  for (const i of obj.items) if (i.kind === 'kashida' || i.detached) out.push(i);
  // preserve the user's depth order where possible
  out.sort((a, b) => rank(order, a.key) - rank(order, b.key));
  obj.fontId = fh.id;
  obj.items = out;
  return obj;
}
const rank = (order, k) => { const i = order.indexOf(k); return i < 0 ? 1e6 : i; };

/** Raw outline of an item in its own coords (origin = pen origin, y down). */
export function itemBaseCmds(fh, obj, it) {
  if (it.d) return parsePath(it.d);
  if (!fh) return [];
  const s = obj.size / fh.upem;
  return glyphCmds(fh, it.gid, s);
}

export function itemLocalCmds(fh, obj, it) {
  let cmds = itemBaseCmds(fh, obj, it);
  const t = it.t || defaultT();
  const bb0 = cmdsBBox(cmds);
  if (t.stretchX) cmds = smartStretch(cmds, 'x', bb0.x + bb0.w / 2, t.stretchX, bb0.w * 0.06);
  if (t.stretchY) cmds = smartStretch(cmds, 'y', bb0.y + bb0.h / 2, t.stretchY, bb0.h * 0.06);
  return cmds;
}

/** Item → object-local matrix. Pivot = centre of the (stretched) glyph. */
export function itemMatrix(it, bb) {
  const t = it.t || defaultT();
  const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
  let M = translate(it.bx + t.dx, it.by + t.dy);
  M = mul(M, translate(cx, cy));
  if (t.rot) M = mul(M, rotateM(t.rot));
  if (t.skew) M = mul(M, skewM(t.skew));
  M = mul(M, scaleM(t.sx * (t.flipX ? -1 : 1), t.sy * (t.flipY ? -1 : 1)));
  return mul(M, translate(-cx, -cy));
}

export function itemPlaced(fh, obj, it) {
  const cmds = itemLocalCmds(fh, obj, it);
  const bb = cmdsBBox(cmds);
  const M = itemMatrix(it, bb);
  let out = mapPoints(cmds, (x, y) => apply(M, x, y));
  if (det(M) < 0) out = reverseCmds(out);
  return { cmds: out, M, bb };
}

export function lettersD(fh, obj) {
  return obj.items.map((it) => toD(itemPlaced(fh, obj, it).cmds)).join(' ');
}

/** Corner polygon of an item (object-local), for hit tests and the overlay. */
export function itemPolygon(fh, obj, it) {
  const cmds = itemLocalCmds(fh, obj, it);
  const bb = cmdsBBox(cmds);
  const M = itemMatrix(it, bb);
  const pad = Math.max(2, obj.size * 0.02);
  return [[bb.x - pad, bb.y - pad], [bb.x + bb.w + pad, bb.y - pad], [bb.x + bb.w + pad, bb.y + bb.h + pad], [bb.x - pad, bb.y + bb.h + pad]].map(([x, y]) => apply(M, x, y));
}

/** Connection points: exit = left edge on the baseline, entry = right edge. */
export function itemJoints(fh, obj, it) {
  const cmds = itemLocalCmds(fh, obj, it);
  const bb = cmdsBBox(cmds);
  const M = itemMatrix(it, bb);
  const adv = it.kind === 'kashida' ? (it.adv || bb.w) : (it.adv || bb.w) + (it.t?.stretchX || 0) / 2;
  const left = it.kind === 'kashida' ? 0 : -(it.t?.stretchX || 0) / 2;
  return { exit: apply(M, left, 0), entry: apply(M, adv, 0) };
}

export function pointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* ----------------------------- alternates ----------------------------- */

const FORM_TEXT = {
  isol: (c) => c,
  init: (c) => c + 'ـ',
  medi: (c) => 'ـ' + c + 'ـ',
  fina: (c) => 'ـ' + c,
};
export const FORM_LABEL = { isol: 'منفرد', init: 'أول', medi: 'وسط', fina: 'آخر' };

function shapeGids(fh, text, features) {
  const buf = new hb.Buffer();
  buf.addText(text);
  buf.setDirection('rtl');
  buf.guessSegmentProperties();
  hb.shape(fh.font, buf, features.map((f) => hb.Feature.fromString(f)).filter(Boolean));
  return buf.getGlyphInfos();
}

export function altGid(fh, obj, it, alt) {
  if (!alt || !it.ch) return null;
  if (alt.type === 'form') {
    const txt = FORM_TEXT[alt.form](it.ch);
    const infos = shapeGids(fh, txt, obj.features || []);
    const idx = alt.form === 'isol' || alt.form === 'init' ? 0 : 1;
    const g = infos.find((x) => x.cluster === idx);
    return g ? g.codepoint : null;
  }
  if (alt.type === 'feature') {
    const infos = shapeGids(fh, obj.sourceText, [...(obj.features || []), `${alt.tag}[${it.cluster}:${it.cluster + 1}]`]);
    const g = infos.filter((x) => x.cluster === it.cluster);
    return g.length ? g[Math.min(g.length - 1, +(it.key.split(':')[1] || 0))].codepoint : null;
  }
  if (alt.type === 'gid') return alt.gid;
  return null;
}

/** Every distinct glyph this letter can take in this font. */
export function alternatesFor(fh, obj, it) {
  if (!it.ch || it.kind !== 'base') return [];
  const seen = new Set();
  const base = altGid(fh, obj, { ...it }, { type: 'feature', tag: 'locl' }) ?? it.gid;
  const out = [{ alt: null, gid: base, label: 'الأصلي' }];
  seen.add(base);
  seen.add(it.gid);
  for (const tag of fh.altFeatures) {
    const g = altGid(fh, obj, it, { type: 'feature', tag });
    if (g != null && !seen.has(g)) { seen.add(g); out.push({ alt: { type: 'feature', tag }, gid: g, label: tag }); }
  }
  for (const form of ['isol', 'init', 'medi', 'fina']) {
    const g = altGid(fh, obj, it, { type: 'form', form });
    if (g != null && !seen.has(g)) { seen.add(g); out.push({ alt: { type: 'form', form }, gid: g, label: FORM_LABEL[form] }); }
  }
  return out;
}

/** Split a letter's outline into the body and its small separate pieces (dots). */
export function splitDots(fh, obj, it, P) {
  const d = toD(itemLocalCmds(fh, obj, it));
  const cp = new P.CompoundPath({ pathData: d, insert: false });
  const parts = cp.children.map((c) => ({ c, area: Math.abs(c.area), b: c.bounds }));
  if (parts.length < 2) return null;
  const maxA = Math.max(...parts.map((p) => p.area));
  // holes are contained in a bigger contour with opposite orientation; keep them with it
  const isHole = (p) => parts.some((q) => q !== p && q.area > p.area && q.b.contains(p.b) && Math.sign(q.c.area) !== Math.sign(p.c.area));
  const dots = parts.filter((p) => p.area < maxA * 0.25 && !isHole(p));
  if (!dots.length) return null;
  const body = parts.filter((p) => !dots.includes(p)).map((p) => p.c.pathData).join(' ');
  return { body, dots: dots.map((p) => p.c.pathData) };
}

export { kashidaCmds };
