#!/usr/bin/env python3
"""Generates app/assets/css/mascots-exercise.css (the Clawd exercise scene keyframes).

Why generated: each dumbbell is ONE persistent group living outside the arm groups, so its path
must equal the claw's grip point at every instant. The grip point depends on the body squash,
the shoulder, the arm angle and the arm reach, so the keyframes for body / arms / claws / dumbbells
are all sampled from the same small kinematic model (and the requested cubic-bezier easings are
evaluated here and baked into the samples, which are then played back linearly).

Run:  python3 scripts/gen-mascot-exercise.py          (rewrites app/assets/css/mascots-exercise.css)
      python3 scripts/gen-mascot-exercise.py --check  (collision / continuity report; fails if the checked-in CSS is stale)
The markup lives in app/components/mascots/characters/MascotClawdExercise.vue.
Coordinates are the clawd-emotes skill's (torso 2,6 11x7; ground y=15); real port = +15/+25 shift.
"""
import math
import sys
from pathlib import Path

DUR = 10.0
FILE = Path(__file__).resolve().parent.parent / 'app' / 'assets' / 'css' / 'mascots-exercise.css'

# ---------------------------------------------------------------- easing
BEZ = {
    'lift': (.33, 0, .25, 1),     # lifting weights
    'lower': (.45, 0, .55, 1),    # lowering / reaching
    'inout': (.42, 0, .58, 1),    # breathing, body
    'out': (0, 0, .58, 1),        # landing bounce (rise)
    'in': (.42, 0, 1, 1),         # landing bounce (fall)
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


# ---------------------------------------------------------------- rig constants
SH_L, SH_R = (2.0, 10.0), (13.0, 10.0)      # shoulder pivots (rest)
GROUND = 15.0                                # body squash pivot (feet line)
G0 = 1.2                                     # neutral grip distance from shoulder
ARM_LEN0 = 2.0                               # arm rect length (x 0..2)
CLAW_HALF = 0.8                              # arm ends 0.8 past the grip, hidden under the claw
PLATE_H = 2.3
FLOOR_Y = GROUND - PLATE_H / 2               # dumbbell centre when resting on the ground
FLOOR_X_L, FLOOR_X_R = -1.6, 16.6            # outside each foot, symmetric about x=7.5
S_BEND = 0.68                                # torso bends ~2.9 units down (pivot on the feet)
TH_N, TH_PEAK, TH_REST = 12.0, 74.0, 4.0
S_PEAK = 0.94
S_BREATH = 0.944                             # ~0.5 unit torso drop

# kinematic helpers ---------------------------------------------------------------
def shoulder_y(s):
    return GROUND - (GROUND - SH_L[1]) * s


def grip(side, th, g, s):
    """Grip point; th = arm angle, positive = raised."""
    sy = shoulder_y(s)
    if side == 'L':
        return (SH_L[0] - g * math.cos(math.radians(th)), sy - g * math.sin(math.radians(th)))
    return (SH_R[0] + g * math.cos(math.radians(th)), sy - g * math.sin(math.radians(th)))


def floor_pose(side):
    fx = FLOOR_X_L if side == 'L' else FLOOR_X_R
    sy = shoulder_y(S_BEND)
    vx = (SH_L[0] - fx) if side == 'L' else (fx - SH_R[0])
    vy = FLOOR_Y - sy                      # positive = below the shoulder
    return math.degrees(math.atan2(-vy, vx)), math.hypot(vx, vy)


TH_F, G_F = floor_pose('L')
assert abs(floor_pose('R')[0] - TH_F) < 1e-9

# ---------------------------------------------------------------- choreography
T_DESC0, T_DESC1 = 4.15, 4.85       # carry the weights down to the floor
T_REL = 5.0                         # claws open: release
T_UP0, T_UP1 = 5.0, 5.75            # claws retract, torso returns upright
T_BOUNCE = (5.0, 5.09, 5.19)        # weight settles: rise 0.5 then land
T_RESTA, T_RESTB = 5.75, 7.7
T_REACH0, T_REACH1 = 7.7, 8.2       # reach for the handles
T_GRAB = 8.34                       # contact held 0.14s, then lift
T_LIFT1 = 8.9
REPS = [(0.0, 0.95), (0.95, 1.9), (1.9, 2.85), (2.85, 4.0)]   # last one slower: tired


def curls(low, high, ease_up='lift', ease_down='lower', reps=REPS):
    segs = []
    for a, b in reps:
        d = b - a
        segs += [(a + .40 * d, high, ease_up), (a + .52 * d, high, 'lin'), (b, low, ease_down)]
    return segs


# release / pickup path of the arms: u = 0 (claws gripping at floor) .. 1 (hanging at rest)
# control points: (u, theta, grip_dist, wrist_flatten c, body scale)
PATH = [
    (0.00, TH_F, G_F, 1.0, S_BEND),
    (0.22, TH_F + 14, G_F - 1.15, 1.0, S_BEND),   # claws open / retract up and away, body still bent
    (0.55, -2.0, 2.6, 0.4, (S_BEND + 1) / 2),
    (1.00, TH_REST, G0, 0.0, 1.0),
]


def path(u):
    u = max(0.0, min(1.0, u))
    for (u0, *a), (u1, *b) in zip(PATH, PATH[1:]):
        if u <= u1:
            k = (u - u0) / (u1 - u0)
            return tuple(x + (y - x) * k for x, y in zip(a, b))
    return PATH[-1][1:]


def smooth(a, b, x):
    k = max(0.0, min(1.0, (x - a) / (b - a)))
    return k * k * (3 - 2 * k)


ease_lower, ease_lift, ease_io = bezier('lower'), bezier('lift'), bezier('inout')
ease_out, ease_in = bezier('out'), bezier('in')

# base tracks for the curl / neutral stretches ------------------------------------------
TH_L = Track(TH_N, curls(TH_N, TH_PEAK) + [(T_DESC0, TH_N, 'lin')])
S_CURL = Track(1.0, curls(1.0, S_PEAK) + [(T_DESC0, 1.0, 'lin')])
EYE_SY = Track(.8, curls(.8, .55) + [(T_DESC0, .8, 'lin')])


def state(t):
    """Returns dict of parameters at time t (all in rig units / degrees)."""
    r = {}
    if t < T_DESC0:                                       # curls + neutral
        th, g, c, s = TH_L(t), G0, 0.0, S_CURL(t)
    elif t < T_DESC1:                                     # carry weights down
        u = ease_lower((t - T_DESC0) / (T_DESC1 - T_DESC0))
        th = TH_N + (TH_F - TH_N) * u
        g = G0 + (G_F - G0) * u
        c = smooth(.55, 1.0, u)
        s = 1 + (S_BEND - 1) * u
    elif t < T_UP0:                                       # hold the handles
        th, g, c, s = TH_F, G_F, 1.0, S_BEND
    elif t < T_UP1:                                       # release, retract, stand up
        u = ease_lower((t - T_UP0) / (T_UP1 - T_UP0))
        th, g, c, s = path(u)
    elif t < T_RESTB:                                     # rest: calm breathing
        th, g, c = TH_REST, G0, 0.0
        s = 1.0
    elif t < T_REACH1:                                    # reach for the handles
        u = 1 - ease_lower((t - T_REACH0) / (T_REACH1 - T_REACH0)) if t >= T_REACH0 else 1.0
        th, g, c, s = path(u)
    elif t < T_GRAB:                                      # hold contact before lifting
        th, g, c, s = TH_F, G_F, 1.0, S_BEND
    elif t < T_LIFT1:                                     # lift together, straighten
        u = ease_lift((t - T_GRAB) / (T_LIFT1 - T_GRAB))
        th = TH_F + (TH_N - TH_F) * u
        g = G_F + (G0 - G_F) * u
        c = 1 - smooth(0.0, .6, u)
        s = S_BEND + (1 - S_BEND) * u
    else:                                                 # neutral pause + final curl
        th = Track(TH_N, [(8.95, TH_N, 'lin'), (9.4, TH_PEAK, 'lift'), (9.45, TH_PEAK, 'lin'),
                          (9.9, TH_N, 'lower'), (10.0, TH_N, 'lin')])(t)  # absolute time track
        g, c = G0, 0.0
        s = Track(1.0, [(8.95, 1.0, 'lin'), (9.4, S_PEAK, 'lift'), (9.45, S_PEAK, 'lin'),
                        (9.9, 1.0, 'lower'), (10.0, 1.0, 'lin')])(t)
    # tracks that are not simple functions of the phase above ---------------------------
    if T_UP1 <= t < T_RESTB:                              # breathing: 2 cycles of ~1.05 s
        s = breath(t)
    r['th'], r['g'], r['c'], r['s'] = th, g, c, s
    # right claw: one small, calm tired shake (30° then 45° outward) during the rest
    thr = th
    if 6.0 <= t < 7.0:
        thr = Track(TH_REST, [(6.0, TH_REST, 'lin'), (6.3, 30, 'inout'), (6.55, 45, 'inout'),
                              (7.0, TH_REST, 'inout')])(t)
    r['thr'] = thr
    return r


def breath(t):
    # 5.75 -> 7.7 : two ~0.97 s breaths, torso drops ~0.5 unit then returns (ease-in-out)
    pts = [(T_UP1, 1.0), (T_UP1 + .49, S_BREATH), (T_UP1 + .975, 1.0), (T_UP1 + 1.46, S_BREATH), (T_RESTB, 1.0)]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * ease_io((t - t0) / (t1 - t0))
    return 1.0


def eyes(t):
    """(scaleY, translateY) of the eye group."""
    if t < T_DESC0:
        return EYE_SY(t), 0.0
    if t < T_DESC1:
        k = ease_io((t - T_DESC0) / (T_DESC1 - T_DESC0))
        return .8, .4 * k                                  # looking down at the weights
    if t < 5.2:
        return .8, .4
    if t < 5.9:
        k = ease_io((t - 5.2) / .7)
        return .8 + (.22 - .8) * k, .4 * (1 - k)           # eyes almost closed
    if t < 7.4:
        return .22, 0.0
    if t < T_REACH0:
        k = ease_io((t - 7.4) / .3)
        return .22 + (.8 - .22) * k, .5 * k                # open and look down at the weights
    if t < T_GRAB:
        return .8, .5
    if t < T_LIFT1:
        k = ease_io((t - T_GRAB) / (T_LIFT1 - T_GRAB))
        return .8, .5 * (1 - k)
    sy = Track(.8, [(8.95, .8, 'lin'), (9.4, .55, 'lift'), (9.45, .55, 'lin'), (9.9, .8, 'lower'), (10, .8, 'lin')])(t)
    return sy, 0.0


def bounce(t):
    if t < T_BOUNCE[0] or t >= T_BOUNCE[2]:
        return 0.0
    if t < T_BOUNCE[1]:
        return .5 * ease_out((t - T_BOUNCE[0]) / (T_BOUNCE[1] - T_BOUNCE[0]))
    return .5 * (1 - ease_in((t - T_BOUNCE[1]) / (T_BOUNCE[2] - T_BOUNCE[1])))


def sweat(t):
    """(opacity A, opacity B) wrappers: calmer during the rest."""
    def fade(t0, t1, a, b):
        return a + (b - a) * ease_io((t - t0) / (t1 - t0))
    if t < 5.0:
        return 1.0, 1.0
    if t < 5.8:
        return fade(5.0, 5.8, 1, .35), fade(5.0, 5.8, 1, 0)
    if t < 7.7:
        return .35, 0.0
    if t < 8.4:
        return fade(7.7, 8.4, .35, 1), 0.0
    if t < 8.9:
        return 1.0, fade(8.4, 8.9, 0, 1)
    return 1.0, 1.0


# ---------------------------------------------------------------- derived outputs
def outputs(t):
    p = state(t)
    th, thr, g, c, s = p['th'], p['thr'], p['g'], p['c'], p['s']
    out = {}
    sy = shoulder_y(s) - SH_L[1]                           # shoulder drop
    sa = (g + CLAW_HALF) / ARM_LEN0                        # arm stretch so it ends under the claw
    out['arm-l'] = (sy, th, sa)
    out['arm-r'] = (sy, -thr, (g + CLAW_HALF) / ARM_LEN0)
    for side, name, angle in (('L', 'l', th), ('R', 'r', thr)):
        x, y = grip(side, angle, g, s)
        phi = angle * (1 - c)
        rot = phi if side == 'L' else -phi
        out['claw-' + name] = (x, y, rot)
        held = (t < T_UP0) or (t >= T_GRAB)
        if held:
            out['db-' + name] = (x, y, rot)
        else:
            fx = FLOOR_X_L if side == 'L' else FLOOR_X_R
            out['db-' + name] = (fx, FLOOR_Y - bounce(t), 0.0)
    out['body'] = s
    out['eyes'] = eyes(t)
    out['shadow'] = (1 + (1 - s) * .5, .5 + (1 - s) * .22)
    out['sweat'] = sweat(t)
    return out


def sample_times():
    ts = {round(i * .1, 3) for i in range(0, 101)}
    for a, b in ((4.1, 4.9), (4.95, 5.4), (5.9, 6.1), (7.65, 8.45), (8.85, 9.0)):
        k = round(a / .025)
        while k * .025 <= b + 1e-9:
            ts.add(round(k * .025, 3))
            k += 1
    return sorted(ts)


def f(v):
    s = f'{v:.3f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def keyframes():
    ts = sample_times()
    data = [outputs(t) for t in ts]
    blocks = []

    def block(name, fn):
        lines = [f'@keyframes cw-ex-{name} {{']
        for t, d in zip(ts, data):
            lines.append(f'  {f(t / DUR * 100)}% {{ {fn(d)} }}')
        lines.append('}')
        blocks.append('\n'.join(lines))

    block('body', lambda d: f'transform: scaleY({f(d["body"])});')
    block('eyes', lambda d: f'transform: translateY({f(d["eyes"][1])}px) scaleY({f(d["eyes"][0])});')
    block('shadow', lambda d: f'transform: scaleX({f(d["shadow"][0])}); opacity: {f(d["shadow"][1])};')
    for n in ('l', 'r'):
        block('arm-' + n, lambda d, n=n: 'transform: translateY({}px) rotate({}deg) scaleX({});'.format(
            f(d['arm-' + n][0]), f(d['arm-' + n][1]), f(d['arm-' + n][2])))
        block('claw-' + n, lambda d, n=n: 'transform: translate({}px, {}px) rotate({}deg);'.format(*map(f, d['claw-' + n])))
        block('db-' + n, lambda d, n=n: 'transform: translate({}px, {}px) rotate({}deg);'.format(*map(f, d['db-' + n])))
    block('sw-a', lambda d: f'opacity: {f(d["sweat"][0])};')
    block('sw-b', lambda d: f'opacity: {f(d["sweat"][1])};')
    blocks.append('@keyframes cw-sweat { 0% { opacity: 0; transform: translate(0, 0); } 20% { opacity: 1; } '
                  '100% { opacity: 0; transform: translate(var(--tx, 3px), 6px); } }')
    return '\n'.join(blocks)


def static_pose():
    """Reduced-motion composition: relaxed standing, weights on the floor beside the feet."""
    g, th = G0, TH_REST
    cl = grip('L', th, g, 1.0)
    cr = grip('R', th, g, 1.0)
    return {
        'arm-l': f'rotate({f(th)}deg)',
        'arm-r': f'rotate({f(-th)}deg)',
        'claw-l': f'translate({f(cl[0])}px, {f(cl[1])}px) rotate({f(th)}deg)',
        'claw-r': f'translate({f(cr[0])}px, {f(cr[1])}px) rotate({f(-th)}deg)',
        'db-l': f'translate({f(FLOOR_X_L)}px, {f(FLOOR_Y)}px)',
        'db-r': f'translate({f(FLOOR_X_R)}px, {f(FLOOR_Y)}px)',
    }


def css():
    sp = static_pose()
    return f'''/* Clawd exercise — one persistent dumbbell group per weight, OUTSIDE the arm groups.
   transform-box: view-box everywhere (initial CSS value for SVG elements), so px values are SVG user units and
   transform-origin is expressed in the same coordinates as the artwork:
     body / shadow : feet line (7.5, 15) / (7.5, 15.5)      -> squash with the feet planted
     arms          : shoulders (2, 10) and (13, 10)         -> rotate + stretch from the joint
     claws, weights: origin (0, 0) with translate() = grip point; the shapes are drawn around (0, 0),
                     so rotate() is the wrist joint (claw and bar rotate as ONE rigid unit)
     eyes          : (7.5, 9)
   Keyframes are generated by scripts/gen-mascot-exercise.py from a single kinematic model, with the lift / lower /
   bounce / breathing cubic-beziers baked into the samples, hence the linear playback timing.
   The whole loop is driven by one variable: --exercise-duration. */
.mascot-clawd[data-state='exercise'] {{ --exercise-duration: {f(DUR)}s; }}
.mascot-clawd[data-state='exercise'] :is(.cw-body, .cw-eyes, .cw-shadow, .cw-ex-arm, .cw-claw, .cw-db, .cw-sw) {{
  animation-duration: var(--exercise-duration);
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}}
.mascot-clawd .cw-ex-arm, .mascot-clawd .cw-claw, .mascot-clawd .cw-db {{ transform-origin: 0 0; }}
.mascot-clawd .cw-ex-arm-l {{ transform-origin: 2px 10px; transform: {sp['arm-l']}; }}
.mascot-clawd .cw-ex-arm-r {{ transform-origin: 13px 10px; transform: {sp['arm-r']}; }}
.mascot-clawd .cw-claw-l {{ transform: {sp['claw-l']}; }}
.mascot-clawd .cw-claw-r {{ transform: {sp['claw-r']}; }}
.mascot-clawd .cw-db-l {{ transform: {sp['db-l']}; }}
.mascot-clawd .cw-db-r {{ transform: {sp['db-r']}; }}
.mascot-clawd[data-state='exercise'] .cw-body {{ transform-origin: 7.5px 15px; animation-name: cw-ex-body; }}
.mascot-clawd[data-state='exercise'] .cw-eyes {{ transform-origin: 7.5px 9px; animation-name: cw-ex-eyes; }}
.mascot-clawd[data-state='exercise'] .cw-shadow {{ transform-origin: 7.5px 15.5px; animation-name: cw-ex-shadow; }}
.mascot-clawd[data-state='exercise'] .cw-ex-arm-l {{ animation-name: cw-ex-arm-l; }}
.mascot-clawd[data-state='exercise'] .cw-ex-arm-r {{ animation-name: cw-ex-arm-r; }}
.mascot-clawd[data-state='exercise'] .cw-claw-l {{ animation-name: cw-ex-claw-l; }}
.mascot-clawd[data-state='exercise'] .cw-claw-r {{ animation-name: cw-ex-claw-r; }}
.mascot-clawd[data-state='exercise'] .cw-db-l {{ animation-name: cw-ex-db-l; }}
.mascot-clawd[data-state='exercise'] .cw-db-r {{ animation-name: cw-ex-db-r; }}
.mascot-clawd[data-state='exercise'] .cw-sw-a {{ animation-name: cw-ex-sw-a; }}
.mascot-clawd[data-state='exercise'] .cw-sw-b {{ animation-name: cw-ex-sw-b; }}
.mascot-clawd[data-state='exercise'] .cw-sweat {{ opacity: 0; animation: cw-sweat 1s var(--sd, 0s) ease-out infinite; }}
.mascot-clawd .cw-sweat {{ opacity: 0; }}
/* reduced motion: relaxed standing pose, weights on the floor beside the feet, no sweat */
@media (prefers-reduced-motion: reduce) {{
  .mascot-clawd[data-state='exercise'] * {{ animation: none !important; }}
  .mascot-clawd[data-state='exercise'] .cw-sw {{ display: none; }}
}}
'''


# ---------------------------------------------------------------- self-check
def rect_poly(cx, cy, hw, hh, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for x, y in ((-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh))]


def overlap(p, q):
    for poly in (p, q):
        for i in range(4):
            ax, ay = poly[i]
            bx, by = poly[(i + 1) % 4]
            nx, ny = ay - by, bx - ax
            pa = [x * nx + y * ny for x, y in p]
            qa = [x * nx + y * ny for x, y in q]
            if max(pa) <= min(qa) + 1e-6 or max(qa) <= min(pa) + 1e-6:
                return 0.0
    return 1.0


def check():
    ts = [i * .01 for i in range(0, 1001)]
    bad, jumps, prev = [], [], None
    for t in ts:
        o = outputs(t)
        for n in ('l', 'r'):
            dx, dy, dr = o['db-' + n]
            cx, cy, cr = o['claw-' + n]
            held = (t < T_UP0) or (t >= T_GRAB)
            if held and (abs(dx - cx) + abs(dy - cy) > 1e-9 or abs(dr - cr) > 1e-9):
                bad.append((round(t, 2), n, 'held weight != claw'))
            if not held:                              # claws vs plates while the weight rests / bounces
                claw_p = rect_poly(cx, cy, CLAW_HALF, 1.1, cr)
                for sx in (-2.3, 2.3):
                    plate = rect_poly(dx + sx, dy, .5, PLATE_H / 2, 0)
                    if overlap(claw_p, plate):
                        bad.append((round(t, 2), n, 'claw through plate'))
                        break
            lowest = dy + PLATE_H / 2
            if lowest > GROUND + 1e-6:
                bad.append((round(t, 2), n, f'weight below floor {lowest:.2f}'))
        if prev:
            for k in o:
                a, b = prev[k], o[k]
                a = a if isinstance(a, tuple) else (a,)
                b = b if isinstance(b, tuple) else (b,)
                if k.startswith(('db', 'claw')) and max(abs(x - y) for x, y in zip(a[:2], b[:2])) > .45:
                    jumps.append((round(t, 2), k, [round(x - y, 2) for x, y in zip(b, a)]))
        prev = o
    o0, o1 = outputs(0.0), outputs(10.0)
    print('floor pose: theta=%.1f deg  reach=%.2f  arm stretch x%.2f' % (TH_F, G_F, (G_F + CLAW_HALF) / 2))
    print('loop seam   :', 'OK' if o0 == o1 else 'MISMATCH', {k: (o0[k], o1[k]) for k in o0 if o0[k] != o1[k]})
    print('collisions  :', len(bad), bad[:12])
    print('big jumps   :', len(jumps), jumps[:8])
    for t in (4.85, 5.0, 8.2, 8.34):
        o = outputs(t)
        print(f't={t}: db-l {tuple(round(x, 3) for x in o["db-l"])} claw-l {tuple(round(x, 3) for x in o["claw-l"])}')
    return not bad


def render():
    header = ('/* GENERATED by scripts/gen-mascot-exercise.py — do not edit by hand. */\n')
    return header + css() + '\n\n' + keyframes() + '\n'


def write():
    FILE.write_text(render())
    print('wrote', FILE)


if __name__ == '__main__':
    ok = check()
    if '--check' in sys.argv:
        fresh = FILE.exists() and FILE.read_text() == render()
        print('checked-in CSS:', 'up to date' if fresh else 'STALE — rerun without --check')
        ok = ok and fresh
    else:
        write()
    sys.exit(0 if ok else 1)
