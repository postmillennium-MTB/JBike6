(function (root) {
  'use strict';

  // Turns the stability analysis into a plain-English reading of the root-locus plot.
  // Speeds are in m/s; `fmt` formats a speed in the user's chosen unit.
  function readStability(input) {
    const { vw, vc, minSpeed, maxSpeed, testSpeed, fmt } = input;
    const f = typeof fmt === 'function' ? fmt : v => String(v);
    const hasVw = Number.isFinite(vw) && vw < maxSpeed;
    const hasVc = Number.isFinite(vc) && vc <= maxSpeed;
    const windowExists = hasVw && (!hasVc || vc > vw);
    const out = { headline: '', paragraphs: [], testLine: '', regime: 'none' };

    if (!windowExists) {
      out.regime = 'none';
      out.headline = 'This bike does not balance itself at any speed in this range.';
      out.paragraphs.push(
        'Left alone, it falls over at every speed from ' + f(minSpeed) + ' to ' + f(maxSpeed) +
        '. A rider keeps it upright by steering into the lean.'
      );
    } else if (hasVc) {
      out.regime = 'window';
      out.headline = 'It balances itself between ' + f(vw) + ' and ' + f(vc) + '.';
      if (vw > minSpeed) {
        out.paragraphs.push('Below ' + f(vw) + ', the front end wobbles in a weave that keeps growing, so the bike needs steering input.');
      }
      out.paragraphs.push(
        'Between ' + f(vw) + ' and ' + f(vc) + ', both the wobble and the lean die out on their own and the bike rights itself hands-free.'
      );
      out.paragraphs.push(
        'Above ' + f(vc) + ', a slow capsize takes over: the bike gradually leans further into an ever-tighter turn. It is slow enough that a rider corrects it without noticing.'
      );
    } else {
      out.regime = 'open';
      out.headline = 'It balances itself from ' + f(vw) + ' upward.';
      if (vw > minSpeed) {
        out.paragraphs.push('Below ' + f(vw) + ', the front end wobbles in a weave that keeps growing, so the bike needs steering input.');
      }
      out.paragraphs.push(
        'From ' + f(vw) + ' to the top of this plot (' + f(maxSpeed) + '), the wobble and the lean both die out on their own.'
      );
    }

    if (Number.isFinite(testSpeed) && testSpeed >= minSpeed && testSpeed <= maxSpeed) {
      const s = 'At your test speed of ' + f(testSpeed) + ', ';
      if (!windowExists) out.testLine = s + 'the bike falls over if nobody steers.';
      else if (testSpeed < vw) out.testLine = s + 'the weave wobble grows. The ride test should show an oscillation getting bigger.';
      else if (hasVc && testSpeed > vc) out.testLine = s + 'the slow capsize is active. The ride test should show a gradual lean without wobbling.';
      else out.testLine = s + 'the bike rights itself. The ride test should settle back upright.';
    }
    return out;
  }

  // One or two sentences under the readouts describing the current setup. It states what the model
  // computes. It does not claim a cause the model has not demonstrated.
  function insightFor(o) {
    const f = o.fmt;
    const hasVw = o.vw !== null && o.vw !== undefined;
    const hasVc = o.vc !== null && o.vc !== undefined;
    const outcome = hasVw
      ? 'In this model the bike steadies itself above ' + f(o.vw) +
        (hasVc ? ' and up to ' + f(o.vc) + '.' : ' at every higher speed that was searched.')
      : 'In this model it does not steady itself at any speed in range, so a rider has to steer it.';
    if (o.gyroPct === 0) {
      return 'Wheel gyroscopic effect is set to 0%. ' + (hasVw
        ? 'Trail (' + o.trailMm + ' mm) and the front assembly\u2019s mass offset (' + Math.round(o.forkOffsetUMm) +
          ' mm) alone still steer the bike into a lean. ' + outcome
        : 'Trail (' + o.trailMm + ' mm) and the front assembly\u2019s mass offset do not steady the bike without it. ' + outcome);
    }
    if (o.Df > o.Dr + 0.015) {
      const dropMm = ((o.Df - o.Dr) * 0.5 * 1000).toFixed(1);
      return 'Running a ' + o.wheelDesc + ' setup: the smaller rear wheel puts the rear axle ' + dropMm + ' mm lower than the front, ' +
        (o.simulatePitch ? 'which pitches the frame backward and slackens the head angle to ' + o.headAngleDeg.toFixed(1) + '\u00b0, ' : '') +
        'giving ' + o.trailMm + ' mm of trail. ' +
        (o.autoScaleWheels ? 'With auto-scaling on, the smaller wheel also has less mass and spin inertia, so its gyroscopic term is weaker. ' : '') +
        outcome;
    }
    return o.wheelDesc + ' with ' + o.headAngleDeg.toFixed(1) + '\u00b0 head angle and ' + o.trailMm + ' mm of trail at g = ' + o.g + ' m/s\u00b2. ' +
      (hasVw
        ? 'The low-speed weave wobble dies out above ' + f(o.vw) + '. ' + (hasVc
          ? 'The bike steadies itself over a ' + f(o.vc - o.vw) + ' wide band, then a slow capsize begins at ' + f(o.vc) + '.'
          : 'It stays steady at every higher speed that was searched.')
        : 'The bike does not steady itself at any speed in range.');
  }

  const READING_GUIDE = [
    'Each dot is one of the bike’s four natural motions at that speed.',
    'Filled red dots show whether a motion grows (above the zero line) or fades (below it).',
    'Hollow green rings above or below the zero line mean a motion oscillates, like a wobble. Rings on the zero line mean it does not, like a plain fall.',
    'The shaded band is where every motion fades, so the bike steadies itself.'
  ];

  const api = { readStability, insightFor, READING_GUIDE };
  if (root) root.JBike6PlainLanguage = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
