(function (root) {
  'use strict';

  // The ride test is a linear model, so the lean keeps growing after a real bike would be on the
  // ground. We call it a crash when lean passes CRASH_LEAN_DEG, the same limit the lean chart uses.
  const CRASH_LEAN_DEG = 45;
  const SLOW_START_DEG = 20;   // slow motion begins here
  const MIN_RATE = 0.12;       // playback speed as the lean reaches the crash limit
  const HOLD_SECONDS = 0.9;    // pause on the crash before rewinding
  const REWIND_SECONDS = 1.4;  // real time taken to run back to the start

  function findCrashIndex(trajectory, limitDeg) {
    const limit = (limitDeg === undefined ? CRASH_LEAN_DEG : limitDeg) * Math.PI / 180;
    if (!Array.isArray(trajectory)) return -1;
    for (let i = 0; i < trajectory.length; i++) {
      if (Math.abs(trajectory[i].phi) >= limit) return i;
    }
    return -1;
  }

  function smoothstep(x) {
    const c = Math.min(1, Math.max(0, x));
    return c * c * (3 - 2 * c);
  }

  // 1 = real time. Falls smoothly to MIN_RATE as the lean approaches the crash limit.
  function playbackRate(leanDeg) {
    const f = (Math.abs(leanDeg) - SLOW_START_DEG) / (CRASH_LEAN_DEG - SLOW_START_DEG);
    return 1 - (1 - MIN_RATE) * smoothstep(f);
  }

  // Advances playback by dtSec of real time. Pure: returns a new state and an optional event.
  // state: { phase: 'run' | 'hold' | 'rewind' | 'done', t, holdLeft, rewindElapsed, slowShown }
  // opts: { crashT (seconds or null), duration, leanDegAt(t), reducedMotion }
  function advance(state, dtSec, opts) {
    const s = Object.assign({ holdLeft: 0, rewindElapsed: 0, slowShown: false }, state);
    let event = null;
    if (s.phase === 'run') {
      const hasCrash = Number.isFinite(opts.crashT);
      const rate = hasCrash ? playbackRate(opts.leanDegAt(s.t)) : 1;
      if (hasCrash && rate < 1 && !s.slowShown) { s.slowShown = true; event = 'slow'; }
      s.t += dtSec * rate;
      if (hasCrash && s.t >= opts.crashT) {
        s.t = opts.crashT; s.phase = 'hold'; s.holdLeft = HOLD_SECONDS; event = 'crash';
      } else if (s.t >= opts.duration) {
        s.t = opts.duration; s.phase = 'done'; event = 'complete';
      }
    } else if (s.phase === 'hold') {
      s.holdLeft -= dtSec;
      if (s.holdLeft <= 0) {
        if (opts.reducedMotion) { s.t = 0; s.phase = 'done'; event = 'rewound'; }
        else { s.phase = 'rewind'; s.rewindElapsed = 0; event = 'rewind'; }
      }
    } else if (s.phase === 'rewind') {
      s.rewindElapsed += dtSec;
      const p = Math.min(1, s.rewindElapsed / REWIND_SECONDS);
      s.t = opts.crashT * (1 - smoothstep(p));
      if (p >= 1) { s.t = 0; s.phase = 'done'; event = 'rewound'; }
    }
    return { state: s, event };
  }

  const api = { CRASH_LEAN_DEG, SLOW_START_DEG, MIN_RATE, HOLD_SECONDS, REWIND_SECONDS, findCrashIndex, playbackRate, advance };
  if (root) root.JBike6CrashPlayback = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
