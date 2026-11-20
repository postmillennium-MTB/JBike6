'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','viz-workspace.js'),'utf8');
test('workspace navigator exposes the eight primary analysis destinations',()=>{
  for(const label of ['Geometry','Stability','Ride test','Control theory','Eigenmodes','Pole-zero','Stability landscape','Optimization']) assert.ok(source.includes(label));
});
test('workspace navigation honors reduced-motion preferences',()=>{
  assert.match(source,/prefers-reduced-motion/);
});
