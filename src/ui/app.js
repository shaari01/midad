// Application state: document, selection, tools, unlimited undo/redo and
// autosave to IndexedDB.
import { newDoc, clone, uid, mul, translate } from '../core/model.js';
import { Store } from '../core/store.js';
import { preloadFonts } from '../core/geometry.js';

export class App {
  constructor() {
    this.doc = newDoc();
    this.projectId = uid('prj');
    this.projectName = 'مشروع جديد';
    this.selection = [];
    this.tool = 'select';
    this.toolState = {}; // per-tool sub state (e.g. selected letter)
    this.listeners = new Map();
    this.undoStack = [];
    this.redoStack = [];
    this.lastSnap = JSON.stringify(this.doc);
    this.settings = { mode: 'auto', grid: false, gridSize: 20, snap: true, rulers: true, keepRatio: true, keepLive: true, mirror: 'none' };
    this.saveTimer = null;
  }

  on(ev, fn) { if (!this.listeners.has(ev)) this.listeners.set(ev, new Set()); this.listeners.get(ev).add(fn); return () => this.listeners.get(ev).delete(fn); }
  emit(ev, data) { this.listeners.get(ev)?.forEach((fn) => fn(data)); }

  /** Re-render canvas (cheap) and optionally panels. */
  render({ panels = false } = {}) { this.emit('render'); if (panels) this.emit('panels'); }

  get selected() { return this.selection.map((id) => this.findDeep(id)).filter(Boolean); }
  get one() { return this.selection.length === 1 ? this.selected[0] : null; }

  findDeep(id, list = this.doc.objects) {
    for (const o of list) {
      if (o.id === id) return o;
      if (o.children) { const f = this.findDeep(id, o.children); if (f) return f; }
    }
    return null;
  }

  select(ids, { add = false } = {}) {
    const arr = Array.isArray(ids) ? ids : ids ? [ids] : [];
    this.selection = add ? [...new Set([...this.selection, ...arr])] : arr;
    this.toolState = {};
    this.emit('selection');
    this.render({ panels: true });
  }

  setTool(t) {
    if (this.tool === t) return;
    this.emit('toolExit', this.tool);
    this.tool = t;
    this.toolState = {};
    this.emit('tool', t);
    this.render({ panels: true });
  }

  /** Show a change live with an apply / cancel bar instead of committing it
   *  straight away (Ali's rule: preview before applying any tool or effect). */
  preview(label = '', extra = {}) {
    if (!this.pending) this.pending = { sel: this.selection.slice() };
    Object.assign(this.pending, extra, { label });
    this.emit('preview', this.pending);
  }

  applyPreview() {
    const p = this.pending; if (!p) return;
    this.pending = null;
    p.onApply?.();
    this.commit(p.label);
    this.emit('preview', null);
    this.render({ panels: true });
  }

  cancelPreview() {
    const p = this.pending; if (!p) return;
    this.pending = null;
    this.selection = p.sel.slice();
    this.revert();
    this.emit('preview', null);
  }

  /** Record a history step if the document changed. */
  commit(label = '') {
    if (this.pending) { const p = this.pending; this.pending = null; this.emit('preview', null); if (!label) label = p.label; }
    const snap = JSON.stringify(this.doc);
    if (snap === this.lastSnap) return false;
    this.undoStack.push({ snap: this.lastSnap, label, sel: this.selection.slice() });
    // keep memory bounded on phones: at most 300 steps / ~120 MB of history
    let total = 0;
    for (let i = this.undoStack.length - 1; i >= 0; i--) {
      total += this.undoStack[i].snap.length;
      if (total > 60e6 || this.undoStack.length - i > 300) { this.undoStack.splice(0, i); break; }
    }
    this.redoStack = [];
    this.dirtySinceRecovery = true;
    this.lastSnap = snap;
    this.emit('history');
    this.scheduleSave();
    return true;
  }

  restore(snap, sel) {
    this.doc = JSON.parse(snap);
    this.lastSnap = snap;
    this.selection = (sel || []).filter((id) => this.findDeep(id));
    this.toolState = {};
    preloadFonts(this.doc.objects).then(() => this.render({ panels: true }));
    this.render({ panels: true });
    this.emit('history');
    this.scheduleSave();
  }

  undo() {
    if (this.pending) { this.cancelPreview(); return; }
    const s = this.undoStack.pop();
    if (!s) return;
    this.redoStack.push({ snap: this.lastSnap, label: s.label, sel: this.selection.slice() });
    this.restore(s.snap, s.sel);
  }

  redo() {
    const s = this.redoStack.pop();
    if (!s) return;
    this.undoStack.push({ snap: this.lastSnap, label: s.label, sel: this.selection.slice() });
    this.restore(s.snap, s.sel);
  }

  /** Discard uncommitted live edits (e.g. a cancelled preview). */
  revert() { this.doc = JSON.parse(this.lastSnap); this.render({ panels: true }); }

  add(obj, { select = true, index = null } = {}) {
    if (index == null) this.doc.objects.push(obj); else this.doc.objects.splice(index, 0, obj);
    if (select) this.selection = [obj.id];
    this.emit('selection');
    this.render({ panels: true });
    return obj;
  }

  replace(oldId, newObjs) {
    const i = this.doc.objects.findIndex((o) => o.id === oldId);
    if (i < 0) return;
    const arr = Array.isArray(newObjs) ? newObjs : [newObjs];
    this.doc.objects.splice(i, 1, ...arr);
  }

  remove(ids) {
    const set = new Set(ids);
    this.doc.objects = this.doc.objects.filter((o) => !set.has(o.id));
    this.selection = this.selection.filter((id) => !set.has(id));
  }

  deleteSelection() {
    if (!this.selection.length) return;
    this.remove(this.selection);
    this.selection = [];
    this.commit('حذف');
    this.render({ panels: true });
  }

  duplicateSelection() {
    const out = [];
    for (const o of this.selected) {
      const c = clone(o);
      c.id = uid(o.type[0]);
      c.m = mul(translate(24, 24), c.m);
      this.doc.objects.push(c);
      out.push(c.id);
    }
    this.selection = out;
    this.commit('تكرار');
    this.render({ panels: true });
  }

  arrange(where) {
    const objs = this.doc.objects;
    const sel = new Set(this.selection);
    if (where === 'top') this.doc.objects = [...objs.filter((o) => !sel.has(o.id)), ...objs.filter((o) => sel.has(o.id))];
    else if (where === 'bottom') this.doc.objects = [...objs.filter((o) => sel.has(o.id)), ...objs.filter((o) => !sel.has(o.id))];
    else if (where === 'up') {
      for (let i = objs.length - 2; i >= 0; i--) if (sel.has(objs[i].id) && !sel.has(objs[i + 1].id)) [objs[i], objs[i + 1]] = [objs[i + 1], objs[i]];
    } else if (where === 'down') {
      for (let i = 1; i < objs.length; i++) if (sel.has(objs[i].id) && !sel.has(objs[i - 1].id)) [objs[i], objs[i - 1]] = [objs[i - 1], objs[i]];
    }
    this.commit('ترتيب');
    this.render({ panels: true });
  }

  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), 700);
  }

  async saveNow() {
    clearTimeout(this.saveTimer);
    const rec = { id: this.projectId, name: this.projectName, updated: Date.now(), doc: this.doc };
    try {
      const prev = await Store.loadProject(this.projectId);
      rec.thumb = prev?.thumb || null;
      if (this.thumbFn) rec.thumb = await this.thumbFn(this.doc).catch(() => rec.thumb);
      await Store.saveProject(rec);
      await Store.setMisc('lastProject', this.projectId);
      this.emit('saved');
    } catch (e) { console.warn('autosave failed', e); }
  }

  /** Rolling safety copy «نسخة من …», separate from the project itself. */
  async saveRecovery(force = false) {
    if (!force && !this.dirtySinceRecovery) return;
    if (!this.doc?.objects?.length || String(this.projectId).startsWith('rec-')) return;
    this.dirtySinceRecovery = false;
    try {
      await Store.saveProject({ id: 'rec-' + this.projectId, name: 'نسخة من ' + this.projectName, updated: Date.now(), doc: this.doc, recovery: true, thumb: null });
    } catch (e) { console.warn('recovery save failed', e); }
  }

  async openProject(rec) {
    this.projectId = rec.id || uid('prj');
    this.projectName = rec.name || 'مشروع';
    this.doc = rec.doc;
    if (!this.doc.guides) this.doc.guides = [];
    this.lastSnap = JSON.stringify(this.doc);
    this.undoStack = []; this.redoStack = [];
    this.selection = [];
    await preloadFonts(this.doc.objects);
    this.emit('project');
    this.render({ panels: true });
    this.emit('history');
  }

  newProject(w, h, name = 'مشروع جديد') {
    return this.openProject({ id: uid('prj'), name, doc: newDoc(w, h) });
  }
}
