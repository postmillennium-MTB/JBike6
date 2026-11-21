'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const cp = require('../crash-playback.js');
const DEG = Math.PI / 180;

// A lean that grows exponentially, sampled at 10 ms.
const traj = Array.from({ length: 601 }, (_, i) => ({ t: i * 0.01, phi: 5 * DEG * Math.exp(1.4 * i * 0.01) }));

test('findCrashIndex returns the first sample at or past the lean limit', () => {
  const i = cp.findCrashIndex(traj);
  assert.ok(i > 0);
  assert.ok(Math.abs(traj[i].phi) >= 45 * DEG);
  assert.ok(Math.abs(traj[i - 1].phi) < 45 * DEG);
});

test('findCrashIndex uses lean magnitude, so a fall to the left counts too', () => {
  const left = traj.map(p => ({ t: p.t, phi: -p.phi }));
  assert.equal(cp.findCrashIndex(left), cp.findCrashIndex(traj));
});

test('a bike that stays upright has no crash', () => {
  assert.equal(cp.findCrashIndex([{ t: 0, phi: 0.1 }, { t: 1, phi: 0.2 }]), -1);
  assert.equal(cp.findCrashIndex(null), -1);
});

test('playback runs at real time until slow motion starts, then eases down', () => {
  assert.equal(cp.playbackRate(0), 1);
  assert.equal(cp.playbackRate(cp.SLOW_START_DEG), 1);
  assert.ok(Math.abs(cp.playbackRate(cp.CRASH_LEAN_DEG) - cp.MIN_RATE) < 1e-12);
  let prev = 1;
  for (let d = 20; d <= 45; d += 1) {
    const r = cp.playbackRate(d);
    assert.ok(r <= prev + 1e-12 && r >= cp.MIN_RATE - 1e-12);
    prev = r;
  }
  assert.equal(cp.playbackRate(-45), cp.playbackRate(45));
});

function runToEnd(opts, maxSeconds = 30) {
  let state = { phase: 'run', t: 0 };
  const events = [], ts = [];
  for (let i = 0; i < maxSeconds * 60 && state.phase !== 'done'; i++) {
    const r = cp.advance(state, 1 / 60, opts);
    state = r.state; ts.push(state.t);
    if (r.event) events.push(r.event);
  }
  return { state, events, ts };
}

test('a crash slows down, holds, rewinds to the start, then stops there', () => {
  const crashT = traj[cp.findCrashIndex(traj)].t;
  const leanDegAt = t => Math.abs(traj[Math.min(traj.length - 1, Math.round(t / 0.01))].phi) / DEG;
  const { state, events, ts } = runToEnd({ crashT, duration: 6, leanDegAt, reducedMotion: false });
  assert.deepEqual(events, ['slow', 'crash', 'rewind', 'rewound']);
  assert.equal(state.phase, 'done');
  assert.equal(state.t, 0);
  assert.ok(Math.max(...ts) <= crashT + 1e-9, 'never plays past the crash');
});

test('slow motion makes the approach take longer than real time', () => {
  const crashT = traj[cp.findCrashIndex(traj)].t;
  const leanDegAt = t => Math.abs(traj[Math.min(traj.length - 1, Math.round(t / 0.01))].phi) / DEG;
  let state = { phase: 'run', t: 0 }, frames = 0;
  while (state.phase === 'run' && frames < 3000) { state = cp.advance(state, 1 / 60, { crashT, duration: 6, leanDegAt }).state; frames++; }
  assert.equal(state.phase, 'hold');
  assert.ok(frames / 60 > crashT * 1.2, 'wall-clock time to crash exceeds simulated time');
});

test('the rewind moves backward monotonically', () => {
  const crashT = 1.9;
  let state = { phase: 'rewind', t: crashT, rewindElapsed: 0 };
  let prev = crashT;
  for (let i = 0; i < 200 && state.phase === 'rewind'; i++) {
    state = cp.advance(state, 1 / 60, { crashT, duration: 6, leanDegAt: () => 45 }).state;
    assert.ok(state.t <= prev + 1e-12);
    prev = state.t;
  }
  assert.equal(state.t, 0);
});

test('reduced motion jumps straight back to the start after the hold', () => {
  const crashT = traj[cp.findCrashIndex(traj)].t;
  const leanDegAt = t => Math.abs(traj[Math.min(traj.length - 1, Math.round(t / 0.01))].phi) / DEG;
  const { events, state } = runToEnd({ crashT, duration: 6, leanDegAt, reducedMotion: true });
  assert.ok(!events.includes('rewind'));
  assert.equal(events[events.length - 1], 'rewound');
  assert.equal(state.t, 0);
});

test('a ride with no crash plays at real time and completes', () => {
  const { events, state } = runToEnd({ crashT: null, duration: 2, leanDegAt: () => 0 });
  assert.deepEqual(events, ['complete']);
  assert.ok(Math.abs(state.t - 2) < 1e-9);
});
