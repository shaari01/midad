// Phase 3 — node editing, shaping (unite/minus/intersect/exclude/divide),
// Shape Builder, knife, vector eraser, simplify.
import { registerTool } from './tools/index.js';
import { registerSection, section, row } from './ui/panels.js';
import { h, btn, slider, select, field, toast } from './ui/dom.js';
import { NodesTool } from './tools/nodes.js';
import { ShapeBuilderTool, KnifeTool, EraserTool } from './tools/shape-tools.js';
import { worldD, simplifyD, countNodes, cleanD } from './core/geometry.js';
import { unite, subtractFront, intersectAll, excludeAll, regions, islands } from './core/boolean.js';
import { pathObject, clone, I } from './core/model.js';

export function install(app) {
  registerTool(NodesTool, { id: 'nodes', icon: 'nodes', label: 'العُقد', mobile: true, key: 'a' }, 'letters');
  registerTool(ShapeBuilderTool, { id: 'builder', icon: 'builder', label: 'باني الأشكال', mobile: false, key: 'm' }, 'nodes');
  registerTool(KnifeTool, { id: 'knife', icon: 'knife', label: 'سكين', mobile: false, key: 'c' }, 'builder');
  registerTool(EraserTool, { id: 'eraser', icon: 'eraser', label: 'ممحاة', mobile: false, key: 'e' }, 'knife');

  app.on('deleteKey', () => { if (app.tool === 'nodes') NodesTool.deleteNodes(app); });
  app.on('nudge', ([dx, dy]) => {
    if (app.tool !== 'nodes') return;
    const o = NodesTool.target(app);
    if (!o) return;
    NodesTool.cpFor(o);
    for (const k of NodesTool.sel(app)) { const s = NodesTool.seg(k); if (s) s.point = s.point.add([dx, dy]); }
    NodesTool.write(app, o);
    app.commit('تحريك عقد');
  });

  // nodes panel
  registerSection((app, objs) => {
    const o = objs.length === 1 ? objs[0] : null;
    if (o?.type !== 'path') return null;
    const n = countNodes(o.d);
    const editing = app.tool === 'nodes';
    const sel = (app.toolState.nodes || []).length;
    let tol = 2;
    const preview = h('small', { class: 'hint' }, `عدد النقاط الآن: ${n}`);
    return section('تعديل الشكل',
      row(btn('nodes', editing ? 'إنهاء تعديل العقد' : 'تعديل العقد', () => app.setTool(editing ? 'select' : 'nodes'), { active: editing, class: 'toggle' })),
      editing ? h('p', { class: 'hint' }, 'المس عقدة لتحديدها واسحبها. المس الخط نفسه لإضافة عقدة. المقابض الصفراء تتحكم في الانحناء.') : null,
      editing ? row(
        btn('delNode', `حذف (${sel})`, () => NodesTool.deleteNodes(app), { disabled: !sel }),
        btn('corner', 'حادة', () => NodesTool.setType(app, 'corner'), { disabled: !sel }),
        btn('smooth', 'منحنية', () => NodesTool.setType(app, 'smooth'), { disabled: !sel })) : null,
      editing ? field('تناظر مرآوي أثناء التعديل', select([['none', 'بلا'], ['x', 'يمين ويسار'], ['y', 'أعلى وأسفل']], app.settings.mirror || 'none', (v) => { app.settings.mirror = v; app.saveSettings?.(); })) : null,
      h('h4', {}, 'تنعيم المسار وتقليل النقاط'),
      slider('درجة التنعيم', tol, { min: 0.2, max: 20, step: 0.2, onInput: (v) => { tol = v; } }),
      row(btn('simplify', 'تنعيم', () => {
        const before = countNodes(o.d);
        o.d = simplifyD(o.d, tol);
        app.commit('تنعيم المسار');
        toast(`النقاط: ${before} ← ${countNodes(o.d)}`);
        app.render({ panels: true });
      }), btn('unite', 'دمج التداخل', () => { o.d = cleanD(o.d); app.commit('دمج التداخل'); app.render({ panels: true }); }),
      btn('ungroup', 'تفكيك إلى أجزاء', () => breakApart(app, o))),
      preview);
  });

  // shaping panel
  registerSection((app, objs) => {
    const shapes = objs.filter((o) => o.type !== 'image' && o.type !== 'group');
    if (shapes.length < 2) {
      if (app.tool === 'builder') return section('باني الأشكال', h('p', { class: 'hint' }, 'حدّد شكلين متداخلين أو أكثر (اضغطهما بالتتابع)، ثم مرّر إصبعك فوق المناطق لدمجها أو حذفها.'));
      return null;
    }
    const run = (fn, label) => () => shapeOp(app, fn, label);
    return section('دمج وقص (Pathfinder)',
      h('p', { class: 'hint' }, 'النصوص والحروف الحيّة تتحوّل إلى أشكال تلقائيًا. «قص» يطرح الأشكال العليا من السفلى.'),
      h('div', { class: 'mgrid tight' },
        btn('unite', 'دمج', run('unite', 'دمج')),
        btn('subtract', 'قص', run('minus', 'قص')),
        btn('intersect', 'تقاطع', run('intersect', 'تقاطع')),
        btn('exclude', 'استبعاد', run('exclude', 'استبعاد')),
        btn('divide', 'تقسيم', run('divide', 'تقسيم'))),
      row(btn('builder', app.tool === 'builder' ? 'باني الأشكال يعمل' : 'باني الأشكال', () => app.setTool(app.tool === 'builder' ? 'select' : 'builder'), { active: app.tool === 'builder', class: 'toggle' })),
      app.tool === 'builder' ? h('div', {},
        h('p', { class: 'hint' }, 'مرّر إصبعك فوق المناطق الملوّنة: تُدمج المناطق التي مررت عليها في شكل واحد، أو تُحذف في وضع الحذف.'),
        row(btn('unite', 'وضع الدمج', () => { app.settings.sbMode = 'merge'; app.render({ panels: true }); }, { active: app.settings.sbMode !== 'delete', class: 'toggle' }),
          btn('trash', 'وضع الحذف', () => { app.settings.sbMode = 'delete'; app.render({ panels: true }); }, { active: app.settings.sbMode === 'delete', class: 'toggle' }))) : null);
  });

  // knife / eraser settings
  registerSection((app) => {
    if (app.tool === 'eraser') {
      return section('الممحاة المتجهية',
        h('p', { class: 'hint' }, 'امسح بإصبعك فوق الشكل؛ يُطرح أثر الممحاة من الشكل (تُمسح الأشكال المحددة فقط إن حددت شيئًا).'),
        slider('حجم الممحاة', app.settings.eraserSize || 30, { min: 4, max: 160, unit: 'بكسل شاشة', onInput: (v) => { app.settings.eraserSize = v; }, onChange: () => app.saveSettings?.() }));
    }
    if (app.tool === 'knife') return section('السكين', h('p', { class: 'hint' }, 'ارسم خطًّا يعبر الشكل من طرف إلى طرف فيُقطع إلى أجزاء مستقلة.'));
    return null;
  });
}

function prepared(app) {
  // bottom → top order, world geometry
  return app.doc.objects.filter((o) => app.selection.includes(o.id) && o.type !== 'image' && o.type !== 'group');
}

export function shapeOp(app, kind, label) {
  const objs = prepared(app);
  if (objs.length < 2) return;
  const ds = objs.map((o) => worldD(o));
  const top = objs[objs.length - 1], bottom = objs[0];
  let out = [];
  try {
    if (kind === 'unite') out = [pathObject(unite(ds), { name: 'شكل مدموج', style: clone(top.style) })];
    if (kind === 'minus') out = [pathObject(subtractFront(ds), { name: (bottom.name || 'شكل') + ' (مقصوص)', style: clone(bottom.style) })];
    if (kind === 'intersect') out = [pathObject(intersectAll(ds), { name: 'تقاطع', style: clone(top.style) })];
    if (kind === 'exclude') out = [pathObject(excludeAll(ds), { name: 'استبعاد', style: clone(top.style) })];
    if (kind === 'divide') out = regions(ds).map((r, i) => pathObject(r.d, { name: `جزء ${i + 1}`, style: clone(objs[r.owner].style) }));
  } catch (e) { console.error(e); toast('تعذّرت العملية على هذه الأشكال', 'error'); return; }
  out = out.filter((o) => o.d && o.d.trim());
  if (!out.length) { toast('النتيجة فارغة (الأشكال لا تتداخل؟)', 'warn'); return; }
  out.forEach((o) => { o.m = I.slice(); });
  const idx = app.doc.objects.indexOf(top);
  const ids = new Set(objs.map((o) => o.id));
  const below = app.doc.objects.slice(0, idx + 1).filter((o) => !ids.has(o.id));
  const above = app.doc.objects.slice(idx + 1);
  app.doc.objects = [...below, ...out, ...above];
  app.selection = out.map((o) => o.id);
  app.commit(label);
  app.render({ panels: true });
}

export function breakApart(app, o) {
  const parts = islands(worldD(o));
  if (parts.length < 2) return toast('الشكل قطعة واحدة');
  const objs = parts.map((d, i) => pathObject(d, { name: `${o.name || 'شكل'} ${i + 1}`, style: clone(o.style), m: I.slice() }));
  app.replace(o.id, objs);
  app.selection = objs.map((x) => x.id);
  app.setTool('select');
  app.commit('تفكيك');
  app.render({ panels: true });
}
