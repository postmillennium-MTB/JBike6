'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const rt = require('../reaction-time.js');

test('doubling time is ln(2) divided by the growth rate', () => {
  assert.ok(Math.abs(rt.doublingTime(1.4450) - Math.LN2 / 1.4450) < 1e-12);
  assert.ok(Math.abs(rt.doublingTime(1) - 0.693147) < 1e-5);
});

test('decaying, neutral and invalid growth rates have no doubling time', () => {
  assert.equal(rt.doublingTime(-0.5), null);
  assert.equal(rt.doublingTime(0), null);
  assert.equal(rt.doublingTime(1e-9), null);
  assert.equal(rt.doublingTime(NaN), null);
  assert.equal(rt.doublingTime(undefined), null);
});

test('describe words an unstable bike in seconds and a stable bike as steady', () => {
  const g = rt.describe(1.445);
  assert.equal(g.growing, true);
  assert.equal(g.value, '0.48 s');
  assert.match(g.text, /doubles in about 0\.48 s/);
  const s = rt.describe(-2);
  assert.equal(s.growing, false);
  assert.equal(s.value, 'Nothing grows');
});

test('slow growth is reported in plain units', () => {
  assert.equal(rt.formatTime(12.4), '12 s');
  assert.equal(rt.formatTime(400), 'over a minute');
  assert.equal(rt.formatTime(Infinity), '—');
});

test('sweep maps a speed sweep and leaves gaps where the bike is stable', () => {
  const out = rt.sweep([{ v: 1, maxRe: 2 }, { v: 2, maxRe: -1 }, { v: 3, maxRe: 0.5 }]);
  assert.equal(out.length, 3);
  assert.ok(Math.abs(out[0].t - Math.LN2 / 2) < 1e-12);
  assert.equal(out[1].t, null);
  assert.ok(Math.abs(out[2].t - Math.LN2 / 0.5) < 1e-12);
  assert.deepEqual(rt.sweep(null), []);
});
