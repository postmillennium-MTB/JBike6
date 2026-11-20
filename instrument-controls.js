/* Precision-control affordances. IDs and native input semantics remain unchanged. */
(function () {
  'use strict';
  const UNIT_MAP = {
    inputMinVel: 'm/s', inputMaxVel: 'm/s', inputVelSteps: 'SAMPLES',
    inputGravity: 'm/s²', landscapeXMin: '', landscapeXMax: '',
    landscapeYMin: '', landscapeYMax: '', optXMin: '', optXMax: '',
    optYMin: '', optYMax: '', optSpeedMin: 'm/s', optSpeedMax: 'm/s'
  };
  const RANGE_AXIS_MAP = {
    landscapeXAxis: ['landscapeXMin', 'landscapeXMax'],
    landscapeYAxis: ['landscapeYMin', 'landscapeYMax'],
    optXAxis: ['optXMin', 'optXMax'],
    optYAxis: ['optYMin', 'optYMax']
  };
  function selectedUnit(select) {
    if (!select || !select.selectedOptions || !select.selectedOptions[0]) return '';
    const match = select.selectedOptions[0].textContent.match(/\(([^)]+)\)\s*$/);
    return match ? match[1].trim() : '';
  }
  function decorateNumberInput(input) {
    if (!input || input.dataset.instrumentDecorated === 'true') return;
    const wrapper = document.createElement('span');
    wrapper.className = 'instrument-input-wrap';
    const unit = document.createElement('span');
    unit.className = 'instrument-unit';
    unit.setAttribute('aria-hidden', 'true');
    const currentUnit = UNIT_MAP[input.id];
    if (currentUnit) unit.textContent = currentUnit;
    input.inputMode = 'decimal';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.append(input, unit);
    input.dataset.instrumentDecorated = 'true';
    input.dataset.instrumentUnitTarget = input.id;
  }
  function setUnit(id, value) {
    const input = document.getElementById(id);
    const wrapper = input && input.closest('.instrument-input-wrap');
    const unit = wrapper && wrapper.querySelector('.instrument-unit');
    if (unit) {
      unit.textContent = value || '';
      unit.classList.toggle('is-empty', !value);
      input.style.paddingRight = value ? '' : '8px';
    }
  }
  function decorate() {
    Object.keys(UNIT_MAP).forEach(id => decorateNumberInput(document.getElementById(id)));
    ['inputMinVel', 'inputMaxVel'].forEach(id => {
      const input = document.getElementById(id);
      const label = input && input.parentElement.querySelector('label');
      if (label) label.textContent = label.textContent.replace(/\s*\([^)]*\)\s*$/, '');
    });
    ['optSpeedMin', 'optSpeedMax'].forEach(id => {
      const input = document.getElementById(id);
      const label = input && input.parentElement.querySelector('span');
      if (label) label.textContent = label.textContent.replace(/\s*\([^)]*\)\s*$/, '');
    });
    Object.entries(RANGE_AXIS_MAP).forEach(([selectId, inputIds]) => {
      const select = document.getElementById(selectId);
      if (!select) return;
      const update = () => inputIds.forEach(id => setUnit(id, selectedUnit(select)));
      select.addEventListener('change', update);
      if (typeof MutationObserver === 'function') {
        const observer = new MutationObserver(update);
        observer.observe(select, { childList: true });
      }
      update();
    });
    document.querySelectorAll('input[type="range"]').forEach(input => {
      const update = () => {
        const min = Number(input.min || 0), max = Number(input.max || 100), value = Number(input.value);
        const fraction = Number.isFinite(value) && max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
        input.style.setProperty('--range-progress', (fraction * 100).toFixed(2) + '%');
      };
      input.addEventListener('input', update, { passive: true });
      input.addEventListener('change', update, { passive: true });
      update();
    });
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('focus', () => input.select && input.select());
    });
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate, { once: true });
    else decorate();
  }
})();
