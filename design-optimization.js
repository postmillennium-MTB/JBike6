(function (root, factory) {
  const api = factory();
  if (root) root.JBike6DesignOptimization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const format = (value, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : '—';
  const linspace = (min, max, count) => Array.from({ length: count }, (_, i) => min + (max-min)*i/(count-1));
  const getPath = (object, path) => path.reduce((value, key) => value == null ? undefined : value[key], object);
  const setPath = (object, path, value) => {
    let target=object;
    for(let i=0;i<path.length-1;i++)target=target[path[i]];
    target[path[path.length-1]]=value;
  };
  const clone = object => JSON.parse(JSON.stringify(object));

  function colorForScore(score, scale) {
    if (!Number.isFinite(score)) return '#b9b9ae';
    const t=clamp(score/Math.max(scale,1e-9),-1,1);
    const low=[52,115,108], mid=[242,240,232], high=[189,87,54];
    const a=t<0?low:mid, b=t<0?mid:high, f=Math.abs(t);
    return 'rgb('+a.map((value,index)=>Math.round(value+(b[index]-value)*f)).join(', ')+')';
  }

  function create(options) {
    const {state,assembleWhippleModel,maxRealEigenvalue,axes,onApply}=options||{};
    if(!state||typeof assembleWhippleModel!=='function'||typeof maxRealEigenvalue!=='function'||!axes){
      throw new TypeError('Design optimizer requires app state, the Whipple model/eigenvalue functions, and axis definitions.');
    }
    const axisEntries=Object.entries(axes);
    const ui={
      xAxis:$('optXAxis'),yAxis:$('optYAxis'),xMin:$('optXMin'),xMax:$('optXMax'),
      yMin:$('optYMin'),yMax:$('optYMax'),speedMin:$('optSpeedMin'),speedMax:$('optSpeedMax'),
      speedSteps:$('optSpeedSteps'),resolution:$('optResolution'),run:$('btnRunOptimization'),
      cancel:$('btnCancelOptimization'),apply:$('btnApplyOptimizedDesign'),canvas:$('optimizationCanvas'),
      status:$('optimizationStatus'),detail:$('optimizationSelectionDetail'),
      ranking:$('optimizationRanking'),progress:$('optimizationProgress')
    };
    const model={
      rows:[],xValues:[],yValues:[],selected:null,best:null,scale:0.1,
      plot:null,baseSignature:null,scanning:false,cancelled:false,scanFrame:null,
      scanConfig:null,completedRows:0,validCount:0
    };

    function getAxis(key){return axes[key]||axisEntries[0][1];}
    function currentValue(key){return Number(getPath(state.params,getAxis(key).path));}
    function defaultRange(key){
      const axis=getAxis(key),center=currentValue(key);
      return {min:clamp(center-axis.window,axis.hardMin,axis.hardMax),max:clamp(center+axis.window,axis.hardMin,axis.hardMax)};
    }
    function setStatus(message,kind='neutral'){
      ui.status.textContent=message;ui.status.dataset.kind=kind;
    }
    function fillAxisSelects(){
      const html=axisEntries.map(([key,axis])=>'<option value="'+key+'">'+axis.label+' ('+axis.unit+')</option>').join('');
      ui.xAxis.innerHTML=html;ui.yAxis.innerHTML=html;
      ui.xAxis.value='headAngleDeg' in axes?'headAngleDeg':axisEntries[0][0];
      ui.yAxis.value='forkOffsetMm' in axes?'forkOffsetMm':axisEntries[1][0];
      if(ui.xAxis.value===ui.yAxis.value)ui.yAxis.value=axisEntries[1][0];
    }
    function updateRanges(){
      const xr=defaultRange(ui.xAxis.value),yr=defaultRange(ui.yAxis.value);
      const xd=getAxis(ui.xAxis.value).digits,yd=getAxis(ui.yAxis.value).digits;
      ui.xMin.value=xr.min.toFixed(xd);ui.xMax.value=xr.max.toFixed(xd);
      ui.yMin.value=yr.min.toFixed(yd);ui.yMax.value=yr.max.toFixed(yd);
      ui.xMin.step=ui.xMax.step=xd>=2?'0.001':'0.1';
      ui.yMin.step=ui.yMax.step=yd>=2?'0.001':'0.1';
    }
    function readConfig(){
      const xKey=ui.xAxis.value,yKey=ui.yAxis.value;
      if(xKey===yKey)throw new Error('Choose two different design variables.');
      const xMin=Number(ui.xMin.value),xMax=Number(ui.xMax.value);
      const yMin=Number(ui.yMin.value),yMax=Number(ui.yMax.value);
      const speedMin=Number(ui.speedMin.value),speedMax=Number(ui.speedMax.value);
      const speedSteps=Number(ui.speedSteps.value),resolution=Number(ui.resolution.value);
      if(![xMin,xMax,yMin,yMax,speedMin,speedMax].every(Number.isFinite))throw new Error('Enter valid numeric bounds.');
      if(xMin>=xMax||yMin>=yMax)throw new Error('Each design-variable minimum must be smaller than its maximum.');
      const xa=getAxis(xKey),ya=getAxis(yKey);
      if(xMin<xa.hardMin||xMax>xa.hardMax||yMin<ya.hardMin||yMax>ya.hardMax)throw new Error('A design range exceeds the supported input bounds.');
      if(speedMin<0||speedMax<=speedMin||speedMax>40)throw new Error('Enter a valid forward-speed interval between 0 and 40 m/s.');
      if(!Number.isInteger(speedSteps)||speedSteps<5||speedSteps>31)throw new Error('Choose 5 to 31 speed samples.');
      if(!Number.isInteger(resolution)||resolution<7||resolution>31)throw new Error('Choose a design grid resolution between 7 and 31.');
      return {xKey,yKey,xMin,xMax,yMin,yMax,speedMin,speedMax,speedSteps,resolution};
    }
    function stopScan(message){
      model.cancelled=true;model.scanning=false;
      if(model.scanFrame!==null)cancelAnimationFrame(model.scanFrame);
      model.scanFrame=null;
      ui.run.disabled=false;ui.cancel.disabled=true;
      ui.run.textContent='Run optimization';
      if(message)setStatus(message,'warning');
    }
    function evaluateCandidate(baseParams,config,x,y,speeds){
      const params=clone(baseParams);
      setPath(params,getAxis(config.xKey).path,x);
      setPath(params,getAxis(config.yKey).path,y);
      let bicycleModel;
      try{bicycleModel=assembleWhippleModel(params);}
      catch(error){return null;}
      let worst=-Infinity,worstSpeed=NaN,valid=0;
      for(const speed of speeds){
        try{
          const result=maxRealEigenvalue(bicycleModel,speed);
          if(!result||!Number.isFinite(result.maxRe))continue;
          valid++;
          if(result.maxRe>worst){worst=result.maxRe;worstSpeed=speed;}
        }catch(error){/* Invalid operating points make this candidate incomplete. */}
      }
      return valid===speeds.length?{x,y,score:worst,worstSpeed,validSamples:valid}:null;
    }
    function run(){
      if(model.scanning)stopScan('Previous scan cancelled.');
      let config;
      try{config=readConfig();}catch(error){setStatus(error.message,'error');return;}
      const baseParams=clone(state.params);
      const signature=JSON.stringify(baseParams);
      const speeds=linspace(config.speedMin,config.speedMax,config.speedSteps);
      model.xValues=linspace(config.xMin,config.xMax,config.resolution);
      model.yValues=linspace(config.yMin,config.yMax,config.resolution);
      model.rows=Array.from({length:config.resolution},()=>Array(config.resolution).fill(null));
      model.selected=null;model.best=null;model.scale=0.1;model.baseSignature=signature;
      model.scanConfig=config;model.completedCandidates=0;model.validCount=0;model.scanning=true;model.cancelled=false;
      const totalCandidates=config.resolution*config.resolution;
      ui.run.disabled=true;ui.cancel.disabled=false;ui.apply.disabled=true;
      ui.run.textContent='Optimizing…';ui.progress.value=0;
      setStatus('Evaluating '+totalCandidates+' candidate designs over '+config.speedSteps+' speed samples each…','working');

      // Process a small batch per animation frame so even a 31 × 31 grid
      // with many speed samples keeps the controls responsive.
      const processBatch=()=>{
        if(model.cancelled)return;
        if(JSON.stringify(state.params)!==signature){
          stopScan('The active bicycle changed during the scan. Results were discarded; run the optimization again.');
          return;
        }
        const batchSize=6;
        for(let batch=0;batch<batchSize&&model.completedCandidates<totalCandidates;batch++){
          const iy=Math.floor(model.completedCandidates/config.resolution);
          const ix=model.completedCandidates%config.resolution;
          const candidate=evaluateCandidate(baseParams,config,model.xValues[ix],model.yValues[iy],speeds);
          model.rows[iy][ix]=candidate;
          if(candidate){model.validCount++;model.scale=Math.max(model.scale,Math.abs(candidate.score));}
          model.completedCandidates++;
        }
        ui.progress.value=model.completedCandidates/totalCandidates*100;
        setStatus('Evaluating candidate '+model.completedCandidates+' of '+totalCandidates+' · '+model.validCount+' valid so far…','working');
        draw();
        if(model.completedCandidates>=totalCandidates){finish();return;}
        model.scanFrame=requestAnimationFrame(processBatch);
      };
      model.scanFrame=requestAnimationFrame(processBatch);
    }
    function finish(){
      model.scanning=false;model.scanFrame=null;ui.run.disabled=false;ui.cancel.disabled=true;
      ui.run.textContent='Recalculate optimization';
      const candidates=model.rows.flat().filter(Boolean);
      if(!candidates.length){
        setStatus('No candidate produced a complete valid eigenvalue sweep. Expand or revise the design ranges.','error');
        renderSelection();draw();return;
      }
      candidates.sort((a,b)=>a.score-b.score);
      model.best=candidates[0];model.selected={ix:model.xValues.indexOf(model.best.x),iy:model.yValues.indexOf(model.best.y)};
      ui.apply.disabled=false;
      setStatus('Completed '+candidates.length+' valid designs. Best sampled worst-case max Re(λ) = '+format(model.best.score,5)+' s⁻¹.','success');
      renderSelection();renderRanking(candidates.slice(0,5));draw();
    }
    function selectedCandidate(){
      if(!model.selected)return null;
      const {ix,iy}=model.selected;
      return model.rows[iy]&&model.rows[iy][ix]||null;
    }
    function renderSelection(){
      const candidate=selectedCandidate();
      if(!candidate){
        ui.detail.textContent='Run the optimization to compare candidate designs.';
        ui.apply.disabled=true;return;
      }
      const x=getAxis(model.scanConfig.xKey),y=getAxis(model.scanConfig.yKey);
      const stable=candidate.score < -1e-6;
      const status=!Number.isFinite(candidate.score)?'No valid result':stable?'All sampled modes decay throughout the sampled speed interval':'At least one sampled mode is neutral or growing';
      ui.detail.innerHTML=
        '<div class="opt-detail-grid">'+
        '<div><span>'+x.short+'</span><strong>'+format(candidate.x,x.digits)+' '+x.unit+'</strong></div>'+
        '<div><span>'+y.short+'</span><strong>'+format(candidate.y,y.digits)+' '+y.unit+'</strong></div>'+
        '<div><span>Worst sampled max Re(λ)</span><strong>'+format(candidate.score,5)+' s⁻¹</strong></div>'+
        '<div><span>Worst sampled speed</span><strong>'+format(candidate.worstSpeed,2)+' m/s</strong></div>'+
        '</div><div class="opt-detail-status '+(stable?'stable':'unstable')+'">'+status+'</div>'+
        '<div class="opt-detail-foot">Objective: minimize the maximum real eigenvalue across '+candidate.validSamples+' sampled speeds. This is a sampled search, not a proof between speed samples.</div>';
      ui.apply.disabled=JSON.stringify(state.params)!==model.baseSignature;
    }
    function renderRanking(candidates){
      ui.ranking.innerHTML=candidates.map((candidate,index)=>{
        const x=getAxis(model.scanConfig.xKey),y=getAxis(model.scanConfig.yKey);
        return '<button type="button" class="opt-ranking-row" data-rank-index="'+index+'">'+
          '<span class="opt-rank-number">'+(index+1)+'</span>'+
          '<span><strong>'+format(candidate.x,x.digits)+' '+x.unit+'</strong><small>'+format(candidate.y,y.digits)+' '+y.unit+'</small></span>'+
          '<strong class="opt-rank-score">'+format(candidate.score,4)+' s⁻¹</strong></button>';
      }).join('');
      ui.ranking.querySelectorAll('[data-rank-index]').forEach(button=>{
        button.addEventListener('click',()=>{
          const index=Number(button.dataset.rankIndex);
          const candidate=candidates[index];
          selectCandidate(candidate.x,candidate.y);
        });
      });
    }
    function selectCandidate(x,y){
      if(!model.rows.length)return;
      let best=null,bestDistance=Infinity;
      for(let iy=0;iy<model.yValues.length;iy++)for(let ix=0;ix<model.xValues.length;ix++){
        const candidate=model.rows[iy][ix];if(!candidate)continue;
        const dx=candidate.x-x,dy=candidate.y-y,distance=dx*dx+dy*dy;
        if(distance<bestDistance){bestDistance=distance;best={ix,iy};}
      }
      if(best){model.selected=best;renderSelection();draw();}
    }
    function draw(){
      const canvas=ui.canvas,rect=canvas.getBoundingClientRect();
      const width=Math.max(320,rect.width),height=Math.max(300,rect.height),dpr=window.devicePixelRatio||1;
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      }
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      ctx.fillStyle='#f2f0e8';ctx.fillRect(0,0,width,height);
      if(!model.rows.length){
        ctx.fillStyle='#68716c';ctx.font='13px "IBM Plex Sans", sans-serif';ctx.textAlign='center';
        ctx.fillText('Run an optimization to map the design space.',width/2,height/2);return;
      }
      const pad={left:68,right:24,top:28,bottom:54};
      const plotW=width-pad.left-pad.right,plotH=height-pad.top-pad.bottom;
      const cellW=plotW/model.xValues.length,cellH=plotH/model.yValues.length;
      model.plot={...pad,plotW,plotH,cellW,cellH};
      for(let iy=0;iy<model.yValues.length;iy++)for(let ix=0;ix<model.xValues.length;ix++){
        const candidate=model.rows[iy][ix],x=pad.left+ix*cellW,y=pad.top+(model.yValues.length-1-iy)*cellH;
        ctx.fillStyle=candidate?colorForScore(candidate.score,model.scale):'#dedcd2';
        ctx.fillRect(x,y,cellW+0.5,cellH+0.5);
      }
      ctx.strokeStyle='rgba(71,85,105,.5)';ctx.lineWidth=1;ctx.strokeRect(pad.left,pad.top,plotW,plotH);
      const xAxis=getAxis(model.scanConfig.xKey),yAxis=getAxis(model.scanConfig.yKey);
      ctx.fillStyle='#46514f';ctx.font='11px "IBM Plex Sans", sans-serif';ctx.textAlign='center';
      ctx.fillText(xAxis.short+' ('+xAxis.unit+')',pad.left+plotW/2,height-14);
      ctx.save();ctx.translate(17,pad.top+plotH/2);ctx.rotate(-Math.PI/2);
      ctx.fillText(yAxis.short+' ('+yAxis.unit+')',0,0);ctx.restore();
      ctx.font='10px monospace';ctx.fillStyle='#68716c';
      ctx.textAlign='left';ctx.fillText(format(model.xValues[0],xAxis.digits),pad.left,pad.top+plotH+17);
      ctx.textAlign='right';ctx.fillText(format(model.xValues[model.xValues.length-1],xAxis.digits),pad.left+plotW,pad.top+plotH+17);
      ctx.textAlign='right';ctx.fillText(format(model.yValues[0],yAxis.digits),pad.left-8,pad.top+plotH);
      ctx.fillText(format(model.yValues[model.yValues.length-1],yAxis.digits),pad.left-8,pad.top+10);

      if(model.selected){
        const selected=selectedCandidate();
        if(selected){
          const ix=model.selected.ix,iy=model.selected.iy;
          const x=pad.left+ix*cellW,y=pad.top+(model.yValues.length-1-iy)*cellH;
          ctx.strokeStyle='#202a2e';ctx.lineWidth=2.5;ctx.strokeRect(x+1,y+1,Math.max(0,cellW-2),Math.max(0,cellH-2));
          ctx.beginPath();ctx.arc(x+cellW/2,y+cellH/2,4,0,Math.PI*2);ctx.fillStyle='#f2f0e8';ctx.fill();ctx.strokeStyle='#202a2e';ctx.stroke();
        }
      }
      ctx.fillStyle='#68716c';ctx.font='10px "IBM Plex Sans", sans-serif';ctx.textAlign='left';
      ctx.fillText('Color = worst-case max Re(λ) across speed interval · teal indicates decay; orange indicates growth',pad.left,pad.top-10);
    }
    function selectFromCanvas(event){
      if(!model.plot||!model.rows.length)return;
      const rect=ui.canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,p=model.plot;
      if(x<p.left||x>p.left+p.plotW||y<p.top||y>p.top+p.plotH)return;
      const ix=clamp(Math.floor((x-p.left)/p.cellW),0,model.xValues.length-1);
      const displayRow=clamp(Math.floor((y-p.top)/p.cellH),0,model.yValues.length-1);
      const iy=model.yValues.length-1-displayRow;
      if(!model.rows[iy][ix])return;
      model.selected={ix,iy};renderSelection();draw();
    }
    function applySelected(){
      const candidate=selectedCandidate();if(!candidate||JSON.stringify(state.params)!==model.baseSignature)return;
      const xKey=model.scanConfig.xKey,yKey=model.scanConfig.yKey;
      const patch={paths:[
        {path:getAxis(xKey).path,value:candidate.x},
        {path:getAxis(yKey).path,value:candidate.y}
      ]};
      if(typeof onApply==='function')onApply(patch);
      model.baseSignature=JSON.stringify(state.params);
      ui.apply.disabled=true;
      setStatus('Selected design applied to the active bicycle. Run again to explore around the new configuration.','success');
    }
    function activate(){
      if(model.rows.length&&JSON.stringify(state.params)!==model.baseSignature){
        ui.apply.disabled=true;
        setStatus('The active bicycle changed since this optimization. Re-run to refresh the design map.','warning');
      }
      draw();
    }
    function bind(){
      fillAxisSelects();updateRanges();
      ui.xAxis.addEventListener('change',updateRanges);
      ui.yAxis.addEventListener('change',updateRanges);
      ui.run.addEventListener('click',run);
      ui.cancel.addEventListener('click',()=>stopScan('Optimization cancelled.'));
      ui.apply.addEventListener('click',applySelected);
      ui.canvas.addEventListener('click',selectFromCanvas);
      window.addEventListener('resize',draw);
      ui.cancel.disabled=true;ui.apply.disabled=true;
    }
    bind();
    return {run,draw,activate,getResults:()=>model.rows,getBest:()=>model.best};
  }
  return {create,linspace,colorForScore};
});
