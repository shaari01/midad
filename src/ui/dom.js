// Tiny DOM helpers + icons + toasts + sheets.
import { ICONS, FALLBACK } from './icons.js';
import { tr } from './i18n.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'value') el.value = v;
    else if ((k === 'title' || k === 'aria-label' || k === 'placeholder') && typeof v === 'string') el.setAttribute(k, tr(v));
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(tr(String(c))));
  }
  return el;
}


export function icon(name, size = 26) {
  const src = ICONS[name] || FALLBACK;
  const span = document.createElement('span');
  span.className = 'ic';
  span.innerHTML = src.replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`).replace(/stroke-width="2"/, 'stroke-width="1.8"');
  return span;
}

export function btn(iconName, label, onClick, opts = {}) {
  const b = h('button', {
    class: `btn ${opts.class || ''}`, type: 'button', title: opts.title || label, 'aria-label': opts.title || label,
    onClick, 'data-tool': opts.tool, disabled: opts.disabled,
  }, iconName ? icon(iconName, opts.size) : null, label && !opts.iconOnly ? h('span', { class: 'lbl' }, label) : null);
  if (opts.active) b.classList.add('active');
  return b;
}

let toastTimer;
export function toast(msg, kind = 'info', ms = 2600) {
  let t = document.getElementById('toast');
  if (!t) { t = h('div', { id: 'toast', role: 'status' }); document.body.append(t); }
  t.textContent = tr(msg);
  t.className = `show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, ms);
}

/** Modal sheet (bottom sheet on phones, centred dialog on laptops). */
export function openSheet(title, content, { wide = false, onClose } = {}) {
  closeSheet();
  const close = () => { closeSheet(); onClose?.(); };
  const sheet = h('div', { class: `sheet-backdrop`, id: 'sheet', onClick: (e) => { if (e.target.id === 'sheet') close(); } },
    h('div', { class: `sheet ${wide ? 'wide' : ''}`, role: 'dialog', 'aria-label': title },
      h('div', { class: 'sheet-head' }, h('h2', {}, title), btn('close', 'إغلاق', close, { iconOnly: true, class: 'ghost' })),
      h('div', { class: 'sheet-body' }, content)));
  document.body.append(sheet);
  return sheet;
}
export function closeSheet() { document.getElementById('sheet')?.remove(); }

export function field(label, control, extra) {
  return h('label', { class: 'field' }, h('span', { class: 'flabel' }, label), control, extra || null);
}

/** Number input + range slider pair. */
export function slider(label, value, { min = 0, max = 100, step = 1, unit = '', onInput, onChange }) {
  const num = h('input', { type: 'number', value: round(value), min, max, step, class: 'num', inputmode: 'decimal' });
  const rng = h('input', { type: 'range', value, min, max, step });
  const fire = (v, final) => { v = Number(v); if (Number.isNaN(v)) return; onInput?.(v); if (final) onChange?.(v); };
  rng.addEventListener('input', () => { num.value = round(rng.value); fire(rng.value, false); });
  rng.addEventListener('change', () => fire(rng.value, true));
  num.addEventListener('change', () => { rng.value = num.value; fire(num.value, true); });
  return h('div', { class: 'field slider' }, h('span', { class: 'flabel' }, label, unit ? h('small', {}, ` (${unit})`) : null), h('div', { class: 'srow' }, stepBtn(rng, num, fire, -1), guardRange(rng, num, fire), stepBtn(rng, num, fire, 1), num));
}

/** − / + buttons at the ends of a slider for exact steps with a finger. */
function stepBtn(rng, num, fire, dir) {
  const b = h('button', { type: 'button', class: 'sstep', 'aria-label': dir > 0 ? 'زيادة' : 'إنقاص', title: dir > 0 ? 'زيادة' : 'إنقاص' }, dir > 0 ? '+' : '−');
  b.addEventListener('click', () => {
    const min = Number(rng.min), max = Number(rng.max), step = Number(rng.step) || 1;
    const v = Math.min(max, Math.max(min, Math.round((Number(rng.value) + dir * step) / step) * step));
    rng.value = v; num.value = round(v); fire(v, true);
  });
  return b;
}

/** On touch screens a range only moves after a clear sideways drag, so
 *  scrolling the panel with a finger never changes a value by accident.
 *  The drag is relative (no jump to where the finger lands). */
function guardRange(rng, num, fire) {
  const wrap = h('div', { class: 'rangewrap' }, rng);
  let st = null;
  wrap.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return; // mouse uses the native range
    st = { x: e.clientX, y: e.clientY, v: Number(rng.value), on: false, id: e.pointerId };
  });
  wrap.addEventListener('pointermove', (e) => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.on) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { st = null; return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      st.on = true; st.x = e.clientX; wrap.classList.add('dragging');
      try { wrap.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    const min = Number(rng.min), max = Number(rng.max), step = Number(rng.step) || 1;
    const w = rng.getBoundingClientRect().width || 200;
    const rtl = getComputedStyle(rng).direction === 'rtl';
    let v = st.v + ((rtl ? -1 : 1) * (e.clientX - st.x) / w) * (max - min);
    v = Math.min(max, Math.max(min, Math.round(v / step) * step));
    if (String(v) !== rng.value) { rng.value = v; num.value = round(v); fire(v, false); }
  });
  const end = () => { if (st?.on) { wrap.classList.remove('dragging'); fire(rng.value, true); } st = null; };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', () => { if (st?.on) fire(rng.value, true); wrap.classList.remove('dragging'); st = null; });
  return wrap;
}
const round = (v) => Math.round(Number(v) * 100) / 100;

export function colorInput(value, onChange, { onInput } = {}) {
  const inp = h('input', { type: 'color', value: toHex(value), class: 'color' });
  inp.addEventListener('input', () => onInput?.(inp.value));
  inp.addEventListener('change', () => onChange(inp.value));
  return inp;
}
export function toHex(c) {
  if (!c) return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map((x) => x + x).join('');
  return '#000000';
}

export function select(options, value, onChange) {
  const s = h('select', { onChange: () => onChange(s.value) }, options.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));
  return s;
}

export function pickFile(accept, { multiple = false } = {}) {
  return new Promise((res) => {
    const inp = h('input', { type: 'file', accept, multiple, style: { display: 'none' } });
    inp.addEventListener('change', () => { res([...inp.files]); inp.remove(); });
    document.body.append(inp);
    inp.click();
  });
}
