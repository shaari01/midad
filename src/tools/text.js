// Text creation tool and the kashida (tatweel) handle tool.
import { textObject, translate, mul, apply, invert } from '../core/model.js';
import { textLayout } from '../core/geometry.js';
import { handleMarkup } from './select.js';
import { toast } from '../ui/dom.js';

/**
 * Change a text object while keeping its right edge fixed (Arabic texts
 * grow to the left), or its centre for centred text.
 */
export function keepAnchor(o, fn) {
  const before = textLayout(o)?.width ?? 0;
  fn();
  const after = textLayout(o)?.width ?? 0;
  const dw = after - before;
  if (!dw) return;
  const k = o.align === 'left' ? 0 : o.align === 'center' ? 0.5 : 1;
  o.m = mul(o.m, translate(-dw * k, 0));
}

export const TextTool = {
  id: 'text',
  down(ev, cv) {
    const { app } = cv;
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit && hit.type === 'text') { app.select(hit.id); app.setTool('select'); app.emit('editText'); return; }
    const last = app.lastTextProps || {};
    const o = textObject({ fontId: last.fontId || 'amiri', size: last.size || Math.round(app.doc.width / 7), style: last.style ? JSON.parse(JSON.stringify(last.style)) : undefined });
    if (!o.style) delete o.style;
    const fallback = textObject();
    o.style = o.style || fallback.style;
    o.text = 'اكتب هنا';
    app.add(o);
    const lay = textLayout(o);
    const w = lay?.width || o.size * 3, hgt = lay?.height || o.size * 1.5;
    // place so the tap point is the text's right-top corner area (RTL)
    o.m = translate(Math.min(app.doc.width - w, Math.max(0, ev.x - w)), Math.max(0, ev.y - hgt / 2));
    app.commit('نص جديد');
    app.setTool('select');
    app.emit('editText', { selectAll: true });
  },
};

export const KashidaTool = {
  id: 'kashida',
  target(app) { const o = app.one; return o && o.type === 'text' ? o : null; },
  overlay(cv) {
    const o = this.target(cv.app);
    if (!o) return '';
    const lay = textLayout(o);
    if (!lay) return '';
    let s = '';
    for (const g of lay.gaps) {
      const [wx, wy] = apply(o.m, g.x, g.y);
      const [sx, sy] = cv.toScreen(wx, wy);
      s += handleMarkup(`k${g.gap}`, sx, sy, g.amount > 0.5 ? 'h kas on' : 'h kas');
    }
    return s;
  },
  down(ev, cv) {
    const { app } = cv;
    const o = this.target(app);
    const h = ev.target.closest?.('[data-handle]');
    if (o && h) {
      const gap = +h.getAttribute('data-handle').slice(1);
      const inv = invert(o.m);
      this.drag = { o, gap, m0: o.m.slice(), kas0: { ...(o.kashida || {}) }, startLocal: apply(inv, ev.x, ev.y)[0], amount0: (o.kashida?.[gap] || 0) };
      return;
    }
    const hit = cv.hitObject(ev.e, ev.x, ev.y);
    if (hit && hit.type === 'text') { app.select(hit.id); app.setTool('kashida'); return; }
    if (!o) toast('اختر نصًّا أولًا، ثم اسحب المقابض الصغيرة بين الحروف المتصلة');
  },
  move(ev, cv) {
    const d = this.drag;
    if (!d) return;
    // The handle follows the finger: we keep the right edge fixed, so the
    // handle moves left as the kashida grows → amount = start - dx.
    const lx = apply(invert(d.m0), ev.x, ev.y)[0];
    const em = Math.max(0, d.amount0 - (lx - d.startLocal) / d.o.size);
    const o = d.o;
    o.m = d.m0.slice();
    o.kashida = { ...d.kas0 };
    keepAnchor(o, () => { o.kashida = { ...d.kas0, [d.gap]: Math.round(em * 1000) / 1000 }; });
    cv.app.render();
  },
  up(ev, cv) {
    if (!this.drag) return;
    if (this.drag.o.kashida[this.drag.gap] === 0) delete this.drag.o.kashida[this.drag.gap];
    this.drag = null;
    cv.app.commit('تطويل');
    cv.app.render({ panels: true });
  },
  cancel(cv) { if (this.drag) { this.drag = null; cv.app.revert(); } },
};
