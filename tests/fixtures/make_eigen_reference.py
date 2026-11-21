"""Reference eigenvalues and mode shapes for tests/eigen-reference.test.js.

Follows JBeig.m: the generalized eigenproblem A V = B V D with A = [-C -K; I 0], B = blkdiag(M0, I),
using the MATLAB-reference matrices in matlab-reference.json. The state is [q'; q], so the mode shape
q = [lean, steer] is the lower half of each eigenvector.

MATLAB takes steer to the left as positive and the app takes steer to the right, so the steer
component changes sign. Amplitude ratios are unchanged and phase differences shift by 180 degrees.
The fixture stores MATLAB-convention values; the test applies the flip.

    python3 tests/fixtures/make_eigen_reference.py tests/fixtures/eigen-reference.json
"""
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ref = json.load(open(os.path.join(HERE, 'matlab-reference.json')))
SPEEDS = (1.0, 3.0, 5.0, 8.0, 12.0, 20.0)


def modes(name, v):
    M0, C1, K0, K2 = [np.array(ref[name][k]) for k in ('M0', 'C1', 'K0', 'K2')]
    C = C1 * v; K = K0 + K2 * v * v
    B = np.block([[M0, np.zeros((2, 2))], [np.zeros((2, 2)), np.eye(2)]])
    A = np.block([[-C, -K], [np.eye(2), np.zeros((2, 2))]])
    w, V = np.linalg.eig(np.linalg.solve(B, A))
    out = []
    for i in range(4):
        q = V[2:, i]
        ratio = abs(q[1]) / max(abs(q[0]), 1e-300)
        phase = None
        if abs(q[0]) > 1e-9 * abs(q[1]) and abs(q[1]) > 1e-9 * abs(q[0]):
            phase = float(np.degrees(np.angle(q[1] / q[0])))
        out.append(dict(re=float(w[i].real), im=float(w[i].imag), ratio=float(ratio), phase=phase))
    # Mode shape is ill-defined when two eigenvalues coincide, so flag those.
    for i in range(4):
        out[i]['isolated'] = all(abs(w[i] - w[j]) > 1e-3 * max(1, abs(w[i])) for j in range(4) if j != i)
    return out


if __name__ == '__main__':
    result = {n: {str(v): modes(n, v) for v in SPEEDS} for n in ref}
    json.dump(result, open(sys.argv[1], 'w'))
    print('wrote', sys.argv[1], len(result), 'bikes x', len(SPEEDS), 'speeds')
