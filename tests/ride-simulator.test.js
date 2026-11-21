'use strict';
// Checks the ride-test simulator (runPerturbationSimulation) and the Control lab feedback simulator
// (runControlledSimulation) against the exact solution of the same linear system.
// MATLAB's JBike6Integrate.m solves M0 q'' = -(C1 v q' + (K0 + v^2 K2) q) with ode45 at a tolerance
// of 1e-3. The reference here is the matrix exponential (tests/fixtures/make_simulation_reference.py),
// which has no integration error, built from the MATLAB-port matrices.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function combineJBikeBodies');
const end = html.indexOf('function computeClosedLoopPoles');
assert.ok(start > 0 && end > start, 'simulator code markers not found in index.html');
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) +
  '\nthis.api = { assembleWhippleModel, runPerturbationSimulation, runControlledSimulation };', sandbox);
const { assembleWhippleModel, runPerturbationSimulation, runControlledSimulation } = sandbox.api;

const matlab = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
const sims = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'simulation-reference.json'), 'utf8'));
const R2D = 180 / Math.PI;
const DT = 0.01;

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

// The simulators clamp lean and steer at 1.5 rad (display limit), which the linear model does not.
// Compare only up to the first simulated sample that reaches the clamp, because after that the
// trajectory is deliberately no longer the linear solution. Sampling the exact solution every 0.5 s
// could miss a short excursion, so the clamp is detected on the simulator's own 10 ms samples.
const CLAMP = 1.49;
function worstRelativeError(traj, ref) {
  const clampIdx = traj.findIndex(p => Math.abs(p.phi) >= CLAMP || Math.abs(p.delta) >= CLAMP);
  const lastIdx = clampIdx === -1 ? traj.length - 1 : clampIdx - 1;
  let worst = 0, scale = 0, used = 0;
  for (let i = 0; i < ref.t.length; i++) {
    const idx = Math.round(ref.t[i] / DT);
    if (idx > lastIdx) break;
    const s = traj[idx];
    worst = Math.max(worst, Math.abs(s.phi - ref.phi[i]), Math.abs(s.delta - ref.delta[i]));
    scale = Math.max(scale, Math.abs(ref.phi[i]), Math.abs(ref.delta[i]));
    used = i + 1;
  }
  return { error: worst / Math.max(scale, 1e-12), used };
}

for (const c of sims.open_loop) {
  test('ride test matches the exact solution for ' + c.name + ' at ' + c.speed + ' m/s', () => {
    const model = assembleWhippleModel(paramsFromMatlab(matlab[c.name].ini));
    const traj = runPerturbationSimulation(model, c.speed, 5, 6, DT);
    const { error, used } = worstRelativeError(traj, c);
    assert.ok(used >= 2, 'too few comparable samples');
    assert.ok(error < 1e-5, 'relative error ' + error);
  });
}

for (const c of sims.closed_loop) {
  test('feedback simulation matches the exact solution for ' + c.name + ' (kp ' + c.kp + ', kd ' + c.kd + ', ki ' + c.ki + ')', () => {
    const model = assembleWhippleModel(paramsFromMatlab(matlab[c.name].ini));
    const traj = runControlledSimulation(model, c.speed, { feedbackEnabled: true, kp: c.kp, kd: c.kd, ki: c.ki, stepTorque: 0 }, 5, 6, DT);
    const { error, used } = worstRelativeError(traj, c);
    assert.ok(used >= 2, 'too few comparable samples');
    assert.ok(error < 1e-5, 'relative error ' + error);
  });
}

test('a stable design that is stiff at high speed does not report a false crash', () => {
  const model = assembleWhippleModel(paramsFromMatlab(matlab.Trail_only.ini));
  const traj = runPerturbationSimulation(model, 25, 5, 6, DT);
  assert.ok(Math.max(...traj.map(p => Math.abs(p.phi))) < 6 * Math.PI / 180, 'lean stays near the 5 degree start');
});

test('lean and steer never exceed the 1.5 rad display limit, even for a violently unstable bike', () => {
  const model = assembleWhippleModel(paramsFromMatlab(matlab.Chopper.ini));
  const traj = runPerturbationSimulation(model, 2, 5, 6, DT);
  assert.ok(traj.every(p => Math.abs(p.phi) <= 1.5 + 1e-12 && Math.abs(p.delta) <= 1.5 + 1e-12));
  assert.equal(traj.length, 601);
});

test('the first sample is the initial lean with everything else at rest', () => {
  const model = assembleWhippleModel(paramsFromMatlab(matlab.Benchmark_Paper.ini));
  const first = runPerturbationSimulation(model, 5, 5, 6, DT)[0];
  assert.ok(Math.abs(first.phi - 5 / R2D) < 1e-12);
  assert.equal(first.delta, 0); assert.equal(first.dphi, 0); assert.equal(first.ddelta, 0);
});
