// Shape Builder, knife and vector eraser.
import { worldD, worldBounds, toItem, P } from '../core/geometry.js';
import { regions, unite, knife, erase } from '../core/boolean.js';
import { pathObject, clone, I } from '../core/model.js';
import { transformD } from '../core/svgpath.js';
import { toast } from '../ui/dom.js';

const V = (cv) => [cv.z, 0, 0, cv.z, cv.tx, cv.ty];
const styleOf = (o) => clone(o.style || { fills: [{ type: 'solid', color: '#1b1b1b', opacity: 1 }], strokes: [], opacity: 1 });

export const ShapeBuilderTool = {
  id: 'builder',
  prepare(app) {
    const objs = app.doc.objects.filter((o) => app.selection.includes(o.id) && o.type !== 'image' && o.visible !== false);
    if (objs.length < 1) return null;
    const ds = objs.map((o) => worldD(o));
    const reg = regions(ds).map((r) => ({ ...r, item: toItem(r.d) }));
    const st = { ids: objs.map((o) => o.id), objs, reg, marked: new Set(), sig: app.selection.join(',') + app.lastSnap.length };
    app.toolState.sb = st;
    return st;
  },
  state(app) {
    const st = app.toolState.sb;
    if (st && st.sig === app.selection.join(',') + app.lastSnap.length) return st;
    return this.prepare(app);
  },
  overlay(cv) {
    const app = cv.app;
    if (app.selection.length < 2 && !app.toolState.sb) return `<text class="badge" x="50%" y="60">حدّد شكلين متداخلين أو أكثر</text>`;
    const st = this.state(app);
    if (!st) return '';
    const v = V(cv);
    return st.reg.map((r, i) => `<path class="region ${st.marked.has(i) ? (app.settings.sbMode === 'delete' ? 'del' : 'on') : ''}" d="${transformD(r.d, v)}"/>`).join('');
  },
  regionAt(st, x, y) {
    const pt = new P.Point(x, y);
    let best = -1, bestA = Infinity;
    st.reg.forEach((r, i) => { if (r.item.contains(pt) && r.area < bestA) { best = i; bestA = r.area; } });
    return best;
  },
  down(ev, cv) {
    const app = cv.app;
    if (app.selection.length < 2) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      if (hit) app.select([...app.selection, hit.id]);
      if (app.selection.length < 2) toast('المس الأشكال المتداخلة لتحديدها (اثنان أو أكثر)');
      return;
    }
    const st = this.state(app);
    if (!st) return;
    this.active = true;
    const i = this.regionAt(st, ev.x, ev.y);
    if (i >= 0) st.marked.add(i);
    cv.drawOverlay();
  },
  move(ev, cv) {
    if (!this.active) return;
    const st = cv.app.toolState.sb;
    const i = this.regionAt(st, ev.x, ev.y);
    if (i >= 0 && !st.marked.has(i)) { st.marked.add(i); cv.drawOverlay(); }
  },
  up(ev, cv) {
    if (!this.active) return;
    this.active = false;
    const app = cv.app;
    const st = app.toolState.sb;
    if (!st || !st.marked.size) return;
    const del = app.settings.sbMode === 'delete';
    const keep = st.reg.filter((_, i) => !st.marked.has(i));
    const marked = st.reg.filter((_, i) => st.marked.has(i));
    const out = [];
    if (!del) {
      const owner = Math.max(...marked.map((r) => r.owner));
      out.push(pathObject(unite(marked.map((r) => r.d)), { name: 'شكل مدموج', style: styleOf(st.objs[owner]) }));
    }
    for (const r of keep) out.push(pathObject(r.d, { name: 'جزء', style: styleOf(st.objs[r.owner]) }));
    const idx = Math.max(...st.ids.map((id) => app.doc.objects.findIndex((o) => o.id === id)));
    const below = app.doc.objects.slice(0, idx + 1).filter((o) => !st.ids.includes(o.id));
    const above = app.doc.objects.slice(idx + 1);
    app.doc.objects = [...below, ...out, ...above];
    app.selection = out.map((o) => o.id);
    app.toolState.sb = null;
    app.commit(del ? 'حذف مناطق' : 'دمج مناطق');
    app.render({ panels: true });
  },
  cancel(cv) { this.active = false; if (cv.app.toolState.sb) cv.app.toolState.sb.marked.clear(); cv.drawOverlay(); },
};

/** Freehand stroke collection shared by knife and eraser. */
function strokeTool(id, apply) {
  return {
    id,
    wantsCoalesced: true,
    down(ev, cv) { this.pts = [[ev.x, ev.y]]; },
    move(ev, cv) {
      if (!this.pts) return;
      const last = this.pts[this.pts.length - 1];
      if (Math.hypot(ev.x - last[0], ev.y - last[1]) * cv.z < 3) return;
      this.pts.push([ev.x, ev.y]);
      cv.drawOverlay();
    },
    up(ev, cv) {
      const pts = this.pts; this.pts = null;
      if (!pts || pts.length < 2) { cv.drawOverlay(); return; }
      apply(cv, pts);
    },
    cancel(cv) { this.pts = null; cv.drawOverlay(); },
    overlay(cv) {
      if (!this.pts) return '';
      const s = this.pts.map(([x, y]) => cv.toScreen(x, y).join(',')).join(' ');
      const w = id === 'eraser' ? (cv.app.settings.eraserSize || 30) : 2;
      return `<polyline class="${id}-line" points="${s}" stroke-width="${w}"/>`;
    },
  };
}

function targets(app, pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  const hits = (o) => { const b = worldBounds(o); return !(b.x > box.x + box.w || b.x + b.w < box.x || b.y > box.y + box.h || b.y + b.h < box.y); };
  const pool = app.selection.length ? app.selected : app.doc.objects;
  return pool.filter((o) => o.visible !== false && !o.locked && o.type !== 'image' && o.type !== 'group' && hits(o));
}

export const KnifeTool = strokeTool('knife', (cv, pts) => {
  const app = cv.app;
  let n = 0;
  const newIds = [];
  for (const o of targets(app, pts)) {
    const pieces = knife(worldD(o), pts, 0.8 / cv.z);
    if (pieces.length < 2) continue;
    const objs = pieces.map((d, i) => pathObject(d, { name: `${o.name || 'شكل'} ${i + 1}`, style: styleOf(o), m: I.slice() }));
    app.replace(o.id, objs);
    newIds.push(...objs.map((x) => x.id));
    n++;
  }
  if (!n) { toast('مرّر السكين عبر شكل بالكامل لقطعه'); cv.drawOverlay(); return; }
  app.selection = newIds;
  app.commit('قطع بالسكين');
  app.render({ panels: true });
});

export const EraserTool = strokeTool('eraser', (cv, pts) => {
  const app = cv.app;
  const w = (app.settings.eraserSize || 30) / cv.z;
  let n = 0;
  for (const o of targets(app, pts)) {
    const d = erase(worldD(o), pts, w);
    if (!d.trim()) { app.remove([o.id]); n++; continue; }
    const p = pathObject(d, { name: o.name, style: styleOf(o), m: I.slice(), id: o.type === 'path' ? o.id : undefined });
    if (!p.id) delete p.id;
    p.id = p.id || o.id;
    app.replace(o.id, p);
    n++;
  }
  if (n) { app.commit('ممحاة'); app.render({ panels: true }); } else cv.drawOverlay();
});
