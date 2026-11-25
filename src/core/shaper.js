// Arabic text layout on top of HarfBuzz: shaping, multi-line, alignment,
// tracking that never breaks joined letters, word spacing, and curved kashida
// (tatweel) drawn between connected letters.
import { hb } from './fonts.js';
import { connections } from './joining.js';
import { parsePath, toD, mapPoints, reverseCmds } from './svgpath.js';

/** Convert a font-unit glyph path (y up) into doc units (y down). */
export function glyphCmds(fh, gid, s) {
  return mapPoints(parsePath(fh.glyphPath(gid)), (x, y) => [x * s, -y * s]);
}

export function signedArea(cmds) {
  // anchors-only polygon area per subpath, summed with sign of the largest
  let best = 0, start = null, prev = null, acc = 0;
  const flush = () => { if (Math.abs(acc) > Math.abs(best)) best = acc; acc = 0; };
  for (const { c, p } of cmds) {
    if (c === 'M') { if (start) flush(); start = p.slice(-2); prev = start; continue; }
    if (c === 'Z') { if (prev && start) acc += prev[0] * start[1] - start[0] * prev[1]; prev = start; continue; }
    const q = p.slice(-2);
    if (prev) acc += prev[0] * q[1] - q[0] * prev[1];
    prev = q;
  }
  flush();
  return best / 2;
}

function outerSign(fh) {
  if (fh._outerSign) return fh._outerSign;
  const gid = fh.font.glyph(0x0627) || fh.font.glyph(0x0644) || fh.font.glyph(0x48);
  const a = gid ? signedArea(glyphCmds(fh, gid, 1)) : -1;
  fh._outerSign = a >= 0 ? 1 : -1;
  return fh._outerSign;
}

/** A curved kashida stroke between x0 (left) and x1 (right) on a baseline. */
export function kashidaCmds(fh, s, x0, x1, baseY, curve = 0.5) {
  const top = baseY - fh.kashida.top * s;
  const bot = baseY - fh.kashida.bottom * s;
  const th = Math.abs(bot - top);
  const L = x1 - x0;
  const ov = Math.min(th * 0.6, L * 0.2 + th * 0.2); // overlap into the letters
  const sag = curve * Math.min(L * 0.18, th * 3.2);
  const a = x0 - ov, b = x1 + ov;
  let cmds = [
    { c: 'M', p: [b, top] },
    { c: 'C', p: [x1 - L * 0.3, top + sag, x0 + L * 0.3, top + sag * 1.1, a, top] },
    { c: 'L', p: [a, bot] },
    { c: 'C', p: [x0 + L * 0.3, bot + sag * 1.05, x1 - L * 0.3, bot + sag * 0.95, b, bot] },
    { c: 'Z', p: [] },
  ];
  if (Math.sign(signedArea(cmds)) !== outerSign(fh)) cmds = reverseCmds(cmds);
  return cmds;
}

function buildFeatures(list) {
  const out = [];
  for (const f of list || []) {
    const feat = typeof f === 'string' ? hb.Feature.fromString(f) : f;
    if (feat) out.push(feat);
  }
  return out;
}

/** Shape one logical line. offset = index of the line's first char in the full text. */
function shapeLine(fh, text, offset, fullText, opts, conn) {
  const s = opts.size / fh.upem;
  const buf = new hb.Buffer();
  buf.addText(fullText, offset, text.length);
  buf.setDirection('rtl');
  buf.guessSegmentProperties();
  hb.shape(fh.font, buf, buildFeatures(opts.features));
  const infos = buf.getGlyphInfosAndPositions();
  const kas = opts.kashida || {};
  const track = (opts.letterSpacing || 0) / 1000 * opts.size;
  const wordSp = (opts.wordSpacing || 0) / 1000 * opts.size;
  const glyphs = [];
  const kashidas = [];
  const gaps = [];
  let x = 0;
  for (let i = 0; i < infos.length; i++) {
    const g = infos[i];
    const ch = fullText[g.cluster];
    const isMark = fh.glyphClass(g.codepoint) === 3 || (g.xAdvance === 0 && /[ً-ٰٟ]/.test(ch || ''));
    glyphs.push({
      gid: g.codepoint, cluster: g.cluster, ch, mark: isMark,
      x: x + g.xOffset * s, y: -g.yOffset * s, adv: g.xAdvance * s,
    });
    x += g.xAdvance * s;
    if (ch === ' ' || ch === ' ') x += wordSp;
    // gap between this glyph (left) and the next one (right) in visual order
    const nx = infos[i + 1];
    if (!nx || nx.cluster === g.cluster) continue;
    const hi = g.cluster, lo = nx.cluster; // RTL: left glyph has the later cluster
    if (hi <= lo) continue;
    let joined = false;
    let extra = 0;
    for (let k = lo; k < hi; k++) {
      if (conn[k]) {
        joined = true;
        const amt = (kas[k] || 0) * opts.size;
        gaps.push({ gap: k, x0: x, amount: amt });
        if (amt > 0.01) {
          kashidas.push({ gap: k, x0: x + extra, x1: x + extra + amt });
          extra += amt;
        }
      }
    }
    if (!joined && track) extra += track;
    x += extra;
  }
  return { glyphs, kashidas, gaps, width: x, s };
}

/**
 * Lay out a (possibly multi-line) text. Coordinates are in doc units with
 * y down; line 0 baseline sits at y = ascender. Returns glyph placements,
 * kashida strokes, connection gaps (for the kashida handles) and size.
 */
export function layoutText(fh, text, opts) {
  const o = { size: 120, lineHeight: 1.6, align: 'right', kashidaCurve: 0.5, ...opts };
  const s = o.size / fh.upem;
  const conn = connections(text);
  const lines = [];
  let off = 0;
  for (const ln of text.split('\n')) {
    lines.push({ text: ln, offset: off, ...shapeLine(fh, ln, off, text, o, conn) });
    off += ln.length + 1;
  }
  const width = Math.max(1, ...lines.map((l) => l.width));
  const asc = fh.ascender * s;
  const desc = -fh.descender * s;
  const lh = o.size * o.lineHeight;
  const glyphs = [], kashidas = [], gaps = [];
  lines.forEach((ln, li) => {
    const base = asc + li * lh;
    const dx = o.align === 'left' ? 0 : o.align === 'center' ? (width - ln.width) / 2 : width - ln.width;
    ln.x = dx; ln.baseline = base;
    for (const g of ln.glyphs) glyphs.push({ ...g, x: g.x + dx, y: g.y + base, line: li });
    for (const k of ln.kashidas) {
      kashidas.push({ ...k, x0: k.x0 + dx, x1: k.x1 + dx, y: base, line: li,
        d: toD(kashidaCmds(fh, s, k.x0 + dx, k.x1 + dx, base, o.kashidaCurve)) });
    }
    for (const g of ln.gaps) gaps.push({ ...g, x: g.x0 + dx, y: base, line: li });
  });
  const height = asc + (lines.length - 1) * lh + desc;
  return { glyphs, kashidas, gaps, lines, width, height, s, size: o.size };
}

/** Glyph outline (doc units) placed at its layout position. */
export function placedGlyphD(fh, g, s, precision = 2) {
  const cmds = glyphCmds(fh, g.gid, s);
  return toD(mapPoints(cmds, (x, y) => [x + g.x, y + g.y]), precision);
}

/** Whole text as one path data string (nonzero fill). */
export function layoutToD(fh, lay) {
  const parts = lay.glyphs.map((g) => placedGlyphD(fh, g, lay.s));
  for (const k of lay.kashidas) parts.push(k.d);
  return parts.filter(Boolean).join(' ');
}
