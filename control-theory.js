/*
 * Linearized JBike6 state-space equations, following the 2015 MATLAB files.
 *
 * MATLAB convention: M0*qdd + v*C1*qd + (K0 + v^2*K2)*q = T,
 * with q=[lean, steer]. JBmck has already included gravity in K0.
 * The state is interleaved: [q1, q1dot, q2, q2dot].
 *
 * JBike6Control.m constructs four input columns and calls ss2tf(..., 2).
 * That selects column 2 (one-based), which is a generalized force on q1
 * (lean), not q2 (steer), given the documented q ordering. Both channels are
 * exposed below so the MATLAB transfer function and physical steer torque
 * are not silently conflated.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6ControlTheory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function assertMatrix2(matrix, label) {
    if (!Array.isArray(matrix) || matrix.length !== 2 || matrix.some(row => !Array.isArray(row) || row.length !== 2 || row.some(value => !Number.isFinite(value)))) {
      throw new TypeError(`${label} must be a finite 2x2 matrix`);
    }
  }

  function inverse2(matrix) {
    assertMatrix2(matrix, 'M0');
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (!Number.isFinite(det) || Math.abs(det) <= 1e-12) {
      throw new RangeError('JBike6 mass matrix M0 is singular or ill-conditioned');
    }
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  }

  function multiply2(a, b) {
    return [
      [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
      [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]]
    ];
  }

  function multiplyByScalar(matrix, scalar) {
    return matrix.map(row => row.map(value => value * scalar));
  }

  function add2(a, b) {
    return a.map((row, i) => row.map((value, j) => value + b[i][j]));
  }

  function multiplyPolynomial(a, b) {
    const result = Array(a.length + b.length - 1).fill(0);
    a.forEach((left, i) => b.forEach((right, j) => { result[i + j] += left * right; }));
    return result;
  }

  function addPolynomial(a, b, bScale = 1) {
    const length = Math.max(a.length, b.length);
    const result = Array(length).fill(0);
    for (let i = 0; i < length; i++) {
      const aIndex = i - (length - a.length);
      const bIndex = i - (length - b.length);
      result[i] = (aIndex >= 0 ? a[aIndex] : 0) + bScale * (bIndex >= 0 ? b[bIndex] : 0);
    }
    return result;
  }

  function trimLeadingZeros(polynomial) {
    let first = 0;
    while (first < polynomial.length - 1 && Math.abs(polynomial[first]) < 1e-13) first++;
    return polynomial.slice(first);
  }

  function computeStateSpace(model, speed, output = 'roll') {
    if (!model || !Number.isFinite(speed)) throw new TypeError('model and finite forward speed are required');
    const { M0, C1, K0, K2 } = model;
    assertMatrix2(M0, 'M0');
    assertMatrix2(C1, 'C1');
    assertMatrix2(K0, 'K0');
    assertMatrix2(K2, 'K2');
    if (output !== 'roll' && output !== 'steer') throw new RangeError("output must be 'roll' or 'steer'");

    const invM = inverse2(M0);
    const S = multiply2(invM, multiplyByScalar(C1, speed));
    // K0 is already gravity-scaled by MATLAB JBmck.m. Do not multiply by g.
    const physicalK = add2(K0, multiplyByScalar(K2, speed * speed));
    const K = multiply2(invM, physicalK);

    const A = [
      [0, 1, 0, 0],
      [-K[0][0], -S[0][0], -K[0][1], -S[0][1]],
      [0, 0, 0, 1],
      [-K[1][0], -S[1][0], -K[1][1], -S[1][1]]
    ];
    // Columns reproduce JBike6Control.m's 4x4 B arrangement. MATLAB ss2tf
    // input 2 selects the q1/lean generalized-force column (index 1 here).
    const B = [
      [0, 0, 0, 0],
      [0, invM[0][0], 0, invM[0][1]],
      [0, 0, 0, 0],
      [0, invM[1][0], 0, invM[1][1]]
    ];
    const C = output === 'roll' ? [1, 0, 0, 0] : [0, 0, 1, 0];
    const D = [0, 0, 0, 0];

    // MATLAB ss2tf input number 2 is one-based; the selected generalized
    // coordinate is q1. A separate q2 channel models actual steer torque.
    const matlabInput = [B[0][1], B[1][1], B[2][1], B[3][1]];
    const steerTorqueInput = [B[0][3], B[1][3], B[2][3], B[3][3]];
    const b = [invM[0][0], invM[1][0]];
    const p11 = [1, S[0][0], K[0][0]];
    const p12 = [S[0][1], K[0][1]];
    const p21 = [S[1][0], K[1][0]];
    const p22 = [1, S[1][1], K[1][1]];
    const denominator = trimLeadingZeros(addPolynomial(
      multiplyPolynomial(p11, p22), multiplyPolynomial(p12, p21), -1
    ));
    const numerator = output === 'roll'
      ? addPolynomial(multiplyPolynomial(p22, [b[0]]), multiplyPolynomial(p12, [b[1]]), -1)
      : addPolynomial(multiplyPolynomial(p11, [b[1]]), multiplyPolynomial(p21, [b[0]]), -1);

    return { A, B, C, D, S, K, invM, matlabInput, steerTorqueInput, numerator, denominator };
  }

  return { computeStateSpace, inverse2, multiplyPolynomial, addPolynomial };
});
