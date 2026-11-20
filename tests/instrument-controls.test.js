'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tokenizeMeasurements, precisionForStep, PARAMETER_RANGE_CONTROLS } = require('../instrument-controls.js');

function reconstruct(tokens) {
  return tokens.map(token => token.type === 'text'
    ? token.text
    : token.value + token.spacing + token.unit).join('');
}

test('compound wheel readouts retain inch and metric measurements in order', () => {
  const source = '29.2" (0.742 m)';
  const tokens = tokenizeMeasurements(source);
  assert.equal(reconstruct(tokens), source);
  assert.deepEqual(tokens.filter(token => token.type === 'measurement').map(token => [token.value, token.unit]), [
    ['29.2', '"'],
    ['0.742', 'm']
  ]);
});

test('dual speed readouts preserve both display and SI values', () => {
  const source = '14.5 mph (6.50 m/s)';
  const tokens = tokenizeMeasurements(source);
  assert.equal(reconstruct(tokens), source);
  assert.deepEqual(tokens.filter(token => token.type === 'measurement').map(token => [token.value, token.unit]), [
    ['14.5', 'mph'],
    ['6.50', 'm/s']
  ]);
});

test('compound torque and gain units use longest unit matches', () => {
  const cases = [
    ['+12.0 N·m/rad', 'N·m/rad'],
    ['+6.00 N·m·s/rad', 'N·m·s/rad'],
    ['+0.00 N·m/(rad·s)', 'N·m/(rad·s)'],
    ['9.80665 m/s² (Earth)', 'm/s²']
  ];
  for (const [source, expectedUnit] of cases) {
    const tokens = tokenizeMeasurements(source);
    assert.ok(tokens, source);
    assert.equal(reconstruct(tokens), source);
    assert.equal(tokens.find(token => token.type === 'measurement').unit, expectedUnit);
  }
});

test('readout parser keeps signs, degree marks, percentages, and spacing', () => {
  const cases = ['−64.0°', '-12.5 mm', '+0.038 m', '100%', '80.0 kg'];
  for (const source of cases) {
    const tokens = tokenizeMeasurements(source);
    assert.ok(tokens, source);
    assert.equal(reconstruct(tokens), source);
  }
});

test('text without a recognized measurement remains untouched', () => {
  assert.equal(tokenizeMeasurements('Waiting for model calculation…'), null);
  assert.equal(tokenizeMeasurements(''), null);
  assert.equal(tokenizeMeasurements(null), null);
});

test('key bicycle parameters expose direct numerical entry with explicit model units', () => {
  assert.deepEqual(PARAMETER_RANGE_CONTROLS, {
    sliderDf: 'm', sliderDr: 'm', sliderGyro: '%', sliderHta: '°',
    sliderWb: 'm', sliderOffset: 'mm', sliderTrail: 'mm',
    sliderRiderMass: 'kg', sliderRiderX: 'm', sliderRiderY: 'm',
    sliderFrontMass: 'kg', sliderFrontU: 'm'
  });
});

test('direct parameter entry precision follows the existing slider step', () => {
  assert.equal(precisionForStep('0.002'), 3);
  assert.equal(precisionForStep('0.1'), 1);
  assert.equal(precisionForStep('5'), 0);
  assert.equal(precisionForStep('any'), 3);
});
