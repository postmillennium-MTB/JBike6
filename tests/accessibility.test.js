'use strict';
// Accessibility rules for the whole app. These fail if text drops below 12 px, a text color stops
// meeting 4.5:1 contrast, touch targets shrink on phones, or either data chart relies on color alone.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRecorder } = require('./helpers/recording-canvas.js');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const css = read('instrument-ui.css') + '\n' + read('components.css');
const scripts = fs.readdirSync(root).filter(f => f.endsWith('.js'));
const sources = { 'index.html': html, 'instrument-ui.css + components.css': css };
for (const f of scripts) sources[f] = read(f);

// ---- 1. Text floor: nothing below 12 px, in CSS, inline styles or canvas text ---------------------------------
const FLOOR_PX = 12;
function smallSizes(text) {
  const found = [];
  const px = (v, unit) => (unit === 'rem' ? v * 16 : unit === 'px' ? v : null);
  for (const m of text.matchAll(/font-size\s*:\s*([\d.]+)(rem|px|em)(?![\w-])/g)) {
    const v = px(parseFloat(m[1]), m[2]);
    if (v !== null && v < FLOOR_PX) found.push(m[0]);
    if (m[2] === 'em' && parseFloat(m[1]) < 0.75) found.push(m[0]);
  }
  for (const m of text.matchAll(/font\s*:\s*(?:[\w-]+\s+)*?([\d.]+)(rem|px|em)(?=(?:\/[\d.]+\w*)?\s)/g)) {
    const v = px(parseFloat(m[1]), m[2]);
    if (v !== null && v < FLOOR_PX) found.push(m[0].trim());
  }
  for (const m of text.matchAll(/font\s*=\s*['"`][^'"`]*?(\d+(?:\.\d+)?)px/g)) {
    if (parseFloat(m[1]) < FLOOR_PX) found.push(m[0]);
  }
  return found;
}
for (const [name, text] of Object.entries(sources)) {
  test('no text below 12 px in ' + name, () => {
    const small = smallSizes(text);
    assert.deepEqual(small, [], 'declarations below ' + FLOOR_PX + ' px: ' + small.slice(0, 6).join(' | '));
  });
}

test('subscripts and superscripts keep the 12 px floor', () => {
  assert.match(css, /sub,\s*sup\s*\{[^}]*font-size:\s*max\(12px/);
});

// ---- 2. Contrast of text colors ---------------------------------------------------------------------------------
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const token = name => { const m = css.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})')); assert.ok(m, '--' + name + ' not found'); return m[1]; };
const backgrounds = ['paper', 'panel', 'well'].map(n => [n, token(n)]);
for (const name of ['ink', 'ink-soft', 'muted', 'select', 'stable-text', 'signal-text', 'ochre-text']) {
  test('text color --' + name + ' has at least 4.5:1 contrast on paper, panel and well', () => {
    for (const [bgName, bg] of backgrounds) {
      const ratio = contrast(token(name), bg);
      assert.ok(ratio >= 4.5, '--' + name + ' on ' + bgName + ' is ' + ratio.toFixed(2) + ':1');
    }
  });
}
test('canvas text uses the same text-safe shades as the stylesheet', () => {
  const map = html.match(/const TEXT_SAFE = \{([^}]*)\}/)[1];
  assert.ok(map.includes(token('stable-text')) && map.includes(token('signal-text')) && map.includes(token('ochre-text')), map);
});

// ---- 3. Touch targets on phones and touch screens ---------------------------------------------------------------
test('phones and touch screens get 44 px controls with room between them', () => {
  // The touch rules are split between instrument-ui.css and components.css, so join every block with this query.
  const QUERY = '@media (max-width: 700px), (pointer: coarse)';
  let block = '', i = -1;
  while ((i = css.indexOf(QUERY, i + 1)) >= 0) block += css.slice(i, css.indexOf('\n}\n', i)) + '\n';
  assert.ok(block, 'touch media query missing');
  assert.match(block, /min-height:\s*44px\s*!important/);
  assert.match(block, /min-width:\s*44px\s*!important/);
  for (const sel of ['button', 'select', '.seg-btn', '.wheel-pill', 'input[type="number"]']) assert.ok(block.includes(sel), sel + ' not covered');
  assert.match(block, /input\[type="range"\][^}]*height:\s*44px/);
  assert.match(block, /gap:\s*8px/);
});
test('the phone header rows size to their content so tall controls cannot overlap', () => {
  assert.match(css, /\.header-actions\s*\{[^}]*grid-template-rows:\s*auto auto\s*!important/);
});

// ---- 4. A second cue besides color on the two data charts ----------------------------------------------------------
const modelStart = html.indexOf('function combineJBikeBodies');
const modelEnd = html.indexOf('\n      // =====', html.indexOf('function analyzeStability'));
function sandbox(extra) {
  const sb = Object.assign({ Math, __ctx: null, __draws: [] }, extra || {});
  vm.createContext(sb);
  return sb;
}

test('root-locus plot: oscillation is drawn as hollow rings and growth or decay as filled dots', () => {
  const start = html.indexOf('function drawRootLocusCanvas2D'), end = html.indexOf('function drawRootLocusCanvas3D');
  assert.ok(start > 0 && end > start);
  const sb = sandbox({ window: {}, appState: null, rootPlotArea: null, formatSpeed: v => String(v) });
  vm.runInContext('const DEG2RAD = Math.PI / 180; const UNIT_CONFIG = { mph: { factor: 2.2369362920544, label: "mph", decimals: 1 } };\n' +
    'const TEXT_SAFE = { "#168a4a": "#0b6b33", "#e0301e": "#b82416", "#b07a10": "#805800" };\nvar appState, rootPlotArea;\n' +
    html.slice(modelStart, modelEnd) + '\n' + html.slice(start, end) +
    '\nthis.api = { assembleWhippleModel, analyzeStability, drawRootLocusCanvas2D, setApp: s => { appState = s; } };', sb);
  const params = JSON.parse(JSON.stringify(vm.runInNewContext('(' + html.slice(html.indexOf('{', html.indexOf('benchmark: {')), html.indexOf('burleyLong: {')).replace(/,\s*$/, '') + ')')));
  const model = sb.api.assembleWhippleModel(params);
  sb.api.setApp({ analysis: sb.api.analyzeStability(model, 0, 12, 151), unit: 'mph', sim: { speedMs: 6.5 }, hoverSpeed: null, pinnedBaseline: null });
  const rec = createRecorder();
  sb.api.drawRootLocusCanvas2D(rec.ctx, 800, 500);
  const dots = rec.items.flatMap(it => it.path.filter(s => s.t === 'A').map(s => ({ ...s, kind: it.kind, style: it.style })));
  const rings = dots.filter(d => d.kind === 'stroke' && d.style.strokeStyle === '#168a4a' && d.r > 2 && d.r < 3);
  const filled = dots.filter(d => d.kind === 'fill' && d.style.fillStyle === '#e0301e' && d.r < 3);
  assert.ok(rings.length > 100, 'hollow green rings: ' + rings.length);
  assert.ok(filled.length > 100, 'filled red dots: ' + filled.length);
  assert.equal(dots.filter(d => d.kind === 'fill' && d.style.fillStyle === '#168a4a' && d.r < 3).length, 0, 'no filled green dots remain');
  assert.ok(rec.texts.some(t => t.s === 'Im(λ): oscillation') && rec.texts.some(t => t.s === 'Re(λ): growth or decay'), 'legend text');
});

test('lean and steer chart: lean is a solid line and steer is dashed, in the legend and on the chart', () => {
  const start = html.indexOf('let timeSeriesDescFor = null;'), end = html.indexOf('// Time at which the current ride test passes the crash lean');
  assert.ok(start > 0 && end > start);
  const rec = createRecorder();
  const traj = Array.from({ length: 601 }, (_, i) => ({ t: i * 0.01, phi: 0.1 * Math.cos(i * 0.02), delta: 0.05 * Math.sin(i * 0.02) }));
  const sb = sandbox({
    document: { getElementById: () => ({}) }, window: {},
    setupHiDPICanvas: () => ({ ctx: rec.ctx, width: 600, height: 300 }), getCrashTime: () => null, formatSpeed: v => String(v), setCanvasDescription: () => {}
  });
  vm.runInContext('const RAD2DEG = 180 / Math.PI;\nvar appState = { sim: { trajectory: [], duration: 6, rollImpulseDeg: 5, speedMs: 6, t: 1 }, unit: "ms" };\n' +
    html.slice(start, end) + '\nthis.api = { drawTimeSeriesCanvas, setTraj: t => { appState.sim.trajectory = t; } };', sb);
  sb.api.setTraj(traj);
  sb.api.drawTimeSeriesCanvas();
  const long = it => it.path.length > 100;
  const lean = rec.items.find(it => it.kind === 'stroke' && it.style.strokeStyle === '#b07a10' && long(it));
  const steer = rec.items.find(it => it.kind === 'stroke' && it.style.strokeStyle === '#1747e6' && long(it));
  assert.ok(lean && steer, 'both curves drawn');
  assert.equal(lean.style.dash.length, 0, 'lean is solid');
  assert.ok(steer.style.dash.length >= 2 && steer.style.dash[0] >= 6, 'steer is dashed: ' + Array.from(steer.style.dash));
  const key = rec.items.filter(it => it.kind === 'stroke' && it.path.length === 2 && it.style.lineWidth >= 2 && Math.abs(it.path[0].y - 11) < 1e-9);
  assert.ok(key.some(k => k.style.dash.length === 0) && key.some(k => k.style.dash.length >= 2), 'legend shows a solid and a dashed sample');
});
