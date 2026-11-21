# Audit log

A chronological record of how the app's math was checked, what each check found, and what went wrong along the way. It is written to be checked: every result names the test or script that reproduces it. The summary is in [`../../MODEL_AUDIT.md`](../../MODEL_AUDIT.md).

## Who did this, and what that means for trust
The audit was done by an AI model (Claude) working in a cloud session with the repository owner. No human reviewed the MATLAB files line by line, and MATLAB itself was never run. Treat the results as strong evidence, not as a sign-off. The trust chain is:

1. **The MATLAB source** (`original Matlab files/`) is the stated source of truth. I read it.
2. **My Python port** of `JBmck.m`, `JBaddb.m` and `JBeig.m` is a transcription I wrote. It could contain my own errors.
3. **The published paper**, Meijaard et al. (2007), is in the repo (`FinalBicyclePaper_v45_with_Appendix.pdf`). It prints the benchmark bicycle's matrices and eigenvalues to 14 digits. This is independent of both the app and my port, and it is the strongest check.
4. **Exact mathematics.** For the simulators the reference is the exact solution of the linear system (a matrix exponential), not another numerical integrator.

The port was checked against the paper. The app was checked against the port and, for the benchmark bicycle, directly against the paper. Anyone who wants more certainty should run the MATLAB files on the `JBini_*.m` bikes and compare with `tests/fixtures/matlab-reference.json`.

## Timeline

### 1. Reading both implementations
Read `JBmck.m`, `JBaddb.m`, `JBeig.m`, `JBvcrit.m`, `JBdoubleroots.m` and `JBike6Integrate.m`, and the app's `assembleWhippleModel`, `combineJBikeBodies`, `charPolyCoeffs`, `analyzeStability`, `computeStateSpaceAndTF`, `runPerturbationSimulation` and `runControlledSimulation`. The app implements the formulation of Meijaard et al. (2007), not a line-by-line copy of `JBmck.m`, so the two cannot be compared by reading alone. They must be compared by numbers.

### 2. A reference built from the MATLAB: `tests/fixtures/make_matlab_reference.py`
A Python port of the MATLAB matrix construction and eigenvalue problem, run on every bike in `JBini_files` (gravity 9.81).
- Sanity check on the port: the benchmark bicycle gave weave 4.2924 m/s and capsize 6.0243 m/s. At first I recalled the published values (4.292 and 6.024) from memory. **I later confirmed them in the paper's Table 2**: vw = 4.29238253634111 and vc = 6.02426201538837 m/s. The port agrees to about 1e-8.
- Two bikes were left out of the fixture: `blank` (division by zero, no mass) and `Rear_wheel_only` (eigenvalues on the imaginary axis to about 1e-15, so "stable" is numerical noise).

### 3. Model matrices: first bug found
Compared M0, C1, K0 and K2 element by element. Several entries disagreed, and dividing MATLAB's value by the app's gave exactly 1.02000, the benchmark's wheelbase. The app's line `S_A = (mA*uA + mu*mT*xT) / w` divided a first moment (kg·m) by the wheelbase. In Meijaard et al. and in MATLAB's `nu` it is not divided. Removing the division made all matrices agree.
- **Effect:** benchmark weave 4.373 and capsize 5.961 m/s before, against the published 4.292 and 6.024. The error grows with wheelbase, so modern MTB presets (about 1.25 m) were hit hardest.
- **First comparison mistake (mine):** my first table showed large mass-matrix errors. That was my comparison, not the app. The app uses steer-right-positive and MATLAB steer-left-positive, so off-diagonal terms differ in sign. After accounting for it, M0 agreed.
- **Fixed in:** PR #36. Test: `tests/matlab-model.test.js` (37 tests). With the old line, 30 of them fail.

### 4. Massless bodies: second bug
Two MATLAB bikes (`Five_double_roots`, `Another_5_root_design`) build the frame from massless bodies that still carry inertia. MATLAB's `JBaddb` keeps that inertia. The app's `combineJBikeBodies` returned zero inertia for a massless group. Fixed in PR #36.

### 5. Control lab transfer function: third bug
`computeStateSpaceAndTF` normalized the numerator but used `charPolyCoeffs` for the denominator, which is `det(M0)` times the monic polynomial. The displayed G(s) had the wrong gain by `det(M0)` (18.69 for the benchmark, 59 for the default mullet). Poles and zeros were right. Verified numerically against C (sI − A)⁻¹ B at several complex values of s. Fixed in PR #36. Test: `tests/control-lab-transfer.test.js` (7 tests, all fail on the old code).

### 6. What the fixes changed for users
Weave and capsize speeds from the app's presets, before and after (mph):

| Preset | Before | After |
| --- | --- | --- |
| Full 29" MTB | none | 15.6 to 22.6 |
| Mullet MX (default) | none | 15.9 to 23.0 |
| Full 27.5" | none | 15.9 to 23.1 |
| Schwinn "original default" | 14.8 to 17.3 | 13.3 to 18.0 |
| Benchmark | 9.8 to 13.3 | 9.6 to 13.5 |
| Burley long and short, Chopper | none | self-stable windows appear |

**Consequence for earlier work in this session:** the plain-English reading and the "time to react" figure were first demonstrated on the buggy model. For the default bike they said "does not balance itself" and "0.48 s". After the fix they say "balances itself between 15.9 and 23.0 mph" and "1.47 s at 14.5 mph". Those features shipped to `main` (PRs #34 and #35) with the wrong default numbers until PR #36.

### 7. Ride-test simulator: `JBike6Integrate.m`
MATLAB integrates the same equation with `ode45` at 1e-3 tolerance. The app uses fixed-step RK4 at 10 ms. The reference is the exact matrix-exponential solution, which is stricter than `ode45`.
- While the solution stays in range, the app agrees to about 1e-8 relative, for lean and (sign-flipped) steer.
- **Fourth bug:** RK4 at 10 ms is unstable once an eigenvalue passes about 278 per second. The MATLAB `Trail_only` design reaches 362 per second at 25 m/s. Its exact solution is a calm 5° lean, but the app blew up and reported a crash. The same happened for the feedback simulator with gains kp 300, kd 40. Both simulators now take sub-steps when stiff. Fixed in PR #37. Test: `tests/ride-simulator.test.js`.
- **Test mistake (mine):** one closed-loop case first failed. The app was right. The steer angle crossed the 1.5 rad display clamp between my 0.5 s sample points, and my test only looked at the exact values at the sample times. The test now stops comparing at the first simulated sample that reaches the clamp.
- **By design:** lean and steer are clamped at ±1.5 rad with the rate zeroed, which the linear model does not do.

### 8. Eigenmode lab
Its existing tests used made-up diagonal matrices. Compared the app's roots and the lab's mode shapes with the MATLAB eigenproblem (18 bikes, six speeds each): eigenvalues to 1e-6, amplitude ratio lean to steer to 1e-6, phase difference to 1e-4 degrees (shifted by 180 degrees for the steer sign). Where two eigenvalues coincide the mode shape is undefined, so those were skipped. Test: `tests/eigen-reference.test.js`. Deliberately breaking the phase or the ratio fails 18 of 19 tests.

### 9. Double roots
Compared the app's double-root speeds with sign changes of the polynomial discriminant, found by a fine scan and refined by bisection. All 34 reference speeds across the 18 bikes were found, with none missed and none spurious, including the five on each of the two designs built to have five. (I first wrote "36" in a status message. The count is 34.) Test: `tests/design-reference.test.js`.

### 10. Stability landscape and Design optimization
They set a model parameter through an axis path, rebuild the model and take the largest real eigenvalue. Twelve random designs (head angle, fork offset, wheelbase, rider mass and position) matched the MATLAB port to about 3.5e-15. The axes use the right units. Not checked: the shape of the displayed surfaces and the optimizer's search behavior.

### 11. App-only features
- **Gyroscopic multiplier:** the MATLAB counterpart is zero wheel spin inertia. At multiplier 0 the app matches MATLAB for all 18 bikes (`tests/app-features.test.js`).
- **Wheel auto-scaling:** no MATLAB counterpart. The app assumes wheel mass proportional to radius and spin inertia 0.828·m·r². The test pins these scaling laws down. The reference values (0.371 m, 2.15 kg, 0.245 kg·m²) carry no comment or citation in the code, and I found no source for them.
- **Mullet frame pitch:** no MATLAB counterpart. Sign and form are geometrically sound (a smaller rear wheel lowers the rear axle and the frame pitches back by asin(Δ/w)), but only the head angle changes. Frame, rider and fork mass positions are not rotated with the pitch.

### 12. Closed-loop poles in the Control lab
Compared `computeClosedLoopPoles` with the eigenvalues of the feedback system (4 states, or 5 with integral action) for five gain sets, to 1e-6. Test: `tests/ride-simulator.test.js`.

### 13. Presets against the MATLAB files
Seven presets are named after MATLAB bikes. Only the benchmark preset matches its MATLAB file. The "Original Default" Schwinn, Burley long and short, Chopper, Minimal and Trail-only presets are different bikes with MATLAB-style names (for example Schwinn frame mass 11.4 kg versus 2.5 kg). Their weave and capsize speeds differ from the real files. **Not changed.** Whether to rename or correct them is the owner's decision.

### 14. Direct check against the paper
The paper's equations (6.1) to (6.4) and Table 2 were turned into a test (`tests/paper-benchmark.test.js`). It found one more thing: the shipped benchmark preset was off from the paper by about 1e-6, because its fork offset (32.071 mm, exact 32.071427 mm), fork-mass coordinates and principal-axis angles were rounded. I replaced them with the exact values computed from the paper's Table 1. The preset now reproduces the matrices to 1e-10 and the eigenvalues and transition speeds to 1e-8, including the double-root speed (0.684283) and the weave frequency at the weave speed (3.4350 rad/s). With the old S_A line, all three tests fail.

### 15. Generated text
`updateKPIsAndInsight` made claims the model does not demonstrate:
- "Lower rear wheel spin inertia reduces gyroscopic resistance to lean-induced steering, stabilizing weave…" appeared for every mullet, even with auto-scaling off (the rear wheel's inertia is then unchanged) and even with the gyroscopic effect set to 0%.
- The capsize readout said "Infinite" when no capsize speed was found, but the search only covers 0 to 26 m/s (or the plot maximum).

The wording now lives in `plain-language.js` (`insightFor`) with tests, states what the model computes, and mentions the wheel's gyroscopic term only when auto-scaling is on. "Infinite" became "None found" with the searched range. Units: mph 2.2369 and km/h 3.6 per m/s are correct.

## Corrections to my own earlier statements
- The license-email draft said the model was "verified numerically against the MATLAB source". I wrote that before any check. For the equations of motion it is true now, from this audit.
- Benchmark values were first quoted from memory. They were later confirmed in the paper.
- Demonstration numbers for the default bike (plain-English text, 0.48 s reaction time, crash at 1.93 s) came from the buggy model.
- A mistaken count of "36" double-root speeds (correct: 34).
- A first, wrong comparison table that forgot the steer-sign change (see step 3).

## Known limits of this audit
- MATLAB was never executed. The reference is my port plus the paper.
- Several tests cut model code out of `index.html` using text markers (for example the string `function combineJBikeBodies`). Renaming or reordering those functions will break the tests loudly, which is intended, but the markers need updating.
- Not checked at all: 2D and 3D drawing geometry (reviewed only in screenshots), the rider stance feature, the layout of the landscape and optimization displays, the numeric content of the optimization search, and the physics of the app-only features beyond what is stated above.
- The step-size guard bounds the stiffness with a matrix norm. It was tested on the 18 MATLAB bikes and the presets, not on arbitrary user-edited designs.
- The stability search samples 181 speeds. A self-stable window narrower than one sample (about 0.14 m/s) could be missed.

## Reproducing everything
```sh
node --test tests/*.test.js          # 199 tests
# Regenerate the reference fixtures (needs Python 3 and numpy):
python3 tests/fixtures/make_matlab_reference.py tests/fixtures/matlab-reference.json
python3 tests/fixtures/make_simulation_reference.py tests/fixtures/simulation-reference.json
python3 tests/fixtures/make_eigen_reference.py tests/fixtures/eigen-reference.json
python3 tests/fixtures/make_design_reference.py tests/fixtures/design-reference.json
```
