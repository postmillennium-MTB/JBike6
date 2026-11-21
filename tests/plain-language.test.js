'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readStability, READING_GUIDE } = require('../plain-language.js');
const fmt = v => v.toFixed(1) + ' m/s';

test('a bike with no weave speed is described as never balancing itself', () => {
  const r = readStability({ vw: null, vc: null, minSpeed: 0, maxSpeed: 12, testSpeed: 6.5, fmt });
  assert.equal(r.regime, 'none');
  assert.match(r.headline, /does not balance itself/);
  assert.match(r.testLine, /falls over/);
});

test('weave and capsize speeds give a self-stable window with three regimes', () => {
  const base = { vw: 4.4, vc: 6.0, minSpeed: 0, maxSpeed: 12, fmt };
  const low = readStability({ ...base, testSpeed: 2 });
  const mid = readStability({ ...base, testSpeed: 5 });
  const high = readStability({ ...base, testSpeed: 9 });
  assert.equal(low.regime, 'window');
  assert.match(low.headline, /4\.4 m\/s and 6\.0 m\/s/);
  assert.match(low.testLine, /weave wobble grows/);
  assert.match(mid.testLine, /rights itself/);
  assert.match(high.testLine, /slow capsize/);
  assert.equal(low.paragraphs.length, 3);
});

test('a weave speed with no capsize speed is stable to the top of the plot', () => {
  const r = readStability({ vw: 4.4, vc: null, minSpeed: 0, maxSpeed: 12, testSpeed: 8, fmt });
  assert.equal(r.regime, 'open');
  assert.match(r.paragraphs.join(' '), /top of this plot \(12\.0 m\/s\)/);
});

test('a capsize speed at or below the weave speed means no self-stable window', () => {
  const r = readStability({ vw: 6, vc: 5, minSpeed: 0, maxSpeed: 12, testSpeed: 6, fmt });
  assert.equal(r.regime, 'none');
});

test('the below-weave sentence is skipped when the plot starts above the weave speed', () => {
  const r = readStability({ vw: 0.5, vc: 6, minSpeed: 1, maxSpeed: 12, testSpeed: 3, fmt });
  assert.ok(!r.paragraphs.some(p => /Below 0\.5/.test(p)));
});

test('a test speed outside the plotted range produces no test line', () => {
  const r = readStability({ vw: 4, vc: 6, minSpeed: 0, maxSpeed: 12, testSpeed: 20, fmt });
  assert.equal(r.testLine, '');
});

test('the reading guide has four short statements', () => {
  assert.equal(READING_GUIDE.length, 4);
});
