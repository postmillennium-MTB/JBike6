(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.JBike6Landscape = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const AXES = {
    headAngleDeg: { label: 'Head angle', short: 'Head angle', unit: '°', path: ['headAngleDeg'], window: 3.5, hardMin: 45, hardMax: 80, digits: 2 },
    forkOffsetMm: { label: 'Fork offset', short: 'Fork offset', unit: 'mm', path: ['forkOffsetMm'], window: 12, hardMin: 0, hardMax: 100, digits: 1 },
    wheelbase: { label: 'Wheelbase', short: 'Wheelbase', unit: 'm', path: ['wheelbase'], window: 0.08, hardMin: 0.75, hardMax: 1.8, digits: 3 },
    riderMass: { label: 'Rider mass', short: 'Rider mass', unit: 'kg', path: ['rider', 'm'], window: 20, hardMin: 25, hardMax: 180, digits: 1 },
    riderX: { label: 'Rider fore/aft position', short: 'Rider X', unit: 'm', path: ['rider', 'x'], window: 0.16, hardMin: -0.2, hardMax: 1.6, digits: 3 },
    riderY: { label: 'Rider center-of-mass height', short: 'Rider height', unit: 'm', path: ['rider', 'y'], window: 0.22, hardMin: 0.3, hardMax: 2.1, digits: 3 },
    gyroMult: { label: 'Gyroscopic multiplier', short: 'Gyro multiplier', unit: '×', path: ['gyroMult'], window: 0.55, hardMin: 0, hardMax: 2.5, digits: 2 }
  };

  const $ = (id) => document.getElementById(id);

  function getPath(object, path) {
    return path.reduce((value, key) => value == null ? undefined : value[key], object);
  }

  function setPath(object, path, value) {
    let target = object;
    for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
    target[path[path.length - 1]] = value;
  }

  function linspace(min, max, count) {
    return Array.from({ length: count }, (_, i) => min + (max - min) * i / (count - 1));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function format(value, digits = 2) {
    return Number.isFinite(value) ? value.toFixed(digits) : '—';
  }

  function colorFor(value, scale) {
    if (!Number.isFinite(value)) return '#c3c8d4';
    const t = clamp(value / Math.max(scale, 1e-9), -1, 1);
    const negative = [22,138,74];
    const neutral = [244,245,247];
    const positive = [224,48,30];
    const a = t < 0 ? negative : neutral;
    const b = t < 0 ? neutral : positive;
    const f = Math.abs(t);
    const rgb = a.map((c, i) => Math.round(c + (b[i] - c) * f));
    return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
  }

  function create(options) {
    const { state, assembleWhippleModel, maxRealEigenvalue, onApply } = options;
    if (!state || typeof assembleWhippleModel !== 'function' || typeof maxRealEigenvalue !== 'function') {
      throw new TypeError('JBike6Landscape requires the live app state and Whipple model/eigenvalue functions.');
    }

    const ui = {
      xAxis: $('landscapeXAxis'),
      yAxis: $('landscapeYAxis'),
      xMin: $('landscapeXMin'),
      xMax: $('landscapeXMax'),
      yMin: $('landscapeYMin'),
      yMax: $('landscapeYMax'),
      speed: $('landscapeSpeed'),
      speedValue: $('landscapeSpeedValue'),
      resolution: $('landscapeResolution'),
      run: $('btnRunLandscape'),
      apply: $('btnApplyLandscapePoint'),
      reset: $('btnResetLandscapeCamera'),
      status: $('landscapeStatus'),
      detail: $('landscapeSelectionDetail'),
      canvas: $('stabilityLandscapeCanvas'),
      viewButtons: Array.from(document.querySelectorAll('.landscape-view-btn'))
    };

    const model = {
      xKey: 'headAngleDeg',
      yKey: 'forkOffsetMm',
      speed: 6.5,
      view: 'heatmap',
      grid: null,
      xValues: [],
      yValues: [],
      scale: 0.1,
      selected: null,
      plot: null,
      camera: { yaw: -0.62, pitch: 0.58, zoom: 1.0 },
      dragging: false,
      dragMoved: false,
      pointer: null,
      lastProjected: [], hover: null
    };

    function getAxis(key) {
      return AXES[key] || AXES.headAngleDeg;
    }

    function currentBaseValue(key) {
      return Number(getPath(state.params, getAxis(key).path));
    }

    function axisRange(key) {
      const axis = getAxis(key);
      const center = currentBaseValue(key);
      return {
        min: clamp(center - axis.window, axis.hardMin, axis.hardMax),
        max: clamp(center + axis.window, axis.hardMin, axis.hardMax)
      };
    }

    function setStatus(message, kind = 'neutral') {
      if (!ui.status) return;
      ui.status.textContent = message;
      ui.status.dataset.kind = kind;
    }

    function fillAxisSelects() {
      const optionsHTML = Object.entries(AXES).map(([key, axis]) =>
        '<option value="' + key + '">' + axis.label + ' (' + axis.unit + ')</option>'
      ).join('');
      ui.xAxis.innerHTML = optionsHTML;
      ui.yAxis.innerHTML = optionsHTML;
      ui.xAxis.value = model.xKey;
      ui.yAxis.value = model.yKey;
    }

    function updateRangeInputs() {
      const xr = axisRange(model.xKey);
      const yr = axisRange(model.yKey);
      const xd = getAxis(model.xKey).digits;
      const yd = getAxis(model.yKey).digits;
      ui.xMin.value = xr.min.toFixed(xd);
      ui.xMax.value = xr.max.toFixed(xd);
      ui.yMin.value = yr.min.toFixed(yd);
      ui.yMax.value = yr.max.toFixed(yd);
      ui.xMin.step = ui.xMax.step = xd >= 2 ? '0.01' : '0.1';
      ui.yMin.step = ui.yMax.step = yd >= 2 ? '0.01' : '0.1';
      updateAxisLabels();
    }

    function updateAxisLabels() {
      const x = getAxis(model.xKey);
      const y = getAxis(model.yKey);

      // The visible page uses the axis-label IDs below. Older versions of
      // this module also addressed landscapeXLabel / landscapeYLabel, which
      // are not present in the current markup and caused startup to throw.
      const xLabel = $('landscapeXAxisLabel');
      const yLabel = $('landscapeYAxisLabel');
      if (xLabel) xLabel.textContent = x.short + ' · ' + x.unit;
      if (yLabel) yLabel.textContent = y.short + ' · ' + y.unit;
    }

    function readScanControls() {
      const xMin = Number(ui.xMin.value);
      const xMax = Number(ui.xMax.value);
      const yMin = Number(ui.yMin.value);
      const yMax = Number(ui.yMax.value);
      const speed = Number(ui.speed.value);
      const resolution = Number(ui.resolution.value);
      if (![xMin, xMax, yMin, yMax, speed].every(Number.isFinite)) {
        throw new Error('Enter valid numeric ranges and a valid operating speed.');
      }
      if (xMin >= xMax || yMin >= yMax) throw new Error('Each minimum must be smaller than its maximum.');
      const xa = getAxis(model.xKey);
      const ya = getAxis(model.yKey);
      if (xMin < xa.hardMin || xMax > xa.hardMax || yMin < ya.hardMin || yMax > ya.hardMax) {
        throw new Error('One or more ranges exceed the supported physical input bounds.');
      }
      if (resolution < 7 || resolution > 31) throw new Error('Choose a grid resolution between 7 and 31.');
      return { xMin, xMax, yMin, yMax, speed, resolution };
    }

    function scan() {
      model.xKey = ui.xAxis.value;
      model.yKey = ui.yAxis.value;
      if (model.xKey === model.yKey) {
        setStatus('Choose two different parameters for the landscape axes.', 'error');
        return;
      }

      let controls;
      try {
        controls = readScanControls();
      } catch (error) {
        setStatus(error.message, 'error');
        return;
      }

      model.speed = controls.speed;
      model.xValues = linspace(controls.xMin, controls.xMax, controls.resolution);
      model.yValues = linspace(controls.yMin, controls.yMax, controls.resolution);
      const rows = [];
      let maxAbs = 0;
      let validCount = 0;
      const baseParams = JSON.parse(JSON.stringify(state.params));
      const xAxis = getAxis(model.xKey);
      const yAxis = getAxis(model.yKey);

      ui.run.disabled = true;
      ui.run.textContent = 'Calculating…';
      setStatus('Solving ' + (controls.resolution * controls.resolution) + ' configurations at ' + format(model.speed, 2) + ' m/s…', 'working');

      try {
        for (let iy = 0; iy < model.yValues.length; iy++) {
          const row = [];
          for (let ix = 0; ix < model.xValues.length; ix++) {
            const params = JSON.parse(JSON.stringify(baseParams));
            setPath(params, xAxis.path, model.xValues[ix]);
            setPath(params, yAxis.path, model.yValues[iy]);
            let z = NaN;
            let roots = [];
            try {
              const bicycleModel = assembleWhippleModel(params);
              const result = maxRealEigenvalue(bicycleModel, model.speed);
              roots = result && Array.isArray(result.roots) ? result.roots : [];
              z = result && Number.isFinite(result.maxRe) ? result.maxRe : NaN;
            } catch (error) {
              z = NaN;
            }
            if (Number.isFinite(z)) {
              maxAbs = Math.max(maxAbs, Math.abs(z));
              validCount++;
            }
            row.push({ x: model.xValues[ix], y: model.yValues[iy], z, roots });
          }
          rows.push(row);
        }
      } catch (error) {
        setStatus('Landscape calculation failed: ' + error.message, 'error');
        ui.run.disabled = false;
        ui.run.textContent = 'Run analysis';
        return;
      }

      model.grid = rows;
      model.baseSignature = JSON.stringify(state.params);
      model.scale = Math.max(maxAbs, 0.05);
      model.selected = { ix: Math.floor(model.xValues.length / 2), iy: Math.floor(model.yValues.length / 2) };
      ui.run.disabled = false;
      ui.run.textContent = 'Recalculate landscape';
      if (!validCount) {
        setStatus('No valid eigenvalue solutions were returned. Check the selected parameter ranges.', 'error');
      } else {
        setStatus(validCount + ' / ' + (controls.resolution * controls.resolution) + ' configurations solved · ' + format(model.speed, 2) + ' m/s', 'success');
      }
      updateSelectionDetail();
      draw();
    }

    function selectedSample() {
      if (!model.grid || !model.selected) return null;
      const { ix, iy } = model.selected;
      return model.grid[iy] && model.grid[iy][ix] ? model.grid[iy][ix] : null;
    }

    function updateSelectionDetail() {
      const sample = selectedSample();
      if (!sample) {
        ui.detail.textContent = 'Run the landscape analysis, then select any point to inspect its four eigenvalues.';
        ui.apply.disabled = true;
        return;
      }
      const x = getAxis(model.xKey);
      const y = getAxis(model.yKey);
      const stability = !Number.isFinite(sample.z) ? 'No solution'
        : sample.z < -1e-6 ? 'Decaying modes'
        : sample.z > 1e-6 ? 'Growing mode present'
        : 'Near the stability boundary';
      const roots = sample.roots.length
        ? sample.roots.map((root, index) => 'λ' + (index + 1) + ': ' + format(root.re, 4) + ' ' + (root.im >= 0 ? '+' : '−') + ' ' + format(Math.abs(root.im), 4) + 'i').join('  ·  ')
        : 'Eigenvalues unavailable';
      ui.detail.innerHTML =
        '<div class="landscape-detail-top"><span>' + x.short + ': <strong>' + format(sample.x, x.digits) + ' ' + x.unit + '</strong></span>' +
        '<span>' + y.short + ': <strong>' + format(sample.y, y.digits) + ' ' + y.unit + '</strong></span>' +
        '<span>max Re(λ): <strong>' + format(sample.z, 5) + ' s⁻¹</strong></span></div>' +
        '<div class="landscape-detail-status">' + stability + '</div>' +
        '<div class="landscape-roots">' + roots + '</div>';
      ui.apply.disabled = !Number.isFinite(sample.z);
      if (typeof window !== 'undefined' && window.JBike6EngineeringInspector) {
        const rootRows = sample.roots.slice(0, 4).map((root, index) => ({
          label: 'λ' + (index + 1),
          value: format(root.re, 4) + (root.im >= 0 ? ' + ' : ' − ') + format(Math.abs(root.im), 4) + 'i'
        }));
        window.JBike6EngineeringInspector.publish('landscape',
          'Scanned design configuration', [
            { label: x.short, value: format(sample.x, x.digits) + ' ' + x.unit },
            { label: y.short, value: format(sample.y, y.digits) + ' ' + y.unit },
            { label: 'Forward speed', value: format(model.speed, 3) + ' m/s' },
            { label: 'Maximum Re(λ)', value: format(sample.z, 5) + ' s⁻¹' },
            { label: 'Time to double', value: window.JBike6ReactionTime ? window.JBike6ReactionTime.describe(sample.z).value : '—' },
            { label: 'Stability', value: stability }
          ].concat(rootRows), 'This point is a sampled configuration. Use “Apply selected point” to transfer its design parameters to the active bicycle model.');
      }
    }

    function setupCanvas() {
      const rect = ui.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, rect.width);
      const height = Math.max(320, rect.height);
      if (ui.canvas.width !== Math.round(width * dpr) || ui.canvas.height !== Math.round(height * dpr)) {
        ui.canvas.width = Math.round(width * dpr);
        ui.canvas.height = Math.round(height * dpr);
      }
      const ctx = ui.canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, width, height };
    }

    function draw() {
      if (!ui.canvas || !model.grid) return;
      const { ctx, width, height } = setupCanvas();
      ctx.clearRect(0, 0, width, height);
      if (model.view === 'surface3d') drawSurface3D(ctx, width, height);
      else drawHeatmap(ctx, width, height);
      drawHoverCrosshair(ctx,width,height);
    }

    function drawHeatmap(ctx, width, height) {
      const left = 76, right = 24, top = 30, bottom = 72;
      const plotW = width - left - right;
      const plotH = height - top - bottom;
      const nx = model.xValues.length, ny = model.yValues.length;
      const cw = plotW / nx, ch = plotH / ny;
      const scale = model.scale;
      ctx.fillStyle = '#f4f5f7';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#586079';
      ctx.font = '600 12px "IBM Plex Sans", sans-serif';
      ctx.fillText('Maximum real eigenvalue, s⁻¹', left, 17);

      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          const sample = model.grid[iy][ix];
          const displayY = ny - 1 - iy;
          ctx.fillStyle = colorFor(sample.z, scale);
          ctx.fillRect(left + ix * cw + 0.6, top + displayY * ch + 0.6, Math.max(0, cw - 1.2), Math.max(0, ch - 1.2));
        }
      }

      if (model.selected) {
        const { ix, iy } = model.selected;
        ctx.strokeStyle = '#0d1226';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(left + ix * cw + 1.4, top + (ny - 1 - iy) * ch + 1.4, cw - 2.8, ch - 2.8);
        ctx.beginPath();
        ctx.arc(left + (ix + 0.5) * cw, top + (ny - 1 - iy + 0.5) * ch, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f4f5f7';
        ctx.fill();
        ctx.strokeStyle = '#0d1226';
        ctx.stroke();
      }

      ctx.strokeStyle = '#c3c8d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(left, top, plotW, plotH);
      ctx.fillStyle = '#2f3550';
      ctx.font = '12px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      for (let t = 0; t <= 4; t++) {
        const ix = Math.round(t * (nx - 1) / 4);
        const px = left + (ix + 0.5) * cw;
        ctx.fillText(format(model.xValues[ix], getAxis(model.xKey).digits), px, top + plotH + 18);
      }
      ctx.textAlign = 'right';
      for (let t = 0; t <= 4; t++) {
        const iy = Math.round(t * (ny - 1) / 4);
        const py = top + plotH - (iy + 0.5) * ch;
        ctx.fillText(format(model.yValues[iy], getAxis(model.yKey).digits), left - 10, py + 4);
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2f3550';
      ctx.font = '600 12px "IBM Plex Sans", sans-serif';
      ctx.fillText(getAxis(model.xKey).short + ' (' + getAxis(model.xKey).unit + ')', left + plotW / 2, height - 12);
      ctx.save();
      ctx.translate(18, top + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(getAxis(model.yKey).short + ' (' + getAxis(model.yKey).unit + ')', 0, 0);
      ctx.restore();

      const legendY = height - 44, legendW = Math.min(260, plotW * 0.52), legendX = width - right - legendW;
      const grad = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0);
      grad.addColorStop(0, colorFor(-scale, scale));
      grad.addColorStop(0.5, colorFor(0, scale));
      grad.addColorStop(1, colorFor(scale, scale));
      ctx.fillStyle = grad;
      ctx.fillRect(legendX, legendY, legendW, 8);
      ctx.fillStyle = '#586079';
      ctx.font = '12px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Stable · −' + format(scale, 2), legendX, legendY + 21);
      ctx.textAlign = 'center';
      ctx.fillText('0', legendX + legendW / 2, legendY + 21);
      ctx.textAlign = 'right';
      ctx.fillText('Unstable · +' + format(scale, 2), legendX + legendW, legendY + 21);
      model.plot = { left, top, plotW, plotH, cw, ch };
    }

    function project3D(x, y, z, width, height, scale) {
      const cam = model.camera;
      const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const xr = x * cy - y * sy;
      const yr = x * sy + y * cy;
      const y2 = yr * cp - z * sp;
      const depth = yr * sp + z * cp;
      const perspective = 4.8 / Math.max(2.2, 4.8 - depth);
      const s = scale * cam.zoom * perspective;
      return { x: width * 0.5 + xr * s, y: height * 0.57 - y2 * s, depth };
    }

    function drawSurface3D(ctx, width, height) {
      const nx = model.xValues.length, ny = model.yValues.length;
      const zScale = model.scale;
      const baseScale = Math.min(width * 0.37, height * 0.53);
      const projectSample = (sample) => project3D(
        (sample.x - model.xValues[0]) / (model.xValues[nx - 1] - model.xValues[0]) * 2 - 1,
        (sample.y - model.yValues[0]) / (model.yValues[ny - 1] - model.yValues[0]) * 2 - 1,
        Number.isFinite(sample.z) ? clamp(sample.z / zScale, -1.1, 1.1) : -1.1,
        width, height, baseScale
      );

      ctx.fillStyle = '#f4f5f7';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#586079';
      ctx.font = '600 12px "IBM Plex Sans", sans-serif';
      ctx.fillText('3D STABILITY SURFACE · Z = MAX Re(λ)', 24, 22);

      const zeroPlane = [
        project3D(-1, -1, 0, width, height, baseScale),
        project3D(1, -1, 0, width, height, baseScale),
        project3D(1, 1, 0, width, height, baseScale),
        project3D(-1, 1, 0, width, height, baseScale)
      ];
      ctx.beginPath();
      zeroPlane.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.closePath();
      ctx.fillStyle = 'rgba(13,18,38,0.035)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,96,121,0.52)';
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const faces = [];
      for (let iy = 0; iy < ny - 1; iy++) {
        for (let ix = 0; ix < nx - 1; ix++) {
          const samples = [model.grid[iy][ix], model.grid[iy][ix + 1], model.grid[iy + 1][ix + 1], model.grid[iy + 1][ix]];
          if (samples.some(sample => !Number.isFinite(sample.z))) continue;
          const points = samples.map(projectSample);
          const depth = points.reduce((sum, point) => sum + point.depth, 0) / points.length;
          const z = samples.reduce((sum, sample) => sum + sample.z, 0) / samples.length;
          faces.push({ points, depth, z });
        }
      }
      faces.sort((a, b) => a.depth - b.depth);
      faces.forEach(face => {
        ctx.beginPath();
        face.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = colorFor(face.z, zScale);
        ctx.globalAlpha = 0.96;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(13,18,38,0.15)';
        ctx.lineWidth = 0.65;
        ctx.stroke();
      });

      // Trace the Re(lambda)=0 contour where neighboring grid values change sign.
      ctx.strokeStyle = '#0d1226';
      ctx.lineWidth = 1.7;
      for (let iy = 0; iy < ny - 1; iy++) {
        for (let ix = 0; ix < nx - 1; ix++) {
          const corners = [model.grid[iy][ix], model.grid[iy][ix + 1], model.grid[iy + 1][ix + 1], model.grid[iy + 1][ix]];
          if (corners.some(sample => !Number.isFinite(sample.z))) continue;
          const crossings = [];
          for (let edge = 0; edge < 4; edge++) {
            const a = corners[edge], b = corners[(edge + 1) % 4];
            if ((a.z < 0 && b.z >= 0) || (a.z >= 0 && b.z < 0)) {
              const t = a.z / (a.z - b.z);
              crossings.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
            }
          }
          if (crossings.length >= 2) {
            const p1 = project3D(
              (crossings[0].x - model.xValues[0]) / (model.xValues[nx - 1] - model.xValues[0]) * 2 - 1,
              (crossings[0].y - model.yValues[0]) / (model.yValues[ny - 1] - model.yValues[0]) * 2 - 1,
              0, width, height, baseScale
            );
            const p2 = project3D(
              (crossings[1].x - model.xValues[0]) / (model.xValues[nx - 1] - model.xValues[0]) * 2 - 1,
              (crossings[1].y - model.yValues[0]) / (model.yValues[ny - 1] - model.yValues[0]) * 2 - 1,
              0, width, height, baseScale
            );
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      model.lastProjected = [];
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          model.lastProjected.push({ ix, iy, point: projectSample(model.grid[iy][ix]) });
        }
      }

      if (model.selected) {
        const point = projectSample(selectedSample());
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f4f5f7';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#0d1226';
        ctx.stroke();
      }

      const axisStart = project3D(-1, -1, -1, width, height, baseScale);
      const xEnd = project3D(1, -1, -1, width, height, baseScale);
      const yEnd = project3D(-1, 1, -1, width, height, baseScale);
      const zEnd = project3D(-1, -1, 1, width, height, baseScale);
      ctx.strokeStyle = '#2f3550';
      ctx.lineWidth = 1.5;
      [[axisStart, xEnd], [axisStart, yEnd], [axisStart, zEnd]].forEach(pair => {
        ctx.beginPath();
        ctx.moveTo(pair[0].x, pair[0].y);
        ctx.lineTo(pair[1].x, pair[1].y);
        ctx.stroke();
      });
      ctx.fillStyle = '#2f3550';
      ctx.font = '600 12px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(getAxis(model.xKey).short + ' (' + getAxis(model.xKey).unit + ')', xEnd.x + 12, xEnd.y + 17);
      ctx.fillText(getAxis(model.yKey).short + ' (' + getAxis(model.yKey).unit + ')', yEnd.x - 8, yEnd.y + 17);
      ctx.fillText('max Re(λ) · s⁻¹', zEnd.x - 8, zEnd.y - 12);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#586079';
      ctx.font = '12px "IBM Plex Sans", sans-serif';
      ctx.fillText('Drag to rotate · Scroll to zoom · Select a surface point', 24, height - 18);
      model.plot = null;
    }

    function selectCell(ix, iy) {
      if (!model.grid) return;
      model.selected = {
        ix: clamp(ix, 0, model.xValues.length - 1),
        iy: clamp(iy, 0, model.yValues.length - 1)
      };
      updateSelectionDetail();
      draw();
    }

    function selectFromCanvas(clientX, clientY) {
      const rect = ui.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (model.view === 'heatmap' && model.plot) {
        const p = model.plot;
        if (x < p.left || x > p.left + p.plotW || y < p.top || y > p.top + p.plotH) return;
        const ix = Math.floor((x - p.left) / p.cw);
        const displayRow = Math.floor((y - p.top) / p.ch);
        const iy = model.yValues.length - 1 - displayRow;
        selectCell(ix, iy);
      } else if (model.view === 'surface3d' && model.lastProjected.length) {
        let closest = null, best = 30 * 30;
        model.lastProjected.forEach(item => {
          const dx = item.point.x - x, dy = item.point.y - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < best) { best = d2; closest = item; }
        });
        if (closest) selectCell(closest.ix, closest.iy);
      }
    }


    function drawHoverCrosshair(ctx,width,height){
      if(!model.hover)return;
      ctx.save();ctx.strokeStyle='rgba(224,48,30,.8)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(model.hover.x,0);ctx.lineTo(model.hover.x,height);ctx.moveTo(0,model.hover.y);ctx.lineTo(width,model.hover.y);ctx.stroke();
      ctx.setLineDash([]);ctx.fillStyle='#e0301e';ctx.beginPath();ctx.arc(model.hover.x,model.hover.y,3,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function setCameraPreset(name){
      const presets={front:{yaw:0,pitch:.32,zoom:1},side:{yaw:Math.PI/2,pitch:.32,zoom:1},top:{yaw:0,pitch:1.18,zoom:1}};
      if(presets[name]){model.camera=Object.assign({},presets[name]);draw();}
    }

    function setView(view) {
      model.view = view;
      ui.viewButtons.forEach(button => {
        const active = button.dataset.landscapeView === view;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      ui.reset.classList.toggle('hidden', view !== 'surface3d');
      document.querySelectorAll('.landscape-camera-preset').forEach(button=>button.classList.toggle('hidden',view!=='surface3d'));
      ui.canvas.style.cursor = view === 'surface3d' ? 'grab' : 'crosshair';
      draw();
    }

    function applySelected() {
      const sample = selectedSample();
      if (!sample || !Number.isFinite(sample.z)) return;
      const xAxis = getAxis(model.xKey), yAxis = getAxis(model.yKey);
      const patch = {
        [model.xKey]: sample.x,
        [model.yKey]: sample.y,
        paths: [
          { path: xAxis.path, value: sample.x },
          { path: yAxis.path, value: sample.y }
        ]
      };
      if (typeof onApply === 'function') onApply(patch);
      setStatus('Selected design point applied to the active bicycle configuration.', 'success');
    }

    function activate() {
      const currentSignature = JSON.stringify(state.params);
      if (!model.grid || model.baseSignature !== currentSignature) {
        updateRangeInputs();
        scan();
      } else {
        draw();
      }
    }

    function bind() {
      fillAxisSelects();
      updateRangeInputs();
      ui.speedValue.textContent = format(Number(ui.speed.value), 2) + ' m/s';
      ui.xAxis.addEventListener('change', () => {
        if (ui.xAxis.value === ui.yAxis.value) ui.yAxis.value = Object.keys(AXES).find(key => key !== ui.xAxis.value);
        model.xKey = ui.xAxis.value;
        model.yKey = ui.yAxis.value;
        updateRangeInputs();
      });
      ui.yAxis.addEventListener('change', () => {
        if (ui.yAxis.value === ui.xAxis.value) ui.xAxis.value = Object.keys(AXES).find(key => key !== ui.yAxis.value);
        model.xKey = ui.xAxis.value;
        model.yKey = ui.yAxis.value;
        updateRangeInputs();
      });
      ui.speed.addEventListener('input', () => {
        ui.speedValue.textContent = format(Number(ui.speed.value), 2) + ' m/s';
      });
      ui.run.addEventListener('click', scan);
      ui.apply.addEventListener('click', applySelected);
      ui.viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.landscapeView)));
      ui.reset.addEventListener('click', () => { model.camera = { yaw: -0.62, pitch: 0.58, zoom: 1.0 }; draw(); });
      document.querySelectorAll('[data-landscape-camera]').forEach(button=>button.addEventListener('click',()=>setCameraPreset(button.dataset.landscapeCamera)));

      ui.canvas.addEventListener('pointerdown', event => {
        if (model.view !== 'surface3d') return;
        model.dragging = true;
        model.dragMoved = false;
        model.pointer = { x: event.clientX, y: event.clientY };
        ui.canvas.setPointerCapture(event.pointerId);
        ui.canvas.style.cursor = 'grabbing';
      });
      ui.canvas.addEventListener('pointermove', event => {
        if (!model.dragging || !model.pointer || model.view !== 'surface3d') { const rect=ui.canvas.getBoundingClientRect();model.hover={x:event.clientX-rect.left,y:event.clientY-rect.top};draw();return; }
        const dx = event.clientX - model.pointer.x;
        const dy = event.clientY - model.pointer.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) model.dragMoved = true;
        model.pointer = { x: event.clientX, y: event.clientY };
        model.camera.yaw -= dx * 0.008;
        model.camera.pitch = clamp(model.camera.pitch + dy * 0.006, 0.12, 1.25);
        draw();
      });
      const finishPointer = event => {
        if (!model.dragging) return;
        model.dragging = false;
        ui.canvas.style.cursor = 'grab';
        if (!model.dragMoved) selectFromCanvas(event.clientX, event.clientY);
      };
      ui.canvas.addEventListener('pointerup', finishPointer);
      ui.canvas.addEventListener('pointercancel', () => { model.dragging = false; ui.canvas.style.cursor = 'grab'; });
      ui.canvas.addEventListener('pointerleave',()=>{model.hover=null;draw();});
      ui.canvas.addEventListener('click', event => {
        if (model.view === 'heatmap') selectFromCanvas(event.clientX, event.clientY);
      });
      ui.canvas.addEventListener('wheel', event => {
        if (model.view !== 'surface3d') return;
        event.preventDefault();
        model.camera.zoom = clamp(model.camera.zoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.55, 1.8);
        draw();
      }, { passive: false });
      ui.canvas.style.cursor = 'crosshair';
      window.addEventListener('resize', draw);
    }

    bind();

    return {
      activate,
      scan,
      draw,
      getResults: () => model.grid,
      getState: () => ({ xKey: model.xKey, yKey: model.yKey, speed: model.speed, view: model.view }),
      setCameraPreset
    };
  }

  return { create, AXES, colorFor, linspace, getPath, setPath };
});