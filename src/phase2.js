// Phase 2 — «الحروف الحيّة» (Kelk-style live letters).
import { registerGeometry } from './core/geometry.js';
import { registerTool } from './tools/index.js';
import { registerSection, section, row } from './ui/panels.js';
import { h, btn, slider, icon, toast } from './ui/dom.js';
import { getFontSync, ensureFont, fontInfo } from './core/fonts.js';
import { explode, relink, lettersD, alternatesFor, altGid, defaultT, splitDots } from './core/letters.js';
import { LettersTool, lettersKeys } from './tools/letters.js';
import { openFontPicker, previewSVG } from './ui/fontpicker.js';
import { textLayout, P, hashStr } from './core/geometry.js';
import { glyphCmds } from './core/shaper.js';
import { toD } from './core/svgpath.js';
import { uid } from './core/model.js';

export function install(app) {
  registerGeometry('letters', (o) => {
    const fh = getFontSync(o.fontId);
    if (!fh && o.items.some((i) => !i.d)) { ensureFont(o.fontId).then(() => app.render()); return ''; }
    return lettersD(fh, o);
  });
  registerTool(LettersTool, { id: 'letters', icon: 'explode', label: 'الحروف', mobile: true, key: 'l' }, 'kashida');
  lettersKeys(app);

  app.on('fontChanged', (o) => {
    if (o?.type !== 'letters') return;
    const fh = getFontSync(o.fontId);
    if (fh) relink(fh, o);
  });

  // «فكّ الكلمة» on live text
  registerSection((app, objs) => {
    const o = objs.length === 1 ? objs[0] : null;
    if (o?.type !== 'text') return null;
    return section('الحروف الحيّة',
      h('p', { class: 'hint' }, 'يحوّل الكلمة إلى حروف منفصلة تبقى مرتبطة بالخط: تحرّك كل حرف وتمدّه وتدوّره، ويمكنك تغيير الخط بعدها.'),
      row(btn('explode', 'فكّ الكلمة', () => explodeText(app, o), { class: 'primary' })));
  });

  // letters object panel
  registerSection((app, objs) => {
    const o = objs.length === 1 ? objs[0] : null;
    if (o?.type !== 'letters') return null;
    const fh = getFontSync(o.fontId);
    const items = o.items.filter((i) => (app.toolState.items || []).includes(i.id));
    const fi = fontInfo(o.fontId);
    const parts = [
      section('الحروف الحيّة',
        h('p', { class: 'hint' }, app.tool === 'letters'
          ? 'المس حرفًا لتحديده (مع Shift لتحديد أكثر). اسحبه لنقله، والمقابض الجانبية تمدّه دون أن تغيّر سماكة القلم.'
          : 'اضغط «تحرير الحروف» أو المس الكلمة مرتين.'),
        row(btn('explode', app.tool === 'letters' ? 'إنهاء تحرير الحروف' : 'تحرير الحروف', () => app.setTool(app.tool === 'letters' ? 'select' : 'letters'), { active: app.tool === 'letters', class: 'toggle' })),
        h('button', { class: 'fontbtn', type: 'button', onClick: () => openFontPicker(app, o) }, icon('font'), h('span', {}, fi.name), h('small', {}, 'تغيير الخط مع الإبقاء على تعديلاتك')),
        row(btn('restore', 'إعادة ضبط كل الحروف', () => { o.items.forEach((i) => { if (!i.detached) { i.t = defaultT(); i.alt = null; } }); relink(fh, o); app.commit('إعادة ضبط'); app.render({ panels: true }); }, { class: 'small' }),
          btn('magnet', app.settings.snap ? 'المغناطيس: يعمل' : 'المغناطيس: متوقف', () => { app.settings.snap = !app.settings.snap; app.saveSettings?.(); app.render({ panels: true }); }, { active: app.settings.snap, class: 'toggle small' })),
        letterStrip(app, o, fh)),
    ];
    if (items.length) parts.push(itemProps(app, o, fh, items));
    return h('div', {}, ...parts);
  });
}

async function explodeText(app, o) {
  const fh = await ensureFont(o.fontId);
  const w = explode(fh, o, textLayout(o));
  app.replace(o.id, w);
  app.selection = [w.id];
  app.commit('فكّ الكلمة');
  app.setTool('letters');
  toast('فُكّت الكلمة. المس أي حرف لتحريكه.');
  app.render({ panels: true });
}

function letterStrip(app, o, fh) {
  const sel = new Set(app.toolState.items || []);
  return h('div', { class: 'chips letters-strip' }, [...o.items].sort((a, b) => (a.cluster ?? 0) - (b.cluster ?? 0)).map((it) => h('button', {
    type: 'button', class: `chip ${sel.has(it.id) ? 'on' : ''}`,
    title: it.kind === 'mark' ? 'تشكيل' : it.kind === 'kashida' ? 'كشيدة' : 'حرف',
    onClick: (e) => {
      if (app.tool !== 'letters') app.setTool('letters');
      const ids = app.toolState.items || [];
      app.toolState.items = e.shiftKey ? [...ids, it.id] : [it.id];
      app.render({ panels: true });
    },
  }, it.kind === 'mark' ? `◌${it.ch}` : it.kind === 'kashida' ? 'ـــ' : it.kind === 'shape' ? '•' : it.ch)));
}

function itemProps(app, o, fh, items) {
  const it = items[0];
  const all = (fn) => { items.forEach((i) => fn(i.t, i)); app.render(); };
  const done = (l) => () => app.commit(l);
  const zorder = (where) => () => {
    const set = new Set(items.map((i) => i.id));
    const rest = o.items.filter((i) => !set.has(i.id));
    const mine = o.items.filter((i) => set.has(i.id));
    if (where === 'top') o.items = [...rest, ...mine];
    else if (where === 'bottom') o.items = [...mine, ...rest];
    else {
      const arr = o.items;
      if (where === 'up') for (let i = arr.length - 2; i >= 0; i--) { if (set.has(arr[i].id) && !set.has(arr[i + 1].id)) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; }
      else for (let i = 1; i < arr.length; i++) { if (set.has(arr[i].id) && !set.has(arr[i - 1].id)) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]; }
    }
    app.commit('ترتيب الحروف'); app.render({ panels: true });
  };
  const t = it.t;
  const kids = [
    slider('مدّ أفقي (يحفظ السماكة)', Math.round(t.stretchX), { min: -150, max: 1500, step: 1, unit: 'بكسل', onInput: (v) => all((x) => { x.stretchX = v; }), onChange: done('مدّ') }),
    slider('مدّ رأسي (يحفظ السماكة)', Math.round(t.stretchY), { min: -150, max: 1500, step: 1, unit: 'بكسل', onInput: (v) => all((x) => { x.stretchY = v; }), onChange: done('مدّ') }),
    slider('الحجم', Math.round(t.sx * 100), { min: 10, max: 400, unit: '%', onInput: (v) => all((x) => { const k = v / 100 / (Math.abs(x.sx) || 1); x.sx *= k; x.sy *= k; }), onChange: done('حجم حرف') }),
    slider('العرض فقط', Math.round(t.sx * 100), { min: 10, max: 400, unit: '%', onInput: (v) => all((x) => { x.sx = v / 100; }), onChange: done('عرض حرف') }),
    slider('الارتفاع فقط', Math.round(t.sy * 100), { min: 10, max: 400, unit: '%', onInput: (v) => all((x) => { x.sy = v / 100; }), onChange: done('ارتفاع حرف') }),
    slider('التدوير', Math.round(t.rot), { min: -180, max: 180, unit: '°', onInput: (v) => all((x) => { x.rot = v; }), onChange: done('تدوير حرف') }),
    slider('الميل', Math.round(t.skew), { min: -60, max: 60, unit: '°', onInput: (v) => all((x) => { x.skew = v; }), onChange: done('ميل حرف') }),
    slider('رفع / خفض', Math.round(-t.dy), { min: -600, max: 600, unit: 'بكسل', onInput: (v) => all((x) => { x.dy = -v; }), onChange: done('رفع حرف') }),
    slider('تقديم / تأخير', Math.round(-t.dx), { min: -1200, max: 1200, unit: 'بكسل', onInput: (v) => all((x) => { x.dx = -v; }), onChange: done('تقديم حرف') }),
    row(btn('flipH', 'قلب أفقي', () => { all((x) => { x.flipX = !x.flipX; }); app.commit('قلب'); app.render({ panels: true }); }),
      btn('flipV', 'قلب رأسي', () => { all((x) => { x.flipY = !x.flipY; }); app.commit('قلب'); app.render({ panels: true }); })),
    h('h4', {}, 'العمق'),
    row(btn('front', 'أعلى الكل', zorder('top'), { iconOnly: true }), btn('up', 'إلى الأمام', zorder('up'), { iconOnly: true }),
      btn('down', 'إلى الخلف', zorder('down'), { iconOnly: true }), btn('back', 'أسفل الكل', zorder('bottom'), { iconOnly: true })),
    row(btn('restore', 'إعادة ضبط', () => { items.forEach((i) => { i.t = defaultT(); }); app.commit('إعادة ضبط حرف'); app.render({ panels: true }); }, { class: 'small' }),
      btn('copy', 'تكرار الحرف', () => {
        const copies = items.map((i) => ({ ...JSON.parse(JSON.stringify(i)), id: uid('l'), key: i.key + '+' + Math.random().toString(36).slice(2, 5) }));
        copies.forEach((c) => { c.t.dx += 20; c.t.dy += 20; });
        o.items.push(...copies); app.toolState.items = copies.map((c) => c.id); app.commit('تكرار حرف'); app.render({ panels: true });
      }, { class: 'small' }),
      btn('trash', 'حذف الحرف', () => app.emit('deleteKey'), { class: 'small danger' })),
  ];
  if (items.length === 1 && it.kind === 'base' && fh && !it.detached) {
    const alts = alternatesFor(fh, o, it);
    if (alts.length > 1) {
      kids.push(h('h4', {}, 'الأشكال البديلة لهذا الحرف'));
      kids.push(h('div', { class: 'alts' }, alts.map((a) => {
        const on = (it.alt ? JSON.stringify(it.alt) : null) === (a.alt ? JSON.stringify(a.alt) : null);
        const b = h('button', { type: 'button', class: `altcard ${on ? 'on' : ''}`, title: a.label, onClick: () => {
          it.alt = a.alt; it.gid = a.alt ? altGid(fh, o, it, a.alt) ?? it.gid : a.gid;
          app.commit('شكل بديل'); app.render({ panels: true });
        } });
        b.innerHTML = glyphPreview(fh, a.gid) + `<small>${a.label}</small>`;
        return b;
      })));
    }
    kids.push(row(btn('squareDot', 'فصل النقاط عن الحرف', () => detachDots(app, o, fh, it), { class: 'small' })));
    kids.push(h('p', { class: 'hint' }, 'فصل النقاط يجعل كل نقطة قطعة مستقلة، ويفقد هذا الحرف ارتباطه بالخط.'));
  }
  return section(items.length > 1 ? `${items.length} حروف محددة` : `الحرف «${it.kind === 'mark' ? '◌' + it.ch : it.ch || 'قطعة'}»`, ...kids);
}

const gpCache = new Map();
function glyphPreview(fh, gid) {
  const k = fh.id + ':' + gid;
  if (gpCache.has(k)) return gpCache.get(k);
  const cmds = glyphCmds(fh, gid, 0.1);
  const d = toD(cmds);
  const it = new P.CompoundPath({ pathData: d, insert: false });
  const b = it.bounds;
  const pad = 6;
  const svg = `<svg viewBox="${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}"><path d="${d}" fill="currentColor"/></svg>`;
  gpCache.set(k, svg);
  return svg;
}

function detachDots(app, o, fh, it) {
  const r = splitDots(fh, o, it, P);
  if (!r) return toast('لم أجد نقاطًا منفصلة في هذا الحرف (بعض الخطوط ترسم النقاط ملتصقة)', 'warn');
  const base = { bx: it.bx, by: it.by, t: { ...it.t, stretchX: 0, stretchY: 0 } };
  it.d = r.body; it.detached = true; it.t.stretchX = 0; it.t.stretchY = 0;
  const idx = o.items.indexOf(it);
  const dots = r.dots.map((d, i) => ({ id: uid('l'), key: `${it.key}.dot${i}`, kind: 'shape', ch: '•', detached: true, d, ...JSON.parse(JSON.stringify(base)) }));
  o.items.splice(idx + 1, 0, ...dots);
  app.toolState.items = dots.map((d) => d.id);
  app.commit('فصل النقاط');
  toast(`فُصلت ${dots.length} نقطة`);
  app.render({ panels: true });
}

export { previewSVG, hashStr };
