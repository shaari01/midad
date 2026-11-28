// Spec v2 shell: interface detection (phone / tablet / laptop), the start
// screen, the phone's layers strip, the isolation page, the zoom lens and
// full screen.
import { h, btn, icon, toast, openSheet, closeSheet, slider } from './dom.js';
import { tr } from './i18n.js';
import { Store } from '../core/store.js';
import { toSVG } from '../core/export.js';
import { clone } from '../core/model.js';
import { newProjectDialog, openProjectFile, importGraphic } from './menus.js';
import { openSettings } from './chrome.js';
import { openLibrary } from './library.js';

/* ------------------------------ interface ------------------------------ */
/** phone < 600 px; laptop ≥ 1200 px with a mouse; tablet in between (or a big touch screen). */
export function detectMode(setting) {
  if (setting && setting !== 'auto') return setting;
  const w = Math.min(window.innerWidth, screen.width || window.innerWidth);
  const fine = matchMedia('(pointer: fine)').matches;
  if (window.innerWidth < 600 || w < 600) return 'mobile';
  if (window.innerWidth >= 1200 && fine) return 'laptop';
  return 'tablet';
}

export function goFullscreen() {
  if (document.fullscreenElement || !document.body.classList.contains('mobile') && !document.body.classList.contains('tablet')) return;
  if (!matchMedia('(pointer: coarse)').matches) return;
  document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {});
}

/* ------------------------------ confirm ------------------------------ */
export function confirmSheet(msg, yes = 'نعم', no = 'لا') {
  return new Promise((res) => {
    const done = (v) => { closeSheet(); res(v); };
    openSheet('تأكيد', h('div', { class: 'confirm' }, h('p', {}, msg),
      h('div', { class: 'brow' }, btn('check', yes, () => done(true), { class: 'primary' }), btn('close', no, () => done(false)))),
    { onClose: () => res(false) });
  });
}

/* ------------------------------ start screen ------------------------------ */
let startTok = 0;
export async function openStart(app) {
  closeStart();
  const tok = startTok;
  const list = await Store.listProjects();
  if (tok !== startTok) return; // closed while loading
  const go = async (fn) => { await fn(); closeStart(); goFullscreen(); };
  const cards = h('div', { class: 'stcards' }, list.slice(0, 30).map((p) => h('button', {
    type: 'button', class: 'stcard', onClick: () => go(async () => { if (p.id !== app.projectId) { await app.saveNow(); await app.openProject(await Store.loadProject(p.id)); } }),
  }, p.thumb ? h('img', { src: p.thumb, alt: '' }) : h('span', { class: 'stph' }, 'ك'), h('b', {}, p.name), h('small', {}, new Date(p.updated).toLocaleDateString('ar')))));
  const el = h('div', { class: 'startscreen', role: 'dialog', 'aria-label': 'الشاشة الأم' },
    h('div', { class: 'sthead' }, h('span', { class: 'stlogo' }, 'ك'), h('div', {}, h('h1', {}, 'كلمة'), h('small', {}, 'برنامج الخط العربي'))),
    h('div', { class: 'stactions' },
      btn('new', 'مشروع جديد', () => { closeStart(); goFullscreen(); newProjectDialog(app); }, { class: 'primary' }),
      btn('fileInput', 'تعديل مشروع', () => go(() => openProjectFile(app))),
      btn('settings', 'إعدادات التطبيق', () => openSettings(app))),
    h('h2', {}, 'مشاريعي السابقة'),
    list.length ? cards : h('p', { class: 'hint' }, 'لا مشاريع محفوظة بعد. ابدأ مشروعًا جديدًا.'),
    app.projectId ? btn('right', 'متابعة: ' + app.projectName, () => { closeStart(); goFullscreen(); }, { class: 'stcontinue' }) : null);
  document.body.append(el);
}
export function closeStart() { startTok++; document.querySelector('.startscreen')?.remove(); }

/* ------------------------------ layers strip (phone) ------------------------------ */
const thumbCache = new Map();
export const Strip = { busy: false };
function thumbOf(app, o) {
  const key = JSON.stringify(o);
  const c = thumbCache.get(o.id);
  if (c && c.key === key) return c.url;
  let url = '';
  try { url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(toSVG(app.doc, { objects: [{ ...o, visible: true }], crop: 'content', background: false })); } catch { /* ignore */ }
  thumbCache.set(o.id, { key, url });
  return url;
}

export function renderLayerStrip(app, host) {
  host.innerHTML = '';
  const objs = [...app.doc.objects].reverse(); // top layer first
  host.append(h('button', { type: 'button', class: 'lsadd', title: 'إضافة طبقة', 'aria-label': 'إضافة طبقة', onClick: (e) => addMenu(app, e.currentTarget) }, icon('plus', 22)));
  for (const o of objs) {
    const sel = app.selection.includes(o.id);
    const card = h('div', { class: `lscard ${sel ? 'on' : ''} ${o.visible === false ? 'off' : ''}`, 'data-id': o.id },
      h('div', { class: 'lsthumb' }, h('img', { src: thumbOf(app, o), alt: '', draggable: false })),
      h('small', {}, o.name || o.type),
      o.locked ? h('span', { class: 'lslock' }, icon('lock', 12)) : null,
      h('button', { type: 'button', class: 'lsmore', title: 'خيارات الطبقة', 'aria-label': 'خيارات الطبقة', onClick: (e) => { e.stopPropagation(); layerMenu(app, o, e.currentTarget); } }, icon('more', 16)));
    dragToReorder(app, host, card, o);
    host.append(card);
  }
}

function popMenu(anchor, items) {
  document.querySelector('.popmenu')?.remove();
  const m = h('div', { class: 'popmenu', role: 'menu' }, items.filter(Boolean).map(([ic, label, run]) =>
    h('button', { type: 'button', class: 'cmi', onClick: () => { m.remove(); run(); } }, icon(ic, 18), h('span', {}, label))));
  document.body.append(m);
  const r = anchor.getBoundingClientRect(), mr = m.getBoundingClientRect();
  m.style.left = `${Math.max(6, Math.min(r.left, innerWidth - mr.width - 6))}px`;
  m.style.top = `${Math.max(6, r.top - mr.height - 6)}px`;
  setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('pointerdown', off, true); } }, true), 0);
}

function addMenu(app, anchor) {
  popMenu(anchor, [
    ['text', 'طبقة نص', () => app.emit('newTextLayer')],
    ['imageUp', 'صورة من الجهاز', () => importGraphic(app)],
    ['library', 'من مكتبتي', () => openLibrary(app)],
  ]);
}

function layerMenu(app, o, anchor) {
  const sel = () => app.select(o.id);
  popMenu(anchor, [
    ['plus', 'إضافة طبقة نص', () => app.emit('newTextLayer')],
    ['minus', 'حذف', () => { sel(); app.deleteSelection(); }],
    ['copy', 'تكرار', () => { sel(); app.duplicateSelection(); }],
    [o.visible === false ? 'eye' : 'eyeOff', o.visible === false ? 'إظهار' : 'إخفاء', () => { o.visible = o.visible === false; app.commit('إظهار/إخفاء'); app.render({ panels: true }); }],
    [o.locked ? 'unlock' : 'lock', o.locked ? 'فتح القفل' : 'قفل', () => { o.locked = !o.locked; if (o.locked) app.selection = app.selection.filter((i) => i !== o.id); app.commit('قفل'); app.render({ panels: true }); }],
    ['front', 'تقديم للأمام', () => { sel(); app.arrange('top'); }],
    ['back', 'إرجاع للخلف', () => { sel(); app.arrange('bottom'); }],
  ]);
}

/** Tap selects; a horizontal swipe scrolls the strip; a long press then drag reorders. */
function dragToReorder(app, host, card, o) {
  let st = null, timer = 0;
  card.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.lsmore')) return;
    st = { x: e.clientX, y: e.clientY, sl: host.scrollLeft, moved: false, drag: false, id: e.pointerId };
    try { card.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    Strip.busy = true;
    timer = setTimeout(() => { if (st && !st.moved) { st.drag = true; card.classList.add('dragging'); navigator.vibrate?.(20); } }, 380);
  });
  card.addEventListener('pointermove', (e) => {
    if (!st) return;
    const dx = e.clientX - st.x;
    if (Math.abs(dx) > 8 || Math.abs(e.clientY - st.y) > 8) st.moved = true;
    if (st.drag) { card.style.transform = `translateX(${dx}px)`; return; }
    if (st.moved) { clearTimeout(timer); host.scrollLeft = st.sl - dx * (getComputedStyle(host).direction === 'rtl' ? 1 : 1); }
  });
  const end = (e) => {
    clearTimeout(timer);
    Strip.busy = false;
    if (!st) return;
    const s = st; st = null;
    card.classList.remove('dragging'); card.style.transform = '';
    if (s.drag) {
      const target = document.elementsFromPoint(e.clientX, e.clientY).map((el) => el.closest?.('.lscard')).find((c) => c && c.dataset.id !== o.id);
      if (target) {
        const objs = app.doc.objects;
        const from = objs.findIndex((x) => x.id === o.id);
        const to = objs.findIndex((x) => x.id === target.dataset.id);
        if (from >= 0 && to >= 0) { const [m] = objs.splice(from, 1); objs.splice(to, 0, m); app.commit('ترتيب الطبقات'); app.render({ panels: true }); }
      }
      return;
    }
    if (!s.moved) { if (!o.locked) app.select(o.id); else toast('الطبقة مقفلة'); }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', () => { clearTimeout(timer); Strip.busy = false; st = null; card.classList.remove('dragging'); card.style.transform = ''; });
}

/* ------------------------------ zoom lens ------------------------------ */
export function lensPopover(anchor, canvas, stage) {
  document.querySelector('.lenspop')?.remove();
  const toZ = (v) => Math.pow(2, v / 50); // −150..+150 → 12.5 % .. 800 %
  const fromZ = (z) => Math.round(Math.log2(z) * 50);
  const lbl = h('b', {}, `${Math.round(canvas.z * 100)}%`);
  const rng = h('input', { type: 'range', min: -150, max: 150, value: fromZ(canvas.z), 'aria-label': 'التكبير' });
  const setZ = (z) => { const r = stage.getBoundingClientRect(); canvas.zoomAt(z / canvas.z, r.width / 2, r.height / 2); lbl.textContent = `${Math.round(canvas.z * 100)}%`; };
  rng.addEventListener('input', () => setZ(toZ(Number(rng.value))));
  const pop = h('div', { class: 'lenspop' },
    btn('zoomOut', 'تصغير', () => { setZ(canvas.z / 1.25); rng.value = fromZ(canvas.z); }, { iconOnly: true, class: 'ghost small' }),
    rng,
    btn('zoomIn', 'تكبير', () => { setZ(canvas.z * 1.25); rng.value = fromZ(canvas.z); }, { iconOnly: true, class: 'ghost small' }),
    lbl,
    btn('fit', 'ملاءمة الشاشة', () => { canvas.fit(); lbl.textContent = `${Math.round(canvas.z * 100)}%`; rng.value = fromZ(canvas.z); }, { iconOnly: true, class: 'ghost small' }),
    btn(null, '100%', () => { setZ(1); rng.value = 0; }, { class: 'ghost small' }));
  document.body.append(pop);
  const r = anchor.getBoundingClientRect();
  pop.style.top = `${r.bottom + 6}px`;
  setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!pop.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) { pop.remove(); document.removeEventListener('pointerdown', off, true); } }, true), 0);
}

/* ------------------------------ isolation page ------------------------------ */
// One tool on one layer, with ✕ (discard, after confirmation) and ✓ (apply).
export const Iso = { active: null };

export function enterIsolation(app, it) {
  if (Iso.active) return true;
  if (it.needSel && !app.selection.length) { toast('اختر طبقة من شريط الطبقات أولًا'); return true; }
  if (app.pending) app.applyPreview();
  app.commit();
  Iso.active = {
    label: it.label, sections: it.iso || [], snap: app.lastSnap, sel: app.selection.slice(),
    undoLen: app.undoStack.length, prevTool: app.tool,
  };
  app.iso = Iso.active;
  document.body.classList.add('isolate');
  if (Iso.skipPop) Iso.pushAfter = true; else history.pushState({ iso: 1 }, '');
  window.midad.toggleDrawer?.('props', true);
  app.emit('isolate', true);
  if (it.tool) app.setTool(it.tool); else it.run?.();
  setTimeout(() => window.midad.canvas?.fit?.(), 60);
  app.render({ panels: true });
  return true;
}

export function applyIsolation(app) {
  const a = Iso.active; if (!a) return;
  if (app.pending) app.applyPreview();
  // squash every step taken inside the page into one history step
  const steps = app.undoStack.length - a.undoLen;
  if (steps > 1) app.undoStack.splice(a.undoLen + 1, steps - 1);
  if (steps >= 1) app.undoStack[a.undoLen].label = a.label;
  app.commit(a.label);
  leave(app);
}

export async function cancelIsolation(app, ask = true) {
  const a = Iso.active; if (!a) return;
  const changed = JSON.stringify(app.doc) !== a.snap || app.pending;
  if (ask && changed && !(await confirmSheet('تجاهل كل التغييرات والعودة؟', 'تجاهل', 'متابعة العمل'))) return false;
  app.pending = null; app.emit('preview', null);
  app.undoStack.length = a.undoLen;
  app.redoStack = [];
  app.restore(a.snap, a.sel);
  leave(app);
  return true;
}

function leave(app) {
  Iso.active = null; app.iso = null;
  document.body.classList.remove('isolate');
  window.midad.toggleDrawer?.(null);
  if (history.state?.iso) { Iso.skipPop = true; history.back(); }
  app.setTool('select');
  app.emit('isolate', false);
  app.render({ panels: true });
}

window.addEventListener('popstate', async () => {
  const app = window.midad?.app;
  // our own history.back() after ✓ / ✕: not a back-button press
  if (Iso.skipPop) { Iso.skipPop = false; if (Iso.pushAfter) { Iso.pushAfter = false; history.pushState({ iso: 1 }, ''); } return; }
  if (!Iso.active || !app) return;
  // Android back button = ✕ (with confirmation)
  const ok = await cancelIsolation(app, true);
  if (ok === false) history.pushState({ iso: 1 }, '');
});

export function isoTopBar(app, canvas, stage) {
  let lens;
  const bar = h('header', { class: 'isotop' },
    btn('close', 'تجاهل', () => cancelIsolation(app), { iconOnly: true, class: 'isono', title: 'تجاهل التغييرات والعودة' }),
    btn('undo', 'تراجع', () => app.undo(), { iconOnly: true }),
    btn('redo', 'تقدّم', () => app.redo(), { iconOnly: true }),
    lens = btn('lens', 'عدسة', () => lensPopover(lens, canvas, stage), { iconOnly: true, title: 'تكبير وتصغير وملاءمة الشاشة' }),
    btn('pan', 'تحريك الشاشة', () => { const a = Iso.active; if (!a) return; if (app.tool === 'pan') app.setTool(a.isoTool || 'select'); else { a.isoTool = app.tool; app.setTool('pan'); } }, { iconOnly: true, tool: 'pan', title: 'تحريك الشاشة دون تعديل' }),
    btn('select', 'تحديد', () => { const a = Iso.active; app.setTool(a?.isoTool && a.isoTool !== 'pan' ? a.isoTool : 'select'); }, { iconOnly: true, title: 'العودة إلى الأداة أو التحديد' }),
    h('span', { class: 'isolbl' }),
    btn('check', 'اعتماد', () => applyIsolation(app), { iconOnly: true, class: 'isook', title: 'اعتماد التغيير والعودة' }));
  app.on('isolate', (on) => { if (on) { bar.querySelector('.isolbl').textContent = tr(Iso.active.label); Iso.active.isoTool = app.tool; } });
  app.on('tool', (t) => { bar.querySelector('[data-tool="pan"]')?.classList.toggle('active', t === 'pan'); if (Iso.active && t !== 'pan' && t !== 'select') Iso.active.isoTool = t; });
  return bar;
}

/** Ghost slider and section filter for the settings sheet in isolation. */
export function isoSheetHeader(app) {
  const s = app.settings;
  return h('div', { class: 'isoghost' }, slider('شفافية بقية التصميم', Math.round((s.isoGhost ?? 0.3) * 100), {
    min: 0, max: 100, unit: '%',
    onInput: (v) => { s.isoGhost = v / 100; window.midad.canvas.draw(); },
    onChange: () => app.saveSettings?.(),
  }));
}

/** Hide panel sections that are not about the isolated tool. */
export function filterIsoSections(app, host) {
  const a = Iso.active;
  const secs = [...host.querySelectorAll('.psec')];
  secs.forEach((x) => { x.hidden = false; });
  if (!a) return;
  const keep = (a.sections || []).map((t) => tr(t));
  const match = (x) => { const t = x.querySelector('h3')?.textContent || ''; return keep.some((k) => t.startsWith(k)); };
  if (!keep.length) { secs.forEach((x) => { x.hidden = true; }); return; }
  if (secs.some(match)) secs.forEach((x) => { x.hidden = !match(x); });
}

export { clone };
