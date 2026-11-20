(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6AppRegressions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function integralClosedLoopCoefficients(values) {
    const required = ['c4', 'c3', 'c2', 'c1', 'c0', 'a2_12', 'a1_12', 'a0_12', 'ki'];
    if (!values || required.some(key => !Number.isFinite(values[key]))) {
      throw new TypeError('Finite closed-loop polynomial coefficients and integral gain are required.');
    }
    const { c4, c3, c2, c1, c0, a2_12, a1_12, a0_12, ki } = values;
    // Coefficients of s*det(P_PD(s)) + Ki*P_12(s), in descending powers.
    return [
      c4,
      c3,
      c2,
      c1 + ki * a2_12,
      c0 + ki * a1_12,
      ki * a0_12
    ];
  }

  function normalizeWheelPitchReference(params, imported) {
    if (!params || typeof params !== 'object') {
      throw new TypeError('Bicycle parameters are required to normalize wheel-pitch references.');
    }
    const source = imported || {};
    if (!Number.isFinite(source.refDf)) {
      params.refDf = Number.isFinite(source.Df) ? source.Df : params.Df;
    }
    if (!Number.isFinite(source.refDr)) {
      params.refDr = Number.isFinite(source.Dr) ? source.Dr : params.Dr;
    }
    return params;
  }

  function relativeAxleDrop(refDf, refDr, newDf, newDr) {
    const values = [refDf, refDr, newDf, newDr];
    if (values.some(value => !Number.isFinite(value) || value <= 0)) {
      throw new TypeError('Reference and current wheel diameters must be positive finite values.');
    }
    return ((refDr - newDr) - (refDf - newDf)) * 0.5;
  }

  async function copyTextToClipboard(text, options) {
    const opts = options || {};
    const clipboard = opts.clipboard;
    const documentRef = opts.documentRef;
    const textArea = opts.textArea;
    const value = String(text == null ? '' : text);

    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(value);
        return 'clipboard';
      } catch (_) {
        // Continue to the legacy selection-based fallback below.
      }
    }

    if (!documentRef || !textArea || typeof documentRef.execCommand !== 'function' ||
        typeof textArea.select !== 'function') {
      throw new Error('Clipboard access is unavailable in this browser context.');
    }

    const previousActive = documentRef.activeElement;
    const previousStart = typeof textArea.selectionStart === 'number' ? textArea.selectionStart : null;
    const previousEnd = typeof textArea.selectionEnd === 'number' ? textArea.selectionEnd : null;

    if (typeof textArea.focus === 'function') textArea.focus();
    textArea.select();
    let copied = false;
    try {
      copied = documentRef.execCommand('copy') === true;
    } catch (_) {
      copied = false;
    }

    try {
      if (previousStart !== null && previousEnd !== null && typeof textArea.setSelectionRange === 'function') {
        textArea.setSelectionRange(previousStart, previousEnd);
      }
      if (previousActive && typeof previousActive.focus === 'function') previousActive.focus();
    } catch (_) {
      // Restoring focus/selection is best effort and does not affect copy status.
    }

    if (!copied) throw new Error('The browser did not confirm that the text was copied.');
    return 'fallback';
  }

  return {
    integralClosedLoopCoefficients,
    relativeAxleDrop,
    normalizeWheelPitchReference,
    copyTextToClipboard
  };
});
