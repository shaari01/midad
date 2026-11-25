// Generates the app icons (SVG + PNG) from the Amiri glyphs of «مداد».
import fs from 'node:fs';
import * as hb from 'harfbuzzjs';
import { layoutText, layoutToD } from '../src/core/shaper.js';
import { makeHandle } from '../src/core/fonts.js';
import { parsePath, cmdsBBox } from '../src/core/svgpath.js';

const fh = makeHandle('amiri', new Uint8Array(fs.readFileSync('public/fonts/Amiri-Regular.ttf')).buffer);
const lay = layoutText(fh, 'مداد', { size: 300, kashida: { 0: 0.5 } });
const d = layoutToD(fh, lay);
const bb = cmdsBBox(parsePath(d));
function svg(maskable) {
  const S = 512, pad = maskable ? 120 : 70;
  const k = Math.min((S - pad * 2) / bb.w, (S - pad * 2) / bb.h);
  const tx = (S - bb.w * k) / 2 - bb.x * k, ty = (S - bb.h * k) / 2 - bb.y * k + 10;
  const r = maskable ? 0 : 110;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2d27a"/><stop offset="1" stop-color="#b8860b"/></linearGradient></defs>
<rect width="512" height="512" rx="${r}" fill="#1c1a17"/>
<g transform="matrix(${k} 0 0 ${k} ${tx} ${ty})"><path d="${d}" fill="url(#g)"/></g>
</svg>`;
}
fs.mkdirSync('public/icons', { recursive: true });
fs.writeFileSync('public/icons/icon.svg', svg(false));
fs.writeFileSync('public/icons/icon-maskable.svg', svg(true));
const { createRequire } = await import('node:module');
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await b.newPage();
for (const [src, out, size] of [['icon.svg', 'icon-192.png', 192], ['icon.svg', 'icon-512.png', 512], ['icon-maskable.svg', 'icon-maskable-512.png', 512]]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<style>body{margin:0;background:transparent}</style><img src="data:image/svg+xml;base64,${Buffer.from(fs.readFileSync('public/icons/' + src)).toString('base64')}" width="${size}" height="${size}">`);
  await p.screenshot({ path: 'public/icons/' + out, omitBackground: true });
}
await b.close();
console.log('icons done');
