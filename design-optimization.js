(function (root, factory) {
  const api = factory();
  if (root) root.JBike6DesignOptimization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const format = (value, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : '—';
  const linspace = (min, max, count) => Array.from({ length: count }, (_, i) => min + (max-min)*i/(count-1));
  const sampleResponse = (speeds, sampleAtSpeed) => speeds.map(speed => {
    let value = null;
    try {
      const sampled = sampleAtSpeed(speed);
      if (Number.isFinite(sampled)) value = sampled;
    } catch (error) {
      // Preserve a gap in the plot when a speed sample cannot be evaluated.
    }
    return { speed, value };
  });
  const findWorstResponse = series => {
    let worst = null;
    for (const point of series || []) {
      if (!point || !Number.isFinite(point.value)) continue;
      if (!worst || point.value > worst.value) worst = point;
    }
    return worst;
  };
  const niceStep = rawStep => {
    if (!Number.isFinite(rawStep) || rawStep <= 0) return 0.1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return factor * magnitude;
  };
  const responseDomain = seriesList => {
    const values = (seriesList || []).flatMap(series => (series || [])
      .map(point => point && point.value)
      .filter(Number.isFinite));
    if (!values.length) return { min: -1, max: 1, step: 0.5, ticks: [-1, -0.5, 0, 0.5, 1] };
    let minValue = Math.min(0, ...values);
    let maxValue = Math.max(0, ...values);
    const spread = maxValue - minValue;
    const step = niceStep(spread > 0 ? spread / 4 : Math.max(Math.abs(maxValue), 0.1) / 2);
    let min = Math.floor(minValue / step) * step;
    let max = Math.ceil(maxValue / step) * step;
    if (min === 0) min = -step;
    if (max === 0) max = step;
    if (min === max) { min -= step; max += step; }
    const ticks = [];
    const count = Math.min(12, Math.round((max - min) / step));
    for (let i = 0; i <= count; i++) ticks.push(Number((min + i * step).toPrecision(12)));
    return { min, max, step, ticks };
  };
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
      ranking:$('optimizationRanking'),progress:$('optimizationProgress'),summary:$('optimizationResponseSummary')
    };
    const model={
      rows:[],xValues:[],yValues:[],selected:null,best:null,baseParams:null,
      response:null,baseSignature:null,scanning:false,cancelled:false,scanFrame:null,
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
      model.selected=null;model.best=null;model.response=null;model.baseParams=baseParams;model.baseSignature=signature;
      model.scanConfig=config;model.completedCandidates=0;model.validCount=0;model.scanning=true;model.cancelled=false;
      renderResponseSummary(null);
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
          if(candidate)model.validCount++;
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
      model.response=buildResponseComparison(candidate);
      renderResponseSummary(model.response);
      draw();
    }
    function buildResponseComparison(candidate){
      if(!candidate||!model.baseParams||!model.scanConfig)return null;
      const config=model.scanConfig;
      const speeds=linspace(config.speedMin,config.speedMax,config.speedSteps);
      const startingModel=(()=>{try{return assembleWhippleModel(clone(model.baseParams));}catch(error){return null;}})();
      const candidateParams=clone(model.baseParams);
      setPath(candidateParams,getAxis(config.xKey).path,candidate.x);
      setPath(candidateParams,getAxis(config.yKey).path,candidate.y);
      const selectedModel=(()=>{try{return assembleWhippleModel(candidateParams);}catch(error){return null;}})();
      const evaluateCurve=bicycleModel=>bicycleModel
        ? sampleResponse(speeds,speed=>{
            const result=maxRealEigenvalue(bicycleModel,speed);
            return result&&result.maxRe;
          })
        : speeds.map(speed=>({speed,value:null}));
      const starting=evaluateCurve(startingModel);
      const selected=evaluateCurve(selectedModel);
      return {
        speeds,starting,selected,
        startingWorst:findWorstResponse(starting),
        selectedWorst:findWorstResponse(selected),
        speedSamples:speeds.length
      };
    }
    function renderResponseSummary(response){
      if(!ui.summary)return;
      if(!response){
        ui.summary.innerHTML='<div class="opt-response-empty">Run the search and select a candidate to compare its response across speed.</div>';
        return;
      }
      const fmtWorst=point=>point
        ? '<strong>'+format(point.value,5)+' s⁻¹</strong><small>Worst at '+format(point.speed,2)+' m/s</small>'
        : '<strong>—</strong><small>No valid speed samples</small>';
      const start=fmtWorst(response.startingWorst);
      const selected=fmtWorst(response.selectedWorst);
      const delta=response.startingWorst&&response.selectedWorst
        ? response.selectedWorst.value-response.startingWorst.value : NaN;
      const deltaLabel=Number.isFinite(delta)?(delta>0?'+':'')+format(delta,5)+' s⁻¹':'—';
      const deltaClass=!Number.isFinite(delta)?'neutral':delta < -1e-8?'better':delta > 1e-8?'worse':'neutral';
      const validStart=response.starting.filter(point=>Number.isFinite(point.value)).length;
      const validSelected=response.selected.filter(point=>Number.isFinite(point.value)).length;
      ui.summary.innerHTML=
        '<div class="opt-response-metric"><span>STARTING BICYCLE · WORST</span>'+start+'</div>'+
        '<div class="opt-response-metric"><span>SELECTED CANDIDATE · WORST</span>'+selected+'</div>'+
        '<div class="opt-response-metric '+deltaClass+'"><span>CHANGE IN WORST-CASE RATE</span><strong>'+deltaLabel+'</strong><small>Candidate minus starting bicycle</small></div>'+
        '<div class="opt-response-sample-note">'+validStart+'/'+response.speedSamples+' starting samples · '+validSelected+'/'+response.speedSamples+' candidate samples evaluated</div>';
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
      const width=Math.max(320,rect.width||320),height=Math.max(300,rect.height||340),dpr=window.devicePixelRatio||1;
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      }
      const ctx=canvas.getContext('2d');if(!ctx)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      ctx.fillStyle='#f2f0e8';ctx.fillRect(0,0,width,height);
      const response=model.response;
      if(!response){
        ctx.fillStyle='#68716c';ctx.font='13px "IBM Plex Sans", sans-serif';ctx.textAlign='center';
        ctx.fillText('Run the optimization to compare stability across speed.',width/2,height/2);
        return;
      }
      const allValues=[...response.starting,...response.selected]
        .map(point=>point.value).filter(Number.isFinite);
      if(!allValues.length){
        ctx.fillStyle='#bd5736';ctx.font='13px "IBM Plex Sans", sans-serif';ctx.textAlign='center';
        ctx.fillText('No valid eigenvalue samples are available for this comparison.',width/2,height/2);
        return;
      }
      const domain=responseDomain([response.starting,response.selected]);
      const pad={left:76,right:22,top:34,bottom:54};
      const plotW=Math.max(1,width-pad.left-pad.right),plotH=Math.max(1,height-pad.top-pad.bottom);
      const speedMin=response.speeds[0],speedMax=response.speeds[response.speeds.length-1];
      const toX=speed=>pad.left+(speed-speedMin)/(speedMax-speedMin)*plotW;
      const toY=value=>pad.top+(domain.max-value)/(domain.max-domain.min)*plotH;
      ctx.font='10px "IBM Plex Mono", monospace';
      ctx.textAlign='right';ctx.textBaseline='middle';
      domain.ticks.forEach(tick=>{
        const y=toY(tick);
        ctx.beginPath();
        ctx.strokeStyle=Math.abs(tick)<1e-12?'#747a72':'#dedcd2';
        ctx.lineWidth=Math.abs(tick)<1e-12?1.7:1;
        ctx.setLineDash(Math.abs(tick)<1e-12?[]:[2,4]);
        ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+plotW,y);ctx.stroke();
        ctx.fillStyle='#68716c';
        ctx.fillText(format(tick,Math.abs(domain.step)>=1?1:Math.abs(domain.step)>=0.1?2:3),pad.left-9,y);
      });
      ctx.setLineDash([]);
      const xTicks=5;
      ctx.textAlign='center';ctx.textBaseline='top';
      for(let i=0;i<xTicks;i++){
        const speed=speedMin+(speedMax-speedMin)*i/(xTicks-1);
        const x=toX(speed);
        ctx.beginPath();ctx.strokeStyle='#e3e0d6';ctx.lineWidth=1;
        ctx.moveTo(x,pad.top);ctx.lineTo(x,pad.top+plotH);ctx.stroke();
        ctx.fillStyle='#68716c';ctx.fillText(format(speed,2),x,pad.top+plotH+9);
      }
      ctx.strokeStyle='#747a72';ctx.lineWidth=1;ctx.strokeRect(pad.left,pad.top,plotW,plotH);
      const drawSeries=(series,color,dash,lineWidth)=>{
        ctx.save();ctx.beginPath();ctx.rect(pad.left,pad.top,plotW,plotH);ctx.clip();
        ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(dash);
        let started=false;
        series.forEach(point=>{
          if(!Number.isFinite(point.value)){started=false;return;}
          const x=toX(point.speed),y=toY(point.value);
          if(!started){ctx.beginPath();ctx.moveTo(x,y);started=true;}
          else ctx.lineTo(x,y);
        });
        ctx.stroke();ctx.restore();
      };
      drawSeries(response.starting,'#202a2e',[],2.6);
      drawSeries(response.selected,'#34736c',[7,4],2.6);
      const drawWorst=(point,color,filled)=>{
        if(!point)return;
        const x=toX(point.speed),y=toY(point.value);
        ctx.beginPath();ctx.arc(x,y,4.5,0,Math.PI*2);
        ctx.fillStyle=filled?color:'#f2f0e8';ctx.fill();
        ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
      };
      drawWorst(response.startingWorst,'#202a2e',true);
      drawWorst(response.selectedWorst,'#34736c',false);
      ctx.fillStyle='#46514f';ctx.font='600 10px "IBM Plex Sans", sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.fillText('FORWARD SPEED (m/s)',pad.left+plotW/2,height-12);
      ctx.save();ctx.translate(15,pad.top+plotH/2);ctx.rotate(-Math.PI/2);
      ctx.fillText('MAXIMUM EIGENVALUE GROWTH RATE (s⁻¹)',0,0);ctx.restore();
      const zeroY=toY(0);
      ctx.fillStyle='#46514f';ctx.font='500 9px "IBM Plex Mono", monospace';ctx.textAlign='left';
      ctx.fillText('Re(λ) = 0 · NEUTRAL BOUNDARY',pad.left+6,Math.max(pad.top+10,zeroY-6));
      canvas.setAttribute('aria-label',
        'Line chart of maximum real eigenvalue versus forward speed. Solid graphite line is the starting bicycle; dashed teal line is the selected candidate. The horizontal zero line is the neutral stability boundary. Starting worst rate: '+
        (response.startingWorst?format(response.startingWorst.value,5)+' per second at '+format(response.startingWorst.speed,2)+' meters per second':'unavailable')+
        '. Candidate worst rate: '+(response.selectedWorst?format(response.selectedWorst.value,5)+' per second at '+format(response.selectedWorst.speed,2)+' meters per second':'unavailable')+'.');
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
      window.addEventListener('resize',draw);
      ui.cancel.disabled=true;ui.apply.disabled=true;
    }
    bind();
    return {run,draw,activate,getResults:()=>model.rows,getBest:()=>model.best};
  }
  return {create,linspace,sampleResponse,findWorstResponse,niceStep,responseDomain};
});
