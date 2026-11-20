const test=require('node:test');
const assert=require('node:assert/strict');
const {combineBodies,computeMatrices,schwinnCrown}=require('../matlab-reference.js');
function close(a,b,t=1e-8){assert.ok(Math.abs(a-b)<=t,`expected ${b}, got ${a}`);}

test('JBaddb rigid-body aggregation preserves mass, center of mass, and parallel-axis inertia',()=>{
 const result=combineBodies([
  {m:2,x:0,y:0,I11:1,I22:2,Izz:3,alpha:0},
  {m:1,x:3,y:0,I11:1,I22:1,Izz:1,alpha:Math.PI/2}
 ]);
 close(result.m,3);close(result.cm[0],1);close(result.cm[1],0);close(result.I[2][2],10);close(result.I[0][1],0);
});

test('zero-mass assembly returns finite zero center and inertia, matching JBaddb.m',()=>{
 assert.deepEqual(combineBodies([]),{m:0,cm:[0,0],I:[[0,0,0],[0,0,0],[0,0,0]]});
});

test('Schwinn Crown parameter port produces a stable reference matrix fixture',()=>{
 const r=computeMatrices(schwinnCrown());
 const expected={
  M:[[129.48926566988507,-3.088155760457301],[-3.088155760457301,0.3029334657770334]],
  C1:[[0,-40.64856798104401],[0.5559639122571328,1.7859882894804167]],
  K0:[[-1002.9970982215385,26.908334641058122],[26.908334641058122,-8.770362188929687]],
  K2:[[0,-96.09760353564096],[0,2.7044647176670855]]
 };
 for(const key of Object.keys(expected))r[key].forEach((row,i)=>row.forEach((v,j)=>close(v,expected[key][i][j],2e-8)));
 close(r.total.m,91.136364);close(r.total.cm[0],0.3204481508682911);close(r.total.cm[1],1.1222440283291513);
});

test('reference solver rejects invalid and incomplete inputs instead of returning plausible numbers',()=>{
 assert.throws(()=>combineBodies([{m:-1,x:0,y:0,I11:0,I22:0,Izz:0,alpha:0}]),/non-negative/);
 assert.throws(()=>computeMatrices({...schwinnCrown(),gravity:NaN}),/finite/);
 const incomplete=schwinnCrown();delete incomplete.rider;assert.throws(()=>computeMatrices(incomplete),/missing body/);
});
