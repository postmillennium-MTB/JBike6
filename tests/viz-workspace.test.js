'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const workspace=require('../viz-workspace.js');

test('primary navigation exposes one concise item per major workspace',()=>{
  assert.deepEqual(workspace.items.map(item=>item[0]),[
    'Stability','Geometry','Ride test','Wheel lab','Control lab','Stability landscape','Design optimization'
  ]);
});

test('each major destination routes to the correct lab tab',()=>{
  const routes=Object.fromEntries(workspace.items.map(([label,,tab])=>[label,tab]));
  assert.equal(routes['Control lab'],'control');
  assert.equal(routes['Wheel lab'],'mullet');
  assert.equal(routes['Stability landscape'],'landscape');
  assert.equal(routes['Design optimization'],'optimization');
  assert.equal(routes['Geometry'],'overview');
});

test('eigenmodes and pole-zero are consolidated into Control Lab',()=>{
  const labels=workspace.items.map(item=>item[0]);
  assert.ok(labels.includes('Control lab'));
  assert.ok(!labels.includes('Eigenmodes'));
  assert.ok(!labels.includes('Pole-zero'));
});

test('workspace navigation honors reduced-motion preferences',()=>{
  assert.match(workspace.init.toString(),/prefers-reduced-motion/);
});
