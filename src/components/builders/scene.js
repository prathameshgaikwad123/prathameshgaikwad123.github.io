/* The building site the crew works on, painted once into an off-screen
   bitmap: grass and dirt, a pole scaffold, a pile of spare bricks and a
   brick wall that is not finished.

   The wall runs off the right edge of the picture. Its left end is
   ragged: every other course stops half a brick short of the one below
   it, so bricks stand out of the end in teeth, and the top left corner
   is missing in three steps. Those gaps are the work. Each missing brick
   is a "slot" with a little bitmap of its own, which the simulation
   throws into place one at a time and draws over this bitmap, so that
   finishing the wall is only a matter of filling every slot — and
   starting over is a matter of emptying them.

   Everything is placed by a seeded generator, so the same site comes
   back every time the panel opens, and everything is one cell — one
   "pixel" of the picture — at a time. */

import { SPRITE_H } from './art.js';

export const BRICK_W = 8;       /* the brick itself, in cells */
export const HALF_W = 3;        /* the half brick that squares off an end */
export const BRICK_H = 4;
export const PITCH_X = BRICK_W + 1;   /* brick plus a column of mortar */
export const PITCH_Y = BRICK_H + 1;   /* brick plus a row of mortar */
export const GROUND_H = 4;
const HEADROOM = SPRITE_H + 5;        /* room above the top of the wall */

const BRICKS = [
    { base: '#b8382c', hi: '#e0654c', sh: '#7a2119', dark: '#962a20', lite: '#cf4f3b' },
    { base: '#c4442e', hi: '#e8704f', sh: '#82251a', dark: '#a03022', lite: '#d9593f' },
    { base: '#a93126', hi: '#d05642', sh: '#6e1c15', dark: '#8b2820', lite: '#c0463a' },
];

const GROUND = {
    grass: '#5aa63f', grassHi: '#85cf5e', grassLo: '#3d7d2c',
    dirt: '#8a5a38', dirtLo: '#6e4529', dirtHi: '#a87048', dirtDeep: '#59371f',
};

const WOOD = { base: '#9b6b3e', hi: '#bf8c55', lo: '#6b4526', pole: '#7a4f2b', poleHi: '#a37444' };

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

/* One brick, `w` cells wide, with the mortar round it — the row above and
   the column to the right — when it is part of a wall. */
export function drawBrick(g, rnd, x, y, w, mortar) {
    if (mortar) {
        g.fillStyle = mortar;
        g.fillRect(x, y - 1, w + 1, BRICK_H + 1);
    }

    const c = BRICKS[Math.floor(rnd() * BRICKS.length)];
    g.fillStyle = c.base;
    g.fillRect(x, y, w, BRICK_H);

    /* Lit from the upper left. */
    g.fillStyle = c.hi;
    g.fillRect(x, y, w, 1);
    g.fillRect(x, y, 1, BRICK_H);
    g.fillStyle = c.sh;
    g.fillRect(x, y + BRICK_H - 1, w, 1);
    g.fillRect(x + w - 1, y + 1, 1, BRICK_H - 1);

    /* Grain. */
    const grains = w > 5 ? 3 + Math.floor(rnd() * 4) : 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < grains; i += 1) {
        g.fillStyle = rnd() < 0.55 ? c.dark : c.lite;
        g.fillRect(x + 1 + Math.floor(rnd() * (w - 2)), y + 1 + Math.floor(rnd() * (BRICK_H - 2)), 1, 1);
    }

    /* The odd cracked brick. */
    if (w > 5 && rnd() < 0.12) {
        const cx = x + 2 + Math.floor(rnd() * 3);
        g.fillStyle = c.sh;
        g.fillRect(cx, y + 1, 1, 1);
        g.fillRect(cx + 1, y + 2, 1, 1);
        g.fillRect(cx + 1, y + 3, 1, 1);
    }
}

function line(g, x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i += 1) {
        const t = steps ? i / steps : 0;
        g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
    }
}

function plank(g, x, y, w) {
    g.fillStyle = WOOD.base;
    g.fillRect(x, y, w, 3);
    g.fillStyle = WOOD.hi;
    g.fillRect(x, y, w, 1);
    g.fillStyle = WOOD.lo;
    g.fillRect(x, y + 2, w, 1);
    for (let jx = x + 8; jx < x + w; jx += 9) g.fillRect(jx, y + 1, 1, 1);
}

function ladder(g, x, yTop, yBottom) {
    g.fillStyle = WOOD.pole;
    g.fillRect(x, yTop, 1, yBottom - yTop);
    g.fillRect(x + 4, yTop, 1, yBottom - yTop);
    g.fillStyle = WOOD.poleHi;
    for (let y = yTop + 2; y < yBottom; y += 3) g.fillRect(x + 1, y, 3, 1);
}

export function buildScene(cols, rows, dark) {
    const rnd = seeded(20260311);
    const mortar = dark ? MORTAR.dark : MORTAR.light;
    const groundY = rows - GROUND_H;

    const layer = document.createElement('canvas');
    layer.width = cols;
    layer.height = rows;
    const g = layer.getContext('2d');

    const courses = Math.max(5, Math.floor((groundY - HEADROOM) / PITCH_Y));
    const T = courses - 1;
    const x0 = Math.round(cols * 0.58);
    const bodyY = (c) => groundY - (c + 1) * PITCH_Y + 1;

    /* ---- the wall, and the bricks it is missing ---- */

    const missing = { [T]: 5, [T - 1]: 3, [T - 2]: 1 };
    const slots = [];

    for (let c = 0; c < courses; c += 1) {
        const odd = c % 2 === 1;
        const start = x0 + (odd ? PITCH_X >> 1 : 0);
        const gap = missing[c] || 0;
        let k = 0;

        if (odd) {
            /* The half brick that would make this end square. */
            const cell = document.createElement('canvas');
            cell.width = HALF_W + 1;
            cell.height = BRICK_H + 1;
            drawBrick(cell.getContext('2d'), rnd, 0, 1, HALF_W, mortar);
            slots.push({ c, x: x0, y: bodyY(c), w: HALF_W, canvas: cell });
        }

        for (let x = start; x < cols; x += PITCH_X, k += 1) {
            if (k < gap) {
                const cell = document.createElement('canvas');
                cell.width = BRICK_W + 1;
                cell.height = BRICK_H + 1;
                drawBrick(cell.getContext('2d'), rnd, 0, 1, BRICK_W, mortar);
                slots.push({ c, x, y: bodyY(c), w: BRICK_W, canvas: cell });
            } else {
                drawBrick(g, rnd, x, bodyY(c), BRICK_W, mortar);
            }
        }
    }

    /* Bottom to top, and left to right along a course. */
    slots.sort((a, b) => a.c - b.c || a.x - b.x);

    /* ---- the scaffold ---- */

    const hasMid = T >= 8;
    const topFeet = bodyY(T) + 7;                              /* feet row of whoever stands up top */
    const midFeet = hasMid ? Math.round((bodyY(T - 7) + bodyY(T - 3)) / 2) + 6 : 0;

    const xl = x0 - 29;
    const xr = x0 - 6;
    const polesTop = topFeet - 7;

    g.fillStyle = WOOD.pole;
    [xl, xr].forEach((px) => {
        g.fillRect(px, polesTop, 2, groundY - polesTop);
        g.fillStyle = WOOD.poleHi;
        g.fillRect(px, polesTop, 1, groundY - polesTop);
        g.fillStyle = WOOD.pole;
    });

    /* Diagonal bracing across the bottom bay, where nobody stands. */
    const lowest = (hasMid ? midFeet : topFeet) + 1;
    g.fillStyle = WOOD.pole;
    line(g, xl + 2, groundY - 1, xr - 1, lowest + 3);
    line(g, xr - 1, groundY - 1, xl + 2, lowest + 3);

    plank(g, xl - 1, topFeet + 1, x0 - xl);
    if (hasMid) plank(g, xl - 1, midFeet + 1, x0 - xl);

    /* Ladders up the outside, which nobody is using. */
    ladder(g, xl - 7, hasMid ? midFeet + 1 : topFeet + 1, groundY);
    if (hasMid) ladder(g, xl - 7, topFeet + 1, midFeet + 1);

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

    /* ---- the pile of spare bricks ---- */

    const xA = x0 - 46;
    const pileX = xA - 28;
    [[0, 0], [9, 0], [18, 0], [4, 1], [13, 1], [9, 2]].forEach(([dx, lvl]) => {
        drawBrick(g, rnd, pileX + dx, groundY - BRICK_H * (lvl + 1), BRICK_W, null);
    });

    /* Who stands where, as the top-left of a sprite. */
    const feetToY = (feet) => feet - (SPRITE_H - 1);
    const spots = {
        A: { x: xA, y: groundY - SPRITE_H },
        B: { x: x0 - 13, y: feetToY(topFeet) },
        C: hasMid ? { x: x0 - 22, y: feetToY(midFeet) } : null,
    };

    /* Who throws a brick into which slot: whoever stands nearest its
       height. */
    slots.forEach((s) => {
        if (s.c >= T - 2) s.thrower = 'B';
        else if (hasMid && s.c >= T - 7) s.thrower = 'C';
        else s.thrower = 'A';
    });

    return {
        layer,
        cols,
        rows,
        groundY,
        courses,
        T,
        x0,
        slots,
        spots,
        pile: { x: pileX, y: groundY - BRICK_H * 3 },
        flag: { x: x0 + 3, y: bodyY(T) - 1 },
    };
}

export const MIN_COLS = 132;
export const MIN_ROWS = 50;
