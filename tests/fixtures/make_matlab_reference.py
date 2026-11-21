"""Reference values for tests/matlab-model.test.js.

A direct Python port of the MATLAB files JBmck.m and JBaddb.m (matrices) and JBeig.m (eigenvalues),
run on every bike definition in original Matlab files/JBini_files. It does not use the app's JavaScript.
Regenerate the fixture with:

    python3 tests/fixtures/make_matlab_reference.py tests/fixtures/matlab-reference.json

Requires numpy. Gravity is 9.81, matching the benchmark paper.
"""
import os, re, glob, json, sys, numpy as np

def parse_ini(path):
    txt = open(path, encoding='latin-1').read()
    env = {}
    for line in txt.splitlines():
        line = line.split('%')[0].strip().rstrip(';')
        m = re.match(r'^(\w+)\s*=\s*(.+)$', line)
        if not m: continue
        k, v = m.group(1), m.group(2).strip()
        if v.startswith("'") or v.startswith('sprintf'): continue
        if v.startswith('['):
            env[k] = [float(x) for x in v.strip('[]').split()]
        else:
            try: env[k] = float(v)
            except ValueError: pass
    return env

def addb(m, cm, I, a):
    m = np.array(m, float); cm = np.array(cm, float)
    mt = m.sum()
    cmt = (m @ cm) / mt if mt != 0 else np.zeros(2)
    It = np.zeros((3, 3))
    for i in range(len(m)):
        R = np.array([[np.cos(a[i]), -np.sin(a[i]), 0], [np.sin(a[i]), np.cos(a[i]), 0], [0, 0, 1]])
        d = np.array([cm[i, 0] - cmt[0], cm[i, 1] - cmt[1], 0.0])
        Ixyz = R @ np.diag(I[i]) @ R.T + m[i] * (d @ d * np.eye(3) - np.outer(d, d))
        It += Ixyz
    return mt, cmt, It

def total_com(e):
    # Total centre of mass [x, y] of all seven bodies, as JBmck.m forms cmt (rear contact is the origin, y is up).
    lam = np.pi / 2 - e['head_angle']
    Rl = np.array([[np.cos(lam), -np.sin(lam)], [np.sin(lam), np.cos(lam)]])
    Ol = np.array([e['wheelbase'] + e['trail'], 0.0])
    pf = Ol + Rl @ [e['ucmfork'], e['vcmfork']]
    pb = Ol + Rl @ [e['ucmbasket'], e['vcmbasket']]
    masses = np.array([e['mfrontwheel'], e['mfork'], e['mbasket'], e['mrearwheel'], e['mframe'], e['mrack'], e['mrider']])
    cms = np.array([[e['wheelbase'], e['Dfrontwheel'] / 2], pf, pb, [0, e['Drearwheel'] / 2],
                    [e['xcmframe'], e['ycmframe']], [e['xcmrack'], e['ycmrack']], [e['xcmrider'], e['ycmrider']]])
    return (masses @ cms / masses.sum()).tolist()


def mck(e, g):
    lam = np.pi / 2 - e['head_angle']
    masses = [e['mfrontwheel'], e['mfork'], e['mbasket'], e['mrearwheel'], e['mframe'], e['mrack'], e['mrider']]
    Rl = np.array([[np.cos(lam), -np.sin(lam)], [np.sin(lam), np.cos(lam)]])
    Ol = np.array([e['wheelbase'] + e['trail'], 0.0])
    pf = Ol + Rl @ [e['ucmfork'], e['vcmfork']]
    pb = Ol + Rl @ [e['ucmbasket'], e['vcmbasket']]
    cms = [[e['wheelbase'], e['Dfrontwheel'] / 2], list(pf), list(pb), [0, e['Drearwheel'] / 2],
           [e['xcmframe'], e['ycmframe']], [e['xcmrack'], e['ycmrack']], [e['xcmrider'], e['ycmrider']]]
    Icms = [e['Ifrontwheel'], e['Ifork'], e['Ibasket'], e['Irearwheel'], e['Iframe'], e['Irack'], e['Irider']]
    al = [e['alphaIfrontwheel'], e['alphaIfork'], e['alphaIbasket'], e['alphaIrearwheel'], e['alphaIframe'], e['alphaIrack'], e['alphaIrider']]
    mf, cmf, Ifcm = addb(masses[:3], cms[:3], Icms[:3], al[:3])
    mt, cmt, Itcm = addb(masses, cms, Icms, al)
    cmtO = np.array([cmt[0], cmt[1], 0.0])
    ItO = Itcm + mt * (cmtO @ cmtO * np.eye(3) - np.outer(cmtO, cmtO))
    Txx, Txy, Tyy = ItO[0, 0], ItO[0, 1], ItO[1, 1]
    cmfuv = Rl.T @ (cmf - np.array([e['wheelbase'] + e['trail'], 0.0]))
    d = cmfuv[0]
    ldir = np.array([-np.sin(lam), np.cos(lam), 0]); xdir = np.array([1, 0, 0]); ydir = np.array([0, 1, 0])
    Fll = mf * d * d + ldir @ Ifcm @ ldir
    Flx = -mf * cmf[1] * d + xdir @ Ifcm @ ldir
    Fly = mf * cmf[0] * d + ydir @ Ifcm @ ldir
    cw = e['wheelbase']; cf = e['trail'] * np.cos(lam)
    Sr = e['Irearwheel'][2] / (e['Drearwheel'] / 2)
    Sf = e['Ifrontwheel'][2] / (e['Dfrontwheel'] / 2)
    St = Sr + Sf
    nu = mf * d + mt * cmt[0] * (cf / cw)
    M0 = np.zeros((2, 2)); M0[0, 0] = Txx; M0[0, 1] = M0[1, 0] = Flx + (cf / cw) * Txy
    M0[1, 1] = Fll + 2 * (cf / cw) * Fly + (cf / cw) ** 2 * Tyy
    C1 = np.zeros((2, 2))
    C1[0, 1] = -(Sf * np.cos(lam) + (cf / cw) * St) + Txy * np.cos(lam) / cw - (cf / cw) * mt * cmt[1]
    C1[1, 0] = Sf * np.cos(lam) + (cf / cw) * St
    C1[1, 1] = np.cos(lam) / cw * Fly + (cf / cw) * (nu + np.cos(lam) / cw * Tyy)
    K0 = np.zeros((2, 2)); K0[0, 0] = -g * mt * cmt[1]; K0[0, 1] = K0[1, 0] = g * nu; K0[1, 1] = -g * nu * np.sin(lam)
    K2 = np.zeros((2, 2)); K2[0, 1] = -np.cos(lam) / cw * (St + mt * cmt[1])
    K2[1, 1] = np.cos(lam) / cw * (np.sin(lam) * Sf + nu)
    return M0, C1, K0, K2

def eig_at(M0, C1, K0, K2, v):
    M = M0; C = C1 * v; K = K0 + K2 * v * v
    B = np.block([[M, np.zeros((2, 2))], [np.zeros((2, 2)), np.eye(2)]])
    A = np.block([[-C, -K], [np.eye(2), np.zeros((2, 2))]])
    w = np.linalg.eigvals(np.linalg.solve(B, A))
    return sorted(w, key=lambda z: (round(z.real, 9), z.imag))

def critical_speeds(M0, C1, K0, K2, vmax=30.0, step=0.001):
    vs = np.arange(0, vmax + step, step)
    mx = np.array([max(e.real for e in eig_at(M0, C1, K0, K2, v)) for v in vs])
    stable = mx < 0
    idx = np.where(stable)[0]
    if len(idx) == 0: return None, None
    def cross(i0, i1):
        a, b = mx[i0], mx[i1]
        return vs[i0] + (0 - a) / (b - a) * (vs[i1] - vs[i0])
    i_first, i_last = idx[0], idx[-1]
    vw = cross(i_first - 1, i_first) if i_first > 0 else 0.0
    vc = cross(i_last, i_last + 1) if i_last < len(vs) - 1 else None
    return vw, vc

INI_GLOB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'original Matlab files', 'JBini_files', 'JBini_*.m')
# Marginally stable designs (eigenvalue real parts of about 1e-15), where stable/unstable is numerical noise.
SKIP = {'Rear_wheel_only', 'blank'}

if __name__ == '__main__':
    g = 9.81
    out = {}
    for p in sorted(glob.glob(INI_GLOB)):
        name = p.split('JBini_')[-1][:-2]
        if name in SKIP: continue
        e = parse_ini(p)
        need = ['head_angle', 'wheelbase', 'trail', 'Dfrontwheel', 'mframe']
        if any(k not in e for k in need):
            out[name] = {'skipped': 'missing ' + ','.join(k for k in need if k not in e)}; continue
        for k in ['mbasket', 'mrack', 'mrider', 'xcmrack', 'ycmrack', 'xcmrider', 'ycmrider', 'ucmbasket', 'vcmbasket', 'alphaIbasket', 'alphaIrack', 'alphaIrider']:
            e.setdefault(k, 0.0)
        for k in ['Ibasket', 'Irack', 'Irider']: e.setdefault(k, [0.0, 0.0, 0.0])
        try:
            M0, C1, K0, K2 = mck(e, g)
            vw, vc = critical_speeds(M0, C1, K0, K2)
            # Same bike with the wheels' spin inertia set to zero: the MATLAB counterpart of the app's gyro multiplier at 0.
            e0 = dict(e); e0['Irearwheel'] = list(e['Irearwheel'][:2]) + [0.0]; e0['Ifrontwheel'] = list(e['Ifrontwheel'][:2]) + [0.0]
            Mn, Cn, Kn, K2n = mck(e0, g)
            out[name] = dict(ini=e, M0=M0.tolist(), C1=C1.tolist(), K0=K0.tolist(), K2=K2.tolist(), vw=vw, vc=vc,
                             com=total_com(e),
                             no_gyro=dict(M0=Mn.tolist(), C1=Cn.tolist(), K0=Kn.tolist(), K2=K2n.tolist()),
                             eig5=[[z.real, z.imag] for z in eig_at(M0, C1, K0, K2, 5.0)],
                             eig10=[[z.real, z.imag] for z in eig_at(M0, C1, K0, K2, 10.0)])
        except Exception as ex:
            out[name] = {'error': repr(ex)}
    json.dump(out, open(sys.argv[1], 'w'))
    for n, r in out.items():
        if 'M0' in r: print(f"{n:32s} vw={r['vw']} vc={r['vc']}")
        else: print(f"{n:32s} {r}")
