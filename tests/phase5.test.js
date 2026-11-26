import { describe, it, expect } from 'vitest';
import { kufiObject, kufiD, autoWrite, transformGrid, setCells, getCell, symmetric, resize } from '../src/core/kufi.js';
import { strokeToPath, strokeRawD, streamline } from '../src/core/handwriting.js';
import { warpD, boxOf, mapper, defaultMesh } from '../src/core/warp.js';
import { area } from '../src/core/boolean.js';

describe('square kufic', () => {
  it('draws runs of cells as rectangles', () => {
    const o = kufiObject(5, 5, 10);
    setCells(o, [[0, 0], [1, 0], [2, 0], [4, 4]], true);
    const d = kufiD(o);
    expect(d.match(/M/g).length).toBe(2);
    expect(Math.round(area(d))).toBe(400);
  });
  it('symmetric painting and transforms', () => {
    const o = kufiObject(5, 5, 10);
    setCells(o, symmetric(o, 0, 1, 'mirror4'), true);
    expect(getCell(o, 4, 1) && getCell(o, 0, 3) && getCell(o, 4, 3)).toBe(true);
    transformGrid(o, 'invert');
    expect(getCell(o, 0, 1)).toBe(false);
    expect(getCell(o, 2, 2)).toBe(true);
  });
  it('resize keeps the drawing centred', () => {
    const o = kufiObject(3, 3, 10); setCells(o, [[1, 1]], true);
    resize(o, 7, 7);
    expect(getCell(o, 3, 3)).toBe(true);
  });
  it('auto-writes a joined word', () => {
    const g = autoWrite('الله');
    expect(g.cells.length).toBe(g.cols * g.rows);
    expect(g.cells.includes('1')).toBe(true);
    const o = kufiObject(g.cols, g.rows, 10, { cells: g.cells });
    expect(area(kufiD(o))).toBeGreaterThan(0);
  });
});

describe('hand writing', () => {
  const pts = Array.from({ length: 30 }, (_, i) => ({ x: i * 4, y: Math.sin(i / 4) * 20, p: 0.7 }));
  it('streamline moves part of the way', () => {
    const p = streamline({ x: 0, y: 0, p: 0.5 }, { x: 10, y: 0, p: 0.5 }, 0.5);
    expect(p.x).toBeCloseTo(5);
  });
  for (const pen of ['round', 'qalam', 'mono']) {
    it(`${pen} pen gives a single filled outline`, () => {
      expect(strokeRawD(pts, { pen, width: 10 }).length).toBeGreaterThan(0);
      const d = strokeToPath(pts, { pen, width: 10, angle: 35 });
      expect(d).toMatch(/^M/);
      expect(area(d)).toBeGreaterThan(200);
    });
  }
});

describe('envelope & warp', () => {
  const sq = 'M0,0 L100,0 L100,50 L0,50 Z';
  it('identity mesh keeps the shape', () => {
    const b = boxOf(sq);
    const f = mapper('mesh', 0, b, defaultMesh(b));
    const [x, y] = f([30, 20]);
    expect(x).toBeCloseTo(30); expect(y).toBeCloseTo(20);
  });
  it('arc lifts the middle', () => {
    const d = warpD(sq, { mode: 'arc', amount: 0.5 });
    const b = boxOf(d);
    expect(b.y).toBeLessThan(-5);
    expect(Math.abs(area(d) - 5000)).toBeLessThan(600);
  });
  it('circle envelope fits a circle', () => {
    const d = warpD(sq, { mode: 'circle' });
    const b = boxOf(d);
    expect(b.w).toBeCloseTo(100, 0);
    expect(b.h).toBeGreaterThan(90);
  });
  for (const mode of ['wave', 'bulge', 'rise', 'ring', 'square']) {
    it(`${mode} produces valid geometry`, () => {
      const d = warpD(sq, { mode, amount: 0.4 });
      expect(area(d)).toBeGreaterThan(100);
    });
  }
});
