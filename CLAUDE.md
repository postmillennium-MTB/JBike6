# JBike6

Browser app that computes bicycle stability from the linearized Whipple–Carvallo model. Derived from the 2015 MATLAB JBike6 release. Read `README.md` for the feature list.

## Commands
- Run: open `index.html` directly. No build, no server.
- Test: `node --test tests/*.test.js` (all must pass before a commit).
- The reference tests (`matlab-model`, `paper-benchmark`, `eigen-reference`, `control-lab-transfer`, `ride-simulator`, `design-reference`, `app-features`) pull the model and simulator code out of `index.html` by text markers and check it against the original MATLAB, the published paper and the exact solution of the linear system. If you rename or reorder the functions they cut out, update the markers. `docs/audit/README.md` maps each test to what it checks. Any change to `assembleWhippleModel`, `combineJBikeBodies`, `charPolyCoeffs`, `computeStateSpaceAndTF`, `runPerturbationSimulation` or `runControlledSimulation` must keep them passing. Regenerate the references with the four `tests/fixtures/make_*_reference.py` scripts (needs numpy; run `make_matlab_reference.py` first). The benchmark preset carries the paper's exact Table 1 values, so do not round them.
- The simulators use fixed-step RK4 with automatic sub-steps for stiff systems (`rk4SubstepCount`). Do not remove the sub-steps: without them stiff designs and high feedback gains blow up and report false crashes.
- Screenshot check: Chromium and Playwright are preinstalled in cloud sessions. Load `file:///.../index.html`. The old tab buttons (`.lab-tab-btn`) are hidden, so switch tabs with `document.querySelector('.lab-tab-btn[data-tab="control"]').click()` through `page.evaluate`.

## Architecture
- `index.html` holds the markup, an inline `<style>` block, the model assembly and all main canvas drawing. Feature modules in the repo root are plain scripts that attach `window.JBike6*` and also export through `module.exports` for the Node tests.
- `instrument-ui.css` loads after the inline styles and overrides them, often with `!important`. Put new visual rules at the end of it.
- `.lab-tab-btn` buttons are hidden routing state. The visible navigation is built by `viz-workspace.js`, and its order is asserted in `tests/viz-workspace.test.js`.
- `.workspace-grid` is hidden on the Control, Landscape and Optimization tabs, so anything meant to show on every tab lives outside it.

## Design rules
- Color is semantic. Blue is selection and interaction, red is instability only, green is stability, ochre is rider and rear assembly. Never use red for a selected or active state.
- Tokens live in `:root` in `instrument-ui.css` (`--select`, `--signal`, `--stable`, `--ochre`, `--ink`, `--paper`). Canvas code cannot read CSS variables, so the same hex values are repeated in the JS: `#1747e6` blue, `#e0301e` red, `#168a4a` green, `#b07a10` ochre, `#0d1226` ink, `#f4f5f7` paper. Change both places together.
- Type: Archivo for everything, IBM Plex Mono for numbers only. Sentence case, no all-caps labels, no letter-spaced eyebrows. `text-transform` is forced to `none` site-wide.
- No shadows, no rounded corners, no gradient washes, no dark hero banners, no pill badges. Status is plain colored text. Number steps only when the content is really a sequence.
- Keep the plot as the first and largest drawing on the Stability view.

## Plain language
- `plain-language.js` turns the stability analysis into sentences shown under the root-locus plot ("What am I looking at?"). Keep wording non-technical and update `tests/plain-language.test.js` with any change.

## Reaction time
- `reaction-time.js` turns the largest real eigenvalue into a doubling time (ln 2 / Re λ) shown under the stability plot and in the inspector. It describes the bike with nobody steering. Do not present it as a rider model or add a pass/fail threshold without a source.

## Ride test playback
- `crash-playback.js` owns the crash behavior: a ride counts as crashed when lean passes 45° (the lean chart's limit). Playback slows from 20° lean, holds on the crash, rewinds to the start and stops there. The state machine is pure and tested. `animationLoop` in `index.html` only applies its result.
- Anything that restarts the ride clock must call `resetCrashPlayback()`. Reduced-motion users skip the rewind animation.

## Math
- The MATLAB files in `original Matlab files/` are the source of truth. Do not edit them, and do not rename or retune app presets to "fix" differences from them. The owner has decided to leave preset names as they are.
- The MATLAB `K0` already includes gravity. Use `K0 + v²K2` directly and never multiply `K0` by g again (see `CONTROL_THEORY_AUDIT.md`).
- State order is interleaved: `x = [q1, q̇1, q2, q̇2]`.
- Sign conventions differ. MATLAB and `control-theory.js` take steer to the left as positive. The app (`assembleWhippleModel`, the ride test, the Control lab) follows Meijaard et al. (2007), where steer to the right is positive, so a lean to the right is met by a positive steer. The off-diagonal terms of M0, C1, K0 and K2 flip sign between the two, and the eigenvalues are identical.
- `MODEL_AUDIT.md` summarizes how the app's model was checked, what was found and what has not been checked. `docs/audit/audit-log.md` has the full record. Update both when you change anything they describe.

## Git and license
- Develop on the branch the session names, push there, and open a pull request only when asked.
- The original JBike6 license (`LICENSE-JBike6.md`) requires attribution to the authors. Keep the footer credit and the README credit intact.

## Known issues
- Fonts come from Google Fonts and fall back to system fonts offline.
