(function (root) {
  'use strict';

  // Growth of an unstable motion is exp(a t), where a is the largest real part of the
  // eigenvalues (1/s). A small lean or wobble therefore doubles in ln(2) / a seconds.
  // This describes the bike with nobody steering. It is not a model of a rider.
  const GROWTH_EPS = 1e-6;

  function doublingTime(maxRe) {
    if (!Number.isFinite(maxRe) || maxRe <= GROWTH_EPS) return null;
    return Math.LN2 / maxRe;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '—';
    if (seconds >= 60) return 'over a minute';
    if (seconds >= 10) return seconds.toFixed(0) + ' s';
    return seconds.toFixed(2) + ' s';
  }

  function describe(maxRe) {
    const t = doublingTime(maxRe);
    if (t === null) {
      return {
        growing: false, seconds: null, value: 'Nothing grows',
        text: 'At this speed every motion fades on its own, so the bike steadies itself.'
      };
    }
    return {
      growing: true, seconds: t, value: formatTime(t),
      text: 'A small lean or wobble doubles in about ' + formatTime(t) + ' if nobody steers.'
    };
  }

  // Doubling time at each sampled speed. Stable speeds give null, which plots as a gap.
  function sweep(sweepData) {
    return (sweepData || []).map(step => ({ v: step.v, t: doublingTime(step.maxRe) }));
  }

  const api = { doublingTime, formatTime, describe, sweep, GROWTH_EPS };
  if (root) root.JBike6ReactionTime = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
