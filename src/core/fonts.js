// Font registry: built-in OFL fonts shipped inside the app, plus fonts the
// user imports (kept in IndexedDB, never installed on the device).
import * as hb from 'harfbuzzjs';

export const BUILTIN_FONTS = [
  { id: 'amiri', name: 'الأميري', style: 'نسخ', file: 'Amiri-Regular.ttf', license: 'SIL OFL 1.1 — Khaled Hosny' },
  { id: 'arefruqaa', name: 'عارف رقعة', style: 'رقعة', file: 'ArefRuqaa-Regular.ttf', license: 'SIL OFL 1.1 — Abdullah Aref' },
  { id: 'nastaliq', name: 'نوتو نستعليق', style: 'فارسي (نستعليق)', file: 'NotoNastaliqUrdu.ttf', license: 'SIL OFL 1.1 — Google' },
  { id: 'elmessiri', name: 'المسيري', style: 'حديث', file: 'ElMessiri.ttf', license: 'SIL OFL 1.1 — Mohamed Gaber' },
  { id: 'jomhuria', name: 'جمهورية', style: 'حديث عريض', file: 'Jomhuria-Regular.ttf', license: 'SIL OFL 1.1 — KB Studio' },
  { id: 'reemkufi', name: 'ريم كوفي', style: 'كوفي هندسي', file: 'ReemKufi.ttf', license: 'SIL OFL 1.1 — Khaled Hosny' },
  { id: 'lalezar', name: 'لاله‌زار', style: 'عريض مستدير', file: 'Lalezar-Regular.ttf', license: 'SIL OFL 1.1 — Borna Izadpanah' },
  { id: 'cairo', name: 'القاهرة', style: 'حديث بسيط', file: 'Cairo.ttf', license: 'SIL OFL 1.1 — Mohamed Gaber' },
];

const loaded = new Map(); // id -> Promise<FontHandle>
const userFonts = new Map(); // id -> {id,name,style,data}
let baseUrl = './fonts/';
let fetcher = async (url) => (await fetch(url)).arrayBuffer();

export function configureFonts({ base, fetchFn } = {}) {
  if (base) baseUrl = base;
  if (fetchFn) fetcher = fetchFn;
}

export function registerUserFont(rec) {
  userFonts.set(rec.id, rec);
  loaded.delete(rec.id);
}

export function removeUserFont(id) { userFonts.delete(id); loaded.delete(id); }

export function listFonts() {
  return [...BUILTIN_FONTS, ...[...userFonts.values()].map((f) => ({ ...f, user: true }))];
}

export function fontInfo(id) {
  return listFonts().find((f) => f.id === id) || BUILTIN_FONTS[0];
}

/** Build a font handle from raw bytes. */
export function makeHandle(id, data) {
  const blob = new hb.Blob(data);
  const face = new hb.Face(blob, 0);
  const font = new hb.Font(face);
  const upem = face.upem;
  const pathCache = new Map();
  const gsub = new Set(face.getTableFeatureTags('GSUB'));
  const altFeatures = [...gsub].filter((t) => /^(ss\d\d|salt|swsh|cv\d\d|jalt|calt|dlig)$/.test(t));
  // tatweel metrics for curved kashida
  const tat = font.glyph(0x0640) ?? font.nominalGlyph?.(0x0640);
  let kashida = null;
  if (tat) {
    const ext = font.glyphExtents(tat);
    if (ext && ext.height) kashida = { top: ext.yBearing, bottom: ext.yBearing + ext.height };
  }
  if (!kashida) kashida = { top: upem * 0.09, bottom: upem * 0.02 };
  const ext = font.hExtents();
  return {
    id, face, font, upem, altFeatures, kashida,
    ascender: ext?.ascender ?? upem * 0.8,
    descender: ext?.descender ?? -upem * 0.3,
    glyphPath(gid) {
      let p = pathCache.get(gid);
      if (p === undefined) { p = font.glyphToPath(gid); pathCache.set(gid, p); }
      return p;
    },
    glyphClass(gid) { try { return face.getGlyphClass(gid); } catch { return 0; } },
    hasGlyph(cp) { return !!font.glyph(cp); },
  };
}

export async function loadFont(id) {
  if (loaded.has(id)) return loaded.get(id);
  const p = (async () => {
    const u = userFonts.get(id);
    if (u) return makeHandle(id, u.data);
    const info = BUILTIN_FONTS.find((f) => f.id === id) || BUILTIN_FONTS[0];
    const data = await fetcher(baseUrl + info.file);
    return makeHandle(info.id, data);
  })();
  loaded.set(id, p);
  p.catch(() => loaded.delete(id));
  return p;
}

/** Synchronous access once a font is loaded (null otherwise). */
const ready = new Map();
export async function ensureFont(id) {
  const h = await loadFont(id);
  ready.set(id, h);
  return h;
}
export function getFontSync(id) { return ready.get(id) || null; }

/** Read the family name from a user font file. */
export function readFontName(data) {
  try {
    const face = new hb.Face(new hb.Blob(data), 0);
    const names = face.listNames();
    const pick = (nid) => {
      const e = names.find((n) => n.nameId === nid && /^ar/.test(n.language)) || names.find((n) => n.nameId === nid);
      return e ? face.getName(e.nameId, e.language) : '';
    };
    return pick(4) || pick(1) || '';
  } catch { return ''; }
}

export { hb };
