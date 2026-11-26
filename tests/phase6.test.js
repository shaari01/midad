import { describe, it, expect } from 'vitest';
import { traceLoops, makeMask, traceImageData } from '../src/core/trace.js';
import { bendAlong, pathTable } from '../src/core/textpath.js';
import { area } from '../src/core/boolean.js';
import { boxOf } from '../src/core/warp.js';

function rgba(w, h, fn) {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a] = fn(x, y); d.set([r, g, b, a], (y * w + x) * 4); }
  return d;
}

describe('image trace', () => {
  it('traces a filled square with a hole (ring) on white', () => {
    const d = rgba(40, 40, (x, y) => {
      const inOuter = x >= 5 && x < 35 && y >= 5 && y < 35, inHole = x >= 15 && x < 25 && y >= 15 && y < 25;
      return inOuter && !inHole ? [0, 0, 0, 255] : [255, 255, 255, 255];
    });
    const m = makeMask(d, 40, 40, { mode: 'auto' });
    expect(m.reduce((a, b) => a + b, 0)).toBe(900 - 100);
    expect(traceLoops(m, 40, 40).length).toBe(2);
    const path = traceImageData(d, 40, 40, { smooth: 0, despeckle: 0 });
    expect(Math.abs(area(path) - 800)).toBeLessThan(40);
  });
  it('uses transparency when the image has an alpha background', () => {
    const d = rgba(30, 30, (x, y) => (Math.hypot(x - 15, y - 15) < 10 ? [200, 30, 30, 255] : [0, 0, 0, 0]));
    const path = traceImageData(d, 30, 30, { mode: 'auto', smooth: 1 });
    // the outline runs through edge midpoints, so it sits about half a pixel inside
    const a = area(path);
    expect(a).toBeGreaterThan(Math.PI * 9.3 * 9.3);
    expect(a).toBeLessThan(Math.PI * 10.3 * 10.3);
  });
  it('drops small specks', () => {
    const d = rgba(30, 30, (x, y) => ((x === 3 && y === 3) || (x > 10 && x < 20 && y > 10 && y < 20) ? [0, 0, 0, 255] : [255, 255, 255, 255]));
    const path = traceImageData(d, 30, 30, { despeckle: 4, smooth: 0 });
    expect(Math.abs(area(path) - 81)).toBeLessThan(6);
  });
});

describe('text on path', () => {
  it('bends a bar along an arc keeping its length', () => {
    const bar = 'M0,90 L200,90 L200,100 L0,100 Z';
    const arc = 'M0,300 Q100,0 200,300';
    const t = pathTable(arc);
    expect(t.L).toBeGreaterThan(300);
    const out = bendAlong(bar, arc, { width: 200, base: 100, start: 0.5, size: 100 });
    const b = boxOf(out);
    expect(b.h).toBeGreaterThan(50); // it follows the curve
    expect(Math.abs(area(out) - 2000)).toBeLessThan(300);
  });
});
