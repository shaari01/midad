// Arabic joining types (subset of Unicode ArabicShaping.txt covering Arabic,
// Persian and Urdu letters). Used to know where letters connect, which is
// where kashida (tatweel) may be inserted and where tracking must not split.

const R = 'R', D = 'D', C = 'C', T = 'T', U = 'U';

const RIGHT = 'آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯ';
const DUAL_RANGES = [
  [0x0626, 0x0626], [0x0628, 0x0628], [0x062A, 0x062E], [0x0633, 0x063F],
  [0x0641, 0x0647], [0x0649, 0x064A], [0x066E, 0x066F], [0x0678, 0x0687],
  [0x069A, 0x06BF], [0x06C1, 0x06C2], [0x06CC, 0x06CC], [0x06CE, 0x06CE],
  [0x06D0, 0x06D1], [0x06FA, 0x06FC], [0x06FF, 0x06FF],
];
const MARK_RANGES = [
  [0x0610, 0x061A], [0x064B, 0x065F], [0x0670, 0x0670], [0x06D6, 0x06DC],
  [0x06DF, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED], [0x08D3, 0x08FF],
];

export function joiningType(ch) {
  const cp = ch.codePointAt(0);
  if (cp === 0x0640 || cp === 0x200D) return C;
  if (RIGHT.includes(ch)) return R;
  for (const [a, b] of DUAL_RANGES) if (cp >= a && cp <= b) return D;
  for (const [a, b] of MARK_RANGES) if (cp >= a && cp <= b) return T;
  return U;
}

export const isMarkChar = (ch) => joiningType(ch) === T;

/**
 * For each code-unit index i, joinsNext[i] is true when the letter at i
 * connects to the next (logical) non-mark letter. Marks are skipped.
 */
export function connections(text) {
  const chars = [...text];
  // map char index -> code unit index
  const unitIdx = [];
  let u = 0;
  for (const ch of chars) { unitIdx.push(u); u += ch.length; }
  const res = new Array(text.length).fill(false);
  for (let i = 0; i < chars.length; i++) {
    const a = joiningType(chars[i]);
    if (!(a === D || a === C)) continue;
    let j = i + 1;
    while (j < chars.length && joiningType(chars[j]) === T) j++;
    if (j >= chars.length) continue;
    const b = joiningType(chars[j]);
    if (b === D || b === R || b === C) res[unitIdx[j] - 1] = true; // gap just before next letter
  }
  return res;
}
