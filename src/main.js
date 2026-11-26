import './styles.css';
import { App } from './ui/app.js';
import { Canvas, isTyping } from './ui/canvas.js';
import { h, btn, icon, toast, closeSheet } from './ui/dom.js';
import { renderProps, renderLayers } from './ui/panels.js';
import { openFileMenu, exportDialog, importGraphic, importSVGText } from './ui/menus.js';
import { TOOLS, TOOLBAR } from './tools/index.js';
import { Store } from './core/store.js';
import { registerUserFont, ensureFont } from './core/fonts.js';
import { textObject, groupObject, translate, mul, invert, uid } from './core/model.js';
import { preloadFonts, worldBounds, unionBounds } from './core/geometry.js';
import { toSVG, svgToPNG } from './core/export.js';
import { loadPhases } from './phases.js';

const app = new App();
window.midad = { app };

async function boot() {
  await loadPhases(app);
  // settings & user fonts
  Object.assign(app.settings, await Store.getMisc('settings', {}));
  app.saveSettings = () => Store.setMisc('settings', app.settings);
  app.palette = await Store.getMisc('palette', []);
  for (const f of await Store.listFonts()) registerUserFont(f);
  await ensureFont('amiri');

  buildUI();

  app.thumbFn = async (doc) => {
    if (!doc.objects.length) return null;
    const blob = await svgToPNG(toSVG(doc, { crop: 'artboard' }), 240);
    return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  };

  const lastId = await Store.getMisc('lastProject');
  const rec = lastId ? await Store.loadProject(lastId) : null;
  if (rec) await app.openProject(rec);
  else await starter();

  registerSW();
  handleLaunchFiles();
}

async function starter() {
  await app.newProject(1080, 1080, 'مشروعي الأول');
  const o = textObject({ text: 'بسم الله', size: 190, name: 'بسم الله' });
  app.add(o);
  const b = worldBounds(o);
  o.m = translate((1080 - b.w) / 2 - b.x, (1080 - b.h) / 2 - b.y);
  app.lastSnap = JSON.stringify(app.doc);
  app.selection = [];
  app.render({ panels: true });
}

/* ------------------------------ Layout ------------------------------ */
let canvas;
function buildUI() {
  const root = document.getElementById('app');
  root.innerHTML = '';
  const undoB = btn('undo', 'تراجع', () => app.undo(), { iconOnly: true });
  const redoB = btn('redo', 'إعادة', () => app.redo(), { iconOnly: true });
  const zoomLbl = h('span', { class: 'zoomlbl' }, '100%');
  const nameLbl = h('span', { class: 'pname' }, app.projectName);
  const installB = btn('install', 'تثبيت', () => doInstall(), { class: 'install hidden' });
  const modeB = btn('laptop', 'وضع الواجهة', () => toggleMode(), { iconOnly: true, class: 'modebtn' });
  const propsB = btn('props', 'الخصائص', () => toggleDrawer('props'), { class: 'mobile-only', iconOnly: true });
  const layersB = btn('layers', 'الطبقات', () => toggleDrawer('layers'), { class: 'mobile-only', iconOnly: true });

  const top = h('header', { class: 'topbar' },
    btn('menu', 'الملف', () => openFileMenu(app), { iconOnly: true }),
    h('div', { class: 'brand' }, h('b', {}, 'مِداد'), nameLbl),
    h('div', { class: 'spacer' }),
    undoB, redoB,
    h('div', { class: 'zoombox laptop-only' },
      btn('zoomOut', 'تصغير', () => zoomBy(1 / 1.25), { iconOnly: true, class: 'ghost' }), zoomLbl,
      btn('zoomIn', 'تكبير', () => zoomBy(1.25), { iconOnly: true, class: 'ghost' })),
    btn('fit', 'ملاءمة الشاشة', () => canvas.fit(), { iconOnly: true, class: 'fitbtn' }),
    installB, propsB, layersB, modeB,
    btn('export', 'تصدير', () => exportDialog(app), { class: 'primary', iconOnly: false }));

  const toolbar = h('nav', { class: 'toolbar', 'aria-label': 'الأدوات' });
  const stage = h('section', { class: 'stage' });
  const props = h('div', { class: 'props', id: 'props' });
  const layers = h('div', { class: 'layersbox', id: 'layers' });
  const side = h('aside', { class: 'side' },
    h('div', { class: 'tabs mobile-only' },
      h('button', { type: 'button', 'data-tab': 'props', onClick: () => toggleDrawer('props', true) }, 'الخصائص'),
      h('button', { type: 'button', 'data-tab': 'layers', onClick: () => toggleDrawer('layers', true) }, 'الطبقات'),
      btn('close', 'إغلاق', () => toggleDrawer(null), { iconOnly: true, class: 'ghost small' })),
    h('div', { class: 'pane pane-props' }, props),
    h('div', { class: 'pane pane-layers' }, h('h3', { class: 'laptop-only' }, 'الطبقات'), layers));
  const bottombar = h('nav', { class: 'bottombar', 'aria-label': 'الأدوات' });
  root.append(top, h('main', {}, toolbar, stage, side), bottombar);

  canvas = new Canvas(app, stage, TOOLS);
  window.midad.canvas = canvas;

  const renderToolbars = () => {
    const mk = (t) => btn(t.icon, t.label, () => app.setTool(t.id), { tool: t.id, active: app.tool === t.id, title: t.key ? `${t.label} (${t.key.toUpperCase()})` : t.label });
    toolbar.innerHTML = '';
    toolbar.append(...TOOLBAR.map(mk));
    bottombar.innerHTML = '';
    bottombar.append(...TOOLBAR.filter((t) => t.mobile).map(mk));
  };
  renderToolbars();

  const refreshPanels = () => {
    renderProps(app, props);
    renderLayers(app, layers);
    undoB.disabled = !app.undoStack.length;
    redoB.disabled = !app.redoStack.length;
    nameLbl.textContent = app.projectName;
  };
  app.on('panels', () => { if (!isTypingInPanel()) refreshPanels(); else app.pendingPanels = true; });
  app.on('history', () => { undoB.disabled = !app.undoStack.length; redoB.disabled = !app.redoStack.length; });
  app.on('tool', () => { renderToolbars(); canvas.draw(); });
  app.on('project', () => { nameLbl.textContent = app.projectName; refreshPanels(); });
  app.on('project-name', () => { nameLbl.textContent = app.projectName; });
  app.on('zoom', (z) => { zoomLbl.textContent = `${Math.round(z * 100)}%`; });
  app.on('editText', (opt) => {
    if (document.body.classList.contains('mobile')) toggleDrawer('props', true);
    refreshPanels();
    const ta = props.querySelector('textarea.textedit');
    if (ta) { ta.focus(); if (opt?.selectAll) ta.select(); }
  });
  app.on('group', () => groupSel());
  app.on('ungroup', () => ungroupSel());
  document.addEventListener('focusout', () => setTimeout(() => { if (app.pendingPanels && !isTypingInPanel()) { app.pendingPanels = false; refreshPanels(); } }, 0));

  function zoomBy(k) { const r = stage.getBoundingClientRect(); canvas.zoomAt(k, r.width / 2, r.height / 2); }

  // interface mode
  const applyMode = () => {
    const m = app.settings.mode === 'auto' ? (window.innerWidth < 900 ? 'mobile' : 'laptop') : app.settings.mode;
    document.body.classList.toggle('mobile', m === 'mobile');
    document.body.classList.toggle('laptop', m === 'laptop');
    modeB.replaceChildren(icon(m === 'mobile' ? 'phone' : 'laptop'));
    modeB.title = m === 'mobile' ? 'وضع الجوال (اضغط للتبديل)' : 'وضع اللابتوب (اضغط للتبديل)';
    setTimeout(() => canvas.draw(), 50);
  };
  function toggleMode() {
    const cur = document.body.classList.contains('mobile') ? 'mobile' : 'laptop';
    app.settings.mode = cur === 'mobile' ? 'laptop' : 'mobile';
    app.saveSettings();
    applyMode();
    toast(app.settings.mode === 'mobile' ? 'وضع الجوال: أدوات أقل في شريط سفلي' : 'وضع اللابتوب: كل الأدوات ظاهرة');
  }
  app.on('toggleMode', () => toggleMode());
  window.addEventListener('resize', () => { if (app.settings.mode === 'auto') applyMode(); });
  applyMode();

  function toggleDrawer(which, force) {
    const cur = document.body.dataset.drawer || '';
    const next = force ? which : cur === which ? '' : which;
    document.body.dataset.drawer = next || '';
    side.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === next));
    setTimeout(() => canvas.draw(), 50);
  }
  window.midad.toggleDrawer = toggleDrawer;

  // install prompt
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; installB.classList.remove('hidden'); });
  async function doInstall() {
    if (!deferred) return toast('من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»');
    deferred.prompt(); await deferred.userChoice; deferred = null; installB.classList.add('hidden');
  }

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (isTyping(e)) return;
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); app.undo(); return; }
    if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); app.redo(); return; }
    if (mod && k === 'd') { e.preventDefault(); app.duplicateSelection(); return; }
    if (mod && k === 's') { e.preventDefault(); app.saveNow().then(() => toast('حُفظ')); return; }
    if (mod && k === 'a') { e.preventDefault(); app.select(app.doc.objects.filter((o) => !o.locked && o.visible !== false).map((o) => o.id)); return; }
    if (mod && k === 'g') { e.preventDefault(); if (e.shiftKey) ungroupSel(); else groupSel(); return; }
    if (mod && k === '0') { e.preventDefault(); canvas.fit(); return; }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomBy(1.25); return; }
    if (mod && k === '-') { e.preventDefault(); zoomBy(0.8); return; }
    if (k === 'delete' || k === 'backspace') { if (app.tool === 'nodes' || app.tool === 'letters') { app.emit('deleteKey'); return; } e.preventDefault(); app.deleteSelection(); return; }
    if (k === 'escape') { closeSheet(); if (app.tool !== 'select') app.setTool('select'); else app.select([]); return; }
    if (k.startsWith('arrow') && app.selection.length) {
      e.preventDefault();
      const s = e.shiftKey ? 10 : 1;
      const d = { arrowleft: [-s, 0], arrowright: [s, 0], arrowup: [0, -s], arrowdown: [0, s] }[k];
      if (app.tool === 'letters' || app.tool === 'nodes') { app.emit('nudge', d); return; }
      app.selected.forEach((o) => { o.m = mul(translate(d[0], d[1]), o.m); });
      app.render(); clearTimeout(nudgeT); nudgeT = setTimeout(() => { app.commit('نقل'); app.render({ panels: true }); }, 400);
      return;
    }
    if (!mod && !e.altKey) { const t = TOOLBAR.find((x) => x.key === k); if (t) app.setTool(t.id); }
  });
  let nudgeT;

  // drag & drop
  stage.addEventListener('dragover', (e) => { e.preventDefault(); });
  stage.addEventListener('drop', async (e) => {
    e.preventDefault();
    await handleFiles([...e.dataTransfer.files]);
  });

  refreshPanels();
}

const isTypingInPanel = () => {
  const a = document.activeElement;
  return a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.closest('.side') && a.type !== 'range' && a.type !== 'checkbox' && a.type !== 'color';
};

export async function handleFiles(files) {
  const fonts = files.filter((f) => /\.(ttf|otf)$/i.test(f.name));
  const projects = files.filter((f) => /\.midad$/i.test(f.name));
  const graphics = files.filter((f) => /\.(svg|png|jpe?g|webp)$/i.test(f.name));
  if (fonts.length) {
    const { readFontName } = await import('./core/fonts.js');
    for (const f of fonts) {
      const data = await f.arrayBuffer();
      const rec = { id: uid('uf'), name: readFontName(data) || f.name, style: 'خط مستورد', data };
      registerUserFont(rec); await ensureFont(rec.id); await Store.saveFont(rec);
      toast(`أُضيف الخط «${rec.name}»`);
    }
  }
  if (graphics.length) await importGraphic(app, graphics);
  if (projects.length) {
    const { parseProjectFile } = await import('./core/export.js');
    const j = parseProjectFile(await projects[0].text());
    await app.saveNow();
    await app.openProject({ id: uid('prj'), name: j.name || projects[0].name, doc: j.doc });
  }
}

function groupSel() {
  const sel = app.doc.objects.filter((o) => app.selection.includes(o.id));
  if (sel.length < 2) return;
  const idx = app.doc.objects.indexOf(sel[sel.length - 1]);
  const g = groupObject(sel.map((o) => o));
  app.doc.objects.splice(idx + 1, 0, g);
  app.remove(sel.map((o) => o.id));
  app.selection = [g.id];
  app.commit('تجميع');
  app.render({ panels: true });
}

function ungroupSel() {
  const g = app.one;
  if (!g || g.type !== 'group') return;
  const kids = g.children.map((c) => ({ ...c, m: mul(g.m, c.m) }));
  app.replace(g.id, kids);
  app.selection = kids.map((c) => c.id);
  app.commit('فك التجميع');
  app.render({ panels: true });
}

async function registerSW() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  try {
    const { registerSW: reg } = await import('virtual:pwa-register');
    reg({
      immediate: true,
      onOfflineReady() { toast('البرنامج جاهز للعمل بلا إنترنت'); },
      onNeedRefresh() { toast('يتوفر تحديث، سيُطبَّق عند إعادة الفتح'); },
    });
  } catch (e) { console.warn('SW', e); }
}

function handleLaunchFiles() {
  if ('launchQueue' in window) {
    window.launchQueue.setConsumer(async (params) => {
      const files = await Promise.all((params.files || []).map((fh) => fh.getFile()));
      if (files.length) handleFiles(files);
    });
  }
}

window.addEventListener('beforeunload', () => { app.saveNow(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') app.saveNow(); });

boot().catch((e) => {
  console.error(e);
  document.getElementById('app').innerHTML = `<div class="fatal"><h2>تعذّر تشغيل البرنامج</h2><pre>${String(e && e.stack || e)}</pre></div>`;
});

export { app, preloadFonts, unionBounds, invert, importSVGText };
