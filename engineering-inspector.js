(function (root) {
  'use strict';
  const LABELS = {
    speed: 'Operating point',
    eigenmode: 'Selected eigenmode',
    landscape: 'Stability landscape point',
    geometry: 'Geometry component'
  };
  function publish(type, title, rows, note) {
    if (typeof document === 'undefined') return;
    const host = document.getElementById('engineeringInspector');
    if (!host) return;
    const safeRows = Array.isArray(rows) ? rows : [];
    host.innerHTML = '';
    host.classList.remove('is-empty');
    const heading = document.createElement('div');
    heading.className = 'engineering-inspector-heading';
    const eyebrow = document.createElement('span');
    eyebrow.textContent = LABELS[type] || 'Engineering selection';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'engineering-inspector-clear';
    clear.textContent = 'Clear';
    clear.addEventListener('click', () => api.clear());
    heading.append(eyebrow, clear);
    const name = document.createElement('strong');
    name.className = 'engineering-inspector-title';
    name.textContent = title || 'Selection';
    const grid = document.createElement('div');
    grid.className = 'engineering-inspector-grid';
    safeRows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'engineering-inspector-value';
      const label = document.createElement('span');
      label.textContent = String(row.label ?? '');
      const value = document.createElement('strong');
      value.textContent = String(row.value ?? '—');
      item.append(label, value);
      grid.append(item);
    });
    host.append(heading, name, grid);
    if (note) {
      const detail = document.createElement('p');
      detail.className = 'engineering-inspector-note';
      detail.textContent = note;
      host.append(detail);
    }
    host.dataset.selectionType = type || 'other';
    host.setAttribute('aria-live', 'polite');
  }
  function clear() {
    const host = typeof document !== 'undefined' && document.getElementById('engineeringInspector');
    if (host) {
      host.classList.add('is-empty');
      delete host.dataset.selectionType;
      host.innerHTML = '<div class="engineering-inspector-empty">Select a point, mode, or component in any visualization to inspect it here.</div>';
    }
  }
  const api = { publish, clear };
  if (root) root.JBike6EngineeringInspector = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
