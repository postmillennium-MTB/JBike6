'use strict';
// The Control lab shows G(s) = numG(s) / denG(s). That must equal C (sI - A)^-1 B for the
// state-space matrices the lab also shows. The functions live in index.html, so they are cut out
// of the page and run in a sandbox.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('function combineJBikeBodies');
const end = html.indexOf('function runControlledSimulation');
assert.ok(start > 0 && end > start, 'control code markers not found in index.html');
const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext('const DEG2RAD = Math.PI / 180;\n' + html.slice(start, end) +
  '\nthis.api = { assembleWhippleModel, computeStateSpaceAndTF };', sandbox);
const { assembleWhippleModel, computeStateSpaceAndTF } = sandbox.api;

const reference = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));
const R2D = 180 / Math.PI;
function paramsFromMatlab(e) {
  const rF = e.Dfrontwheel / 2;
  return {
    g: 9.81, wheelbase: e.wheelbase, headAngleDeg: e.head_angle * R2D,
    forkOffsetMm: (rF * Math.cos(e.head_angle) - e.trail * Math.sin(e.head_angle)) * 1000,
    Df: e.Dfrontwheel, Dr: e.Drearwheel, autoScaleWheels: false, gyroMult: 1,
    rearWheel: { m: e.mrearwheel, Ixx: e.Irearwheel[0], Izz: e.Irearwheel[2] },
    frontWheel: { m: e.mfrontwheel, Ixx: e.Ifrontwheel[0], Izz: e.Ifrontwheel[2] },
    frame: { m: e.mframe, x: e.xcmframe, y: e.ycmframe, I11: e.Iframe[0], I22: e.Iframe[1], Izz: e.Iframe[2], alphaDeg: e.alphaIframe * R2D },
    rider: { m: e.mrider, x: e.xcmrider, y: e.ycmrider, I11: e.Irider[0], I22: e.Irider[1], Izz: e.Irider[2], alphaDeg: e.alphaIrider * R2D },
    rack: { m: e.mrack, x: e.xcmrack, y: e.ycmrack, I11: e.Irack[0], I22: e.Irack[1], Izz: e.Irack[2], alphaDeg: e.alphaIrack * R2D },
    fork: { m: e.mfork, u: e.ucmfork, v: e.vcmfork, I11: e.Ifork[0], I22: e.Ifork[1], Izz: e.Ifork[2], alphaDeg: e.alphaIfork * R2D },
    basket: { m: e.mbasket, u: e.ucmbasket, v: e.vcmbasket, I11: e.Ibasket[0], I22: e.Ibasket[1], Izz: e.Ibasket[2], alphaDeg: e.alphaIbasket * R2D }
  };
}

const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
const sub = (x, y) => [x[0] - y[0], x[1] - y[1]];
const div = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
function solveComplex(A, b) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let piv = i;
    for (let r = i + 1; r < n; r++) if (Math.hypot(...M[r][i]) > Math.hypot(...M[piv][i])) piv = r;
    [M[i], M[piv]] = [M[piv], M[i]];
    for (let r = i + 1; r < n; r++) {
      const f = div(M[r][i], M[i][i]);
      for (let c = i; c <= n; c++) M[r][c] = sub(M[r][c], mul(f, M[i][c]));
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let c = i + 1; c < n; c++) s = sub(s, mul(M[i][c], x[c]));
    x[i] = div(s, M[i][i]);
  }
  return x;
}
const polyval = (coeffs, s) => coeffs.reduce((acc, k) => { const t = mul(acc, s); return [t[0] + k, t[1]]; }, [0, 0]);

for (const name of ['Benchmark_Paper', 'Schwinn_Crown', 'Burley_Canto_short']) {
  for (const output of ['phi', 'delta']) {
    test('numG/denG equals C (sI - A)^-1 B for ' + name + ' (' + output + ')', () => {
      const model = assembleWhippleModel(paramsFromMatlab(reference[name].ini));
      for (const v of [2, 5, 9]) {
        const ss = computeStateSpaceAndTF(model, v, output);
        for (const s of [[0.7, 0.3], [-1.2, 2.5], [3, -1]]) {
          const sIA = ss.A.map((row, i) => row.map((a, j) => sub(i === j ? s : [0, 0], [a, 0])));
          const x = solveComplex(sIA, ss.B.map(b => [b, 0]));
          const G = ss.C.reduce((acc, c, i) => [acc[0] + c * x[i][0], acc[1] + c * x[i][1]], [0, 0]);
          const H = div(polyval(ss.numG, s), polyval(ss.denG, s));
          const scale = Math.max(1e-9, Math.hypot(...G));
          assert.ok(Math.hypot(G[0] - H[0], G[1] - H[1]) / scale < 1e-8, 'v=' + v + ' s=' + s);
        }
      }
    });
  }
}

test('the transfer-function denominator is monic', () => {
  const model = assembleWhippleModel(paramsFromMatlab(reference.Benchmark_Paper.ini));
  assert.ok(Math.abs(computeStateSpaceAndTF(model, 5, 'phi').denG[0] - 1) < 1e-12);
});
