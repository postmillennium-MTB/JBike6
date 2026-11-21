'use strict';
// Checks the app's double-root detection against the discriminant of the characteristic polynomial,
// and the design-sweep path used by the Stability landscape and Design optimization against the
// MATLAB port. References: tests/fixtures/design-reference.json (make_design_reference.py).
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

const matlab = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
const design = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'design-reference.json'), 'utf8'));
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

for (const [name, speeds] of Object.entries(design.double_roots)) {
  test('double-root speeds match the discriminant for ' + name, () => {
    const model = assembleWhippleModel(paramsFromMatlab(matlab[name].ini));
    const found = analyzeStability(model, 0, 30, 301).doubleRoots.map(d => d.v);
    for (const v of speeds) assert.ok(found.some(w => Math.abs(w - v) < 0.01), 'missed double root at ' + v + ' (found ' + found + ')');
    for (const w of found) assert.ok(speeds.some(v => Math.abs(w - v) < 0.01), 'spurious double root at ' + w);
  });
}

test('design sweep: changing head angle, fork offset, wheelbase and rider matches the MATLAB port', () => {
  design.design_sweep.cases.forEach(k => {
    const p = paramsFromMatlab(matlab[design.design_sweep.base].ini);
    p.headAngleDeg = k.hta; p.forkOffsetMm = k.off; p.wheelbase = k.wb;
    p.rider.m = k.rm; p.rider.x = k.rx; p.rider.y = k.ry;
    const js = maxRealEigenvalue(assembleWhippleModel(p), k.v).maxRe;
    assert.ok(Math.abs(js - k.maxRe) / Math.max(1, Math.abs(k.maxRe)) < 1e-9, 'max Re ' + js + ' vs ' + k.maxRe);
  });
});
