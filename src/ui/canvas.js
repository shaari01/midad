// The drawing stage: SVG renderer, pan/zoom (mouse, wheel, pinch), rulers,
// guides, grid, reference image, and pointer dispatch to the active tool.
import { renderObject } from '../core/render.js';
import { worldBounds, unionBounds } from '../core/geometry.js';

const NS = 'http://www.w3.org/2000/svg';
const RULER = 22;

export class Canvas {
  constructor(app, host, tools) {
    this.app = app;
    this.tools = tools;
    this.host = host;
    this.z = 0.5; this.tx = 0; this.ty = 0;
    this.pointers = new Map();
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.id = 'canvas';
    this.svg.setAttribute('tabindex', '0');
    this.svg.innerHTML = `
      <defs>
        <pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><rect width="8" height="8" fill="#e9e6e1"/><rect x="8" y="8" width="8" height="8" fill="#e9e6e1"/></pattern>
        <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="2" stdDeviation="6" flood-opacity=".25"/></filter>
      </defs>
      <g id="viewport">
        <rect id="board" filter="url(#boardShadow)"/>
        <rect id="boardbg"/>
        <g id="refimg"></g>
        <g id="gridlayer"></g>
        <g id="content"></g>
        <g id="guides"></g>
      </g>
      <g id="overlay"></g>
      <g id="rulers"></g>`;
    host.append(this.svg);
    this.vp = this.svg.querySelector('#viewport');
    this.content = this.svg.querySelector('#content');
    this.overlay = this.svg.querySelector('#overlay');
    this.rulersG = this.svg.querySelector('#rulers');
    this.guidesG = this.svg.querySelector('#guides');
    this.gridG = this.svg.querySelector('#gridlayer');
    this.refG = this.svg.querySelector('#refimg');
    this.bind();
    this.raf = 0;
    app.on('render', () => this.schedule());
    app.on('project', () => requestAnimationFrame(() => this.fit()));
    new ResizeObserver(() => { this.schedule(); }).observe(host);
  }

  get tool() { return this.tools[this.app.tool] || this.tools.select; }

  schedule() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); });
  }

  toDoc(sx, sy) { return [(sx - this.tx) / this.z, (sy - this.ty) / this.z]; }
  toScreen(x, y) { return [x * this.z + this.tx, y * this.z + this.ty]; }

  fit() {
    const r = this.host.getBoundingClientRect();
    const { width: W, height: H } = this.app.doc;
    const pad = 40;
    this.z = Math.min((r.width - pad * 2) / W, (r.height - pad * 2) / H) || 0.5;
    this.tx = (r.width - W * this.z) / 2;
    this.ty = (r.height - H * this.z) / 2;
    this.draw();
  }

  zoomAt(factor, sx, sy) {
    const nz = Math.min(64, Math.max(0.02, this.z * factor));
    const k = nz / this.z;
    this.tx = sx - (sx - this.tx) * k;
    this.ty = sy - (sy - this.ty) * k;
    this.z = nz;
    this.draw();
    this.app.emit('zoom', this.z);
  }

  draw() {
    const { doc } = this.app;
    this.vp.setAttribute('transform', `matrix(${this.z} 0 0 ${this.z} ${this.tx} ${this.ty})`);
    for (const id of ['board', 'boardbg']) {
      const r = this.svg.querySelector('#' + id);
      r.setAttribute('width', doc.width); r.setAttribute('height', doc.height);
    }
    this.svg.querySelector('#board').setAttribute('fill', 'url(#checker)');
    this.svg.querySelector('#boardbg').setAttribute('fill', doc.background || 'none');
    // reference image (never exported)
    const ref = doc.reference;
    this.refG.innerHTML = ref && ref.visible !== false
      ? `<image href="${ref.src}" x="${ref.x || 0}" y="${ref.y || 0}" width="${ref.w}" height="${ref.h}" opacity="${ref.opacity ?? 0.35}" preserveAspectRatio="none" style="pointer-events:none"/>` : '';
    // content
    const hidden = this.tool.hiddenIds?.(this.app) || null;
    this.content.innerHTML = doc.objects.map((o) => (hidden?.has(o.id) ? '' : renderObject(o))).join('');
    this.drawGrid();
    this.drawGuides();
    this.drawOverlay();
    this.drawRulers();
  }

  drawGrid() {
    const s = this.app.settings;
    if (!s.grid) { this.gridG.innerHTML = ''; return; }
    const g = s.gridSize;
    const { width: W, height: H } = this.app.doc;
    const sw = 1 / this.z;
    this.gridG.innerHTML = `<defs><pattern id="gridp" width="${g}" height="${g}" patternUnits="userSpaceOnUse"><path d="M${g},0 V${g} H0" fill="none" stroke="#3b82f6" stroke-opacity=".28" stroke-width="${sw}"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#gridp)" style="pointer-events:none"/>`;
  }

  drawGuides() {
    const sw = 1 / this.z;
    const big = 1e5;
    this.guidesG.innerHTML = (this.app.doc.guides || []).map((g, i) => (g.axis === 'x'
      ? `<line x1="${g.pos}" y1="${-big}" x2="${g.pos}" y2="${big}" stroke="#e0368a" stroke-width="${sw}"/><line data-guide="${i}" x1="${g.pos}" y1="${-big}" x2="${g.pos}" y2="${big}" stroke="transparent" stroke-width="${sw * 16}"/>`
      : `<line x1="${-big}" y1="${g.pos}" x2="${big}" y2="${g.pos}" stroke="#e0368a" stroke-width="${sw}"/><line data-guide="${i}" x1="${-big}" y1="${g.pos}" x2="${big}" y2="${g.pos}" stroke="transparent" stroke-width="${sw * 16}"/>`)).join('');
  }

  drawOverlay() {
    const t = this.tool;
    this.overlay.innerHTML = t.overlay ? t.overlay(this) || '' : '';
  }

  drawRulers() {
    if (!this.app.settings.rulers) { this.rulersG.innerHTML = ''; return; }
    const r = this.host.getBoundingClientRect();
    const W = r.width, H = r.height;
    // tick step in doc units so that ticks are ≥ 60px apart
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
    const step = steps.find((s) => s * this.z >= 60) || 10000;
    let out = `<rect x="0" y="0" width="${W}" height="${RULER}" class="ruler" data-ruler="y"/><rect x="${W - RULER}" y="0" width="${RULER}" height="${H}" class="ruler" data-ruler="x"/>`;
    const [x0] = this.toDoc(0, 0); const [x1] = this.toDoc(W, 0);
    for (let v = Math.floor(x0 / step) * step; v <= x1; v += step) {
      const [sx] = this.toScreen(v, 0);
      out += `<line x1="${sx}" y1="${RULER - 8}" x2="${sx}" y2="${RULER}" class="tick"/><text x="${sx + 3}" y="12" class="rtext">${v}</text>`;
      for (let k = 1; k < 5; k++) { const mx = sx + (step * this.z * k) / 5; out += `<line x1="${mx}" y1="${RULER - 4}" x2="${mx}" y2="${RULER}" class="tick"/>`; }
    }
    const [, y0] = this.toDoc(0, 0); const [, y1] = this.toDoc(0, H);
    for (let v = Math.floor(y0 / step) * step; v <= y1; v += step) {
      const [, sy] = this.toScreen(0, v);
      out += `<line x1="${W - RULER}" y1="${sy}" x2="${W - RULER + 8}" y2="${sy}" class="tick"/><text x="${W - 4}" y="${sy + 3}" class="rtext" text-anchor="end" transform="rotate(-90 ${W - 11} ${sy})">${v}</text>`;
    }
    out += `<rect x="${W - RULER}" y="0" width="${RULER}" height="${RULER}" class="ruler corner"/>`;
    this.rulersG.innerHTML = out;
  }

  /** Top-most object under a doc point (paint hit first, then bbox). */
  hitObject(e, x, y) {
    const el = e?.target?.closest?.('#content [data-id]');
    if (el) {
      // climb to top-level object
      let top = el;
      while (top.parentElement && top.parentElement.id !== 'content') top = top.parentElement.closest('[data-id]') || top.parentElement;
      const id = top.getAttribute('data-id');
      const o = this.app.doc.objects.find((q) => q.id === id);
      if (o && !o.locked) return o;
    }
    const tol = 6 / this.z;
    const objs = this.app.doc.objects;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      if (o.visible === false || o.locked) continue;
      const b = worldBounds(o);
      if (x >= b.x - tol && x <= b.x + b.w + tol && y >= b.y - tol && y <= b.y + b.h + tol) return o;
    }
    return null;
  }

  selectionBounds() {
    return unionBounds(this.app.selected.map(worldBounds));
  }

  /** Snap a moving bbox to guides, artboard and grid. Returns [dx,dy] correction + lines. */
  snapBox(b) {
    const s = this.app.settings;
    if (!s.snap) return { dx: 0, dy: 0, lines: [] };
    const { width: W, height: H } = this.app.doc;
    const th = 8 / this.z;
    const xs = [0, W / 2, W, ...(this.app.doc.guides || []).filter((g) => g.axis === 'x').map((g) => g.pos)];
    const ys = [0, H / 2, H, ...(this.app.doc.guides || []).filter((g) => g.axis === 'y').map((g) => g.pos)];
    const bx = [b.x, b.x + b.w / 2, b.x + b.w];
    const by = [b.y, b.y + b.h / 2, b.y + b.h];
    let best = { dx: 0, dy: 0, lx: null, ly: null };
    let mx = th, my = th;
    for (const c of xs) for (const v of bx) if (Math.abs(c - v) < mx) { mx = Math.abs(c - v); best.dx = c - v; best.lx = c; }
    for (const c of ys) for (const v of by) if (Math.abs(c - v) < my) { my = Math.abs(c - v); best.dy = c - v; best.ly = c; }
    if (s.grid) {
      const g = s.gridSize;
      if (best.lx == null) best.dx = Math.round(b.x / g) * g - b.x;
      if (best.ly == null) best.dy = Math.round(b.y / g) * g - b.y;
    }
    const lines = [];
    if (best.lx != null) lines.push({ axis: 'x', pos: best.lx });
    if (best.ly != null) lines.push({ axis: 'y', pos: best.ly });
    return { dx: best.dx, dy: best.dy, lines };
  }

  ev(e) {
    const r = this.svg.getBoundingClientRect();
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    const [x, y] = this.toDoc(sx, sy);
    return { x, y, sx, sy, e, target: e.target, shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey || e.metaKey, pressure: e.pressure, pointerType: e.pointerType, button: e.button };
  }

  bind() {
    const svg = this.svg;
    svg.addEventListener('contextmenu', (e) => e.preventDefault());
    svg.addEventListener('pointerdown', (e) => {
      svg.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 2) {
        this.tool.cancel?.(this);
        this.gesture = this.startPinch();
        return;
      }
      if (this.pointers.size > 2) return;
      const ev = this.ev(e);
      // rulers → new guide
      const ruler = e.target.closest?.('[data-ruler]');
      if (ruler && !ruler.classList.contains('corner')) {
        const axis = ruler.getAttribute('data-ruler');
        this.app.doc.guides.push({ axis, pos: axis === 'x' ? ev.x : ev.y });
        this.drag = { kind: 'guide', index: this.app.doc.guides.length - 1 };
        return;
      }
      const guide = e.target.closest?.('[data-guide]');
      if (guide && (this.app.tool === 'select' || this.app.tool === 'pan')) {
        this.drag = { kind: 'guide', index: +guide.getAttribute('data-guide') };
        return;
      }
      // middle mouse / space / pan tool → pan
      if (e.button === 1 || this.spaceDown || this.app.tool === 'pan') {
        this.drag = { kind: 'pan', sx: ev.sx, sy: ev.sy, tx: this.tx, ty: this.ty };
        return;
      }
      this.drag = { kind: 'tool' };
      this.tool.down?.(ev, this);
    });
    svg.addEventListener('pointermove', (e) => {
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.gesture) { this.gesture.move(); return; }
      const ev = this.ev(e);
      if (!this.drag) { this.tool.hover?.(ev, this); return; }
      if (this.drag.kind === 'pan') {
        this.tx = this.drag.tx + ev.sx - this.drag.sx;
        this.ty = this.drag.ty + ev.sy - this.drag.sy;
        this.draw();
      } else if (this.drag.kind === 'guide') {
        const g = this.app.doc.guides[this.drag.index];
        if (g) { g.pos = g.axis === 'x' ? ev.x : ev.y; this.drawGuides(); }
        this.drag.lastScreen = ev;
      } else if (this.drag.kind === 'tool') {
        const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        if (evs.length > 1 && this.tool.wantsCoalesced) for (const ce of evs) this.tool.move?.(this.ev(ce), this);
        else this.tool.move?.(ev, this);
      }
    });
    const up = (e) => {
      this.pointers.delete(e.pointerId);
      if (this.gesture) { if (this.pointers.size === 0) this.gesture = null; return; }
      const d = this.drag;
      this.drag = null;
      if (!d) return;
      const ev = this.ev(e);
      if (d.kind === 'guide') {
        const g = this.app.doc.guides[d.index];
        const r = this.host.getBoundingClientRect();
        // dropped back on the ruler → delete
        if (g && ((g.axis === 'y' && ev.sy < RULER) || (g.axis === 'x' && ev.sx > r.width - RULER))) this.app.doc.guides.splice(d.index, 1);
        this.app.commit('دليل');
        this.draw();
      } else if (d.kind === 'tool') this.tool.up?.(ev, this);
    };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', (e) => { this.pointers.delete(e.pointerId); this.tool.cancel?.(this); this.drag = null; if (!this.pointers.size) this.gesture = null; });
    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      // Touchpad pinch arrives as ctrl+wheel; a classic mouse wheel sends
      // large integer steps with no horizontal part → zoom. Touchpad
      // two-finger scroll (small/fractional deltas) → pan.
      const mouseWheel = e.deltaMode === 1 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY));
      if (e.ctrlKey || e.metaKey || (mouseWheel && !e.shiftKey)) {
        this.zoomAt(Math.exp(-e.deltaY * (e.ctrlKey && !mouseWheel ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
      } else {
        this.tx -= e.shiftKey ? e.deltaY : e.deltaX; this.ty -= e.shiftKey ? 0 : e.deltaY; this.draw();
      }
    }, { passive: false });
    svg.addEventListener('dblclick', (e) => { const ev = this.ev(e); this.tool.dbl?.(ev, this); });
    window.addEventListener('keydown', (e) => { if (e.code === 'Space' && !isTyping(e)) { this.spaceDown = true; } });
    window.addEventListener('keyup', (e) => { if (e.code === 'Space') this.spaceDown = false; });
  }

  startPinch() {
    const pts = () => [...this.pointers.values()];
    const r = this.svg.getBoundingClientRect();
    const [a, b] = pts();
    const d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const c0 = [(a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top];
    const z0 = this.z, tx0 = this.tx, ty0 = this.ty;
    this.drag = null;
    return {
      move: () => {
        const [p, q] = pts();
        if (!q) return;
        const d = Math.hypot(p.x - q.x, p.y - q.y) || 1;
        const c = [(p.x + q.x) / 2 - r.left, (p.y + q.y) / 2 - r.top];
        const nz = Math.min(64, Math.max(0.02, (z0 * d) / d0));
        // keep the doc point under the initial centre under the current centre
        const docX = (c0[0] - tx0) / z0, docY = (c0[1] - ty0) / z0;
        this.z = nz; this.tx = c[0] - docX * nz; this.ty = c[1] - docY * nz;
        this.draw();
        this.app.emit('zoom', this.z);
      },
    };
  }
}

export const isTyping = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable;
