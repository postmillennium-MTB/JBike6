# MATLAB parity and principal-inertia workstream

## Phase 1 — independent MATLAB reference path

- `matlab-reference.js` is a separate JavaScript reference implementation of the rigid-body aggregation in `JBaddb.m` and the linearized matrix assembly in `JBmck.m`.
- It preserves the MATLAB convention that `K0` already includes gravity. This differs from the main Whipple/Meijaard path in `index.html`, which stores an unscaled stiffness matrix and applies gravity in its characteristic polynomial. The two conventions must not be mixed.
- The reference API exports `combineBodies`, `computeMatrices`, and the Schwinn Crown parameter set from `JBini_Schwinn_Crown.m`.
- Node regression tests cover mass/center-of-mass aggregation, the parallel-axis theorem, zero-mass behavior, a fixed Schwinn Crown matrix fixture, and invalid input handling.
- The module is loaded by `index.html` as a standalone reference API. It does not replace the main application solver.

### Validation boundary

The fixture is a regression baseline generated from the translated equations and parameter file. It is **not an independent MATLAB/Octave execution comparison**. Before claiming numerical parity, run the same parameter set in MATLAB/Octave and compare all four matrices and the weave/capsize speeds. The MATLAB source comments report 5.2770 m/s weave and 7.9807 m/s capsize for Schwinn Crown; those remain external target values, not results asserted by this JavaScript test suite.

Run:

```sh
node --test tests/matlab-reference.test.js
node --test tests/control-theory-audit.test.js
```

## Phase 2 — principal-inertia visualization

The current main-branch renderer provides the principal-inertia visualization:

- 2D component inertia ellipses for frame, rider, rack, fork, and basket.
- Aggregate principal axes for the rear-frame assembly (frame + rider + rack) and steering assembly (fork + basket).
- A total-bicycle center-of-mass marker.
- 3D wireframe inertia ellipsoids for the same components. Rear assembly glyphs follow lean; front assembly glyphs follow steering and lean.
- A shared visibility toggle and legend explaining that these glyphs show scaled radii of gyration, not physical component boundaries.

During conflict resolution, the older overlapping renderer implementation from the original #6 branch was not carried over. The newer main-branch 2D/3D renderer is retained instead. The physical model and Whipple solver are not changed by these display glyphs.

## Remaining parity work

1. Execute the original MATLAB/Octave scripts against the Schwinn Crown input and export `M0,C1,K0,K2` plus `vweave,vcapsize` as an independent checked-in fixture.
2. Compare the browser's Whipple/Meijaard matrices with an independent implementation of that same formulation; do not compare it directly with JBmck's gravity-scaled matrices without applying the documented convention conversion.
3. Add parameterized regression fixtures for the Benchmark bicycle and selected edge cases (zero-mass bodies, reversed/negative speed, singular mass matrix).
4. Extend the visualization with selectable principal-axis triads, numeric principal moments, and a glyph scale control.
