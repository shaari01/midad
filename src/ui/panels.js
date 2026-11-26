// Properties panel (contextual) and layers panel.
import { h, btn, icon, slider, field, colorInput, select, toast, pickFile } from './dom.js';
import { decompose, mul, translate, scaleM, rotateM, apply, uid } from '../core/model.js';
import { worldBounds, unionBounds, toOutlines, textLayout } from '../core/geometry.js';
import { fontInfo, getFontSync, ensureFont } from '../core/fonts.js';
import { keepAnchor } from '../tools/text.js';
import { openFontPicker } from './fontpicker.js';
import { styleEditor } from './style-editor.js';

const extraSections = []; // (app, objs) => Node|null  — added by later phases
export function registerSection(fn) { extraSections.push(fn); }

export function section(title, ...kids) {
  return h('section', { class: 'psec' }, title ? h('h3', {}, title) : null, ...kids);
}
export const row = (...kids) => h('div', { class: 'brow' }, ...kids);

export function renderProps(app, host) {
  const objs = app.selected;
  host.innerHTML = '';
  if (!objs.length) { host.append(docProps(app)); return; }
  const one = objs.length === 1 ? objs[0] : null;
  const parts = [];
  parts.push(h('div', { class: 'phead' }, h('strong', {}, one ? one.name || typeName(one) : `${objs.length} عناصر`), one ? h('small', {}, typeName(one)) : null));
  if (one?.type === 'text') parts.push(textProps(app, one));
  if (one?.live) parts.push(section('النسخة الحيّة', h('p', { class: 'hint' }, 'هذا الشكل محفوظة معه نسخة حيّة مخفية من النص.'),
    row(btn('restore', 'عودة للنسخة الحيّة', () => restoreLive(app, one)))));
  for (const fn of extraSections) { const n = fn(app, objs); if (n) parts.push(n); }
  const styled = objs.filter((o) => o.style);
  if (styled.length) parts.push(styleEditor(app, styled));
  parts.push(transformProps(app, objs));
  parts.push(arrangeProps(app, objs));
  host.append(...parts);
}

export function typeName(o) {
  return { text: 'نص حيّ', path: 'شكل متجهي', letters: 'حروف حيّة', image: 'صورة', group: 'مجموعة', kufi: 'كوفي مربع' }[o.type] || o.type;
}

function docProps(app) {
  const d = app.doc;
  const sizes = [['1080x1080', 'مربع 1080'], ['1080x1350', 'عمودي 1080×1350'], ['1920x1080', 'أفقي 1920×1080'], ['2480x3508', 'A4 للطباعة'], ['4000x4000', 'كبير 4000'], ['custom', 'مخصص']];
  const cur = `${d.width}x${d.height}`;
  const wIn = h('input', { type: 'number', value: d.width, class: 'num', min: 50, max: 20000 });
  const hIn = h('input', { type: 'number', value: d.height, class: 'num', min: 50, max: 20000 });
  const applySize = (w, hh) => { d.width = +w; d.height = +hh; app.commit('حجم اللوحة'); app.emit('project'); app.render({ panels: true }); };
  wIn.addEventListener('change', () => applySize(wIn.value, hIn.value));
  hIn.addEventListener('change', () => applySize(wIn.value, hIn.value));
  const s = app.settings;
  const toggle = (key, label, ic) => btn(ic, label, () => { s[key] = !s[key]; app.saveSettings?.(); app.render({ panels: true }); }, { active: s[key], class: 'toggle' });
  return h('div', {},
    h('div', { class: 'phead' }, h('strong', {}, 'اللوحة'), h('small', {}, 'لا يوجد عنصر محدد')),
    section('المقاس',
      field('قالب', select(sizes, sizes.some(([v]) => v === cur) ? cur : 'custom', (v) => { if (v !== 'custom') { const [w, hh] = v.split('x'); applySize(w, hh); } })),
      row(field('العرض', wIn), field('الارتفاع', hIn))),
    section('الخلفية',
      row(btn(null, 'شفافة', () => { d.background = null; app.commit('خلفية'); app.render({ panels: true }); }, { active: !d.background, class: 'toggle' }),
        field('لون', colorInput(d.background || '#ffffff', (c) => { d.background = c; app.commit('خلفية'); app.render({ panels: true }); }, { onInput: (c) => { d.background = c; app.render(); } })))),
    section('أدوات مساعدة',
      row(toggle('grid', 'شبكة', 'grid'), toggle('rulers', 'مساطر', 'ruler'), toggle('snap', 'التقاط', 'magnet')),
      slider('حجم الشبكة', s.gridSize, { min: 5, max: 200, step: 5, onInput: (v) => { s.gridSize = v; app.render(); }, onChange: () => app.saveSettings?.() }),
      row(btn('guide', 'دليل رأسي', () => { d.guides.push({ axis: 'x', pos: d.width / 2 }); app.commit('دليل'); app.render(); }),
        btn('guide', 'دليل أفقي', () => { d.guides.push({ axis: 'y', pos: d.height / 2 }); app.commit('دليل'); app.render(); }),
        d.guides.length ? btn('trash', 'حذف الأدلة', () => { d.guides = []; app.commit('أدلة'); app.render({ panels: true }); }) : null),
      h('p', { class: 'hint' }, 'اسحب من المسطرة لإضافة دليل، وأعِده إليها لحذفه.')),
    referenceProps(app),
    h('p', { class: 'hint' }, 'ابدأ بأداة «كتابة» ثم المس اللوحة.'));
}

function referenceProps(app) {
  const d = app.doc;
  const r = d.reference;
  const load = async () => {
    const [f] = await pickFile('image/*');
    if (!f) return;
    const src = await fileToDataURL(f);
    const img = await loadImg(src);
    const k = Math.min(d.width / img.width, d.height / img.height);
    d.reference = { src, w: img.width * k, h: img.height * k, x: (d.width - img.width * k) / 2, y: (d.height - img.height * k) / 2, opacity: 0.35, visible: true };
    app.commit('صورة مرجعية'); app.render({ panels: true });
  };
  return section('صورة مرجعية (لا تُصدَّر)',
    r ? h('div', {},
      slider('الشفافية', Math.round((r.opacity ?? 0.35) * 100), { min: 5, max: 100, unit: '%', onInput: (v) => { r.opacity = v / 100; app.render(); }, onChange: () => app.commit('مرجع') }),
      slider('الحجم', 100, { min: 10, max: 300, unit: '%', onChange: (v) => { const cx = r.x + r.w / 2, cy = r.y + r.h / 2; r.w *= v / 100; r.h *= v / 100; r.x = cx - r.w / 2; r.y = cy - r.h / 2; app.commit('مرجع'); app.render({ panels: true }); } }),
      row(btn(r.visible === false ? 'eyeOff' : 'eye', r.visible === false ? 'إظهار' : 'إخفاء', () => { r.visible = r.visible === false; app.commit('مرجع'); app.render({ panels: true }); }),
        btn('image', 'تبديل', load), btn('trash', 'إزالة', () => { d.reference = null; app.commit('مرجع'); app.render({ panels: true }); })))
      : row(btn('image', 'اختيار صورة مرجعية', load)));
}

export function fileToDataURL(f) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
}
export function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function textProps(app, o) {
  const ta = h('textarea', { rows: 2, dir: 'rtl', class: 'textedit', value: o.text, spellcheck: false });
  ta.addEventListener('input', () => { keepAnchor(o, () => { o.text = ta.value; prune(o); }); app.render(); });
  ta.addEventListener('change', () => { app.commit('تعديل النص'); });
  ta.addEventListener('blur', () => { app.commit('تعديل النص'); });
  const fi = fontInfo(o.fontId);
  const fh = getFontSync(o.fontId);
  const set = (k, label) => (v) => { keepAnchor(o, () => { o[k] = v; }); app.lastTextProps = { ...(app.lastTextProps || {}), [k]: v }; app.render(); };
  const done = (label) => () => app.commit(label);
  const alts = fh?.altFeatures?.filter((t) => /^(ss\d\d|salt|swsh|cv\d\d)$/.test(t)) || [];
  const marks = 'ً-ْ';
  return h('div', {},
    section('النص',
      ta,
      row(btn(null, 'إضافة تشكيل', () => openTashkeel(ta, o, app), { class: 'small' }),
        btn(null, 'إزالة التشكيل', () => { keepAnchor(o, () => { o.text = o.text.replace(new RegExp(`[${marks}ٰ]`, 'g'), ''); prune(o); }); app.commit('إزالة التشكيل'); app.render({ panels: true }); }, { class: 'small' }))),
    section('الخط',
      h('button', { class: 'fontbtn', type: 'button', onClick: () => openFontPicker(app, o) }, icon('font'), h('span', {}, fi.name), h('small', {}, fi.style)),
      slider('الحجم', o.size, { min: 8, max: 1200, step: 1, unit: 'بكسل', onInput: set('size'), onChange: done('حجم الخط') }),
      slider('تباعد الحروف', o.letterSpacing, { min: -200, max: 1000, step: 5, unit: '‰', onInput: set('letterSpacing'), onChange: done('تباعد') }),
      slider('تباعد الكلمات', o.wordSpacing, { min: -300, max: 2000, step: 10, unit: '‰', onInput: set('wordSpacing'), onChange: done('تباعد الكلمات') }),
      slider('ارتفاع السطر', o.lineHeight, { min: 0.6, max: 4, step: 0.05, onInput: set('lineHeight'), onChange: done('ارتفاع السطر') }),
      row(...[['right', 'txtRight', 'يمين'], ['center', 'txtCenter', 'وسط'], ['left', 'txtLeft', 'يسار']].map(([v, ic, l]) =>
        btn(ic, l, () => { o.align = v; app.commit('محاذاة'); app.render({ panels: true }); }, { active: o.align === v, class: 'toggle small' })))),
    section('التطويل (الكشيدة)',
      h('p', { class: 'hint' }, 'اضغط «مقابض التطويل» ثم اسحب المقبض بين حرفين متصلين لمدّ الوصلة؛ تُرسم الكشيدة منحنية.'),
      row(btn('kashida', 'مقابض التطويل', () => app.setTool(app.tool === 'kashida' ? 'select' : 'kashida'), { active: app.tool === 'kashida', class: 'toggle' }),
        Object.keys(o.kashida || {}).length ? btn('restore', 'إلغاء التطويل', () => { keepAnchor(o, () => { o.kashida = {}; }); app.commit('إلغاء التطويل'); app.render({ panels: true }); }) : null),
      slider('انحناء الكشيدة', o.kashidaCurve ?? 0.5, { min: 0, max: 1.5, step: 0.05, onInput: (v) => { o.kashidaCurve = v; app.render(); }, onChange: done('انحناء الكشيدة') })),
    alts.length ? section('أشكال بديلة في الخط',
      h('p', { class: 'hint' }, 'مجموعات أسلوبية يوفّرها هذا الخط، تُطبَّق على النص كله. للتطبيق على حرف واحد استعمل «فكّ الكلمة».'),
      h('div', { class: 'chips' }, alts.map((t) => {
        const on = o.features.includes(t);
        return h('button', { type: 'button', class: `chip ${on ? 'on' : ''}`, onClick: () => { keepAnchor(o, () => { o.features = on ? o.features.filter((x) => x !== t) : [...o.features, t]; }); app.commit('شكل بديل'); app.render({ panels: true }); } }, featureLabel(t));
      }))) : null,
    section('تحويل',
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: app.settings.keepLive, onChange: (e) => { app.settings.keepLive = e.target.checked; app.saveSettings?.(); } }), 'احتفظ بنسخة حيّة مخفية'),
      row(btn('outline', 'تحويل إلى أشكال', () => convertSelection(app), { class: 'primary' }))),
  );
}

function featureLabel(t) {
  if (/^ss\d\d$/.test(t)) return `مجموعة ${+t.slice(2)}`;
  return { salt: 'بديل', swsh: 'زخرفي', jalt: 'نهاية بديلة' }[t] || t;
}

/** Drop kashida entries that no longer point inside the text. */
function prune(o) {
  if (!o.kashida) return;
  for (const k of Object.keys(o.kashida)) if (+k >= o.text.length - 1) delete o.kashida[k];
}

function openTashkeel(ta, o, app) {
  const marks = [['َ', 'فتحة'], ['ُ', 'ضمة'], ['ِ', 'كسرة'], ['ْ', 'سكون'], ['ّ', 'شدّة'], ['ً', 'تنوين فتح'], ['ٌ', 'تنوين ضم'], ['ٍ', 'تنوين كسر'], ['ٰ', 'ألف خنجرية'], ['ـ', 'تطويل ـ']];
  const bar = ta.parentElement.querySelector('.tashkeel');
  if (bar) { bar.remove(); return; }
  const insert = (m) => {
    const pos = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, pos) + m + ta.value.slice(pos);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + m.length;
    keepAnchor(o, () => { o.text = ta.value; });
    app.render();
    app.commit('تشكيل');
  };
  ta.after(h('div', { class: 'chips tashkeel' }, h('small', { class: 'hint' }, 'ضع المؤشر بعد الحرف ثم اختر:'),
    marks.map(([m, l]) => h('button', { type: 'button', class: 'chip big', onClick: () => insert(m), title: l }, h('span', { class: 'mk' }, `ـ${m}`), h('small', {}, l)))));
}

export function convertSelection(app) {
  const ids = [];
  for (const o of app.selected) {
    if (o.type === 'path' || o.type === 'image' || o.type === 'group') { ids.push(o.id); continue; }
    const p = toOutlines(o, { keepLive: app.settings.keepLive });
    app.replace(o.id, p);
    ids.push(p.id);
  }
  app.selection = ids;
  app.commit('تحويل إلى أشكال');
  toast('تم التحويل إلى أشكال. يمكنك الآن تعديل النقاط.');
  app.render({ panels: true });
}

async function restoreLive(app, o) {
  const live = JSON.parse(JSON.stringify(o.live));
  live.m = o.m.slice();
  live.id = uid(live.type[0]);
  await ensureFont(live.fontId || 'amiri').catch(() => {});
  app.replace(o.id, live);
  app.selection = [live.id];
  app.commit('عودة للنسخة الحيّة');
  toast('عادت النسخة الحيّة (تعديلات الأشكال لم تنتقل إليها)');
  app.render({ panels: true });
}

function transformProps(app, objs) {
  const b = unionBounds(objs.map(worldBounds));
  const one = objs.length === 1 ? objs[0] : null;
  const dec = one ? decompose(one.m) : null;
  const applyD = (D, label) => { objs.forEach((o) => { o.m = mul(D, o.m); }); app.commit(label); app.render({ panels: true }); };
  const n = (v) => Math.round(v * 10) / 10;
  const xIn = h('input', { type: 'number', class: 'num', value: n(b.x) });
  const yIn = h('input', { type: 'number', class: 'num', value: n(b.y) });
  const wIn = h('input', { type: 'number', class: 'num', value: n(b.w), min: 1 });
  const hIn = h('input', { type: 'number', class: 'num', value: n(b.h), min: 1 });
  const rIn = h('input', { type: 'number', class: 'num', value: dec ? n(dec.rot) : 0, step: 1 });
  xIn.onchange = () => applyD(translate(+xIn.value - b.x, 0), 'موضع');
  yIn.onchange = () => applyD(translate(0, +yIn.value - b.y), 'موضع');
  wIn.onchange = () => { const k = +wIn.value / b.w; applyD(scaleM(k, app.settings.keepRatio ? k : 1, b.x, b.y), 'حجم'); };
  hIn.onchange = () => { const k = +hIn.value / b.h; applyD(scaleM(app.settings.keepRatio ? k : 1, k, b.x, b.y), 'حجم'); };
  rIn.onchange = () => applyD(rotateM(+rIn.value - (dec ? dec.rot : 0), b.x + b.w / 2, b.y + b.h / 2), 'تدوير');
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const W = app.doc.width, H = app.doc.height;
  const alignTo = (fn, label) => () => {
    if (objs.length > 1) {
      objs.forEach((o) => { const ob = worldBounds(o); o.m = mul(fn(ob, b), o.m); });
    } else {
      const board = { x: 0, y: 0, w: W, h: H };
      objs.forEach((o) => { const ob = worldBounds(o); o.m = mul(fn(ob, board), o.m); });
    }
    app.commit(label); app.render({ panels: true });
  };
  const distribute = (axis) => () => {
    const list = objs.map((o) => ({ o, b: worldBounds(o) })).sort((p, q) => (axis === 'x' ? p.b.x - q.b.x : p.b.y - q.b.y));
    if (list.length < 3) return toast('التوزيع يحتاج ثلاثة عناصر أو أكثر');
    const first = list[0].b, last = list[list.length - 1].b;
    const c0 = axis === 'x' ? first.x + first.w / 2 : first.y + first.h / 2;
    const c1 = axis === 'x' ? last.x + last.w / 2 : last.y + last.h / 2;
    list.forEach(({ o, b: ob }, i) => {
      const target = c0 + ((c1 - c0) * i) / (list.length - 1);
      const cur = axis === 'x' ? ob.x + ob.w / 2 : ob.y + ob.h / 2;
      o.m = mul(axis === 'x' ? translate(target - cur, 0) : translate(0, target - cur), o.m);
    });
    app.commit('توزيع'); app.render({ panels: true });
  };
  return section('الموضع والحجم',
    row(field('س', xIn), field('ص', yIn)),
    row(field('العرض', wIn), field('الارتفاع', hIn), field('الدوران°', rIn)),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: app.settings.keepRatio, onChange: (e) => { app.settings.keepRatio = e.target.checked; app.saveSettings?.(); } }), 'حافظ على النسبة'),
    row(btn('flipH', 'قلب أفقي', () => applyD(scaleM(-1, 1, cx, cy), 'قلب')), btn('flipV', 'قلب رأسي', () => applyD(scaleM(1, -1, cx, cy), 'قلب')),
      btn('rotate', '90°', () => applyD(rotateM(90, cx, cy), 'تدوير'))),
    h('h4', {}, objs.length > 1 ? 'محاذاة العناصر معًا' : 'محاذاة إلى اللوحة'),
    row(
      btn('alignR', 'يمين', alignTo((ob, t) => translate(t.x + t.w - (ob.x + ob.w), 0), 'محاذاة'), { iconOnly: true }),
      btn('alignCH', 'وسط أفقي', alignTo((ob, t) => translate(t.x + t.w / 2 - (ob.x + ob.w / 2), 0), 'محاذاة'), { iconOnly: true }),
      btn('alignL', 'يسار', alignTo((ob, t) => translate(t.x - ob.x, 0), 'محاذاة'), { iconOnly: true }),
      btn('alignT', 'أعلى', alignTo((ob, t) => translate(0, t.y - ob.y), 'محاذاة'), { iconOnly: true }),
      btn('alignCV', 'وسط رأسي', alignTo((ob, t) => translate(0, t.y + t.h / 2 - (ob.y + ob.h / 2)), 'محاذاة'), { iconOnly: true }),
      btn('alignB', 'أسفل', alignTo((ob, t) => translate(0, t.y + t.h - (ob.y + ob.h)), 'محاذاة'), { iconOnly: true })),
    objs.length > 2 ? row(btn('distH', 'توزيع أفقي', distribute('x')), btn('distV', 'توزيع رأسي', distribute('y'))) : null,
  );
}

function arrangeProps(app, objs) {
  return section('الترتيب والعمق',
    row(btn('front', 'أعلى الكل', () => app.arrange('top'), { iconOnly: true }), btn('up', 'إلى الأمام', () => app.arrange('up'), { iconOnly: true }),
      btn('down', 'إلى الخلف', () => app.arrange('down'), { iconOnly: true }), btn('back', 'أسفل الكل', () => app.arrange('bottom'), { iconOnly: true })),
    row(btn('copy', 'تكرار', () => app.duplicateSelection()), btn('trash', 'حذف', () => app.deleteSelection(), { class: 'danger' })),
    objs.some((o) => o.type !== 'path' && o.type !== 'image' && o.type !== 'group' && o.type !== 'text')
      ? row(btn('outline', 'تحويل إلى أشكال', () => convertSelection(app))) : null,
    objs.length > 1 ? row(btn('group', 'تجميع', () => app.emit('group'))) : null,
    objs.length === 1 && objs[0].type === 'group' ? row(btn('ungroup', 'فك التجميع', () => app.emit('ungroup'))) : null,
  );
}

/* ------------------------------ Layers ------------------------------ */
export function renderLayers(app, host) {
  host.innerHTML = '';
  const objs = app.doc.objects;
  const list = h('ul', { class: 'layers' });
  if (!objs.length) host.append(h('p', { class: 'hint' }, 'لا توجد طبقات بعد.'));
  [...objs].reverse().forEach((o) => {
    const sel = app.selection.includes(o.id);
    const name = h('span', { class: 'lname', title: 'لمستان لإعادة التسمية' }, o.name || typeName(o));
    name.addEventListener('dblclick', () => {
      const inp = h('input', { value: o.name || '', class: 'rename' });
      name.replaceWith(inp); inp.focus(); inp.select();
      const fin = () => { o.name = inp.value.trim() || o.name; app.commit('إعادة تسمية'); app.render({ panels: true }); };
      inp.addEventListener('blur', fin); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
    });
    const li = h('li', { class: `layer ${sel ? 'sel' : ''} ${o.visible === false ? 'hidden' : ''}`, 'data-id': o.id },
      h('span', { class: 'grip', title: 'اسحب لتغيير الترتيب' }, icon('grip', 22)),
      h('span', { class: 'ltype' }, icon({ text: 'text', path: 'nodes', letters: 'explode', image: 'image', group: 'group', kufi: 'kufi' }[o.type] || 'square', 20)),
      name,
      o.live ? h('span', { class: 'badge-live', title: 'معه نسخة حيّة مخفية' }, 'حيّ') : null,
      btn(o.visible === false ? 'eyeOff' : 'eye', o.visible === false ? 'إظهار' : 'إخفاء', (e) => { e.stopPropagation(); o.visible = o.visible === false; app.commit('إظهار/إخفاء'); app.render({ panels: true }); }, { iconOnly: true, class: 'ghost small', size: 22 }),
      btn(o.locked ? 'lock' : 'unlock', o.locked ? 'فك القفل' : 'قفل', (e) => { e.stopPropagation(); o.locked = !o.locked; app.commit('قفل'); app.render({ panels: true }); }, { iconOnly: true, class: `ghost small ${o.locked ? 'on' : ''}`, size: 22 }));
    li.addEventListener('click', (e) => { if (e.target.closest('.btn,.grip,input')) return; app.select(o.id, { add: e.shiftKey || e.ctrlKey }); });
    li.querySelector('.grip').addEventListener('pointerdown', (e) => startLayerDrag(e, app, li, list));
    list.append(li);
  });
  host.append(list);
}

function startLayerDrag(e, app, li, list) {
  e.preventDefault();
  const id = li.getAttribute('data-id');
  const items = [...list.children];
  const rects = items.map((x) => x.getBoundingClientRect());
  const startY = e.clientY;
  li.classList.add('dragging');
  const grip = e.currentTarget;
  grip.setPointerCapture(e.pointerId);
  let target = items.indexOf(li);
  const move = (ev) => {
    const dy = ev.clientY - startY;
    li.style.transform = `translateY(${dy}px)`;
    const y = ev.clientY;
    target = rects.findIndex((r) => y < r.top + r.height / 2);
    if (target < 0) target = items.length - 1;
    items.forEach((x, i) => x.classList.toggle('drop-before', i === target && x !== li));
  };
  const up = () => {
    grip.removeEventListener('pointermove', move);
    grip.removeEventListener('pointerup', up);
    grip.removeEventListener('pointercancel', up);
    li.style.transform = '';
    li.classList.remove('dragging');
    // list is shown top-first; convert to doc order (bottom-first)
    const objs = app.doc.objects;
    const from = objs.findIndex((o) => o.id === id);
    const [obj] = objs.splice(from, 1);
    const visualIdx = Math.max(0, Math.min(items.length - 1, target));
    const docIdx = Math.max(0, Math.min(objs.length, items.length - 1 - visualIdx));
    objs.splice(docIdx, 0, obj);
    app.commit('ترتيب الطبقات');
    app.render({ panels: true });
  };
  grip.addEventListener('pointermove', move);
  grip.addEventListener('pointerup', up);
  grip.addEventListener('pointercancel', up);
}

export { apply };
