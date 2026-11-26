// «مكتبتي»: the user's own assets, kept on the device (IndexedDB):
// stickers / shapes (saved objects or imported SVG/PNG/GIF), images, styles
// (fill + strokes + effects), and fonts (managed by the font picker).
// Everything here can be added and deleted by the user.
import { h, btn, toast, openSheet, closeSheet, pickFile } from './dom.js';
import { Store } from '../core/store.js';
import { clone, uid, mul, translate, scaleM, imageObject } from '../core/model.js';
import { worldBounds, unionBounds } from '../core/geometry.js';
import { toSVG } from '../core/export.js';
import { fileToDataURL, loadImg } from './panels.js';
import { importSVGText } from './menus.js';
import { openFontPicker } from './fontpicker.js';

export const Library = { styles: [], stickers: [], images: [], loaded: false };

export async function loadLibrary() {
  Library.styles = await Store.getMisc('lib-styles', []);
  Library.stickers = await Store.getMisc('lib-stickers', []);
  Library.images = await Store.getMisc('lib-images', []);
  Library.loaded = true;
}
const save = (k) => Store.setMisc('lib-' + k, Library[k]);

/* ------------------------------ styles ------------------------------ */
export async function saveStyle(app, style) {
  const n = Library.styles.length + 1;
  Library.styles.push({ id: uid('st'), name: `نمطي ${n}`, style: clone(style) });
  await save('styles');
  toast('حُفظ النمط في «مكتبتي»');
  app.render({ panels: true });
}
export async function deleteStyle(app, id) {
  Library.styles = Library.styles.filter((s) => s.id !== id);
  await save('styles');
  app.render({ panels: true });
}

/* ------------------------------ stickers ------------------------------ */
const svgThumb = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

function freshIds(o) {
  o.id = uid(o.type?.[0] || 'o');
  (o.children || []).forEach(freshIds);
  return o;
}

export async function saveSelectionAsSticker(app) {
  const objs = app.selected;
  if (!objs.length) return toast('حدّد شكلًا أو كلمة أولًا');
  const svg = toSVG(app.doc, { objects: objs, crop: 'content', background: false });
  Library.stickers.unshift({ id: uid('sk'), name: objs[0].name || 'ملصق', objs: objs.map(clone), thumb: svgThumb(svg) });
  await save('stickers');
  toast('حُفظ في «مكتبتي» ← الملصقات');
}

async function addStickerFiles(app, files) {
  for (const f of files) {
    try {
      if (/svg/.test(f.type) || /\.svg$/i.test(f.name)) {
        // parse into editable shapes, without touching the document
        const tmp = { width: app.doc.width, height: app.doc.height, objects: [] };
        const fake = { ...app, doc: tmp, add: (o) => tmp.objects.push(o), select() {}, render() {}, commit() {} };
        importSVGText(fake, await f.text(), f.name);
        if (!tmp.objects.length) throw new Error('empty svg');
        const svg = toSVG({ ...app.doc, objects: tmp.objects }, { objects: tmp.objects, crop: 'content', background: false });
        Library.stickers.unshift({ id: uid('sk'), name: f.name.replace(/\.\w+$/, ''), objs: tmp.objects, thumb: svgThumb(svg) });
      } else {
        const src = await fileToDataURL(f);
        const img = await loadImg(src);
        Library.stickers.unshift({ id: uid('sk'), name: f.name.replace(/\.\w+$/, ''), image: { src, w: img.width, h: img.height }, thumb: src });
      }
    } catch (e) { console.error(e); toast(`تعذّر إضافة ${f.name}`, 'error'); }
  }
  await save('stickers');
}

/** Insert objects centred on the artboard, shown as a preview first. */
function placeObjects(app, objs, label) {
  const b = unionBounds(objs.map(worldBounds));
  const maxSide = Math.min(app.doc.width, app.doc.height) * 0.5;
  const k = Math.min(1, maxSide / Math.max(b.w, b.h, 1));
  const T = mul(translate(app.doc.width / 2, app.doc.height / 2), mul(scaleM(k, k), translate(-(b.x + b.w / 2), -(b.y + b.h / 2))));
  const ids = [];
  for (const o of objs) { o.m = mul(T, o.m); app.doc.objects.push(o); ids.push(o.id); }
  app.selection = ids;
  app.preview(label);
  app.render({ panels: true });
}

function insertImage(app, im, name, label) {
  const k = Math.min(1, (app.doc.width * 0.5) / im.w, (app.doc.height * 0.5) / im.h);
  const o = imageObject(im.src, im.w, im.h, { name });
  o.m = mul(translate((app.doc.width - im.w * k) / 2, (app.doc.height - im.h * k) / 2), scaleM(k, k));
  app.doc.objects.push(o);
  app.selection = [o.id];
  app.preview(label);
  app.render({ panels: true });
}

export function insertSticker(app, s) {
  if (s.image) return insertImage(app, s.image, s.name, 'إدراج ملصق');
  placeObjects(app, s.objs.map((o) => freshIds(clone(o))), 'إدراج ملصق');
}

/* ------------------------------ images ------------------------------ */
async function addImageFiles(files) {
  for (const f of files) {
    try {
      const src = await fileToDataURL(f);
      const img = await loadImg(src);
      Library.images.unshift({ id: uid('im'), name: f.name.replace(/\.\w+$/, ''), src, w: img.width, h: img.height });
    } catch (e) { console.error(e); toast(`تعذّر إضافة ${f.name}`, 'error'); }
  }
  await save('images');
}

/* ------------------------------ the sheet ------------------------------ */
export async function openLibrary(app, tab = 'stickers') {
  if (!Library.loaded) await loadLibrary();
  const body = h('div', { class: 'library' });
  const tabs = h('div', { class: 'chips libtabs' });
  const TABS = [['stickers', 'الملصقات والأشكال'], ['images', 'الصور'], ['styles', 'الأنماط والتأثيرات'], ['fonts', 'الخطوط']];
  const card = (thumb, title, onUse, onDel) => h('div', { class: 'libcard' },
    h('button', { type: 'button', class: 'libthumb', title, onClick: onUse }, thumb),
    h('button', { type: 'button', class: 'libdel', title: 'حذف من مكتبتي', 'aria-label': 'حذف من مكتبتي', onClick: async (e) => { e.stopPropagation(); await onDel(); draw(); } }, '×'));
  const img = (src) => h('img', { src, alt: '', loading: 'lazy' });
  const draw = () => {
    tabs.innerHTML = '';
    TABS.forEach(([k, l]) => tabs.append(h('button', { type: 'button', class: 'chip' + (k === tab ? ' on' : ''), onClick: () => { tab = k; draw(); } }, l)));
    body.innerHTML = '';
    if (tab === 'stickers') {
      body.append(h('div', { class: 'brow' },
        btn('plus', 'إضافة من ملف (SVG، PNG، GIF)', async () => { await addStickerFiles(app, await pickFile('.svg,image/svg+xml,image/png,image/webp,image/gif,image/jpeg', { multiple: true })); draw(); }, { class: 'small primary' }),
        btn('save', 'حفظ المحدد كملصق', async () => { await saveSelectionAsSticker(app); draw(); }, { class: 'small', disabled: !app.selection.length })));
      const grid = h('div', { class: 'libgrid' }, Library.stickers.map((s) => card(img(s.thumb), s.name, () => { closeSheet(); insertSticker(app, s); },
        async () => { Library.stickers = Library.stickers.filter((x) => x.id !== s.id); await save('stickers'); })));
      body.append(Library.stickers.length ? grid : h('p', { class: 'hint' }, 'لا توجد ملصقات بعد. أضف ملفات SVG أو PNG أو GIF، أو حدّد شكلًا أو كلمة واحفظها هنا لتستعملها في أي مشروع.'));
    } else if (tab === 'images') {
      body.append(h('div', { class: 'brow' },
        btn('plus', 'إضافة صور (PNG، JPG، WebP، GIF)', async () => { await addImageFiles(await pickFile('image/png,image/jpeg,image/webp,image/gif', { multiple: true })); draw(); }, { class: 'small primary' })));
      const grid = h('div', { class: 'libgrid' }, Library.images.map((s) => card(img(s.src), s.name, () => { closeSheet(); insertImage(app, s, s.name, 'إدراج صورة'); },
        async () => { Library.images = Library.images.filter((x) => x.id !== s.id); await save('images'); })));
      body.append(Library.images.length ? grid : h('p', { class: 'hint' }, 'لا توجد صور بعد. الصور هنا تبقى على جهازك وتظهر في كل مشاريعك.'));
    } else if (tab === 'styles') {
      const one = app.one;
      body.append(h('div', { class: 'brow' },
        btn('save', 'حفظ نمط المحدد', async () => { await saveStyle(app, one.style); draw(); }, { class: 'small primary', disabled: !one?.style })));
      const grid = h('div', { class: 'libgrid' }, Library.styles.map((s) => card(h('span', { class: 'pv', style: previewCSSOf(s.style) }, 'خط'), s.name,
        () => {
          if (!app.selection.length) return toast('حدّد عنصرًا لتطبيق النمط عليه');
          closeSheet();
          app.selected.forEach((o) => { if (o.style) Object.assign(o.style, clone(s.style)); });
          app.preview('نمط من مكتبتي'); app.render({ panels: true });
        },
        async () => { Library.styles = Library.styles.filter((x) => x.id !== s.id); await save('styles'); })));
      body.append(Library.styles.length ? grid : h('p', { class: 'hint' }, 'احفظ تنسيق أي عنصر (الألوان والحدود والظل والتوهج والبروز…) لتطبّقه بلمسة لاحقًا. يظهر أيضًا في «أنماط جاهزة».'));
    } else {
      body.append(h('p', { class: 'hint' }, 'أضف خطوطك من ملفات TTF أو OTF أو احذفها من نافذة الخطوط.'),
        h('div', { class: 'brow' }, btn('font', 'إدارة الخطوط', () => { closeSheet(); openFontPicker(app, app.one?.type === 'text' || app.one?.type === 'letters' ? app.one : null); }, { class: 'small primary' })));
    }
  };
  draw();
  openSheet('مكتبتي', h('div', {}, tabs, body), { wide: true });
}

let previewCSSOf = () => ({});
export function setPreviewCSS(fn) { previewCSSOf = fn; }
