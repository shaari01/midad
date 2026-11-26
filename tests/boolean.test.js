import { describe, it, expect } from 'vitest';
import { unite, subtractFront, intersectAll, excludeAll, regions, islands, knife, erase, area } from '../src/core/boolean.js';

const sq = (x, y, s) => `M${x},${y} L${x + s},${y} L${x + s},${y + s} L${x},${y + s} Z`;
const A = sq(0, 0, 100), B = sq(50, 50, 100);

describe('booleans', () => {
  it('unite / minus front / intersect / exclude areas', () => {
    expect(area(unite([A, B]))).toBeCloseTo(17500, 0);
    expect(area(subtractFront([A, B]))).toBeCloseTo(7500, 0);
    expect(area(intersectAll([A, B]))).toBeCloseTo(2500, 0);
    expect(area(excludeAll([A, B]))).toBeCloseTo(15000, 0);
  });
  it('divides into 3 atomic regions with owners', () => {
    const r = regions([A, B]);
    expect(r.length).toBe(3);
    const mid = r.find((x) => Math.abs(x.area - 2500) < 1);
    expect(mid.owner).toBe(1);
  });
  it('splits islands', () => {
    expect(islands(`${sq(0, 0, 10)} ${sq(50, 0, 10)}`).length).toBe(2);
    // a ring stays one island (outer + hole)
    const ring = `M0,0 L100,0 L100,100 L0,100 Z M20,20 L20,80 L80,80 L80,20 Z`;
    expect(islands(ring).length).toBe(1);
  });
  it('knife cuts a square in two', () => {
    const parts = knife(A, [[50, -20], [50, 120]]);
    expect(parts.length).toBe(2);
  });
  it('eraser removes a band', () => {
    const d = erase(A, [[-10, 50], [110, 50]], 20);
    expect(area(d)).toBeCloseTo(8000, -2);
  });
});
