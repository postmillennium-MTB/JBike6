# JBike6 control-theory audit notes

This note records the equations and conventions used by the browser control lab and the points that must be kept distinct when comparing it with the original MATLAB implementation.

## Reference model and signs

The 2015 MATLAB `JBmck.m` states that `q = [lean angle, steer angle]`, lean right is positive, and steer left is positive. Its equations are

```text
M0 q̈ + v C1 q̇ + (K0 + v² K2) q = T
```

In that MATLAB code, `JBmck.m` forms `K0` with gravity already included (`g` multiplies all four entries). `JBike6Control.m` then computes `inv(M0) * (K0 + v² K2)` without another gravity factor.

The browser implementation has a different intermediate convention: its matrix-building code returns a gravity-free stiffness matrix (call it `K0hat`), and the control/eigenvalue calculations form `g K0hat + v² K2`. That is one application of gravity, not a second application to the MATLAB `K0`. Do not pass MATLAB's gravity-included `K0` into the browser's gravity-free convention without converting it first.

## State-space and steer torque

The browser uses the interleaved state `x = [q1, q̇1, q2, q̇2]ᵀ`, i.e. `[lean, lean rate, steer, steer rate]`. For `S = M0⁻¹(v C1)` and `K = M0⁻¹(g K0hat + v² K2)`, its open-loop matrices are

```text
A = [ 0       1       0       0
     -K11    -S11    -K12    -S12
      0       0       0       1
     -K21    -S21    -K22    -S22 ]
Bδ = [0, (M0⁻¹)12, 0, (M0⁻¹)22]ᵀ
Croll = [1, 0, 0, 0]
D = 0
```

This `Bδ` applies generalized torque to the second coordinate (steer), consistent with the physical steering-torque simulation. `Croll` measures lean angle. The MATLAB `JBike6Control.m` constructs a 4-column input matrix and requests input 2 from `ss2tf`; with its stated coordinate order and displayed matrix, that selected column corresponds to the first generalized coordinate. That source detail is not the same input channel as the browser's steer-torque channel, so the resulting transfer functions should not be called an exact reproduction of MATLAB's selected-input transfer function without resolving that discrepancy. The browser's explicit steer-torque channel is retained for the steer-control lab.

## Transfer function and feedback

For the second-order operator

```text
P(s) = [s² + S11 s + K11,  S12 s + K12
        S21 s + K21,        s² + S22 s + K22]
```

and `b = [(M0⁻¹)12, (M0⁻¹)22]ᵀ`, the roll transfer function is

```text
Groll(s) = (P22 b1 - P12 b2) / det(P)
```

The steer-angle output replaces the numerator with `(-P21 b1 + P11 b2)`. The denominator `det(P)` is the open-loop characteristic polynomial; its roots are the poles, and roots of the selected output numerator are the zeros. This is equivalent to `C(sI-A)⁻¹B` for the state and input above.

With right-positive lean and left-positive steering, a positive steer torque steers left. The UI's `τδ = +Kp φ + Kd φ̇ + Ki ∫φdt + τstep` therefore commands countersteer for positive lean/rate. The signs in the equations of motion remain `q̈ = M0⁻¹(T - v C1 q̇ - Kphysical q)`; feedback torque is added to the steer generalized-force component, not to the lean component.

## Schwinn Crown baseline caveat

The MATLAB source fixture `original Matlab files/JBini_files/JBini_Schwinn_Crown.m` is the authoritative original Schwinn Crown parameter set (wheelbase 1.016 m, head angle 1.23879599 rad, trail 0.090968 m, and the listed original component masses/inertias). The web preset named “JBike6 Schwinn Crown (Original Default)” is not that parameter set: for example, the current page preset uses a 1.076 m wheelbase and different component parameters. Treating the two as regression-equivalent would be misleading. A future model-alignment change should port the complete fixture, including its body inertias, angle conventions, and fork/basket geometry, rather than changing just the wheelbase.

## Scope and limitations

This is a linearized, small-angle bicycle model at a fixed forward speed and uses the browser model's parameterization. It is not a nonlinear full-bicycle model, a model of rider perception or delay, nor evidence that a particular feedback gain is safe or robust. The MATLAB transfer-function plotting script and browser lab also select different input channels as described above. Regression comparisons must state the parameter set, speed, coordinate/state ordering, gravity convention, input channel, and output explicitly.

References:

- [JBike6 control-theory explanation](http://ruina.tam.cornell.edu/research/topics/bicycle_mechanics/JBike6_web_folder/JBike6_and_Control_Theory.htm)
- `original Matlab files/JBike6GUI_2015_02_08/JBmck.m`
- `original Matlab files/JBike6GUI_2015_02_08/JBike6Control.m`
- `original Matlab files/JBike6GUI_2015_02_08/JBeig.m`
- `original Matlab files/JBike6GUI_2015_02_08/JBini.m`
- `original Matlab files/JBini_files/JBini_Schwinn_Crown.m`
