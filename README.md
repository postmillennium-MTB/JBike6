# JBike6

A test bench for bicycle motion. It computes the open-loop stability of a bicycle from the linearized Whipple–Carvallo equations (four rigid bodies) and lets you change geometry, mass and speed while the eigenvalues, ride response and control properties update.

## Run it
Open `index.html` in a modern browser. There is no build step, no server and no dependencies to install. Fonts load from Google Fonts; offline, the app falls back to system fonts.

Run the tests with Node 20 or later:

```sh
node --test tests/*.test.js
```

## What is in the bench
- **Stability**: root locus of the eigenvalues against forward speed. Weave speed, capsize speed and the self-stable window are read out above the plot and dimensioned on it.
- **Geometry**: 2D blueprint and 3D views with principal-inertia glyphs and draggable centers of mass.
- **Time to react**: how long a small lean or wobble takes to double at the test speed, plus a sweep across speeds, with nobody steering. It is a property of the bike, not a rider model.
- **Ride test**: roll-perturbation time response at a chosen speed. If the lean passes 45° the bike crashes: playback slows down, holds on the crash, then rewinds to the start. The model is linear, so the 45° limit is a display choice, not a physical result.
- **Wheel lab**: wheel sizes, mullet setups, frame pitch and gyroscopic contribution.
- **Control lab**: state-space matrices, eigenmodes, transfer functions and pole-zero maps.
- **Stability landscape** and **Design optimization**: scan two parameters across a speed range.
- **Model profiles**: ten presets, from modern MTB geometries to the original Schwinn Crown and the Meijaard benchmark bike. Configurations export and import as JSON.

## Model validation
The model is tested against the original MATLAB: all 18 reference bikes agree on the equations of motion to about 1e-15, the benchmark bicycle reproduces the paper's 14-digit results, and the ride-test simulator matches the exact solution of the linear equations. See `MODEL_AUDIT.md` for the summary and `docs/audit/` for the full record, including what was not checked.

## Accessibility
Text is never smaller than 12 px, text meets 4.5:1 contrast, controls are at least 44 px on phones, charts do not rely on color alone, and each chart has a text description. Tests keep these rules, and `docs/accessibility.md` records how they were measured.

## Model limits
The model is the linearized Whipple–Carvallo bicycle: rigid bodies, knife-edge wheels rolling without slip, no rider control, small lean and steer angles. A bike shown as unstable here is unstable hands-free. A rider can still balance it by steering. Tire compliance, suspension and rider biomechanics are not modeled.

## Files
| File | Purpose |
| --- | --- |
| `index.html` | The app: markup, model assembly and canvas drawing |
| `instrument-ui.css` | Visual system, loaded after the inline styles in `index.html` and overriding them |
| `components.css` | Shared component rules (buttons, form controls, status text, panels, navigation), loaded last |
| `viz-workspace.js`, `instrument-controls.js`, `engineering-inspector.js` | Navigation, parameter inputs, linked inspector |
| `eigenmode-lab.js`, `pole-zero-lab.js`, `stability-landscape.js`, `design-optimization.js` | Feature modules |
| `plain-language.js`, `reaction-time.js`, `crash-playback.js`, `canvas-descriptions.js` | Plain-English reading, doubling-time math, crash playback and chart descriptions, unit tested in Node |
| `control-theory.js`, `app-regressions.js` | Math helpers that are unit tested in Node |
| `tests/` | Node tests |
| `CONTROL_THEORY_AUDIT.md`, `MODEL_AUDIT.md` | How the control math and the bicycle model were checked against the MATLAB source |
| `original Matlab files/` | The original JBike6 MATLAB release, the mathematical source of truth. **Do not change anything in this folder.** The tests and the audit compare the app against these files as they are. |
| `FinalBicyclePaper_v45_with_Appendix.pdf` | Reference paper |
| `docs/ideas-archive.md` | Archived external review with feature ideas |

## Visual system
Blue marks selection and interaction. Red marks instability and nothing else. Green marks stability. Ochre marks the rider and rear assembly in the geometry views. Labels are sentence case; mono is for numbers only. See `CLAUDE.md` for the rules contributors follow.

## Original MATLAB files: leave unchanged
Everything in `original Matlab files/` is the authors' original release and must stay exactly as it is. The audit in `MODEL_AUDIT.md` and the reference tests treat these files as the source of truth, and the license requires the original to be preserved. Fixes and changes belong in the app, never in that folder.

Some presets in the app have MATLAB-style names (for example "Original Default", the Burley Canto bikes, the Chopper) but are not the bikes defined in the MATLAB `JBini_files`. Only the benchmark preset matches its MATLAB file. The preset names have been left as they are, and `MODEL_AUDIT.md` records the differences.

## Credits and license
Based on JBike6 by Schwab, Papadopoulos, Ruina and Dressel (Delft University of Technology and Cornell University), copyright 2003-2015. The original license requires attribution to the authors and places conditions on copying and transfer; the full text is in [`LICENSE-JBike6.md`](LICENSE-JBike6.md). The original MATLAB release history is in `original Matlab files/readme.md`.
