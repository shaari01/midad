import './styles.css';
import { App } from './ui/app.js';
import { Canvas, isTyping } from './ui/canvas.js';
import { tr } from './ui/i18n.js';
import { h, btn, icon, toast, closeSheet, openSheet } from './ui/dom.js';
import { renderProps, renderLayers } from './ui/panels.js';
import { openFileMenu, exportDialog, importGraphic, importSVGText, newProjectDialog, projectsDialog } from './ui/menus.js';
import { CATS, catItems, renderCat, setRerender, openHome, closeHome, applyLook, openContextMenu, closeContext, installTooltips, Clip, flip, shortcutsSheet } from './ui/chrome.js';
import { convertSelection } from './ui/panels.js';
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
  applyLook(app);
  const undoB = btn('undo', 'تراجع', () => app.undo(), { iconOnly: true, title: 'تراجع (Ctrl+Z)' });
  const redoB = btn('redo', 'إعادة', () => app.redo(), { iconOnly: true, title: 'إعادة (Ctrl+Y)' });
  const zoomLbl = h('span', { class: 'zoomlbl' }, '100%');
  const nameLbl = h('span', { class: 'pname' }, app.projectName);
  const installB = btn('install', 'تثبيت', () => doInstall(), { class: 'install hidden', iconOnly: true });
  const propsB = btn('props', 'الخصائص', () => toggleDrawer('props'), { class: 'mobile-only', iconOnly: true });
  const layersB = btn('layers', 'الطبقات', () => toggleDrawer('layers'), { class: 'mobile-only', iconOnly: true });
  const catbar = h('nav', { class: 'catbar', 'aria-label': 'قوائم الأدوات' });

  const top = h('header', { class: 'topbar' },
    btn('home', 'الرئيسية', () => openHome(app), { iconOnly: true, class: 'homebtn', title: 'الرئيسية: جديد، فتح، حفظ، استيراد، تصدير، الإعدادات' }),
    h('div', { class: 'brand' }, h('b', {}, 'مِداد'), nameLbl),
    h('div', { class: 'catslot laptop-only' }),
    h('div', { class: 'spacer' }),
    undoB, redoB,
    h('div', { class: 'zoombox laptop-only' },
      btn('zoomOut', 'تصغير', () => zoomBy(1 / 1.25), { iconOnly: true, class: 'ghost' }), zoomLbl,
      btn('zoomIn', 'تكبير', () => zoomBy(1.25), { iconOnly: true, class: 'ghost' })),
    btn('fit', 'ملاءمة الشاشة', () => canvas.fit(), { iconOnly: true, class: 'fitbtn' }),
    installB, propsB, layersB,
    btn('export', 'تصدير', () => exportDialog(app), { class: 'primary', iconOnly: true }));

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
  const toolrow = h('nav', { class: 'toolrow', 'aria-label': 'الأدوات' });
  const bottombar = h('div', { class: 'bottombar' }, toolrow);
  root.append(top, h('main', {}, toolbar, stage, side), bottombar);

  canvas = new Canvas(app, stage, TOOLS);
  window.midad.canvas = canvas;
  stage.addEventListener('contextmenu', (e) => { e.preventDefault(); openContextMenu(app, canvas, e); });

  // which category holds the current tool
  const catOfTool = (t) => CATS.find((c) => catItems(app, c.id).some((i) => i.tool === t))?.id;
  const renderToolbars = () => {
    const cur = app.settings.cat || 'text';
    catbar.innerHTML = '';
    for (const c of CATS) {
      const b = btn(c.icon, c.label, () => { app.settings.cat = c.id; app.saveSettings?.(); renderToolbars(); }, { active: cur === c.id, title: c.label, class: 'cat' });
      catbar.append(b);
    }
    const slot = document.body.classList.contains('mobile') ? bottombar : top.querySelector('.catslot');
    if (catbar.parentElement !== slot) slot.append(catbar);
    renderCat(app, toolbar, cur);
    renderCat(app, toolrow, cur, { horizontal: true });
  };
  setRerender(() => renderToolbars());
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
  app.on('tool', (t) => { const c = catOfTool(t); if (c && c !== (app.settings.cat || 'text') && t !== 'select') app.settings.cat = c; renderToolbars(); canvas.draw(); });
  app.on('selection', () => renderToolbars());
  app.on('history', () => renderToolbars());
  app.on('rebuildUI', async () => { await app.saveNow(); await Store.setMisc('settings', app.settings); location.reload(); });
  app.on('applyMode', () => applyMode());
  app.on('project', () => { nameLbl.textContent = app.projectName; refreshPanels(); });
  app.on('project-name', () => { nameLbl.textContent = app.projectName; });
  app.on('zoom', (z) => { zoomLbl.textContent = `${Math.round(z * 100)}%`; });
  app.on('editText', (opt) => {
    if (document.body.classList.contains('mobile')) toggleDrawer('props', true);
    refreshPanels();
    const ta = props.querySelector('textarea.textedit');
    if (ta) {
      ta.focus();
      // only the placeholder text is selected (to be replaced); real text keeps the caret at the end
      if (opt?.selectAll && ta.value === 'اكتب هنا') ta.select();
      else { const n = ta.value.length; ta.setSelectionRange(n, n); }
    }
  });
  app.on('newTextLayer', () => {
    const last = app.lastTextProps || {};
    const o = textObject({ text: 'اكتب هنا', fontId: last.fontId || 'amiri', size: last.size || Math.round(app.doc.width / 7), name: 'نص جديد' });
    app.add(o);
    const b = worldBounds(o);
    o.m = translate((app.doc.width - b.w) / 2 - b.x, (app.doc.height - b.h) / 2 - b.y);
    app.commit('طبقة نص جديدة');
    app.render({ panels: true });
    app.emit('editText', { selectAll: true });
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
    renderToolbars();
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
    if (mod && k === 'c') { e.preventDefault(); Clip.copy(app); return; }
    if (mod && k === 'x') { e.preventDefault(); Clip.cut(app); return; }
    if (mod && k === 'v') { e.preventDefault(); Clip.paste(app); return; }
    if (mod && k === 's' && e.shiftKey) { e.preventDefault(); openHome(app); document.querySelectorAll('.hrow')[4]?.click(); return; }
    if (mod && k === 's') { e.preventDefault(); app.saveNow().then(() => toast('حُفظ')); return; }
    if (mod && k === 'o' && e.shiftKey) { e.preventDefault(); convertSelection(app); return; }
    if (mod && k === 'o') { e.preventDefault(); projectsDialog(app); return; }
    if (mod && k === 'n') { e.preventDefault(); newProjectDialog(app); return; }
    if (mod && k === 'e') { e.preventDefault(); exportDialog(app); return; }
    if (mod && k === 'r') { e.preventDefault(); app.settings.rulers = !app.settings.rulers; app.saveSettings(); canvas.draw(); renderToolbars(); return; }
    if (mod && (k === "'" || e.code === 'Quote')) { e.preventDefault(); app.settings.grid = !app.settings.grid; app.saveSettings(); canvas.draw(); renderToolbars(); return; }
    if (mod && e.code === 'BracketRight') { e.preventDefault(); app.arrange(e.shiftKey ? 'up' : 'top'); return; }
    if (mod && e.code === 'BracketLeft') { e.preventDefault(); app.arrange(e.shiftKey ? 'down' : 'bottom'); return; }
    if (k === '?' || (e.shiftKey && e.code === 'Slash')) { shortcutsSheet(); return; }
    if (mod && k === 'a') { e.preventDefault(); app.select(app.doc.objects.filter((o) => !o.locked && o.visible !== false).map((o) => o.id)); return; }
    if (mod && k === 'g') { e.preventDefault(); if (e.shiftKey) ungroupSel(); else groupSel(); return; }
    if (mod && k === '0') { e.preventDefault(); canvas.fit(); return; }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); zoomBy(1.25); return; }
    if (mod && k === '-') { e.preventDefault(); zoomBy(0.8); return; }
    if (k === 'delete' || k === 'backspace') { if (app.tool === 'nodes' || app.tool === 'letters') { app.emit('deleteKey'); return; } e.preventDefault(); app.deleteSelection(); return; }
    if (app.pending && (k === 'escape' || k === 'enter')) { e.preventDefault(); if (k === 'enter') app.applyPreview(); else app.cancelPreview(); return; }
    if (k === 'escape') { closeSheet(); closeHome(); closeContext(); if (app.tool !== 'select') app.setTool('select'); else app.select([]); return; }
    if (k.startsWith('arrow') && app.selection.length) {
      e.preventDefault();
      const s = e.shiftKey ? 10 : 1;
      const d = { arrowleft: [-s, 0], arrowright: [s, 0], arrowup: [0, -s], arrowdown: [0, s] }[k];
      if (app.tool === 'letters' || app.tool === 'nodes') { app.emit('nudge', d); return; }
      app.selected.forEach((o) => { o.m = mul(translate(d[0], d[1]), o.m); });
      app.render(); clearTimeout(nudgeT); nudgeT = setTimeout(() => { app.commit('نقل'); app.render({ panels: true }); }, 400);
      return;
    }
    if (!mod && !e.altKey) { const map = { k: 'madd' }; const t = TOOLBAR.find((x) => x.key === k && x.id !== 'kashida'); if (map[k]) app.setTool(map[k]); else if (t) app.setTool(t.id); }
  });
  let nudgeT;

  // drag & drop
  stage.addEventListener('dragover', (e) => { e.preventDefault(); });
  stage.addEventListener('drop', async (e) => {
    e.preventDefault();
    await handleFiles([...e.dataTransfer.files]);
  });

  installTooltips();

  // apply / cancel bar for previewed changes (shown over the canvas)
  const pvbar = h('div', { class: 'pvbar', hidden: true },
    btn('close', 'إلغاء', () => app.cancelPreview(), { iconOnly: true, class: 'pvno', title: 'إلغاء (Esc)' }),
    h('span', { class: 'pvlbl' }),
    btn('check', 'تطبيق', () => app.applyPreview(), { iconOnly: true, class: 'pvok', title: 'تطبيق (Enter)' }));
  stage.append(pvbar);
  app.on('preview', (p) => {
    pvbar.hidden = !p;
    if (p) pvbar.querySelector('.pvlbl').textContent = tr('معاينة') + (p.label ? ': ' + tr(p.label) : '');
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

window.addEventListener('beforeunload', () => { app.saveNow(); app.saveRecovery(true); });
// safety copy every 90 s while working, and on any unexpected error
setInterval(() => app.saveRecovery(), 90000);
let lastErr = 0;
const onCrash = (e) => {
  console.error(e);
  app.saveNow(); app.saveRecovery(true);
  if (Date.now() - lastErr > 4000) { lastErr = Date.now(); toast('حدث خطأ في هذه العملية، وحُفظ عملك. تابع العمل أو تراجع خطوة.', 'error', 5000); }
};
window.addEventListener('error', (e) => onCrash(e.error || e.message));
window.addEventListener('unhandledrejection', (e) => onCrash(e.reason));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { app.saveNow(); app.saveRecovery(); } });

boot().catch((e) => {
  console.error(e);
  document.getElementById('app').innerHTML = `<div class="fatal"><h2>تعذّر تشغيل البرنامج</h2><pre>${String(e && e.stack || e)}</pre></div>`;
});

export { app, preloadFonts, unionBounds, invert, importSVGText };
