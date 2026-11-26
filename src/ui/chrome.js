// Interface chrome: home menu, tool categories, settings, context menu,
// clipboard, tooltips and shortcuts.
import { h, btn, icon, toast, openSheet, closeSheet, field, select, pickFile } from './dom.js';
import { tr, setLang } from './i18n.js';
import { TOOLS } from '../tools/index.js';
import { mul, translate, scaleM, clone, uid } from '../core/model.js';
import { worldBounds, unionBounds } from '../core/geometry.js';
import { toSVG, svgToPNG } from '../core/export.js';
import { Store } from '../core/store.js';
import { listInbox, removeInbox, sendToApp, APPS } from '../core/inbox.js';
import { newProjectDialog, projectsDialog, saveProjectFile, openProjectFile, aboutDialog, exportDialog, importGraphic } from './menus.js';
import { convertSelection } from './panels.js';
import { openFontPicker } from './fontpicker.js';

export const CATS = [
  { id: 'edit', icon: 'wrench', label: 'تعديل' },
  { id: 'text', icon: 'penLine', label: 'نص' },
  { id: 'shape', icon: 'pencilLine', label: 'شكل' },
  { id: 'look', icon: 'paintbrush', label: 'مظهر' },
  { id: 'tools', icon: 'scissors', label: 'أدوات' },
  { id: 'page', icon: 'settings2', label: 'إعدادات الصفحة' },
];

const tool = (id, ic, label, hint, key) => ({ tool: id, icon: ic, label, hint, key });
const act = (ic, label, hint, run, opts = {}) => ({ icon: ic, label, hint, run, ...opts });

/** Open the properties panel and bring a section (by its title) into view. */
export function showSection(app, title) {
  if (document.body.classList.contains('mobile')) window.midad.toggleDrawer('props', true);
  setTimeout(() => {
    const t = tr(title);
    const hd = [...document.querySelectorAll('#props h3')].find((x) => x.textContent.startsWith(t));
    hd?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    hd?.parentElement?.classList.add('flash');
    setTimeout(() => hd?.parentElement?.classList.remove('flash'), 1200);
  }, 380);
}

/* ------------------------------ clipboard ------------------------------ */
export const Clip = {
  data: null,
  copy(app) { if (!app.selection.length) return false; this.data = app.selected.map(clone); toast('نُسخ'); return true; },
  cut(app) { if (this.copy(app)) app.deleteSelection(); },
  paste(app) {
    if (!this.data?.length) return toast('لا شيء منسوخ بعد');
    const ids = [];
    for (const o of this.data) { const c = clone(o); c.id = uid(o.type[0]); c.m = mul(translate(24, 24), c.m); app.doc.objects.push(c); ids.push(c.id); }
    this.data = this.data.map((o) => ({ ...clone(o), m: mul(translate(24, 24), o.m) }));
    app.selection = ids;
    app.commit('لصق');
    app.render({ panels: true });
  },
};

export function flip(app, axis) {
  const objs = app.selected;
  if (!objs.length) return toast('حدّد عنصرًا أولًا');
  const b = unionBounds(objs.map(worldBounds));
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const F = axis === 'x' ? scaleM(-1, 1, cx, cy) : scaleM(1, -1, cx, cy);
  objs.forEach((o) => { o.m = mul(F, o.m); });
  app.commit(axis === 'x' ? 'قلب أفقي' : 'قلب رأسي');
  app.render({ panels: true });
}

/* ------------------------------ categories ------------------------------ */
export function catItems(app, cat) {
  const one = app.one;
  const hasSel = app.selection.length > 0;
  const s = app.settings;
  const toggle = (key, ic, label, hint) => act(ic, label, hint, () => { s[key] = !s[key]; app.saveSettings?.(); app.render({ panels: true }); window.midad.canvas.draw(); }, { active: !!s[key] });
  switch (cat) {
    case 'edit': return [
      tool('select', 'select', 'تحديد', 'حدّد العناصر وحرّكها وكبّرها ودوّرها بالمقابض', 'V'),
      tool('pan', 'pan', 'تحريك اللوحة', 'اسحب لتحريك مساحة العمل (أو المسافة + سحب)', 'H'),
      act('undo', 'تراجع', 'التراجع خطوة (Ctrl+Z)', () => app.undo()),
      act('redo', 'إعادة', 'إعادة خطوة (Ctrl+Y)', () => app.redo()),
      act('cut', 'قص', 'قص المحدد (Ctrl+X)', () => Clip.cut(app), { disabled: !hasSel }),
      act('copy', 'نسخ', 'نسخ المحدد (Ctrl+C)', () => Clip.copy(app), { disabled: !hasSel }),
      act('paste', 'لصق', 'لصق (Ctrl+V)', () => Clip.paste(app)),
      act('copyPlus', 'تكرار', 'تكرار المحدد (Ctrl+D)', () => app.duplicateSelection(), { disabled: !hasSel }),
      act('trash', 'حذف', 'حذف المحدد (Delete)', () => app.deleteSelection(), { disabled: !hasSel }),
      act('squareDashed', 'تحديد الكل', 'تحديد كل العناصر (Ctrl+A)', () => app.select(app.doc.objects.filter((o) => !o.locked && o.visible !== false).map((o) => o.id))),
      act('group', 'تجميع', 'تجميع المحدد (Ctrl+G)', () => app.emit('group'), { disabled: app.selection.length < 2 }),
      act('ungroup', 'فك التجميع', 'فك التجميع (Ctrl+Shift+G)', () => app.emit('ungroup'), { disabled: one?.type !== 'group' }),
      act('flipH', 'قلب أفقي', 'قلب المحدد يمين/يسار', () => flip(app, 'x'), { disabled: !hasSel }),
      act('flipV', 'قلب رأسي', 'قلب المحدد أعلى/أسفل', () => flip(app, 'y'), { disabled: !hasSel }),
      act('front', 'تقديم للأمام', 'إلى أعلى الكل (Ctrl+])', () => app.arrange('top'), { disabled: !hasSel }),
      act('back', 'إرجاع للخلف', 'إلى أسفل الكل (Ctrl+[)', () => app.arrange('bottom'), { disabled: !hasSel }),
      act('scaling', 'حجم مساحة العمل', 'مقاس اللوحة وخلفيتها', () => { app.select([]); showSection(app, 'المقاس'); }),
      act('imageUp', 'إدراج صورة', 'أدرج صورة (بخلفية أو شفافة) أو SVG', () => importGraphic(app)),
      act('fit', 'ملاءمة الشاشة', 'إظهار اللوحة كاملة (Ctrl+0)', () => window.midad.canvas.fit()),
    ];
    case 'text': return [
      tool('text', 'text', 'كتابة', 'المس اللوحة لإضافة نص جديد', 'T'),
      act('textCursor', 'تعديل النص', 'تصحيح النص المحدد أو إضافة التشكيل', () => { if (one?.type === 'text') app.emit('editText'); else toast('حدّد نصًّا أولًا'); }),
      act('superscript', 'تشكيل', 'إضافة الحركات إلى النص المحدد', () => { if (one?.type === 'text') { app.emit('editText'); setTimeout(() => [...document.querySelectorAll('#props button')].find((b) => b.textContent === tr('إضافة تشكيل'))?.click(), 120); } else toast('حدّد نصًّا أولًا'); }),
      act('font', 'خط النص', 'اختيار الخط للنص المحدد', () => { if (one?.type === 'text' || one?.type === 'letters') openFontPicker(app, one); else toast('حدّد نصًّا أولًا'); }),
      tool('letters', 'explode', 'الحروف', 'فكّ الكلمة وتحريك كل حرف وتمديده وتبديل شكله', 'L'),
      tool('madd', 'kashida', 'مداد', 'تطويل النص الحيّ، أو مدّ الشكل أفقيًا وعموديًا مع بقاء السماكة', 'K'),
      tool('textpath', 'route', 'رسم مسار للنص', 'ارسم بإصبعك مسارًا يسير عليه النص المحدد'),
      act('letterText', 'حروف الخط كأشكال', 'إدراج أي شكل من أشكال حروف الخط كشكل قابل للتعديل', () => import('../phase6.js').then((m) => m.openGlyphs(app))),
    ];
    case 'shape': return [
      act('outline', 'تحويل إلى شكل (نص أو صورة)', 'النص يصير أشكالًا، والصورة تُتعقّب إلى شكل بلون واحد', () => {
        if (one?.type === 'image') return showSection(app, 'تحويل الصورة إلى شكل');
        if (!hasSel) return toast('حدّد نصًّا أو صورة أولًا');
        convertSelection(app);
      }),
      tool('nodes', 'nodes', 'العُقد', 'تحريك النقاط ومقابض المنحنيات وإضافة النقاط وحذفها', 'A'),
      tool('bezier', 'penTool', 'المرسمة (قلم المنحنيات)', 'ارسم شكلًا بنقاط ومنحنيات لتطويل حرف أو إضافة شكل', 'P'),
      tool('pen', 'brush', 'كتابة يدوية', 'اكتب بالقلم أو الإصبع بقلم قصب أو مستدير', 'B'),
      tool('madd', 'stretchH', 'مداد', 'مدّ الشكل أفقيًا أو عموديًا من أي نقطة فيه', 'K'),
      tool('eraser', 'eraser', 'ممحاة', 'امسح جزءًا من الشكل', 'E'),
      tool('knife', 'knife', 'سكين', 'اقطع الشكل إلى أجزاء', 'C'),
      act('unlink', 'فكّ العقدة إلى عقدتين', 'في أداة العقد: يفصل الشكل عند العقدة المحددة', () => nodeOp(app, 'breakNode')),
      act('combine', 'وصل طرفين', 'في أداة العقد: يصل طرفين مفتوحين (أو يدمجهما إن تلامسا)', () => nodeOp(app, 'joinNodes')),
      act('merge', 'دمج العقد المحددة في عقدة واحدة', 'في أداة العقد', () => nodeOp(app, 'mergeNodes')),
      act('slash', 'المنحنى إلى خط مستقيم', 'في أداة العقد: حدّد عقدتي طرفي المنحنى', () => nodeOp(app, 'straighten')),
      act('lineSquiggle', 'الخط المستقيم إلى منحنٍ', 'في أداة العقد: حدّد عقدتي طرفي الخط', () => nodeOp(app, 'curve')),
      act('simplify', 'تنعيم المسار', 'تقليل النقاط وتنعيم الشكل', () => showSection(app, 'تعديل الشكل')),
    ];
    case 'look': return [
      act('palette', 'أنماط جاهزة', 'ذهب، حدود، توهج… بضغطة', () => lookSection(app, 'أنماط جاهزة')),
      act('fill', 'الألوان والتعبئة', 'لون، تدرج، نقش، صورة داخل الحرف', () => lookSection(app, 'التعبئة')),
      act('square', 'الحدود', 'حد أو أكثر بألوان وسماكات', () => lookSection(app, 'الحدود')),
      act('sparkles', 'المؤثرات', 'Contour، ظل، توهج، بروز', () => lookSection(app, 'تأثيرات')),
      act('layoutGrid', 'مكتبة الألوان', 'لوحتي وألوان جاهزة', () => lookSection(app, 'مكتبة الألوان')),
      act('blend', 'Blend (تدرج شكلي)', 'حدّد شكلين لإنشاء أشكال وسيطة بينهما', () => { if (app.selection.length !== 2) return toast('حدّد شكلين'); showSection(app, 'Blend'); }),
    ];
    case 'tools': return [
      act('scan', 'تحويل الصورة إلى شكل', 'تعقّب الصورة وتحويلها إلى شكل بلون واحد', async () => {
        if (one?.type === 'image') return showSection(app, 'تحويل الصورة إلى شكل');
        await importGraphic(app);
        setTimeout(() => showSection(app, 'تحويل الصورة إلى شكل'), 200);
      }),
      tool('builder', 'builder', 'تحديد المساحات (باني الأشكال)', 'مرّر إصبعك فوق مناطق تداخل الأشكال لدمجها أو حذفها', 'M'),
      act('unite', 'دمج', 'دمج الأشكال المحددة في شكل واحد', () => pathOp(app, 'unite', 'دمج'), { disabled: app.selection.length < 2 }),
      act('subtract', 'قص', 'طرح الأشكال العليا من السفلى', () => pathOp(app, 'minus', 'قص'), { disabled: app.selection.length < 2 }),
      act('intersect', 'تقاطع', 'إبقاء المنطقة المشتركة فقط', () => pathOp(app, 'intersect', 'تقاطع'), { disabled: app.selection.length < 2 }),
      act('exclude', 'استبعاد', 'حذف المنطقة المشتركة', () => pathOp(app, 'exclude', 'استبعاد'), { disabled: app.selection.length < 2 }),
      act('divide', 'تقسيم', 'تقسيم الأشكال المتداخلة إلى أجزاء', () => pathOp(app, 'divide', 'تقسيم'), { disabled: app.selection.length < 2 }),
      act('letterText', 'حروف الخط كأشكال', 'إدراج أشكال الحروف من الخط', () => import('../phase6.js').then((m) => m.openGlyphs(app))),
      tool('textpath', 'route', 'الكتابة على مسار', 'ضع النص على دائرة أو قوس أو مسار ترسمه'),
      tool('warp', 'warp', 'غلاف وتشويه', 'قوس، موجة، انتفاخ، غلاف دائري، غلاف حر', 'W'),
      tool('kufi', 'kufi', 'كوفي مربع', 'الرسم على شبكة مربعة مع التناظر', 'Q'),
    ];
    case 'page': return [
      toggle('rulers', 'ruler', 'مساطر', 'إظهار المساطر (Ctrl+R)'),
      toggle('grid', 'grid', 'شبكة', "إظهار الشبكة (Ctrl+')"),
      toggle('snap', 'magnet', 'التقاط', 'الالتقاط إلى الأدلة والشبكة والحروف'),
      toggle('persp', 'box', 'شبكة المنظور', 'شبكة منظور بنقطة تلاشٍ واحدة للمساعدة'),
      act('guide', 'دليل رأسي', 'إضافة دليل رأسي في المنتصف (أو اسحب من المسطرة)', () => { app.doc.guides.push({ axis: 'x', pos: app.doc.width / 2 }); app.commit('دليل'); app.render(); }),
      act('stretchV', 'دليل أفقي', 'إضافة دليل أفقي في المنتصف', () => { app.doc.guides.push({ axis: 'y', pos: app.doc.height / 2 }); app.commit('دليل'); app.render(); }),
      act('trash', 'حذف الأدلة', 'حذف كل الأدلة', () => { app.doc.guides = []; app.commit('أدلة'); app.render(); }, { disabled: !app.doc.guides?.length }),
      act('scaling', 'حجم مساحة العمل', 'مقاس اللوحة', () => { app.select([]); showSection(app, 'المقاس'); }),
      act('fill', 'خلفية اللوحة', 'لون الخلفية أو شفافة', () => { app.select([]); showSection(app, 'الخلفية'); }),
      act('image', 'صورة مرجعية', 'صورة شفافة للنسخ عليها، لا تُصدَّر', () => { app.select([]); showSection(app, 'صورة مرجعية'); }),
    ];
    default: return [];
  }
}

function lookSection(app, title) {
  if (!app.selection.length) return toast('حدّد عنصرًا أولًا');
  showSection(app, title);
}
async function pathOp(app, kind, label) { const m = await import('../phase3.js'); m.shapeOp(app, kind, label); }
async function nodeOp(app, name) {
  if (app.tool !== 'nodes') { if (app.one?.type === 'path') app.setTool('nodes'); return toast('افتح أداة العقد وحدّد العقد أولًا'); }
  const m = await import('../phase6.js'); m.NodeOps[name](app);
}

/** Toolbar buttons for a category (icon only, label as tooltip). */
export function renderCat(app, host, cat, { horizontal = false } = {}) {
  host.innerHTML = '';
  for (const it of catItems(app, cat)) {
    if (it.tool && !TOOLS[it.tool]) continue;
    const label = it.label;
    const tip = it.hint ? `${tr(label)}\n${tr(it.hint)}${it.key ? ` (${it.key})` : ''}` : tr(label);
    const b = btn(it.icon, label, () => { if (it.tool) app.setTool(app.tool === it.tool && it.tool !== 'select' ? 'select' : it.tool); else it.run(); renderCatAgain(); }, {
      tool: it.tool, active: it.tool ? app.tool === it.tool : it.active, disabled: it.disabled, title: tip,
    });
    b.dataset.tip = tip;
    host.append(b);
  }
  if (horizontal) host.scrollLeft = 0;
}
let renderCatAgain = () => {};
export function setRerender(fn) { renderCatAgain = fn; }

/* ------------------------------ home menu ------------------------------ */
export function openHome(app) {
  const row = (ic, label, run) => h('button', { type: 'button', class: 'hrow', onClick: () => { closeHome(); run(); } }, icon(ic, 24), h('span', {}, label));
  const nameIn = h('input', { value: app.projectName, 'aria-label': 'اسم المشروع' });
  nameIn.addEventListener('change', () => { app.projectName = nameIn.value.trim() || 'مشروع'; app.emit('project-name'); app.scheduleSave(); });
  const panel = h('nav', { class: 'homepanel', 'aria-label': 'الرئيسية' },
    h('div', { class: 'hhead' }, h('b', {}, 'مِداد'), btn('close', 'إغلاق', closeHome, { iconOnly: true, class: 'ghost' })),
    field('اسم المشروع', nameIn),
    row('new', 'جديد', () => newProjectDialog(app)),
    row('open', 'فتح', () => projectsDialog(app)),
    row('fileInput', 'فتح ملف مشروع', () => openProjectFile(app)),
    row('save', 'حفظ', async () => { await app.saveNow(); toast('حُفظ في «مشاريعي» (الحفظ تلقائي دائمًا)'); }),
    row('saveAll', 'حفظ باسم', () => saveAs(app)),
    row('save', 'حفظ ملف المشروع', () => saveProjectFile(app)),
    h('hr'),
    row('import', 'استيراد من الجهاز', () => importGraphic(app)),
    row('fileInput', 'استيراد من برامجي', () => importFromApps(app)),
    row('export', 'تصدير إلى الجهاز', () => exportDialog(app)),
    row('send', 'إرسال إلى برامجي', () => sendToAppsDialog(app)),
    h('hr'),
    row('settings', 'الإعدادات', () => openSettings(app)),
    row('keyboard', 'اختصارات لوحة المفاتيح', () => shortcutsSheet()),
    row('help', 'عن مِداد', () => aboutDialog(app)),
    row('logOut', 'إنهاء البرنامج', async () => { await app.saveNow(); toast('حُفظ عملك'); setTimeout(() => { window.close(); }, 300); }));
  const back = h('div', { class: 'homeback', onClick: (e) => { if (e.target === back) closeHome(); } }, panel);
  closeHome();
  document.body.append(back);
  requestAnimationFrame(() => back.classList.add('open'));
}
export function closeHome() { document.querySelector('.homeback')?.remove(); }

function saveAs(app) {
  const inp = h('input', { value: app.projectName + ' 2' });
  openSheet('حفظ باسم', h('div', {}, field('اسم المشروع', inp), h('div', { class: 'brow' }, btn('saveAll', 'حفظ', async () => {
    await app.saveNow();
    await app.openProject({ id: uid('prj'), name: inp.value.trim() || app.projectName, doc: clone(app.doc) });
    await app.saveNow();
    closeSheet(); toast('حُفظت نسخة باسم جديد وفُتحت');
  }, { class: 'primary' }))));
}

async function importFromApps(app) {
  const items = await listInbox();
  const body = items.length ? h('div', { class: 'projects' }, items.map((it) => h('div', { class: 'pcard' },
    h('button', { type: 'button', class: 'pthumb', onClick: async () => {
      const f = it.svg ? new File([it.svg], (it.name || 'design') + '.svg', { type: 'image/svg+xml' }) : new File([it.blob], (it.name || 'image') + '.png', { type: it.mime || 'image/png' });
      await importGraphic(app, [f]);
      await removeInbox(it.id).catch(() => {});
      closeSheet(); toast('استُورد');
    } }, it.blob ? h('img', { src: URL.createObjectURL(it.blob), alt: '' }) : h('span', {}, 'SVG')),
    h('div', { class: 'pmeta' }, h('strong', {}, it.name || 'بلا اسم'), h('small', {}, APPS[it.from] || it.from || ''))))) : h('p', { class: 'hint' }, 'لا يوجد شيء مرسل من برامجك الأخرى بعد. من أي برنامج اختر «إرسال إلى برنامج الخط».');
  openSheet('استيراد من برامجي', body, { wide: true });
}

function sendToAppsDialog(app) {
  const send = (to) => async () => {
    try {
      const objs = app.selection.length ? app.selected : app.doc.objects;
      if (!objs.length) return toast('لا يوجد ما يُرسل', 'warn');
      const svg = toSVG(app.doc, { objects: objs, crop: 'content', background: false });
      const png = await svgToPNG(svg, 2000);
      await sendToApp(to, { name: app.projectName, png, svg, width: app.doc.width, height: app.doc.height });
      closeSheet();
      toast(`أُرسل إلى ${APPS[to]}. افتحه لتجده في الوارد.`);
    } catch (e) { console.error(e); toast('تعذّر الإرسال', 'error'); }
  };
  openSheet('إرسال إلى برامجي', h('div', {},
    h('p', { class: 'hint' }, 'يُرسل المحدد (أو اللوحة كلها) صورة شفافة عالية الدقة مع نسخة SVG.'),
    h('div', { class: 'mgrid' },
      btn('image', APPS.suwar, send('suwar')), btn('sparkles', APPS.haraka, send('haraka')),
      btn('export', APPS.mashhad, send('mashhad')), btn('send', APPS.sada, send('sada')))));
}

/* ------------------------------ settings ------------------------------ */
export function applyLook(app) {
  const s = app.settings;
  const theme = s.theme === 'light' || s.theme === 'dark' ? s.theme : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty('--ic', `${s.iconSize || 26}px`);
  document.body.classList.toggle('labels', !!s.showLabels);
  setLang(s.lang || 'ar');
}

export function openSettings(app) {
  const s = app.settings;
  const save = (rebuild) => { app.saveSettings?.(); applyLook(app); if (rebuild) app.emit('rebuildUI'); };
  openSheet('الإعدادات', h('div', { class: 'settings' },
    field('اللغة', select([['ar', 'عربي'], ['en', 'إنجليزي']], s.lang || 'ar', (v) => { s.lang = v; save(true); closeSheet(); })),
    field('المظهر', select([['auto', 'حسب الجهاز'], ['light', 'فاتح'], ['dark', 'داكن']], s.theme || 'auto', (v) => { s.theme = v; save(); })),
    field('حجم الأيقونات', select([['22', 'صغيرة'], ['26', 'متوسطة'], ['32', 'كبيرة']], String(s.iconSize || 26), (v) => { s.iconSize = +v; save(); })),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!s.showLabels, onChange: (e) => { s.showLabels = e.target.checked; save(); } }), 'إظهار المسميات تحت الأيقونات'),
    field('وضع الواجهة', select([['auto', 'تلقائي'], ['mobile', 'جوال'], ['laptop', 'لابتوب']], s.mode || 'auto', (v) => { s.mode = v; save(); app.emit('applyMode'); })),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: s.keepLive !== false, onChange: (e) => { s.keepLive = e.target.checked; save(); } }), 'احتفظ بنسخة حيّة مخفية'),
    h('p', { class: 'hint' }, 'المسّ المطوّل على أي أيقونة يُظهر اسمها وشرحها. على اللابتوب يكفي وضع المؤشر عليها.')));
}

/* ------------------------------ shortcuts ------------------------------ */
export const SHORTCUTS = [
  ['Ctrl+Z', 'تراجع'], ['Ctrl+Y / Ctrl+Shift+Z', 'إعادة'], ['Ctrl+X', 'قص'], ['Ctrl+C', 'نسخ'], ['Ctrl+V', 'لصق'], ['Ctrl+D', 'تكرار'],
  ['Delete', 'حذف'], ['Ctrl+A', 'تحديد الكل'], ['Ctrl+G / Ctrl+Shift+G', 'تجميع / فك التجميع'], ['Ctrl+] / Ctrl+[', 'تقديم للأمام / إرجاع للخلف'],
  ['Ctrl+S', 'حفظ'], ['Ctrl+Shift+S', 'حفظ باسم'], ['Ctrl+O', 'فتح'], ['Ctrl+N', 'جديد'], ['Ctrl+E', 'تصدير'], ['Ctrl+Shift+O', 'تحويل إلى أشكال'],
  ['Ctrl+R', 'مساطر'], ["Ctrl+'", 'شبكة'], ['Ctrl+0', 'ملاءمة الشاشة'], ['Ctrl++ / Ctrl+-', 'تكبير وتصغير'],
  ['V', 'تحديد'], ['T', 'كتابة'], ['K', 'مداد'], ['L', 'الحروف'], ['A', 'العُقد'], ['P', 'المرسمة'], ['B', 'كتابة يدوية'], ['E', 'ممحاة'], ['C', 'سكين'], ['M', 'باني الأشكال'], ['W', 'غلاف وتشويه'], ['Q', 'كوفي مربع'], ['H', 'تحريك اللوحة'],
  ['الأسهم (+Shift)', 'نقل 1 (أو 10)'], ['المسافة + سحب', 'تحريك اللوحة'], ['Esc', 'إلغاء / رجوع للتحديد'], ['Enter', 'إنهاء خط المرسمة'],
];
export function shortcutsSheet() {
  openSheet('اختصارات لوحة المفاتيح', h('table', { class: 'keys' }, SHORTCUTS.map(([k, v]) => h('tr', {}, h('td', {}, h('kbd', {}, k)), h('td', {}, v)))));
}

/* ------------------------------ context menu ------------------------------ */
export function openContextMenu(app, cv, e) {
  const ev = cv.ev(e);
  const hit = cv.hitObject(e, ev.x, ev.y);
  if (hit && !app.selection.includes(hit.id)) { app.select(hit.id); app.render({ panels: true }); }
  const one = app.one, has = app.selection.length > 0;
  const it = (ic, label, run, ok = true) => (ok ? h('button', { type: 'button', class: 'cmi', onClick: () => { closeContext(); run(); } }, icon(ic, 20), h('span', {}, label)) : null);
  const sep = () => h('hr');
  const menu = h('div', { class: 'ctxmenu', role: 'menu' },
    it('cut', 'قص', () => Clip.cut(app), has), it('copy', 'نسخ', () => Clip.copy(app), has), it('paste', 'لصق', () => Clip.paste(app), !!Clip.data),
    it('copyPlus', 'تكرار', () => app.duplicateSelection(), has), it('trash', 'حذف', () => app.deleteSelection(), has),
    has ? sep() : null,
    it('front', 'تقديم للأمام', () => app.arrange('top'), has), it('back', 'إرجاع للخلف', () => app.arrange('bottom'), has),
    it('group', 'تجميع', () => app.emit('group'), app.selection.length > 1), it('ungroup', 'فك التجميع', () => app.emit('ungroup'), one?.type === 'group'),
    it('flipH', 'قلب أفقي', () => flip(app, 'x'), has), it('flipV', 'قلب رأسي', () => flip(app, 'y'), has),
    has ? sep() : null,
    it('textCursor', 'تعديل النص', () => app.emit('editText'), one?.type === 'text'),
    it('explode', 'فكّ الكلمة', () => app.setTool('letters'), one?.type === 'text' || one?.type === 'letters'),
    it('outline', 'تحويل إلى أشكال', () => convertSelection(app), has && one?.type !== 'path' && one?.type !== 'image'),
    it('scan', 'تحويل الصورة إلى شكل', () => showSection(app, 'تحويل الصورة إلى شكل'), one?.type === 'image'),
    it('nodes', 'تعديل العقد…', () => app.setTool('nodes'), one?.type === 'path'),
    it('warp', 'غلاف وتشويه', () => { app.toolState.warp = null; app.setTool('warp'); }, !!one && one.type !== 'image'),
    !has ? it('squareDashed', 'تحديد الكل', () => app.select(app.doc.objects.filter((o) => !o.locked && o.visible !== false).map((o) => o.id))) : null,
    !has ? it('scaling', 'حجم مساحة العمل', () => showSection(app, 'المقاس')) : null);
  closeContext();
  document.body.append(menu);
  const r = menu.getBoundingClientRect();
  menu.style.left = `${Math.min(e.clientX, innerWidth - r.width - 8)}px`;
  menu.style.top = `${Math.min(e.clientY, innerHeight - r.height - 8)}px`;
  setTimeout(() => document.addEventListener('pointerdown', onOutside, true), 0);
}
function onOutside(e) { if (!e.target.closest('.ctxmenu')) closeContext(); }
export function closeContext() { document.querySelector('.ctxmenu')?.remove(); document.removeEventListener('pointerdown', onOutside, true); }

/* ------------------------------ tooltips (touch long-press) ------------------------------ */
export function installTooltips() {
  let timer = null, tip = null;
  const hide = () => { clearTimeout(timer); tip?.remove(); tip = null; };
  document.addEventListener('pointerdown', (e) => {
    hide();
    if (e.pointerType === 'mouse') return;
    const b = e.target.closest?.('.btn[title], .chip[title]');
    if (!b) return;
    timer = setTimeout(() => {
      tip = h('div', { class: 'tipbubble' }, b.getAttribute('title'));
      document.body.append(tip);
      const r = b.getBoundingClientRect(), t = tip.getBoundingClientRect();
      tip.style.left = `${Math.max(8, Math.min(innerWidth - t.width - 8, r.left + r.width / 2 - t.width / 2))}px`;
      tip.style.top = `${r.top > t.height + 16 ? r.top - t.height - 8 : r.bottom + 8}px`;
      setTimeout(hide, 2600);
    }, 450);
  }, true);
  document.addEventListener('pointerup', () => clearTimeout(timer), true);
  document.addEventListener('pointercancel', hide, true);
}

export { pickFile };
