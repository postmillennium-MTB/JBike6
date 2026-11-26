'use strict';
// Visual-regression oracle for CSS refactors. It records the computed style of every element, and of the
// ::before, ::after and slider pseudo-elements, on every tab at phone and desktop width, in the open and
// expanded states, and with hover, focus, active and focus-visible forced on every interactive element.
// Identical snapshots mean identical rendering, so a refactor that claims "no visible change" can be proved.
//
//     node tests/browser/style-snapshot.js capture before.json
//     ... change CSS ...
//     node tests/browser/style-snapshot.js capture after.json
//     node tests/browser/style-snapshot.js compare before.json after.json
//
// Needs Playwright. Output files are large, keep them out of the repository.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const PAGE = process.env.SNAPSHOT_PAGE || 'file://' + path.join(__dirname, '..', '..', 'index.html');
const TABS = ['overview', 'mullet', 'control', 'landscape', 'optimization'];
const SIZES = [['phone', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]];
const PROPS = ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
  'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'color', 'opacity', 'box-shadow', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'text-overflow', 'white-space', 'font-variant-numeric',
  'overflow-x', 'overflow-y', 'visibility', 'cursor', 'pointer-events', 'transform', 'transition-property', 'transition-duration', 'animation-name',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-items', 'align-self', 'justify-content', 'gap', 'grid-template-columns', 'grid-template-rows', 'grid-column-start', 'grid-column-end', 'order',
  'accent-color', 'appearance', 'content', 'box-sizing', 'vertical-align', 'list-style-type', 'stroke', 'fill'];
const RANGE_PSEUDOS = ['::-webkit-slider-thumb', '::-webkit-slider-runnable-track'];

function inPage({ props, rangePseudos }) {
  const out = {};
  const path = el => { const parts = []; for (; el && el !== document.documentElement; el = el.parentElement) { const i = [...el.parentElement.children].indexOf(el); parts.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ':' + i); } return parts.reverse().join('>'); };
  const read = (cs, ) => props.map(p => cs.getPropertyValue(p));
  for (const el of document.querySelectorAll('body, body *')) {
    if (['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const key = path(el);
    out[key] = read(getComputedStyle(el));
    for (const ps of ['::before', '::after']) {
      const cs = getComputedStyle(el, ps), c = cs.getPropertyValue('content');
      if (c && c !== 'none' && c !== 'normal') out[key + ps] = read(cs);
    }
    if (el.tagName === 'INPUT' && el.type === 'range') for (const ps of rangePseudos) out[key + ps] = read(getComputedStyle(el, ps));
  }
  return out;
}

async function capture(browser, outFile) {
  const result = {};
  for (const [size, viewport, touch] of SIZES) {
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(1000);
    // The header height is measured once fonts have loaded, so wait for them and re-measure to keep captures repeatable.
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(400);
    const snap = async name => { result[size + ':' + name] = await page.evaluate(inPage, { props: PROPS, rangePseudos: RANGE_PSEUDOS }); };
    for (const tab of TABS) {
      await page.evaluate(t => document.querySelector('.lab-tab-btn[data-tab="' + t + '"]').click(), tab);
      await page.waitForTimeout(350);
      await snap('tab-' + tab);
    }
    await page.evaluate(() => document.querySelector('.lab-tab-btn[data-tab="overview"]').click());
    await page.waitForTimeout(300);
    // expanded and open states
    await page.evaluate(() => document.getElementById('introToggle').click()); await page.waitForTimeout(150); await snap('intro-open');
    await page.evaluate(() => document.getElementById('introToggle').click());
    await page.evaluate(() => document.getElementById('btnOpenJsonModal').click()); await page.waitForTimeout(250); await snap('json-modal');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { const m = document.getElementById('jsonModal'); if (m) m.classList.add('hidden'); });
    await page.evaluate(() => document.getElementById('btnGeomMode3D').click()); await page.waitForTimeout(250); await snap('geometry-3d');
    await page.evaluate(() => document.getElementById('btnGeomMode2D').click());
    await page.evaluate(() => document.getElementById('btnRootMode3D').click()); await page.waitForTimeout(250); await snap('root-3d');
    await page.evaluate(() => document.getElementById('btnRootMode2D').click());
    // forced pseudo-states on every interactive element
    const client = await context.newCDPSession(page);
    await client.send('DOM.enable'); await client.send('CSS.enable');
    const count = await page.evaluate(() => { let i = 0; for (const e of document.querySelectorAll('button, a[href], select, input, textarea, summary, [role=tab], label')) e.setAttribute('data-snap', String(i++)); return i; });
    const { root } = await client.send('DOM.getDocument', { depth: 0 });
    const forced = {};
    for (const state of ['hover', 'focus', 'active', 'focus-visible']) {
      forced[state] = {};
      for (let i = 0; i < count; i++) {
        const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-snap="' + i + '"]' });
        if (!nodeId) continue;
        await client.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [state] });
        forced[state][i] = await page.evaluate(({ idx, props, pseudos }) => {
          const el = document.querySelector('[data-snap="' + idx + '"]'), cs = getComputedStyle(el), v = props.map(p => cs.getPropertyValue(p));
          const r = { base: v }; if (el.tagName === 'INPUT' && el.type === 'range') for (const ps of pseudos) r[ps] = props.map(p => getComputedStyle(el, ps).getPropertyValue(p)); return r;
        }, { idx: i, props: PROPS, pseudos: RANGE_PSEUDOS });
        await client.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
      }
    }
    result[size + ':forced'] = forced;
    await context.close();
  }
  result.__props = PROPS;
  fs.writeFileSync(outFile, JSON.stringify(result));
  const n = Object.entries(result).filter(([k]) => k !== '__props' && !k.endsWith(':forced')).reduce((s, [, v]) => s + Object.keys(v).length, 0);
  console.log('captured', Object.keys(result).length - 1, 'states,', n, 'element records ->', outFile);
}

function compare(aFile, bFile) {
  const a = JSON.parse(fs.readFileSync(aFile, 'utf8')), b = JSON.parse(fs.readFileSync(bFile, 'utf8')), props = a.__props;
  let diffs = 0, checked = 0; const byProp = {}, examples = [];
  const note = (where, key, i, x, y) => { diffs++; byProp[props[i]] = (byProp[props[i]] || 0) + 1; if (examples.length < 25) examples.push(where + ' ' + key + ' ' + props[i] + ': ' + x + ' -> ' + y); };
  for (const state of Object.keys(a)) {
    if (state === '__props') continue;
    if (state.endsWith(':forced')) {
      for (const st of Object.keys(a[state])) for (const idx of Object.keys(a[state][st])) for (const part of Object.keys(a[state][st][idx])) {
        const x = a[state][st][idx][part], y = b[state] && b[state][st] && b[state][st][idx] && b[state][st][idx][part];
        checked++; if (!y) { note(state + ':' + st, idx, 0, 'present', 'missing'); continue; }
        x.forEach((v, i) => { if (v !== y[i]) note(state + ':' + st, 'el#' + idx + part, i, v, y[i]); });
      }
      continue;
    }
    for (const key of Object.keys(a[state])) {
      const x = a[state][key], y = b[state] && b[state][key]; checked++;
      if (!y) { note(state, key, 0, 'present', 'missing'); continue; }
      x.forEach((v, i) => { if (v !== y[i]) note(state, key, i, v, y[i]); });
    }
    for (const key of Object.keys(b[state] || {})) if (!a[state][key]) note(state, key, 0, 'missing', 'present');
  }
  console.log('compared', checked, 'records:', diffs ? diffs + ' differences' : 'IDENTICAL');
  if (diffs) { console.log('by property:', JSON.stringify(byProp)); console.log(examples.join('\n')); process.exit(1); }
}

(async () => {
  const [cmd, f1, f2] = process.argv.slice(2);
  if (cmd === 'capture') { const browser = await chromium.launch(); await capture(browser, f1); await browser.close(); }
  else if (cmd === 'compare') compare(f1, f2);
  else { console.log('usage: capture <out.json> | compare <a.json> <b.json>'); process.exit(2); }
})();
