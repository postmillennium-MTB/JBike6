"""Reference trajectories for tests/ride-simulator.test.js.

The ride test and the Control lab simulate a linear system, so its exact solution is a matrix
exponential. This script computes that exact solution from the MATLAB reference matrices in
matlab-reference.json (see make_matlab_reference.py), with no numerical integration involved.

MATLAB takes steer to the left as positive and the app takes steer to the right, so steer angle and
steer torque change sign between them. The fixture stores the app's convention.

    python3 tests/fixtures/make_simulation_reference.py tests/fixtures/simulation-reference.json
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ref = json.load(open(os.path.join(HERE, 'matlab-reference.json')))
TIMES = np.arange(0, 6.0001, 0.5)
PHI0 = np.radians(5.0)


def expm(A, terms=24):
    n = max(0, int(np.ceil(np.log2(max(np.linalg.norm(A, 1), 1e-300)))) + 1)
    B = A / (2 ** n)
    R = np.eye(A.shape[0]); T = np.eye(A.shape[0])
    for k in range(1, terms):
        T = T @ B / k; R = R + T
    for _ in range(n): R = R @ R
    return R


def parts(name, v):
    M0, C1, K0, K2 = [np.array(ref[name][k]) for k in ('M0', 'C1', 'K0', 'K2')]
    Mi = np.linalg.inv(M0)
    return Mi, Mi @ (C1 * v), Mi @ (K0 + v * v * K2)


def open_loop(name, v):
    Mi, C, K = parts(name, v)
    A = np.block([[np.zeros((2, 2)), np.eye(2)], [-K, -C]])
    z0 = np.array([PHI0, 0, 0, 0])
    z = np.array([expm(A * t) @ z0 for t in TIMES])
    return dict(t=TIMES.tolist(), phi=z[:, 0].tolist(), delta=(-z[:, 1]).tolist())


def closed_loop(name, v, kp, kd, ki):
    # App convention: steer torque tau = kp*phi + kd*phi_dot + ki*integral(phi) acts on the steer equation.
    # In MATLAB's convention (steer flipped) the same torque enters as -tau.
    Mi, C, K = parts(name, v)
    b = Mi[:, 1]  # response of [lean, steer] to a unit steer torque
    A = np.zeros((5, 5))
    A[0:2, 2:4] = np.eye(2)
    A[2:4, 0:2] = -K
    A[2:4, 2:4] = -C
    A[4, 0] = 1.0  # integral of lean
    gains = np.zeros(5); gains[0] = kp; gains[2] = kd; gains[4] = ki
    A[2:4, :] += np.outer(-b, gains)  # MATLAB-convention torque is -tau
    z0 = np.array([PHI0, 0, 0, 0, 0])
    z = np.array([expm(A * t) @ z0 for t in TIMES])
    return dict(t=TIMES.tolist(), phi=z[:, 0].tolist(), delta=(-z[:, 1]).tolist())


if __name__ == '__main__':
    out = {'open_loop': [], 'closed_loop': []}
    cases = [(n, v) for n in ['Benchmark_Paper', 'Schwinn_Crown', 'Burley_Canto_short', 'Litespeed_Ultimate', 'TAM_674_Final_Project', 'Chopper'] for v in (2.0, 5.0, 8.0)]
    cases += [('Trail_only', 25.0), ('massalone3', 25.0), ('A_stable_minimal_bike', 25.0)]  # stiff: need sub-stepping
    for n, v in cases:
        out['open_loop'].append(dict(name=n, speed=v, **open_loop(n, v)))
    for n, v, kp, kd, ki in [('Benchmark_Paper', 3.0, 12.0, 6.0, 0.0), ('Benchmark_Paper', 3.0, 12.0, 6.0, 3.0),
                             ('Schwinn_Crown', 4.0, 12.0, 6.0, 0.0), ('Trail_only', 25.0, 12.0, 6.0, 0.0),
                             ('Benchmark_Paper', 5.0, 300.0, 40.0, 0.0)]:
        out['closed_loop'].append(dict(name=n, speed=v, kp=kp, kd=kd, ki=ki, **closed_loop(n, v, kp, kd, ki)))
    json.dump(out, open(sys.argv[1], 'w'))
    print('wrote', sys.argv[1], len(out['open_loop']), 'open-loop and', len(out['closed_loop']), 'closed-loop cases')
