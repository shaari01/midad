import { describe, it, expect, beforeAll } from 'vitest';
import { setupFonts } from './helpers.js';
import { loadFont } from '../src/core/fonts.js';
import { textObject } from '../src/core/model.js';
import { explode, relink, lettersD, itemLocalCmds, alternatesFor, itemJoints, splitDots } from '../src/core/letters.js';
import { parsePath, cmdsBBox, smartStretch } from '../src/core/svgpath.js';
import { P } from '../src/core/geometry.js';

beforeAll(setupFonts);

describe('live letters', () => {
  it('explodes a word into letters + marks + kashida', async () => {
    const fh = await loadFont('amiri');
    const t = textObject({ text: 'بَسم', size: 100, kashida: { 2: 0.5 } });
    const w = explode(fh, t);
    expect(w.items.filter((i) => i.kind === 'base').length).toBe(3);
    expect(w.items.filter((i) => i.kind === 'mark').length).toBe(1);
    expect(w.items.filter((i) => i.kind === 'kashida').length).toBe(1);
    expect(lettersD(fh, w).length).toBeGreaterThan(100);
  });
  it('keeps per-letter edits when the font changes', async () => {
    const a = await loadFont('amiri');
    const b = await loadFont('arefruqaa');
    const w = explode(a, textObject({ text: 'محمد', size: 100 }));
    const target = w.items.find((i) => i.ch === 'ح');
    target.t.rot = 30; target.t.dy = -40;
    relink(b, w);
    const again = w.items.find((i) => i.ch === 'ح');
    expect(w.fontId).toBe('arefruqaa');
    expect(again.t.rot).toBe(30);
    expect(again.t.dy).toBe(-40);
  });
  it('smart stretch widens without changing the height (pen thickness)', async () => {
    const fh = await loadFont('amiri');
    const w = explode(fh, textObject({ text: 'ب', size: 200 }));
    const it = w.items[0];
    const b0 = cmdsBBox(itemLocalCmds(fh, w, it));
    it.t.stretchX = 150;
    const b1 = cmdsBBox(itemLocalCmds(fh, w, it));
    expect(b1.w).toBeCloseTo(b0.w + 150, 0);
    expect(b1.h).toBeCloseTo(b0.h, 3);
  });
  it('raw smartStretch moves only far-side points', () => {
    const c = parsePath('M0,0 L10,0 L10,10 L0,10 Z');
    const s = smartStretch(c, 'x', 5, 20);
    expect(cmdsBBox(s).w).toBe(30);
  });
  it('offers alternate forms for a letter', async () => {
    const fh = await loadFont('amiri');
    const w = explode(fh, textObject({ text: 'كتب', size: 100 }));
    const kaf = w.items.find((i) => i.ch === 'ك');
    const alts = alternatesFor(fh, w, kaf);
    expect(alts.length).toBeGreaterThan(2);
  });
  it('joints sit on the baseline at the letter edges', async () => {
    const fh = await loadFont('amiri');
    const w = explode(fh, textObject({ text: 'بب', size: 100 }));
    const [left, right] = [...w.items].sort((p, q) => p.bx - q.bx);
    const jl = itemJoints(fh, w, left), jr = itemJoints(fh, w, right);
    expect(Math.hypot(jl.entry[0] - jr.exit[0], jl.entry[1] - jr.exit[1])).toBeLessThan(1);
  });
  it('can split dots off a letter', async () => {
    const fh = await loadFont('amiri');
    const w = explode(fh, textObject({ text: 'ث', size: 200 }));
    const r = splitDots(fh, w, w.items[0], P);
    expect(r.dots.length).toBeGreaterThanOrEqual(2);
    const b = explode(fh, textObject({ text: 'ب', size: 200 }));
    expect(splitDots(fh, b, b.items[0], P).dots.length).toBe(1);
  });
});
