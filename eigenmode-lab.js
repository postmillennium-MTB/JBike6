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
  const sub = (a, b) => c(a.re - b.re, a.im - b.im);
  const scale = (a, k) => c(a.re * k, a.im * k);
  const conj = a => c(a.re, -a.im);
  const mul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const abs = a => Math.hypot(a.re, a.im);
  const arg = a => Math.atan2(a.im, a.re);
  const fmt = (value, digits = 3) => Number.isFinite(value) ? value.toFixed(digits) : '—';
  const wrapDegrees = degrees => ((degrees + 180) % 360 + 360) % 360 - 180;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function invert2(matrix) {
    const determinant = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (!Number.isFinite(determinant) || Math.abs(determinant) < EPS) {
      throw new Error('The mass matrix is singular at this operating point.');
    }
    return [
      [matrix[1][1] / determinant, -matrix[0][1] / determinant],
      [-matrix[1][0] / determinant, matrix[0][0] / determinant]
    ];
  }

  function multiply2(a, b) {
    return [
      [a[0][0]*b[0][0] + a[0][1]*b[1][0], a[0][0]*b[0][1] + a[0][1]*b[1][1]],
      [a[1][0]*b[0][0] + a[1][1]*b[1][0], a[1][0]*b[0][1] + a[1][1]*b[1][1]]
    ];
  }

  function stateMatrixFor(model, speed) {
    const invM = invert2(model.M);
    const speedC = model.C1.map(row => row.map(value => value * speed));
    const speedK = model.K2.map(row => row.map(value => value * speed * speed));
    const gravityK = model.K0.map(row => row.map(value => value * model.g));
    const stiffness = gravityK.map((row, i) => row.map((value, j) => value + speedK[i][j]));
    const Cbar = multiply2(invM, speedC);
    const Kbar = multiply2(invM, stiffness);
    return [
      [0, 1, 0, 0],
      [-Kbar[0][0], -Cbar[0][0], -Kbar[0][1], -Cbar[0][1]],
      [0, 0, 0, 1],
      [-Kbar[1][0], -Cbar[1][0], -Kbar[1][1], -Cbar[1][1]]
    ];
  }

  // Recover q=[lean, steer] from the quadratic eigenvalue pencil:
  // Q(lambda)q = [lambda^2 M + lambda v C1 + gK0 + v^2 K2]q = 0.
  // The complete interleaved state eigenvector is [phi, phi-dot, delta, delta-dot].
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

    const velocity = q.map(value => mul(lambda, value));
    const stateVector = [q[0], velocity[0], q[1], velocity[1]];
    const A = stateMatrixFor(model, speed);
    const residual = A.map((rowValues, i) => {
      let value = c();
      for (let j = 0; j < 4; j++) value = add(value, scale(stateVector[j], rowValues[j]));
      return sub(value, mul(lambda, stateVector[i]));
    });
    const residualNorm = Math.sqrt(residual.reduce((sum, value) => sum + abs(value) ** 2, 0));
    const matrixNorm = Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));
    const vectorNorm = Math.sqrt(stateVector.reduce((sum, value) => sum + abs(value) ** 2, 0));
    const relativeResidual = residualNorm / Math.max((matrixNorm + abs(lambda)) * vectorNorm, EPS);
    const magnitude = [abs(q[0]), abs(q[1])];
    const phaseDifferenceDeg = magnitude[0] > EPS && magnitude[1] > EPS
      ? wrapDegrees((arg(q[1]) - arg(q[0])) * 180 / Math.PI) : null;
    return {
      coordinates: { lean: q[0], steer: q[1] },
      velocity: { lean: velocity[0], steer: velocity[1] },
      stateVector,
      leanAmplitude: magnitude[0],
      steerAmplitude: magnitude[1],
      steerToLeanRatio: magnitude[1] / Math.max(magnitude[0], EPS),
      phaseDifferenceDeg, relativeResidual,
      oscillatory: Math.abs(eigenvalue.im) > 1e-7,
      frequencyHz: Math.abs(eigenvalue.im) / (2 * Math.PI),
      dampingRatio: -eigenvalue.re / Math.max(Math.hypot(eigenvalue.re, eigenvalue.im), EPS),
      timeConstant: Math.abs(eigenvalue.re) > 1e-9 ? 1 / Math.abs(eigenvalue.re) : Infinity,
      eigenvalue: { re: eigenvalue.re, im: eigenvalue.im }
    };
  }

  // Evaluate the selected complex eigenpair directly against the live 4x4 bicycle A matrix.
  // The complex Rayleigh quotient xᴴAx / xᴴx should reproduce λ for an exact right eigenvector.
  function computeEigenpairMetrics(A, vector, eigenvalue) {
    if (!Array.isArray(A) || A.length !== 4 || A.some(row => !Array.isArray(row) || row.length !== 4) ||
        !Array.isArray(vector) || vector.length !== 4 || !eigenvalue) {
      throw new TypeError('A 4x4 state matrix, four-state eigenvector, and eigenvalue are required.');
    }
    const Ax = A.map(row => row.reduce((sum, value, index) => add(sum, scale(vector[index], value)), c()));
    const lambdaX = vector.map(value => mul(eigenvalue, value));
    const residual = Ax.map((value, index) => sub(value, lambdaX[index]));
    const numerator = Ax.reduce((sum, value, index) => add(sum, mul(conj(vector[index]), value)), c());
    const denominator = vector.reduce((sum, value) => sum + abs(value) ** 2, 0);
    const rayleigh = scale(numerator, 1 / Math.max(denominator, EPS));
    const residualNorm = Math.sqrt(residual.reduce((sum, value) => sum + abs(value) ** 2, 0));
    const matrixNorm = Math.sqrt(A.flat().reduce((sum, value) => sum + value * value, 0));
    const vectorNorm = Math.sqrt(vector.reduce((sum, value) => sum + abs(value) ** 2, 0));
    const relativeResidual = residualNorm / Math.max((matrixNorm + abs(eigenvalue)) * vectorNorm, EPS);
    return { Ax, lambdaX, residual, rayleigh, relativeResidual };
  }

  function create(options) {
    const { state, maxRealEigenvalue, charPolyCoeffs } = options || {};
    if (!state || typeof maxRealEigenvalue !== 'function' || typeof charPolyCoeffs !== 'function') {
      throw new TypeError('Eigenmode lab requires app state, maxRealEigenvalue(), and charPolyCoeffs().');
    }
    const ui = {
      mode: $('eigenmodeSelect'), speed: $('eigenmodeSpeed'), vector: $('eigenmodeStateVector'),
      frequency: $('eigenmodeFrequency'), damping: $('eigenmodeDamping'),
      ratio: $('eigenmodeRatio'), phaseDifference: $('eigenmodePhaseDifference'),
      residual: $('eigenmodeResidual'), timeConstant: $('eigenmodeTimeConstant'),
      phase: $('eigenmodePhase'), phaseValue: $('eigenmodePhaseValue'),
      play: $('btnEigenmodePlay'), status: $('eigenmodeStatus'),
      canvas: $('eigenmodeCanvas'), equationCanvas: $('eigenpairCanvas'),
      equationReadout: $('eigenpairReadout'), mathMatrices: $('eigenMathMatrices'),
      mathA: $('eigenMathA'), mathPolynomial: $('eigenMathPolynomial'),
      mathRoots: $('eigenMathRoots'), mathStatus: $('eigenMathStatus')
    };
    const model = { roots: [], modeIndex: 0, mode: null, phaseDeg: 0, playing: false, frame: null, lastTime: null };

    function setStatus(message, kind = 'neutral') {
      ui.status.textContent = message;
      ui.status.dataset.kind = kind;
    }

    function formatMatrix(name, matrix, units) {
      return '<div class="eigen-matrix-card"><div class="eigen-matrix-name">' + name +
        '<span>' + units + '</span></div><div class="eigen-matrix-grid">' +
        matrix.flat().map(value => '<span>' + fmt(value, 4) + '</span>').join('') +
        '</div></div>';
    }

    function polynomialText(coefficients) {
      const normalized = coefficients.map(value => value / coefficients[0]);
      return normalized.map((value, index) => {
        const power = 4 - index;
        const sign = value < 0 ? ' − ' : (index === 0 ? '' : ' + ');
        const magnitude = Math.abs(value);
        const variable = power === 0 ? '' : (power === 1 ? 'λ' : 'λ' + '<sup>' + power + '</sup>');
        return sign + fmt(magnitude, 5) + (variable ? ' ' + variable : '');
      }).join('') + ' = 0';
    }

    function renderMath(speed, roots) {
      try {
        const bicycle = state.analysis.model;
        const A = stateMatrixFor(bicycle, speed);
        const coefficients = charPolyCoeffs(bicycle, speed);
        ui.mathMatrices.innerHTML =
          formatMatrix('M', bicycle.M, 'mass matrix') +
          formatMatrix('v C₁', bicycle.C1.map(row => row.map(value => value * speed)), 'damping matrix') +
          formatMatrix('g K₀ + v² K₂', bicycle.K0.map((row, i) =>
            row.map((value, j) => bicycle.g * value + speed * speed * bicycle.K2[i][j])), 'stiffness matrix');
        ui.mathA.innerHTML = '<div class="eigen-matrix-card wide"><div class="eigen-matrix-name">A · state matrix <span>4 × 4 · s⁻¹</span></div>' +
          '<div class="eigen-matrix-grid four">' + A.flat().map(value => '<span>' + fmt(value, 4) + '</span>').join('') + '</div></div>';
        ui.mathPolynomial.innerHTML = '<div class="eigen-poly-equation">det(λI − A) = 0</div><div class="eigen-poly-expanded">p(λ) = ' +
          polynomialText(coefficients) + '</div><div class="eigen-poly-note">Quartic coefficients are normalized by the leading coefficient. The characteristic roots are shared with the root-locus solver.</div>';
        ui.mathRoots.innerHTML = roots.map((root, index) => {
          const sign = root.im >= 0 ? '+' : '−';
          const stable = root.re < -1e-6 ? 'stable' : root.re > 1e-6 ? 'unstable' : 'neutral';
          return '<button type="button" class="eigen-root-chip ' + stable + '" data-root-index="' + index + '">' +
            '<strong>λ' + (index + 1) + '</strong><span>' + fmt(root.re, 3) + ' ' + sign + ' ' +
            fmt(Math.abs(root.im), 3) + 'i</span></button>';
        }).join('');
        ui.mathRoots.querySelectorAll('[data-root-index]').forEach(button => {
          button.addEventListener('click', () => {
            model.modeIndex = Number(button.dataset.rootIndex);
            ui.mode.value = String(model.modeIndex);
            renderSelection();
            updateRootChipSelection();
          });
        });
        updateRootChipSelection();
        ui.mathStatus.textContent = 'State matrix and polynomial evaluated at v = ' + fmt(speed, 2) +
          ' m/s. Each root is an eigenvalue λ of A.';
        ui.mathStatus.dataset.kind = 'success';
      } catch (error) {
        ui.mathStatus.textContent = 'Eigenvalue derivation unavailable: ' + error.message;
        ui.mathStatus.dataset.kind = 'error';
      }
    }

    function updateRootChipSelection() {
      ui.mathRoots.querySelectorAll('[data-root-index]').forEach(button => {
        const selected = Number(button.dataset.rootIndex) === model.modeIndex;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
    }

    function draw() {
      if (!ui.canvas) return;
      const rect = ui.canvas.getBoundingClientRect();
      const width = Math.max(320, rect.width), height = Math.max(250, rect.height);
      const dpr = window.devicePixelRatio || 1;
      if (ui.canvas.width !== Math.round(width*dpr) || ui.canvas.height !== Math.round(height*dpr)) {
        ui.canvas.width = Math.round(width*dpr); ui.canvas.height = Math.round(height*dpr);
      }
      const ctx = ui.canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,width,height);
      if (!model.mode) {
        ctx.fillStyle='#64748b';ctx.font='13px system-ui,sans-serif';ctx.textAlign='center';
        ctx.fillText('Select a valid operating speed to inspect a mode shape.',width/2,height/2);
        return;
      }
      const mode=model.mode,lean=mode.coordinates.lean,steer=mode.coordinates.steer;
      const compact = width < 620;
      const topH = compact ? 190 : Math.min(146,height*0.46);
      const center = compact ? {x:width/2,y:58} : {x:Math.min(width*0.29,205),y:topH*0.58};
      const radius=Math.min(52,topH*0.37,width*0.11);
      ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.beginPath();ctx.arc(center.x,center.y,radius,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([3,4]);ctx.beginPath();
      ctx.moveTo(center.x-radius-10,center.y);ctx.lineTo(center.x+radius+10,center.y);
      ctx.moveTo(center.x,center.y-radius-10);ctx.lineTo(center.x,center.y+radius+10);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#64748b';ctx.font='10px system-ui,sans-serif';ctx.textAlign='center';
      ctx.fillText('Im(q)',center.x,12);ctx.fillText('Re(q)',center.x+radius+22,center.y+3);
      const drawPhasor=(value,color,label)=>{
        const point={x:center.x+value.re*radius,y:center.y-value.im*radius};
        ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();
        ctx.moveTo(center.x,center.y);ctx.lineTo(point.x,point.y);ctx.stroke();
        ctx.beginPath();ctx.arc(point.x,point.y,4,0,Math.PI*2);ctx.fill();
        ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(label,point.x+6,point.y-5);
      };
      drawPhasor(lean,'#059669','Lean');drawPhasor(steer,'#d97706','Steer');
      const sx = compact ? 16 : Math.max(width*0.48,300);
      const sw = compact ? width-32 : Math.max(150,width-sx-22);
      ctx.fillStyle='#0f172a';ctx.font='700 11px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText('GENERALIZED COORDINATES',sx,20);
      const drawBar=(y,label,value,color)=>{
        ctx.fillStyle='#475569';ctx.font='600 11px system-ui,sans-serif';ctx.fillText(label,sx,y);
        ctx.fillStyle='#e2e8f0';ctx.fillRect(sx,y+8,sw,9);ctx.fillStyle=color;
        ctx.fillRect(sx,y+8,sw*clamp(value,0,1),9);ctx.fillStyle='#334155';
        ctx.textAlign='right';ctx.fillText((value*100).toFixed(1)+'%',sx+sw,y);ctx.textAlign='left';
      };
      drawBar(45,'Lean amplitude |φ|',mode.leanAmplitude,'#059669');
      drawBar(83,'Steer amplitude |δ|',mode.steerAmplitude,'#d97706');
      ctx.fillStyle='#475569';ctx.font='11px system-ui,sans-serif';
      ctx.fillText('Steer / lean amplitude: '+fmt(mode.steerToLeanRatio,3),sx,124);
      ctx.fillText('Steer phase relative to lean: '+fmt(mode.phaseDifferenceDeg,1)+'°',sx,compact?170:140);

      const padL=42,padR=18,padT=topH+22,padB=24,plotW=width-padL-padR,plotH=Math.max(46,height-padT-padB);
      const toX=degrees=>padL+degrees/360*plotW;
      const toY=value=>padT+plotH*(0.5-0.42*value);
      const omega=Math.abs(mode.eigenvalue.im), direction=Math.sign(mode.eigenvalue.im||1);
      const sigma=mode.eigenvalue.re;
      const traceValue=(value,degrees)=>{
        if(!mode.oscillatory)return value.re;
        const theta=degrees*Math.PI/180*direction;
        const time=degrees/360/Math.max(mode.frequencyHz,EPS);
        const envelope=Math.exp(clamp(sigma*time,-6,6));
        return envelope*(value.re*Math.cos(theta)-value.im*Math.sin(theta));
      };
      let traceMax=1;
      if(mode.oscillatory) {
        for(let i=0;i<=120;i++){
          const degrees=i*3;
          traceMax=Math.max(traceMax,Math.abs(traceValue(lean,degrees)),Math.abs(traceValue(steer,degrees)));
        }
      }
      ctx.strokeStyle='#dbe4ec';ctx.lineWidth=1;
      for(const level of [-1,0,1]){const y=toY(level);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+plotW,y);ctx.stroke();}
      ctx.fillStyle='#64748b';ctx.font='10px system-ui,sans-serif';ctx.textAlign='right';
      ctx.fillText('+1',padL-7,toY(1)+3);ctx.fillText('0',padL-7,toY(0)+3);ctx.fillText('−1',padL-7,toY(-1)+3);
      const trace=(value,color)=>{
        ctx.strokeStyle=color;ctx.lineWidth=2.1;ctx.beginPath();
        for(let i=0;i<=120;i++){const degrees=i*3,y=toY(traceValue(value,degrees)/traceMax),x=toX(degrees);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
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

    function drawEigenpair(metrics) {
      const canvas = ui.equationCanvas;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(300, rect.width || 560), height = 176;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
      if (!metrics) {
        ctx.fillStyle = '#718394'; ctx.font = '12px system-ui,sans-serif';
        ctx.fillText('Select a valid eigenvalue to evaluate A x = λ x.', 12, 28);
        return;
      }
      const names = ['φ · lean', 'φ̇ · roll rate', 'δ · steer', 'δ̇ · steer rate'];
      const maxValue = Math.max(EPS, ...metrics.Ax.map(abs), ...metrics.lambdaX.map(abs));
      const labelW = Math.min(112, width * .29), barW = Math.max(45, width - labelW - 76);
      ctx.font = '10px system-ui,sans-serif'; ctx.textBaseline = 'middle';
      names.forEach((name, i) => {
        const y = 24 + i * 38;
        ctx.fillStyle = '#52697b'; ctx.textAlign = 'left'; ctx.fillText(name, 8, y + 4);
        const axW = barW * abs(metrics.Ax[i]) / maxValue;
        const lxW = barW * abs(metrics.lambdaX[i]) / maxValue;
        ctx.fillStyle = '#e8eef2'; ctx.fillRect(labelW, y - 8, barW, 8);
        ctx.fillStyle = '#0d9488'; ctx.fillRect(labelW, y - 8, axW, 8);
        ctx.fillStyle = '#e8eef2'; ctx.fillRect(labelW, y + 3, barW, 8);
        ctx.fillStyle = '#d97706'; ctx.fillRect(labelW, y + 3, lxW, 8);
        ctx.fillStyle = '#607587'; ctx.textAlign = 'right';
        ctx.fillText('Δ ' + fmt(abs(metrics.residual[i]), 3), width - 8, y + 4);
      });
      ctx.fillStyle = '#8a9aa8'; ctx.font = '9px system-ui,sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('Bar lengths are normalized to the largest component across A x and λ x; Δ is the component residual.', 8, height - 7);
    }

    function renderSelection() {
      const root=model.roots[model.modeIndex];
      if(!root||!state.analysis||!state.analysis.model){
        model.mode=null;ui.frequency.textContent='—';ui.damping.textContent='—';ui.ratio.textContent='—';
        ui.phaseDifference.textContent='—';ui.residual.textContent='—';ui.timeConstant.textContent='—';
        ui.play.disabled=true;ui.phase.disabled=true;
        if (ui.equationReadout) ui.equationReadout.textContent = 'No valid eigenpair at this speed.';
        drawEigenpair(null);setStatus('No valid eigenvalues are available at this speed.','error');draw();return;
      }
      try{
        model.mode=computeModeShape(state.analysis.model,state.sim.speedMs,root);
        const stateA = stateMatrixFor(state.analysis.model,state.sim.speedMs);
        const eigenpair = computeEigenpairMetrics(stateA,model.mode.stateVector,root);
        if (ui.equationReadout) {
          const rq = eigenpair.rayleigh;
          ui.equationReadout.textContent = 'λ = ' + fmt(root.re,4) +
            (root.im >= 0 ? ' + ' : ' − ') + fmt(Math.abs(root.im),4) + 'i  ·  xᴴAx/xᴴx = ' +
            fmt(rq.re,4) + (rq.im >= 0 ? ' + ' : ' − ') + fmt(Math.abs(rq.im),4) +
            'i  ·  residual ' + eigenpair.relativeResidual.toExponential(2);
        }
        drawEigenpair(eigenpair);
        ui.frequency.textContent=model.mode.frequencyHz.toFixed(3)+' Hz';
        ui.damping.textContent=(model.mode.dampingRatio*100).toFixed(1)+'%';
        ui.ratio.textContent=fmt(model.mode.steerToLeanRatio,3);
        ui.phaseDifference.textContent=fmt(model.mode.phaseDifferenceDeg,1)+'°';
        ui.residual.textContent=model.mode.relativeResidual.toExponential(2);
        ui.timeConstant.textContent=Number.isFinite(model.mode.timeConstant)?model.mode.timeConstant.toFixed(3)+' s':'—';
        if (typeof window !== 'undefined' && window.JBike6EngineeringInspector) {
          window.JBike6EngineeringInspector.publish('eigenmode',
            'Eigenmode λ' + (model.modeIndex + 1), [
              { label: 'Eigenvalue', value: fmt(root.re, 4) + (root.im >= 0 ? ' + ' : ' − ') + fmt(Math.abs(root.im), 4) + 'i s⁻¹' },
              { label: 'Frequency', value: fmt(model.mode.frequencyHz, 3) + ' Hz' },
              { label: 'Damping ratio', value: fmt(model.mode.dampingRatio * 100, 2) + '%' },
              { label: 'Steer / lean', value: fmt(model.mode.steerToLeanRatio, 3) },
              { label: 'Phase difference', value: fmt(model.mode.phaseDifferenceDeg, 1) + '°' },
              { label: 'Eigenpair residual', value: model.mode.relativeResidual.toExponential(2) }
            ], 'Mode shape and eigenpair are evaluated at the current operating speed using the live 4×4 state matrix.');
        }
        ui.vector.textContent='x = ['+model.mode.stateVector.map(value =>
          fmt(value.re,3)+(Math.abs(value.im)>1e-8?(value.im>=0?' + ':' − ')+fmt(Math.abs(value.im),3)+'i':'')
        ).join('  ·  ')+']ᵀ';
        ui.phase.disabled=!model.mode.oscillatory;ui.play.disabled=!model.mode.oscillatory;
        ui.play.textContent=model.playing?'Pause cycle':'Play cycle';
        setStatus(model.mode.oscillatory
          ?'Open-loop oscillatory mode · the traces include the modal growth/decay envelope.'
          :'Open-loop non-oscillatory mode · the eigenvector gives a fixed lean/steer proportion.','success');
      }catch(error){
        model.mode=null;
        if (ui.equationReadout) ui.equationReadout.textContent = 'Eigenpair verification unavailable: ' + error.message;
        drawEigenpair(null);setStatus('Mode-shape calculation failed: '+error.message,'error');
      }
      draw();
    }

    function update() {
      if(!state.analysis||!state.analysis.model)return;
      stopAnimation();
      const speed=state.sim.speedMs;ui.speed.textContent=speed.toFixed(2)+' m/s';
      let result;
      try{result=maxRealEigenvalue(state.analysis.model,speed);}
      catch(error){setStatus('Eigenvalue calculation failed: '+error.message,'error');return;}
      const oldRoot=model.roots[model.modeIndex]||null;
      model.roots=(result.roots||[]).slice().sort((a,b)=>b.re-a.re||b.im-a.im);
      if(!model.roots.length){
        ui.mode.innerHTML='<option value="">No eigenvalues</option>';renderMath(speed,[]);renderSelection();return;
      }
      if(oldRoot){
        let nearest=0,best=Infinity;
        model.roots.forEach((root,index)=>{
          const distance=Math.hypot(root.re-oldRoot.re,root.im-oldRoot.im);
          if(distance<best){best=distance;nearest=index;}
        });
        model.modeIndex=nearest;
      } else model.modeIndex=0;
      ui.mode.innerHTML=model.roots.map((root,index)=>{
        const sign=root.im>=0?'+':'−';
        return '<option value="'+index+'">λ'+(index+1)+' · '+fmt(root.re,3)+' '+sign+' '+fmt(Math.abs(root.im),3)+'i</option>';
      }).join('');
      ui.mode.value=String(model.modeIndex);
      renderMath(speed,model.roots);
      renderSelection();
    }

    function stopAnimation(){
      model.playing=false;model.lastTime=null;
      if(model.frame!==null)cancelAnimationFrame(model.frame);
      model.frame=null;
      if(ui.play)ui.play.textContent='Play cycle';
    }
    function animate(timestamp){
      if(!model.playing||!model.mode||!model.mode.oscillatory)return stopAnimation();
      if(model.lastTime===null)model.lastTime=timestamp;
      const elapsed=timestamp-model.lastTime;model.lastTime=timestamp;
      model.phaseDeg=(model.phaseDeg+elapsed*0.36*model.mode.frequencyHz)%360;
      ui.phase.value=model.phaseDeg.toFixed(0);ui.phaseValue.textContent=model.phaseDeg.toFixed(0)+'°';
      draw();model.frame=requestAnimationFrame(animate);
    }
    ui.mode.addEventListener('change',()=>{
      model.modeIndex=Math.max(0,Number(ui.mode.value)||0);model.phaseDeg=0;
      ui.phase.value='0';ui.phaseValue.textContent='0°';renderSelection();updateRootChipSelection();
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
    window.addEventListener('resize',()=>{draw();if(model.mode)renderSelection();});
    return {update,draw,stop:stopAnimation,getMode:()=>model.mode,getRoots:()=>model.roots.slice()};
  }
  return {create,computeModeShape,computeEigenpairMetrics,stateMatrixFor};
});
