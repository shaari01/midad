// Browser tests: builds are served by `vite preview`, then each scenario runs
// in Chromium at laptop and Samsung-phone sizes. Screenshots → e2e/out/.
// Usage: node e2e/run.mjs [phaseNumber ...]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = createRequire(execSync('npm root -g').toString().trim() + '/')('playwright'); }
const { chromium, devices } = pw;

const PORT = 4179;
const URL = `http://localhost:${PORT}/`;
fs.mkdirSync('e2e/out', { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'pipe', detached: true });
const stopServer = () => { try { process.kill(-server.pid, 'SIGTERM'); } catch { /* gone */ } };
process.on('exit', stopServer);
await new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error('preview did not start')), 30000);
  server.stdout.on('data', (d) => { if (String(d).includes('localhost')) { clearTimeout(t); res(); } });
  server.stderr.on('data', (d) => process.stderr.write(d));
});

const only = process.argv.slice(2).map(Number);
const { scenarios } = await import('./scenarios.mjs');
const browser = await chromium.launch();
let failed = 0;
const results = [];

for (const sc of scenarios) {
  if (only.length && !only.includes(sc.phase)) continue;
  for (const vp of sc.viewports || ['laptop', 'phone']) {
    // spec v2 sizes: phone 360×800, tablet 800×1280, laptop 1366×768
    const VPS = {
      phone: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 800 }, screen: { width: 360, height: 800 }, deviceScaleFactor: 3 },
      tablet: { ...devices['Galaxy Tab S4'], viewport: { width: 800, height: 1280 }, screen: { width: 800, height: 1280 }, deviceScaleFactor: 2 },
      laptop: { viewport: { width: 1366, height: 768 } },
    };
    const ctxOpts = { ...VPS[vp], locale: 'ar', acceptDownloads: true };
    const ctx = await browser.newContext(ctxOpts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const name = `${sc.name} [${vp}]`;
    try {
      await page.goto(URL);
      await page.waitForFunction(() => window.midad?.booted && document.querySelector('#content'), null, { timeout: 20000 });
      await page.waitForTimeout(300);
      if (!sc.keepStart) await page.evaluate(() => window.midad.closeStart?.());
      const shot = async (label) => page.screenshot({ path: `e2e/out/p${sc.phase}-${sc.id}-${vp}-${label}.png` });
      await sc.run({ page, vp, shot, expect: assert, ctx });
      if (errors.length) throw new Error('console errors:\n' + errors.join('\n'));
      results.push(`PASS ${name}`);
    } catch (e) {
      failed++;
      results.push(`FAIL ${name}: ${e.message}`);
      await page.screenshot({ path: `e2e/out/FAIL-p${sc.phase}-${sc.id}-${vp}.png` }).catch(() => {});
    }
    await ctx.close();
  }
}

await browser.close();
stopServer();
console.log(results.join('\n'));
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
