// Appearance editor (Illustrator «Appearance»-like): several fills (solid,
// linear/radial gradient, pattern, image), several strokes (inside / centre
// / outside, cumulative), contour, shadow, glow, extrude, presets and the
// personal colour library.
import { h, btn, slider, colorInput, field, select, toast, pickFile } from './dom.js';
import { section, row } from './panels.js';
import { PATTERNS } from '../core/render.js';
import { Store } from '../core/store.js';

const more = [];
export function registerStyleSection(fn) { more.push(fn); }

export const SWATCHES = ['#1b1b1b', '#ffffff', '#c9a227', '#8b5a2b', '#7a1f1f', '#0f5132', '#0b3d91', '#5b2a86', '#d4af37', '#b87333', '#2f4f4f', '#e8dcc0'];

export const DEFAULT_PALETTES = [
  { name: 'ذهبي', colors: ['#fff3c4', '#f2d27a', '#d4af37', '#b8860b', '#7a5a00', '#3b2a00'] },
  { name: 'عثماني', colors: ['#7a1f1f', '#0f5132', '#0b3d91', '#c9a227', '#e8dcc0', '#1b1b1b'] },
  { name: 'حبر وورق', colors: ['#111111', '#3a3a3a', '#8a7f6a', '#e8dcc0', '#f7f1e3', '#ffffff'] },
  { name: 'حديث', colors: ['#ff5a5f', '#ffb400', '#00a699', '#007a87', '#5b2a86', '#222222'] },
];

export const PRESETS = [
  { name: 'حبر أسود', style: { fills: [{ type: 'solid', color: '#111111', opacity: 1 }], strokes: [], shadow: null, glow: null, extrude: null, contour: null } },
  { name: 'ذهب مذهّب', style: { fills: [{ type: 'linear', angle: 90, stops: [{ offset: 0, color: '#fff3c4' }, { offset: 0.45, color: '#d4af37' }, { offset: 1, color: '#7a5a00' }] }], strokes: [{ color: '#3b2a00', width: 3, align: 'outside', cap: 'round', join: 'round' }], shadow: { dx: 4, dy: 6, blur: 5, color: '#000000', opacity: 0.35 }, glow: null, extrude: null, contour: null } },
  { name: 'حد ذهبي وأسود', style: { fills: [{ type: 'solid', color: '#0b3d91', opacity: 1 }], strokes: [{ color: '#111111', width: 4, align: 'outside', cap: 'round', join: 'round' }, { color: '#d4af37', width: 6, align: 'outside', cap: 'round', join: 'round' }], shadow: null, glow: null, extrude: null, contour: null } },
  { name: 'توهج', style: { fills: [{ type: 'solid', color: '#fffbe6', opacity: 1 }], strokes: [], shadow: null, glow: { blur: 10, color: '#ffc400', opacity: 0.95, strength: 2 }, extrude: null, contour: null } },
  { name: 'بارز', style: { fills: [{ type: 'linear', angle: 90, stops: [{ offset: 0, color: '#e8dcc0' }, { offset: 1, color: '#b8a888' }] }], strokes: [], shadow: null, glow: null, extrude: { depth: 14, angle: 45, color: '#5c4a2a' }, contour: null } },
  { name: 'خطوط متكررة', style: { fills: [{ type: 'solid', color: '#7a1f1f', opacity: 1 }], strokes: [], shadow: null, glow: null, extrude: null, contour: { count: 3, distance: 9, width: 2, color: '#7a1f1f', direction: 'out' } } },
  { name: 'نقش منقّط', style: { fills: [{ type: 'pattern', pattern: 'dots', color: '#d4af37', bg: '#0f5132', scale: 14 }], strokes: [{ color: '#d4af37', width: 2, align: 'outside', cap: 'round', join: 'round' }], shadow: null, glow: null, extrude: null, contour: null } },
];

export function swatchRow(onPick, extra = []) {
  return h('div', { class: 'swatches' }, [...extra, ...SWATCHES].map((c) => h('button', { type: 'button', class: 'sw', style: { background: c }, title: c, 'aria-label': c, onClick: () => onPick(c) })));
}

const fillColor = (f) => (f.type === 'solid' ? f.color : f.stops?.[0]?.color || f.color || '#000000');

export function styleEditor(app, objs) {
  const st = objs[0].style;
  const each = (fn) => objs.forEach((o) => o.style && fn(o.style));
  const live = () => app.render();
  const commit = (l = 'تنسيق') => { app.preview(l); app.render({ panels: true }); };
  const fills = st.fills || [];
  const strokes = st.strokes || [];

  /* ---------- presets ---------- */
  const presets = section('أنماط جاهزة',
    h('div', { class: 'presets' }, PRESETS.map((p) => h('button', {
      type: 'button', class: 'preset', onClick: () => { each((s) => Object.assign(s, JSON.parse(JSON.stringify(p.style)))); commit('نمط جاهز'); },
    }, h('span', { class: 'pv', style: previewCSS(p.style) }, 'خط'), h('small', {}, p.name)))));

  /* ---------- fills ---------- */
  const fillCards = fills.map((f, i) => fillCard(app, objs, f, i, each, live, commit));
  const fillSec = section('التعبئة',
    ...fillCards,
    row(btn('plus', fills.length ? 'تعبئة إضافية' : 'إضافة تعبئة', () => { each((s) => { s.fills = s.fills || []; s.fills.unshift({ type: 'solid', color: '#1b1b1b', opacity: 1 }); }); commit('إضافة تعبئة'); }, { class: 'small' }),
      fills.length ? btn(null, 'بلا تعبئة', () => { each((s) => { s.fills = []; }); commit('بلا تعبئة'); }, { class: 'small' }) : null),
    fills.length > 1 ? h('p', { class: 'hint' }, 'التعبئة الأولى في القائمة هي الأعلى.') : null);

  /* ---------- strokes ---------- */
  const strokeSec = section('الحدود (يمكن أكثر من حد)',
    ...strokes.map((s, i) => h('div', { class: 'subcard' },
      row(field('اللون', colorInput(s.color, (c) => { each((x) => { if (x.strokes[i]) x.strokes[i].color = c; }); commit('لون الحد'); }, { onInput: (c) => { each((x) => { if (x.strokes[i]) x.strokes[i].color = c; }); live(); } })),
        field('الموضع', select([['outside', 'خارج'], ['center', 'منتصف'], ['inside', 'داخل']], s.align || 'center', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].align = v; }); commit('موضع الحد'); })),
        btn('up', 'للأعلى', () => { each((x) => { if (i > 0) [x.strokes[i - 1], x.strokes[i]] = [x.strokes[i], x.strokes[i - 1]]; }); commit('ترتيب الحدود'); }, { iconOnly: true, class: 'ghost small', disabled: i === 0 }),
        btn('trash', 'حذف الحد', () => { each((x) => x.strokes.splice(i, 1)); commit('حذف حد'); }, { iconOnly: true, class: 'ghost small' })),
      slider('السماكة', s.width, { min: 0.5, max: 80, step: 0.5, onInput: (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].width = v; }); live(); }, onChange: () => app.preview('سماكة') }),
      row(field('النهايات', select([['round', 'مستديرة'], ['butt', 'مقطوعة'], ['square', 'مربعة']], s.cap || 'round', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].cap = v; }); commit('نهايات'); })),
        field('الزوايا', select([['round', 'مستديرة'], ['miter', 'حادة'], ['bevel', 'مشطوفة']], s.join || 'round', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].join = v; }); commit('زوايا'); })),
        field('متقطع', select([['', 'متصل'], ['8 6', 'شرطات'], ['1 6', 'نقاط'], ['18 8 2 8', 'شرطة ونقطة']], s.dash || '', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].dash = v || null; }); commit('تقطيع'); }))))),
    row(btn('plus', strokes.length ? 'حدّ إضافي' : 'إضافة حدّ', () => {
      each((x) => { x.strokes = x.strokes || []; x.strokes.push({ color: x.strokes.length ? '#d4af37' : '#111111', width: x.strokes.length ? 6 : 4, align: 'outside', cap: 'round', join: 'round' }); });
      commit('إضافة حد');
    }, { class: 'small' })),
    strokes.length > 1 ? h('p', { class: 'hint' }, 'الحدود الخارجية تتراكم: الأول ملاصق للشكل والذي بعده حوله، فتصنع «حد ذهبي داخله حد أسود».') : null);

  /* ---------- effects ---------- */
  const fx = effectsSection(app, objs, st, each, live, commit);

  const opacity = slider('شفافية العنصر', Math.round((st.opacity ?? 1) * 100), { min: 0, max: 100, unit: '%', onInput: (v) => { each((s) => { s.opacity = v / 100; }); live(); }, onChange: () => app.preview('شفافية') });
  return h('div', {}, presets, fillSec, strokeSec, ...fx, colorLibrary(app, objs, each, commit), ...more.map((fn) => fn(app, objs)).filter(Boolean), section('', opacity));
}

function previewCSS(s) {
  const f = s.fills?.[0];
  let color = '#111';
  let bg = 'transparent';
  if (f?.type === 'solid') color = f.color;
  if (f?.type === 'linear') { bg = `linear-gradient(${180 - (f.angle ?? 90) + 90}deg, ${f.stops.map((x) => `${x.color} ${x.offset * 100}%`).join(',')})`; }
  if (f?.type === 'pattern') color = f.color;
  const stroke = (s.strokes || []).map((x) => `0 0 0 ${x.width / 3}px ${x.color}`);
  const css = { color, textShadow: [s.glow ? `0 0 8px ${s.glow.color}` : null, s.shadow ? `2px 3px 3px rgba(0,0,0,.4)` : null, s.extrude ? `2px 2px 0 ${s.extrude.color}, 4px 4px 0 ${s.extrude.color}` : null].filter(Boolean).join(',') || 'none', WebkitTextStroke: s.strokes?.[0] ? `1px ${s.strokes[s.strokes.length - 1].color}` : '' };
  if (bg !== 'transparent') Object.assign(css, { backgroundImage: bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' });
  return css;
}

function fillCard(app, objs, f, i, each, live, commit) {
  const setF = (patch, final) => { each((s) => { if (s.fills[i]) Object.assign(s.fills[i], patch); }); if (final) commit('تعبئة'); else live(); };
  const types = [['solid', 'لون'], ['linear', 'تدرج خطي'], ['radial', 'تدرج دائري'], ['pattern', 'نقش'], ['image', 'صورة داخل الحرف']];
  const changeType = (t) => {
    const base = fillColor(f);
    const next = t === 'solid' ? { type: 'solid', color: base, opacity: f.opacity ?? 1 }
      : t === 'linear' || t === 'radial' ? { type: t, angle: 90, stops: f.stops || [{ offset: 0, color: '#f2d27a' }, { offset: 1, color: base === '#1b1b1b' ? '#7a5a00' : base }] }
        : t === 'pattern' ? { type: 'pattern', pattern: 'dots', color: '#d4af37', bg: base, scale: 16 }
          : { type: 'image', src: f.src || null };
    each((s) => { s.fills[i] = JSON.parse(JSON.stringify(next)); });
    commit('نوع التعبئة');
    if (t === 'image' && !next.src) pickImage();
  };
  const pickImage = async () => {
    const [file] = await pickFile('image/*');
    if (!file) return;
    const src = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
    setF({ src }, true);
  };
  const kids = [row(field('النوع', select(types, f.type, changeType)),
    btn(f.visible === false ? 'eyeOff' : 'eye', 'إظهار/إخفاء', () => setF({ visible: f.visible === false }, true), { iconOnly: true, class: 'ghost small' }),
    i > 0 ? btn('up', 'للأعلى', () => { each((s) => { [s.fills[i - 1], s.fills[i]] = [s.fills[i], s.fills[i - 1]]; }); commit('ترتيب التعبئة'); }, { iconOnly: true, class: 'ghost small' }) : null,
    btn('trash', 'حذف', () => { each((s) => s.fills.splice(i, 1)); commit('حذف تعبئة'); }, { iconOnly: true, class: 'ghost small' }))];
  if (f.type === 'solid') {
    kids.push(row(field('اللون', colorInput(f.color, (c) => setF({ color: c }, true), { onInput: (c) => setF({ color: c }) })),
      field('الشفافية', slider('', Math.round((f.opacity ?? 1) * 100), { min: 0, max: 100, onInput: (v) => setF({ opacity: v / 100 }), onChange: () => app.preview('شفافية') }))));
    kids.push(swatchRow((c) => setF({ color: c }, true)));
  }
  if (f.type === 'linear' || f.type === 'radial') {
    const stops = f.stops || [];
    kids.push(h('div', { class: 'gradbar', style: { background: `linear-gradient(to left, ${stops.map((s) => `${s.color} ${s.offset * 100}%`).join(',')})` } }));
    stops.forEach((s, k) => kids.push(row(
      field(`لون ${k + 1}`, colorInput(s.color, (c) => { each((x) => { x.fills[i].stops[k].color = c; }); commit('تدرج'); }, { onInput: (c) => { each((x) => { x.fills[i].stops[k].color = c; }); live(); } })),
      field('الموضع', slider('', Math.round(s.offset * 100), { min: 0, max: 100, unit: '%', onInput: (v) => { each((x) => { x.fills[i].stops[k].offset = v / 100; }); live(); }, onChange: () => app.preview('تدرج') })),
      stops.length > 2 ? btn('minus', 'حذف اللون', () => { each((x) => x.fills[i].stops.splice(k, 1)); commit('تدرج'); }, { iconOnly: true, class: 'ghost small' }) : null)));
    kids.push(row(stops.length < 6 ? btn('plus', 'لون في التدرج', () => { each((x) => { x.fills[i].stops.push({ offset: 1, color: '#ffffff' }); x.fills[i].stops.sort((a, b) => a.offset - b.offset); }); commit('تدرج'); }, { class: 'small' }) : null,
      btn(null, 'عكس', () => { each((x) => { x.fills[i].stops = x.fills[i].stops.map((s) => ({ ...s, offset: 1 - s.offset })).reverse(); }); commit('عكس التدرج'); }, { class: 'small' })));
    if (f.type === 'linear') kids.push(slider('زاوية التدرج', f.angle ?? 90, { min: 0, max: 360, unit: '°', onInput: (v) => setF({ angle: v }), onChange: () => app.preview('زاوية') }));
    else kids.push(slider('اتساع التدرج', Math.round((f.r ?? 0.6) * 100), { min: 10, max: 150, unit: '%', onInput: (v) => setF({ r: v / 100 }), onChange: () => app.preview('اتساع') }));
  }
  if (f.type === 'pattern') {
    kids.push(row(field('النقش', select(Object.keys(PATTERNS).map((k) => [k, { dots: 'نقاط', stripes: 'خطوط', diagonal: 'مائل', grid: 'شبكة', diamonds: 'معيّنات', stars: 'نجوم ثمانية' }[k] || k]), f.pattern, (v) => setF({ pattern: v }, true))),
      field('لون النقش', colorInput(f.color, (c) => setF({ color: c }, true), { onInput: (c) => setF({ color: c }) })),
      field('الأرضية', colorInput(f.bg || '#ffffff', (c) => setF({ bg: c }, true), { onInput: (c) => setF({ bg: c }) }))));
    kids.push(slider('حجم النقش', f.scale || 16, { min: 4, max: 120, onInput: (v) => setF({ scale: v }), onChange: () => app.preview('حجم النقش') }));
    kids.push(slider('دوران النقش', f.rotate || 0, { min: 0, max: 180, unit: '°', onInput: (v) => setF({ rotate: v }), onChange: () => app.preview('دوران النقش') }));
  }
  if (f.type === 'image') {
    kids.push(row(f.src ? h('img', { src: f.src, class: 'fillthumb', alt: '' }) : null, btn('image', f.src ? 'تبديل الصورة' : 'اختيار صورة', pickImage, { class: 'small' })));
  }
  return h('div', { class: 'subcard' }, ...kids);
}

function effectsSection(app, objs, st, each, live, commit) {
  const toggle = (key, def, label) => btn(st[key] ? 'check' : 'plus', label, () => { each((s) => { s[key] = s[key] ? null : JSON.parse(JSON.stringify(def)); }); commit(label); }, { active: !!st[key], class: 'toggle small' });
  const num = (key, prop, label, opts) => slider(label, st[key][prop] ?? opts.def ?? 0, { ...opts, onInput: (v) => { each((s) => { if (s[key]) s[key][prop] = v; }); live(); }, onChange: () => app.preview(label) });
  const color = (key, prop, label) => field(label, colorInput(st[key][prop], (c) => { each((s) => { if (s[key]) s[key][prop] = c; }); commit(label); }, { onInput: (c) => { each((s) => { if (s[key]) s[key][prop] = c; }); live(); } }));
  const out = [];
  out.push(section('تأثيرات',
    row(toggle('contour', { count: 3, distance: 8, width: 2, color: '#7a1f1f', direction: 'out' }, 'Contour (حدود متكررة)'),
      toggle('shadow', { dx: 6, dy: 8, blur: 6, color: '#000000', opacity: 0.4 }, 'ظل'),
      toggle('glow', { blur: 10, color: '#ffc400', opacity: 0.9, strength: 1 }, 'توهج'),
      toggle('extrude', { depth: 12, angle: 45, color: '#4a3b22' }, 'تجسيم (بروز)')),
    st.contour ? h('div', { class: 'subcard' }, h('strong', {}, 'Contour'),
      row(field('الاتجاه', select([['out', 'للخارج'], ['in', 'للداخل']], st.contour.direction || 'out', (v) => { each((s) => { if (s.contour) s.contour.direction = v; }); commit('اتجاه'); })), color('contour', 'color', 'اللون')),
      num('contour', 'count', 'العدد', { min: 1, max: 12 }), num('contour', 'distance', 'المسافة', { min: 2, max: 60, step: 0.5 }), num('contour', 'width', 'سماكة الخط', { min: 0.5, max: 20, step: 0.5 })) : null,
    st.shadow ? h('div', { class: 'subcard' }, h('strong', {}, 'الظل'), row(color('shadow', 'color', 'اللون')),
      num('shadow', 'dx', 'إزاحة أفقية', { min: -60, max: 60 }), num('shadow', 'dy', 'إزاحة رأسية', { min: -60, max: 60 }), num('shadow', 'blur', 'التمويه', { min: 0, max: 40 }),
      slider('الكثافة', Math.round((st.shadow.opacity ?? 0.4) * 100), { min: 0, max: 100, unit: '%', onInput: (v) => { each((s) => { if (s.shadow) s.shadow.opacity = v / 100; }); live(); }, onChange: () => app.preview('ظل') })) : null,
    st.glow ? h('div', { class: 'subcard' }, h('strong', {}, 'التوهج'), row(color('glow', 'color', 'اللون')),
      num('glow', 'blur', 'الانتشار', { min: 1, max: 50 }), num('glow', 'strength', 'القوة', { min: 1, max: 3 })) : null,
    st.extrude ? h('div', { class: 'subcard' }, h('strong', {}, 'التجسيم'), row(color('extrude', 'color', 'لون الجانب')),
      num('extrude', 'depth', 'العمق', { min: 1, max: 80 }), num('extrude', 'angle', 'الزاوية', { min: 0, max: 360, unit: '°' })) : null));
  return out;
}

function colorLibrary(app, objs, each, commit) {
  const mine = app.palette || [];
  const save = async (list) => { app.palette = list; await Store.setMisc('palette', list); app.render({ panels: true }); };
  const apply = (c) => { each((s) => { s.fills = [{ type: 'solid', color: c, opacity: 1 }, ...(s.fills || []).slice(1)]; }); commit('لون من المكتبة'); };
  const current = objs[0].style.fills?.[0] ? fillColor(objs[0].style.fills[0]) : null;
  return section('مكتبة الألوان',
    h('div', { class: 'palrow' }, h('small', {}, 'لوحتي'),
      h('div', { class: 'swatches' }, mine.map((c, k) => h('button', { type: 'button', class: 'sw', style: { background: c }, title: `${c} — ضغطة مطوّلة للحذف`, onClick: () => apply(c),
        onContextmenu: (e) => { e.preventDefault(); save(mine.filter((_, j) => j !== k)); toast('حُذف اللون من لوحتك'); } })),
      current ? h('button', { type: 'button', class: 'sw add', title: 'أضف اللون الحالي إلى لوحتي', onClick: () => { if (!mine.includes(current)) save([...mine, current]); toast('أُضيف اللون إلى لوحتك'); } }, '+') : null)),
    ...DEFAULT_PALETTES.map((p) => h('div', { class: 'palrow' }, h('small', {}, p.name),
      h('div', { class: 'swatches' }, p.colors.map((c) => h('button', { type: 'button', class: 'sw', style: { background: c }, title: c, onClick: () => apply(c) }))))),
    h('p', { class: 'hint' }, 'الضغط المطوّل (أو الزر الأيمن) على لون في «لوحتي» يحذفه.'));
}
