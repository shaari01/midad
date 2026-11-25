// Font picker: shows the selected word rendered in every font.
import { h, btn, openSheet, closeSheet, toast, pickFile } from './dom.js';
import { listFonts, ensureFont, registerUserFont, removeUserFont, readFontName } from '../core/fonts.js';
import { layoutText, layoutToD } from '../core/shaper.js';
import { Store } from '../core/store.js';
import { uid } from '../core/model.js';
import { keepAnchor } from '../tools/text.js';

export function previewSVG(fh, text, size = 64) {
  try {
    const lay = layoutText(fh, text, { size });
    const d = layoutToD(fh, lay);
    const pad = size * 0.25;
    return `<svg viewBox="${-pad} ${-pad} ${lay.width + pad * 2} ${lay.height + pad * 2}" preserveAspectRatio="xMidYMid meet"><path d="${d}" fill="currentColor"/></svg>`;
  } catch { return ''; }
}

export async function openFontPicker(app, target, onPick) {
  const sample = (target?.text || target?.sourceText || 'بسم الله').split('\n')[0].slice(0, 24) || 'خط';
  const list = h('div', { class: 'fontlist' });
  const body = h('div', {},
    h('p', { class: 'hint' }, 'المس الخط لتطبيقه. الخطوط مضمّنة في البرنامج ولا تُثبَّت على جهازك.'),
    list,
    h('div', { class: 'brow' },
      btn('plus', 'إضافة خط من ملف (TTF / OTF)', () => importFont(app, () => fill()), { class: 'primary' })),
    h('p', { class: 'hint' }, 'مثلًا: خط «ليلى ثلث» من fontlibrary.org أو أي خط تملك رخصته.'));
  openSheet('اختيار الخط', body, { wide: true });
  async function fill() {
    list.innerHTML = '';
    for (const f of listFonts()) {
      const card = h('button', { type: 'button', class: `fontcard ${target?.fontId === f.id ? 'on' : ''}` },
        h('div', { class: 'fprev' }, h('span', { class: 'spin' })),
        h('div', { class: 'fmeta' }, h('strong', {}, f.name), h('small', {}, f.style || 'خط مستورد')));
      card.addEventListener('click', async () => {
        await ensureFont(f.id);
        if (onPick) onPick(f.id);
        else if (target) {
          if (target.type === 'text') keepAnchor(target, () => { target.fontId = f.id; });
          else target.fontId = f.id;
          app.lastTextProps = { ...(app.lastTextProps || {}), fontId: f.id };
          app.emit('fontChanged', target);
          app.commit('تبديل الخط');
          app.render({ panels: true });
        }
        closeSheet();
      });
      if (f.user) {
        card.append(h('span', { class: 'fdel', role: 'button', title: 'حذف الخط', onClick: async (e) => {
          e.stopPropagation();
          await Store.deleteFont(f.id); removeUserFont(f.id); fill();
        } }, '×'));
      }
      list.append(card);
      ensureFont(f.id).then((fh) => { card.querySelector('.fprev').innerHTML = previewSVG(fh, sample); })
        .catch(() => { card.querySelector('.fprev').textContent = 'تعذّر تحميل الخط'; });
    }
  }
  fill();
}

export async function importFont(app, done) {
  const files = await pickFile('.ttf,.otf,font/ttf,font/otf', { multiple: true });
  for (const f of files) {
    try {
      const data = await f.arrayBuffer();
      const name = readFontName(data) || f.name.replace(/\.[^.]+$/, '');
      const rec = { id: uid('uf'), name, style: 'خط مستورد', data, file: f.name };
      registerUserFont(rec);
      const fh = await ensureFont(rec.id); // validates
      if (!fh.hasGlyph(0x0628)) toast(`تنبيه: الخط «${name}» لا يحتوي حروفًا عربية`, 'warn');
      await Store.saveFont(rec);
      toast(`أُضيف الخط «${name}»`);
    } catch (e) {
      console.error(e);
      removeUserFont(f.name);
      toast(`تعذّر قراءة الملف ${f.name}`, 'error');
    }
  }
  done?.();
}
