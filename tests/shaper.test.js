import { describe, it, expect, beforeAll } from 'vitest';
import { setupFonts } from './helpers.js';
import { loadFont, BUILTIN_FONTS } from '../src/core/fonts.js';
import { layoutText, layoutToD } from '../src/core/shaper.js';
import { connections, joiningType } from '../src/core/joining.js';
import { parsePath, cmdsBBox } from '../src/core/svgpath.js';

beforeAll(setupFonts);

describe('joining', () => {
  it('knows letter classes', () => {
    expect(joiningType('ب')).toBe('D');
    expect(joiningType('ا')).toBe('R');
    expect(joiningType('َ')).toBe('T');
    expect(joiningType('ء')).toBe('U');
  });
  it('finds connection gaps, skipping marks', () => {
    const c = connections('بَسم');
    // ب + fatha joins س: gap is before س (index 2) => c[1]
    expect(c[1]).toBe(true);
    expect(c[2]).toBe(true); // س joins م
    const d = connections('دار');
    expect(d.some(Boolean)).toBe(false); // د never joins left
  });
});

describe('shaping', () => {
  it('loads every bundled font', async () => {
    for (const f of BUILTIN_FONTS) {
      const fh = await loadFont(f.id);
      expect(fh.upem).toBeGreaterThan(0);
      const lay = layoutText(fh, 'محمد', { size: 100 });
      expect(lay.glyphs.length).toBeGreaterThan(0);
      expect(lay.width).toBeGreaterThan(20);
    }
  });
  it('uses contextual forms (not isolated) for connected text', async () => {
    const fh = await loadFont('amiri');
    const iso = layoutText(fh, 'ب', { size: 100 }).glyphs[0].gid;
    const ini = layoutText(fh, 'بب', { size: 100 }).glyphs.map((g) => g.gid);
    expect(ini).not.toContain(iso);
  });
  it('kashida widens the word and adds a curved stroke', async () => {
    const fh = await loadFont('amiri');
    const a = layoutText(fh, 'بسم', { size: 100 });
    expect(a.gaps.length).toBe(2);
    const b = layoutText(fh, 'بسم', { size: 100, kashida: { 0: 1 } });
    expect(b.width).toBeCloseTo(a.width + 100, 0);
    expect(b.kashidas.length).toBe(1);
    expect(b.kashidas[0].d).toMatch(/C/);
  });
  it('tracking never splits joined letters', async () => {
    const fh = await loadFont('amiri');
    const a = layoutText(fh, 'بسم', { size: 100 });
    const b = layoutText(fh, 'بسم', { size: 100, letterSpacing: 200 });
    expect(b.width).toBeCloseTo(a.width, 3);
    const c = layoutText(fh, 'دار', { size: 100, letterSpacing: 200 });
    const d = layoutText(fh, 'دار', { size: 100 });
    expect(c.width).toBeGreaterThan(d.width + 30);
  });
  it('multi-line layout with alignment', async () => {
    const fh = await loadFont('amiri');
    const lay = layoutText(fh, 'بسم الله\nالرحمن', { size: 80, align: 'right' });
    expect(lay.lines.length).toBe(2);
    const bb = cmdsBBox(parsePath(layoutToD(fh, lay)));
    expect(bb.h).toBeGreaterThan(80 * 1.2);
    expect(bb.x + bb.w).toBeLessThanOrEqual(lay.width + 20);
  });
});
