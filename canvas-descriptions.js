(function (root) {
  'use strict';

  // Text alternatives for the drawings that carry data. Each takes the live numbers and returns plain
  // sentences, so a screen-reader user gets what a sighted user reads off the chart.
  const f = (v, d) => Number(v).toFixed(d);
  const side = deg => (deg >= 0 ? 'right' : 'left');
  const INCH = 0.0254;

  function describeGeometry(o) {
    const base = 'Bicycle geometry. Wheelbase ' + f(o.wheelbase, 3) + ' m, head angle ' + f(o.headAngleDeg, 1) +
      ' degrees, trail ' + f(o.trailMm, 1) + ' mm, fork offset ' + f(o.forkOffsetMm, 1) + ' mm, front wheel ' +
      f(o.frontWheelM / INCH, 1) + ' inches, rear wheel ' + f(o.rearWheelM / INCH, 1) + ' inches.';
    const view = o.mode === '3d'
      ? ' The 3D ride view shows the bike leaning and steering through the ride test. The lean and steer angles are listed in the ride test chart.'
      : ' The side view shows both wheels, the dashed steering axis and the centers of mass. The same numbers are in the controls on the left.';
    return base + view;
  }

  function describeRearView(o) {
    const lean = Math.abs(o.leanDeg), steer = Math.abs(o.steerDeg);
    return 'Rear view of the ride test at ' + f(o.t, 1) + ' seconds of ' + f(o.duration, 1) + ' seconds. The bike leans ' +
      f(lean, 1) + ' degrees to the ' + side(o.leanDeg) + ' and the handlebars are turned ' + f(steer, 1) +
      ' degrees to the ' + side(o.steerDeg) + '.';
  }

  // traj: [{t, phi, delta}] in radians. label names the chart. After a crash the linear model keeps growing
  // to angles that mean nothing, so the description stops at the crash.
  function describeTimeSeries(o) {
    const traj = o.traj || [];
    if (!traj.length) return o.label + ': no data yet.';
    const R = 180 / Math.PI;
    const crashed = Number.isFinite(o.crashT);
    const shown = crashed ? traj.filter(p => p.t <= o.crashT + 1e-9) : traj;
    let peakLean = shown[0], peakSteer = shown[0];
    for (const p of shown) {
      if (Math.abs(p.phi) > Math.abs(peakLean.phi)) peakLean = p;
      if (Math.abs(p.delta) > Math.abs(peakSteer.delta)) peakSteer = p;
    }
    const last = traj[traj.length - 1];
    const parts = [o.label + ' over ' + f(o.duration, 1) + ' seconds. Lean is the solid line and steer is the dashed line.'];
    if (crashed) {
      parts.push('The lean grows past ' + o.crashLeanDeg + ' degrees at ' + f(o.crashT, 1) + ' seconds, which counts as a crash, and the chart stops being meaningful after that.');
      parts.push('Before the crash the steer reaches ' + f(Math.abs(peakSteer.delta) * R, 1) + ' degrees to the ' + side(peakSteer.delta) + '.');
    } else {
      parts.push('Lean peaks at ' + f(Math.abs(peakLean.phi) * R, 1) + ' degrees to the ' + side(peakLean.phi) + ' at ' + f(peakLean.t, 1) + ' seconds.');
      parts.push('Steer peaks at ' + f(Math.abs(peakSteer.delta) * R, 1) + ' degrees to the ' + side(peakSteer.delta) + ' at ' + f(peakSteer.t, 1) + ' seconds.');
      parts.push('At the end the lean is ' + f(Math.abs(last.phi) * R, 1) + ' degrees and the steer is ' + f(Math.abs(last.delta) * R, 1) + ' degrees.');
    }
    return parts.join(' ');
  }

  // Lean without control against lean with steer-torque feedback. Both are [{t, phi}] in radians.
  // The chart is cut off at the crash lean, so a larger peak is described as growing past it.
  function describeControlResponse(o) {
    const R = 180 / Math.PI, limit = o.crashLeanDeg || 45;
    const peak = traj => (traj || []).reduce((m, p) => Math.max(m, Math.abs(p.phi)), 0) * R;
    const end = traj => (traj && traj.length ? Math.abs(traj[traj.length - 1].phi) * R : 0);
    const say = traj => { const v = peak(traj); return v >= limit ? 'grows past ' + limit + ' degrees, a crash' : 'peaks at ' + f(v, 1) + ' degrees'; };
    let s = 'Lean angle over ' + f(o.duration, 1) + ' seconds after a push. Without control the lean ' + say(o.openTraj) + '.';
    if (o.feedbackEnabled) {
      s += ' With steer-torque feedback it ' + say(o.ctrlTraj) + (peak(o.ctrlTraj) >= limit ? '.' : ' and ends at ' + f(end(o.ctrlTraj), 1) + ' degrees.');
    } else {
      s += ' Feedback is off, so the controlled curve follows the uncontrolled one.';
    }
    return s;
  }

  const api = { describeGeometry, describeRearView, describeTimeSeries, describeControlResponse };
  if (root) root.JBike6CanvasDescriptions = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
