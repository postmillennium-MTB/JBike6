# Audit documentation

| File | What it is |
| --- | --- |
| [`audit-log.md`](audit-log.md) | The full record: method, each check, each bug, my own mistakes, and the limits |
| [`../../MODEL_AUDIT.md`](../../MODEL_AUDIT.md) | The short summary and results table |
| [`../../CONTROL_THEORY_AUDIT.md`](../../CONTROL_THEORY_AUDIT.md) | The earlier audit of `control-theory.js` |

## Test map
| Test file | Tests | Checks |
| --- | --- | --- |
| `tests/matlab-model.test.js` | 37 | M0, C1, K0, K2 and weave and capsize speeds against the MATLAB port, 18 bikes |
| `tests/paper-benchmark.test.js` | 3 | The benchmark bicycle against the paper's 14-digit matrices and Table 2 |
| `tests/eigen-reference.test.js` | 19 | Root solver and Eigenmode lab against the MATLAB eigenproblem |
| `tests/control-lab-transfer.test.js` | 7 | Displayed G(s) against the state-space matrices |
| `tests/ride-simulator.test.js` | 34 | Ride test and feedback simulation against the exact solution, plus closed-loop poles |
| `tests/design-reference.test.js` | 19 | Double roots and the design-sweep path used by the landscape and optimizer |
| `tests/app-features.test.js` | 20 | Gyroscopic multiplier against MATLAB, and wheel auto-scaling laws |
| `tests/plain-language.test.js`, `tests/reaction-time.test.js`, `tests/crash-playback.test.js` | 26 | The explanatory text, doubling-time math and crash playback |
| `tests/control-theory-audit.test.js` and the rest | 34 | Earlier tests of `control-theory.js` and the interface modules |

Total: 199. Each reference-based test fails on the bug it was written for (checked by temporarily reintroducing it).
