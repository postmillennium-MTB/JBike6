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
  const PARAMETER_RANGE_CONTROLS = {
    sliderDf: 'm', sliderDr: 'm', sliderGyro: '%', sliderHta: '°',
    sliderWb: 'm', sliderOffset: 'mm', sliderTrail: 'mm',
    sliderRiderMass: 'kg', sliderRiderX: 'm', sliderRiderY: 'm',
    sliderFrontMass: 'kg', sliderFrontU: 'm'
  };
  const PARAMETER_ENTRIES = Object.create(null);

  function precisionForStep(step) {
    const text = String(step || '1').toLowerCase();
    if (text === 'any') return 3;
    const mantissa = text.split('e')[0];
    return Math.min(6, (mantissa.split('.')[1] || '').length);
  }

  function syncParameterEntries() {
    Object.entries(PARAMETER_ENTRIES).forEach(([sliderId, entry]) => {
      const slider = document.getElementById(sliderId);
      if (!slider || !entry || document.activeElement === entry.input) return;
      const value = Number(slider.value);
      if (Number.isFinite(value)) entry.input.value = value.toFixed(entry.digits);
      entry.input.removeAttribute('aria-invalid');
      entry.wrap.classList.remove('is-invalid');
    });
  }

  function decorateParameterRange(sliderId, unit) {
    const slider = document.getElementById(sliderId);
    const group = slider && slider.closest('.ctrl-group');
    const row = group && group.querySelector('.ctrl-label-row');
    const label = row && row.querySelector('.ctrl-label');
    const output = row && row.querySelector('.ctrl-val');
    if (!slider || !row || !label || !output || slider.dataset.parameterEntryReady === 'true') return;

    const digits = precisionForStep(slider.step);
    const wrap = document.createElement('span');
    wrap.className = 'parameter-entry-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'parameter-entry-input';
    input.min = slider.min;
    input.max = slider.max;
    input.step = slider.step || 'any';
    input.required = true;
    input.inputMode = 'decimal';
    input.value = Number(slider.value).toFixed(digits);
    input.setAttribute('aria-label', label.textContent.trim() + ' exact value in ' + unit);
    input.title = 'Allowed range: ' + slider.min + ' to ' + slider.max + ' ' + unit + '; step ' + slider.step;
    const unitLabel = document.createElement('small');
    unitLabel.className = 'parameter-entry-unit';
    unitLabel.textContent = unit;
    unitLabel.setAttribute('aria-hidden', 'true');
    wrap.append(input, unitLabel);
    row.append(wrap);
    output.classList.add('sr-only');

    const sync = () => {
      if (document.activeElement !== input) {
        const value = Number(slider.value);
        if (Number.isFinite(value)) input.value = value.toFixed(digits);
      }
      input.removeAttribute('aria-invalid');
      wrap.classList.remove('is-invalid');
    };
    const commit = () => {
      if (input.value === '' || !input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        wrap.classList.add('is-invalid');
        input.title = 'Enter a value from ' + slider.min + ' to ' + slider.max + ' ' + unit + ' in steps of ' + slider.step + '.';
        return;
      }
      const value = Number(input.value);
      if (!Number.isFinite(value)) {
        input.setAttribute('aria-invalid', 'true');
        wrap.classList.add('is-invalid');
        return;
      }
      slider.value = String(value);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      syncParameterEntries();
    };
    input.addEventListener('change', commit);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit();
        input.blur();
      }
      if (event.key === 'Escape') {
        sync();
        input.blur();
      }
    });
    input.addEventListener('input', () => {
      if (input.value !== '' && input.checkValidity()) {
        input.removeAttribute('aria-invalid');
        wrap.classList.remove('is-invalid');
      }
    });
    slider.addEventListener('input', sync, { passive: true });
    slider.dataset.parameterEntryReady = 'true';
    PARAMETER_ENTRIES[sliderId] = { input, wrap, digits };
  }
  function selectedUnit(select) {
    if (!select || !select.selectedOptions || !select.selectedOptions[0]) return '';
    const match = select.selectedOptions[0].textContent.match(/\(([^)]+)\)\s*$/);
    return match ? match[1].trim() : '';
  }
  function tokenizeMeasurements(raw) {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    const expression = new RegExp(
      '([+−-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?)(\\s*)(N·m·s/rad|N·m/\\(rad·s\\)|N·m/rad|N·m|m/s²|km/h|m/s|mph|mm|kg|Hz|rad|m|s|°|%|")',
      'gi'
    );
    const tokens = [];
    let cursor = 0;
    let match;
    let found = false;
    while ((match = expression.exec(raw)) !== null) {
      found = true;
      if (match.index > cursor) tokens.push({ type: 'text', text: raw.slice(cursor, match.index) });
      tokens.push({ type: 'measurement', value: match[1], spacing: match[2], unit: match[3] });
      cursor = match.index + match[0].length;
    }
    if (!found) return null;
    if (cursor < raw.length) tokens.push({ type: 'text', text: raw.slice(cursor) });
    return tokens;
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
    unit.classList.toggle('is-empty', !currentUnit);
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
  function decorateReadout(element) {
    if (!element) return;
    const raw = element.textContent.trim();
    if (!raw || element.dataset.instrumentReadout === raw) return;
    const tokens = tokenizeMeasurements(raw);
    if (!tokens) return;

    const fragments = [];
    tokens.forEach(token => {
      if (token.type === 'text') {
        fragments.push(document.createTextNode(token.text));
        return;
      }
      const value = document.createElement('span');
      value.className = 'instrument-readout-value';
      value.textContent = token.value;
      fragments.push(value);
      if (token.spacing) fragments.push(document.createTextNode(token.spacing));
      const unit = document.createElement('small');
      unit.className = 'instrument-readout-unit';
      unit.textContent = token.unit;
      fragments.push(unit);
    });

    element.replaceChildren(...fragments);
    element.dataset.instrumentReadout = raw;
  }
  function decorate() {
    Object.keys(UNIT_MAP).forEach(id => decorateNumberInput(document.getElementById(id)));
    Object.entries(PARAMETER_RANGE_CONTROLS).forEach(([id, unit]) => decorateParameterRange(id, unit));
    ['inputMinVel', 'inputMaxVel'].forEach(id => {
      const input = document.getElementById(id);
      const field = input && input.closest('.num-field');
      const label = field && field.querySelector('label');
      if (label) label.textContent = label.textContent.replace(/\s*\([^)]*\)\s*$/, '');
    });
    ['optSpeedMin', 'optSpeedMax'].forEach(id => {
      const input = document.getElementById(id);
      const field = input && input.closest('.landscape-field');
      const label = field && field.querySelector('span');
      if (label) label.textContent = label.textContent.replace(/\s*\([^)]*\)\s*$/, '');
    });
    const gravityInput = document.getElementById('inputGravity');
    const gravityLabel = gravityInput && gravityInput.closest('.ctrl-group')?.querySelector('.ctrl-label');
    if (gravityLabel) gravityLabel.textContent = 'Gravity g';
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

      // Keep track fill synchronized when presets or linked controls assign .value.
      if (typeof HTMLInputElement !== 'undefined') {
        const nativeValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if (nativeValue && nativeValue.get && nativeValue.set) {
          try {
            Object.defineProperty(input, 'value', {
              configurable: true,
              enumerable: nativeValue.enumerable,
              get() { return nativeValue.get.call(this); },
              set(nextValue) {
                nativeValue.set.call(this, nextValue);
                update();
              }
            });
          } catch (error) {
            // Input/change listeners remain as a safe fallback in restrictive browsers.
          }
        }
      }
      update();
    });
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('focus', () => input.select && input.select());
    });
    const readouts = Array.from(document.querySelectorAll('.ctrl-val'));
    readouts.forEach(decorateReadout);
    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(records => {
        records.forEach(record => decorateReadout(record.target));
      });
      readouts.forEach(element => observer.observe(element, { childList: true, characterData: true, subtree: true }));
    }
  }
  const api = { tokenizeMeasurements, syncParameterEntries, precisionForStep, PARAMETER_RANGE_CONTROLS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.JBike6InstrumentControls = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate, { once: true });
    else decorate();
  }
})();
