// Browser scenarios per phase. Each run gets {page, vp, shot, expect, ctx}.
import fs from 'node:fs';

export const tool = async (page, id) => { const b = page.locator(`button[data-tool="${id}"]:visible`).first(); if (await b.count()) await b.click(); else await page.evaluate((t) => window.midad.app.setTool(t), id); };
export const doc = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.midad.app.doc)));
export const openProps = async (page, vp) => { if (vp === 'phone') { await page.evaluate(() => window.midad.toggleDrawer('props', true)); await page.waitForTimeout(350); } };
export const closeDrawer = async (page, vp) => { if (vp === 'phone') { await page.evaluate(() => window.midad.toggleDrawer(null)); await page.waitForTimeout(350); } };
export const clickBtn = (page, label) => page.locator(`.side button:visible, .sheet button:visible`).filter({ hasText: label }).first().click();
export async function stageBox(page) { return page.locator('#canvas').boundingBox(); }
export async function screenOf(page, x, y) {
  const [sx, sy] = await page.evaluate(([a, b]) => window.midad.canvas.toScreen(a, b), [x, y]);
  const box = await stageBox(page);
  return [box.x + sx, box.y + sy];
}
export async function fresh(page, w = 1080, hgt = 1080) {
  await page.evaluate(async ([a, b]) => { await window.midad.app.newProject(a, b, 'اختبار'); }, [w, hgt]);
  await page.waitForTimeout(200);
}
export async function addText(page, text, props = {}) {
  return page.evaluate(async ([t, p]) => {
    const { app } = window.midad;
    const o = { id: 't' + Math.random().toString(36).slice(2), type: 'text', name: t, visible: true, locked: false, text: t, fontId: 'amiri', size: 200, letterSpacing: 0, wordSpacing: 0, lineHeight: 1.6, align: 'right', features: [], kashida: {}, kashidaCurve: 0.5, m: [1, 0, 0, 1, 200, 300], style: { fills: [{ type: 'solid', color: '#1b1b1b', opacity: 1 }], strokes: [], opacity: 1, shadow: null, glow: null, extrude: null, contour: null }, ...p };
    app.add(o); app.commit('test'); return o.id;
  }, [text, props]);
}

async function download(page, trigger) {
  const [dl] = await Promise.all([page.waitForEvent('download'), trigger()]);
  const p = await dl.path();
  return { name: dl.suggestedFilename(), data: fs.readFileSync(p) };
}

export const scenarios = [
  {
    phase: 1, id: 'boot', name: 'يفتح البرنامج ويعرض النص الابتدائي',
    async run({ page, shot, expect }) {
      const n = await page.locator('#content path').count();
      expect(n > 0, 'starter text not rendered');
      const dir = await page.evaluate(() => getComputedStyle(document.body).direction);
      expect(dir === 'rtl', 'UI must be RTL');
      const small = await page.evaluate(() => [...document.querySelectorAll('.toolbar .btn:not(.hidden), .bottombar .btn, .topbar .btn')].filter((b) => b.offsetParent).map((b) => b.getBoundingClientRect()).filter((r) => r.width < 40 || r.height < 40).length);
      expect(small === 0, `${small} buttons smaller than 40px`);
      await shot('start');
    },
  },
  {
    phase: 1, id: 'write', name: 'كتابة نص وتبديل الخط',
    async run({ page, vp, shot, expect }) {
      await fresh(page);
      await tool(page, 'text');
      const [x, y] = await screenOf(page, 800, 500);
      await page.mouse.click(x, y);
      await page.waitForTimeout(200);
      const ta = page.locator('textarea.textedit:visible');
      await ta.fill('محمد رسول الله');
      await ta.blur();
      let d = await doc(page);
      expect(d.objects.length === 1 && d.objects[0].text === 'محمد رسول الله', 'text not set');
      await page.locator('.fontbtn:visible').click();
      await page.locator('.fontcard', { hasText: 'عارف رقعة' }).click();
      await page.waitForTimeout(300);
      d = await doc(page);
      expect(d.objects[0].fontId === 'arefruqaa', 'font not switched');
      await closeDrawer(page, vp);
      await shot('ruqaa');
      // undo restores the previous font
      await page.locator('.topbar button[title^="تراجع"]').click();
      d = await doc(page);
      expect(d.objects[0].fontId === 'amiri', 'undo failed');
      await page.locator('.topbar button[title^="إعادة"]').click();
      d = await doc(page);
      expect(d.objects[0].fontId === 'arefruqaa', 'redo failed');
    },
  },
  {
    phase: 1, id: 'kashida', name: 'سحب مقبض التطويل يمدّ الوصلة',
    async run({ page, vp, shot, expect }) {
      await fresh(page);
      const id = await addText(page, 'بسم');
      await page.evaluate((i) => window.midad.app.select(i), id);
      const w0 = await page.evaluate(() => window.midad.canvas.selectionBounds().w);
      await page.evaluate(() => window.midad.app.setTool('kashida'));
      const handles = page.locator('#overlay [data-handle^="k"]');
      expect(await handles.count() === 2, 'expected 2 kashida handles');
      await page.waitForTimeout(150);
      const box = await handles.first().boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 60, box.y + box.height / 2, { steps: 6 });
      await page.mouse.up();
      const d = await doc(page);
      const kas = d.objects[0].kashida;
      expect(Object.values(kas).some((v) => v > 0.2), 'kashida not applied: ' + JSON.stringify(kas));
      const w1 = await page.evaluate(() => window.midad.canvas.selectionBounds().w);
      expect(w1 > w0 + 50, `width did not grow ${w0} → ${w1}`);
      await shot('kashida');
    },
  },
  {
    phase: 1, id: 'outline', name: 'التحويل إلى أشكال مع نسخة حيّة، والعودة لها',
    async run({ page, vp, expect, shot }) {
      await fresh(page);
      const id = await addText(page, 'الله');
      await page.evaluate((i) => window.midad.app.select(i), id);
      await openProps(page, vp);
      await clickBtn(page, 'تحويل إلى أشكال');
      let d = await doc(page);
      expect(d.objects[0].type === 'path' && d.objects[0].live?.type === 'text', 'not converted with live copy');
      expect(d.objects[0].d.length > 50, 'empty outline');
      await shot('outlined');
      await clickBtn(page, 'عودة للنسخة الحيّة');
      d = await doc(page);
      expect(d.objects[0].type === 'text', 'live copy not restored');
    },
  },
  {
    phase: 1, id: 'export', name: 'تصدير SVG وPNG وPDF وملف المشروع',
    viewports: ['laptop'],
    async run({ page, expect }) {
      await fresh(page);
      await addText(page, 'خط');
      await page.locator('.topbar button[aria-label="تصدير"]').click();
      let f = await download(page, () => page.locator('.sheet button', { hasText: 'SVG كامل' }).click());
      const svg = f.data.toString();
      expect(svg.includes('<path') && svg.includes('viewBox="0 0 1080 1080"'), 'bad svg ' + f.name);
      f = await download(page, () => page.locator('.sheet button', { hasText: 'SVG مبسّط' }).click());
      expect(!f.data.toString().includes('<use'), 'simple svg should not use <use>');
      f = await download(page, () => page.locator('.sheet button', { hasText: 'PNG شفاف' }).click());
      expect(f.data.slice(1, 4).toString() === 'PNG' && f.data.readUInt32BE(16) === 4000, 'png not 4000px');
      f = await download(page, () => page.locator('.sheet button', { hasText: 'PDF متجهي' }).click());
      expect(f.data.slice(0, 4).toString() === '%PDF', 'bad pdf');
      await page.keyboard.press('Escape');
      await page.locator('.topbar .homebtn').click();
      f = await download(page, () => page.locator('.homepanel .hrow', { hasText: 'حفظ ملف المشروع' }).click());
      const j = JSON.parse(f.data.toString());
      expect(j.format === 'midad' && j.doc.objects.length === 1, 'bad project file');
    },
  },
  {
    phase: 1, id: 'offline', name: 'يعمل بلا إنترنت بعد أول تحميل ويحفظ تلقائيًا',
    viewports: ['phone'],
    async run({ page, ctx, expect }) {
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.waitForTimeout(1500);
      await fresh(page);
      await addText(page, 'حفظ تلقائي');
      await page.evaluate(() => window.midad.app.saveNow());
      await ctx.setOffline(true);
      await page.reload();
      await page.waitForFunction(() => window.midad?.app?.doc?.objects?.length > 0, null, { timeout: 20000 });
      const d = await doc(page);
      expect(d.objects[0].text === 'حفظ تلقائي', 'autosave/offline reload failed');
      await ctx.setOffline(false);
    },
  },
];

export async function itemCenter(page, idx) {
  return page.evaluate((i) => {
    const pts = [...document.querySelectorAll('#overlay polygon')][i].getAttribute('points').split(' ').map((p) => p.split(',').map(Number));
    const r = document.querySelector('#canvas').getBoundingClientRect();
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return [r.left + cx, r.top + cy];
  }, idx);
}
export async function drag(page, [x0, y0], [x1, y1]) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  await page.mouse.move(x1, y1, { steps: 8 }); await page.mouse.up();
}

scenarios.push({
  phase: 2, id: 'letters', name: 'فكّ الكلمة وتحريك حرف ومدّه وتبديل الخط مع بقاء التعديلات',
  async run({ page, vp, shot, expect }) {
    await fresh(page);
    const id = await addText(page, 'محمد', { size: 260, m: [1, 0, 0, 1, 250, 350] });
    await page.evaluate((i) => window.midad.app.select(i), id);
    await openProps(page, vp);
    await clickBtn(page, 'فكّ الكلمة');
    let d = await doc(page);
    expect(d.objects[0].type === 'letters' && d.objects[0].items.length === 4, 'not exploded');
    await closeDrawer(page, vp);
    const n = await page.locator('#overlay polygon').count();
    expect(n === 4, 'letter boxes missing: ' + n);
    // tap the 2nd letter and drag it up
    const c = await itemCenter(page, 1);
    await page.mouse.click(c[0], c[1]);
    await drag(page, c, [c[0], c[1] - 60]);
    d = await doc(page);
    const moved = d.objects[0].items.filter((i) => i.t.dy < -20);
    expect(moved.length === 1, 'letter not moved');
    // stretch handle
    await page.waitForTimeout(250);
    const sh = page.locator('#overlay [data-handle="stretchL"]');
    const b = await sh.boundingBox();
    if (!b) console.log('handles:', await page.evaluate(() => [...document.querySelectorAll('#overlay [data-handle]')].map((x) => x.getAttribute('data-handle')).join(',') + ' sel=' + JSON.stringify(window.midad.app.toolState.items) + ' tool=' + window.midad.app.tool));
    await drag(page, [b.x + b.width / 2, b.y + b.height / 2], [b.x - 80, b.y + b.height / 2]);
    d = await doc(page);
    expect(d.objects[0].items.some((i) => i.t.stretchX > 40), 'stretch not applied');
    await shot('edited');
    // change font, edits stay
    await openProps(page, vp);
    await page.locator('.side .fontbtn:visible').click();
    await page.locator('.fontcard', { hasText: 'عارف رقعة' }).click();
    await page.waitForTimeout(200);
    d = await doc(page);
    expect(d.objects[0].fontId === 'arefruqaa', 'font not changed');
    expect(d.objects[0].items.some((i) => i.t.dy < -20) && d.objects[0].items.some((i) => i.t.stretchX > 40), 'edits lost after font change');
    await closeDrawer(page, vp);
    await shot('ruqaa');
    // alternates for a letter
    await page.evaluate(() => { const { app } = window.midad; const o = app.one; o.fontId = 'amiri'; app.emit('fontChanged', o); app.toolState.items = [o.items.find((i) => i.ch === 'م').id]; app.render({ panels: true }); });
    await openProps(page, vp);
    const alts = await page.locator('.altcard:visible').count();
    expect(alts >= 2, 'no alternates shown');
    await page.locator('.altcard:visible').nth(1).click();
    d = await doc(page);
    expect(d.objects[0].items.some((i) => i.alt), 'alternate not applied');
    // outlines keep a live copy of the letters
    await page.evaluate(() => window.midad.app.setTool('select'));
    await clickBtn(page, 'تحويل إلى أشكال');
    d = await doc(page);
    expect(d.objects[0].type === 'path' && d.objects[0].live?.type === 'letters', 'letters outline failed');
  },
});

export async function addSquares(page) {
  return page.evaluate(() => {
    const { app } = window.midad;
    const mk = (x, y, s, color) => ({ id: 'p' + Math.random().toString(36).slice(2), type: 'path', name: 'مربع', visible: true, locked: false, d: `M${x},${y} L${x + s},${y} L${x + s},${y + s} L${x},${y + s} Z`, m: [1, 0, 0, 1, 0, 0], style: { fills: [{ type: 'solid', color, opacity: 1 }], strokes: [], opacity: 1 }, live: null });
    const a = mk(250, 300, 400, '#c9a227'), b = mk(450, 500, 400, '#0b3d91');
    app.doc.objects.push(a, b); app.select([a.id, b.id]); app.commit('test');
    return [a.id, b.id];
  });
}

scenarios.push({
  phase: 3, id: 'nodes', name: 'تعديل العقد وحذفها وإضافتها',
  async run({ page, vp, shot, expect }) {
    await fresh(page);
    const id = await addText(page, 'ب', { size: 500, m: [1, 0, 0, 1, 300, 200] });
    await page.evaluate((i) => window.midad.app.select(i), id);
    await openProps(page, vp);
    await clickBtn(page, 'تحويل إلى أشكال');
    await clickBtn(page, 'تعديل العقد');
    await closeDrawer(page, vp);
    const d0 = (await doc(page)).objects[0].d;
    const n0 = await page.locator('#overlay [data-handle^="n:"]').count();
    expect(n0 > 5, 'nodes not shown');
    const hb = await page.locator('#overlay [data-handle="n:0:0"]').boundingBox();
    const c = [hb.x + hb.width / 2, hb.y + hb.height / 2];
    await drag(page, c, [c[0] - 40, c[1] - 50]);
    const d1 = (await doc(page)).objects[0].d;
    expect(d1 !== d0, 'node drag did not change path');
    await shot('dragged');
    await page.evaluate(() => window.midad.app.emit('deleteKey'));
    await page.waitForTimeout(150);
    const n1 = await page.locator('#overlay [data-handle^="n:"]').count();
    expect(n1 === n0 - 1, `delete node failed ${n0} → ${n1}`);
    await page.locator('.topbar button[title^="تراجع"]').click();
    await page.waitForTimeout(150);
    expect((await page.locator('#overlay [data-handle^="n:"]').count()) === n0, 'undo of node delete failed');
  },
});

scenarios.push({
  phase: 3, id: 'boolean', name: 'دمج وتقسيم وباني الأشكال',
  async run({ page, vp, shot, expect }) {
    await fresh(page);
    await addSquares(page);
    await openProps(page, vp);
    await clickBtn(page, 'دمج');
    let d = await doc(page);
    expect(d.objects.length === 1, 'unite failed');
    await page.locator('.topbar button[title^="تراجع"]').click();
    await page.evaluate(() => { const { app } = window.midad; app.select(app.doc.objects.map((o) => o.id)); });
    await clickBtn(page, 'تقسيم');
    d = await doc(page);
    expect(d.objects.length === 3, 'divide expected 3 got ' + d.objects.length);
    await page.locator('.topbar button[title^="تراجع"]').click();
    await page.evaluate(() => { const { app } = window.midad; app.select(app.doc.objects.map((o) => o.id)); app.setTool('builder'); });
    await closeDrawer(page, vp);
    const a = await screenOf(page, 350, 400), b = await screenOf(page, 550, 600);
    await drag(page, a, b);
    d = await doc(page);
    expect(d.objects.length === 2, 'shape builder expected 2 got ' + d.objects.length);
    await shot('builder');
  },
});

scenarios.push({
  phase: 3, id: 'knife', name: 'السكين والممحاة',
  async run({ page, expect, shot }) {
    await fresh(page);
    await page.evaluate(() => { const { app } = window.midad; app.doc.objects.push({ id: 'sq', type: 'path', name: 'مربع', visible: true, locked: false, d: 'M300,300 L700,300 L700,700 L300,700 Z', m: [1, 0, 0, 1, 0, 0], style: { fills: [{ type: 'solid', color: '#222', opacity: 1 }], strokes: [], opacity: 1 } }); app.commit('t'); app.select([]); app.setTool('knife'); });
    await drag(page, await screenOf(page, 500, 200), await screenOf(page, 520, 800));
    let d = await doc(page);
    expect(d.objects.length === 2, 'knife expected 2 pieces got ' + d.objects.length);
    await page.evaluate(() => { window.midad.app.select([]); window.midad.app.setTool('eraser'); });
    const before = d.objects.map((o) => o.d).join('');
    await drag(page, await screenOf(page, 250, 500), await screenOf(page, 750, 500));
    d = await doc(page);
    expect(d.objects.map((o) => o.d).join('') !== before, 'eraser changed nothing');
    await shot('erased');
  },
});

scenarios.push({
  phase: 4, id: 'decor', name: 'الزخرفة: أنماط، حدود متعددة، تدرج، Contour، ظل، نقش',
  async run({ page, vp, shot, expect }) {
    await fresh(page);
    const id = await addText(page, 'الله نور', { size: 220, m: [1, 0, 0, 1, 120, 300] });
    await page.evaluate((i) => window.midad.app.select(i), id);
    await openProps(page, vp);
    await page.locator('.preset:visible', { hasText: 'ذهب مذهّب' }).click();
    let o = (await doc(page)).objects[0];
    expect(o.style.fills[0].type === 'linear' && o.style.strokes.length === 1, 'preset not applied');
    expect(await page.locator('#content linearGradient').count() > 0, 'gradient not rendered');
    await clickBtn(page, 'حدّ إضافي');
    o = (await doc(page)).objects[0];
    expect(o.style.strokes.length === 2, 'second stroke not added');
    await page.locator('.side button:visible:has(.lbl:text-is("Contour (حدود متكررة)"))').click();
    await page.locator('.side button:visible:has(.lbl:text-is("ظل"))').click();
    o = (await doc(page)).objects[0];
    expect(o.style.contour && !o.style.shadow, 'contour on / shadow toggled off expected');
    expect(await page.locator('#content mask').count() >= 3, 'contour rings not rendered');
    await closeDrawer(page, vp);
    await shot('gold');
    await openProps(page, vp);
    await page.locator('.side select:visible').first().selectOption('pattern');
    o = (await doc(page)).objects[0];
    expect(o.style.fills[0].type === 'pattern', 'pattern fill not set');
    expect(await page.locator('#content pattern').count() > 0, 'pattern not rendered');
    await closeDrawer(page, vp);
    await shot('pattern');
  },
});

scenarios.push({
  phase: 4, id: 'blend', name: 'Blend بين شكلين',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    await addSquares(page);
    await openProps(page, vp);
    await clickBtn(page, 'إنشاء التدرج');
    const d = await doc(page);
    expect(d.objects.length === 1 && d.objects[0].type === 'group' && d.objects[0].children.length === 8, 'blend group wrong: ' + JSON.stringify(d.objects.map((x) => [x.type, x.children?.length])));
    await closeDrawer(page, vp);
    await shot('blend');
  },
});

scenarios.push({
  phase: 5, id: 'kufi', name: 'الكوفي المربع: إنشاء شبكة، رسم خلايا بتناظر، كتابة آلية، تحويل',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    await page.evaluate(() => { const { app } = window.midad; app.settings.kufiSize = 11; app.settings.kufiSym = 'mirror'; app.setTool('kufi'); });
    await page.mouse.click(...(await screenOf(page, 540, 540)));
    let d = await doc(page);
    expect(d.objects.length === 1 && d.objects[0].type === 'kufi' && d.objects[0].cols === 11, 'kufi grid not created');
    const m = d.objects[0].m; // cell 30 → grid origin
    const cellC = (c, r) => screenOf(page, m[4] + c * 30 + 15, m[5] + r * 30 + 15);
    await drag(page, await cellC(1, 2), await cellC(4, 2));
    d = await doc(page);
    const cells = d.objects[0].cells;
    const filled = [...cells].filter((x) => x === '1').length;
    expect(filled >= 8, 'mirror paint expected ≥8 cells, got ' + filled);
    expect(cells[2 * 11 + 9] === '1', 'mirror cell missing');
    await shot('painted');
    await openProps(page, vp);
    await page.locator('.side input.txt:visible').first().fill('محمد');
    await clickBtn(page, 'كتابة آلية');
    d = await doc(page);
    expect(d.objects[0].cols > 11 || d.objects[0].cells !== cells, 'auto-write did nothing');
    await clickBtn(page, 'تحويل إلى شكل واحد');
    d = await doc(page);
    expect(d.objects[0].type === 'path' && d.objects[0].live?.type === 'kufi', 'kufi conversion failed');
    await closeDrawer(page, vp);
    await shot('converted');
  },
});

scenarios.push({
  phase: 5, id: 'pen', name: 'الكتابة اليدوية بقلم القصب والقلم المستدير',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    await page.evaluate(() => { const { app } = window.midad; app.settings.penType = 'qalam'; app.settings.penWidth = 30; app.setTool('pen'); });
    const pts = [];
    for (let i = 0; i <= 20; i++) pts.push(await screenOf(page, 300 + i * 25, 500 + Math.sin(i / 3) * 80));
    await page.mouse.move(...pts[0]); await page.mouse.down();
    for (const p of pts.slice(1)) await page.mouse.move(...p, { steps: 2 });
    await page.mouse.up();
    await page.evaluate(() => { window.midad.app.settings.penType = 'round'; });
    await drag(page, await screenOf(page, 300, 750), await screenOf(page, 800, 780));
    const d = await doc(page);
    expect(d.objects.length === 2 && d.objects.every((o) => o.type === 'path' && o.d.length > 20), 'pen strokes missing: ' + d.objects.length);
    await shot('strokes');
  },
});

scenarios.push({
  phase: 5, id: 'warp', name: 'الغلاف والتشويه: قوس، دائرة، شبكة حرة مع نسخة حيّة',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    const id = await addText(page, 'سلام', { size: 260, m: [1, 0, 0, 1, 250, 300] });
    await page.evaluate((i) => { window.midad.app.select([i]); window.midad.app.setTool('warp'); }, id);
    await openProps(page, vp);
    await page.locator('.side button.chip:visible').filter({ has: page.locator('svg') }).and(page.locator('[title="قوس"]')).first().click();
    await shot('arc-preview');
    expect(await page.locator('#overlay .warpprev').count() === 1, 'no warp preview');
    await clickBtn(page, 'تطبيق');
    let d = await doc(page);
    expect(d.objects[0].type === 'path' && d.objects[0].live?.type === 'text', 'warp did not produce path with live copy');
    // free mesh on the result
    await page.evaluate(() => window.midad.app.setTool('warp'));
    await page.locator('.side button.chip:visible').filter({ has: page.locator('svg') }).and(page.locator('[title="غلاف حر (شبكة)"]')).first().click();
    await closeDrawer(page, vp);
    const hb = await page.locator('#overlay [data-handle="m4"]').boundingBox();
    const c = [hb.x + hb.width / 2, hb.y + hb.height / 2];
    await drag(page, c, [c[0], c[1] - 60]);
    await openProps(page, vp);
    const before = d.objects[0].d;
    await clickBtn(page, 'تطبيق');
    d = await doc(page);
    expect(d.objects[0].d !== before, 'mesh warp did not change shape');
    await closeDrawer(page, vp);
    await shot('mesh');
  },
});

/* ---------------------------- phase 6: Ali's notes ---------------------------- */
const pathCount = async (page) => (await doc(page)).objects.filter((o) => o.type === 'path').length;

scenarios.push({
  phase: 6, id: 'trace', name: 'تحويل صورة شفافة إلى شكل قابل للتعديل',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    await page.evaluate(() => {
      const c = document.createElement('canvas'); c.width = 300; c.height = 300;
      const g = c.getContext('2d'); g.fillStyle = '#b02020'; g.beginPath(); g.arc(150, 150, 100, 0, Math.PI * 2); g.fill();
      g.clearRect(120, 120, 60, 60); // a hole
      const { app } = window.midad;
      const o = { id: 'img1', type: 'image', name: 'دائرة.png', visible: true, locked: false, src: c.toDataURL(), w: 600, h: 600, m: [1, 0, 0, 1, 240, 240], opacity: 1 };
      app.add(o); app.select('img1'); app.commit('test'); app.render({ panels: true });
    });
    await openProps(page, vp);
    await clickBtn(page, 'تحويل إلى شكل');
    await page.waitForFunction(() => window.midad.app.doc.objects.some((o) => o.type === 'path'), null, { timeout: 8000 });
    await closeDrawer(page, vp);
    expect(await page.locator('.pvbar:visible').count() === 1, 'no preview bar before applying the trace');
    expect((await doc(page)).objects.some((o) => o.type === 'image'), 'image removed before applying');
    await shot('preview');
    await page.locator('.pvbar .pvok').click();
    expect(!(await doc(page)).objects.some((o) => o.type === 'image'), 'image still there after applying');
    const p = (await doc(page)).objects.find((o) => o.type === 'path');
    expect(p.live?.type === 'image', 'trace result should keep the image as a live copy');
    expect((p.d.match(/M/g) || []).length >= 2, 'the hole should be traced as a second contour');
    await closeDrawer(page, vp);
    await shot('traced');
  },
});

scenarios.push({
  phase: 6, id: 'textpath', name: 'الكتابة على دائرة مع بقاء النص حيًّا',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    const id = await addText(page, 'بسم الله الرحمن الرحيم', { size: 90, m: [1, 0, 0, 1, 250, 400] });
    await page.evaluate((i) => { window.midad.app.select(i); window.midad.app.render({ panels: true }); }, id);
    await openProps(page, vp);
    await clickBtn(page, 'دائرة');
    let o = (await doc(page)).objects[0];
    expect(o.onPath?.d, 'text not placed on a path');
    const w0 = await page.evaluate(() => window.midad.app.one && document.querySelector('#content path')?.getAttribute('d')?.length);
    await page.evaluate(() => { const a = window.midad.app; a.one.size = 120; a.commit('size'); a.render({ panels: true }); });
    o = (await doc(page)).objects[0];
    expect(o.type === 'text' && o.onPath && o.size === 120, 'text on path should stay live text');
    expect(w0 > 100, 'nothing drawn');
    await closeDrawer(page, vp);
    await shot('circle');
  },
});

scenarios.push({
  phase: 6, id: 'glyphs', name: 'إدراج حرف من الخط كشكل',
  async run({ page, expect, vp, shot }) {
    await fresh(page);
    await page.locator('.catbar button[title="نص"]:visible').first().click();
    const ok = await page.evaluate(async () => { const b = [...document.querySelectorAll('button')].find((x) => x.title?.startsWith('رمز') && x.offsetParent); if (b) { b.click(); return true; } return false; });
    expect(ok, 'glyph button not found in the text category');
    await page.waitForSelector('.glyphgrid .glyph', { timeout: 8000 });
    expect(await page.locator('.glyphgrid .glyph').count() >= 2, 'few letter forms');
    await shot('sheet');
    await page.locator('.glyphgrid .glyph').nth(1).click();
    await page.waitForTimeout(150);
    expect(await pathCount(page) === 1, 'glyph not inserted as a path');
  },
});

scenarios.push({
  phase: 6, id: 'madd', name: 'مداد: مدّ شكل أفقيًا وعموديًا',
  async run({ page, expect, shot }) {
    await fresh(page);
    const [a] = await addSquares(page);
    await page.evaluate((i) => { window.midad.app.select(i); window.midad.app.setTool('madd'); window.midad.app.settings.maddAxis = 'x'; }, a);
    const w = async () => page.evaluate(() => { const b = window.midad.app.one; const xs = b.d.match(/-?\d+(\.\d+)?/g).map(Number).filter((_, i) => i % 2 === 0); return Math.max(...xs) - Math.min(...xs); });
    const w0 = await w();
    const p0 = await screenOf(page, 450, 500), p1 = await screenOf(page, 600, 500);
    await drag(page, p0, p1);
    const w1 = await w();
    expect(w1 > w0 + 100, `horizontal madd failed ${w0} → ${w1}`);
    await shot('stretched');
  },
});

scenarios.push({
  phase: 6, id: 'bezier', name: 'المرسمة: رسم شكل مغلق بنقاط حادة ومنحنية',
  viewports: ['laptop'],
  async run({ page, expect, shot }) {
    await fresh(page);
    await page.evaluate(() => window.midad.app.setTool('bezier'));
    const pts = [[300, 300], [700, 300], [700, 700]];
    for (const [x, y] of pts) { const [sx, sy] = await screenOf(page, x, y); await page.mouse.click(sx, sy); await page.waitForTimeout(60); }
    const [qx, qy] = await screenOf(page, 300, 700);
    await drag(page, [qx, qy], [qx - 60, qy + 30]);
    const [fx, fy] = await screenOf(page, 300, 300);
    await page.mouse.click(fx, fy);
    await page.waitForTimeout(150);
    const p = (await doc(page)).objects.find((o) => o.type === 'path');
    expect(p && /z/i.test(p.d) && /c/i.test(p.d), 'closed curved path not created: ' + JSON.stringify((await doc(page)).objects.map((o) => o.d)) + ' tool=' + await page.evaluate(() => window.midad.app.tool));
    await shot('drawn');
  },
});

scenarios.push({
  phase: 6, id: 'chrome', name: 'القائمة الرئيسية والإعدادات والقائمة اليمنى وطبقة جديدة',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    await page.locator('.topbar .homebtn').click();
    if (vp === 'phone') {
      // the phone's home button opens the start screen
      await page.waitForSelector('.startscreen .stactions .btn');
      await shot('home');
      await page.locator('.startscreen .btn').filter({ hasText: 'إعدادات التطبيق' }).click();
    } else {
      await page.waitForSelector('.homepanel .hrow');
      expect(await page.locator('.homepanel .hrow').count() >= 10, 'home menu rows missing');
      await shot('home');
      await page.locator('.homepanel .hrow').filter({ hasText: 'الإعدادات' }).click();
    }
    await page.locator('.sheet select').nth(1).selectOption('light');
    expect(await page.evaluate(() => document.documentElement.dataset.theme) === 'light', 'theme did not switch');
    await page.locator('.sheet select').nth(1).selectOption('dark');
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.midad.closeStart());
    // layers +
    if (vp === 'phone') { await page.evaluate(() => window.midad.toggleDrawer('layers', true)); await page.waitForTimeout(350); }
    await page.locator('button[aria-label="طبقة نص جديدة"]:visible, button[title="طبقة نص جديدة"]:visible').first().click();
    await page.waitForTimeout(200);
    const d = await doc(page);
    expect(d.objects.length === 1 && d.objects[0].type === 'text', 'new text layer not added');
    if (vp === 'phone') { await page.evaluate(() => window.midad.toggleDrawer('props', true)); await page.waitForTimeout(350); }
    const tv = await page.locator('textarea.textedit:visible').first().inputValue();
    expect(tv === d.objects[0].text, `side text box shows "${tv}" instead of the text`);
    await page.locator('textarea.textedit:visible').first().fill('محمد');
    expect((await doc(page)).objects[0].text === 'محمد', 'typing in the side box did not change the text');
    if (vp === 'phone') await closeDrawer(page, vp);
    // right-click menu (laptop) / letters bar (both)
    if (vp === 'laptop') {
      const [sx, sy] = await screenOf(page, 540, 540);
      await page.mouse.click(sx, sy, { button: 'right' });
      await page.waitForSelector('.ctxmenu .cmi');
      expect(await page.locator('.ctxmenu .cmi').count() >= 5, 'context menu too small');
      await shot('context');
      await page.locator('.ctxmenu .cmi').filter({ hasText: 'تكرار' }).click();
      expect((await doc(page)).objects.length === 2, 'duplicate from context menu failed');
    }
    await page.evaluate(() => { const a = window.midad.app; a.select(a.doc.objects[0].id); a.setTool('letters'); });
    await page.waitForSelector('.lettersbar .lchip', { timeout: 5000 });
    expect((await doc(page)).objects.some((o) => o.type === 'letters'), 'text was not exploded automatically');
    await shot('lettersbar');
  },
});

scenarios.push({
  phase: 7, id: 'preview', name: 'معاينة قبل التطبيق، ومنزلقات لا تتحرك أثناء التمرير',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    const id = await addText(page, 'محمد', { size: 300, m: [1, 0, 0, 1, 250, 300] });
    await page.evaluate((i) => { window.midad.app.select(i); window.midad.app.render({ panels: true }); }, id);
    await openProps(page, vp);
    const before = JSON.stringify((await doc(page)).objects[0].style);
    await page.locator('.side .preset:visible').nth(1).click();
    expect(await page.locator('.pvbar:visible').count() === 1, 'no preview bar after a preset');
    expect(JSON.stringify((await doc(page)).objects[0].style) !== before, 'preset not shown live');
    await shot('preset-preview');
    await page.locator('.pvbar .pvno').click();
    expect(JSON.stringify((await doc(page)).objects[0].style) === before, 'cancel did not restore the style');
    await page.locator('.side .preset:visible').nth(1).click();
    await page.locator('.pvbar .pvok').click();
    expect(JSON.stringify((await doc(page)).objects[0].style) !== before, 'apply lost the preset');
    expect(await page.locator('.pvbar:visible').count() === 0, 'bar stays after apply');
    if (vp === 'phone') {
      // a vertical finger swipe over a slider must not change it
      const r = page.locator('.side .rangewrap:visible').first();
      await r.scrollIntoViewIfNeeded();
      const inp = r.locator('input');
      const v0 = await inp.inputValue();
      const b = await r.boundingBox();
      const cdp = await page.context().newCDPSession(page);
      const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
      const x = b.x + b.width / 2, y = b.y + b.height / 2;
      await touch('touchStart', x, y); for (let k = 1; k <= 6; k++) await touch('touchMove', x + k, y - k * 12); await touch('touchEnd');
      await page.waitForTimeout(100);
      expect(await inp.inputValue() === v0, 'slider changed during a vertical swipe');
      // the swipe scrolled the panel: find the slider again
      await r.scrollIntoViewIfNeeded();
      const b2 = await r.boundingBox();
      const [x2, y2] = [b2.x + b2.width / 2, b2.y + b2.height / 2];
      await touch('touchStart', x2, y2); for (let k = 1; k <= 8; k++) await touch('touchMove', x2 - k * 10, y2); await touch('touchEnd');
      await page.waitForTimeout(100);
      const v1 = await inp.inputValue();
      await touch('touchStart', x2, y2); for (let k = 1; k <= 8; k++) await touch('touchMove', x2 + k * 10, y2); await touch('touchEnd');
      await page.waitForTimeout(100);
      const v2 = await inp.inputValue();
      expect(v1 !== v0 || v2 !== v1, `slider did not move on a sideways drag (${v0} ${v1} ${v2} min=${await inp.getAttribute('min')} max=${await inp.getAttribute('max')})`);
    }
    await closeDrawer(page, vp);
    await shot('compact');
  },
});

scenarios.push({
  phase: 7, id: 'library', name: 'مكتبتي: حفظ وحذف الأنماط والملصقات والصور',
  async run({ page, vp, expect, shot }) {
    await fresh(page);
    const id = await addText(page, 'خط', { size: 300, m: [1, 0, 0, 1, 300, 300] });
    await page.evaluate((i) => { window.midad.app.select(i); window.midad.app.render({ panels: true }); }, id);
    await openProps(page, vp);
    // save the current style, then delete it
    await page.locator('.side .preset.add:visible').click();
    await page.waitForSelector('.side .preset.mine');
    expect(await page.locator('.side .preset.mine').count() === 1, 'style not saved');
    await page.locator('.side .preset.mine .libdel').click();
    await page.waitForTimeout(150);
    expect(await page.locator('.side .preset.mine').count() === 0, 'style not deleted');
    await closeDrawer(page, vp);
    // stickers
    await page.locator('.catbar button[title="الرئيسية"]:visible').first().click();
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.title?.startsWith('مكتبتي') && b.offsetParent).click());
    await page.waitForSelector('.libtabs');
    await page.locator('.sheet button').filter({ hasText: 'حفظ المحدد كملصق' }).click();
    await page.waitForSelector('.libgrid .libcard');
    await shot('stickers');
    await page.locator('.libgrid .libthumb').first().click();
    await page.waitForTimeout(200);
    expect(await page.locator('.pvbar:visible').count() === 1, 'sticker insert has no preview');
    await page.locator('.pvbar .pvok').click();
    expect((await doc(page)).objects.length === 2, 'sticker not inserted');
    // images: add one from a file, then delete it
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.title?.startsWith('مكتبتي') && b.offsetParent).click());
    await page.locator('.libtabs .chip').filter({ hasText: 'الصور' }).click();
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.sheet button').filter({ hasText: 'إضافة صور' }).click()]);
    await fc.setFiles({ name: 'نقطة.png', mimeType: 'image/png', buffer: png });
    await page.waitForSelector('.libgrid .libcard');
    await page.locator('.libgrid .libdel').first().click();
    await page.waitForTimeout(200);
    expect(await page.locator('.libgrid .libcard').count() === 0, 'image not deleted');
    // the sticker is still in the library after a reload
    await page.reload();
    await page.waitForFunction(() => window.midad?.booted);
    await page.evaluate(() => window.midad.closeStart());
    await page.waitForTimeout(400);
    await page.locator('.catbar button[title="الرئيسية"]:visible').first().click();
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.title?.startsWith('مكتبتي') && b.offsetParent).click());
    await page.waitForSelector('.libgrid .libcard');
    await page.locator('.libgrid .libdel').first().click();
    await page.waitForTimeout(200);
    expect(await page.locator('.libgrid .libcard').count() === 0, 'sticker not deleted');
  },
});

/* ------------------------------ spec v2 (كلمة) ------------------------------ */
const V2 = ['phone', 'tablet', 'laptop'];
scenarios.push({
  phase: 8, id: 'v2shell', name: 'كلمة: الشاشة الأم والواجهة المناسبة لكل جهاز', viewports: V2, keepStart: true,
  async run({ page, vp, expect, shot }) {
    await page.waitForSelector('.startscreen .stactions .btn');
    expect(await page.locator('.startscreen .stactions .btn').count() === 3, 'start screen actions');
    expect((await page.title()).includes('كلمة'), 'title must say كلمة');
    await shot('start');
    await page.locator('.stcontinue').click();
    expect(!(await page.locator('.startscreen').count()), 'start screen did not close');
    const mode = await page.evaluate(() => ['mobile', 'tablet', 'laptop'].find((k) => document.body.classList.contains(k)));
    expect(mode === { phone: 'mobile', tablet: 'tablet', laptop: 'laptop' }[vp], `wrong interface ${mode}`);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(over <= 0, `horizontal overflow ${over}px`);
    const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase());
    expect(accent === '#E6B422', 'accent colour ' + accent);
    if (vp === 'phone') {
      // bottom to top: tabs, layers strip, tools
      const y = async (sel) => (await page.locator(sel).boundingBox()).y;
      expect(await y('.bottombar .catbar') > await y('.layerstrip') && await y('.layerstrip') > await y('.toolrow'), 'phone bars out of order');
      expect(await page.locator('.bottombar .catbar .btn').count() === 7, 'seven tabs');
    } else {
      expect(await page.locator('.side').isVisible(), 'side panel hidden');
    }
    await shot('main');
  },
});

scenarios.push({
  phase: 8, id: 'v2strip', name: 'كلمة: شريط الطبقات في الجوال (تحديد، قائمة ⋮، ترتيب بالسحب)', viewports: ['phone'],
  async run({ page, expect, shot }) {
    await fresh(page);
    const a = await addText(page, 'أ'); const b = await addText(page, 'ب');
    await page.waitForTimeout(150);
    expect(await page.locator('.layerstrip .lscard').count() === 2, 'strip cards');
    await page.locator(`.lscard[data-id="${a}"] .lsthumb`).tap();
    expect((await page.evaluate(() => window.midad.app.selection))[0] === a, 'tap did not select');
    await page.locator(`.lscard[data-id="${a}"] .lsmore`).tap();
    await page.locator('.popmenu .cmi').filter({ hasText: 'تكرار' }).tap();
    expect((await doc(page)).objects.length === 3, 'duplicate from ⋮ failed');
    await page.locator(`.lscard[data-id="${b}"] .lsmore`).tap();
    await page.locator('.popmenu .cmi').filter({ hasText: 'إخفاء' }).tap();
    expect((await doc(page)).objects.find((o) => o.id === b).visible === false, 'hide failed');
    // long press then drag the top card onto the last one
    await page.waitForTimeout(200);
    const cards = page.locator('.layerstrip .lscard');
    const first = await cards.first().boundingBox(), last = await cards.last().boundingBox();
    const before = (await doc(page)).objects.map((o) => o.id).join();
    const cdp = await page.context().newCDPSession(page);
    const pt = (x, y) => [{ x, y, id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(first.x + 33, first.y + 40) });
    await page.waitForTimeout(500);
    for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(first.x + 33 + (last.x - first.x) * i / 8, first.y + 40) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(200);
    expect((await doc(page)).objects.map((o) => o.id).join() !== before, 'drag did not reorder layers');
    await shot('strip');
  },
});

scenarios.push({
  phase: 8, id: 'v2iso', name: 'كلمة: صفحة العزل بـ ✓ و✕ وزر الرجوع', viewports: ['phone'],
  async run({ page, expect, shot }) {
    await fresh(page);
    const a = await addText(page, 'كلمة');
    await addText(page, 'خلفية', { m: [1, 0, 0, 1, 200, 700] });
    await page.evaluate((id) => window.midad.app.select(id), a);
    const undo0 = await page.evaluate(() => window.midad.app.undoStack.length);
    const enter = async () => {
      await page.locator('.catbar button[title="مظهر"]:visible').first().tap();
      await page.locator('.toolrow .btn').filter({ hasText: 'الألوان والتعبئة' }).first().tap();
      await page.waitForSelector('body.isolate .isotop .isook');
    };
    await enter();
    expect(!(await page.locator('.bottombar').isVisible()), 'bottom bars still shown in isolation');
    const nsec = await page.locator('#props .psec:visible').count();
    expect(nsec >= 1 && nsec <= 2, `isolation should show only the tool's settings (${nsec} sections shown)`);
    const ghost = await page.evaluate(() => [...document.querySelectorAll('#content > [data-id]')].map((e) => e.style.opacity));
    expect(ghost.includes('0.3'), 'rest of the design not ghosted');
    const recolor = () => page.evaluate((id) => { const { app } = window.midad; app.doc.objects.find((o) => o.id === id).style.fills[0].color = '#ff0000'; app.commit('لون'); app.render({ panels: true }); }, a);
    await recolor();
    await shot('isolated');
    // ✕ asks first, then discards
    await page.locator('.isono').tap();
    await page.waitForSelector('.sheet .confirm');
    await page.locator('.sheet .btn').filter({ hasText: 'تجاهل' }).tap();
    await page.waitForTimeout(200);
    expect(!(await page.evaluate(() => document.body.classList.contains('isolate'))), 'still isolated after ✕');
    expect((await doc(page)).objects.find((o) => o.id === a).style.fills[0].color === '#1b1b1b', '✕ kept the change');
    // ✓ keeps it as one history step
    await enter();
    await recolor();
    await page.evaluate((id) => { const { app } = window.midad; app.doc.objects.find((o) => o.id === id).style.opacity = 0.5; app.commit('شفافية'); }, a);
    await page.locator('.isook').tap();
    await page.waitForTimeout(200);
    const d = await doc(page);
    expect(d.objects.find((o) => o.id === a).style.fills[0].color === '#ff0000', '✓ lost the change');
    expect(await page.evaluate(() => window.midad.app.undoStack.length) === undo0 + 1, 'isolation should be one undo step');
    // Android back = ✕
    await enter();
    await page.evaluate((id) => { const { app } = window.midad; app.doc.objects.find((o) => o.id === id).style.fills[0].color = '#00ff00'; app.commit('لون'); }, a);
    await page.goBack();
    await page.waitForSelector('.sheet .confirm');
    await page.locator('.sheet .btn').filter({ hasText: 'تجاهل' }).tap();
    await page.waitForTimeout(250);
    expect(!(await page.evaluate(() => document.body.classList.contains('isolate'))), 'back did not leave isolation');
  },
});
