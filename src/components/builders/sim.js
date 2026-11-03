/* What the crew does, and how it is drawn.

   Three of them and a pile of bricks, and a wall with gaps in it. The one
   on the ground takes a brick off the pile and throws it up to the one on
   the middle platform, who throws it up to the one on the top platform,
   who throws it into the wall, where it lands in its gap, flashes and
   sticks. Whoever is nearest a gap's height is the one who throws it
   into place: the low gaps are filled straight from the ground, the high
   ones go up the line. Nobody carries more than one brick and nobody
   throws to somebody who is not ready, so the line fills up and runs
   like a chain of buckets.

   When the last gap is filled the wall is finished: a flag goes up, the
   three of them cheer, a shine runs across the bricks — and then the
   wall comes apart brick by brick and they start again.

   Nothing here touches the document: the simulation is plain objects and
   the drawing takes a 2D context, so the same code can be stepped by any
   clock. */

import { COLORS, FRAMES, SPRITE_H, SPRITE_W } from './art.js';

const GRAVITY = 105;      /* rows per second per second */

const DUST = ['#d9cfbc', '#c2b79f', '#e8e0d0'];
const CRUMBS = ['#b8382c', '#e0654c', '#7a2119', '#d9cfbc'];

const CHEER_FOR = 4.2;    /* seconds the finished wall is enjoyed */
const DISSOLVE_FOR = 1.3;

function worker(id, spot, role) {
    return {
        id, role, x: spot.x, y: spot.y, home: spot,
        dir: 1, mode: 'idle', t: Math.random() * 2, reserved: false, brick: null,
    };
}

export function createSim(sc) {
    const workers = [worker('A', sc.spots.A, 'A'), worker('B', sc.spots.B, 'B')];
    if (sc.spots.C) workers.push(worker('C', sc.spots.C, 'C'));

    sc.slots.forEach((s) => {
        s.filled = false;
        s.filledAt = 0;
        s.goneAt = 0;
    });

    return {
        sc,
        workers,
        byId: Object.fromEntries(workers.map((w) => [w.id, w])),
        bricks: [],
        parts: [],
        sparks: [],
        nextJob: 0,
        phase: 'build',
        phaseT: 0,
        time: 0,
    };
}

function reset(st) {
    st.sc.slots.forEach((s) => { s.filled = false; s.filledAt = 0; s.goneAt = 0; });
    st.workers.forEach((w) => {
        w.mode = 'idle'; w.t = Math.random() * 2; w.reserved = false; w.brick = null; w.dir = 1;
    });
    st.bricks = [];
    st.nextJob = 0;
    st.phase = 'build';
    st.phaseT = 0;
}

/* The finished state, for somebody who has asked for no motion. */
export function finish(st) {
    st.sc.slots.forEach((s) => { s.filled = true; s.filledAt = -10; });
    st.workers.forEach((w, i) => { w.mode = 'cheer'; w.t = i * 0.3; w.dir = 1; });
    st.phase = 'cheer';
    st.phaseT = 3;
}

function burst(st, x, y, colors, n, spread, lift) {
    for (let i = 0; i < n; i += 1) {
        st.parts.push({
            x,
            y,
            vx: (Math.random() - 0.5) * spread,
            vy: -Math.random() * lift,
            life: 0.3 + Math.random() * 0.35,
            c: colors[Math.floor(Math.random() * colors.length)],
        });
    }
}

/* Where somebody's hands are when a brick is in them. */
function holdPoint(w, kind) {
    const cx = w.x + (SPRITE_W - 1) / 2;
    switch (kind) {
        case 'pick': return [cx + 4 * w.dir, w.y + 11];
        case 'windup': return [cx + w.dir, w.y - 2];
        case 'reach': return [cx + w.dir, w.y + 0];
        default: return [cx + 4 * w.dir, w.y + 8];      /* carry */
    }
}

function heldAt(w) {
    switch (w.mode) {
        case 'pick': return holdPoint(w, 'pick');
        case 'windup':
        case 'wait': return holdPoint(w, 'windup');
        default: return holdPoint(w, 'carry');
    }
}

/* Throw a brick from `from` to `to`, to land when it has flown for `time`. */
function launch(b, from, to, time) {
    b.sx = from[0];
    b.sy = from[1];
    b.tx = to[0];
    b.ty = to[1];
    b.vx = (to[0] - from[0]) / time;
    b.vy = (to[1] - from[1] - 0.5 * GRAVITY * time * time) / time;
    b.fly = 0;
    b.dur = time;
    b.flying = true;
}

function flightTime(from, to) {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    return Math.min(0.85, 0.42 + Math.hypot(dx * 0.4, Math.max(0, -dy)) / 110);
}

function startJob(st, a) {
    const slot = st.sc.slots[st.nextJob];
    st.nextJob += 1;

    const route = ['A'];
    if (slot.thrower === 'C') route.push('C');
    if (slot.thrower === 'B') {
        if (st.byId.C) route.push('C');
        route.push('B');
    }

    const brick = {
        slot, route, hop: 0, canvas: slot.canvas, w: slot.canvas.width - 1, h: slot.canvas.height - 1,
        cx: 0, cy: 0, flying: false, attached: false,
    };
    st.bricks.push(brick);
    a.brick = brick;
    a.mode = 'pick';
    a.t = 0;
    a.dir = -1;
}

/* The one a worker throws to next: the next worker down the line, or the
   wall. */
function aimOf(st, w) {
    const b = w.brick;
    if (b.hop < b.route.length - 1) return st.byId[b.route[b.hop + 1]];
    return b.slot;
}

function tryThrow(st, w) {
    const b = w.brick;
    const target = aimOf(st, w);
    const isSlot = !target.mode;

    if (!isSlot && (target.mode !== 'idle' || target.reserved)) return false;

    const to = isSlot
        ? [target.x + target.w / 2, target.y + BRICK_HALF_H]
        : [target.x + (SPRITE_W - 1) / 2, target.y + 1];

    w.dir = to[0] >= w.x + (SPRITE_W - 1) / 2 ? 1 : -1;
    const from = [w.x + (SPRITE_W - 1) / 2 + 5 * w.dir, w.y + 1];
    launch(b, from, to, flightTime(from, to));
    b.target = target;
    w.brick = null;
    w.mode = 'throw';
    w.t = 0;

    if (!isSlot) {
        target.reserved = true;
        target.mode = 'reach';
        target.t = 0;
        target.dir = from[0] < target.x + (SPRITE_W - 1) / 2 ? -1 : 1;
    }
    return true;
}

const BRICK_HALF_H = 2;

function stepWorker(st, w, dt) {
    w.t += dt;

    switch (w.mode) {
        case 'idle':
            if (
                w.role === 'A'
                && st.phase === 'build'
                && st.nextJob < st.sc.slots.length
                && st.bricks.length < st.workers.length + 1
            ) {
                startJob(st, w);
            }
            break;

        case 'pick':
            if (w.t >= 0.26) {
                w.mode = 'turn';
                w.t = 0;
                w.dir = 1;
            }
            break;

        case 'turn':
            if (w.t >= 0.08) { w.mode = 'windup'; w.t = 0; }
            break;

        case 'windup':
            if (w.t >= 0.1) { w.mode = 'wait'; w.t = 0; }
            break;

        case 'wait':
            tryThrow(st, w);
            break;

        case 'hold':
            if (w.t >= 0.12) {
                const target = aimOf(st, w);
                const cx = w.x + (SPRITE_W - 1) / 2;
                const tx = target.mode === undefined ? target.x + target.w / 2 : target.x + (SPRITE_W - 1) / 2;
                w.dir = tx >= cx ? 1 : -1;
                w.mode = 'windup';
                w.t = 0;
            }
            break;

        case 'throw':
            if (w.t >= 0.16) { w.mode = 'idle'; w.t = 0; }
            break;

        default:
            break;
    }
}

function stepBrick(st, b, dt) {
    if (!b.flying) return false;
    b.fly += dt;
    const t = Math.min(b.fly, b.dur);
    b.cx = b.sx + b.vx * t;
    b.cy = b.sy + b.vy * t + 0.5 * GRAVITY * t * t;
    if (b.fly < b.dur) return false;

    b.flying = false;
    const target = b.target;
    if (target.mode !== undefined) {
        /* Into a pair of hands. */
        b.hop += 1;
        target.brick = b;
        target.mode = 'hold';
        target.t = 0;
        target.reserved = false;
        return false;
    }

    /* Into the wall. */
    target.filled = true;
    target.filledAt = st.time;
    burst(st, target.x + target.w / 2, target.y + 1, DUST, 5, 16, 5);
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
            st.workers.forEach((w, i) => { w.mode = 'cheer'; w.t = i * 0.3; w.dir = 1; });
        }
    } else if (st.phase === 'cheer') {
        if (st.phaseT >= CHEER_FOR) {
            st.phase = 'dissolve';
            st.phaseT = 0;
            st.sc.slots.forEach((s) => { s.goneAt = Math.random() * (DISSOLVE_FOR - 0.2); s.gone = false; });
            st.workers.forEach((w) => { w.mode = 'idle'; w.t = Math.random() * 2; });
        }
    } else if (st.phase === 'dissolve') {
        st.sc.slots.forEach((s) => {
            if (!s.gone && st.phaseT >= s.goneAt) {
                s.gone = true;
                burst(st, s.x + s.w / 2, s.y + 2, CRUMBS, 4, 18, 3);
            }
        });
        if (st.phaseT >= DISSOLVE_FOR) reset(st);
    }

    st.parts = st.parts.filter((p) => {
        p.life -= dt;
        p.vy += GRAVITY * 0.6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0 && p.y < st.sc.groundY;
    });
}

function poseOf(w, phase) {
    const flip = (rate, offset = 0) => Math.floor((w.t + offset) * rate) % 2;
    switch (w.mode) {
        case 'pick': return 'pick';
        case 'turn':
        case 'hold': return 'carry';
        case 'windup':
        case 'wait': return 'windup';
        case 'throw': return 'throw';
        case 'reach': return 'reach';
        case 'cheer': return flip(6) ? 'cheerB' : 'cheerA';
        default: return flip(2, w.id === 'A' ? 0 : w.id === 'B' ? 0.4 : 0.8) ? 'stand2' : 'stand';
    }
}

function drawWorker(ctx, w, phase) {
    const rows = FRAMES[w.id][poseOf(w, phase)];
    const colors = COLORS[w.id];
    const px = Math.round(w.x);
    const py = Math.round(w.y);
    for (let j = 0; j < rows.length; j += 1) {
        const row = rows[j];
        for (let i = 0; i < SPRITE_W; i += 1) {
            const c = row[i];
            if (c === '.') continue;
            ctx.fillStyle = colors[c];
            ctx.fillRect(px + (w.dir > 0 ? i : SPRITE_W - 1 - i), py + j, 1, 1);
        }
    }
}

function drawBrickAt(ctx, b, cx, cy) {
    ctx.drawImage(b.canvas, Math.round(cx - b.w / 2), Math.round(cy - b.h / 2) - 1);
}

function drawSparkle(ctx, x, y, big) {
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(x, y, 1, 1);
    if (big) {
        ctx.fillRect(x - 1, y, 1, 1);
        ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1);
        ctx.fillRect(x, y + 1, 1, 1);
    }
}

function drawFlag(ctx, sc, t) {
    const rise = Math.min(1, t / 0.4);
    const h = Math.round(12 * rise);
    const { x, y } = sc.flag;
    ctx.fillStyle = '#4a3a2e';
    ctx.fillRect(x, y - h, 1, h);
    if (rise < 1) return;
    const wave = Math.floor(t * 3) % 2;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(x + 1, y - 12, 5, 4);
    ctx.fillStyle = '#a8222e';
    ctx.fillRect(x + 1, y - 9, 5, 1);
    ctx.fillStyle = '#e63946';
    ctx.fillRect(x + 6, y - 11 + wave, 1, 2);
}

export function drawSim(ctx, st) {
    const { sc } = st;
    ctx.clearRect(0, 0, sc.cols, sc.rows);
    ctx.drawImage(sc.layer, 0, 0);

    /* The bricks that have landed. */
    sc.slots.forEach((s) => {
        if (!s.filled || s.gone) return;
        ctx.drawImage(s.canvas, s.x, s.y - 1);
        const age = st.time - s.filledAt;
        if (age < 0.14) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.fillRect(s.x, s.y, s.w, 4);
        }
    });

    /* The shine that runs over a finished wall. */
    if (st.phase === 'cheer' && st.phaseT > 0.5 && st.phaseT < 1.7) {
        const k = (st.phaseT - 0.5) / 1.2;
        const bandX = sc.x0 - 20 + k * (sc.cols - sc.x0 + 50);
        ctx.save();
        ctx.beginPath();
        ctx.rect(sc.x0 - 2, 0, sc.cols - sc.x0 + 2, sc.groundY);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let y = 0; y < sc.groundY; y += 1) {
            ctx.fillRect(Math.round(bandX - y * 0.6), y, 7, 1);
        }
        ctx.restore();
    }

    if (st.phase === 'cheer' && st.phaseT > 0.25) drawFlag(ctx, sc, st.phaseT - 0.25);

    st.workers.forEach((w) => drawWorker(ctx, w, st.phase));

    /* Bricks in hands, and bricks in the air. */
    st.bricks.forEach((b) => {
        if (b.flying) {
            drawBrickAt(ctx, b, b.cx, b.cy);
            return;
        }
        const holder = st.workers.find((w) => w.brick === b);
        if (!holder) return;
        if (holder.mode === 'pick' && holder.t < 0.12) return;
        const [hx, hy] = heldAt(holder);
        drawBrickAt(ctx, b, hx, hy);
    });

    if (st.phase === 'cheer') {
        const tw = Math.floor(st.phaseT * 5);
        st.workers.forEach((w, i) => {
            drawSparkle(ctx, Math.round(w.x) - 3 + i, Math.round(w.y) + 2 + i * 2, (tw + i) % 2);
            drawSparkle(ctx, Math.round(w.x) + 13 - i, Math.round(w.y) + 5, (tw + i + 1) % 2);
        });
    }

    for (let i = 0; i < st.parts.length; i += 1) {
        const p = st.parts[i];
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
}
