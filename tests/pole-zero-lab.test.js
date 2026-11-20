'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { matchRootsToPrevious, buildTracks, classifyPole } = require('../pole-zero-lab.js');

test('root matching preserves branch identity when solver order changes', () => {
  const previous = [{ re: -2, im: 3 }, { re: -2, im: -3 }, { re: 0.5, im: 0 }, { re: -5, im: 0 }];
  const shuffled = [{ re: -4.9, im: 0.02 }, { re: -2.05, im: -2.9 }, { re: 0.45, im: 0.01 }, { re: -1.95, im: 3.1 }];
  const ordered = matchRootsToPrevious(previous, shuffled);
  assert.ok(Math.abs(ordered[0].im - 3.1) < 0.2);
  assert.ok(Math.abs(ordered[1].im + 2.9) < 0.2);
  assert.ok(Math.abs(ordered[2].re - 0.45) < 0.2);
  assert.ok(Math.abs(ordered[3].re + 4.9) < 0.2);
});

test('buildTracks creates continuous tracks for conjugate branches', () => {
  const samples = [
    { v: 0, poles: [{ re: -1, im: 2 }, { re: -1, im: -2 }] },
    { v: 1, poles: [{ re: -0.8, im: -1.8 }, { re: -0.8, im: 1.8 }] },
    { v: 2, poles: [{ re: -0.6, im: 1.6 }, { re: -0.6, im: -1.6 }] }
  ];
  const tracks = buildTracks(samples, 'poles');
  assert.equal(tracks.length, 2);
  assert.ok(tracks.every(track => track.length === 3));
  assert.ok(tracks[0][0].im * tracks[0][2].im > 0);
  assert.ok(tracks[1][0].im * tracks[1][2].im > 0);
});

test('pole classification distinguishes stable, marginal, and unstable roots', () => {
  assert.equal(classifyPole({ re: -0.1 }), 'stable');
  assert.equal(classifyPole({ re: 0 }), 'marginal');
  assert.equal(classifyPole({ re: 0.1 }), 'unstable');
});
