/* The set the climber plays on, painted once into an off-screen bitmap
   and then simply copied under the person every frame.

   A brick wall seen from the side of a building site: it runs off the
   right edge of the picture and its left end is unfinished. Every other
   course stops half a brick short of the one below it, so the bricks
   stand out of the end in teeth, the way a bricklayer leaves a wall to be
   built on from. A few courses are a whole brick further back, the top
   course is only half laid, and a couple of bricks sit loose on it. A
   short stack of spare bricks waits on the grass.

   Everything is placed by a seeded generator, so the same wall comes
   back every time the panel opens, and everything is one cell — one
   "pixel" of the picture — at a time. */

import { SPRITE_H } from './art.js';

export const BRICK_W = 8;       /* the brick itself, in cells */
export const BRICK_H = 4;
export const PITCH_X = BRICK_W + 1;   /* brick plus a column of mortar */
export const PITCH_Y = BRICK_H + 1;   /* brick plus a row of mortar */
export const GROUND_H = 4;
const HEADROOM = SPRITE_H + 5;        /* room for a person to stand on top */

const BRICKS = [
    { base: '#b8382c', hi: '#e0654c', sh: '#7a2119', dark: '#962a20', lite: '#cf4f3b' },
    { base: '#c4442e', hi: '#e8704f', sh: '#82251a', dark: '#a03022', lite: '#d9593f' },
    { base: '#a93126', hi: '#d05642', sh: '#6e1c15', dark: '#8b2820', lite: '#c0463a' },
];

const GROUND = {
    grass: '#5aa63f', grassHi: '#85cf5e', grassLo: '#3d7d2c',
    dirt: '#8a5a38', dirtLo: '#6e4529', dirtHi: '#a87048', dirtDeep: '#59371f',
};

export const MORTAR = { light: '#d9cfbc', dark: '#4a3d38' };

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

function drawBrick(g, rnd, x, y, mortar, { loose = false } = {}) {
    /* The mortar round it: the row above and the column to the right. */
    if (mortar && !loose) {
        g.fillStyle = mortar;
        g.fillRect(x, y - 1, PITCH_X, PITCH_Y);
    }

    const c = BRICKS[Math.floor(rnd() * BRICKS.length)];
    g.fillStyle = c.base;
    g.fillRect(x, y, BRICK_W, BRICK_H);

    /* Lit from the upper left. */
    g.fillStyle = c.hi;
    g.fillRect(x, y, BRICK_W, 1);
    g.fillRect(x, y, 1, BRICK_H);
    g.fillStyle = c.sh;
    g.fillRect(x, y + BRICK_H - 1, BRICK_W, 1);
    g.fillRect(x + BRICK_W - 1, y + 1, 1, BRICK_H - 1);

    /* Grain. */
    const grains = 3 + Math.floor(rnd() * 4);
    for (let i = 0; i < grains; i += 1) {
        g.fillStyle = rnd() < 0.55 ? c.dark : c.lite;
        g.fillRect(x + 1 + Math.floor(rnd() * (BRICK_W - 2)), y + 1 + Math.floor(rnd() * (BRICK_H - 2)), 1, 1);
    }

    /* The odd cracked brick, and the odd chipped corner. */
    const roll = rnd();
    if (roll < 0.14) {
        const cx = x + 2 + Math.floor(rnd() * 3);
        g.fillStyle = c.sh;
        g.fillRect(cx, y + 1, 1, 1);
        g.fillRect(cx + 1, y + 2, 1, 1);
        g.fillRect(cx + 1, y + 3, 1, 1);
    } else if (roll < 0.24 && !loose) {
        g.fillStyle = mortar || c.sh;
        g.fillRect(x + BRICK_W - 1, y, 1, 1);
    }
}

export function buildScene(cols, rows, dark) {
    const rnd = seeded(20260311);
    const mortar = dark ? MORTAR.dark : MORTAR.light;
    const groundY = rows - GROUND_H;

    const layer = document.createElement('canvas');
    layer.width = cols;
    layer.height = rows;
    const g = layer.getContext('2d');

    /* ---- the wall ---- */

    const courses = Math.max(3, Math.floor((groundY - HEADROOM) / PITCH_Y));
    const x0 = Math.round(cols * 0.58);

    /* Row of the top of course c's brick body. */
    const bodyY = (c) => groundY - (c + 1) * PITCH_Y + 1;

    for (let c = 0; c < courses; c += 1) {
        const top = c === courses - 1;
        const teeth = c % 2 ? PITCH_X >> 1 : 0;
        const setBack = !top && c > 0 && rnd() < 0.28 ? PITCH_X : 0;
        let k = 0;
        for (let x = x0 + teeth + setBack; x < cols; x += PITCH_X, k += 1) {
            /* The top course is only half laid: whole at the left end,
               where somebody stands, then gaps. */
            if (top && k >= 3 && rnd() < 0.55) continue;
            drawBrick(g, rnd, x, bodyY(c), mortar);
        }
    }

    /* Two bricks left loose on top of the half-laid course. */
    const topBody = bodyY(courses - 1);
    const loose = [x0 + PITCH_X * 4 + 2, x0 + PITCH_X * 6 + 6];
    loose.forEach((x, i) => {
        if (x + BRICK_W < cols) {
            drawBrick(g, rnd, x, topBody - BRICK_H - 1 - (i ? 0 : 0), null, { loose: true });
        }
    });

    /* ---- the ground ---- */

    g.fillStyle = GROUND.grass;
    g.fillRect(0, groundY, cols, 1);
    g.fillStyle = GROUND.dirt;
    g.fillRect(0, groundY + 1, cols, rows - groundY - 1);
    g.fillStyle = GROUND.dirtDeep;
    g.fillRect(0, rows - 1, cols, 1);

    for (let x = 0; x < cols; x += 1) {
        const r = rnd();
        if (r < 0.2) { g.fillStyle = GROUND.grassHi; g.fillRect(x, groundY, 1, 1); }
        else if (r < 0.33) { g.fillStyle = GROUND.grassLo; g.fillRect(x, groundY, 1, 1); }

        /* Blades standing out of the top, and roots hanging under it. */
        if (rnd() < 0.1) {
            g.fillStyle = GROUND.grass;
            g.fillRect(x, groundY - 1, 1, 1);
            if (rnd() < 0.4) g.fillRect(x + (rnd() < 0.5 ? 1 : -1), groundY - 1, 1, 1);
        }
        if (rnd() < 0.3) { g.fillStyle = GROUND.grassLo; g.fillRect(x, groundY + 1, 1, 1); }

        for (let y = groundY + 2; y < rows - 1; y += 1) {
            const s = rnd();
            if (s < 0.22) { g.fillStyle = GROUND.dirtLo; g.fillRect(x, y, 1, 1); }
            else if (s < 0.3) { g.fillStyle = GROUND.dirtHi; g.fillRect(x, y, 1, 1); }
        }
    }

    /* ---- the spare bricks ---- */

    const homeX = Math.max(2, x0 - 10 - 45);
    if (homeX >= 30) {
        const sx = homeX - 27;
        drawBrick(g, rnd, sx, groundY - BRICK_H, null, { loose: true });
        drawBrick(g, rnd, sx + PITCH_X, groundY - BRICK_H, null, { loose: true });
        drawBrick(g, rnd, sx + 4, groundY - BRICK_H * 2, null, { loose: true });
    }

    return {
        layer,
        cols,
        rows,
        groundY,
        courses,
        x0,
        homeX,
        baseX: x0 - 10,                                  /* hands on the teeth */
        floorY: groundY - SPRITE_H,                      /* top of a person on the ground */
        standY: bodyY(courses - 1) - 1 - SPRITE_H,       /* top of a person on the wall */
        topX: x0 + 5,
    };
}

export const MIN_COLS = 105;
export const MIN_ROWS = 60;
