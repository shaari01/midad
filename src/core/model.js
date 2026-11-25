// Document model. Everything is plain JSON so history, autosave and the
// project file are just serialisation.

export const FORMAT_VERSION = 1;

let counter = 0;
export const uid = (p = 'o') => `${p}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function defaultStyle(color = '#1b1b1b') {
  return {
    fills: [{ type: 'solid', color, opacity: 1 }],
    strokes: [],
    opacity: 1,
    shadow: null, // {dx,dy,blur,color,opacity}
    glow: null, // {blur,color,opacity}
    extrude: null, // {depth,angle,color}
    contour: null, // {count,distance,width,color,direction:'out'|'in'}
  };
}

export function newDoc(w = 1080, h = 1080) {
  return {
    format: 'midad', version: FORMAT_VERSION,
    width: w, height: h, background: null, // null = transparent
    objects: [],
    guides: [], // {axis:'x'|'y', pos}
    reference: null, // {src, opacity, x,y,w,h, visible}
    palettes: null,
  };
}

export const I = [1, 0, 0, 1, 0, 0];
export const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
export const translate = (x, y) => [1, 0, 0, 1, x, y];
export const scaleM = (sx, sy, cx = 0, cy = 0) => [sx, 0, 0, sy, cx - sx * cx, cy - sy * cy];
export const rotateM = (deg, cx = 0, cy = 0) => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
};
export const skewM = (deg, cx = 0, cy = 0) => {
  const t = Math.tan((deg * Math.PI) / 180);
  return [1, 0, t, 1, -t * cy, 0];
};
export const invert = (m) => {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!det) return I.slice();
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
};
export const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
export const det = (m) => m[0] * m[3] - m[1] * m[2];

/** Decompose to x,y, scaleX, scaleY, rotation(deg), for the properties panel. */
export function decompose(m) {
  const sx = Math.hypot(m[0], m[1]);
  const rot = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
  const d = det(m);
  const sy = d / (sx || 1);
  return { x: m[4], y: m[5], sx, sy, rot };
}

export function textObject(props = {}) {
  return {
    id: uid('t'), type: 'text', name: 'نص', visible: true, locked: false,
    text: 'خط', fontId: 'amiri', size: 160, letterSpacing: 0, wordSpacing: 0,
    lineHeight: 1.6, align: 'right', features: [], kashida: {}, kashidaCurve: 0.5,
    m: I.slice(), style: defaultStyle(), ...props,
  };
}

export function pathObject(d, props = {}) {
  return { id: uid('p'), type: 'path', name: 'شكل', visible: true, locked: false, d, m: I.slice(), style: defaultStyle(), live: null, ...props };
}

export function imageObject(src, w, h, props = {}) {
  return { id: uid('i'), type: 'image', name: 'صورة', visible: true, locked: false, src, w, h, m: I.slice(), opacity: 1, ...props };
}

export function groupObject(children, props = {}) {
  return { id: uid('g'), type: 'group', name: 'مجموعة', visible: true, locked: false, children, m: I.slice(), ...props };
}

export const clone = (o) => JSON.parse(JSON.stringify(o));

export function findObject(doc, id) {
  return doc.objects.find((o) => o.id === id) || null;
}
