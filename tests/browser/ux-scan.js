'use strict';
// Measures the real, rendered page in Chromium: text size, text contrast, touch targets on a phone, and
// horizontal overflow, on every tab at phone and desktop width. It needs Playwright, so it is not part of
// `node --test`. Run it after any visual change:
//
//     node tests/browser/ux-scan.js
//
// It prints what it found and exits with status 1 if anything fails.
const path = require('node:path');
const { chromium } = require('playwright');

const PAGE = 'file://' + path.join(__dirname, '..', '..', 'index.html');
const TABS = ['overview', 'mullet', 'control', 'landscape', 'optimization'];
const SIZES = [['phone 390', { width: 390, height: 844 }, true], ['desktop 1440', { width: 1440, height: 900 }, false]];

function inPage() {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(parseFloat); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const bgOf = e => { const stack = []; for (let n = e; n; n = n.parentElement) { const s = getComputedStyle(n); const c = parse(s.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } if (s.backgroundImage !== 'none') return null; } let bg = { r: 244, g: 245, b: 247, a: 1 }; for (const c of stack.reverse()) bg = blend(c, bg); return bg; };
  const opacity = e => { let o = 1; for (let n = e; n; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; };
  const hidden = e => !!e.closest('[aria-hidden="true"]');
  const small = [], lowContrast = [];
  for (const e of document.querySelectorAll('body *')) {
    if (!vis(e) || hidden(e)) continue;
    const text = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    if (!text) continue;
    const s = getComputedStyle(e), size = parseFloat(s.fontSize);
    if (size < 11.99) small.push(size.toFixed(1) + 'px "' + text.slice(0, 24) + '"');
    const fg = parse(s.color), bg = bgOf(e);
    if (!fg || !bg) continue;
    const f = blend({ ...fg, a: fg.a * opacity(e) }, bg);
    const [x, y] = [lum(f), lum(bg)].sort((p, q) => q - p);
    const ratio = (x + 0.05) / (y + 0.05);
    const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) lowContrast.push(ratio.toFixed(2) + ' "' + text.slice(0, 24) + '"');
  }
  const controls = [...document.querySelectorAll('button,select,input,summary,[role=tab]')].filter(vis).filter(e => e.type !== 'hidden' && !hidden(e));
  const smallControls = controls.filter(e => {
    const b = e.getBoundingClientRect();
    if (b.height >= 43.5 && b.width >= 43.5) return false;
    // a checkbox or radio is tapped through its label row, which has to be 44px tall
    if (e.type === 'checkbox' || e.type === 'radio') { const row = e.closest('label,.check-row'); return !(row && row.getBoundingClientRect().height >= 43.5); }
    return true;
  }).map(e => (e.id || e.className || e.tagName).toString().slice(0, 26) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { small, lowContrast, smallControls, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
}

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  for (const [name, viewport, touch] of SIZES) {
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(900);
    for (const tab of TABS) {
      await page.evaluate(t => document.querySelector('.lab-tab-btn[data-tab="' + t + '"]').click(), tab);
      await page.waitForTimeout(400);
      const r = await page.evaluate(inPage);
      const problems = [];
      if (r.small.length) problems.push(r.small.length + ' text elements under 12px (' + r.small.slice(0, 3).join(', ') + ')');
      if (r.lowContrast.length) problems.push(r.lowContrast.length + ' text elements under the contrast minimum (' + r.lowContrast.slice(0, 3).join(', ') + ')');
      if (touch && r.smallControls.length) problems.push(r.smallControls.length + ' controls under 44x44px (' + r.smallControls.slice(0, 3).join(', ') + ')');
      if (r.overflow) problems.push('page scrolls sideways');
      failures += problems.length;
      console.log((name + ' ' + tab).padEnd(26), problems.length ? 'FAIL: ' + problems.join('; ') : 'ok');
    }
    await context.close();
  }
  await browser.close();
  console.log(failures ? '\n' + failures + ' problem(s) found.' : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
})();
