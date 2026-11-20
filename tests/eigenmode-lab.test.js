'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeModeShape, computeEigenpairMetrics, stateMatrixFor } = require('../eigenmode-lab.js');

const model = {
  M: [[1, 0], [0, 2]],
  C1: [[0.1, 0], [0, 0.4]],
  K0: [[0.5, 0], [0, 1]],
  K2: [[0.1, 0], [0, 0.3]],
  g: 9.81
};
const speed = 6;
const leanRoot = { re: -0.3, im: Math.sqrt(8.415) };
const steerRoot = { re: -0.6, im: Math.sqrt(9.945) };

test('recovers a normalized lean-dominant eigenvector and low residual', () => {
  const mode = computeModeShape(model, speed, leanRoot);
  assert.ok(Math.abs(mode.leanAmplitude - 1) < 1e-10);
  assert.ok(mode.steerAmplitude < 1e-10);
  assert.ok(mode.steerToLeanRatio < 1e-10);
  assert.equal(mode.phaseDifferenceDeg, null);
  assert.ok(mode.relativeResidual < 1e-10);
  assert.equal(mode.stateVector.length, 4);
  assert.ok(Math.abs(mode.stateVector[1].re - leanRoot.re) < 1e-10);
  assert.ok(Math.abs(mode.stateVector[1].im - leanRoot.im) < 1e-10);
});

test('recovers a normalized steer-dominant eigenvector and low residual', () => {
  const mode = computeModeShape(model, speed, steerRoot);
  assert.ok(mode.leanAmplitude < 1e-10);
  assert.ok(Math.abs(mode.steerAmplitude - 1) < 1e-10);
  assert.ok(mode.steerToLeanRatio > 1e10);
  assert.equal(mode.phaseDifferenceDeg, null);
  assert.ok(mode.relativeResidual < 1e-10);
  assert.ok(Math.abs(mode.stateVector[3].re - steerRoot.re) < 1e-10);
  assert.ok(Math.abs(mode.stateVector[3].im - steerRoot.im) < 1e-10);
});

test('complex-conjugate roots produce conjugate modal eigenvectors', () => {
  const upper = computeModeShape(model, speed, leanRoot);
  const lower = computeModeShape(model, speed, { re: leanRoot.re, im: -leanRoot.im });
  for (let i = 0; i < 4; i++) {
    assert.ok(Math.abs(upper.stateVector[i].re - lower.stateVector[i].re) < 1e-10);
    assert.ok(Math.abs(upper.stateVector[i].im + lower.stateVector[i].im) < 1e-10);
  }
});

test('state-space A matrix uses the documented interleaved [lean, lean rate, steer, steer rate] order', () => {
  const A = stateMatrixFor(model, speed);
  assert.deepEqual(A[0], [0, 1, 0, 0]);
  assert.deepEqual(A[2], [0, 0, 0, 1]);
  assert.equal(A.length, 4);
  assert.ok(A.flat().every(Number.isFinite));
});

test('rejects invalid speed and eigenvalue inputs', () => {
  assert.throws(() => computeModeShape(model, NaN, leanRoot), /valid bicycle model/);
  assert.throws(() => computeModeShape(model, speed, { re: 0, im: NaN }), /valid bicycle model/);
});

test('reports a singular mass matrix instead of returning invalid mode data', () => {
  const singular = { ...model, M: [[1, 0], [0, 0]] };
  assert.throws(() => stateMatrixFor(singular, speed), /mass matrix is singular/);
});


test('visual eigenpair metrics reproduce the selected complex eigenvalue', () => {
  const A = stateMatrixFor(model, speed);
  const mode = computeModeShape(model, speed, leanRoot);
  const metrics = computeEigenpairMetrics(A, mode.stateVector, leanRoot);
  assert.ok(Math.abs(metrics.rayleigh.re - leanRoot.re) < 1e-10);
  assert.ok(Math.abs(metrics.rayleigh.im - leanRoot.im) < 1e-10);
  assert.ok(metrics.relativeResidual < 1e-10);
  assert.equal(metrics.Ax.length, 4);
  assert.equal(metrics.lambdaX.length, 4);
});

test('eigenpair metrics reject matrices or state vectors with the wrong dimensions', () => {
  assert.throws(() => computeEigenpairMetrics([[1]], [], leanRoot), /4x4 state matrix/);
});
