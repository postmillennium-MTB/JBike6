'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readStability, insightFor, READING_GUIDE } = require('../plain-language.js');
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

const base = { wheelDesc: '29" F / 27.5" R Mullet', Df: 0.742, Dr: 0.704, simulatePitch: true, autoScaleWheels: false, gyroPct: 100,
  trailMm: '132.0', headAngleDeg: 64, forkOffsetUMm: 28, g: 9.81, vw: 7, vc: 10, fmt: v => v.toFixed(1) + ' m/s' };

test('the mullet description states the axle drop and outcome without claiming a gyroscopic cause', () => {
  const text = insightFor(base);
  assert.match(text, /19\.0 mm lower than the front/);
  assert.match(text, /steadies itself above 7\.0 m\/s and up to 10\.0 m\/s/);
  assert.ok(!/gyroscopic resistance|spin inertia/.test(text), 'no unsupported gyroscopic claim: ' + text);
});

test('the spin-inertia remark appears only when auto-scaling actually changes the wheels', () => {
  assert.ok(!/spin inertia/.test(insightFor({ ...base, autoScaleWheels: false })));
  assert.match(insightFor({ ...base, autoScaleWheels: true }), /less mass and spin inertia/);
});

test('with the gyroscopic effect at 0% the text never talks about gyroscopic resistance, even for a mullet', () => {
  const text = insightFor({ ...base, gyroPct: 0 });
  assert.match(text, /gyroscopic effect is set to 0%/);
  assert.ok(!/smaller rear wheel/.test(text));
});

test('a bike that never steadies itself says a rider has to steer it', () => {
  assert.match(insightFor({ ...base, vw: null, vc: null }), /rider has to steer it/);
  assert.match(insightFor({ ...base, Dr: 0.742, vw: null, vc: null }), /does not steady itself/);
});

test('no capsize speed is described as the searched range, not as infinite', () => {
  const text = insightFor({ ...base, Dr: 0.742, vc: null });
  assert.match(text, /every higher speed that was searched/);
  assert.ok(!/infinite|unbounded/i.test(text));
});
