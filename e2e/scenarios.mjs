// Browser scenarios per phase. Each run gets {page, vp, shot, expect, ctx}.
import fs from 'node:fs';

export const tool = (page, id) => page.locator(`button[data-tool="${id}"]:visible`).first().click();
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
      await page.locator('button[aria-label="تراجع"]').click();
      d = await doc(page);
      expect(d.objects[0].fontId === 'amiri', 'undo failed');
      await page.locator('button[aria-label="إعادة"]').click();
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
      await page.locator('.topbar button', { hasText: 'تصدير' }).click();
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
      await page.locator('.topbar button[aria-label="الملف"]').click();
      f = await download(page, () => page.locator('.sheet button', { hasText: 'حفظ ملف المشروع' }).click());
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
    const sh = page.locator('#overlay [data-handle="stretchL"]');
    const b = await sh.boundingBox();
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
    await page.locator('button[aria-label="تراجع"]').click();
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
    await page.locator('button[aria-label="تراجع"]').click();
    await page.evaluate(() => { const { app } = window.midad; app.select(app.doc.objects.map((o) => o.id)); });
    await clickBtn(page, 'تقسيم');
    d = await doc(page);
    expect(d.objects.length === 3, 'divide expected 3 got ' + d.objects.length);
    await page.locator('button[aria-label="تراجع"]').click();
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
