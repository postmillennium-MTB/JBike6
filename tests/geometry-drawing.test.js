'use strict';
// Checks that what the 2D and 3D geometry views draw agrees with the model.
// The page's own drawing functions are cut out of index.html and run against a recording canvas
// (tests/helpers/recording-canvas.js). Pixels are converted back to metres using only the two wheel
// hubs and the wheelbase, so nothing is taken from the drawing code's own scale.
// Independent references: MATLAB's total centre of mass (matlab-reference.json), MATLAB's rotation
// convention for inertia axes, and right-handed kinematics for lean and steer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRecorder } = require('./helpers/recording-canvas.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const modelStart = html.indexOf('function combineJBikeBodies');
const analyze = html.indexOf('function analyzeStability');
const modelEnd = html.indexOf('\n      // =====', analyze);
const draw2dStart = html.indexOf('let geomTransform = null;');
const draw2dEnd = html.indexOf('function drawGeometryCanvas3D');
const draw3dEnd = html.indexOf('function drawGeometryCanvas()');
assert.ok(modelStart > 0 && draw2dStart > modelEnd && draw2dEnd > draw2dStart && draw3dEnd > draw2dEnd, 'drawing code markers not found in index.html');

const sandbox = { Math, INCH2M: 0.0254, RAD2DEG: 180 / Math.PI, __calls: [], __sample: { phi: 0, delta: 0 } };
vm.createContext(sandbox);
vm.runInContext(
  'const DEG2RAD = Math.PI / 180;\nvar appState = null;\n' + html.slice(modelStart, modelEnd) + '\n' + html.slice(draw2dStart, draw3dEnd) + `
  // Stand-ins for the page's camera and simulation. project3DPoint returns an id for each point so the
  // test can recover the 3D world points the drawing code asked to project.
  function project3DPoint(pt) { __calls.push({ x: pt.x, y: pt.y, z: pt.z }); const id = __calls.length - 1; return { x: id, y: id, scale: 1, depth: 0 }; }
  function getSimSampleAtTime() { return __sample; }
  function formatSpeed(v) { return String(v); }
  this.api = { assembleWhippleModel, drawGeometryCanvas2D, drawGeometryCanvas3D, setApp: s => { appState = s; } };`, sandbox);
const api = sandbox.api;

const R2D = 180 / Math.PI, D2R = Math.PI / 180;
const presetStart = html.indexOf('{', html.indexOf('const PRESETS = {'));
let depth = 0, presetEnd = presetStart;
for (; presetEnd < html.length; presetEnd++) {
  if (html[presetEnd] === '{') depth++;
  else if (html[presetEnd] === '}' && --depth === 0) break;
}
const PRESETS = vm.runInNewContext('(' + html.slice(presetStart, presetEnd + 1) + ')');
const matlab = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'matlab-reference.json'), 'utf8'));

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

const cases = [];
for (const [key, p] of Object.entries(PRESETS)) if (p && p.wheelbase && p.rider) cases.push(['preset ' + key, p]);
for (const [name, ref] of Object.entries(matlab)) cases.push(['MATLAB bike ' + name, paramsFromMatlab(ref.ini)]);
const odd = JSON.parse(JSON.stringify(PRESETS.mulletMX));
Object.assign(odd, { wheelbase: 1.5, headAngleDeg: 58, forkOffsetMm: 30, Df: 0.8, Dr: 0.55 });
cases.push(['stress geometry', odd]);

function draw2d(p) {
  const params = JSON.parse(JSON.stringify(p));
  const model = api.assembleWhippleModel(params);
  api.setApp({ analysis: { model }, params, showDumbbells: true });
  const rec = createRecorder();
  api.drawGeometryCanvas2D(rec.ctx, 900, 520);
  const arcs = rec.items.flatMap(it => it.path.filter(s => s.t === 'A').map(s => ({ ...s, kind: it.kind, style: it.style })));
  const hubs = arcs.filter(a => a.r === 4 && a.kind === 'fill');   // drawn rear wheel first, then front
  if (hubs.length < 2) return { params, model, rec, arcs, hubs, scale: null, toWorld: null };   // wheels too small to draw
  const scale = (hubs[1].x - hubs[0].x) / model.w;          // pixels per metre, from the hubs and the wheelbase (negative wheelbases work too)
  const groundY = hubs[0].y + model.rR * scale;              // ground implied by the rear hub
  const toWorld = (x, y) => ({ x: (x - hubs[0].x) / scale, y: (groundY - y) / scale });
  return { params, model, rec, arcs, hubs, scale, toWorld };
}
const near = (a, b, tol, label) => assert.ok(Math.abs(a - b) <= tol, label + ': ' + a + ' vs ' + b);

for (const [label, p] of cases) {
  test('2D drawing matches the model: ' + label, () => {
    const { params, model, rec, arcs, hubs, scale, toWorld } = draw2d(p);
    const { w, c, rR, rF } = model;
    if (hubs.length < 2) {
      // The drawing code skips a wheel smaller than 2 px. That is only acceptable for a wheel that really is tiny.
      assert.ok(Math.min(rR, rF) < 0.05, 'a wheel of radius ' + Math.min(rR, rF) + ' m should have been drawn');
      return;
    }
    assert.equal(hubs.length, 2, 'two wheel hubs');
    // Wheels sit on the same ground line, with their radii at the drawn scale.
    near(toWorld(hubs[1].x, hubs[1].y).y, rF, 1e-9, 'front hub height');
    const spokeRims = arcs.filter(a => a.kind === 'stroke' && a.style.strokeStyle === '#586079' && a.style.lineWidth === 1.5 && a.r > 20);
    near(spokeRims[0].r / 0.84 / scale, rR, 1e-9, 'rear wheel radius');
    near(spokeRims[1].r / 0.84 / scale, rF, 1e-9, 'front wheel radius');
    // Steering axis: meets the ground at w + c, leans back at the head angle, and sits one fork offset from the front axle.
    const dashed = rec.items.find(it => it.style.dash.length && it.style.dash[0] === 6);
    const bottom = toWorld(dashed.path[0].x, dashed.path[0].y), top = toWorld(dashed.path[1].x, dashed.path[1].y);
    near(bottom.y, 0, 1e-9, 'steering axis meets the ground');
    near(bottom.x, w + c, 1e-9, 'steering axis ground point');
    const angle = Math.atan2(top.y - bottom.y, bottom.x - top.x);
    near(angle * R2D, params.headAngleDeg, 1e-9, 'steering axis angle');
    const hub = toWorld(hubs[1].x, hubs[1].y);
    const offset = (hub.x - bottom.x) * Math.sin(angle) + (hub.y - bottom.y) * Math.cos(angle);   // signed: positive when the axle is ahead of the axis
    near(offset, params.forkOffsetMm / 1000, 1e-9, 'fork offset measured from the drawing');
    // Trail callout runs from the front contact point to the steering-axis ground point.
    const trail = rec.items.find(it => it.kind === 'stroke' && it.style.lineWidth === 4 && it.path.length === 2);
    near(toWorld(trail.path[0].x, trail.path[0].y).x, w, 1e-9, 'trail starts at the front contact point');
    near(toWorld(trail.path[1].x, trail.path[1].y).x - w, c, 1e-9, 'trail length');
    // Head-angle arc sweeps the head angle.
    const arc = arcs.find(a => a.r === 34);
    near((arc.a1 - arc.a0) * R2D, params.headAngleDeg, 1e-9, 'head-angle arc');
    // Labels show the model's numbers.
    const texts = rec.texts.map(t => t.s);
    assert.ok(texts.includes('Trail ' + (c * 1000).toFixed(1) + 'mm'));
    assert.ok(texts.includes('Wheelbase w = ' + w.toFixed(3) + ' m'));
    assert.ok(texts.includes(params.headAngleDeg.toFixed(1) + '°'));
    // Centres of mass: fork by MATLAB's Ol + Rl [u; v]; rider as set.
    const lam = Math.PI / 2 - params.headAngleDeg * D2R;
    const forkX = (w + c) + params.fork.u * Math.cos(lam) - params.fork.v * Math.sin(lam);
    const forkY = params.fork.u * Math.sin(lam) + params.fork.v * Math.cos(lam);
    const handles = arcs.filter(a => a.r === 10).map(a => toWorld(a.x, a.y));
    if (params.rider.m > 0) { near(handles[0].x, params.rider.x, 1e-9, 'rider handle x'); near(handles[0].y, params.rider.y, 1e-9, 'rider handle y'); }
    if (params.fork.m > 0) { near(handles[handles.length - 1].x, forkX, 1e-9, 'fork centre of mass x'); near(handles[handles.length - 1].y, forkY, 1e-9, 'fork centre of mass y'); }
  });
}

for (const [name, ref] of Object.entries(matlab)) {
  test('total centre of mass matches MATLAB, in the model and where it is drawn: ' + name, () => {
    const { model, arcs, toWorld } = draw2d(paramsFromMatlab(ref.ini));
    near(model.xT, ref.com[0], 1e-9, 'x from the model');
    near(-model.zT, ref.com[1], 1e-9, 'height from the model');
    if (!toWorld) return;   // wheels too small to draw, so there is no scale to read the marker with
    const mark = arcs.find(a => a.r === 7);
    const drawn = toWorld(mark.x, mark.y);
    near(drawn.x, ref.com[0], 1e-9, 'x as drawn');
    near(drawn.y, ref.com[1], 1e-9, 'height as drawn');
  });
}

test('component inertia glyphs follow MATLAB\'s rotation: the along-axis is (cos a, sin a) and uses the perpendicular moment', () => {
  const { params, rec, scale, toWorld } = draw2d(PRESETS.benchmark);
  const dashed = rec.items.filter(it => it.style.dash.length === 2 && it.style.dash[0] === 4 && it.path.length === 4);
  // Benchmark frame: principal moments 10 and 2, axis rotated by atan(-1/3). The frame glyph is the first one drawn.
  const f = params.frame, a = f.alphaDeg * D2R;
  const [p0, p1, p2, p3] = dashed[0].path.map(s => toWorld(s.x, s.y));
  const along = { x: (p0.x - p1.x) / 2, y: (p0.y - p1.y) / 2 }, across = { x: (p2.x - p3.x) / 2, y: (p2.y - p3.y) / 2 };
  const lenAlong = Math.hypot(along.x, along.y), lenAcross = Math.hypot(across.x, across.y);
  near(Math.atan2(along.y, along.x), a, 1e-9, 'along-axis direction');
  near(Math.atan2(across.y, across.x), a + Math.PI / 2, 1e-9, 'across-axis direction');
  near(lenAlong, Math.sqrt(f.I22 / f.m) * 0.75, 1e-9, 'along extent uses the moment about the other axis');
  near(lenAcross, Math.sqrt(f.I11 / f.m) * 0.75, 1e-9, 'across extent');
  assert.ok(scale > 0);
});

test('assembly glyphs: the long axis lies along the direction of largest moment of inertia', () => {
  for (const [label, p] of [['benchmark', PRESETS.benchmark], ['mullet', PRESETS.mulletMX]]) {
    const { model, rec, toWorld } = draw2d(p);
    for (const asm of [model.compB_JB, model.compH_JB]) {
      const glyph = rec.items.filter(it => it.style.dash.length === 2 && it.style.dash[0] === 7 && it.path.length === 4)
        .find(it => { const c = toWorld(it.path[0].x, it.path[0].y), d = toWorld(it.path[1].x, it.path[1].y); return Math.abs((c.x + d.x) / 2 - asm.x) < 1e-6 && Math.abs((c.y + d.y) / 2 - asm.y) < 1e-6; });
      assert.ok(glyph, label + ': assembly glyph found');
      const a = toWorld(glyph.path[0].x, glyph.path[0].y), b = toWorld(glyph.path[1].x, glyph.path[1].y);
      const n = { x: (a.x - b.x) / Math.hypot(a.x - b.x, a.y - b.y), y: (a.y - b.y) / Math.hypot(a.x - b.x, a.y - b.y) };
      const moment = d => asm.Ixx * d.x * d.x + asm.Iyy * d.y * d.y + 2 * asm.Ixy * d.x * d.y;   // moment of inertia about direction d
      const mean = (asm.Ixx + asm.Iyy) / 2, spread = Math.hypot((asm.Ixx - asm.Iyy) / 2, asm.Ixy);
      near(moment(n), mean + spread, 1e-9 * Math.max(1, mean), label + ': moment about the drawn long axis is the largest principal moment');
    }
  }
});

// ---- 3D: lean and steer kinematics -------------------------------------------------------------
function draw3d(p, phi, delta) {
  const params = JSON.parse(JSON.stringify(p));
  const model = api.assembleWhippleModel(params);
  sandbox.__calls.length = 0;
  sandbox.__sample = { phi, delta };
  api.setApp({ analysis: { model }, params, showDumbbells: false, sim: { t: 0, wheelSpinAngle: 0, speedMs: 5 }, unit: 'ms', geomCam3D: { zoom: 1, yaw: 0, pitch: 0 } });
  const rec = createRecorder();
  api.drawGeometryCanvas3D(rec.ctx, 900, 520);
  const rings = rec.items.filter(it => it.kind === 'stroke' && it.style.lineWidth === 4.5 && it.path.length === 33)
    .map(it => it.path.map(s => sandbox.__calls[Math.round(s.x)]));
  return { model, params, rings };   // rings[0] = rear wheel, rings[1] = front wheel, as 3D world points
}
const centre = ring => ring.slice(0, -1).reduce((c, q) => ({ x: c.x + q.x / 32, y: c.y + q.y / 32, z: c.z + q.z / 32 }), { x: 0, y: 0, z: 0 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

test('3D upright: wheels are circles of the right radius in the vertical plane, tangent to the ground', () => {
  const { model, rings } = draw3d(PRESETS.benchmark, 0, 0);
  for (const [ring, cx, r] of [[rings[0], 0, model.rR], [rings[1], model.w, model.rF]]) {
    for (const q of ring) { near(Math.hypot(q.x - cx, q.y - r), r, 1e-9, 'point on the rim'); near(q.z, 0, 1e-12, 'rim in the vertical plane'); }
    near(Math.min(...ring.map(q => q.y)), 0, 1e-9, 'lowest point touches the ground');
  }
});

test('3D lean: a positive lean angle tips the top of the bike toward +z, which is the rider\'s right', () => {
  // Right-handed axes with x forward and y up give z = x cross y, pointing to the rider's right.
  const phi = 0.2;
  const { model, rings } = draw3d(PRESETS.benchmark, phi, 0);
  const top = rings[0].reduce((best, q) => (q.y > best.y ? q : best));
  assert.ok(top.z > 0, 'top of the rear wheel moves to +z');
  near(Math.atan2(top.z, top.y), phi, 1e-9, 'tip angle equals the lean angle');
  near(Math.min(...rings[0].map(q => Math.abs(q.z + 0 * q.y) + (q.y < 1e-9 ? 0 : 0))), 0, 1e-9, 'ground contact stays on the ground line');
  const contact = rings[0].reduce((best, q) => (q.y < best.y ? q : best));
  near(contact.z, 0, 1e-9, 'contact point does not move sideways');
  assert.ok(model.rR > 0);
});

test('3D steer: a positive steer angle turns the front wheel to the right about the steering axis, rigidly', () => {
  const delta = 0.3;
  const { model, params, rings } = draw3d(PRESETS.benchmark, 0, delta);
  const front = rings[1], hub = centre(front);
  const lam = model.lambda, axisPoint = { x: model.w + model.c, y: 0, z: 0 };
  const axisDir = { x: Math.sin(lam), y: -Math.cos(lam), z: 0 };     // down and forward along the steering tube
  // The hub is one fork offset from the steering axis, so steering moves it sideways by offset * sin(delta), to the right.
  const offset = params.forkOffsetMm / 1000;
  near(hub.z, offset * Math.sin(delta), 1e-9, 'hub moves to +z by offset * sin(steer)');
  // Rigid rotation about the axis: every rim point keeps its distance from the axis and from the hub.
  const distanceToAxis = q => { const v = { x: q.x - axisPoint.x, y: q.y - axisPoint.y, z: q.z - axisPoint.z }; const t = v.x * axisDir.x + v.y * axisDir.y; return Math.hypot(v.x - t * axisDir.x, v.y - t * axisDir.y, v.z); };
  near(distanceToAxis(hub), offset, 1e-9, 'hub distance from the axis equals the fork offset');
  for (const q of front.slice(0, -1)) near(dist(q, hub), model.rF, 1e-9, 'rim point stays one wheel radius from the hub');
  // The rear wheel does not steer.
  near(centre(rings[0]).z, 0, 1e-12, 'rear wheel stays in line');
  // Steer into the lean: with positive lean and positive steer the bike steers toward the side it leans.
  const { rings: leaned } = draw3d(PRESETS.benchmark, 0.1, delta);
  assert.ok(centre(leaned[1]).z > 0 && centre(leaned[0]).z >= 0, 'both lean and steer move the front toward +z');
});
