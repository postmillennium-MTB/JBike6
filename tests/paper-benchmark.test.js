'use strict';
// Checks the app against the numbers printed in the repo's reference paper:
// Meijaard, Papadopoulos, Ruina and Schwab (2007), "Linearized dynamics equations for the balance and
// steer of a bicycle: a benchmark and review", Proc. R. Soc. A 463 (FinalBicyclePaper_v45_with_Appendix.pdf).
// Equations (6.1) to (6.4) and Table 2 give the benchmark bicycle's matrices, eigenvalues and transition
// speeds to 14 digits. The benchmark parameters are those of the 'benchmark' preset (paper table 1).
// The model code lives in index.html, so it is cut out of the page and run in a sandbox.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function combineJBikeBodies');
const analyze = html.indexOf('function analyzeStability');
const end = html.indexOf('\n      // =====', analyze);
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) +
  '\nthis.api = { assembleWhippleModel, analyzeStability, maxRealEigenvalue };', sandbox);
const { assembleWhippleModel, analyzeStability, maxRealEigenvalue } = sandbox.api;

// The app's own benchmark preset, read from the page so the test follows what users get.
const presetStart = html.indexOf('{', html.indexOf('const PRESETS = {'));
let depth = 0, presetEnd = presetStart;
for (; presetEnd < html.length; presetEnd++) {
  if (html[presetEnd] === '{') depth++;
  else if (html[presetEnd] === '}' && --depth === 0) break;
}
const PRESETS = vm.runInNewContext('(' + html.slice(presetStart, presetEnd + 1) + ')');
const model = assembleWhippleModel(PRESETS.benchmark);

const close = (actual, expected, tol, label) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), label + ': ' + actual + ' vs paper ' + expected);

test('benchmark matrices match paper equations (6.1) to (6.4)', () => {
  const paper = {
    M: [[80.81722, 2.31941332208709], [2.31941332208709, 0.29784188199686]],
    K0: [[-80.95, -2.59951685249872], [-2.59951685249872, -0.80329488458618]],
    K2: [[0, 76.59734589573222], [0, 2.65431523794604]],
    C1: [[0, 33.86641391492494], [-0.85035641456978, 1.68540397397560]]
  };
  for (const key of Object.keys(paper)) {
    paper[key].forEach((row, i) => row.forEach((value, j) => close(model[key][i][j], value, 1e-10, key + '[' + i + '][' + j + ']')));
  }
});

test('benchmark transition speeds match paper table 2(a)', () => {
  const a = analyzeStability(model, 0, 10, 301);
  close(a.vw, 4.29238253634111, 1e-8, 'weave speed');
  close(a.vc, 6.02426201538837, 1e-8, 'capsize speed');
  close(a.vwOmega, 3.43503384866144, 1e-6, 'weave frequency at the weave speed');
  const double = a.doubleRoots.find(d => Math.abs(d.v - 0.684) < 0.01);
  assert.ok(double, 'double root near 0.68 m/s');
  close(double.v, 0.68428307889246, 1e-6, 'double-root speed');
  close(double.re, 3.78290405129320, 1e-5, 'double-root eigenvalue');
});

test('benchmark eigenvalues match paper table 2(b) and 2(c) at 1 to 10 m/s', () => {
  const weave = { 1: [3.52696170990070, 0.80774027519930], 2: [2.68234517512745, 1.68066296590675], 3: [1.70675605663975, 2.31582447384325],
    4: [0.41325331521125, 3.07910818603206], 5: [-0.77534188219585, 4.46486771378823], 6: [-1.52644486584142, 5.87673060598709],
    7: [-2.13875644258362, 7.19525913329805], 8: [-2.69348683581097, 8.46037971396931], 9: [-3.21675402252485, 9.69377351531791], 10: [-3.72016840437287, 10.90681139476287] };
  const capsize = { 1: -3.13423125066578, 2: -3.07158645641514, 3: -2.63366137253667, 4: -1.42944427361326, 5: -0.32286642900409,
    6: -0.00406690076970, 7: 0.10268170574766, 8: 0.14327879765713, 9: 0.15790184030917, 10: 0.16105338653172 };
  const castering = { 1: -7.11008014637442, 2: -8.67387984831735, 3: -10.35101467245920, 4: -12.15861426576447, 5: -14.07838969279822,
    6: -16.08537123098026, 7: -18.15788466125262, 8: -20.27940894394569, 9: -22.43788559040858, 10: -24.62459635017404 };
  for (let v = 1; v <= 10; v++) {
    const roots = maxRealEigenvalue(model, v).roots;
    const complex = roots.find(r => r.im > 1e-6);
    close(complex.re, weave[v][0], 1e-8, 'weave Re at v=' + v);
    close(complex.im, weave[v][1], 1e-8, 'weave Im at v=' + v);
    const real = roots.filter(r => Math.abs(r.im) < 1e-6).map(r => r.re).sort((a, b) => a - b);
    close(real[0], castering[v], 1e-8, 'castering at v=' + v);
    close(real[1], capsize[v], 1e-8, 'capsize at v=' + v);
  }
});
