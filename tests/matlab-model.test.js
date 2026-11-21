'use strict';
// Checks the app's bicycle model against the original MATLAB (JBmck.m, JBaddb.m, JBeig.m).
// Reference values come from tests/fixtures/matlab-reference.json, produced by a direct Python
// port of those MATLAB files (see tests/fixtures/make_matlab_reference.py).
//
// The model code lives inside index.html, so it is cut out of the page and run in a sandbox.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function combineJBikeBodies');
const analyze = html.indexOf('function analyzeStability');
const end = html.indexOf('\n      // =====', analyze);
assert.ok(start > 0 && analyze > start && end > analyze, 'model code markers not found in index.html');
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) +
  '\nthis.api = { assembleWhippleModel, analyzeStability };', sandbox);
const { assembleWhippleModel, analyzeStability } = sandbox.api;

const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
const R2D = 180 / Math.PI;

function paramsFromMatlab(e) {
  const rF = e.Dfrontwheel / 2;
  return {
    g: 9.81, wheelbase: e.wheelbase, headAngleDeg: e.head_angle * R2D,
    forkOffsetMm: (rF * Math.cos(e.head_angle) - e.trail * Math.sin(e.head_angle)) * 1000,
    Df: e.Dfrontwheel, Dr: e.Drearwheel, autoScaleWheels: false, gyroMult: 1,
    rearWheel: { m: e.mrearwheel, Ixx: e.Irearwheel[0], Izz: e.Irearwheel[2] },
    frontWheel: { m: e.mfrontwheel, Ixx: e.Ifrontwheel[0], Izz: e.Ifrontwheel[2] },
    frame: { m: e.mframe, x: e.xcmframe, y: e.ycmframe, I11: e.Iframe[0], I22: e.Iframe[1], Izz: e.Iframe[2], alphaDeg: e.alphaIframe * R2D },
    rider: { m: e.mrider, x: e.xcmrider, y: e.ycmrider, I11: e.Irider[0], I22: e.Irider[1], Izz: e.Irider[2], alphaDeg: e.alphaIrider * R2D },
    rack: { m: e.mrack, x: e.xcmrack, y: e.ycmrack, I11: e.Irack[0], I22: e.Irack[1], Izz: e.Irack[2], alphaDeg: e.alphaIrack * R2D },
    fork: { m: e.mfork, u: e.ucmfork, v: e.vcmfork, I11: e.Ifork[0], I22: e.Ifork[1], Izz: e.Ifork[2], alphaDeg: e.alphaIfork * R2D },
    basket: { m: e.mbasket, u: e.ucmbasket, v: e.vcmbasket, I11: e.Ibasket[0], I22: e.Ibasket[1], Izz: e.Ibasket[2], alphaDeg: e.alphaIbasket * R2D }
  };
}

// MATLAB takes steer to the left as positive and the app follows Meijaard et al. (steer to the
// right is positive), so the off-diagonal terms change sign. The eigenvalues are unaffected.
const flip = A => [[A[0][0], -A[0][1]], [-A[1][0], A[1][1]]];
function maxRelError(expected, actual) {
  const scale = Math.max(1e-12, ...expected.flat().map(Math.abs));
  return Math.max(...expected.flat().map((x, i) => Math.abs(x - actual.flat()[i]))) / scale;
}

for (const [name, ref] of Object.entries(reference)) {
  test('model matrices match MATLAB for ' + name, () => {
    const model = assembleWhippleModel(paramsFromMatlab(ref.ini));
    const g = 9.81;
    assert.ok(maxRelError(flip(ref.M0), model.M) < 1e-9, 'M0');
    assert.ok(maxRelError(flip(ref.C1), model.C1) < 1e-9, 'C1');
    assert.ok(maxRelError(flip(ref.K0), model.K0.map(r => r.map(x => x * g))) < 1e-9, 'K0');
    assert.ok(maxRelError(flip(ref.K2), model.K2) < 1e-9, 'K2');
  });

  test('weave and capsize speeds match MATLAB for ' + name, () => {
    const model = assembleWhippleModel(paramsFromMatlab(ref.ini));
    const a = analyzeStability(model, 0, 30, 301);
    for (const [label, expected, actual] of [['weave', ref.vw, a.vw], ['capsize', ref.vc, a.vc]]) {
      if (expected === null) assert.ok(actual === null || actual === undefined || Number.isNaN(actual), label + ' should not exist');
      else assert.ok(Math.abs(actual - expected) < 0.01, label + ': expected ' + expected + ', got ' + actual);
    }
  });
}

test('the benchmark bicycle reproduces the published weave and capsize speeds (Meijaard et al. 2007)', () => {
  const model = assembleWhippleModel(paramsFromMatlab(reference.Benchmark_Paper.ini));
  const a = analyzeStability(model, 0, 12, 301);
  assert.ok(Math.abs(a.vw - 4.292) < 0.005, 'weave ' + a.vw);
  assert.ok(Math.abs(a.vc - 6.024) < 0.005, 'capsize ' + a.vc);
});
