import { describe, it, expect } from 'vitest';
import { blendSteps, mixColor } from '../src/core/blend.js';
import { area } from '../src/core/boolean.js';

describe('blend', () => {
  it('creates intermediate shapes with growing area', () => {
    const a = 'M0,0 L10,0 L10,10 L0,10 Z';
    const b = 'M100,0 L160,0 L160,60 L100,60 Z';
    const s = blendSteps(a, b, 4);
    expect(s.length).toBe(4);
    const areas = s.map((x) => area(x.d));
    for (let i = 1; i < areas.length; i++) expect(areas[i]).toBeGreaterThan(areas[i - 1]);
  });
  it('handles different contour counts', () => {
    const ring = 'M0,0 L100,0 L100,100 L0,100 Z M30,30 L30,70 L70,70 L70,30 Z';
    const sq = 'M200,0 L300,0 L300,100 L200,100 Z';
    expect(blendSteps(ring, sq, 3).length).toBe(3);
  });
  it('mixes colours', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
