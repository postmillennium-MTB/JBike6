'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  sampleResponse,
  findWorstResponse,
  niceStep,
  responseDomain
} = require('../design-optimization.js');

test('speed response samples retain speed coordinates and finite values', () => {
  const speeds = [2, 4, 6];
  const series = sampleResponse(speeds, speed => -0.2 + speed / 100);
  assert.deepEqual(series, [
    { speed: 2, value: -0.18 },
    { speed: 4, value: -0.16 },
    { speed: 6, value: -0.14 }
  ]);
});

test('invalid speed samples become gaps rather than fabricated values', () => {
  const series = sampleResponse([1, 2, 3], speed => {
    if (speed === 2) throw new Error('invalid operating point');
    return speed === 3 ? NaN : 0.1;
  });
  assert.deepEqual(series, [
    { speed: 1, value: 0.1 },
    { speed: 2, value: null },
    { speed: 3, value: null }
  ]);
});

test('worst response means the largest real part, even when all values are negative', () => {
  const series = [
    { speed: 2, value: -0.35 },
    { speed: 4, value: -0.08 },
    { speed: 6, value: -0.21 }
  ];
  assert.deepEqual(findWorstResponse(series), { speed: 4, value: -0.08 });
  assert.equal(findWorstResponse([{ speed: 2, value: null }]), null);
});

test('nice axis steps use readable 1-2-5 increments', () => {
  assert.equal(niceStep(0.13), 0.2);
  assert.equal(niceStep(0.35), 0.5);
  assert.equal(niceStep(2.4), 5);
});

test('response domain includes the neutral boundary and every finite sample', () => {
  const domain = responseDomain([
    [{ speed: 2, value: -0.37 }, { speed: 4, value: -0.12 }],
    [{ speed: 2, value: 0.04 }, { speed: 4, value: 0.29 }]
  ]);
  assert.ok(domain.min <= -0.37);
  assert.ok(domain.max >= 0.29);
  assert.ok(domain.min < 0 && domain.max > 0);
  assert.ok(domain.ticks.includes(0));
  assert.ok(domain.step > 0);
});

test('empty response domain has a finite symmetric fallback', () => {
  const domain = responseDomain([[{ speed: 2, value: null }]]);
  assert.deepEqual([domain.min, domain.max], [-1, 1]);
  assert.ok(domain.ticks.every(Number.isFinite));
});
