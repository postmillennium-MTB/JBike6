'use strict';
// A stand-in for a 2D canvas context that records what is drawn, so tests can measure the geometry
// the page's own drawing code produces. Each stroke or fill is stored with the style and the path
// (moveTo, lineTo, arc) it used; text is stored separately.
function createRecorder() {
  const state = { strokeStyle: '', fillStyle: '', lineWidth: 1, font: '', textAlign: '', lineCap: '', lineJoin: '', globalAlpha: 1 };
  let dash = [];
  const stack = [];
  let path = [];
  const items = [];
  const texts = [];
  const snapshot = () => ({ strokeStyle: state.strokeStyle, fillStyle: state.fillStyle, lineWidth: state.lineWidth, dash: dash.slice(), globalAlpha: state.globalAlpha });
  const methods = {
    save: () => stack.push({ ...state, dash: dash.slice() }),
    restore: () => { const s = stack.pop(); if (s) { Object.assign(state, s); dash = s.dash; } },
    beginPath: () => { path = []; },
    closePath: () => {},
    moveTo: (x, y) => path.push({ t: 'M', x, y }),
    lineTo: (x, y) => path.push({ t: 'L', x, y }),
    arc: (x, y, r, a0, a1) => path.push({ t: 'A', x, y, r, a0, a1 }),
    ellipse: (x, y, rx, ry, rot, a0, a1) => path.push({ t: 'E', x, y, rx, ry, rot, a0, a1 }),
    stroke: () => items.push({ kind: 'stroke', style: snapshot(), path: path.slice() }),
    fill: () => items.push({ kind: 'fill', style: snapshot(), path: path.slice() }),
    fillRect: (x, y, w, h) => items.push({ kind: 'fillRect', style: snapshot(), path: [], x, y, w, h }),
    strokeRect: (x, y, w, h) => items.push({ kind: 'strokeRect', style: snapshot(), path: [], x, y, w, h }),
    fillText: (s, x, y) => texts.push({ s: String(s), x, y, style: snapshot() }),
    setLineDash: d => { dash = d.slice(); },
    measureText: s => ({ width: String(s).length * 6 }),
    clearRect: () => {}, rotate: () => {}, translate: () => {}, scale: () => {}, clip: () => {}, rect: () => {}
  };
  const ctx = new Proxy({}, {
    get: (_, key) => (key in state ? state[key] : (methods[key] || (() => {}))),
    set: (_, key, value) => { state[key] = value; return true; }
  });
  return { ctx, items, texts };
}
module.exports = { createRecorder };
