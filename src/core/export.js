// Exports: SVG (full and "compatible"), transparent PNG at any size, vector
// PDF, and the .midad project file.
import { renderDocSVG } from './render.js';
import { worldD, worldBounds, unionBounds, cleanD } from './geometry.js';
import { FORMAT_VERSION } from './model.js';

export function exportBounds(doc, objects, mode) {
  if (mode === 'content') {
    const b = unionBounds(objects.filter((o) => o.visible !== false).map(worldBounds));
    if (b && b.w > 0) {
      const pad = Math.max(4, Math.max(b.w, b.h) * 0.02);
      return { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
    }
  }
  return { x: 0, y: 0, w: doc.width, h: doc.height };
}

export function toSVG(doc, { objects = doc.objects, crop = 'artboard', background = true } = {}) {
  return renderDocSVG(doc, { objects, crop: exportBounds(doc, objects, crop), background });
}

/**
 * Plain SVG: one <path> per object, world coordinates, a single solid fill
 * and stroke. Opens cleanly in old Illustrator/CorelDRAW versions.
 */
export function toSimpleSVG(doc, { objects = doc.objects, crop = 'artboard', background = true } = {}) {
  const vb = exportBounds(doc, objects, crop);
  const flat = [];
  const walk = (o, parentM) => {
    if (o.visible === false) return;
    const M = mulM(parentM, o.m);
    if (o.type === 'group') { o.children.forEach((c) => walk(c, M)); return; }
    if (o.type === 'image') return;
    const d = cleanD(worldD({ ...o, m: M }));
    const fill = o.style?.fills?.find((f) => f.visible !== false);
    const color = fill ? (fill.type === 'solid' ? fill.color : (fill.stops?.[0]?.color || fill.color || '#000')) : 'none';
    const s = o.style?.strokes?.[0];
    const stroke = s ? ` stroke="${s.color}" stroke-width="${s.width}" stroke-linejoin="round"` : '';
    flat.push(`<path id="${o.id}" d="${d}" fill="${color}"${stroke}/>`);
  };
  objects.forEach((o) => walk(o, [1, 0, 0, 1, 0, 0]));
  const bg = background && doc.background ? `<rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="${doc.background}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${r(vb.w)}" height="${r(vb.h)}" viewBox="${r(vb.x)} ${r(vb.y)} ${r(vb.w)} ${r(vb.h)}">\n${bg}\n${flat.join('\n')}\n</svg>\n`;
}
const r = (n) => Math.round(n * 100) / 100;
const mulM = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];

/** Rasterise an SVG string to a PNG blob whose long side is `longSide`. */
export async function svgToPNG(svg, longSide = 4000) {
  const m = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  const w = m ? +m[3] : 1000, h = m ? +m[4] : 1000;
  const k = longSide / Math.max(w, h);
  const W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
  const sized = svg.replace(/(<svg[^>]*?)width="[\d.]+" height="[\d.]+"/, `$1width="${W}" height="${H}"`);
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('تعذّر تحويل الرسم إلى صورة')); img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    return await new Promise((res) => canvas.toBlob(res, 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}

export async function svgToPDF(svg) {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
  const m = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  const w = m ? +m[3] : 1000, h = m ? +m[4] : 1000;
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-99999px;top:0;';
  holder.innerHTML = svg.replace(/^<\?xml[^>]*>/, '');
  document.body.appendChild(holder);
  try {
    const el = holder.querySelector('svg');
    const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'pt', format: [w, h], compress: true });
    await svg2pdf(el, pdf, { x: 0, y: 0, width: w, height: h });
    return pdf.output('blob');
  } finally { holder.remove(); }
}

export function projectFile(doc, extra = {}) {
  return JSON.stringify({ format: 'midad', version: FORMAT_VERSION, saved: new Date().toISOString(), doc, ...extra });
}

export function parseProjectFile(text) {
  const j = JSON.parse(text);
  if (j.format !== 'midad' || !j.doc) throw new Error('هذا الملف ليس مشروع كلمة');
  return j;
}

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
