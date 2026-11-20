// Executable numeric regressions for the MATLAB-compatible control equations.
// Run: node --test tests/control-theory-audit.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStateSpace } = require('../control-theory.js');
const fs = require('node:fs');
const path = require('node:path');

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}
function evalPoly(coefficients, s) {
  return coefficients.reduce((value, coefficient) => value * s + coefficient, 0);
}
function solve2(a, b, rhs) {
  const det = a[0][0] * a[1][1] - a[0][1] * a[1][0];
  return [(rhs[0] * a[1][1] - a[0][1] * rhs[1]) / det,
    (a[0][0] * rhs[1] - rhs[0] * a[1][0]) / det];
}

// Deliberately nontrivial numeric fixture that catches matrix-order and
// gravity-scaling errors without depending on the page DOM or a source regex.
const fixture = {
  M0: [[4, 1], [1, 3]],
  C1: [[0, 2], [-3, 1]],
  // Gravity has already been included, as in MATLAB JBmck.m.
  K0: [[-10, 2], [2, -3]],
  K2: [[0, 0.5], [0, -0.25]]
};

test('matches MATLAB mass-premultiplied equations and state ordering', () => {
  const result = computeStateSpace(fixture, 2);
  const expectedA = [
    [0, 1, 0, 0],
    [32 / 11, -6 / 11, -16 / 11, -10 / 11],
    [0, 0, 0, 1],
    [-18 / 11, 24 / 11, 20 / 11, -4 / 11]
  ];
  result.A.forEach((row, i) => row.forEach((value, j) => close(value, expectedA[i][j])));
  close(result.invM[0][0], 3 / 11);
  close(result.invM[0][1], -1 / 11);
  close(result.invM[1][0], -1 / 11);
  close(result.invM[1][1], 4 / 11);
  // At v=0, K0 is used as-is; gravity must not be multiplied a second time.
  const zeroSpeed = computeStateSpace(fixture, 0);
  close(zeroSpeed.K[0][0], -32 / 11);
  close(zeroSpeed.K[1][1], -14 / 11);
});

test('preserves MATLAB B columns and distinguishes MATLAB input 2 from steer torque', () => {
  const { B, matlabInput, steerTorqueInput } = computeStateSpace(fixture, 2);
  assert.deepEqual(matlabInput, [0, 3 / 11, 0, -1 / 11]);
  assert.deepEqual(steerTorqueInput, [0, -1 / 11, 0, 4 / 11]);
  assert.deepEqual(B.map(row => row[0]), [0, 0, 0, 0]);
  assert.deepEqual(B.map(row => row[2]), [0, 0, 0, 0]);
});

test('transfer polynomials equal direct second-order solution for MATLAB input 2', () => {
  const result = computeStateSpace(fixture, 2, 'roll');
  // Check numerator / denominator against solving (s^2 M + s v C1 + Kphysical)q = e1.
  const s = 1.7;
  const p = [[
    s * s * fixture.M0[0][0] + s * 2 * fixture.C1[0][0] + fixture.K0[0][0] + 4 * fixture.K2[0][0],
    s * s * fixture.M0[0][1] + s * 2 * fixture.C1[0][1] + fixture.K0[0][1] + 4 * fixture.K2[0][1]
  ], [
    s * s * fixture.M0[1][0] + s * 2 * fixture.C1[1][0] + fixture.K0[1][0] + 4 * fixture.K2[1][0],
    s * s * fixture.M0[1][1] + s * 2 * fixture.C1[1][1] + fixture.K0[1][1] + 4 * fixture.K2[1][1]
  ]];
  const q = solve2(p, [0, 0], [1, 0]);
  const tf = evalPoly(result.numerator, s) / evalPoly(result.denominator, s);
  close(tf, q[0], 1e-9);
  close(result.C[0], 1);
  assert.equal(result.D[0], 0);
});

test('rejects singular mass matrices and malformed model inputs visibly', () => {
  assert.throws(() => computeStateSpace({ ...fixture, M0: [[1, 1], [1, 1]] }, 3), /singular or ill-conditioned/);
  assert.throws(() => computeStateSpace({ ...fixture, K0: [[1]] }, 3), /finite 2x2/);
  assert.throws(() => computeStateSpace(fixture, Number.NaN), /finite forward speed/);
});

test('Schwinn Crown audit fixture still identifies original MATLAB parameter baseline', () => {
  const matlab = fs.readFileSync(path.join(__dirname, '..', 'original Matlab files', 'JBini_files', 'JBini_Schwinn_Crown.m'), 'utf8');
  assert.match(matlab, /wheelbase = 1\.01600000/);
  assert.match(matlab, /head_angle = 1\.23879599/);
  assert.match(matlab, /trail = 0\.09096800/);
  assert.match(matlab, /gravity = 9\.80665000/);
  assert.match(matlab, /mrider = 80\.00000000/);
  assert.match(matlab, /mrearwheel = 1\.81818200/);
});
