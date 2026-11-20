'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const workspace=require('../viz-workspace.js');
test('workspace navigator exposes the eight primary analysis destinations',()=>{
  assert.deepEqual(workspace.items.map(item=>item[0]),['Geometry','Stability','Ride test','Control theory','Eigenmodes','Pole-zero','Stability landscape','Optimization']);
});
test('destinations route to the correct lab tabs',()=>{
  const routes=Object.fromEntries(workspace.items.map(([label,,tab])=>[label,tab]));
  assert.equal(routes['Eigenmodes'],'control');
  assert.equal(routes['Pole-zero'],'control');
  assert.equal(routes['Stability landscape'],'landscape');
  assert.equal(routes['Optimization'],'optimization');
  assert.equal(routes['Geometry'],'overview');
});
test('workspace navigation honors reduced-motion preferences',()=>{
  assert.match(workspace.init.toString(),/prefers-reduced-motion/);
});
