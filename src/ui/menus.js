// File menu: projects, open/save, import, export, send to the animation app.
import { h, btn, openSheet, closeSheet, toast, pickFile, field, select } from './dom.js';
import { Store, sendToAnimation } from '../core/store.js';
import { toSVG, toSimpleSVG, svgToPNG, svgToPDF, projectFile, parseProjectFile, download, exportBounds } from '../core/export.js';
import { pathObject, imageObject, uid, translate, scaleM, mul, defaultStyle } from '../core/model.js';
import { P, itemD, preloadFonts } from '../core/geometry.js';
import { listFonts } from '../core/fonts.js';
import { fileToDataURL, loadImg } from './panels.js';

const fname = (app, ext) => `${(app.projectName || 'midad').replace(/[\\/:*?"<>|]+/g, '_')}.${ext}`;

export function openFileMenu(app) {
  const body = h('div', { class: 'menu' },
    h('div', { class: 'mgrid' },
      btn('new', 'مشروع جديد', () => newProjectDialog(app)),
      btn('open', 'مشاريعي', () => projectsDialog(app)),
      btn('save', 'حفظ ملف المشروع', () => saveProjectFile(app)),
      btn('import', 'فتح ملف مشروع', () => openProjectFile(app)),
      btn('image', 'استيراد SVG أو PNG', () => importGraphic(app)),
      btn('export', 'تصدير', () => exportDialog(app)),
      btn('send', 'إرسال لبرنامج الحركة', () => sendAnimation(app)),
      btn('fit', 'ملاءمة اللوحة للشاشة', () => { closeSheet(); window.midad.canvas.fit(); }),
      btn(document.body.classList.contains('mobile') ? 'laptop' : 'phone', document.body.classList.contains('mobile') ? 'التبديل إلى وضع اللابتوب' : 'التبديل إلى وضع الجوال', () => { closeSheet(); app.emit('toggleMode'); }),
      btn('help', 'عن البرنامج', () => aboutDialog(app))),
    h('div', { class: 'brow' }, field('اسم المشروع', (() => {
      const i = h('input', { value: app.projectName });
      i.addEventListener('change', () => { app.projectName = i.value.trim() || 'مشروع'; app.emit('project-name'); app.scheduleSave(); });
      return i;
    })())));
  openSheet('الملف', body);
}

export function newProjectDialog(app) {
  const sizes = [[1080, 1080, 'مربع (منشور)'], [1080, 1350, 'عمودي'], [1920, 1080, 'أفقي'], [2480, 3508, 'A4 طباعة'], [4000, 4000, 'شعار كبير']];
  openSheet('مشروع جديد', h('div', { class: 'mgrid' }, sizes.map(([w, hh, l]) =>
    btn(null, `${l} ${w}×${hh}`, async () => { await app.saveNow(); await app.newProject(w, hh); closeSheet(); toast('مشروع جديد'); }))));
}

export async function projectsDialog(app) {
  await app.saveNow();
  const list = await Store.listProjects();
  const grid = h('div', { class: 'projects' }, list.map((p) => h('div', { class: `pcard ${p.id === app.projectId ? 'on' : ''}` },
    h('button', { type: 'button', class: 'pthumb', onClick: async () => { const rec = await Store.loadProject(p.id); await app.openProject(rec); closeSheet(); } },
      p.thumb ? h('img', { src: p.thumb, alt: '' }) : h('span', {}, 'كلمة')),
    h('div', { class: 'pmeta' }, h('strong', {}, p.name), h('small', {}, new Date(p.updated).toLocaleString('ar'))),
    h('div', { class: 'brow' },
      btn('copy', 'نسخة', async () => { const rec = await Store.loadProject(p.id); rec.id = uid('prj'); rec.name += ' (نسخة)'; rec.updated = Date.now(); await Store.saveProject(rec); projectsDialog(app); }, { iconOnly: true, class: 'ghost small' }),
      p.id !== app.projectId ? btn('trash', 'حذف', async () => { if (!confirmInline(grid, `حذف «${p.name}»؟`)) return; await Store.deleteProject(p.id); projectsDialog(app); }, { iconOnly: true, class: 'ghost small danger' }) : null))));
  openSheet('مشاريعي', list.length ? grid : h('p', { class: 'hint' }, 'لا مشاريع محفوظة بعد.'), { wide: true });
}

// Avoid window.confirm (blocks automation and looks foreign); use a 2-tap pattern.
const pending = new WeakMap();
function confirmInline(host, msg) {
  if (pending.get(host) === msg) { pending.delete(host); return true; }
  pending.set(host, msg);
  toast(`${msg} — اضغط مرة أخرى للتأكيد`, 'warn');
  setTimeout(() => pending.delete(host), 3000);
  return false;
}

export async function saveProjectFile(app) {
  // embed user fonts that the project uses so the file is self-contained
  const used = new Set();
  JSON.stringify(app.doc, (k, v) => { if (k === 'fontId') used.add(v); return v; });
  const fonts = [];
  for (const f of listFonts()) if (f.user && used.has(f.id)) fonts.push({ id: f.id, name: f.name, data: bufToB64(f.data) });
  const txt = projectFile(app.doc, { name: app.projectName, fonts });
  download(new Blob([txt], { type: 'application/json' }), fname(app, 'midad'));
  toast('حُفظ ملف المشروع');
}

export async function openProjectFile(app) {
  const [f] = await pickFile('.midad,.json,application/json');
  if (!f) return;
  try {
    const j = parseProjectFile(await f.text());
    const { registerUserFont } = await import('../core/fonts.js');
    for (const uf of j.fonts || []) {
      const rec = { id: uf.id, name: uf.name, style: 'خط مستورد', data: b64ToBuf(uf.data) };
      registerUserFont(rec); await Store.saveFont(rec);
    }
    await app.saveNow();
    await app.openProject({ id: uid('prj'), name: j.name || f.name.replace(/\.[^.]+$/, ''), doc: j.doc });
    closeSheet();
    toast('فُتح المشروع');
  } catch (e) { toast(e.message || 'تعذّر فتح الملف', 'error'); }
}

const bufToB64 = (buf) => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
const b64ToBuf = (s) => { const bin = atob(s); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b.buffer; };

export async function importGraphic(app, files) {
  files = files || await pickFile('.svg,image/svg+xml,image/png,image/jpeg,image/webp', { multiple: true });
  for (const f of files) {
    try {
      if (/svg/.test(f.type) || /\.svg$/i.test(f.name)) importSVGText(app, await f.text(), f.name);
      else {
        const src = await fileToDataURL(f);
        const img = await loadImg(src);
        const k = Math.min(1, (app.doc.width * 0.8) / img.width, (app.doc.height * 0.8) / img.height);
        const o = imageObject(src, img.width, img.height, { name: f.name });
        o.m = mul(translate((app.doc.width - img.width * k) / 2, (app.doc.height - img.height * k) / 2), scaleM(k, k));
        app.add(o);
      }
    } catch (e) { console.error(e); toast(`تعذّر استيراد ${f.name}`, 'error'); }
  }
  app.commit('استيراد');
  closeSheet();
}

export function importSVGText(app, text, name = 'SVG') {
  const item = P.project.importSVG(text, { insert: false, expandShapes: true });
  const out = [];
  const walk = (it) => {
    if (it.className === 'Path' || it.className === 'CompoundPath') {
      const d = itemD(it);
      if (!d) return;
      const st = defaultStyle(it.fillColor ? it.fillColor.toCSS(true) : 'none');
      if (!it.fillColor) st.fills = [];
      if (it.strokeColor && it.strokeWidth) st.strokes = [{ color: it.strokeColor.toCSS(true), width: it.strokeWidth, align: 'center', cap: 'round', join: 'round' }];
      out.push(pathObject(d, { name: it.name || name, style: st }));
    } else if (it.children) it.children.forEach(walk);
  };
  // bake all nested transforms into coordinates
  item.applyMatrix = true;
  item.reduce?.();
  walk(item);
  if (!out.length) { toast('لم أجد أشكالًا في الملف', 'warn'); return; }
  // fit into artboard
  const b = item.bounds;
  const k = Math.min(1, (app.doc.width * 0.8) / b.width, (app.doc.height * 0.8) / b.height);
  const M = mul(translate((app.doc.width - b.width * k) / 2, (app.doc.height - b.height * k) / 2), mul(scaleM(k, k), translate(-b.x, -b.y)));
  for (const o of out) { o.m = M.slice(); app.add(o, { select: false }); }
  app.select(out.map((o) => o.id));
}

export function exportDialog(app) {
  const st = { what: app.selection.length ? 'selection' : 'all', crop: 'artboard', size: 4000, bg: true };
  const objs = () => (st.what === 'selection' ? app.selected : app.doc.objects);
  const sizeIn = h('input', { type: 'number', value: st.size, min: 64, max: 16000, step: 100, class: 'num' });
  sizeIn.addEventListener('change', () => { st.size = +sizeIn.value; });
  const run = async (kind) => {
    try {
      await preloadFonts(app.doc.objects);
      const o = objs();
      if (!o.length) return toast('لا يوجد ما يُصدَّر', 'warn');
      const opts = { objects: o, crop: st.crop, background: st.bg };
      if (kind === 'svg') download(new Blob([toSVG(app.doc, opts)], { type: 'image/svg+xml' }), fname(app, 'svg'));
      if (kind === 'svg-simple') download(new Blob([toSimpleSVG(app.doc, opts)], { type: 'image/svg+xml' }), fname(app, 'svg'));
      if (kind === 'png') { toast('جارٍ إنشاء الصورة…'); download(await svgToPNG(toSVG(app.doc, { ...opts, background: st.bg }), st.size), fname(app, 'png')); }
      if (kind === 'pdf') { toast('جارٍ إنشاء PDF…'); download(await svgToPDF(toSVG(app.doc, opts)), fname(app, 'pdf')); }
      toast('تم التصدير');
    } catch (e) { console.error(e); toast('تعذّر التصدير: ' + (e.message || e), 'error'); }
  };
  const b = exportBounds(app.doc, objs(), 'artboard');
  openSheet('تصدير', h('div', {},
    h('div', { class: 'brow' },
      field('ماذا', select([['all', 'كل اللوحة'], ['selection', 'المحدد فقط']], st.what, (v) => { st.what = v; })),
      field('الحدود', select([['artboard', 'حدود اللوحة'], ['content', 'على قدّ التصميم']], st.crop, (v) => { st.crop = v; }))),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.bg, onChange: (e) => { st.bg = e.target.checked; } }), 'تضمين لون الخلفية (إن وُجد)'),
    h('div', { class: 'mgrid' },
      btn('export', 'SVG كامل', () => run('svg')),
      btn('export', 'SVG مبسّط (للبرامج القديمة)', () => run('svg-simple')),
      btn('image', 'PNG شفاف', () => run('png')),
      btn('export', 'PDF متجهي', () => run('pdf'))),
    field('عرض PNG الأطول (بكسل)', sizeIn),
    h('p', { class: 'hint' }, `اللوحة ${b.w}×${b.h}. «SVG مبسّط» يحوّل كل عنصر إلى مسار واحد بلون واحد ليُفتح في Illustrator القديم وCorelDRAW بلا مشاكل. PDF لا يدعم الظل والتوهج.`)), { wide: false });
}

async function sendAnimation(app) {
  try {
    const objs = app.selection.length ? app.selected : app.doc.objects;
    const svg = toSVG(app.doc, { objects: objs, crop: 'content', background: false });
    const id = await sendToAnimation({ kind: 'svg', name: app.projectName, svg, width: app.doc.width, height: app.doc.height });
    toast('أُرسل التركيب إلى برنامج الصور المتحركة. افتحه لتجده في «الوارد».');
    return id;
  } catch (e) { console.error(e); toast('تعذّر الإرسال', 'error'); }
}

export function aboutDialog() {
  openSheet('عن كلمة', h('div', { class: 'about' },
    h('p', {}, 'كلمة: برنامج شخصي للخط العربي والتركيبات الخطية. يعمل بلا إنترنت بعد أول تحميل.'),
    h('h4', {}, 'الخطوط المضمّنة (كلها برخصة SIL OFL 1.1)'),
    h('ul', {}, listFonts().filter((f) => !f.user).map((f) => h('li', {}, `${f.name} (${f.style}) — ${f.license}`))),
    h('p', { class: 'hint' }, 'المكتبات: HarfBuzz (تشكيل النص)، Paper.js (العمليات المتجهية)، jsPDF وsvg2pdf (PDF)، Lucide (الأيقونات).')));
}
