// Renders the document to SVG markup. The same code drives the on-screen
// canvas and the SVG/PNG/PDF exports, so what you see is what you export.
import { localD } from './geometry.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (n) => (Math.round(n * 1000) / 1000).toString();
export const matrixAttr = (m) => (m && (m[0] !== 1 || m[1] || m[2] || m[3] !== 1 || m[4] || m[5]) ? ` transform="matrix(${m.map(num).join(' ')})"` : '');

const extraRenderers = {};
export function registerRenderer(type, fn) { extraRenderers[type] = fn; }

export const PATTERNS = {
  dots: (c, s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.18}" fill="${c}"/>`,
  stripes: (c, s) => `<rect x="0" y="0" width="${s}" height="${s * 0.35}" fill="${c}"/>`,
  diagonal: (c, s) => `<path d="M0,${s} L${s},0 M${-s / 4},${s / 4} L${s / 4},${-s / 4} M${s * 0.75},${s * 1.25} L${s * 1.25},${s * 0.75}" stroke="${c}" stroke-width="${s * 0.18}"/>`,
  grid: (c, s) => `<path d="M0,0 H${s} M0,0 V${s}" stroke="${c}" stroke-width="${s * 0.12}"/>`,
  diamonds: (c, s) => `<path d="M${s / 2},${s * 0.1} L${s * 0.9},${s / 2} L${s / 2},${s * 0.9} L${s * 0.1},${s / 2} Z" fill="${c}"/>`,
  stars: (c, s) => {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const r = i % 2 ? s * 0.2 : s * 0.42, a = (i * Math.PI) / 8;
      pts.push(`${num(s / 2 + r * Math.cos(a))},${num(s / 2 + r * Math.sin(a))}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${c}"/>`;
  },
};

function gradientDef(id, f) {
  const stops = (f.stops || [{ offset: 0, color: '#c9a227' }, { offset: 1, color: '#6b4e0e' }])
    .map((s) => `<stop offset="${num(s.offset)}" stop-color="${esc(s.color)}"${s.opacity != null && s.opacity !== 1 ? ` stop-opacity="${s.opacity}"` : ''}/>`).join('');
  if (f.type === 'radial') {
    return `<radialGradient id="${id}" cx="${f.cx ?? 0.5}" cy="${f.cy ?? 0.5}" r="${f.r ?? 0.6}">${stops}</radialGradient>`;
  }
  const a = ((f.angle ?? 90) * Math.PI) / 180;
  const x = Math.cos(a) / 2, y = Math.sin(a) / 2;
  return `<linearGradient id="${id}" x1="${num(0.5 - x)}" y1="${num(0.5 - y)}" x2="${num(0.5 + x)}" y2="${num(0.5 + y)}">${stops}</linearGradient>`;
}

function patternDef(id, f) {
  const s = f.scale || 24;
  const draw = (PATTERNS[f.pattern] || PATTERNS.dots)(esc(f.color || '#b8860b'), s);
  const bg = f.bg ? `<rect width="${s}" height="${s}" fill="${esc(f.bg)}"/>` : '';
  const rot = f.rotate ? ` patternTransform="rotate(${f.rotate})"` : '';
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${s}" height="${s}"${rot}>${bg}${draw}</pattern>`;
}

function imageFillDef(id, f) {
  return `<pattern id="${id}" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="${esc(f.src)}" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>`;
}

function paintFor(f, id, defs) {
  if (!f || f.type === 'none') return 'none';
  if (f.type === 'solid') return esc(f.color);
  if (f.type === 'linear' || f.type === 'radial') { defs.push(gradientDef(id, f)); return `url(#${id})`; }
  if (f.type === 'pattern') { defs.push(patternDef(id, f)); return `url(#${id})`; }
  if (f.type === 'image' && f.src) { defs.push(imageFillDef(id, f)); return `url(#${id})`; }
  return esc(f.color || '#000');
}

function filterDef(id, st) {
  const parts = [];
  const merge = [];
  if (st.glow) {
    const g = st.glow;
    parts.push(`<feGaussianBlur in="SourceAlpha" stdDeviation="${num(g.blur ?? 8)}" result="gb"/><feFlood flood-color="${esc(g.color || '#ffd700')}" flood-opacity="${g.opacity ?? 0.9}"/><feComposite in2="gb" operator="in" result="glow"/>`);
    merge.push('glow');
    if ((g.strength ?? 1) > 1) merge.push('glow');
  }
  if (st.shadow) {
    const s = st.shadow;
    parts.push(`<feGaussianBlur in="SourceAlpha" stdDeviation="${num(s.blur ?? 6)}" result="sb"/><feOffset in="sb" dx="${num(s.dx ?? 6)}" dy="${num(s.dy ?? 8)}" result="so"/><feFlood flood-color="${esc(s.color || '#000')}" flood-opacity="${s.opacity ?? 0.45}"/><feComposite in2="so" operator="in" result="shadow"/>`);
    merge.unshift('shadow');
  }
  merge.push('SourceGraphic');
  return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">${parts.join('')}<feMerge>${merge.map((m) => `<feMergeNode in="${m}"/>`).join('')}</feMerge></filter>`;
}

/**
 * Appearance stack for one geometry (Illustrator-like):
 * extrude → outer contours → outside strokes (cumulative) → fills →
 * inside strokes (cumulative, clipped) → center strokes → inner contours.
 */
export function renderStyled(id, d, st, opts = {}) {
  const defs = [];
  const body = [];
  const gid = `g-${id}`;
  defs.push(`<path id="${gid}" d="${d}" fill-rule="nonzero"/>`);
  const use = (attrs) => `<use href="#${gid}" ${attrs}/>`;
  const strokes = st.strokes || [];
  const fills = st.fills || [];
  let clipId = null;
  const clip = () => {
    if (!clipId) { clipId = `c-${id}`; defs.push(`<clipPath id="${clipId}"><use href="#${gid}"/></clipPath>`); }
    return clipId;
  };

  if (st.extrude && st.extrude.depth > 0) {
    const e = st.extrude;
    const steps = Math.min(80, Math.max(2, Math.round(e.depth)));
    const a = ((e.angle ?? 45) * Math.PI) / 180;
    const outsideW = strokes.filter((s) => s.align === 'outside').reduce((n, s) => n + s.width, 0);
    const sw = outsideW ? ` stroke="${esc(e.color || '#333')}" stroke-width="${num(outsideW * 2)}" stroke-linejoin="round"` : '';
    for (let i = steps; i >= 1; i--) {
      const t = (e.depth * i) / steps;
      body.push(use(`fill="${esc(e.color || '#333')}"${sw} transform="translate(${num(Math.cos(a) * t)} ${num(Math.sin(a) * t)})"`));
    }
  }

  const contour = st.contour;
  const ring = (k, r, w, color, inside) => {
    const mid = `m-${id}-${k}`;
    const black = inside ? '' : use('fill="black"');
    defs.push(`<mask id="${mid}" maskUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000">${use(`fill="none" stroke="white" stroke-width="${num(2 * r + w)}" stroke-linejoin="round"`)}${r * 2 - w > 0 ? use(`fill="none" stroke="black" stroke-width="${num(2 * r - w)}" stroke-linejoin="round"`) : ''}${black}</mask>`);
    return `<g mask="url(#${mid})"${inside ? ` clip-path="url(#${clip()})"` : ''}><rect x="-100000" y="-100000" width="200000" height="200000" fill="${esc(color)}"/></g>`;
  };
  if (contour && contour.count > 0 && contour.direction !== 'in') {
    const outsideW = strokes.filter((s) => s.align === 'outside').reduce((n, s) => n + s.width, 0);
    for (let i = contour.count; i >= 1; i--) body.push(ring(i, outsideW + contour.distance * i, contour.width || 2, contour.color || '#000', false));
  }

  const outside = strokes.map((s, i) => ({ s, i })).filter(({ s }) => s.align === 'outside');
  let acc = outside.reduce((n, { s }) => n + s.width, 0);
  for (let k = outside.length - 1; k >= 0; k--) {
    const { s } = outside[k];
    body.push(use(`fill="none" stroke="${esc(s.color)}" stroke-width="${num(acc * 2)}" stroke-linejoin="${s.join || 'round'}" stroke-linecap="${s.cap || 'round'}"${s.opacity != null && s.opacity !== 1 ? ` stroke-opacity="${s.opacity}"` : ''}`));
    acc -= s.width;
  }

  for (let i = fills.length - 1; i >= 0; i--) {
    const f = fills[i];
    if (f.visible === false) continue;
    const paint = paintFor(f, `f-${id}-${i}`, defs);
    body.push(use(`fill="${paint}"${f.opacity != null && f.opacity !== 1 ? ` fill-opacity="${f.opacity}"` : ''}`));
  }

  const inside = strokes.filter((s) => s.align === 'inside');
  if (inside.length) {
    let accIn = inside.reduce((n, s) => n + s.width, 0);
    const parts = [];
    for (let k = inside.length - 1; k >= 0; k--) {
      const s = inside[k];
      parts.push(use(`fill="none" stroke="${esc(s.color)}" stroke-width="${num(accIn * 2)}" stroke-linejoin="${s.join || 'round'}"${s.opacity != null && s.opacity !== 1 ? ` stroke-opacity="${s.opacity}"` : ''}`));
      accIn -= s.width;
    }
    body.push(`<g clip-path="url(#${clip()})">${parts.join('')}</g>`);
  }

  for (const s of strokes.filter((x) => !x.align || x.align === 'center')) {
    body.push(use(`fill="none" stroke="${esc(s.color)}" stroke-width="${num(s.width)}" stroke-linejoin="${s.join || 'round'}" stroke-linecap="${s.cap || 'round'}"${s.dash ? ` stroke-dasharray="${esc(s.dash)}"` : ''}${s.opacity != null && s.opacity !== 1 ? ` stroke-opacity="${s.opacity}"` : ''}`));
  }

  if (contour && contour.count > 0 && contour.direction === 'in') {
    for (let i = 1; i <= contour.count; i++) body.push(ring(i, contour.distance * i, contour.width || 2, contour.color || '#000', true));
  }

  let filter = '';
  if (st.shadow || st.glow) { defs.push(filterDef(`fx-${id}`, st)); filter = ` filter="url(#fx-${id})"`; }
  return { defs: defs.join(''), body: `<g${filter}>${body.join('')}</g>` };
}

export function renderObject(o, opts = {}) {
  if (!o || o.visible === false) return '';
  const t = matrixAttr(o.m);
  const dataId = opts.forExport ? '' : ` data-id="${o.id}"`;
  const idAttr = opts.forExport ? ` id="${esc(safeId(o.name, o.id))}"` : '';
  if (o.type === 'image') {
    return `<g${dataId}${idAttr}${t} opacity="${o.opacity ?? 1}"><image href="${esc(o.src)}" width="${num(o.w)}" height="${num(o.h)}" preserveAspectRatio="none"/></g>`;
  }
  if (o.type === 'group') {
    return `<g${dataId}${idAttr}${t}>${o.children.map((c) => renderObject(c, { ...opts, nested: true })).join('')}</g>`;
  }
  if (extraRenderers[o.type] && !opts.geometryOnly) {
    const r = extraRenderers[o.type](o, opts);
    if (r != null) return `<g${dataId}${idAttr}${t}>${r}</g>`;
  }
  const d = localD(o);
  if (!d) return `<g${dataId}${t}></g>`;
  const st = o.style || {};
  const { defs, body } = renderStyled(o.id, d, st, opts);
  const op = st.opacity != null && st.opacity !== 1 ? ` opacity="${st.opacity}"` : '';
  return `<g${dataId}${idAttr}${t}${op}><defs>${defs}</defs>${body}</g>`;
}

function safeId(name, id) {
  const n = String(name || '').replace(/[^\p{L}\p{N}_-]+/gu, '_');
  return n ? `${n}_${id.slice(-4)}` : id;
}

/** Full standalone SVG (for export or thumbnails). */
export function renderDocSVG(doc, { background = true, objects = null, xlink = true, crop = null } = {}) {
  const list = objects || doc.objects;
  const vb = crop || { x: 0, y: 0, w: doc.width, h: doc.height };
  const bg = background && doc.background ? `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="${esc(doc.background)}"/>` : '';
  let content = list.map((o) => renderObject(o, { forExport: true })).join('\n');
  // xlink:href keeps older Illustrator / CorelDRAW versions happy
  if (xlink) content = content.replace(/<(use|image) href=/g, '<$1 xlink:href=');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg"${xlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ''} version="1.1" width="${num(vb.w)}" height="${num(vb.h)}" viewBox="${num(vb.x)} ${num(vb.y)} ${num(vb.w)} ${num(vb.h)}">\n<title>مِداد</title>\n${bg}\n${content}\n</svg>\n`;
}
