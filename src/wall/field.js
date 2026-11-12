import { STRIDE } from './renderer.js';

/* ===================================================================
   THE BRICKS
   -------------------------------------------------------------------
   The wall as numbers: where each brick is, how far round it has
   turned, how fast it is turning and where it has been told to stop.
   Nothing here draws and nothing here knows about the document, so the
   same wall can be stepped by any clock.

   It is laid in stretcher bond — every other course begins and ends
   with a half brick — to the proportions of the Indian modular brick,
   190 × 90 × 90 mm on a 200 × 100 module. That brick is square in
   section, and the section being square is the whole mechanism: turned
   a quarter about its long axis it presents a face the same size as
   the last one.

   One unit is one course. A whole brick is two units long.

   A brick turns on a spring rather than along a curve. It is told an
   angle, and gets there the way something with weight does: it
   overshoots a little, comes back, and settles. That costs one line of
   arithmetic a brick and buys everything the pointer does to the wall,
   because a spring that is pushed, kicked or interrupted half way
   simply carries on from wherever it is.
   =================================================================== */

export const PAPER = 0;
export const INK = Math.PI / 2;
export const GLAZE = Math.PI;

const STIFF = 150;
const DAMP = 13.5;
const PRESS = 1.2;          /* radians a brick under the pointer is pushed */
const COOL = 2.4;           /* how fast the pointer's push lets go, per second */
const PROUD = 0.32;         /* how far a brick stands out while it is off square */

/* What a glazed face is before it has been fired a colour, and again
   once it has turned away: the ink's own black, so a joint never shows
   the edge of a colour the wall is no longer showing. */
const UNFIRED = 0.0065;

function seeded(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* A tone, nought to one, as the angle that shows that much ink. Not a
   straight line: the ink face is seen at the sine of the angle and the
   paper at its cosine, so the half-way grey is at forty-five degrees
   and the rest follows from the tangent. */
export function tone(ink) {
    const t = ink < 0 ? 0 : ink > 1 ? 1 : ink;
    return Math.atan2(t, 1 - t);
}

export function createField(cols, rows) {
    const width = cols * 2;
    const bricks = [];
    for (let r = 0; r < rows; r += 1) {
        if (r % 2 === 0) {
            for (let c = 0; c < cols; c += 1) bricks.push([r, c * 2, 2]);
        } else {
            bricks.push([r, 0, 1]);
            for (let c = 0; c < cols - 1; c += 1) bricks.push([r, 1 + c * 2, 2]);
            bricks.push([r, width - 1, 1]);
        }
    }

    const n = bricks.length;
    const f = {
        cols, rows, width, n,
        row: new Uint16Array(n),
        from: new Uint16Array(n),       /* first unit the brick covers */
        span: new Uint8Array(n),        /* and how many: 2, or 1 for a half */
        x: new Float32Array(n),
        y: new Float32Array(n),
        angle: new Float32Array(n),
        speed: new Float32Array(n),
        goal: new Float32Array(n),
        next: new Float32Array(n),      /* the goal it has been promised */
        nextAt: new Float32Array(n),    /* and when: 0 for none pending */
        nextGlaze: new Float32Array(n * 3),
        heat: new Float32Array(n),      /* the pointer's push, cooling */
        kick: new Float32Array(n),
        kickAt: new Float32Array(n),
        scale: new Float32Array(n).fill(1),
        drop: new Float32Array(n),      /* extra distance out, while being laid */
        jitter: new Float32Array(n),
        fired: new Uint8Array(n),
        data: new Float32Array(n * STRIDE),
    };

    const rnd = seeded(190909);
    bricks.forEach(([r, u, len], i) => {
        f.row[i] = r;
        f.from[i] = u;
        f.span[i] = len;
        f.x[i] = u + len / 2 - width / 2;
        f.y[i] = r + 0.5 - rows / 2;
        f.jitter[i] = rnd();
        const o = i * STRIDE;
        f.data[o] = f.x[i];
        f.data[o + 1] = f.y[i];
        f.data[o + 2] = (rnd() - 0.5) * 0.06;          /* nobody lays a wall dead flat */
        f.data[o + 6] = 0.972 + rnd() * 0.028;         /* nor fires two bricks alike */
        f.data[o + 7] = len / 2;
        f.data[o + 8] = f.data[o + 9] = f.data[o + 10] = UNFIRED;
        f.data[o + 11] = rnd();
    });
    return f;
}

/* Promise every brick a new angle, each a moment after its neighbour:
   `delay` is seconds per unit of distance from the nearest of `origins`,
   so a picture arrives as a wave from wherever it was started.
   `angles` and `glazes` are read now, so the caller may reuse them. */
export function aim(f, angles, glazes, origins, now, delay) {
    for (let i = 0; i < f.n; i += 1) {
        let d = 0;
        if (delay > 0) {
            d = Infinity;
            for (let k = 0; k < origins.length; k += 1) {
                d = Math.min(d, Math.hypot(f.x[i] - origins[k][0], f.y[i] - origins[k][1]));
            }
        }
        f.next[i] = angles[i];
        f.nextAt[i] = Math.max(1e-6, now + d * delay + f.jitter[i] * 0.12 * (delay > 0 ? 1 : 0));
        if (glazes) {
            f.nextGlaze[i * 3] = glazes[i * 3];
            f.nextGlaze[i * 3 + 1] = glazes[i * 3 + 1];
            f.nextGlaze[i * 3 + 2] = glazes[i * 3 + 2];
        }
    }
}

/* Put every brick where it is going, at rest, with nothing pending:
   the still frame, and what a resize lands on. */
export function settle(f) {
    for (let i = 0; i < f.n; i += 1) {
        if (f.nextAt[i] > 0) take(f, i);
        f.angle[i] = f.goal[i];
        f.speed[i] = 0;
        f.heat[i] = 0;
        f.kickAt[i] = 0;
        f.scale[i] = 1;
        f.drop[i] = 0;
    }
}

function take(f, i) {
    f.goal[i] = f.next[i];
    f.nextAt[i] = 0;
    if (f.next[i] > INK + 0.2) {
        const o = i * STRIDE + 8;
        f.data[o] = f.nextGlaze[i * 3];
        f.data[o + 1] = f.nextGlaze[i * 3 + 1];
        f.data[o + 2] = f.nextGlaze[i * 3 + 2];
        f.fired[i] = 1;
    }
}

/* The pointer, resting on the wall at (px, py): the bricks under it are
   pushed towards their other face, hardest in the middle. */
export function press(f, px, py, now) {
    const r0 = Math.floor(py + f.rows / 2);
    for (let i = 0; i < f.n; i += 1) {
        if (Math.abs(f.row[i] - r0) > 4) continue;
        const dx = f.x[i] - px, dy = (f.y[i] - py) * 1.5;
        const d2 = dx * dx + dy * dy;
        if (d2 > 30) continue;
        const h = Math.exp(-d2 / 5.5);
        if (h > f.heat[i]) f.heat[i] = h;
    }
}

/* A click at (px, py): every brick is kicked as the ring passes it, and
   rings down on its own spring. */
export function ripple(f, px, py, now) {
    for (let i = 0; i < f.n; i += 1) {
        const d = Math.hypot(f.x[i] - px, f.y[i] - py);
        f.kickAt[i] = now + d * 0.032;
        f.kick[i] = 11 / (1 + d * 0.09);
    }
}

export function step(f, dt, now) {
    const cool = Math.exp(-dt * COOL);
    const parts = dt > 0.02 ? 2 : 1;
    const h = dt / parts;
    let moving = false;

    for (let i = 0; i < f.n; i += 1) {
        if (f.nextAt[i] > 0 && now >= f.nextAt[i]) take(f, i);
        if (f.kickAt[i] > 0 && now >= f.kickAt[i]) {
            f.speed[i] += f.goal[i] > 0.7 ? -f.kick[i] : f.kick[i];
            f.kickAt[i] = 0;
        }
        f.heat[i] *= cool;

        /* Pushed towards whichever face it is not showing. */
        const want = f.goal[i] + f.heat[i] * (f.goal[i] > 0.7 ? -PRESS : PRESS);
        let a = f.angle[i], v = f.speed[i];
        for (let k = 0; k < parts; k += 1) {
            v += (-STIFF * (a - want) - DAMP * v) * h;
            a += v * h;
        }
        f.angle[i] = a;
        f.speed[i] = v;
        if (f.fired[i] && f.goal[i] < INK + 0.2 && a < INK + 0.3) {
            f.fired[i] = 0;
            f.data[i * STRIDE + 8] = f.data[i * STRIDE + 9] = f.data[i * STRIDE + 10] = UNFIRED;
        }
        if (Math.abs(v) > 0.002 || Math.abs(a - want) > 0.0005 || f.nextAt[i] > 0 || f.kickAt[i] > 0) moving = true;

        const o = i * STRIDE;
        f.data[o + 3] = a;
        f.data[o + 4] = PROUD * Math.abs(Math.sin(2 * a)) + f.drop[i];
        f.data[o + 5] = f.scale[i];
    }
    return moving;
}
