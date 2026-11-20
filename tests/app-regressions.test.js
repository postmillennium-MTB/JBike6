'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  integralClosedLoopCoefficients,
  relativeAxleDrop,
  copyTextToClipboard
} = require('../app-regressions.js');

test('integral closed-loop polynomial keeps Ki terms at their correct powers', () => {
  const coefficients = integralClosedLoopCoefficients({
    c4: 2, c3: 3, c2: 5, c1: 7, c0: 11,
    a2_12: 13, a1_12: 17, a0_12: 19, ki: 0.5
  });
  assert.deepEqual(coefficients, [2, 3, 5, 13.5, 19.5, 9.5]);
  // P(0) is the final coefficient. A nonzero value means s=0 is not
  // artificially forced to be a root by a trailing zero coefficient.
  assert.equal(coefficients.at(-1), 0.5 * 19);
  assert.notEqual(coefficients.at(-1), 0);
});

test('relative axle drop accounts for both front and rear wheel changes', () => {
  const refFront = 0.742, refRear = 0.704;
  assert.ok(Math.abs(relativeAxleDrop(refFront, refRear, refFront, 0.684) - 0.010) < 1e-12);
  assert.ok(Math.abs(relativeAxleDrop(refFront, refRear, 0.722, refRear) + 0.010) < 1e-12);
  assert.ok(Math.abs(relativeAxleDrop(refFront, refRear, 0.722, 0.684)) < 1e-12);
  assert.equal(relativeAxleDrop(refFront, refRear, refFront, refRear), 0);
});

test('relative axle drop rejects invalid or missing wheel diameters', () => {
  assert.throws(() => relativeAxleDrop(0.7, 0.7, NaN, 0.7), /positive finite/);
  assert.throws(() => relativeAxleDrop(0, 0.7, 0.7, 0.7), /positive finite/);
});

test('clipboard helper prefers the modern API', async () => {
  let written = null, legacyCalls = 0;
  const result = await copyTextToClipboard('bike config', {
    clipboard: { writeText: async value => { written = value; } },
    documentRef: { execCommand: () => { legacyCalls++; return true; } },
    textArea: { select() {} }
  });
  assert.equal(result, 'clipboard');
  assert.equal(written, 'bike config');
  assert.equal(legacyCalls, 0);
});

test('clipboard helper falls back when the modern API rejects', async () => {
  let legacyCommand = null, selected = false;
  const textArea = {
    selectionStart: 0, selectionEnd: 0,
    focus() {},
    select() { selected = true; },
    setSelectionRange() {}
  };
  const result = await copyTextToClipboard('saved config', {
    clipboard: { writeText: async () => { throw new Error('permission denied'); } },
    documentRef: { activeElement: null, execCommand: command => { legacyCommand = command; return true; } },
    textArea
  });
  assert.equal(result, 'fallback');
  assert.equal(selected, true);
  assert.equal(legacyCommand, 'copy');
});

test('clipboard helper reports failure when neither method succeeds', async () => {
  await assert.rejects(
    copyTextToClipboard('config', {
      clipboard: { writeText: async () => { throw new Error('denied'); } },
      documentRef: { execCommand: () => false },
      textArea: { select() {} }
    }),
    /did not confirm/
  );
  await assert.rejects(copyTextToClipboard('config', {}), /unavailable/);
});
