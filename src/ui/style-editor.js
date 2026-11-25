// Style (appearance) editor. Phase 1: one solid fill + strokes.
// Later phases register richer editors through `registerStyleSection`.
import { h, btn, slider, colorInput, field, select } from './dom.js';
import { section, row } from './panels.js';

const more = [];
export function registerStyleSection(fn) { more.push(fn); }

export const SWATCHES = ['#1b1b1b', '#ffffff', '#c9a227', '#8b5a2b', '#7a1f1f', '#0f5132', '#0b3d91', '#5b2a86', '#d4af37', '#b87333', '#2f4f4f', '#e8dcc0'];

export function swatchRow(onPick, extra = []) {
  return h('div', { class: 'swatches' }, [...extra, ...SWATCHES].map((c) => h('button', { type: 'button', class: 'sw', style: { background: c }, title: c, 'aria-label': c, onClick: () => onPick(c) })));
}

export function styleEditor(app, objs) {
  const st = objs[0].style;
  const each = (fn) => objs.forEach((o) => o.style && fn(o.style));
  const commit = (l = 'تنسيق') => { app.commit(l); app.render({ panels: true }); };
  const fill0 = st.fills?.[0];
  const palette = app.palette || [];
  const fillSec = section('التعبئة',
    fill0 && fill0.type === 'solid' ? row(
      field('اللون', colorInput(fill0.color, (c) => { each((s) => { s.fills[0] = { ...s.fills[0], type: 'solid', color: c }; }); commit('لون'); }, { onInput: (c) => { each((s) => { if (s.fills[0]) s.fills[0].color = c; }); app.render(); } })),
      btn(null, 'بلا تعبئة', () => { each((s) => { s.fills = []; }); commit('تعبئة'); }, { class: 'small' }))
      : row(btn('fill', fill0 ? 'لون واحد' : 'إضافة تعبئة', () => { each((s) => { s.fills = [{ type: 'solid', color: '#1b1b1b', opacity: 1 }]; }); commit('تعبئة'); })),
    swatchRow((c) => { each((s) => { s.fills = [{ ...(s.fills[0] || {}), type: 'solid', color: c, opacity: s.fills[0]?.opacity ?? 1 }]; }); commit('لون'); }, palette),
  );
  const strokes = st.strokes || [];
  const strokeSec = section('الحدّ',
    ...strokes.map((s, i) => h('div', { class: 'subcard' },
      row(field('اللون', colorInput(s.color, (c) => { each((x) => { if (x.strokes[i]) x.strokes[i].color = c; }); commit('لون الحد'); }, { onInput: (c) => { each((x) => { if (x.strokes[i]) x.strokes[i].color = c; }); app.render(); } })),
        field('الموضع', select([['outside', 'خارج'], ['center', 'منتصف'], ['inside', 'داخل']], s.align || 'center', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].align = v; }); commit('موضع الحد'); })),
        btn('trash', 'حذف الحد', () => { each((x) => x.strokes.splice(i, 1)); commit('حذف حد'); }, { iconOnly: true, class: 'ghost' })),
      slider('السماكة', s.width, { min: 0.5, max: 80, step: 0.5, onInput: (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].width = v; }); app.render(); }, onChange: () => app.commit('سماكة') }),
      row(field('النهايات', select([['round', 'مستديرة'], ['butt', 'مقطوعة'], ['square', 'مربعة']], s.cap || 'round', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].cap = v; }); commit('نهايات'); })),
        field('الزوايا', select([['round', 'مستديرة'], ['miter', 'حادة'], ['bevel', 'مشطوفة']], s.join || 'round', (v) => { each((x) => { if (x.strokes[i]) x.strokes[i].join = v; }); commit('زوايا'); }))))),
    row(btn('plus', strokes.length ? 'حدّ إضافي' : 'إضافة حدّ', () => {
      each((x) => { x.strokes = x.strokes || []; x.strokes.push({ color: x.strokes.length ? '#c9a227' : '#000000', width: x.strokes.length ? 6 : 4, align: 'outside', cap: 'round', join: 'round' }); });
      commit('إضافة حد');
    })),
    strokes.length > 1 ? h('p', { class: 'hint' }, 'الحدود الخارجية تتراكم: الأول ملاصق للشكل، والذي بعده حوله.') : null,
  );
  const opacity = slider('الشفافية', Math.round((st.opacity ?? 1) * 100), { min: 0, max: 100, unit: '%', onInput: (v) => { each((s) => { s.opacity = v / 100; }); app.render(); }, onChange: () => app.commit('شفافية') });
  return h('div', {}, fillSec, strokeSec, ...more.map((fn) => fn(app, objs)).filter(Boolean), section('', opacity));
}
