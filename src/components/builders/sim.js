/* What the crew does.

   Three of them, a pile of bricks, and a wall with a corner missing. The
   one on the ground picks a brick off the pile and throws it up to the
   one on the middle platform, who catches it and throws it up to the one
   on the top platform, who catches it and throws it into its place in the
   wall. When the last gap is filled the wall is finished; they cheer, a
   shine runs over the brickwork, and then the wall comes apart and they
   start again.

   Everything is worked out rather than drawn to a script:

   - A throw is a projectile. It leaves the thrower's hands at the end of
     their swing and flies under constant gravity to the exact spot where
     the catcher's hands are waiting, or to the exact gap in the wall. The
     launch velocity is whatever that takes: pick how high the arc should
     peak above the higher end, and the speed and the flight time follow.
   - The brick tumbles end over end on the way, and the number of turns is
     chosen so that it arrives flat.
   - A brick is always where somebody's hands are. The hands move to the
     brick, the arms are worked out from the hands (see rig.js), and the
     brick moves with them, so nothing ever jumps from one place to
     another when it is picked up, caught or let go.
   - Nobody throws to somebody who is not ready, and nobody carries more
     than one brick, so the line fills up and drains like a chain of
     buckets.

   Nothing here touches the document: the simulation is plain objects and
   the drawing takes a 2D context, so the same code can be stepped by any
   clock. */

import { BRICK_H } from './scene.js';
import { FIG_W, drawFigure, inkFor } from './rig.js';

const G = 150;              /* rows per second per second */

const CHEER_FOR = 3.2;      /* seconds the finished wall is enjoyed */
const DISSOLVE_FOR = 1.2;

/* Where a brick is held, as an offset from the middle of the worker
   (right of it is the way they face) and from the top of their box. */
const CARRY = [3.0, 8.0];
const WIND = [-2.5, -1.5];
const RELEASE = [3.5, -1.5];
const SWING_CONTROL = [0.5, -5.5];
const CATCH = [3.5, 0.5];
const REACH_FOR = 0.24;      /* how long before a brick arrives the catcher's hands go up */

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const ease = (t) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
const easeIn = (t) => clamp01(t) ** 2;
const easeOut = (t) => 1 - (1 - clamp01(t)) ** 2;
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

const cxOf = (w) => w.x + FIG_W / 2;
const at = (w, f, off) => [cxOf(w) + f * off[0], w.y + off[1]];

/* Both hands under a brick, one a little either side of its middle. */
const cradle = (b, f) => [[b[0] + f * 1.2, b[1] + 0.8], [b[0] - f * 1.2, b[1] + 0.8]];

function hang(w, f, time) {
    const sway = Math.sin(time * 1.6 + w.phase) * 0.35;
    return [[cxOf(w) + f * 1.6, w.y + 11 + sway], [cxOf(w) - f * 0.6, w.y + 11 - sway]];
}

function makeWorker(id, kind, spot, phase) {
    return {
        id, kind, x: spot.x, y: spot.y, phase,
        dir: 1, fromDir: 1, toDir: 1,
        mode: 'idle', t: 0, brick: null,
        releaseHands: null, hop: 0, grasped: false,
        busyUntil: 0, pending: [],
    };
}

export function createSim(sc, dark) {
    const workers = [makeWorker('A', 'band', sc.spots.A, 0)];
    if (sc.spots.C) workers.push(makeWorker('C', 'cap', sc.spots.C, 2.1));
    workers.push(makeWorker('B', 'hat', sc.spots.B, 4.2));

    const st = {
        sc,
        dark,
        workers,
        byId: Object.fromEntries(workers.map((w) => [w.id, w])),
        bricks: [],
        parts: [],
        nextJob: 0,
        pileHiddenUntil: -10,
        phase: 'build',
        phaseT: 0,
        time: 0,
    };
    resetSlots(st);
    return st;
}

function resetSlots(st) {
    st.sc.slots.forEach((s) => {
        s.filled = false;
        s.filledAt = -10;
        s.gone = false;
        s.goneAt = 0;
    });
}

function reset(st) {
    resetSlots(st);
    st.workers.forEach((w) => {
        w.mode = 'idle'; w.t = 0; w.pending = []; w.busyUntil = 0; w.brick = null; w.dir = 1; w.hop = 0;
    });
    st.bricks = [];
    st.nextJob = 0;
    st.pileHiddenUntil = -10;
    st.phase = 'build';
    st.phaseT = 0;
}

/* The finished state, for somebody who has asked for no motion. */
export function finish(st) {
    st.sc.slots.forEach((s) => { s.filled = true; s.filledAt = -10; s.gone = false; });
    st.workers.forEach((w) => { w.mode = 'cheer'; w.t = 0.5; w.dir = 1; });
    st.phase = 'cheer';
    st.phaseT = 0;
}

function burst(st, x, y, colors, n, spread, lift) {
    for (let i = 0; i < n; i += 1) {
        st.parts.push({
            x,
            y,
            vx: (Math.random() - 0.5) * spread,
            vy: -Math.random() * lift,
            life: 0.25 + Math.random() * 0.3,
            c: colors[Math.floor(Math.random() * colors.length)],
        });
    }
}

const DUST = ['#cfc8bb', '#b9b2a5', '#e2dccf'];
const CRUMBS = ['#cb513c', '#b13d2b', '#9a3123', '#e4ded2'];

/* A projectile from `from` to `to` that peaks `clearance` rows above the
   higher of the two, under gravity G. Gives back the launch velocity and
   how long it flies. */
function launch(b, from, to, clearance) {
    const apex = Math.min(from[1], to[1]) - clearance;
    const up = Math.sqrt((2 * (from[1] - apex)) / G);
    const down = Math.sqrt((2 * (to[1] - apex)) / G);
    const T = up + down;
    b.sx = from[0];
    b.sy = from[1];
    b.vx = (to[0] - from[0]) / T;
    b.vy = -G * up;
    b.dur = T;
    b.age = 0;
    b.turns = 2 * Math.max(1, Math.round(T * 2));       /* an even number of quarter turns */
    b.flying = true;
}

function positionOf(b, t) {
    return [b.sx + b.vx * t, b.sy + b.vy * t + 0.5 * G * t * t];
}

function startJob(st, a) {
    const slot = st.sc.slots[st.nextJob];
    st.nextJob += 1;

    const route = ['A'];
    if (st.byId.C) route.push('C');
    route.push('B');

    const brick = { slot, route, hop: 0, bm: slot.fly, w: slot.w, flying: false, age: 0 };
    st.bricks.push(brick);
    a.brick = brick;
    a.mode = 'pick';
    a.t = 0;
    a.fromDir = -1;
    a.dir = -1;
    a.grasped = false;
}

/* Whoever, or whatever, a worker throws their brick to next. */
function aimOf(st, w) {
    const b = w.brick;
    return b.hop < b.route.length - 1 ? st.byId[b.route[b.hop + 1]] : b.slot;
}

const isSlot = (target) => target.mode === undefined;

function directionTo(w, target) {
    const tx = isSlot(target) ? target.x + target.w / 2 : cxOf(target);
    return tx >= cxOf(w) ? 1 : -1;
}

function beginWindup(st, w) {
    w.toDir = directionTo(w, aimOf(st, w));
    w.fromDir = w.dir;
    w.mode = 'windup';
    w.t = 0;
}

/* Where a throw from `w` to `target` starts and ends, how high it should
   peak above the higher of the two, and — from those — how long it will
   fly. Worked out before the swing so that the catcher can be told when
   to expect it. */
function planThrow(w, target) {
    const f = directionTo(w, target);
    const from = at({ x: w.x, y: w.y }, f, RELEASE);
    let to;
    let clearance;
    let facing = 0;

    if (isSlot(target)) {
        to = [target.x + target.w / 2, target.y + BRICK_H / 2];
        clearance = 2.5;
    } else {
        facing = cxOf(w) >= cxOf(target) ? 1 : -1;            /* the catcher faces the thrower */
        to = at(target, facing, CATCH);
        clearance = 3.5 + Math.abs(to[0] - from[0]) * 0.1;
    }
    const apex = Math.min(from[1], to[1]) - clearance;
    const T = Math.sqrt((2 * (from[1] - apex)) / G) + Math.sqrt((2 * (to[1] - apex)) / G);
    return { f, from, to, clearance, facing, T };
}

/* The swing is over: the brick leaves the hands. */
function release(st, w) {
    const b = w.brick;
    const target = aimOf(st, w);
    const plan = planThrow(w, target);

    launch(b, plan.from, plan.to, plan.clearance);
    b.target = target;
    w.releaseHands = cradle(plan.from, plan.f);
    w.brick = null;
    w.mode = 'follow';
    w.t = 0;
}

function startReach(w) {
    w.mode = 'reach';
    w.t = 0;
    w.dir = w.pending.shift().facing;
}

function stepWorker(st, w, dt) {
    w.t += dt;

    switch (w.mode) {
        case 'idle':
            if (w.pending.length && st.time >= w.pending[0].at) {
                startReach(w);
                break;
            }
            if (
                w.id === 'A'
                && st.phase === 'build'
                && st.nextJob < st.sc.slots.length
                && st.bricks.length < st.workers.length + 1
            ) {
                startJob(st, w);
            }
            break;

        case 'pick':
            if (w.t >= 0.22 && !w.grasped) {
                w.grasped = true;
                st.pileHiddenUntil = st.time + 0.55;
            }
            if (w.t >= 0.52) beginWindup(st, w);
            break;

        case 'absorb':
            if (w.t >= 0.14) beginWindup(st, w);
            break;

        case 'windup':
            w.dir = w.t < 0.09 ? w.fromDir : w.toDir;
            if (w.t >= 0.18) { w.dir = w.toDir; w.mode = 'wait'; w.t = 0; }
            break;

        case 'wait': {
            /* Hands are never free until the brick has gone, so whoever is
               next in line is told not to expect another until then. */
            w.busyUntil = Math.max(w.busyUntil, st.time + 0.4);
            const target = aimOf(st, w);
            if (isSlot(target)) {
                w.mode = 'swing';
                w.t = 0;
                break;
            }
            /* A catcher can take this brick if their hands will be free,
               and raised, by the time it arrives. */
            const plan = planThrow(w, target);
            const arrives = st.time + 0.1 + plan.T;
            if (target.busyUntil <= arrives - REACH_FOR - 0.02) {
                target.busyUntil = arrives + 0.6;
                target.pending.push({ at: arrives - REACH_FOR, facing: plan.facing });
                w.mode = 'swing';
                w.t = 0;
            }
            break;
        }

        case 'swing':
            if (w.t >= 0.1) release(st, w);
            break;

        case 'follow':
            if (w.t >= 0.16) { w.mode = 'idle'; w.t = 0; }
            break;

        default:
            break;
    }
}

function stepBrick(st, b, dt) {
    if (!b.flying) return false;
    b.age += dt;
    if (b.age < b.dur) return false;

    b.flying = false;
    const target = b.target;
    if (!isSlot(target)) {
        /* Into a pair of hands, which are exactly there. */
        b.hop += 1;
        target.brick = b;
        target.mode = 'absorb';
        target.t = 0;
        return false;
    }

    /* Into the wall. */
    target.filled = true;
    target.filledAt = st.time;
    burst(st, target.x + target.w / 2, target.y + 0.5, DUST, 4, 12, 4);
    return true;
}

export function stepSim(st, dt) {
    st.time += dt;
    st.phaseT += dt;

    st.workers.forEach((w) => stepWorker(st, w, dt));
    st.bricks = st.bricks.filter((b) => !stepBrick(st, b, dt));

    if (st.phase === 'build') {
        const done = st.nextJob >= st.sc.slots.length
            && st.sc.slots.every((s) => s.filled)
            && st.bricks.length === 0;
        if (done) {
            st.phase = 'cheer';
            st.phaseT = 0;
            st.workers.forEach((w) => { w.mode = 'cheer'; w.t = 0; w.dir = 1; });
        }
    } else if (st.phase === 'cheer') {
        if (st.phaseT >= CHEER_FOR) {
            st.phase = 'dissolve';
            st.phaseT = 0;
            st.sc.slots.forEach((s) => { s.goneAt = Math.random() * (DISSOLVE_FOR - 0.25); s.gone = false; });
            st.workers.forEach((w) => { w.mode = 'idle'; w.t = 0; w.hop = 0; });
        }
    } else if (st.phase === 'dissolve') {
        st.sc.slots.forEach((s) => {
            if (!s.gone && st.phaseT >= s.goneAt) {
                s.gone = true;
                burst(st, s.x + s.w / 2, s.y + 1, CRUMBS, 3, 14, 3);
            }
        });
        if (st.phaseT >= DISSOLVE_FOR) reset(st);
    }

    st.parts = st.parts.filter((p) => {
        p.life -= dt;
        p.vy += G * 0.6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0 && p.y < st.sc.groundY;
    });
}

/* ---- how everybody looks ---- */

/* Where a worker's body and hands are, and the brick they hold, if any,
   for the mode they are in. */
function poseOf(st, w) {
    const f = w.dir;
    const t = w.t;
    const pose = { dir: f, lean: 0, crouch: 0, hands: hang(w, f, st.time), brickAt: null, hop: 0 };

    switch (w.mode) {
        case 'pick': {
            const pile = st.sc.pickable;
            const p = [pile.x + 3.5, pile.y + BRICK_H / 2];
            if (t < 0.22) {
                const k = ease(t / 0.22);
                pose.crouch = k;
                pose.lean = 2 * k;
                const target = cradle(p, f);
                pose.hands = [lerp2(pose.hands[0], target[0], k), lerp2(pose.hands[1], target[1], k)];
            } else {
                const k = ease((t - 0.22) / 0.3);
                pose.crouch = 1 - k;
                pose.lean = 2 * (1 - k);
                pose.brickAt = lerp2(p, at(w, f, CARRY), k);
                pose.hands = cradle(pose.brickAt, f);
            }
            break;
        }
        case 'reach': {
            const k = easeOut(t / 0.22);
            const target = cradle(at(w, f, CATCH), f);
            pose.hands = [lerp2(pose.hands[0], target[0], k), lerp2(pose.hands[1], target[1], k)];
            break;
        }
        case 'absorb': {
            const k = ease(t / 0.14);
            pose.brickAt = lerp2(at(w, f, CATCH), at(w, f, CARRY), k);
            pose.hands = cradle(pose.brickAt, f);
            break;
        }
        case 'windup': {
            const k = easeOut(t / 0.18);
            pose.brickAt = lerp2(at(w, w.fromDir, CARRY), at(w, w.toDir, WIND), k);
            pose.lean = -k;
            pose.hands = cradle(pose.brickAt, f);
            break;
        }
        case 'wait':
            pose.brickAt = at(w, f, WIND);
            pose.lean = -1;
            pose.hands = cradle(pose.brickAt, f);
            break;
        case 'swing': {
            const k = easeIn(t / 0.1);
            const a = at(w, f, WIND);
            const c = at(w, f, SWING_CONTROL);
            const r = at(w, f, RELEASE);
            pose.brickAt = [
                (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * c[0] + k * k * r[0],
                (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * c[1] + k * k * r[1],
            ];
            pose.lean = lerp(-1, 1, k);
            pose.hands = cradle(pose.brickAt, f);
            break;
        }
        case 'follow': {
            const u = t / 0.16;
            const out = [at(w, f, [4.5, 3.5]), at(w, f, [3, 4.5])];
            const rest = hang(w, f, st.time);
            const first = w.releaseHands;
            if (u < 0.4) {
                const k = ease(u / 0.4);
                pose.hands = [lerp2(first[0], out[0], k), lerp2(first[1], out[1], k)];
            } else {
                const k = ease((u - 0.4) / 0.6);
                pose.hands = [lerp2(out[0], rest[0], k), lerp2(out[1], rest[1], k)];
            }
            pose.lean = lerp(1, 0, ease(u));
            break;
        }
        case 'cheer': {
            const s = Math.sin(t * 7 + w.phase);
            pose.hands = [
                [cxOf(w) + f * 2.4, w.y - 3 + (s > 0 ? 0 : 1.2)],
                [cxOf(w) - f * 2.4, w.y - 3 + (s > 0 ? 1.2 : 0)],
            ];
            pose.hop = Math.sin(t * 7 + w.phase) > 0.8 ? 1 : 0;
            break;
        }
        default:
            break;
    }
    return pose;
}

function drawFlat(ctx, fly, cx, cy) {
    ctx.drawImage(fly.flat, Math.round(cx - fly.flat.width / 2), Math.round(cy - BRICK_H / 2));
}

export function drawSim(ctx, st) {
    const { sc } = st;
    const pal = inkFor(st.dark);

    ctx.clearRect(0, 0, sc.cols, sc.rows);
    ctx.drawImage(sc.layer, 0, 0);

    /* The bricks that have landed. */
    sc.slots.forEach((s) => {
        if (!s.filled || s.gone) return;
        ctx.drawImage(s.canvas, s.x, s.y - 1);
        if (st.time - s.filledAt < 0.1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.fillRect(s.x, s.y, s.w, BRICK_H);
        }
    });

    /* The brick on top of the near stack: the one about to be picked up,
       gone while it is in somebody's hands, and a new one drops on a
       moment after. */
    const slots = sc.slots;
    const feeder = st.byId.A;
    let shown = null;
    if (feeder.mode === 'pick') {
        shown = feeder.t < 0.22 ? feeder.brick.slot : null;
    } else if (st.time >= st.pileHiddenUntil && st.nextJob < slots.length) {
        shown = slots[st.nextJob];
    }
    if (shown) {
        const since = st.time - st.pileHiddenUntil;
        const drop = since >= 0 && since < 0.12 ? Math.round(3 * (1 - since / 0.12)) : 0;
        ctx.drawImage(shown.fly.flat, sc.pickable.x + (7 - shown.w) / 2, sc.pickable.y - drop);
    }

    /* The shine that runs over a finished wall. */
    if (st.phase === 'cheer' && st.phaseT > 0.35 && st.phaseT < 1.5) {
        const k = (st.phaseT - 0.35) / 1.15;
        const bandX = sc.x0 - 24 + k * (sc.cols - sc.x0 + 60);
        ctx.save();
        ctx.beginPath();
        ctx.rect(sc.x0, 0, sc.cols - sc.x0, sc.groundY);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let y = 0; y < sc.groundY; y += 1) ctx.fillRect(Math.round(bandX - y * 0.7), y, 5, 1);
        ctx.restore();
    }

    /* The crew, and whatever each is holding. */
    st.workers.forEach((w) => {
        const pose = poseOf(st, w);
        const held = pose.brickAt && w.brick;
        drawFigure(
            ctx,
            {
                x: Math.round(w.x), y: Math.round(w.y) - pose.hop, dir: pose.dir, lean: pose.lean,
                crouch: pose.crouch, hands: pose.hands, kind: w.kind,
            },
            pal,
            st.time,
            held ? () => drawFlat(ctx, w.brick.bm, pose.brickAt[0], pose.brickAt[1]) : null,
        );
    });

    /* Bricks in the air, tumbling. */
    st.bricks.forEach((b) => {
        if (!b.flying) return;
        const [cx, cy] = positionOf(b, Math.min(b.age, b.dur));
        const upright = Math.floor((b.age / b.dur) * b.turns) % 2 === 1;
        if (upright) {
            ctx.drawImage(b.bm.on, Math.round(cx - BRICK_H / 2), Math.round(cy - b.bm.flat.width / 2));
        } else {
            drawFlat(ctx, b.bm, cx, cy);
        }
    });

    for (let i = 0; i < st.parts.length; i += 1) {
        const p = st.parts[i];
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
}

