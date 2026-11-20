(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6PoleZeroLab = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const EPS = 1e-7;

  function distanceSquared(a, b) {
    const dr = a.re - b.re, di = a.im - b.im;
    return dr * dr + di * di;
  }

  // Exhaustive nearest-branch assignment is inexpensive for this 4-state model.
  function matchRootsToPrevious(previous, current) {
    const roots = (current || []).filter(r => r && Number.isFinite(r.re) && Number.isFinite(r.im));
    if (!previous || previous.length !== roots.length || roots.length < 2 || roots.length > 7) {
      return roots.slice().sort((a, b) => a.re - b.re || a.im - b.im);
    }
    let bestCost = Infinity, best = roots.slice();
    const used = new Array(roots.length).fill(false), candidate = [];
    function visit(index, cost) {
      if (cost >= bestCost) return;
      if (index === previous.length) { bestCost = cost; best = candidate.slice(); return; }
      for (let j = 0; j < roots.length; j++) {
        if (used[j]) continue;
        used[j] = true; candidate[index] = roots[j];
        visit(index + 1, cost + distanceSquared(previous[index], roots[j]));
        used[j] = false;
      }
    }
    visit(0, 0);
    return best;
  }

  function buildTracks(samples, field) {
    const ordered = (samples || []).slice().filter(s => Number.isFinite(s.v)).sort((a, b) => a.v - b.v);
    const tracks = [];
    let previous = null;
    ordered.forEach(sample => {
      const roots = matchRootsToPrevious(previous, sample[field] || []);
      roots.forEach((root, index) => {
        if (!tracks[index]) tracks[index] = [];
        tracks[index].push({ v: sample.v, re: root.re, im: root.im });
      });
      previous = roots;
    });
    return tracks.filter(track => track.length);
  }

  function classifyPole(pole) {
    if (!pole || !Number.isFinite(pole.re)) return 'unknown';
    if (pole.re < -EPS) return 'stable';
    if (pole.re > EPS) return 'unstable';
    return 'marginal';
  }

  function finitePoints(data) {
    const out = [];
    const add = (list, v) => (list || []).forEach(p => {
      if (p && Number.isFinite(p.re) && Number.isFinite(p.im) && Math.abs(p.re) < 100 && Math.abs(p.im) < 100) {
        out.push({ re: p.re, im: p.im, v: v });
      }
    });
    (data.samples || []).forEach(s => { add(s.poles, s.v); add(s.zeros, s.v); add(s.closedPoles, s.v); });
    if (data.current) {
      add(data.current.poles, data.current.v);
      add(data.current.zeros, data.current.v);
      add(data.current.closedPoles, data.current.v);
    }
    return out;
  }

  function create(options) {
    const opts = options || {};
    const canvas = opts.canvas, speedInput = opts.speedInput, speedReadout = opts.speedReadout;
    const selectionReadout = opts.selectionReadout, hoverReadout=opts.hoverReadout, btn2D = opts.btn2D, btn3D = opts.btn3D;
    const btnReset = opts.btnReset, btnZoomIn = opts.btnZoomIn, btnZoomOut = opts.btnZoomOut;
    if (!canvas || !canvas.getContext) throw new TypeError('Pole-zero canvas is required.');

    const state = {
      mode: '3d', camera: { yaw: -0.62, pitch: 0.48, zoom: 1 },
      data: null, extents: { reMin: -8, reMax: 6, imMax: 8 },
      tracks: { poles: [], zeros: [], closedPoles: [] }, visible:{poles:true,zeros:true,closed:true},
      pointer: null, dragging: false, moved: false, selected: null, plotArea: null, hover: null
    };

    function setupCanvas() {
      const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, width: rect.width, height: rect.height };
    }

    function updateExtents() {
      const points = finitePoints(state.data || {});
      if (!points.length) { state.extents = { reMin: -8, reMax: 6, imMax: 8 }; return; }
      const minRe = Math.min.apply(null, points.map(p => p.re));
      const maxRe = Math.max.apply(null, points.map(p => p.re));
      const maxIm = Math.max.apply(null, points.map(p => Math.abs(p.im)));
      const pad = Math.max(0.65, (maxRe - minRe) * 0.12);
      state.extents = {
        reMin: Math.min(-1, minRe - pad),
        reMax: Math.max(1, maxRe + pad),
        imMax: Math.max(1.5, maxIm * 1.16)
      };
      if (state.extents.reMax - state.extents.reMin < 2) {
        state.extents.reMin -= 1; state.extents.reMax += 1;
      }
    }

    function project3D(point, width, height) {
      const cam = state.camera, cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      const x1 = point.x * cy - point.z * sy, z1 = point.x * sy + point.z * cy;
      const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const y2 = point.y * cp - z1 * sp, z2 = point.y * sp + z1 * cp;
      const fov = 6.4, perspective = fov / Math.max(1.15, fov - z2);
      const scale = Math.min(width, height) * 0.43 * cam.zoom * perspective;
      return { x: width * 0.5 + x1 * scale, y: height * 0.54 - y2 * scale, depth: z2 };
    }

    function projectRoot(point, width, height) {
      const ext = state.extents, reHalf = Math.max(Math.abs(ext.reMin), Math.abs(ext.reMax), 1);
      const span = state.data.maxSpeed - state.data.minSpeed;
      const z = span > 1e-8 ? 2 * (point.v - state.data.minSpeed) / span - 1 : 0;
      return project3D({ x: point.re / reHalf, y: point.im / ext.imMax, z: z }, width, height);
    }

    function coord(re, im, z) {
      const ext = state.extents, reHalf = Math.max(Math.abs(ext.reMin), Math.abs(ext.reMax), 1);
      return { x: re / reHalf, y: im / ext.imMax, z: z };
    }
    function speedZ(v) {
      const span = state.data.maxSpeed - state.data.minSpeed;
      return span > 1e-8 ? 2 * (v - state.data.minSpeed) / span - 1 : 0;
    }
    function drawLine(ctx, a, b, color, width, dash) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width || 1; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.restore();
    }

    function drawCross(ctx, p, color, size, width) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width || 2;
      ctx.beginPath(); ctx.moveTo(p.x-size,p.y-size); ctx.lineTo(p.x+size,p.y+size);
      ctx.moveTo(p.x+size,p.y-size); ctx.lineTo(p.x-size,p.y+size); ctx.stroke(); ctx.restore();
    }
    function drawRing(ctx, p) {
      ctx.save(); ctx.strokeStyle = '#202a2e'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }

    function drawCurrentMarkers(ctx, width, height, is3D) {
      const cur = state.data.current;
      const at = p => is3D ? projectRoot({ re:p.re, im:p.im, v:cur.v },width,height) : to2D(p);
      if(state.visible.poles)(cur.poles || []).forEach((p,i) => {
        const q = at(p), status = classifyPole(p);
        drawCross(ctx,q,status === 'stable' ? '#34736c' : status === 'unstable' ? '#bd5736' : '#bd5736',5.5,2.2);
        if (state.selected && state.selected.kind === 'pole' && state.selected.index === i) drawRing(ctx,q);
      });
      if(state.visible.zeros)(cur.zeros || []).forEach((p,i) => {
        const q=at(p); ctx.save(); ctx.strokeStyle='#bd5736'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(q.x,q.y,6,0,Math.PI*2); ctx.stroke(); ctx.restore();
        if (state.selected && state.selected.kind==='zero' && state.selected.index===i) drawRing(ctx,q);
      });
      if(state.visible.closed)(cur.closedPoles || []).forEach((p,i) => {
        const q=at(p); ctx.save(); ctx.strokeStyle='#bd5736'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(q.x,q.y-5); ctx.lineTo(q.x+5,q.y); ctx.lineTo(q.x,q.y+5); ctx.lineTo(q.x-5,q.y); ctx.closePath(); ctx.stroke(); ctx.restore();
        if (state.selected && state.selected.kind==='closed' && state.selected.index===i) drawRing(ctx,q);
      });
    }

    function draw3D(ctx,width,height) {
      const data=state.data, ext=state.extents;
      const reHalf=Math.max(Math.abs(ext.reMin),Math.abs(ext.reMax),1), imHalf=ext.imMax;
      const proj=p=>project3D(p,width,height), p3=(re,im,z)=>coord(re,im,z);
      ctx.fillStyle='#f2f0e8'; ctx.fillRect(0,0,width,height);

      // Vertical Re(s)=0 plane is the actual stability boundary.
      const stability=[
        proj(p3(0,-imHalf,-1)),proj(p3(0,imHalf,-1)),
        proj(p3(0,imHalf,1)),proj(p3(0,-imHalf,1))
      ];
      ctx.save(); ctx.fillStyle='rgba(52,115,108,.10)'; ctx.strokeStyle='rgba(52,115,108,.62)'; ctx.lineWidth=1.3;
      ctx.beginPath(); stability.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      [-.5,0,.5].forEach(z=>drawLine(ctx,proj(p3(0,-imHalf,z)),proj(p3(0,imHalf,z)),'rgba(52,115,108,.22)',1));
      [-.5,0,.5].forEach(y=>drawLine(ctx,proj(p3(0,y*imHalf,-1)),proj(p3(0,y*imHalf,1)),'rgba(52,115,108,.22)',1));

      // Amber slice marks the currently selected bicycle speed.
      const zNow=speedZ(data.current.v);
      const slice=[proj(p3(ext.reMin,-imHalf,zNow)),proj(p3(ext.reMax,-imHalf,zNow)),proj(p3(ext.reMax,imHalf,zNow)),proj(p3(ext.reMin,imHalf,zNow))];
      ctx.save();ctx.fillStyle='rgba(189,87,54,.06)';ctx.strokeStyle='rgba(189,87,54,.62)';ctx.lineWidth=1;ctx.setLineDash([5,4]);
      ctx.beginPath();slice.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();

      // Bounding box.
      const corners=[];
      [-1,1].forEach(x=>[-1,1].forEach(y=>[-1,1].forEach(z=>corners.push({x:x,y:y,z:z}))));
      [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]].forEach(e=>
        drawLine(ctx,proj(corners[e[0]]),proj(corners[e[1]]),'rgba(104,113,108,.25)',.8));

      // Axes: real part, imaginary part, and forward speed.
      const origin=proj({x:0,y:0,z:-1}), reEnd=proj({x:1.08,y:0,z:-1});
      const imEnd=proj({x:0,y:1.08,z:-1}), speedEnd=proj({x:0,y:0,z:1.08});
      drawLine(ctx,origin,reEnd,'#46514f',1.8);drawLine(ctx,origin,imEnd,'#68716c',1.8);drawLine(ctx,origin,speedEnd,'#68716c',1.8);
      ctx.font='700 10px "IBM Plex Sans", sans-serif';ctx.textAlign='left';
      ctx.fillStyle='#46514f';ctx.fillText('Re(s) · growth / decay',reEnd.x+4,reEnd.y+3);
      ctx.fillStyle='#68716c';ctx.fillText('Im(s) · rad/s',imEnd.x+4,imEnd.y-5);
      ctx.fillStyle='#68716c';ctx.fillText('Forward speed · m/s',speedEnd.x+4,speedEnd.y+3);

      ctx.font='9px "IBM Plex Mono", monospace';ctx.fillStyle='#68716c';ctx.textAlign='center';
      for(let i=-2;i<=2;i++){
        const rv=reHalf*i/2, rp=proj(p3(rv,0,-1));ctx.fillText(rv.toFixed(1),rp.x,rp.y+13);
        const iv=imHalf*i/2, ip=proj(p3(0,iv,-1));ctx.fillText(iv.toFixed(1),ip.x-10,ip.y-5);
      }
      ctx.textAlign='left';
      const v0=proj({x:0,y:0,z:-1}),v1=proj({x:0,y:0,z:1});
      ctx.fillText(data.minSpeed.toFixed(1),v0.x+5,v0.y+16);ctx.fillText(data.maxSpeed.toFixed(1),v1.x+5,v1.y+16);

      // Continuity-matched pole branches, colored by stable / unstable half-plane.
      if(state.visible.poles)state.tracks.poles.forEach(track=>{
        for(let i=1;i<track.length;i++){
          const a=track[i-1],b=track[i],color=(a.re+b.re)/2 < -EPS?'rgba(52,115,108,.88)':'rgba(189,87,54,.88)';
          drawLine(ctx,projectRoot(a,width,height),projectRoot(b,width,height),color,1.85);
        }
      });
      if(state.visible.zeros)state.tracks.zeros.forEach(track=>{
        ctx.save();ctx.strokeStyle='rgba(189,87,54,.78)';ctx.lineWidth=1.35;ctx.setLineDash([4,3]);ctx.beginPath();
        track.forEach((p,i)=>{const q=projectRoot(p,width,height);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});
        ctx.stroke();ctx.restore();
      });
      if(state.visible.closed)state.tracks.closedPoles.forEach(track=>{
        for(let i=1;i<track.length;i++)drawLine(ctx,projectRoot(track[i-1],width,height),projectRoot(track[i],width,height),'rgba(189,87,54,.72)',1.3,[4,3]);
      });
      drawCurrentMarkers(ctx,width,height,true);
      ctx.fillStyle='#34736c';ctx.font='700 10px "IBM Plex Sans", sans-serif';ctx.fillText('Re(s) = 0 · stability boundary',12,18);
      ctx.fillStyle='#bd5736';ctx.fillText('Dashed orange plane · selected operating speed',12,33);
    }

    function to2D(p) {
      const e=state.extents,a=state.plotArea;
      return {x:a.left+(p.re-e.reMin)/(e.reMax-e.reMin)*a.width,y:a.top+(e.imMax-p.im)/(2*e.imMax)*a.height};
    }

    function draw2D(ctx,width,height) {
      const e=state.extents,pad={left:48,right:17,top:17,bottom:35};
      const area={left:pad.left,top:pad.top,width:width-pad.left-pad.right,height:height-pad.top-pad.bottom};
      state.plotArea=area;ctx.fillStyle='#f2f0e8';ctx.fillRect(0,0,width,height);
      const zeroX=area.left+(0-e.reMin)/(e.reMax-e.reMin)*area.width;
      ctx.fillStyle='rgba(52,115,108,.08)';ctx.fillRect(area.left,area.top,Math.max(0,zeroX-area.left),area.height);
      ctx.font='9px "IBM Plex Mono", monospace';ctx.fillStyle='#68716c';ctx.textAlign='center';
      for(let i=0;i<=6;i++){
        const re=e.reMin+(e.reMax-e.reMin)*i/6,x=area.left+area.width*i/6;
        ctx.strokeStyle=Math.abs(re)<1e-7?'#46514f':'#b9b9ae';ctx.lineWidth=Math.abs(re)<1e-7?1.5:1;
        ctx.beginPath();ctx.moveTo(x,area.top);ctx.lineTo(x,area.top+area.height);ctx.stroke();ctx.fillText(re.toFixed(1),x,area.top+area.height+14);
      }
      ctx.textAlign='right';
      for(let i=-2;i<=2;i++){
        const im=e.imMax*i/2,y=area.top+(e.imMax-im)/(2*e.imMax)*area.height;
        ctx.strokeStyle=i===0?'#46514f':'#b9b9ae';ctx.beginPath();ctx.moveTo(area.left,y);ctx.lineTo(area.left+area.width,y);ctx.stroke();ctx.fillText(im.toFixed(1),area.left-6,y+3);
      }
      ctx.fillStyle='#46514f';ctx.textAlign='center';ctx.font='600 10px "IBM Plex Sans", sans-serif';
      ctx.fillText('Re(s) [1/s]  ← stable | unstable →',area.left+area.width/2,height-5);
      ctx.save();ctx.translate(12,area.top+area.height/2);ctx.rotate(-Math.PI/2);ctx.fillText('Im(s) [rad/s]',0,0);ctx.restore();
      ctx.save();ctx.beginPath();ctx.rect(area.left,area.top,area.width,area.height);ctx.clip();
      drawCurrentMarkers(ctx,width,height,false);ctx.restore();ctx.strokeStyle='#b9b9ae';ctx.strokeRect(area.left,area.top,area.width,area.height);
    }

    function selectedPoint() {
      if(!state.selected||!state.data)return null;
      const key=state.selected.kind==='pole'?'poles':state.selected.kind==='zero'?'zeros':'closedPoles';
      const item=(state.data.current[key]||[])[state.selected.index];
      return item?{item:item,kind:state.selected.kind}:null;
    }
    function updateReadout() {
      if(!selectionReadout)return;
      const chosen=selectedPoint();
      if(!chosen){selectionReadout.textContent='Select a pole or zero in the plot to inspect its location and dynamics.';return;}
      const p=chosen.item,role=chosen.kind==='pole'?'Open-loop pole':chosen.kind==='closed'?'Closed-loop pole':'Transmission zero';
      const value=p.re.toFixed(4)+(p.im<0?' − ':' + ')+Math.abs(p.im).toFixed(4)+'i';
      if(chosen.kind==='zero'){
        selectionReadout.textContent=role+'  s = '+value+'  |  '+(p.re<0?'LHP':'RHP / imaginary-axis');
        return;
      }
      const wn=Math.hypot(p.re,p.im),zeta=wn>1e-10?-p.re/wn:0;
      selectionReadout.textContent=role+'  s = '+value+'  |  '+classifyPole(p).toUpperCase()+
        '  |  ωn = '+wn.toFixed(3)+' rad/s  |  f = '+(Math.abs(p.im)/(2*Math.PI)).toFixed(3)+' Hz  |  ζ = '+zeta.toFixed(3);
    }
    function findHit(x,y) {
      const cur=state.data.current,sets=[
        {kind:'pole',items:state.visible.poles?(cur.poles||[]):[]},{kind:'zero',items:state.visible.zeros?(cur.zeros||[]):[]},{kind:'closed',items:state.visible.closed?(cur.closedPoles||[]):[]}
      ];
      let hit=null,best=18*18;
      sets.forEach(set=>set.items.forEach((p,index)=>{
        const q=state.mode==='3d'?projectRoot({re:p.re,im:p.im,v:cur.v},canvas.clientWidth,canvas.clientHeight):to2D(p);
        const d=(q.x-x)*(q.x-x)+(q.y-y)*(q.y-y);
        if(d<best){best=d;hit={kind:set.kind,index:index};}
      }));
      return hit;
    }

    function render() {
      if(!state.data)return;
      const surface=setupCanvas();surface.ctx.clearRect(0,0,surface.width,surface.height);
      if(state.mode==='3d')draw3D(surface.ctx,surface.width,surface.height);else draw2D(surface.ctx,surface.width,surface.height);
      drawHoverCrosshair(surface.ctx,surface.width,surface.height);updateHoverReadout();
      if(speedInput){
        speedInput.min=String(state.data.minSpeed);speedInput.max=String(state.data.maxSpeed);speedInput.step='0.05';
        speedInput.value=String(Math.max(state.data.minSpeed,Math.min(state.data.maxSpeed,state.data.current.v)));
      }
      if(speedReadout)speedReadout.textContent=state.data.current.v.toFixed(2)+' m/s';
      updateReadout();
    }

    function updateHoverReadout(){if(!hoverReadout||!state.hover||!state.data)return;if(state.mode==='2d'&&state.plotArea){const a=state.plotArea,x=state.hover.x,y=state.hover.y;if(x>=a.left&&x<=a.left+a.width&&y>=a.top&&y<=a.top+a.height){const re=state.extents.reMin+(x-a.left)/a.width*(state.extents.reMax-state.extents.reMin);const im=state.extents.imMax-(y-a.top)/a.height*2*state.extents.imMax;hoverReadout.textContent='Cursor · Re(s) '+re.toFixed(3)+' s⁻¹ · Im(s) '+im.toFixed(3)+' rad/s';return;}}hoverReadout.textContent=state.mode==='3d'?'3D cursor · select a marker to inspect its exact pole/zero and speed.':'Move within the plot to read Re(s) and Im(s).';}
    function drawHoverCrosshair(ctx,width,height){
      if(!state.hover)return;
      const x=state.hover.x,y=state.hover.y;
      ctx.save();ctx.strokeStyle='rgba(189,87,54,.8)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();
      ctx.setLineDash([]);ctx.fillStyle='#0f766e';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function setCameraPreset(name){
      const presets={front:{yaw:0,pitch:.12,zoom:1},side:{yaw:Math.PI/2,pitch:.18,zoom:1},top:{yaw:0,pitch:1.18,zoom:1}};
      if(presets[name]){state.camera=Object.assign({},presets[name]);render();}
    }

    function setMode(mode) {
      state.mode=mode==='2d'?'2d':'3d';
      if(btn2D){btn2D.classList.toggle('active',state.mode==='2d');btn2D.setAttribute('aria-pressed',String(state.mode==='2d'));}
      if(btn3D){btn3D.classList.toggle('active',state.mode==='3d');btn3D.setAttribute('aria-pressed',String(state.mode==='3d'));}
      canvas.style.cursor=state.mode==='3d'?'grab':'crosshair';document.querySelectorAll('.pz-camera-presets').forEach(el=>el.style.display=state.mode==='3d'?'inline-flex':'none');render();
    }
    function zoom(factor){state.camera.zoom=Math.max(.55,Math.min(2.6,state.camera.zoom*factor));render();}

    function bind() {
      if(btn2D)btn2D.addEventListener('click',()=>setMode('2d'));
      if(btn3D)btn3D.addEventListener('click',()=>setMode('3d'));
      if(btnReset)btnReset.addEventListener('click',()=>{state.camera={yaw:-.62,pitch:.48,zoom:1};render();});
      if(btnZoomIn)btnZoomIn.addEventListener('click',()=>zoom(1.16));
      if(btnZoomOut)btnZoomOut.addEventListener('click',()=>zoom(1/1.16));
      document.querySelectorAll('[data-pz-trace]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.pzTrace;state.visible[key]=!state.visible[key];button.classList.toggle('active',state.visible[key]);button.setAttribute('aria-pressed',String(state.visible[key]));if(state.selected&&((state.selected.kind==='pole'&&!state.visible.poles)||(state.selected.kind==='zero'&&!state.visible.zeros)||(state.selected.kind==='closed'&&!state.visible.closed)))state.selected=null;render();}));
      document.querySelectorAll('[data-pz-camera]').forEach(button=>button.addEventListener('click',()=>setCameraPreset(button.dataset.pzCamera)));
      if(speedInput)speedInput.addEventListener('input',()=>{if(typeof opts.onSpeedChange==='function')opts.onSpeedChange(Number(speedInput.value));});
      canvas.addEventListener('pointerdown',event=>{
        state.pointer={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY};
        state.dragging=state.mode==='3d';state.moved=false;
        if(canvas.setPointerCapture)canvas.setPointerCapture(event.pointerId);
      });
      canvas.addEventListener('pointermove',event=>{
        if(!state.pointer||state.pointer.id!==event.pointerId||!state.dragging){const rect=canvas.getBoundingClientRect();state.hover={x:event.clientX-rect.left,y:event.clientY-rect.top};render();return;}
        const dx=event.clientX-state.pointer.x,dy=event.clientY-state.pointer.y;
        state.pointer.x=event.clientX;state.pointer.y=event.clientY;
        if(Math.abs(event.clientX-state.pointer.startX)+Math.abs(event.clientY-state.pointer.startY)>4)state.moved=true;
        state.camera.yaw-=dx*.008;state.camera.pitch=Math.max(-.65,Math.min(1.35,state.camera.pitch+dy*.008));render();
      });
      const finish=event=>{
        if(!state.pointer||state.pointer.id!==event.pointerId)return;
        if(!state.moved){
          const rect=canvas.getBoundingClientRect(),hit=findHit(event.clientX-rect.left,event.clientY-rect.top);
          if(hit){state.selected=hit;render();}
        }
        state.pointer=null;state.dragging=false;
      };
      canvas.addEventListener('pointerup',finish);
      canvas.addEventListener('pointercancel',()=>{state.pointer=null;state.dragging=false;});
      canvas.addEventListener('pointerleave',()=>{state.hover=null;render();});
      canvas.addEventListener('wheel',event=>{
        if(state.mode!=='3d')return;event.preventDefault();zoom(event.deltaY>0?.92:1.08);
      },{passive:false});
      canvas.style.touchAction='none';canvas.style.cursor='grab';
      window.addEventListener('resize',render);
    }

    function update(data) {
      if(!data||!Array.isArray(data.samples)||!data.current)return;
      state.data=data;
      state.tracks={poles:buildTracks(data.samples,'poles'),zeros:buildTracks(data.samples,'zeros'),closedPoles:buildTracks(data.samples,'closedPoles')};
      state.selected=null;updateExtents();render();
    }
    bind();
    return {update:update,render:render,setMode:setMode,zoom:zoom,setCameraPreset:setCameraPreset,getCamera:()=>Object.assign({},state.camera)};
  }

  return {create:create,matchRootsToPrevious:matchRootsToPrevious,buildTracks:buildTracks,classifyPole:classifyPole};
});
