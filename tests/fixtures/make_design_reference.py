"""Reference values for tests/design-reference.test.js: double-root speeds and design-sweep samples.

Double roots: speeds where the quartic's discriminant changes sign, found by a fine scan and refined
by bisection, using the MATLAB-reference matrices (the same events JBdoubleroots.m solves for).

Design sweep: random changes to head angle, fork offset, wheelbase and rider mass and position on the
Schwinn Crown, with the largest real eigenvalue computed by the MATLAB port at a random speed. This is
the path the Stability landscape and Design optimization take.

    python3 tests/fixtures/make_design_reference.py tests/fixtures/design-reference.json
"""
import json, os, random, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import make_matlab_reference as mr

ref = json.load(open(os.path.join(HERE, 'matlab-reference.json')))


def eigs(r, v):
    M0, C1, K0, K2 = [np.array(r[k]) for k in ('M0', 'C1', 'K0', 'K2')]
    A = np.block([[np.zeros((2, 2)), np.eye(2)], [-np.linalg.solve(M0, K0 + K2 * v * v), -np.linalg.solve(M0, C1 * v)]])
    return np.linalg.eigvals(A)


def disc(r, v):
    w = eigs(r, v); d = 1.0 + 0j
    for i in range(4):
        for j in range(i + 1, 4): d *= (w[i] - w[j]) ** 2
    return d.real


def double_roots(r, vmax=30.0, step=0.002):
    vs = np.arange(step, vmax, step)
    D = np.array([disc(r, v) for v in vs])
    found = []
    for i in range(len(vs) - 1):
        if D[i] == 0 or D[i] * D[i + 1] < 0:
            lo, hi = vs[i], vs[i + 1]
            for _ in range(60):
                mid = 0.5 * (lo + hi)
                if disc(r, lo) * disc(r, mid) <= 0: hi = mid
                else: lo = mid
            found.append(float(0.5 * (lo + hi)))
    return found


def design_sweep(seed=7, n=12):
    random.seed(seed)
    base = ref['Schwinn_Crown']['ini']
    cases = []
    for _ in range(n):
        e = dict(base)
        hta = random.uniform(62, 78); off = random.uniform(10, 70); wb = random.uniform(0.95, 1.5)
        rm = random.uniform(40, 120); rx = random.uniform(0.15, 0.6); ry = random.uniform(0.8, 1.5); v = random.uniform(2, 12)
        rF = e['Dfrontwheel'] / 2
        trail = (rF * np.cos(np.radians(hta)) - off / 1000) / np.sin(np.radians(hta))
        e.update(head_angle=np.radians(hta), trail=trail, wheelbase=wb, mrider=rm, xcmrider=rx, ycmrider=ry)
        M0, C1, K0, K2 = mr.mck(e, 9.81)
        mx = max(z.real for z in mr.eig_at(M0, C1, K0, K2, v))
        cases.append(dict(hta=hta, off=off, wb=wb, rm=rm, rx=rx, ry=ry, v=v, maxRe=float(mx)))
    return dict(base='Schwinn_Crown', cases=cases)


if __name__ == '__main__':
    out = {'double_roots': {n: double_roots(r) for n, r in ref.items()}, 'design_sweep': design_sweep()}
    json.dump(out, open(sys.argv[1], 'w'))
    print('wrote', sys.argv[1], sum(len(v) for v in out['double_roots'].values()), 'double-root speeds')
