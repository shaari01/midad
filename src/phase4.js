// Phase 4 — decoration: the appearance editor lives in ui/style-editor.js;
// this module adds Blend (shape interpolation between two shapes).
import { registerSection, section, row } from './ui/panels.js';
import { h, btn, slider, toast } from './ui/dom.js';
import { worldD } from './core/geometry.js';
import { blendSteps, mixStyle } from './core/blend.js';
import { pathObject, groupObject, clone, I } from './core/model.js';

export function install(app) {
  registerSection((app, objs) => {
    const shapes = app.doc.objects.filter((o) => app.selection.includes(o.id) && o.type !== 'image' && o.type !== 'group');
    if (shapes.length !== 2) return null;
    let steps = app.settings.blendSteps || 6;
    return section('Blend (تدرج شكلي)',
      h('p', { class: 'hint' }, 'ينشئ أشكالًا وسيطة تتدرج في الشكل واللون بين العنصرين المحددين.'),
      slider('عدد الخطوات', steps, { min: 1, max: 60, onInput: (v) => { steps = v; app.settings.blendSteps = v; } }),
      row(btn('blend', 'إنشاء التدرج', () => makeBlend(app, shapes, steps), { class: 'primary' })));
  });
}

export function makeBlend(app, [a, b], steps) {
  let mids;
  try { mids = blendSteps(worldD(a), worldD(b), steps); } catch (e) { console.error(e); return toast('تعذّر إنشاء التدرج لهذين الشكلين', 'error'); }
  const A = pathObject(worldD(a), { name: a.name, style: clone(a.style), m: I.slice() });
  const B = pathObject(worldD(b), { name: b.name, style: clone(b.style), m: I.slice() });
  const kids = [A, ...mids.map((s, i) => pathObject(s.d, { name: `خطوة ${i + 1}`, style: mixStyle(a.style, b.style, s.t), m: I.slice() })), B];
  const g = groupObject(kids, { name: 'Blend' });
  const idx = app.doc.objects.indexOf(b);
  app.doc.objects.splice(idx + 1, 0, g);
  app.remove([a.id, b.id]);
  app.selection = [g.id];
  app.preview('Blend');
  app.render({ panels: true });
}
