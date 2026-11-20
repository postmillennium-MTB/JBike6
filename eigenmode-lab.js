(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6EigenmodeLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const EPS = 1e-12;
  const $ = id => document.getElementById(id);
  const c = (re = 0, im = 0) => ({ re, im });
  const add = (a, b) => c(a.re + b.re, a.im + b.im);
  const scale = (a, k) => c(a.re * k, a.im * k);
  const conj = a => c(a.re, -a.im);
  const mul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const abs = a => Math.hypot(a.re, a.im);
  const arg = a => Math.atan2(a.im, a.re);
  const fmt = (value, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : '—';
  const wrapDegrees = degrees => ((degrees + 180) % 360 + 360) % 360 - 180;

  // Recover the displacement part q=[lean, steer] of the four-state
  // eigenvector by solving the 2x2 quadratic eigenvalue pencil Q(lambda)q=0.
  function computeModeShape(model, speed, eigenvalue) {
    if (!model || !Number.isFinite(speed) || !eigenvalue ||
        !Number.isFinite(eigenvalue.re) || !Number.isFinite(eigenvalue.im)) {
      throw new TypeError('A valid bicycle model, speed, and eigenvalue are required.');
    }
    const lambda = c(eigenvalue.re, eigenvalue.im);
    const lambda2 = mul(lambda, lambda);
    const Q = Array.from({ length: 2 }, (_, i) =>
      Array.from({ length: 2 }, (_, j) => {
        const inertial = scale(lambda2, model.M[i][j]);
        const damping = scale(lambda, speed * model.C1[i][j]);
        const stiffness = c(model.g * model.K0[i][j] + speed * speed * model.K2[i][j], 0);
        return add(add(inertial, damping), stiffness);
      })
    );
    const rowNorm = row => Math.hypot(abs(row[0]), abs(row[1]));
    const row = rowNorm(Q[0]) >= rowNorm(Q[1]) ? Q[0] : Q[1];
    let q = [scale(row[1], -1), row[0]];
    let qNorm = Math.max(abs(q[0]), abs(q[1]));
    if (!Number.isFinite(qNorm) || qNorm < EPS) {
      const fallback = rowNorm(Q[0]) <= rowNorm(Q[1]) ? Q[0] : Q[1];
      q = [scale(fallback[1], -1), fallback[0]];
      qNorm = Math.max(abs(q[0]), abs(q[1]));
    }
    if (!Number.isFinite(qNorm) || qNorm < EPS) {
      throw new Error('Could not recover a well-conditioned eigenvector for this eigenvalue.');
    }
    q = q.map(value => scale(value, 1 / qNorm));
    const pivot = abs(q[0]) >= abs(q[1]) ? q[0] : q[1];
    const rotation = scale(conj(pivot), 1 / Math.max(abs(pivot), EPS));
    q = q.map(value => mul(value, rotation));

    const residual = [
      add(mul(Q[0][0], q[0]), mul(Q[0][1], q[1])),
      add(mul(Q[1][0], q[0]), mul(Q[1][1], q[1]))
    ];
    const residualNorm = Math.hypot(abs(residual[0]), abs(residual[1]));
    const matrixNorm = Math.sqrt(Q.flat().reduce((sum, value) => sum + abs(value) ** 2, 0));
    const vectorNorm = Math.hypot(abs(q[0]), abs(q[1]));
    const relativeResidual = residualNorm / Math.max(matrixNorm * vectorNorm, EPS);
    const phaseDifferenceDeg = wrapDegrees((arg(q[1]) - arg(q[0])) * 180 / Math.PI);
    const magnitude = [abs(q[0]), abs(q[1])];
    const velocity = q.map(value => mul(lambda, value));
    return {
      coordinates: { lean: q[0], steer: q[1] },
      velocity: { lean: velocity[0], steer: velocity[1] },
      leanAmplitude: magnitude[0],
      steerAmplitude: magnitude[1],
      steerToLeanRatio: magnitude[1] / Math.max(magnitude[0], EPS),
      phaseDifferenceDeg, relativeResidual,
      oscillatory: Math.abs(eigenvalue.im) > 1e-7,
      frequencyHz: Math.abs(eigenvalue.im) / (2 * Math.PI),
      dampingRatio: -eigenvalue.re / Math.max(Math.hypot(eigenvalue.re, eigenvalue.im), EPS),
      eigenvalue: { re: eigenvalue.re, im: eigenvalue.im }
    };
  }

  function create(options) {
    const { state, maxRealEigenvalue } = options || {};
    if (!state || typeof maxRealEigenvalue !== 'function') {
      throw new TypeError('Eigenmode lab requires live app state and maxRealEigenvalue().');
    }
    const ui = {
      mode: $('eigenmodeSelect'), speed: $('eigenmodeSpeed'),
      frequency: $('eigenmodeFrequency'), damping: $('eigenmodeDamping'),
      ratio: $('eigenmodeRatio'), phaseDifference: $('eigenmodePhaseDifference'),
      residual: $('eigenmodeResidual'), phase: $('eigenmodePhase'),
      phaseValue: $('eigenmodePhaseValue'), play: $('btnEigenmodePlay'),
      status: $('eigenmodeStatus'), canvas: $('eigenmodeCanvas')
    };
    const model = { roots: [], modeIndex: 0, mode: null, phaseDeg: 0, playing: false, frame: null, lastTime: null };
    function setStatus(message, kind = 'neutral') {
      ui.status.textContent = message;
      ui.status.dataset.kind = kind;
    }
    function draw() {
      if (!ui.canvas) return;
      const rect = ui.canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width), height = Math.max(230, rect.height);
      const dpr = window.devicePixelRatio || 1;
      if (ui.canvas.width !== Math.round(width*dpr) || ui.canvas.height !== Math.round(height*dpr)) {
        ui.canvas.width = Math.round(width*dpr); ui.canvas.height = Math.round(height*dpr);
      }
      const ctx = ui.canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(0,0,width,height);
      if (!model.mode) {
        ctx.fillStyle = '#64748b'; ctx.font = '13px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.fillText('Select a valid operating speed to inspect a mode shape.',width/2,height/2);
        return;
      }
      const mode=model.mode, lean=mode.coordinates.lean, steer=mode.coordinates.steer;
      const topH=Math.min(142,height*0.48);
      const center={x:Math.min(width*0.29,205),y:topH*0.58};
      const radius=Math.min(52,topH*0.37,width*0.11);
      ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(center.x,center.y,radius,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([3,4]);ctx.beginPath();
      ctx.moveTo(center.x-radius-10,center.y);ctx.lineTo(center.x+radius+10,center.y);
      ctx.moveTo(center.x,center.y-radius-10);ctx.lineTo(center.x,center.y+radius+10);
      ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#64748b';ctx.font='10px system-ui,sans-serif';ctx.textAlign='center';
      ctx.fillText('Im(q)',center.x,12);ctx.fillText('Re(q)',center.x+radius+22,center.y+3);
      const drawPhasor=(value,color,label)=>{
        const p={x:center.x+value.re*radius,y:center.y-value.im*radius};
        ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(p.x,p.y);ctx.stroke();
        ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();
        ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(label,p.x+6,p.y-5);
      };
      drawPhasor(lean,'#059669','Lean');drawPhasor(steer,'#d97706','Steer');

      const sx=Math.max(width*0.48,300), sw=Math.max(150,width-sx-22);
      ctx.fillStyle='#0f172a';ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='left';
      ctx.fillText('GENERALIZED COORDINATES',sx,20);
      const drawBar=(y,label,value,color)=>{
        ctx.fillStyle='#475569';ctx.font='600 11px system-ui,sans-serif';ctx.fillText(label,sx,y);
        ctx.fillStyle='#e2e8f0';ctx.fillRect(sx,y+8,sw,9);
        ctx.fillStyle=color;ctx.fillRect(sx,y+8,sw*Math.max(0,Math.min(1,value)),9);
        ctx.fillStyle='#334155';ctx.textAlign='right';ctx.fillText((value*100).toFixed(1)+'%',sx+sw,y);ctx.textAlign='left';
      };
      drawBar(45,'Lean amplitude |φ|',mode.leanAmplitude,'#059669');
      drawBar(83,'Steer amplitude |δ|',mode.steerAmplitude,'#d97706');
      ctx.fillStyle='#475569';ctx.font='11px system-ui,sans-serif';
      ctx.fillText('Steer / lean amplitude: '+mode.steerToLeanRatio.toFixed(3),sx,124);
      ctx.fillText('Steer phase relative to lean: '+mode.phaseDifferenceDeg.toFixed(1)+'°',sx,140);

      const padL=42,padR=18,padT=topH+20,padB=24,plotW=width-padL-padR,plotH=Math.max(46,height-padT-padB);
      const toX=degrees=>padL+degrees/360*plotW,toY=value=>padT+plotH*(0.5-0.43*value);
      ctx.strokeStyle='#dbe4ec';ctx.lineWidth=1;
      for(const level of [-1,0,1]){const y=toY(level);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+plotW,y);ctx.stroke();}
      ctx.fillStyle='#64748b';ctx.font='10px system-ui,sans-serif';ctx.textAlign='right';
      ctx.fillText('+1',padL-7,toY(1)+3);ctx.fillText('0',padL-7,toY(0)+3);ctx.fillText('−1',padL-7,toY(-1)+3);
      const trace=(value,color)=>{
        ctx.strokeStyle=color;ctx.lineWidth=2.1;ctx.beginPath();
        for(let i=0;i<=120;i++){
          const degrees=i*3,theta=degrees*Math.PI/180*Math.sign(mode.eigenvalue.im||1);
          const yValue=mode.oscillatory ? value.re*Math.cos(theta)-value.im*Math.sin(theta) : value.re;
          const x=toX(degrees),y=toY(yValue);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      };
      trace(lean,'#059669');trace(steer,'#d97706');
      const cursorX=toX(model.phaseDeg);ctx.strokeStyle='#0f172a';ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.moveTo(cursorX,padT);ctx.lineTo(cursorX,padT+plotH);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#0f172a';ctx.font='600 10px system-ui,sans-serif';ctx.textAlign='center';
      ctx.fillText('0°',padL,height-6);ctx.fillText('180°',padL+plotW/2,height-6);ctx.fillText('360° phase',padL+plotW,height-6);
      ctx.textAlign='left';ctx.fillStyle='#059669';ctx.fillText('— Lean',padL+5,padT-7);
      ctx.fillStyle='#d97706';ctx.fillText('— Steer',padL+75,padT-7);
    }
    function renderSelection() {
      const root=model.roots[model.modeIndex];
      if(!root||!state.analysis||!state.analysis.model){
        model.mode=null;ui.frequency.textContent='—';ui.damping.textContent='—';ui.ratio.textContent='—';
        ui.phaseDifference.textContent='—';ui.residual.textContent='—';ui.play.disabled=true;ui.phase.disabled=true;
        setStatus('No valid eigenvalues are available at this speed.','error');draw();return;
      }
      try{
        model.mode=computeModeShape(state.analysis.model,state.sim.speedMs,root);
        ui.frequency.textContent=model.mode.frequencyHz.toFixed(3)+' Hz';
        ui.damping.textContent=(model.mode.dampingRatio*100).toFixed(1)+'%';
        ui.ratio.textContent=model.mode.steerToLeanRatio.toFixed(3);
        ui.phaseDifference.textContent=fmt(model.mode.phaseDifferenceDeg,1)+'°';
        ui.residual.textContent=model.mode.relativeResidual.toExponential(2);
        ui.phase.disabled=!model.mode.oscillatory;ui.play.disabled=!model.mode.oscillatory;
        ui.play.textContent=model.playing?'Pause cycle':'Play cycle';
        setStatus(model.mode.oscillatory
          ?'Oscillatory mode · traces show normalized lean and steer over one cycle.'
          :'Non-oscillatory mode · the eigenvector is a real, fixed lean/steer proportion.','success');
      }catch(error){model.mode=null;setStatus('Mode-shape calculation failed: '+error.message,'error');}
      draw();
    }
    function update() {
      if(!state.analysis||!state.analysis.model)return;
      const speed=state.sim.speedMs;ui.speed.textContent=speed.toFixed(2)+' m/s';
      let result;
      try{result=maxRealEigenvalue(state.analysis.model,speed);}
      catch(error){setStatus('Eigenvalue calculation failed: '+error.message,'error');return;}
      model.roots=(result.roots||[]).slice().sort((a,b)=>b.re-a.re||b.im-a.im);
      if(!model.roots.length){ui.mode.innerHTML='<option value="">No eigenvalues</option>';renderSelection();return;}
      model.modeIndex=Math.max(0,Math.min(model.modeIndex,model.roots.length-1));
      ui.mode.innerHTML=model.roots.map((root,index)=>{
        const sign=root.im>=0?'+':'−';
        return '<option value="'+index+'">λ'+(index+1)+' · '+fmt(root.re,3)+' '+sign+' '+fmt(Math.abs(root.im),3)+'i</option>';
      }).join('');
      ui.mode.value=String(model.modeIndex);
      renderSelection();
    }
    function stopAnimation(){
      model.playing=false;model.lastTime=null;
      if(model.frame!==null)cancelAnimationFrame(model.frame);
      model.frame=null;ui.play.textContent='Play cycle';
    }
    function animate(timestamp){
      if(!model.playing||!model.mode||!model.mode.oscillatory)return stopAnimation();
      if(model.lastTime===null)model.lastTime=timestamp;
      const elapsed=timestamp-model.lastTime;model.lastTime=timestamp;
      model.phaseDeg=(model.phaseDeg+elapsed*0.11)%360;
      ui.phase.value=model.phaseDeg.toFixed(0);ui.phaseValue.textContent=model.phaseDeg.toFixed(0)+'°';
      draw();model.frame=requestAnimationFrame(animate);
    }
    ui.mode.addEventListener('change',()=>{
      model.modeIndex=Math.max(0,Number(ui.mode.value)||0);model.phaseDeg=0;
      ui.phase.value='0';ui.phaseValue.textContent='0°';renderSelection();
    });
    ui.phase.addEventListener('input',()=>{
      model.phaseDeg=Number(ui.phase.value);ui.phaseValue.textContent=model.phaseDeg.toFixed(0)+'°';draw();
    });
    ui.play.addEventListener('click',()=>{
      if(model.playing)stopAnimation();
      else if(model.mode&&model.mode.oscillatory){
        model.playing=true;model.lastTime=null;ui.play.textContent='Pause cycle';model.frame=requestAnimationFrame(animate);
      }
    });
    window.addEventListener('resize',draw);
    return {update,draw,stop:stopAnimation,getMode:()=>model.mode};
  }
  return {create,computeModeShape};
});
