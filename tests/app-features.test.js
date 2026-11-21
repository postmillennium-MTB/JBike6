'use strict';
// Checks the app-only model features. Two of them have a MATLAB counterpart that can be compared
// directly (zero gyroscopic effect). The others are the app's own modelling choices, so these tests
// pin down what they do, they do not validate the physics.
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
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) + '\nthis.api = { assembleWhippleModel };', sandbox);
const { assembleWhippleModel } = sandbox.api;
const matlab = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
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
const flip = A => [[A[0][0], -A[0][1]], [-A[1][0], A[1][1]]];
function maxRelError(expected, actual) {
  const scale = Math.max(1e-12, ...expected.flat().map(Math.abs));
  return Math.max(...expected.flat().map((x, i) => Math.abs(x - actual.flat()[i]))) / scale;
}

for (const [name, ref] of Object.entries(matlab)) {
  test('gyro multiplier 0 matches MATLAB with zero wheel spin inertia for ' + name, () => {
    const p = paramsFromMatlab(ref.ini);
    p.gyroMult = 0;
    const model = assembleWhippleModel(p);
    const g = 9.81;
    assert.ok(maxRelError(flip(ref.no_gyro.M0), model.M) < 1e-9, 'M0');
    assert.ok(maxRelError(flip(ref.no_gyro.C1), model.C1) < 1e-9, 'C1');
    assert.ok(maxRelError(flip(ref.no_gyro.K0), model.K0.map(r => r.map(x => x * g))) < 1e-9, 'K0');
    assert.ok(maxRelError(flip(ref.no_gyro.K2), model.K2) < 1e-9, 'K2');
  });
}

test('the gyro multiplier scales the wheels spin inertia linearly', () => {
  const base = paramsFromMatlab(matlab.Benchmark_Paper.ini);
  const half = Object.assign({}, base, { gyroMult: 0.5 });
  const halfSpin = JSON.parse(JSON.stringify(base));
  halfSpin.rearWheel.Izz *= 0.5; halfSpin.frontWheel.Izz *= 0.5;
  const a = assembleWhippleModel(half), b = assembleWhippleModel(halfSpin);
  assert.ok(maxRelError(a.C1, b.C1) < 1e-12);
  assert.ok(maxRelError(a.K2, b.K2) < 1e-12);
});

test('auto-scaled wheels follow mass proportional to radius and spin inertia proportional to mass times radius squared', () => {
  const p = paramsFromMatlab(matlab.Benchmark_Paper.ini);
  p.autoScaleWheels = true;
  const at = D => { const q = JSON.parse(JSON.stringify(p)); q.Df = D; q.Dr = D; return assembleWhippleModel(q); };
  const small = at(0.6), large = at(0.9);
  // Gyroscopic term S = spin inertia / radius, so S scales as radius squared (mass ~ r, inertia ~ m r^2, S ~ m r).
  const ratio = (0.9 / 0.6);
  assert.ok(Math.abs(large.S_R / small.S_R - ratio * ratio) < 1e-9, 'S_R ratio ' + large.S_R / small.S_R);
  assert.ok(Math.abs(large.S_F / small.S_F - ratio * ratio) < 1e-9);
});
