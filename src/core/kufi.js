// Square Kufic (الكوفي المربع): a grid of cells; filled cells make the shape.
import { uid, I, defaultStyle } from './model.js';
import { connections } from './joining.js';

export function kufiObject(cols = 21, rows = 21, cell = 30, props = {}) {
  return {
    id: uid('k'), type: 'kufi', name: 'كوفي مربع', visible: true, locked: false,
    cols, rows, cell, gap: 0, cells: '0'.repeat(cols * rows), m: I.slice(), style: defaultStyle('#1b1b1b'), ...props,
  };
}

export const getCell = (o, c, r) => (c >= 0 && r >= 0 && c < o.cols && r < o.rows ? o.cells[r * o.cols + c] === '1' : false);
export function setCells(o, list, v) {
  const a = o.cells.split('');
  for (const [c, r] of list) if (c >= 0 && r >= 0 && c < o.cols && r < o.rows) a[r * o.cols + c] = v ? '1' : '0';
  o.cells = a.join('');
}

/** Cells touched by a symmetric paint stroke. */
export function symmetric(o, c, r, mode) {
  const out = [[c, r]];
  const C = o.cols - 1, R = o.rows - 1;
  if (mode === 'mirror') out.push([C - c, r]);
  if (mode === 'mirror4') out.push([C - c, r], [c, R - r], [C - c, R - r]);
  if (mode === 'rot4') {
    // rotate about the centre (square grids)
    const n = Math.min(o.cols, o.rows) - 1;
    out.push([n - r, c], [n - c, n - r], [r, n - c]);
  }
  return out;
}

/** Path data: one rectangle per horizontal run of filled cells (or per cell with a gap). */
export function kufiD(o) {
  const s = o.cell;
  const g = (o.gap || 0) * s;
  let d = '';
  for (let r = 0; r < o.rows; r++) {
    if (g > 0) {
      for (let c = 0; c < o.cols; c++) if (getCell(o, c, r)) d += rect(c * s + g / 2, r * s + g / 2, s - g, s - g);
      continue;
    }
    let c = 0;
    while (c < o.cols) {
      if (!getCell(o, c, r)) { c++; continue; }
      let e = c;
      while (e + 1 < o.cols && getCell(o, e + 1, r)) e++;
      d += rect(c * s, r * s, (e - c + 1) * s, s);
      c = e + 1;
    }
  }
  return d.trim();
}
const rect = (x, y, w, h) => `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z `;

export function resize(o, cols, rows) {
  const out = '0'.repeat(cols * rows).split('');
  const dc = Math.floor((cols - o.cols) / 2), dr = Math.floor((rows - o.rows) / 2);
  for (let r = 0; r < o.rows; r++) for (let c = 0; c < o.cols; c++) {
    const nc = c + dc, nr = r + dr;
    if (nc >= 0 && nr >= 0 && nc < cols && nr < rows && getCell(o, c, r)) out[nr * cols + nc] = '1';
  }
  o.cols = cols; o.rows = rows; o.cells = out.join('');
}

export function transformGrid(o, kind) {
  const a = o.cells.split('');
  const get = (c, r) => a[r * o.cols + c] === '1';
  const res = new Array(a.length).fill('0');
  const n = Math.min(o.cols, o.rows) - 1;
  for (let r = 0; r < o.rows; r++) for (let c = 0; c < o.cols; c++) {
    let v = get(c, r);
    if (kind === 'invert') v = !v;
    if (kind === 'mirror') v = v || get(o.cols - 1 - c, r);
    if (kind === 'rot4' && c <= n && r <= n) v = v || get(r, n - c) || get(n - c, n - r) || get(n - r, c);
    res[r * o.cols + c] = v ? '1' : '0';
  }
  o.cells = res.join('');
}

/* ---------------- automatic writing ---------------- */
// Letter skeletons (rows top→bottom, '#' = filled). Bottom row = baseline.
// A starting suggestion only: square Kufic is an art; edit the result by hand.
const T = (h) => Array(h).fill('#');
const G = {
  'ا': T(7), 'أ': T(7), 'إ': T(7), 'آ': T(7), 'ٱ': T(7),
  'ل': T(7),
  'ك': ['###', '#..', '#..', '#..', '#..', '#..', '###'].map((r) => r.split('').reverse().join('')),
  'ط': ['#...', '#...', '#...', '#...', '####', '#..#', '####'], 'ظ': ['#...', '#...', '#...', '#...', '####', '#..#', '####'],
  'ب': T(3), 'ت': T(3), 'ث': T(3), 'ن': T(3), 'ي': T(3), 'ى': T(3), 'ئ': T(3), 'ی': T(3),
  'د': ['###', '..#', '###'], 'ذ': ['###', '..#', '###'],
  'ر': T(2), 'ز': T(2),
  'و': ['###', '#.#', '###'], 'ؤ': ['###', '#.#', '###'],
  'ه': ['####', '#..#', '####'], 'ة': ['####', '#..#', '####'],
  'م': ['###', '###'],
  'ع': ['#.#', '#.#', '###'], 'غ': ['#.#', '#.#', '###'],
  'ف': ['##', '##', '.#'], 'ق': ['##', '##', '.#'],
  'س': ['#.#.#', '#.#.#'], 'ش': ['#.#.#', '#.#.#'],
  'ص': ['#####', '#...#', '#####'], 'ض': ['#####', '#...#', '#####'],
  'ج': ['####', '#...', '####'], 'ح': ['####', '#...', '####'], 'خ': ['####', '#...', '####'],
  'ء': ['##', '#.'],
  ' ': ['...', '...', '...'].map(() => '...'),
};
// final/isolated forms with a tail
const FINAL = {
  'ب': ['#..#', '####'], 'ت': ['#..#', '####'], 'ث': ['#..#', '####'], 'ن': ['#..#', '#..#', '####'],
  'ي': ['#...', '#..#', '####'], 'ى': ['#...', '#..#', '####'], 'ی': ['#...', '#..#', '####'],
};

/** Lay a word out on the grid (right to left), connecting joined letters on the baseline. */
export function autoWrite(text, { height = 7, pad = 2 } = {}) {
  const chars = [...text.replace(/[ً-ْٰـ]/g, '')];
  const conn = connections(chars.join(''));
  const glyphs = chars.map((ch, i) => {
    const joins = conn[i];
    const g = (!joins && FINAL[ch]) || G[ch] || T(3);
    return { ch, rows: g.map((r) => (typeof r === 'string' ? r : '#')), joins };
  });
  const widths = glyphs.map((g) => Math.max(...g.rows.map((r) => r.length)));
  const totalW = widths.reduce((a, b) => a + b, 0) + Math.max(0, glyphs.length - 1);
  const cols = totalW + pad * 2;
  const rows = height + pad * 2;
  const grid = '0'.repeat(cols * rows).split('');
  const base = pad + height - 1;
  let x = cols - pad; // right edge (exclusive)
  glyphs.forEach((g, i) => {
    const w = widths[i];
    const left = x - w;
    g.rows.forEach((row, ri) => {
      const y = base - (g.rows.length - 1 - ri);
      for (let k = 0; k < row.length; k++) if (row[k] === '#') grid[y * cols + left + (w - row.length) + k] = '1';
    });
    // gap column: connector on the baseline when the letters join
    if (i < glyphs.length - 1) {
      if (g.joins && g.ch !== ' ') grid[base * cols + left - 1] = '1';
      x = left - 1;
    }
  });
  return { cols, rows, cells: grid.join('') };
}
