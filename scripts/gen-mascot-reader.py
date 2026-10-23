#!/usr/bin/env python3
"""Generates the Clawd reading -> WOW 10s loop keyframes (data-state="read").

Same approach as gen-mascot-exercise.py: every animated group gets one keyframe set sampled from
the choreography below (30 samples/s, linear playback, easing baked in). The markup lives in
app/components/mascots/characters/MascotClawdReader.vue.

Run:  python3 scripts/gen-mascot-reader.py               (rewrites app/assets/css/mascots-reader.css)
      python3 scripts/gen-mascot-reader.py --check       (assertions + key-value table, writes nothing)
"""
import math
import sys
from pathlib import Path

DUR = 10.0
SAMPLES = 300                 # 30 fps
STATE = 'read'
FILE = Path(__file__).resolve().parent.parent / 'app' / 'assets' / 'css' / 'mascots-reader.css'

# ---------------------------------------------------------------- easing
BEZ = {
    'lin': None,
    'inout': (.42, 0, .58, 1),    # general motion
    'anticip': (.42, 0, 1, 1),    # slow ease-in (anticipation)
    'burst': (0, 0, .2, 1),       # fast ease-out (main reaction)
    'page': (.55, 0, .25, 1),     # page: accelerates, then settles
}


def bezier(name):
    if name == 'lin':
        return lambda u: u
    x1, y1, x2, y2 = BEZ[name]

    def f(u):
        if u <= 0:
            return 0.0
        if u >= 1:
            return 1.0
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            x = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m ** 2 * x2 + m ** 3
            lo, hi = (m, hi) if x < u else (lo, m)
        m = (lo + hi) / 2
        return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m ** 2 * y2 + m ** 3
    return f


class Track:
    """Piecewise value over time: start value, then (t_end, value, ease) segments."""

    def __init__(self, v0, segs):
        self.t = [0.0]
        self.v = [v0]
        self.e = [None]
        for t1, v1, e in segs:
            assert t1 >= self.t[-1] - 1e-9, (t1, self.t[-1])
            self.t.append(t1)
            self.v.append(v1)
            self.e.append(bezier(e))

    def __call__(self, t):
        for i in range(1, len(self.t)):
            if t <= self.t[i] + 1e-9:
                t0, t1 = self.t[i - 1], self.t[i]
                if t1 - t0 < 1e-9:
                    return self.v[i]
                u = (t - t0) / (t1 - t0)
                return self.v[i - 1] + (self.v[i] - self.v[i - 1]) * self.e[i](u)
        return self.v[-1]


# ---------------------------------------------------------------- choreography
# Units: viewBox units (1 unit = 1 art pixel). rz = degrees, + is clockwise.
# Every track starts and ends at the same value so 0s and 10s match (loop seam).

# Body: breathing at rest, WOW lean-back with overshoot, return to reading.
BODY_TY = Track(.5, [
    (.6, 0, 'inout'), (1.55, -.25, 'inout'), (2.5, 0, 'inout'), (3.45, -.25, 'inout'), (4.4, 0, 'inout'),
    (5.3, 0, 'lin'), (6.0, .25, 'anticip'), (6.3, -1.5, 'burst'), (6.6, -1, 'inout'), (7.7, -1, 'lin'),
    (8.2, -.5, 'inout'), (9.4, .5, 'inout'), (10, .5, 'lin'),
])
BODY_RZ = Track(0, [
    (5.3, 0, 'lin'), (6.0, 3, 'anticip'), (6.3, -7, 'burst'), (6.6, -4.5, 'inout'), (7.7, -5, 'lin'),
    (8.2, -2, 'inout'), (9.4, 0, 'inout'), (10, 0, 'lin'),
])

# Head: tilts toward the pages, leans in (anticipation), pulls back (reaction), nods (impressed).
HEAD_TY = Track(0, [
    (.6, .25, 'inout'), (5.8, .25, 'lin'), (6.2, -.5, 'burst'), (6.5, -.25, 'inout'), (7.3, -.25, 'lin'),
    (9.4, .25, 'inout'), (10, 0, 'lin'),
])
HEAD_RZ = Track(0, [
    (.6, 3, 'inout'), (5.5, 3, 'lin'), (5.8, 4, 'anticip'), (6.2, -3, 'burst'), (6.5, -1, 'inout'),
    (7.3, -1, 'lin'), (7.55, 2, 'inout'), (7.9, -1, 'inout'), (8.4, 2, 'inout'), (9.4, 3, 'inout'),
    (10, 0, 'lin'),
])

# Eyes (both eyes share the same track). Scan the line, return, squint, blink, freeze, wide open.
EYE_TX = Track(0, [
    (.6, -.5, 'inout'), (3.0, .5, 'inout'), (3.2, -.5, 'inout'), (4.4, 0, 'inout'), (4.7, .25, 'inout'),
    (5.3, .25, 'lin'), (5.55, .75, 'inout'), (5.8, .75, 'lin'), (6.0, .75, 'lin'), (8.2, .25, 'inout'),
    (8.75, -.5, 'inout'), (9.4, 0, 'inout'), (10, 0, 'lin'),
])
EYE_TY = Track(.5, [
    (.6, .5, 'lin'), (3.0, .5, 'lin'), (3.2, .75, 'inout'), (4.4, .5, 'inout'), (5.3, .5, 'lin'),
    (5.8, .5, 'lin'), (6.0, 0, 'burst'), (8.2, .25, 'inout'), (9.4, .5, 'inout'), (10, .5, 'lin'),
])
EYE_SY = Track(1, [
    (2.0, 1, 'lin'), (2.2, .6, 'inout'), (2.6, .6, 'lin'), (2.8, 1, 'inout'), (2.9, 1, 'lin'),
    (2.97, .1, 'lin'), (3.05, 1, 'lin'), (4.4, 1, 'lin'), (5.8, 1.25, 'anticip'), (6.0, 1.4, 'burst'),
    (6.5, 1.3, 'inout'), (8.2, 1.3, 'lin'), (8.6, 1, 'inout'), (8.7, .1, 'lin'), (8.8, 1, 'lin'),
    (10, 1, 'lin'),
])
EYE_SX = Track(1, [
    (5.8, 1, 'lin'), (6.0, 1.25, 'burst'), (6.5, 1.2, 'inout'), (8.2, 1.2, 'lin'), (8.6, 1.1, 'inout'),
    (9.4, 1, 'inout'), (10, 1, 'lin'),
])

# Book (inside the body group, so it inherits the body). Its own offset stays within +-0.5 units.
PROP_TY = Track(0, [(6.0, 0, 'lin'), (6.3, .5, 'burst'), (7.7, .5, 'lin'), (9.4, 0, 'inout'), (10, 0, 'lin')])
PROP_RZ = Track(0, [(5.3, 0, 'lin'), (6.0, -2, 'anticip'), (7.0, -2, 'lin'), (9.4, 0, 'inout'), (10, 0, 'lin')])

# Left claw: stays on the book; tiny counter-rotation so the shoulder does not drift with the book tilt.
CLAW_L_RZ = Track(0, [(5.3, 0, 'lin'), (6.0, 1, 'inout'), (7.0, 0, 'inout'), (10, 0, 'lin')])

# Right claw: forward page turn (4.4-5.5), amazement lift (6.3-8.3), reverse turn (8.7-9.3).
CLAW_R_RZ = Track(0, [
    (4.4, 0, 'lin'), (4.6, 25, 'inout'), (4.85, 35, 'page'), (5.1, 25, 'inout'), (5.5, 0, 'inout'),
    (6.3, 0, 'lin'), (6.7, -35, 'burst'), (7.1, -42, 'inout'), (7.5, -35, 'inout'), (8.3, 0, 'inout'),
    (8.7, 0, 'lin'), (8.9, 25, 'inout'), (9.0, 35, 'page'), (9.15, 25, 'inout'), (9.3, 0, 'inout'),
    (10, 0, 'lin'),
])

# Page: scaleX about the spine. 1 = right page, 0 = edge-on, -1 = left page (back side visible).
TURN_SX = Track(1, [
    (4.4, 1, 'lin'), (4.85, 0, 'page'), (5.3, -1, 'inout'), (8.7, -1, 'lin'), (9.0, 0, 'page'),
    (9.3, 1, 'inout'), (10, 1, 'lin'),
])
TURN_SK = Track(0, [
    (4.4, 0, 'lin'), (4.7, 8, 'inout'), (5.0, -5, 'inout'), (5.3, 0, 'inout'), (8.7, 0, 'lin'),
    (9.0, -5, 'inout'), (9.15, 8, 'inout'), (9.3, 0, 'inout'), (10, 0, 'lin'),
])

# Sparks: appear at the peak, fade out. Each spark has its own outward direction and stagger.
SPARK_DIR = {'fx-1': (-.5, -.5), 'fx-2': (0, -.75), 'fx-3': (.5, -.5)}
SPARK_DELAY = {'fx-1': .05, 'fx-2': 0, 'fx-3': .1}
SPARK_ORIGIN = {'fx-1': '3.5px 4.5px', 'fx-2': '7.5px 1.75px', 'fx-3': '11.5px 4.5px'}


def spark_tracks(d):
    f = Track(0, [(6.15 + d, 0, 'lin'), (6.3 + d, .75, 'burst'), (9.0 + d, .75, 'lin'), (10, 0, 'lin')])
    k = Track(.3, [(6.15 + d, .3, 'lin'), (6.3 + d, 1.2, 'burst'), (7.0 + d, 1.2, 'lin'),
                   (7.6 + d, 1.3, 'inout'), (9.0 + d, .3, 'lin'), (10, .3, 'lin')])
    o = Track(0, [(6.15 + d, 0, 'lin'), (6.25 + d, 1, 'burst'), (7.0 + d, 1, 'lin'), (7.6 + d, 0, 'inout'),
                  (10, 0, 'lin')])
    return f, k, o


SPARK = {name: spark_tracks(SPARK_DELAY[name]) for name in SPARK_DIR}


# ---------------------------------------------------------------- sampling
def q(v, step):
    return round(v / step) * step


def pose(t):
    """All animated values at time t (seconds, 0..DUR), quantised to the pixel-art grid."""
    body_ty = BODY_TY(t)
    eye_tx_lag = EYE_TX((t - .25) % DUR)     # head follows the eyes with a 0.25s lag, at 40%
    p = {
        'body': {'ty': q(body_ty, .25), 'rz': q(BODY_RZ(t), .5)},
        'shadow': {'sx': q(1 + .07 * body_ty, .05)},
        'head': {'tx': q(.4 * eye_tx_lag, .25), 'ty': q(HEAD_TY(t), .25), 'rz': q(HEAD_RZ(t), .5)},
        'eye': {'tx': q(EYE_TX(t), .25), 'ty': q(EYE_TY(t), .25),
                'sx': q(EYE_SX(t), .05), 'sy': q(EYE_SY(t), .05)},
        'prop': {'ty': q(PROP_TY(t), .25), 'rz': q(PROP_RZ(t), .5)},
        'claw-l': {'rz': q(CLAW_L_RZ(t), .5)},
        'claw-r': {'rz': q(CLAW_R_RZ(t), .5)},
        'turn': {'sx': q(TURN_SX(t), .05), 'sk': q(TURN_SK(t), .5)},
        # Back side of the page is visible while the page is turned past edge-on.
        'turn-back': {'o': 1 if TURN_SX(t) < 0 else 0},
    }
    for name, (f, k, o) in SPARK.items():
        p[name] = {'f': q(f(t), .05), 'k': q(k(t), .05), 'o': q(o(t), .05)}
    return p


def fmt(v):
    s = f'{v:.3f}'.rstrip('0').rstrip('.')
    return '0' if s in ('', '-0') else s


def decl(key, v):
    if key in ('body', 'prop'):
        return f"transform: translate(0px,{fmt(v['ty'])}px) rotate({fmt(v['rz'])}deg)"
    if key == 'head':
        return f"transform: translate({fmt(v['tx'])}px,{fmt(v['ty'])}px) rotate({fmt(v['rz'])}deg)"
    if key == 'shadow':
        return f"transform: scale({fmt(v['sx'])},1)"
    if key == 'eye':
        return f"transform: translate({fmt(v['tx'])}px,{fmt(v['ty'])}px) scale({fmt(v['sx'])},{fmt(v['sy'])})"
    if key in ('claw-l', 'claw-r'):
        return f"transform: rotate({fmt(v['rz'])}deg)"
    if key == 'turn':
        return f"transform: scale({fmt(v['sx'])},1) skewY({fmt(v['sk'])}deg)"
    if key == 'turn-back':
        return f"opacity: {v['o']}"
    if key in SPARK_DIR:
        dx, dy = SPARK_DIR[key]
        return (f"opacity: {fmt(v['o'])}; transform: translate({fmt(dx * v['f'])}px,{fmt(dy * v['f'])}px) "
                f"scale({fmt(v['k'])})")
    raise KeyError(key)


# (css class, keyframes name, transform-origin or None, sample key)
ENTRIES = [
    ('cw-body', 'cw-rw-body', '7.5px 13px', 'body'),
    ('cw-shadow', 'cw-rw-shadow', '7.5px 15.5px', 'shadow'),
    ('cw-head', 'cw-rw-head', '7.5px 9px', 'head'),
    ('cw-eye-l', 'cw-rw-eye-l', '4.5px 9px', 'eye'),
    ('cw-eye-r', 'cw-rw-eye-r', '10.5px 9px', 'eye'),
    ('cw-prop', 'cw-rw-prop', '7.5px 12.6px', 'prop'),
    ('cw-claw-l', 'cw-rw-claw-l', '2px 10px', 'claw-l'),
    ('cw-claw-r', 'cw-rw-claw-r', '13px 10px', 'claw-r'),
    ('cw-turn-page', 'cw-rw-turn', '7.5px 11.1px', 'turn'),
    ('cw-turn-back', 'cw-rw-turn-back', None, 'turn-back'),
    ('cw-fx-1', 'cw-rw-fx-1', SPARK_ORIGIN['fx-1'], 'fx-1'),
    ('cw-fx-2', 'cw-rw-fx-2', SPARK_ORIGIN['fx-2'], 'fx-2'),
    ('cw-fx-3', 'cw-rw-fx-3', SPARK_ORIGIN['fx-3'], 'fx-3'),
]


def keyframes_for(key, samples):
    """Keeps a sample unless it equals both neighbours (exact for linear playback)."""
    decls = [decl(key, s) for s in samples]
    out = []
    for i, d in enumerate(decls):
        keep = i in (0, SAMPLES) or d != decls[i - 1] or d != decls[i + 1]
        if keep:
            out.append((i * 100 / SAMPLES, d))
    return out


def css():
    poses = [pose(i * DUR / SAMPLES) for i in range(SAMPLES + 1)]
    lines = [
        '/* Clawd reading -> WOW! 10s loop. GENERATED by scripts/gen-mascot-reader.py: do not edit. */',
        f".mascot-clawd[data-state='{STATE}'] {{",
        f'  --cw-rw-dur: {fmt(DUR)}s;',
        '}',
        '',
        f".mascot-clawd[data-state='{STATE}'] .cw-turn-back,",
        f".mascot-clawd[data-state='{STATE}'] .cw-fx > g {{",
        '  opacity: 0;',
        '}',
        '',
    ]
    for cls, name, origin, key in ENTRIES:
        samples = [p[key] for p in poses]
        lines += [
            f".mascot-clawd[data-state='{STATE}'] .{cls} {{",
        ]
        if origin:
            lines += ['  transform-box: view-box;', f'  transform-origin: {origin};']
        lines += [f'  animation: {name} var(--cw-rw-dur) linear infinite;', '}', '']
    for cls, name, origin, key in ENTRIES:
        lines.append(f'@keyframes {name} {{')
        for pct, d in keyframes_for(key, [p[key] for p in poses]):
            lines.append(f'  {fmt(pct)}% {{ {d}; }}')
        lines += ['}', '']
    return '\n'.join(lines)


# ---------------------------------------------------------------- checks
def check():
    errors = []
    poses = [pose(i * DUR / SAMPLES) for i in range(SAMPLES + 1)]

    # 1. loop seam: first and last sample identical for every key
    for key in poses[0]:
        if poses[0][key] != poses[-1][key]:
            errors.append(f'seam: {key} differs at 0s and {DUR}s: {poses[0][key]} vs {poses[-1][key]}')

    # 2. book offset from the body stays small (it is held, not floating)
    for p in poses:
        if abs(p['prop']['ty']) > .5:
            errors.append(f"book offset too big: {p['prop']['ty']}")

    # 3. page turn is continuous (no teleport) and the back side flips only near edge-on
    for i in range(1, len(poses)):
        a, b = poses[i - 1], poses[i]
        if abs(a['turn']['sx'] - b['turn']['sx']) > .35:
            errors.append(f'page jump at sample {i}: {a["turn"]["sx"]} -> {b["turn"]["sx"]}')
        if a['turn-back']['o'] != b['turn-back']['o'] and abs(TURN_SX(i * DUR / SAMPLES)) > .1:
            errors.append(f'back side flips far from edge-on at sample {i}')

    # 4. no NaN
    for p in poses:
        for key, v in p.items():
            for x in v.values():
                if isinstance(x, float) and math.isnan(x):
                    errors.append(f'NaN in {key}')

    # 5. print review table
    print(f"{'t':>5} {'body ty/rz':>12} {'head rz':>8} {'eye tx/sy':>10} {'book ty/rz':>11} "
          f"{'claw-r rz':>10} {'page sx/sk':>11} {'back':>5} {'fx-2 o':>7}")
    for t in [0.2, 1.8, 4.6, 5.0, 5.6, 6.0, 6.3, 6.8, 7.6, 8.8, 9.9]:
        p = pose(t)
        print(f"{t:5.1f} {fmt(p['body']['ty']):>5}/{fmt(p['body']['rz']):<6} {fmt(p['head']['rz']):>8} "
              f"{fmt(p['eye']['tx']):>4}/{fmt(p['eye']['sy']):<5} {fmt(p['prop']['ty']):>5}/{fmt(p['prop']['rz']):<5} "
              f"{fmt(p['claw-r']['rz']):>10} {fmt(p['turn']['sx']):>5}/{fmt(p['turn']['sk']):<5} "
              f"{p['turn-back']['o']:>5} {fmt(p['fx-2']['o']):>7}")
    return errors


if __name__ == '__main__':
    if '--check' in sys.argv:
        errs = check()
        print('OK' if not errs else '\n'.join(errs))
        sys.exit(1 if errs else 0)
    out = FILE
    if '--out' in sys.argv:
        out = Path(sys.argv[sys.argv.index('--out') + 1])
    errs = check()
    if errs:
        print('\n'.join(errs))
        sys.exit(1)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(css() + '\n')
    print(f'wrote {out}')
