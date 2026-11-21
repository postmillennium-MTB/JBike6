'use strict';
// Checks the app's eigenvalue solver and the Eigenmode lab's mode shapes against the MATLAB
// eigenproblem (JBeig.m: A V = B V D). Reference values come from tests/fixtures/eigen-reference.json
// (see tests/fixtures/make_eigen_reference.py). The model code lives in index.html, so it is cut out
// of the page and run in a sandbox.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { computeModeShape } = require('../eigenmode-lab.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function combineJBikeBodies');
const analyze = html.indexOf('function analyzeStability');
const end = html.indexOf('\n      // =====', analyze);
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) +
  '\nthis.api = { assembleWhippleModel, charPolyCoeffs, solvePolynomialRoots };', sandbox);
const { assembleWhippleModel, charPolyCoeffs, solvePolynomialRoots } = sandbox.api;

const matlab = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
const eigen = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'eigen-reference.json'), 'utf8'));
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
const wrap = d => ((d + 180) % 360 + 360) % 360 - 180;

for (const [name, bySpeed] of Object.entries(eigen)) {
  test('eigenvalues and mode shapes match MATLAB for ' + name, () => {
    const model = assembleWhippleModel(paramsFromMatlab(matlab[name].ini));
    for (const [vStr, refModes] of Object.entries(bySpeed)) {
      const v = Number(vStr);
      const roots = solvePolynomialRoots(charPolyCoeffs(model, v));
      assert.equal(roots.length, 4, 'four roots at v=' + v);
      // Every MATLAB eigenvalue must have a matching app root.
      for (const m of refModes) {
        const scale = Math.max(1, Math.hypot(m.re, m.im));
        const best = Math.min(...roots.map(r => Math.hypot(r.re - m.re, r.im - m.im)));
        assert.ok(best / scale < 1e-6, name + ' v=' + v + ': no app root near ' + m.re + '+' + m.im + 'i (off by ' + best + ')');
      }
      // Mode shape from the Eigenmode lab, evaluated at the MATLAB eigenvalue.
      for (const m of refModes.filter(x => x.isolated)) {
        const shape = computeModeShape(model, v, { re: m.re, im: m.im });
        assert.ok(shape.relativeResidual < 1e-8, 'eigenpair residual ' + shape.relativeResidual);
        const ratioScale = Math.max(1e-9, m.ratio);
        if (m.ratio > 1e-6 && m.ratio < 1e6) {
          assert.ok(Math.abs(shape.steerToLeanRatio - m.ratio) / ratioScale < 1e-6, name + ' v=' + v + ' ratio ' + shape.steerToLeanRatio + ' vs ' + m.ratio);
        }
        if (m.phase !== null && shape.phaseDifferenceDeg !== null && m.ratio > 1e-6 && m.ratio < 1e6) {
          // Steer sign flip: the app's phase is MATLAB's plus 180 degrees.
          assert.ok(Math.abs(wrap(shape.phaseDifferenceDeg - (m.phase + 180))) < 1e-4, name + ' v=' + v + ' phase ' + shape.phaseDifferenceDeg + ' vs ' + m.phase);
        }
      }
    }
  });
}

test('frequency and damping follow from the eigenvalue', () => {
  const model = assembleWhippleModel(paramsFromMatlab(matlab.Benchmark_Paper.ini));
  const shape = computeModeShape(model, 5, { re: -1, im: 2 * Math.PI * 0.5 });
  assert.ok(Math.abs(shape.frequencyHz - 0.5) < 1e-12);
  assert.ok(Math.abs(shape.dampingRatio - 1 / Math.hypot(1, Math.PI)) < 1e-12);
});
