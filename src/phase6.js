// Phase 6 — Ali's review: image trace, text on a path, glyphs as shapes,
// madd (stretch) for shapes, more node operations, Bézier drawing pen,
// warp icons, letters bar.
import { registerTool, TOOLS } from './tools/index.js';
import { registerSection, section, row, loadImg } from './ui/panels.js';
import { h, btn, slider, select, field, toast, openSheet, closeSheet } from './ui/dom.js';
import { P, toItem, itemD, localD, worldD, textLayout, setTextPathHook } from './core/geometry.js';
import { getFontSync, ensureFont, fontInfo } from './core/fonts.js';
import { traceImageData } from './core/trace.js';
import { bendAlong } from './core/textpath.js';
import { warpD, WARP_MODES } from './core/warp.js';
import { parsePath, toD, smartStretch, transformD } from './core/svgpath.js';
import { glyphCmds } from './core/shaper.js';
import { pathObject, clone, I, apply, invert, mul, translate, uid } from './core/model.js';
import { NodesTool } from './tools/nodes.js';
import { KashidaTool } from './tools/text.js';
import { handleMarkup } from './tools/select.js';
import { hb } from './core/fonts.js';

const V = (cv) => [cv.z, 0, 0, cv.z, cv.tx, cv.ty];
const blackStyle = (c = '#1b1b1b') => ({ fills: [{ type: 'solid', color: c, opacity: 1 }], strokes: [], opacity: 1, shadow: null, glow: null, extrude: null, contour: null });

export function install(app) {
  installTrace(app);
  installTextPath(app);
  installMadd(app);
  installNodeOps(app);
  installBezierPen(app);
  installWarpIcons();
}

/* ============================ image trace ============================ */
async function imagePixels(o, maxSide = 1000) {
  const img = await loadImg(o.src);
  const k = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * k)), hh = Math.max(1, Math.round(img.height * k));
  const c = document.createElement('canvas');
  c.width = w; c.height = hh;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, hh);
  return { data: g.getImageData(0, 0, w, hh).data, w, h: hh };
}

export async function traceImage(app, o, opts) {
  const px = await imagePixels(o, opts.detail === 'high' ? 1600 : opts.detail === 'low' ? 600 : 1000);
  let d = traceImageData(px.data, px.w, px.h, opts);
  if (!d) return null;
  d = transformD(d, [o.w / px.w, 0, 0, o.h / px.h, 0, 0]);
  return pathObject(d, { name: (o.name || 'صورة').replace(/\.\w+$/, '') + ' (شكل)', m: o.m.slice(), style: blackStyle(opts.color || '#1b1b1b'), live: clone(o) });
}

function installTrace(app) {
  registerSection((app, objs) => {
    const o = objs.length === 1 && objs[0].type === 'image' ? objs[0] : null;
    if (!o) return null;
    const s = app.settings;
    const opts = s.trace = { mode: 'auto', threshold: 128, invert: false, despeckle: 6, smooth: 1, detail: 'mid', keepImage: false, ...(s.trace || {}) };
    const run = async () => {
      toast('جارٍ تحويل الصورة إلى شكل…', 'info', 6000);
      await new Promise((r) => setTimeout(r, 30));
      try {
        const p = await traceImage(app, o, opts);
        if (!p) return toast('لم أجد شكلًا في الصورة. غيّر «حدّ الأسود» أو «اعكس».', 'warn');
        const idx = app.doc.objects.indexOf(o);
        app.doc.objects.splice(idx + 1, 0, p);
        if (!opts.keepImage) app.doc.objects.splice(idx, 1); else o.visible = false;
        app.selection = [p.id];
        app.commit('تحويل الصورة إلى شكل');
        app.render({ panels: true });
        toast('تم: الصورة الآن شكل متجهي بلون واحد. عدّل نقاطه أو لوّنه أو ادمجه مع الحروف.');
      } catch (e) { console.error(e); toast('تعذّر تحويل هذه الصورة', 'error'); }
    };
    const save = () => app.saveSettings?.();
    return section('تحويل الصورة إلى شكل (Image Trace)',
      h('p', { class: 'hint' }, 'الصورة الشفافة تُؤخذ حدودها كما هي. الصورة بخلفية تتحوّل إلى أبيض وأسود: الأبيض يُحذف (شفاف) والأسود يصير شكلًا تعدّله بالعقد وتدمجه مع الحروف.'),
      field('طريقة الفصل', select([['auto', 'تلقائي'], ['alpha', 'حسب الشفافية'], ['dark', 'الداكن شكل، الفاتح خلفية'], ['light', 'الفاتح شكل، الداكن خلفية']], opts.mode, (v) => { opts.mode = v; save(); })),
      slider('حدّ الأسود (للصور بخلفية)', opts.threshold, { min: 10, max: 245, onInput: (v) => { opts.threshold = v; }, onChange: save }),
      slider('تجاهل النقاط الصغيرة', opts.despeckle, { min: 0, max: 200, unit: 'بكسل', onInput: (v) => { opts.despeckle = v; }, onChange: save }),
      slider('نعومة الحواف', opts.smooth, { min: 0, max: 4, step: 0.5, onInput: (v) => { opts.smooth = v; }, onChange: save }),
      field('الدقة', select([['low', 'منخفضة (أسرع)'], ['mid', 'متوسطة'], ['high', 'عالية']], opts.detail, (v) => { opts.detail = v; save(); })),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: opts.invert, onChange: (e) => { opts.invert = e.target.checked; save(); } }), 'اعكس (الشكل ↔ الخلفية)'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: opts.keepImage, onChange: (e) => { opts.keepImage = e.target.checked; save(); } }), 'احتفظ بالصورة الأصلية مخفية'),
      row(btn('scan', 'تحويل إلى شكل', run, { class: 'primary' })));
  });
}

/* ============================ text on path ============================ */
function installTextPath(app) {
  setTextPathHook((o, flat, fh, lay) => {
    const s = lay.s;
    return bendAlong(flat, o.onPath.d, { width: lay.width, base: fh.ascender * s, start: o.onPath.start ?? 0.5, shift: o.onPath.shift || 0, reverse: !!o.onPath.reverse, size: o.size });
  });

  const attach = (o, worldPathD) => {
    // path kept in the text's own coordinates
    o.onPath = { d: transformD(worldPathD, invert(o.m)), start: 0.5, shift: 0, reverse: false };
  };

  registerSection((app, objs) => {
    const texts = objs.filter((o) => o.type === 'text');
    const shapes = objs.filter((o) => o.type !== 'text' && o.type !== 'image');
    if (texts.length === 1 && shapes.length === 1 && objs.length === 2) {
      const [t] = texts, [s] = shapes;
      return section('الكتابة على المسار',
        h('p', { class: 'hint' }, 'يضع النص على حدّ الشكل المحدد (دائرة، قوس، أو شكل رسمته). يبقى النص حيًّا: تغيّر خطه وحجمه ونصه.'),
        row(btn('route', 'ضع النص على الشكل', () => {
          attach(t, worldD(s));
          s.visible = false;
          app.selection = [t.id];
          app.commit('كتابة على المسار');
          app.render({ panels: true });
          toast('النص على المسار. الشكل الأصلي مخفي في الطبقات إن احتجته.');
        }, { class: 'primary' })));
    }
    if (objs.length !== 1 || objs[0].type !== 'text') return null;
    const o = objs[0];
    const preset = (kind) => () => {
      const lay = textLayout(o); if (!lay) return;
      const w = lay.width, R = Math.max(w / Math.PI, o.size);
      const base = getFontSync(o.fontId)?.ascender * lay.s || o.size;
      const cx = w / 2, cy = base + R;
      const d = kind === 'circle'
        ? `M${cx},${cy - R} A${R},${R} 0 1 1 ${cx - 0.01},${cy - R} Z`
        : kind === 'arcDown'
          ? `M${cx - R * 1.1},${base - R * 0.6} Q${cx},${base + R * 0.9} ${cx + R * 1.1},${base - R * 0.6}`
          : `M${cx - R * 1.1},${base + R * 0.6} Q${cx},${base - R * 0.9} ${cx + R * 1.1},${base + R * 0.6}`;
      o.onPath = { d: transformD(toD(parsePath(d)), I), start: kind === 'circle' ? 0.75 : 0.5, shift: 0, reverse: false };
      // circle path: start at the top (x grows clockwise)
      if (kind === 'circle') o.onPath.d = `M${cx - R},${cy} A${R},${R} 0 1 1 ${cx + R},${cy} A${R},${R} 0 1 1 ${cx - R},${cy} Z`;
      app.commit('كتابة على مسار'); app.render({ panels: true });
    };
    if (!o.onPath) {
      return section('الكتابة على مسار',
        h('p', { class: 'hint' }, 'اختر شكلًا جاهزًا، أو ارسم المسار بإصبعك بأداة «رسم مسار للنص»، أو حدّد النص مع أي شكل مرسوم.'),
        h('div', { class: 'mgrid tight' },
          btn('circle', 'دائرة', preset('circle')),
          btn('arcUp', 'قوس للأعلى', preset('arcUp')),
          btn('arcDown', 'قوس للأسفل', preset('arcDown')),
          btn('route', 'ارسم المسار', () => app.setTool('textpath'), { active: app.tool === 'textpath', class: 'toggle' })));
    }
    const p = o.onPath;
    const set = (k) => (v) => { p[k] = v; app.render(); };
    return section('الكتابة على مسار',
      slider('موضع النص على المسار', Math.round((p.start ?? 0.5) * 100), { min: 0, max: 100, unit: '%', onInput: (v) => set('start')(v / 100), onChange: () => app.commit('موضع النص') }),
      slider('رفع/خفض عن المسار', p.shift || 0, { min: -o.size, max: o.size, onInput: set('shift'), onChange: () => app.commit('رفع النص') }),
      row(btn('flipV', 'الجهة الأخرى', () => { p.reverse = !p.reverse; app.commit('قلب جهة المسار'); app.render({ panels: true }); }, { active: p.reverse, class: 'toggle' }),
        btn('route', 'ارسم مسارًا جديدًا', () => app.setTool('textpath')),
        btn('close', 'فصل عن المسار', () => { delete o.onPath; app.commit('فصل عن المسار'); app.render({ panels: true }); })),
      h('p', { class: 'hint' }, 'حين ترضى عن الشكل: «تحويل إلى أشكال» ثم أصلح أي عيب بأداة العقد.'));
  });

  // draw a free path for the selected text
  registerTool({
    id: 'textpath',
    wantsCoalesced: true,
    overlay(cv) {
      const o = cv.app.one;
      let s = '';
      if (!o || o.type !== 'text') return `<text class="badge" x="50%" y="60">حدّد نصًّا أولًا ثم ارسم المسار</text>`;
      if (o.onPath && !this.pts) s += `<path class="tpath" d="${transformD(o.onPath.d, mul(V(cv), o.m))}"/>`;
      if (this.pts) s += `<polyline class="tpath" points="${this.pts.map(([x, y]) => cv.toScreen(x, y).join(',')).join(' ')}"/>`;
      return s + `<text class="badge" x="50%" y="60">ارسم بإصبعك المسار الذي يسير عليه النص</text>`;
    },
    down(ev) { this.pts = [[ev.x, ev.y]]; },
    move(ev, cv) { if (!this.pts) return; const l = this.pts[this.pts.length - 1]; if (Math.hypot(ev.x - l[0], ev.y - l[1]) * cv.z > 3) { this.pts.push([ev.x, ev.y]); cv.drawOverlay(); } },
    up(ev, cv) {
      const pts = this.pts; this.pts = null;
      const o = cv.app.one;
      if (!pts || pts.length < 3 || !o || o.type !== 'text') { cv.drawOverlay(); return; }
      const path = new P.Path({ segments: pts, insert: false });
      path.simplify(4);
      attach(o, path.getPathData(null, 2));
      cv.app.setTool('select');
      cv.app.commit('رسم مسار للنص');
      cv.app.render({ panels: true });
    },
    cancel(cv) { this.pts = null; cv.drawOverlay(); },
  }, { id: 'textpath', icon: 'route', label: 'رسم مسار للنص', mobile: false });
}

/* ============================ madd (stretch) ============================ */
// One tool «مداد»: on live text it shows the kashida handles; on a shape it
// stretches the part beyond the touched line, horizontally or vertically,
// keeping the pen thickness (no straight bar, no corners).
export const MaddTool = {
  id: 'madd',
  isText(app) { return app.one?.type === 'text'; },
  shape(app) { const o = app.one; return o && (o.type === 'path') ? o : null; },
  overlay(cv) {
    const app = cv.app;
    if (this.isText(app)) return KashidaTool.overlay(cv);
    const o = this.shape(app);
    if (!o) return `<text class="badge" x="50%" y="60">حدّد نصًّا (للتطويل) أو شكلًا (للمدّ)</text>`;
    const axis = app.settings.maddAxis || 'x';
    let s = `<path class="nodepath" d="${transformD(o.d, mul(V(cv), o.m))}"/>`;
    const line = this.drag?.split ?? this.hoverLine;
    if (line != null) {
      const b = toItem(o.d).bounds;
      const M = mul(V(cv), o.m);
      const [a, c] = axis === 'x' ? [[line, b.y - 20], [line, b.y + b.height + 20]] : [[b.x - 20, line], [b.x + b.width + 20, line]];
      const A = apply(M, ...a), C = apply(M, ...c);
      s += `<line class="maddline" x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}"/>`;
    }
    return s + `<text class="badge" x="50%" y="60">${axis === 'x' ? 'مدّ أفقي' : 'مدّ عمودي'}: ضع إصبعك حيث تريد المدّ واسحب</text>`;
  },
  hoverAt(ev, cv) {
    const o = this.shape(cv.app); if (!o) return;
    const [lx, ly] = apply(invert(o.m), ev.x, ev.y);
    this.hoverLine = (cv.app.settings.maddAxis || 'x') === 'x' ? lx : ly;
    cv.drawOverlay();
  },
  hover(ev, cv) { if (!this.isText(cv.app)) this.hoverAt(ev, cv); },
  down(ev, cv) {
    const app = cv.app;
    if (this.isText(app)) return KashidaTool.down(ev, cv);
    const o = this.shape(app);
    if (!o) {
      const hit = cv.hitObject(ev.e, ev.x, ev.y);
      if (hit) { app.select(hit.id); app.render({ panels: true }); }
      if (hit && hit.type !== 'path' && hit.type !== 'text') toast('حوّل العنصر إلى أشكال أولًا ثم مدّه');
      return;
    }
    const axis = app.settings.maddAxis || 'x';
    const inv = invert(o.m);
    const [lx, ly] = apply(inv, ev.x, ev.y);
    const b = toItem(o.d).bounds;
    this.drag = { o, inv, axis, d0: o.d, split: axis === 'x' ? lx : ly, start: axis === 'x' ? lx : ly, band: Math.max(b.width, b.height) * (app.settings.maddSoft ?? 0.03) };
  },
  move(ev, cv) {
    if (this.isText(cv.app)) return KashidaTool.move(ev, cv);
    const d = this.drag;
    if (!d) return;
    const [lx, ly] = apply(d.inv, ev.x, ev.y);
    const delta = (d.axis === 'x' ? lx : ly) - d.start;
    const amount = Math.abs(delta);
    let cmds = smartStretch(parsePath(d.d0), d.axis, d.split, amount, d.band);
    // keep the side opposite to the drag in place
    const shift = (delta < 0 ? -1 : 1) * amount / 2;
    const T = d.axis === 'x' ? [1, 0, 0, 1, shift, 0] : [1, 0, 0, 1, 0, shift];
    d.o.d = transformD(toD(cmds), T);
    cv.app.render();
  },
  up(ev, cv) {
    if (this.isText(cv.app)) return KashidaTool.up(ev, cv);
    if (!this.drag) return;
    const changed = this.drag.o.d !== this.drag.d0;
    this.drag = null;
    if (changed) cv.app.commit('مدّ الشكل');
    cv.app.render({ panels: true });
  },
  cancel(cv) { if (this.isText(cv.app)) return KashidaTool.cancel(cv); if (this.drag) { this.drag.o.d = this.drag.d0; this.drag = null; cv.app.render(); } },
};

function installMadd(app) {
  registerTool(MaddTool, null);
  registerSection((app, objs) => {
    if (app.tool !== 'madd') return null;
    const s = app.settings;
    const ax = s.maddAxis || 'x';
    return section('مداد',
      h('p', { class: 'hint' }, 'على النص الحيّ: اسحب المقابض بين الحروف المتصلة. على الشكل (بعد «تحويل إلى أشكال»): ضع إصبعك على المكان الذي تريد مدّه واسحب؛ يمتدّ الحرف بانسيابية مع بقاء سماكة القلم.'),
      row(btn('stretchH', 'أفقي', () => { s.maddAxis = 'x'; app.saveSettings?.(); app.render({ panels: true }); }, { active: ax === 'x', class: 'toggle' }),
        btn('stretchV', 'عمودي', () => { s.maddAxis = 'y'; app.saveSettings?.(); app.render({ panels: true }); }, { active: ax === 'y', class: 'toggle' })),
      slider('ليونة منطقة المدّ', Math.round((s.maddSoft ?? 0.03) * 100), { min: 0, max: 30, unit: '%', onInput: (v) => { s.maddSoft = v / 100; }, onChange: () => app.saveSettings?.() }));
  });
}

/* ============================ node operations ============================ */
export const NodeOps = {
  ctx(app) {
    const o = NodesTool.target(app);
    if (!o) { toast('حدّد شكلًا وافتح أداة العقد أولًا'); return null; }
    NodesTool.cpFor(o);
    const keys = NodesTool.sel(app);
    return { o, cp: NodesTool.cp, keys, segs: keys.map((k) => NodesTool.seg(k)).filter(Boolean) };
  },
  done(app, o, label, sel = []) {
    app.toolState.nodes = sel;
    NodesTool.write(app, o);
    app.commit(label);
    app.render({ panels: true });
  },
  /** split the path at the selected node into two loose ends */
  breakNode(app) {
    const c = this.ctx(app); if (!c) return;
    if (c.segs.length !== 1) return toast('حدّد عقدة واحدة لفكّها');
    const seg = c.segs[0], path = seg.path;
    if (path.closed) {
      const segs = path.segments.map((s) => s.clone());
      const i = seg.index;
      const ordered = [...segs.slice(i), ...segs.slice(0, i), segs[i].clone()];
      path.removeSegments();
      path.addSegments(ordered);
      path.closed = false;
    } else {
      if (seg.isFirst() || seg.isLast()) return toast('هذه العقدة طرف مفتوح أصلًا');
      const loc = path.getLocationOf(seg.point);
      const rest = path.splitAt(loc);
      if (rest) c.cp.addChild(rest);
    }
    this.done(app, c.o, 'فكّ عقدة');
  },
  /** join two loose ends (merge if they touch, else connect with a line) */
  joinNodes(app) {
    const c = this.ctx(app); if (!c) return;
    if (c.segs.length !== 2) return toast('حدّد عقدتين (طرفين) لوصلهما');
    const [a, b] = c.segs;
    const ends = (s) => !s.path.closed && (s.isFirst() || s.isLast());
    if (!ends(a) || !ends(b)) return toast('الوصل يكون بين طرفين مفتوحين. استعمل «فكّ العقدة» أولًا.');
    const tol = 0.5;
    if (a.path === b.path) {
      if (a.point.getDistance(b.point) < tol) { a.path.lastSegment.remove(); }
      a.path.closed = true;
    } else {
      a.path.join(b.path, tol);
    }
    this.done(app, c.o, 'وصل عقدتين');
  },
  /** merge several selected nodes into one at their centre */
  mergeNodes(app) {
    const c = this.ctx(app); if (!c) return;
    if (c.segs.length < 2) return toast('حدّد عقدتين متجاورتين أو أكثر لدمجهما');
    const path = c.segs[0].path;
    if (c.segs.some((s) => s.path !== path)) return this.joinNodes(app);
    const cx = c.segs.reduce((a, s) => a + s.point.x, 0) / c.segs.length, cy = c.segs.reduce((a, s) => a + s.point.y, 0) / c.segs.length;
    const keep = c.segs[0];
    keep.point = new P.Point(cx, cy);
    keep.handleIn = c.segs[0].handleIn; keep.handleOut = c.segs[c.segs.length - 1].handleOut;
    for (const s of c.segs.slice(1).sort((x, y) => y.index - x.index)) s.remove();
    this.done(app, c.o, 'دمج عقد', [`${c.cp.children.indexOf(path)}:${keep.index}`]);
  },
  /** the curve between selected nodes becomes a straight line */
  straighten(app) {
    const c = this.ctx(app); if (!c) return;
    if (!c.segs.length) return toast('حدّد عقدتين على طرفي المنحنى');
    const set = new Set(c.segs);
    for (const s of c.segs) {
      if (s.next && set.has(s.next)) { s.handleOut = new P.Point(0, 0); s.next.handleIn = new P.Point(0, 0); }
      if (c.segs.length === 1) { s.handleIn = new P.Point(0, 0); s.handleOut = new P.Point(0, 0); }
    }
    this.done(app, c.o, 'خط مستقيم', c.keys);
  },
  /** straight segments between selected nodes become curves (editable handles) */
  curve(app) {
    const c = this.ctx(app); if (!c) return;
    if (!c.segs.length) return toast('حدّد عقدتين على طرفي الخط');
    const set = new Set(c.segs);
    for (const s of c.segs) {
      const n = s.next;
      if (n && (set.has(n) || c.segs.length === 1)) {
        const v = n.point.subtract(s.point);
        const nrm = new P.Point(-v.y, v.x).normalize(v.length * 0.15);
        s.handleOut = v.multiply(1 / 3).add(nrm);
        n.handleIn = v.multiply(-1 / 3).add(nrm);
      }
    }
    this.done(app, c.o, 'خط منحنٍ', c.keys);
  },
  reverse(app) {
    const c = this.ctx(app); if (!c) return;
    c.cp.children.forEach((p) => p.reverse());
    this.done(app, c.o, 'عكس الاتجاه');
  },
};

function installNodeOps(app) {
  registerSection((app, objs) => {
    if (app.tool !== 'nodes' || objs.length !== 1 || objs[0].type !== 'path') return null;
    const n = (app.toolState.nodes || []).length;
    return section('عمليات العقد',
      h('div', { class: 'iconrow' },
        btn('addNode', 'إضافة عقدة: المس الخط نفسه', () => toast('المس الخط نفسه لإضافة عقدة'), { iconOnly: true }),
        btn('delNode', 'حذف العقد المحددة', () => NodesTool.deleteNodes(app), { iconOnly: true, disabled: !n }),
        btn('unlink', 'فكّ العقدة إلى عقدتين', () => NodeOps.breakNode(app), { iconOnly: true, disabled: n !== 1 }),
        btn('combine', 'وصل طرفين (أو دمجهما إن تلامسا)', () => NodeOps.joinNodes(app), { iconOnly: true, disabled: n !== 2 }),
        btn('merge', 'دمج العقد المحددة في عقدة واحدة', () => NodeOps.mergeNodes(app), { iconOnly: true, disabled: n < 2 }),
        btn('corner', 'زاوية حادة', () => NodesTool.setType(app, 'corner'), { iconOnly: true, disabled: !n }),
        btn('smooth', 'عقدة منحنية ناعمة', () => NodesTool.setType(app, 'smooth'), { iconOnly: true, disabled: !n }),
        btn('slash', 'المنحنى إلى خط مستقيم', () => NodeOps.straighten(app), { iconOnly: true, disabled: !n }),
        btn('lineSquiggle', 'الخط المستقيم إلى منحنٍ', () => NodeOps.curve(app), { iconOnly: true, disabled: !n })),
      h('small', { class: 'hint' }, n ? `محدد: ${n} عقدة` : 'المس عقدة لتحديدها، ومع Shift أو Ctrl لتحديد أكثر.'));
  });
}

/* ============================ Bézier pen ============================ */
// Click = corner point, drag = smooth point with handles, touch the first
// point to close. Double-click / Enter / «إنهاء» finishes an open path.
export const BezierTool = {
  id: 'bezier',
  segs: null,
  overlay(cv) {
    if (!this.segs?.length) return `<text class="badge" x="50%" y="60">المس لإضافة نقطة حادة، واسحب لنقطة منحنية. المس النقطة الأولى للإغلاق.</text>`;
    const path = this.path(false);
    let s = `<path class="nodepath" d="${transformD(path.getPathData(null, 2), V(cv))}"/>`;
    if (this.hoverPt && !this.drag) {
      const last = this.segs[this.segs.length - 1];
      const [a, b] = [cv.toScreen(last.x, last.y), cv.toScreen(...this.hoverPt)];
      s += `<line class="selline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
    }
    this.segs.forEach((p, i) => {
      const [x, y] = cv.toScreen(p.x, p.y);
      if (p.ho) { const [hx, hy] = cv.toScreen(p.x + p.ho[0], p.y + p.ho[1]); const [ix, iy] = cv.toScreen(p.x - p.ho[0], p.y - p.ho[1]); s += `<line class="hline" x1="${ix}" y1="${iy}" x2="${hx}" y2="${hy}"/><circle class="hdot" cx="${hx}" cy="${hy}" r="5"/>`; }
      s += `<rect class="node ${i === 0 ? 'on' : ''}" x="${x - 6}" y="${y - 6}" width="12" height="12"/>`;
    });
    return s;
  },
  path(closed) {
    const p = new P.Path({ insert: false, closed });
    for (const q of this.segs) p.add(new P.Segment(new P.Point(q.x, q.y), q.ho ? new P.Point(-q.ho[0], -q.ho[1]) : null, q.ho ? new P.Point(q.ho[0], q.ho[1]) : null));
    return p;
  },
  down(ev, cv) {
    this.segs = this.segs || [];
    const f = this.segs[0];
    if (f && this.segs.length > 2 && Math.hypot(ev.x - f.x, ev.y - f.y) * cv.z < 18) { this.finish(cv.app, true); return; }
    const p = { x: ev.x, y: ev.y, ho: null };
    this.segs.push(p);
    this.drag = p;
    cv.drawOverlay();
  },
  move(ev, cv) {
    if (this.drag) {
      const dx = ev.x - this.drag.x, dy = ev.y - this.drag.y;
      this.drag.ho = Math.hypot(dx, dy) * cv.z > 4 ? [dx, dy] : null;
      cv.drawOverlay();
    }
  },
  hover(ev, cv) { if (this.segs?.length) { this.hoverPt = [ev.x, ev.y]; cv.drawOverlay(); } },
  up() { this.drag = null; },
  dbl(ev, cv) { if (this.segs?.length > 1) { this.segs.pop(); this.finish(cv.app, false); } },
  finish(app, closed) {
    if (!this.segs || this.segs.length < 2) { this.segs = null; return; }
    const p = this.path(closed);
    const s = app.settings;
    const style = closed ? blackStyle(s.penColor || '#1b1b1b') : { ...blackStyle(), fills: [], strokes: [{ color: s.penColor || '#1b1b1b', width: s.bezierWidth || 8, align: 'center', cap: 'round', join: 'round', opacity: 1 }] };
    const o = pathObject(p.getPathData(null, 2), { name: closed ? 'شكل مرسوم' : 'خط مرسوم', style });
    this.segs = null; this.drag = null;
    app.add(o);
    app.commit('رسم بالقلم');
    app.render({ panels: true });
  },
  cancel(cv) { this.drag = null; },
};

function installBezierPen(app) {
  registerTool(BezierTool, { id: 'bezier', icon: 'penTool', label: 'المرسمة (قلم المنحنيات)', mobile: false, key: 'p' }, 'nodes');
  app.on('tool', (t) => { if (t !== 'bezier' && BezierTool.segs) BezierTool.finish(app, false); });
  window.addEventListener('keydown', (e) => {
    if (app.tool !== 'bezier' || !BezierTool.segs) return;
    if (e.key === 'Enter') BezierTool.finish(app, false);
    if (e.key === 'Escape') { BezierTool.segs = null; app.render(); }
  });
  registerSection(() => {
    if (app.tool !== 'bezier') return null;
    return section('المرسمة',
      h('p', { class: 'hint' }, 'المس لنقطة حادة، واسحب لتشكيل منحنى. المس النقطة الأولى لإغلاق الشكل (يصير مساحة ممتلئة). لخط مفتوح: «إنهاء».'),
      slider('سماكة الخط المفتوح', app.settings.bezierWidth || 8, { min: 1, max: 80, onInput: (v) => { app.settings.bezierWidth = v; }, onChange: () => app.saveSettings?.() }),
      row(btn('check', 'إنهاء', () => BezierTool.finish(app, false)), btn('close', 'إلغاء', () => { BezierTool.segs = null; app.render(); })));
  });
}

/* ============================ warp icons ============================ */
const warpIconCache = {};
export function warpIcon(mode) {
  if (warpIconCache[mode]) return warpIconCache[mode];
  // a sample "word" made of bars, warped like the real thing
  const sample = 'M4,14 L56,14 L56,22 L4,22 Z M8,6 L14,6 L14,22 L8,22 Z M24,8 L30,8 L30,22 L24,22 Z M40,4 L46,4 L46,22 L40,22 Z';
  let d = sample;
  try { d = warpD(sample, { mode, amount: mode === 'ring' ? 0.6 : 0.6 }); } catch { /* keep sample */ }
  const b = toItem(d).bounds;
  const pad = 3;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}" width="44" height="30"><path d="${d}" fill="currentColor"/></svg>`;
  return (warpIconCache[mode] = svg);
}
function installWarpIcons() { /* used by the warp panel through warpIcon() */ }

/* ============================ glyphs as shapes ============================ */
function numGlyphs(fh) {
  try { const t = fh.face.referenceTable('maxp'); return (t[4] << 8) | t[5]; } catch { return 0; }
}
function shapeForms(fh, ch, feats) {
  const out = [];
  const forms = [ch, ch + 'ـ', 'ـ' + ch + 'ـ', 'ـ' + ch];
  for (const f of [null, ...feats]) for (const [i, t] of forms.entries()) {
    const buf = new hb.Buffer(); buf.addText(t); buf.setDirection('rtl'); buf.guessSegmentProperties();
    hb.shape(fh.font, buf, f ? [hb.Feature.fromString(f)] : []);
    const infos = buf.getGlyphInfos();
    const g = infos.find((x) => x.cluster === (i === 0 || i === 1 ? 0 : 1));
    if (g) out.push(g.codepoint);
  }
  return [...new Set(out)];
}
export function glyphSVG(fh, gid, size = 56) {
  const cmds = glyphCmds(fh, gid, 1);
  const d = toD(cmds);
  if (!d) return '';
  const b = toItem(d).bounds;
  const s = Math.max(b.width, b.height) || 1;
  const pad = s * 0.08;
  return `<svg viewBox="${b.x - pad} ${b.y - pad} ${s + pad * 2} ${s + pad * 2}" width="${size}" height="${size}"><path d="${d}" fill="currentColor"/></svg>`;
}

export async function openGlyphs(app) {
  const sel = app.one;
  const fontId = (sel && (sel.fontId)) || app.lastTextProps?.fontId || 'amiri';
  const fh = await ensureFont(fontId);
  const letters = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي ى ة ء أ إ آ ؤ ئ لا الله'.split(' ');
  const marks = 'َ ُ ِ ْ ّ ً ٌ ٍ ٰ ٓ ٔ'.split(' ');
  const total = numGlyphs(fh);
  let mode = 'letter', cur = 'ا', page = 0;
  const grid = h('div', { class: 'glyphgrid' });
  const insert = (gid) => {
    const size = Math.round(app.doc.width / 5);
    const s = size / fh.upem;
    const d = toD(glyphCmds(fh, gid, s));
    const b = toItem(d).bounds;
    const o = pathObject(d, { name: 'حرف', style: blackStyle(), m: translate(app.doc.width / 2 - b.x - b.width / 2, app.doc.height / 2 - b.y - b.height / 2) });
    app.add(o);
    app.commit('إدراج حرف كشكل');
    app.render({ panels: true });
    toast('أُدرج الحرف كشكل. أدرج غيره أو أغلق اللوحة.');
  };
  const draw = () => {
    grid.innerHTML = '';
    let gids;
    if (mode === 'letter') gids = cur === 'الله' || cur === 'لا' ? shapeWord(fh, cur) : shapeForms(fh, cur, fh.altFeatures);
    else if (mode === 'marks') gids = marks.flatMap((m) => shapeForms(fh, m, []).slice(0, 1));
    else gids = Array.from({ length: Math.min(120, total - page * 120) }, (_, i) => page * 120 + i);
    for (const gid of gids) {
      const svg = glyphSVG(fh, gid);
      if (!svg) continue;
      grid.append(h('button', { type: 'button', class: 'glyph', title: `#${gid}`, html: svg, onClick: () => insert(gid) }));
    }
    if (!grid.children.length) grid.append(h('p', { class: 'hint' }, 'لا توجد أشكال هنا.'));
    pager.hidden = mode !== 'all';
    pageLbl.textContent = `${page + 1} / ${Math.ceil(total / 120)}`;
  };
  const pageLbl = h('span', {});
  const pager = h('div', { class: 'brow' }, btn('right', 'السابق', () => { if (page > 0) { page--; draw(); } }, { iconOnly: true }), pageLbl, btn('left', 'التالي', () => { if ((page + 1) * 120 < total) { page++; draw(); } }, { iconOnly: true }));
  const chips = h('div', { class: 'chips' }, letters.map((l) => h('button', { type: 'button', class: 'chip big', onClick: (e) => { mode = 'letter'; cur = l; chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on'); tabs.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('on', i === 0)); draw(); } }, h('span', { class: 'mk' }, l))));
  const tabs = h('div', { class: 'chips' },
    h('button', { type: 'button', class: 'chip on', onClick: (e) => { mode = 'letter'; tabs.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on'); chips.hidden = false; draw(); } }, 'أشكال الحرف'),
    h('button', { type: 'button', class: 'chip', onClick: (e) => { mode = 'marks'; tabs.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on'); chips.hidden = true; draw(); } }, 'الحركات'),
    h('button', { type: 'button', class: 'chip', onClick: (e) => { mode = 'all'; tabs.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on'); chips.hidden = true; draw(); } }, `كل أشكال الخط (${total})`));
  openSheet(`حروف الخط كأشكال — ${fontInfo(fontId).name}`, h('div', { class: 'glyphs' },
    h('p', { class: 'hint' }, 'المس شكلًا لإدراجه في اللوحة كشكل متجهي قابل للتعديل والدمج. الخط المستعمل هو خط النص المحدد (أو آخر خط استعملته).'),
    tabs, chips, grid, pager), { wide: true });
  chips.firstChild?.classList.add('on');
  draw();
}
function shapeWord(fh, word) {
  const out = [];
  for (const f of [null, ...fh.altFeatures]) {
    const buf = new hb.Buffer(); buf.addText(word); buf.setDirection('rtl'); buf.guessSegmentProperties();
    hb.shape(fh.font, buf, f ? [hb.Feature.fromString(f)] : []);
    for (const g of buf.getGlyphInfos()) out.push(g.codepoint);
  }
  return [...new Set(out)];
}

export { TOOLS, uid, localD, itemD, closeSheet };
