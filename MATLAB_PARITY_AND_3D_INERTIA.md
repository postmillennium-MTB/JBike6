# MATLAB parity and 3D inertia workstream

## Phase 1 — independent MATLAB reference path

- `matlab-reference.js` is a separate, literal JavaScript port of the rigid-body aggregation in `JBaddb.m` and the linearized matrix assembly in `JBmck.m`.
- It keeps the MATLAB convention that `K0` already includes gravity. This differs from the current Whipple/Meijaard path in `index.html`, which stores an unscaled stiffness matrix and applies gravity in its characteristic polynomial. The two conventions must not be mixed.
- The reference API exports `combineBodies`, `computeMatrices`, and the exact published Schwinn Crown parameter set from `JBini_Schwinn_Crown.m`.
- Node regression tests cover mass/center-of-mass aggregation, the parallel-axis theorem, zero-mass behavior, a fixed Schwinn Crown matrix fixture, and invalid input handling.

### Validation boundary

The fixture is a regression baseline generated from the translated equations and exact MATLAB parameter file. It is **not yet an independent MATLAB/Octave execution comparison**. Before claiming numerical parity, run the same parameter file in MATLAB/Octave and compare all four matrices and the weave/capsize speeds. The MATLAB source comments report 5.2770 m/s weave and 7.9807 m/s capsize for Schwinn Crown; those remain external target values, not a result asserted by this JavaScript test suite.

Run:

```sh
node --test tests/matlab-reference.test.js
node --test tests/control-theory-audit.test.js
```

## Phase 2 — principal inertia visualization

The 3D ride view now renders wireframe principal-inertia ellipsoids for the frame, rider, fork, and basket when those components have nonzero mass and inertia. Their radii are proportional to the principal radii of gyration, `sqrt(Iprincipal / mass)`, and their in-plane orientation follows each component's `alphaDeg`. Front-assembly ellipsoids follow steering and lean transforms; rear-frame ellipsoids follow lean.

These are **inertia glyphs**, not literal external body shapes. They communicate the distribution of mass about principal axes and are drawn with a common visual scale. They do not imply that the component physically occupies the ellipsoid volume.

## Remaining parity work

1. Execute the original MATLAB/Octave scripts against the Schwinn Crown input and export `M0,C1,K0,K2` plus `vweave,vcapsize` as a checked-in fixture.
2. Compare the browser's Whipple/Meijaard matrices with an independent implementation of that same formulation; do not compare it directly with JBmck's gravity-scaled matrices without applying the documented convention conversion.
3. Add parameterized regression fixtures for the Benchmark bicycle and selected edge cases (zero-mass bodies, reversed/negative speed, singular mass matrix).
4. Extend 3D glyphs to wheels and show a selectable principal-axis triad, numeric principal moments, and a legend/scale control.
