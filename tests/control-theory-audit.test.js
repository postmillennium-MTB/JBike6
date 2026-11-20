// Lightweight regression checks for the control-theory equations embedded in index.html.
// Run with: node --test tests/control-theory-audit.test.js
// These are source-level checks plus small independent algebra checks; they do not replace
// running the browser UI or comparing numerical outputs from MATLAB Control System Toolbox.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function functionSource(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing ${name} in index.html`);
  const nextFunction = html.indexOf('\n      function ', start + 1);
  return html.slice(start, nextFunction === -1 ? html.length : nextFunction);
}

test('linearized stiffness applies gravity once in browser convention', () => {
  const modelBuilder = html.slice(html.indexOf('function computeBicycleMatrices('), html.indexOf('function charPolyCoeffs('));
  // The model-builder K0 entries are geometry/mass terms; gravity is introduced later.
  assert.match(modelBuilder, /const K0 = \[\s*\[mT \* zT, -S_A\],\s*\[-S_A, -S_A \* sinL\]\s*\]/);
  const stateSpace = functionSource('computeStateSpaceAndTF');
  assert.match(stateSpace, /g \* K0\[0\]\[0\] \+ v2 \* K2\[0\]\[0\]/);
  assert.match(stateSpace, /g \* K0\[1\]\[1\] \+ v2 \* K2\[1\]\[1\]/);
});

test('state ordering, steering-torque column, roll output, and direct feedthrough', () => {
  const source = functionSource('computeStateSpaceAndTF');
  assert.match(source, /const A = \[\s*\[0, 1, 0, 0\],\s*\[-K\[0\]\[0\], -S\[0\]\[0\], -K\[0\]\[1\], -S\[0\]\[1\]\],\s*\[0, 0, 0, 1\],\s*\[-K\[1\]\[0\], -S\[1\]\[0\], -K\[1\]\[1\], -S\[1\]\[1\]\]\s*\]/);
  assert.match(source, /const B = \[0, invM\[0\]\[1\], 0, invM\[1\]\[1\]\]/);
  assert.match(source, /outputType === 'delta' \? \[0, 0, 1, 0\] : \[1, 0, 0, 0\]/);
  assert.match(source, /const D = 0/);
});

test('transfer-function numerator uses the steer-torque column for roll and steer outputs', () => {
  const source = functionSource('computeStateSpaceAndTF');
  assert.match(source, /const b1 = B\[1\]/);
  assert.match(source, /const b2 = B\[3\]/);
  assert.match(source, /polyMul\(P22, \[b1\]\), polyMul\(P12, \[-b2\]\)/);
  assert.match(source, /polyMul\(P11, \[b2\]\), polyMul\(P21, \[-b1\]\)/);
  assert.match(source, /const denG = charPolyCoeffs\(model, v\)/);
  assert.match(source, /const poles = solvePolynomialRoots\(denG\)/);
  assert.match(source, /const zeros = solvePolynomialRoots\(numG\)/);
});

test('positive roll feedback is applied as positive steer generalized torque', () => {
  const sim = functionSource('runControlledSimulation');
  assert.match(sim, /ctrlCfg\.kp \* phi \+ ctrlCfg\.kd \* dphi \+ ctrlCfg\.ki \* intPhi \+ stepTau/);
  assert.match(sim, /const r1 = tau - \(/);
  assert.match(sim, /const r0 = -\(/);
});

test('original Schwinn Crown fixture remains available with its MATLAB reference geometry', () => {
  const fixture = fs.readFileSync(path.join(__dirname, '..', 'original Matlab files', 'JBini_files', 'JBini_Schwinn_Crown.m'), 'utf8');
  assert.match(fixture, /wheelbase = 1\.01600000/);
  assert.match(fixture, /head_angle = 1\.23879599/);
  assert.match(fixture, /trail = 0\.09096800/);
  assert.match(fixture, /gravity = 9\.80665000/);
  assert.match(fixture, /mrider = 80\.00000000/);
  // Guard against accidentally labeling the current, different browser preset as an exact port.
  const preset = html.slice(html.indexOf('schwinn: {'), html.indexOf('\n        }', html.indexOf('schwinn: {')));
  assert.match(preset, /wheelbase: 1\.076/);
  assert.match(preset, /JBike6 Schwinn Crown \(Original Default\)/);
  assert.notEqual(1.076, 1.016, 'web preset and MATLAB default must not be conflated');
});
