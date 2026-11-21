'use strict';
// The page opens with a one-sentence description and a "Say more" toggle that reveals two paragraphs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const intro = html.slice(html.indexOf('<section class="intro"'), html.indexOf('</section>', html.indexOf('<section class="intro"')));

test('the introduction opens with the required sentence', () => {
  assert.match(intro, /JBike6 calculates whether a bicycle can balance itself with nobody on it, and how it behaves when it can't\./);
});

test('the toggle starts collapsed, says "Say more", and controls the hidden panel', () => {
  assert.match(intro, /id="introToggle"[^>]*aria-expanded="false"[^>]*aria-controls="introMore"/);
  assert.match(intro, /id="introToggleLabel">Say more</);
  assert.match(intro, /id="introMore" hidden/);
});

test('the expanded panel holds exactly two paragraphs', () => {
  const panel = intro.slice(intro.indexOf('id="introMore"'));
  assert.equal((panel.match(/<p>/g) || []).length, 2);
});

test('clicking the toggle expands and collapses the panel and flips the label', () => {
  // Run the page's own script against stand-in elements and click, instead of only matching text.
  const scriptStart = html.indexOf('<script>', html.indexOf('id="introMore"'));
  const script = html.slice(scriptStart + '<script>'.length, html.indexOf('</script>', scriptStart));
  const attrs = { 'aria-expanded': 'false' };
  let click;
  const toggle = { getAttribute: k => attrs[k], setAttribute: (k, v) => { attrs[k] = v; }, addEventListener: (type, fn) => { if (type === 'click') click = fn; } };
  const panel = { hidden: true };
  const label = { textContent: 'Say more' };
  const els = { introToggle: toggle, introMore: panel, introToggleLabel: label };
  require('node:vm').runInNewContext(script, { document: { getElementById: id => els[id] || null } });
  assert.equal(typeof click, 'function', 'the script must attach a click handler to the toggle');
  click();
  assert.deepEqual([attrs['aria-expanded'], panel.hidden, label.textContent], ['true', false, 'Say less']);
  click();
  assert.deepEqual([attrs['aria-expanded'], panel.hidden, label.textContent], ['false', true, 'Say more']);
});

test('the toggle script comes after the elements it needs', () => {
  assert.ok(html.indexOf("getElementById('introToggle')") > html.indexOf('id="introToggle"'));
  assert.ok(html.indexOf("getElementById('introToggle')") > html.indexOf('id="introMore"'));
});

test('the introduction sits above the primary navigation', () => {
  assert.ok(html.indexOf('<section class="intro"') < html.indexOf('<nav id="vizWorkspaceNav"'));
});

test('the expanded text does not repeat the opening sentence shown just above it', () => {
  const sentence = "JBike6 calculates whether a bicycle can balance itself with nobody on it, and how it behaves when it can't.";
  const panel = intro.slice(intro.indexOf('id="introMore"')).replace(/&rsquo;/g, "'");
  assert.ok(!panel.includes(sentence));
});
