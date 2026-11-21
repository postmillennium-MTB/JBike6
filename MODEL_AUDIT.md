# Model audit: app versus the original MATLAB

This records how the app's bicycle model was checked against the 2015 MATLAB release, what was found, and what has not been checked. It complements `CONTROL_THEORY_AUDIT.md`, which covers `control-theory.js`.

## Method
1. `tests/fixtures/make_matlab_reference.py` is a direct Python port of `JBmck.m`, `JBaddb.m` and `JBeig.m`. It does not use the app's JavaScript.
2. Sanity check on the port: for the Meijaard benchmark bicycle it gives a weave speed of 4.2924 m/s and a capsize speed of 6.0243 m/s, which match the published values (Meijaard et al. 2007: 4.292 and 6.024).
3. The port was run on every bike in `original Matlab files/JBini_files` (gravity 9.81). The results are the fixture `tests/fixtures/matlab-reference.json`.
4. The app's `assembleWhippleModel` was run on the same inputs. M0, C1, K0 and K2 were compared element by element (after the steer sign change below), and weave and capsize speeds were compared.

## Findings, all fixed
| Finding | Effect | Fix |
| --- | --- | --- |
| `S_A` was divided by the wheelbase `w`. It is a first moment in kg·m, as in Meijaard et al. and MATLAB's `nu`. | K0(1,2), K0(2,2), K2(2,2) and C1(2,2) were wrong by a factor that grows with wheelbase. The benchmark's weave and capsize speeds were off by 2%. Every modern MTB preset (wheelbase about 1.25 m) showed no self-stable window. With the fix they show windows of roughly 15.6 to 23 mph. | Removed the division. |
| `combineJBikeBodies` returned zero inertia for a group with no mass, while MATLAB's `JBaddb` keeps the inertia of massless bodies. | Wrong mass matrix for designs that use a massless body with inertia (two MATLAB test bikes). | Centre taken at the origin for a massless group, inertia kept. |
| Control lab: `denG` was the raw `det(M0 s² + C s + K)`, which is `det(M0)` times the monic polynomial, while `numG` was normalized. | The displayed `G(s) = numG/denG` had the wrong gain by `det(M0)` (about 19 to 59). Poles and zeros were right. | `denG` is now monic. |

After the fixes, all 18 compared MATLAB bikes agree on M0, C1, K0 and K2 to about 2e-15 (relative). Weave and capsize speeds agree to 0.01 m/s or better. `tests/matlab-model.test.js` and `tests/control-lab-transfer.test.js` keep it that way. Both fail on the old code.

## Ride-test simulator versus `JBike6Integrate.m`
MATLAB integrates M0 q'' = -(C1 v q' + (K0 + v²K2) q) with `ode45` at a tolerance of 1e-3. The app uses the same equation with fixed-step RK4 at 10 ms. The reference for the check is the exact solution (a matrix exponential, `tests/fixtures/make_simulation_reference.py`), which is stricter than `ode45`. Tests: `tests/ride-simulator.test.js`.

- **Accuracy:** while the solution stays inside the display range, the app matches the exact solution to about 1e-8 (relative) for lean and, with the sign flipped, steer. Unstable bikes match to about 1e-7 up to the moment they hit the clamp.
- **Fixed (stiff designs):** fixed-step RK4 at 10 ms goes unstable once an eigenvalue passes about 278 per second. The MATLAB `Trail_only` design reaches 362 per second at 25 m/s. The exact solution is a calm 5° lean, but the app's integrator blew up and reported a false crash. The ride test and the Control lab feedback simulator now take extra sub-steps when the system is stiff. The presets take one step at ordinary speeds and 2 to 9 at 15 to 25 m/s. After the fix the stiff cases agree to about 1e-12. A feedback case with gains kp 300 and kd 40 was also affected.
- **Display clamp (by design):** lean and steer are clamped at ±1.5 rad and the rate is zeroed. The linear model does not do this, so after a clamp the trajectory is no longer the linear solution. The crash playback stops at 45° of lean, before the clamp. The Control lab's unstable closed-loop responses can reach the clamp through steer angle.
- **Initial conditions:** MATLAB lets you set initial lean, steer and both rates. The app starts from an initial lean with everything else at rest. The "roll impulse" control is an initial lean angle, not an impulse.

## Differences that are not bugs
- **Steer sign.** MATLAB takes steer to the left as positive. The app uses Meijaard's convention (steer right positive). The off-diagonals of M0, C1, K0 and K2 change sign. Eigenvalues are identical.
- **`Rear_wheel_only`** is left out of the fixture. Its eigenvalues lie on the imaginary axis (real parts of about 1e-15), so "stable" is numerical noise and the two implementations disagree on a meaningless boundary.
- **Search range.** The app finds a capsize speed only within its search range. The Chopper's capsize speed (16.06 m/s) lies beyond the default plot range of 12 m/s.

## Preset fidelity
The preset called "JBike6 Schwinn Crown (Original Default)" is not the MATLAB `JBini_Schwinn_Crown.m`. Its masses, centres of mass, inertias and fork values differ (for example frame mass 11.4 kg versus 2.5 kg). The benchmark preset does match the MATLAB benchmark and the published numbers.

## Not checked
- App-only features that have no MATLAB counterpart: wheel auto-scaling, the mullet frame-pitch option, the gyroscopic multiplier.
- The 3D and 2D drawing geometry.
- The Stability landscape and Design optimization searches. They reuse the corrected model but were not checked on their own.
- The explanatory text generated from the analysis (`updateKPIsAndInsight`), for example the statements about how smaller rear wheels change stability.
