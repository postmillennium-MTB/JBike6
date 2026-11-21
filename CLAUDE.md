# JBike6

Browser app that computes bicycle stability from the linearized Whipple–Carvallo model. Derived from the 2015 MATLAB JBike6 release. Read `README.md` for the feature list.

## Commands
- Run: open `index.html` directly. No build, no server.
- Test: `node --test tests/*.test.js` (all must pass before a commit).
- Screenshot check: Chromium and Playwright are preinstalled in cloud sessions. Load `file:///.../index.html`. The old tab buttons (`.lab-tab-btn`) are hidden, so switch tabs with `document.querySelector('.lab-tab-btn[data-tab="control"]').click()` through `page.evaluate`.

## Architecture
- `index.html` holds the markup, an inline `<style>` block, the model assembly and all main canvas drawing. Feature modules in the repo root are plain scripts that attach `window.JBike6*` and also export through `module.exports` for the Node tests.
- `instrument-ui.css` loads after the inline styles and overrides them, often with `!important`. Put new visual rules at the end of it.
- `.lab-tab-btn` buttons are hidden routing state. The visible navigation is built by `viz-workspace.js`, and its order is asserted in `tests/viz-workspace.test.js`.
- `.workspace-grid` is hidden on the Control, Landscape and Optimization tabs, so anything meant to show on every tab lives outside it.

## Design rules
- Color is semantic. Blue is selection and interaction, red is instability only, green is stability, ochre is rider and rear assembly. Never use red for a selected or active state.
- Tokens live in `:root` in `instrument-ui.css` (`--select`, `--signal`, `--stable`, `--ochre`, `--ink`, `--paper`). Canvas code cannot read CSS variables, so the same hex values are repeated in the JS: `#1f5a9e` blue, `#c8321e` red, `#2f7d4a` green, `#9a6a12` ochre, `#15283c` ink, `#eef1f3` paper. Change both places together.
- Type: Archivo for everything, IBM Plex Mono for numbers only. Sentence case, no all-caps labels, no letter-spaced eyebrows. `text-transform` is forced to `none` site-wide.
- No shadows, no rounded corners, no gradient washes, no dark hero banners, no pill badges. Status is plain colored text. Number steps only when the content is really a sequence.
- Keep the plot as the first and largest drawing on the Stability view.

## Math
- The MATLAB files in `original Matlab files/` are the source of truth. Do not edit them.
- The MATLAB `K0` already includes gravity. Use `K0 + v²K2` directly and never multiply `K0` by g again (see `CONTROL_THEORY_AUDIT.md`).
- State order is interleaved: `x = [q1, q̇1, q2, q̇2]`, with lean right positive and steer left positive.

## Git and license
- Develop on the branch the session names, push there, and open a pull request only when asked.
- The original JBike6 license (`LICENSE-JBike6.md`) requires attribution to the authors. Keep the footer credit and the README credit intact.

## Known issues
- The linked inspector keeps its last selection when switching tabs.
- Fonts come from Google Fonts and fall back to system fonts offline.
