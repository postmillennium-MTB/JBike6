/*
 * Independent, literal JavaScript port of the rigid-body assembly and
 * linearized bicycle matrices in the original JBike6 MATLAB sources.
 * Source: JBaddb.m and JBmck.m (2015 distribution).
 * Units: m, kg, s, radians. K0 includes gravity in this formulation.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6MatlabReference = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const finite = (x, label) => { if (!Number.isFinite(x)) throw new TypeError(`${label} must be finite`); };

  // Literal JBaddb.m: rotate each planar principal-inertia tensor, then use
  // the parallel-axis theorem to assemble the inertia about the combined CM.
  function combineBodies(bodies) {
    if (!Array.isArray(bodies)) throw new TypeError('bodies must be an array');
    let mass = 0, mx = 0, my = 0;
    for (const b of bodies) {
      for (const key of ['m','x','y','I11','I22','Izz','alpha']) finite(b[key], `body.${key}`);
      if (b.m < 0 || b.I11 < 0 || b.I22 < 0 || b.Izz < 0) throw new RangeError('mass and principal moments must be non-negative');
      mass += b.m; mx += b.m*b.x; my += b.m*b.y;
    }
    const x = mass > 0 ? mx/mass : 0, y = mass > 0 ? my/mass : 0;
    const I = [[0,0,0],[0,0,0],[0,0,0]];
    for (const b of bodies) {
      const c=Math.cos(b.alpha), s=Math.sin(b.alpha), R=[[c,-s,0],[s,c,0],[0,0,1]];
      const d=[b.x-x,b.y-y,0], local=[b.I11,b.I22,b.Izz];
      const rotated=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>
        R[i][0]*local[0]*R[j][0]+R[i][1]*local[1]*R[j][1]+R[i][2]*local[2]*R[j][2]));
      const d2=d.reduce((sum,v)=>sum+v*v,0);
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) I[i][j]+=rotated[i][j]+b.m*((i===j?d2:0)-d[i]*d[j]);
    }
    return {m:mass,cm:[x,y],I};
  }

  // Literal JB mck assembly: front assembly = front wheel + fork + basket;
  // total assembly = all seven bodies. K0 is already multiplied by gravity.
  function computeMatrices(p) {
    for(const key of ['gravity','wheelbase','headAngle','trail','Drearwheel','Dfrontwheel']) finite(p[key],key);
    if(!(p.gravity>0&&p.wheelbase>0&&p.Drearwheel>0&&p.Dfrontwheel>0)) throw new RangeError('gravity, wheelbase, and wheel diameters must be positive');
    for(const name of ['frontWheel','fork','basket','rearWheel','frame','rack','rider']) if(!p[name]) throw new TypeError(`missing body ${name}`);
    const lambda=Math.PI/2-p.headAngle, cL=Math.cos(lambda), sL=Math.sin(lambda), xSteer=p.wheelbase+p.trail;
    const uvToXY=b=>[xSteer+cL*b.u-sL*b.v,sL*b.u+cL*b.v];
    const forkXY=uvToXY(p.fork), basketXY=uvToXY(p.basket);
    const bodies=[
      {...p.frontWheel,x:p.wheelbase,y:p.Dfrontwheel/2},
      {...p.fork,x:forkXY[0],y:forkXY[1]},
      {...p.basket,x:basketXY[0],y:basketXY[1]},
      {...p.rearWheel,x:0,y:p.Drearwheel/2},p.frame,p.rack,p.rider
    ];
    const front=combineBodies(bodies.slice(0,3)), total=combineBodies(bodies), [xT,yT]=total.cm;
    const cmtO=[xT,yT,0];
    const ItO=total.I.map((row,i)=>row.map((v,j)=>v+total.m*((i===j?xT*xT+yT*yT:0)-cmtO[i]*cmtO[j])));
    const Txx=ItO[0][0],Txy=ItO[0][1],Tyy=ItO[1][1],[xf,yf]=front.cm;
    const d=(xf-xSteer)*cL+yf*sL, ldir=[-sL,cL,0], xdir=[1,0,0], ydir=[0,1,0], If=front.I;
    const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0), Il=If.map(row=>dot(row,ldir));
    const mf=front.m,mt=total.m;
    const Fll=mf*d*d+dot(ldir,Il), Flx=-mf*yf*d+dot(xdir,Il), Fly=mf*xf*d+dot(ydir,Il);
    const cw=p.wheelbase,cf=p.trail*cL,Sr=p.rearWheel.Izz/(p.Drearwheel/2),Sf=p.frontWheel.Izz/(p.Dfrontwheel/2),St=Sr+Sf;
    const nu=mf*d+mt*xT*(cf/cw);
    const M=[[Txx,Flx+(cf/cw)*Txy],[Flx+(cf/cw)*Txy,Fll+2*(cf/cw)*Fly+(cf/cw)**2*Tyy]];
    const C1=[[0,-(Sf*cL+(cf/cw)*St)+Txy*cL/cw-(cf/cw)*mt*yT],[Sf*cL+(cf/cw)*St,cL/cw*Fly+(cf/cw)*(nu+cL/cw*Tyy)]];
    const K0=[[-p.gravity*mt*yT,p.gravity*nu],[p.gravity*nu,-p.gravity*nu*sL]];
    const K2=[[0,-cL/cw*(St+mt*yT)],[0,cL/cw*(sL*Sf+nu)]];
    return {M,C1,K0,K2,total,frontAssembly:front,forkXY,basketXY,lambda,Sr,Sf,St,nu,d};
  }

  function schwinnCrown() {
    return {
      gravity:9.80665,wheelbase:1.016,headAngle:1.23879599,trail:0.090968,Drearwheel:0.6858,Dfrontwheel:0.6858,
      rearWheel:{m:1.818182,I11:0.085513,I22:0.085513,Izz:0.171026,alpha:0},
      frontWheel:{m:1.818182,I11:0.085513,I22:0.085513,Izz:0.171026,alpha:0},
      rider:{m:80,x:0.3,y:1.2,I11:10.531129,I22:2.468871,Izz:12,alpha:-0.25957299},
      frame:{m:2.5,x:0.3,y:0.5,I11:0.058579,I22:0.341421,Izz:0.4,alpha:0.39269899},
      fork:{m:1.5,u:0,v:0.6858,I11:0.058790,I22:0.000588,Izz:0.058790,alpha:0.332},
      basket:{m:1.5,u:0.15,v:0.8,I11:0.01,I22:0.01,Izz:0.01,alpha:0},
      rack:{m:2,x:-0.1,y:0.8,I11:0.02,I22:0.02,Izz:0.02,alpha:0}
    };
  }
  return {combineBodies,computeMatrices,schwinnCrown};
});
