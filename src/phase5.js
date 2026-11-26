// Phase 5 — square Kufic, hand writing (S Pen / finger / mouse), envelope & warp.
import { registerTool } from './tools/index.js';
import { registerSection, section, row } from './ui/panels.js';
import { h, btn, slider, select, field, colorInput, toast } from './ui/dom.js';
import { registerGeometry, localD, cleanD } from './core/geometry.js';
import { kufiD, kufiObject, resize, transformGrid, autoWrite } from './core/kufi.js';
import { KufiTool, PenTool, WarpTool, warpState, applyWarp } from './tools/phase5-tools.js';
import { WARP_MODES, defaultMesh } from './core/warp.js';
import { warpIcon } from './phase6.js';
import { pathObject, clone, translate } from './core/model.js';

export function install(app) {
  registerGeometry('kufi', kufiD);
  registerTool(KufiTool, { id: 'kufi', icon: 'kufi', label: 'كوفي مربع', mobile: false, key: 'q' }, 'eraser');
  registerTool(PenTool, { id: 'pen', icon: 'brush', label: 'كتابة يدوية', mobile: true, key: 'b' }, 'kufi');
  registerTool(WarpTool, { id: 'warp', icon: 'warp', label: 'غلاف وتشويه', mobile: false, key: 'w' }, 'pen');
  app.on('selection', () => { if (app.toolState.warp && app.toolState.warp.id !== app.one?.id) app.toolState.warp = null; });

  /* kufi panel */
  registerSection((app, objs) => {
    const o = objs.length === 1 && objs[0].type === 'kufi' ? objs[0] : null;
    if (!o && app.tool !== 'kufi') return null;
    const s = app.settings;
    const sym = field('تناظر أثناء الرسم', select([['none', 'بلا'], ['mirror', 'مرآة يمين/يسار'], ['mirror4', 'مرآة رباعية'], ['rot4', 'تدوير رباعي']], s.kufiSym || 'none', (v) => { s.kufiSym = v; app.saveSettings?.(); }));
    const mode = row(btn('brush', 'رسم', () => { s.kufiErase = false; app.render({ panels: true }); }, { active: !s.kufiErase, class: 'toggle' }),
      btn('eraser', 'مسح', () => { s.kufiErase = true; app.render({ panels: true }); }, { active: !!s.kufiErase, class: 'toggle' }));
    let word = s.kufiWord || 'الله';
    const inp = h('input', { type: 'text', value: word, dir: 'rtl', class: 'txt', onInput: (e) => { word = e.target.value; s.kufiWord = word; } });
    const write = () => {
      if (!word.trim()) return;
      const g = autoWrite(word.trim());
      if (o) { o.cols = g.cols; o.rows = g.rows; o.cells = g.cells; } else {
        const k = kufiObject(g.cols, g.rows, 30, { cells: g.cells, m: translate(app.doc.width / 2 - (g.cols * 30) / 2, app.doc.height / 2 - (g.rows * 30) / 2), name: 'كوفي: ' + word });
        app.add(k);
      }
      app.setTool('kufi');
      app.commit('كتابة كوفية آلية');
      app.render({ panels: true });
      toast('اقتراح أولي: عدّله بإصبعك خلية خلية');
    };
    if (!o) {
      return section('الكوفي المربع',
        h('p', { class: 'hint' }, 'المس اللوحة لإنشاء شبكة فارغة، أو اكتب كلمة ليقترح البرنامج تكوينًا كوفيًا تعدّله بعد ذلك.'),
        slider('حجم الشبكة الجديدة', s.kufiSize || 21, { min: 5, max: 61, step: 2, onInput: (v) => { s.kufiSize = v; } }),
        field('كلمة', inp), row(btn('sparkles', 'كتابة آلية', write, { class: 'primary' })), sym);
    }
    const tr = (k, label) => () => { transformGrid(o, k); app.commit(label); app.render({ panels: true }); };
    let cols = o.cols, rows = o.rows;
    return section('الكوفي المربع',
      row(btn('kufi', app.tool === 'kufi' ? 'إنهاء الرسم' : 'رسم الخلايا', () => app.setTool(app.tool === 'kufi' ? 'select' : 'kufi'), { active: app.tool === 'kufi', class: 'toggle' })),
      app.tool === 'kufi' ? h('p', { class: 'hint' }, 'المس خلية أو اسحب فوق الخلايا لملئها؛ البدء من خلية مملوءة يمسح.') : null,
      mode, sym,
      slider('عدد الأعمدة', cols, { min: 3, max: 101, onInput: (v) => { cols = v; }, onChange: () => { resize(o, cols, o.rows); app.commit('حجم الشبكة'); app.render({ panels: true }); } }),
      slider('عدد الصفوف', rows, { min: 3, max: 101, onInput: (v) => { rows = v; }, onChange: () => { resize(o, o.cols, rows); app.commit('حجم الشبكة'); app.render({ panels: true }); } }),
      slider('مقاس الخلية', o.cell, { min: 4, max: 120, onInput: (v) => { o.cell = v; app.render(); }, onChange: () => app.commit('مقاس الخلية') }),
      slider('الفراغ بين الخلايا', Math.round((o.gap || 0) * 100), { min: 0, max: 60, unit: '%', onInput: (v) => { o.gap = v / 100; app.render(); }, onChange: () => app.commit('فراغ الخلايا') }),
      h('div', { class: 'mgrid tight' },
        btn('trash', 'تفريغ', () => { o.cells = '0'.repeat(o.cols * o.rows); app.commit('تفريغ'); app.render({ panels: true }); }),
        btn('fill', 'عكس', tr('invert', 'عكس الخلايا')),
        btn('mirror', 'مرآة', tr('mirror', 'مرآة')),
        btn('rotate', 'تدوير ×4', tr('rot4', 'تدوير رباعي'))),
      field('كلمة', inp), row(btn('sparkles', 'كتابة آلية', write)),
      row(btn('outline', 'تحويل إلى شكل واحد', () => {
        const p = pathObject(cleanD(localD(o)), { name: (o.name || 'كوفي') + ' (شكل)', m: o.m.slice(), style: clone(o.style), live: app.settings.keepLive !== false ? clone(o) : null });
        app.replace(o.id, p); app.selection = [p.id]; app.setTool('select'); app.commit('تحويل الكوفي'); app.render({ panels: true });
      })));
  });

  /* hand writing panel */
  registerSection((app) => {
    if (app.tool !== 'pen') return null;
    const s = app.settings;
    const save = () => app.saveSettings?.();
    const type = s.penType || 'qalam';
    return section('الكتابة اليدوية',
      h('p', { class: 'hint' }, 'اكتب بقلم S Pen أو بإصبعك أو بالفأرة. يُقرأ ضغط القلم إن وُجد، وإلا يُحاكى من السرعة. كل ضربة تتحوّل إلى شكل متجهي نظيف قابل للتعديل.'),
      row(...[['qalam', 'قلم قصب'], ['round', 'قلم مستدير'], ['mono', 'خط ثابت']].map(([k, l]) => btn(k === 'qalam' ? 'pen' : k === 'round' ? 'brush' : 'minus', l, () => { s.penType = k; save(); app.render({ panels: true }); }, { active: type === k, class: 'toggle' }))),
      slider('عرض القلم', s.penWidth || 14, { min: 1, max: 120, onInput: (v) => { s.penWidth = v; }, onChange: save }),
      type === 'qalam' ? slider('زاوية رأس القلم', s.penAngle ?? 35, { min: 0, max: 180, unit: '°', onInput: (v) => { s.penAngle = v; }, onChange: save }) : null,
      slider('تنعيم حركة اليد', Math.round((s.penSmooth ?? 0.5) * 100), { min: 0, max: 90, unit: '%', onInput: (v) => { s.penSmooth = v / 100; }, onChange: save }),
      field('اللون', colorInput(s.penColor || '#1b1b1b', (v) => { s.penColor = v; save(); })));
  });

  /* envelope & warp panel */
  registerSection((app, objs) => {
    const o = objs.length === 1 ? objs[0] : null;
    if (!o || o.type === 'image') return app.tool === 'warp' ? section('غلاف وتشويه', h('p', { class: 'hint' }, 'حدّد عنصرًا واحدًا (نصًا أو حروفًا أو شكلًا).')) : null;
    if (app.tool !== 'warp') {
      return section('غلاف وتشويه', row(btn('warp', 'غلاف وتشويه', () => { app.toolState.warp = null; app.setTool('warp'); })));
    }
    const st = warpState(app);
    if (!st) return null;
    const redraw = () => app.render();
    return section('غلاف وتشويه',
      h('p', { class: 'hint' }, st.mode === 'mesh' ? 'اسحب النقاط التسع لتشكيل الغلاف بحرية، ثم اضغط «تطبيق».' : 'اختر النوع والمقدار وشاهد المعاينة، ثم اضغط «تطبيق».'),
      h('div', { class: 'chips warpchips' }, WARP_MODES.map(([k, l]) => h('button', {
        type: 'button', class: 'chip' + (st.mode === k ? ' on' : ''), title: l, 'aria-label': l, html: warpIcon(k),
        onClick: () => { st.mode = k; app.settings.warpMode = k; if (k === 'ring' && Math.abs(st.amount) < 0.1) st.amount = 0.5; app.render({ panels: true }); },
      }))),
      st.mode !== 'square' && st.mode !== 'circle' && st.mode !== 'mesh'
        ? slider(st.mode === 'ring' ? 'انحناء القوس (من دورة كاملة)' : 'المقدار', Math.round(st.amount * 100), { min: st.mode === 'ring' ? -100 : -100, max: 100, unit: '%', onInput: (v) => { st.amount = v / 100; app.settings.warpAmount = st.amount; redraw(); } })
        : null,
      st.mode === 'mesh' ? row(btn('restore', 'إعادة الشبكة', () => { st.mesh = defaultMesh(st.box); redraw(); })) : null,
      row(btn('check', 'تطبيق', () => applyWarp(app), { class: 'primary' }), btn('close', 'إلغاء', () => { app.toolState.warp = null; app.setTool('select'); })),
      h('small', { class: 'hint' }, 'يُحفظ مع النتيجة نسخة حيّة من الأصل (إن كان خيار «الاحتفاظ بنسخة حيّة» مفعّلًا).'));
  });
}
