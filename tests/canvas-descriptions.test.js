'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describeGeometry, describeRearView, describeTimeSeries, describeControlResponse } = require('../canvas-descriptions.js');
const DEG = Math.PI / 180;

test('geometry description states the numbers shown on the drawing', () => {
  const t = describeGeometry({ wheelbase: 1.25, headAngleDeg: 64, trailMm: 132, forkOffsetMm: 44, frontWheelM: 0.742, rearWheelM: 0.704, mode: '2d' });
  for (const s of ['1.250 m', '64.0 degrees', '132.0 mm', '44.0 mm', '29.2 inches', '27.7 inches', 'steering axis']) assert.ok(t.includes(s), s);
  assert.match(describeGeometry({ wheelbase: 1.25, headAngleDeg: 64, trailMm: 132, forkOffsetMm: 44, frontWheelM: 0.742, rearWheelM: 0.704, mode: '3d' }), /3D ride view/);
});

test('rear view description names the side of the lean and the steer', () => {
  assert.match(describeRearView({ leanDeg: 5.4, steerDeg: -19.3, t: 1.68, duration: 6 }), /at 1\.7 seconds of 6\.0 seconds\. The bike leans 5\.4 degrees to the right.*turned 19\.3 degrees to the left/);
  assert.match(describeRearView({ leanDeg: -2, steerDeg: 3, t: 0, duration: 6 }), /leans 2\.0 degrees to the left.*to the right/);
});

test('time series description gives the peaks and says how the line styles map to lean and steer', () => {
  const traj = Array.from({ length: 601 }, (_, i) => ({ t: i * 0.01, phi: 10 * DEG * Math.exp(-i * 0.01) * Math.cos(i * 0.03), delta: 4 * DEG * Math.exp(-i * 0.01) }));
  const t = describeTimeSeries({ traj, duration: 6, label: 'Lean and steer after a push', crashT: null });
  assert.match(t, /Lean is the solid line and steer is the dashed line/);
  assert.match(t, /Lean peaks at 10\.0 degrees to the right at 0\.0 seconds/);
  assert.match(t, /At the end the lean is/);
});

test('after a crash the description stops at the crash and does not quote meaningless larger angles', () => {
  const traj = [{ t: 0, phi: 0.1, delta: 0.05 }, { t: 1, phi: 0.3, delta: 0.2 }, { t: 1.93, phi: 0.79, delta: 0.3 }, { t: 3, phi: 1.5, delta: 1.4 }];
  const t = describeTimeSeries({ traj, duration: 6, label: 'Ride test', crashT: 1.93, crashLeanDeg: 45 });
  assert.match(t, /grows past 45 degrees at 1\.9 seconds, which counts as a crash/);
  assert.match(t, /Before the crash the steer reaches 17\.2 degrees/);   // 0.3 rad, not the 1.4 rad after the crash
  assert.ok(!/80\.|85\.|peaks/.test(t), 'no angles from after the crash: ' + t);
  assert.ok(!/At the end/.test(t));
});

test('an empty trajectory does not throw', () => {
  assert.match(describeTimeSeries({ traj: [], duration: 6, label: 'Ride test' }), /no data yet/);
});

test('every canvas that carries data has a role and a text alternative in the page', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const id of ['geomCanvas', 'rearViewCanvas', 'timeSeriesCanvas', 'controlResponseCanvas', 'rootCanvas', 'reactionCanvas']) {
    const tag = html.match(new RegExp('<canvas id="' + id + '"[^>]*>'));
    assert.ok(tag, id + ' not found');
    assert.ok(/aria-label=|aria-describedby=/.test(tag[0]), id + ' has no text alternative');
  }
  for (const id of ['geomDesc', 'rearViewDesc', 'timeSeriesDesc', 'controlResponseDesc']) assert.ok(html.includes('id="' + id + '"'), id + ' missing');
});

test('control response description compares lean without and with feedback', () => {
  const open = [{ t: 0, phi: 0.1 }, { t: 6, phi: 0.8 }], ctrl = [{ t: 0, phi: 0.1 }, { t: 1, phi: 0.12 }, { t: 6, phi: 0.001 }];
  const on = describeControlResponse({ openTraj: open, ctrlTraj: ctrl, duration: 6, feedbackEnabled: true });
  assert.match(on, /Without control the lean grows past 45 degrees, a crash/);
  assert.match(on, /With steer-torque feedback it peaks at 6\.9 degrees and ends at 0\.1 degrees/);
  const small = describeControlResponse({ openTraj: [{ t: 0, phi: 0.1 }, { t: 6, phi: 0.3 }], ctrlTraj: ctrl, duration: 6, feedbackEnabled: true });
  assert.match(small, /Without control the lean peaks at 17\.2 degrees/);
  assert.match(describeControlResponse({ openTraj: open, ctrlTraj: ctrl, duration: 6, feedbackEnabled: false }), /Feedback is off/);
});
