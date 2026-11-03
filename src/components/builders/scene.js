/* The building site the crew works on, painted once into an off-screen
   bitmap: a hatched strip of ground, a pole scaffold, a pile of spare
   bricks and a brick wall that is not finished.

   The look is the site's own rather than a game's. Everything is ink and
   paper except the brickwork, which is the one red thing in the picture,
   and the brickwork is fine and flat — long thin bricks in running bond
   with a hair of mortar between them — instead of chunky bevelled
   blocks.

   The wall runs off the right edge. Its top left corner is missing, in a
   staircase: every missing brick is a "slot" with a little bitmap of its
   own, which the simulation throws into place one at a time and draws
   over this bitmap. Finishing the wall is only a matter of filling every
   slot, and starting over is a matter of emptying them.

   Everything is placed by a seeded generator, so the same site comes
   back every time the panel opens. */

import { FIG_H } from './rig.js';

export const BRICK_W = 7;       /* the brick itself, in cells */
export const HALF_W = 3;        /* the half brick that squares off an end */
export const BRICK_H = 2;
export const PITCH_X = BRICK_W + 1;   /* brick plus a column of mortar */
export const PITCH_Y = BRICK_H + 1;   /* brick plus a row of mortar */
export const GROUND_H = 3;
const HEADROOM = 12;                  /* rows above the top course */
const ZONE = 5;                       /* courses at the top that are unfinished */

const BRICKS = [
    { top: '#cb513c', bottom: '#b13d2b', spk: '#9a3123' },
    { top: '#c64a36', bottom: '#ac3827', spk: '#963022' },
    { top: '#d25a44', bottom: '#b84330', spk: '#a13626' },
];

const TONES = {
    light: {
        mortar: '#e4ded2', line: '#17161b', hatch: 'rgba(23, 22, 27, 0.30)', hatch2: 'rgba(23, 22, 27, 0.14)',
        scaffold: '#8d8a84', plank: '#6c6a73', plankHi: '#8d8a84', pebble: '#8d8a84',
    },
    dark: {
        mortar: '#3a322e', line: '#f0eee8', hatch: 'rgba(240, 238, 232, 0.28)', hatch2: 'rgba(240, 238, 232, 0.12)',
        scaffold: '#6f6c66', plank: '#9b988f', plankHi: '#b4b1a8', pebble: '#6f6c66',
    },
};

export function tonesFor(dark) {
    return dark ? TONES.dark : TONES.light;
}

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

/* One brick, `w` cells wide: two rows, the upper a shade lighter, and now
   and then a speck. With a mortar colour it gets the row above it and the
   column to its right, which is what a brick in a wall looks like. */
export function drawBrick(g, rnd, x, y, w, mortar) {
    if (mortar) {
        g.fillStyle = mortar;
        g.fillRect(x, y - 1, w + 1, BRICK_H + 1);
    }
    const c = BRICKS[Math.floor(rnd() * BRICKS.length)];
    g.fillStyle = c.top;
    g.fillRect(x, y, w, 1);
    g.fillStyle = c.bottom;
    g.fillRect(x, y + 1, w, 1);
    if (w > 4 && rnd() < 0.55) {
        g.fillStyle = c.spk;
        g.fillRect(x + 1 + Math.floor(rnd() * (w - 2)), y + Math.floor(rnd() * 2), 1, 1);
    }
}

function line(g, x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i += 1) {
        const t = steps ? i / steps : 0;
        g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
    }
}

function plank(g, tones, x, y, w) {
    g.fillStyle = tones.plank;
    g.fillRect(x, y, w, 2);
    g.fillStyle = tones.plankHi;
    g.fillRect(x, y, w, 1);
}

function ladder(g, tones, x, yTop, yBottom) {
    g.fillStyle = tones.scaffold;
    g.fillRect(x, yTop, 1, yBottom - yTop);
    g.fillRect(x + 4, yTop, 1, yBottom - yTop);
    for (let y = yTop + 2; y < yBottom; y += 3) g.fillRect(x + 1, y, 3, 1);
}

/* The brick of a slot on its own — no mortar — flat, and stood on end, for
   the one that is in the air and tumbling. Cut from the slot's own bitmap
   so the brick that lands is exactly the brick that was thrown. */
function flightBitmaps(cell, w) {
    const flat = document.createElement('canvas');
    flat.width = w;
    flat.height = BRICK_H;
    flat.getContext('2d').drawImage(cell, 0, 1, w, BRICK_H, 0, 0, w, BRICK_H);
    const on = document.createElement('canvas');
    on.width = BRICK_H;
    on.height = w;
    const g = on.getContext('2d');
    g.translate(BRICK_H, 0);
    g.rotate(Math.PI / 2);
    g.drawImage(flat, 0, 0);
    return { flat, on };
}

export function buildScene(cols, rows, dark) {
    const rnd = seeded(20260311);
    const tones = tonesFor(dark);
    const groundY = rows - GROUND_H;

    const layer = document.createElement('canvas');
    layer.width = cols;
    layer.height = rows;
    const g = layer.getContext('2d');

    const courses = Math.max(ZONE + 4, Math.floor((groundY + 1 - HEADROOM) / PITCH_Y));
    const T = courses - 1;
    const x0 = Math.round(cols * 0.58);
    const bodyY = (c) => groundY - (c + 1) * PITCH_Y + 1;

    /* ---- the wall, and the bricks it is missing ---- */

    /* The top left corner is missing in steps, widest at the top, so that
       every missing brick has a course under it and nothing over it. */
    const gap = {};
    let prev = 0;
    for (let i = 0; i < ZONE; i += 1) {
        const c = T - ZONE + 1 + i;
        const start = c % 2 ? PITCH_X >> 1 : 0;
        let m = Math.max(1, Math.ceil((8 + 5 * i - start) / PITCH_X));
        while (start + m * PITCH_X < prev) m += 1;
        gap[c] = m;
        prev = start + m * PITCH_X;
    }

    const slots = [];
    const slotFor = (c, x, w) => {
        const cellCanvas = document.createElement('canvas');
        cellCanvas.width = w + 1;
        cellCanvas.height = BRICK_H + 1;
        drawBrick(cellCanvas.getContext('2d'), rnd, 0, 1, w, tones.mortar);
        slots.push({ c, x, y: bodyY(c), w, canvas: cellCanvas, fly: flightBitmaps(cellCanvas, w) });
    };

    for (let c = 0; c < courses; c += 1) {
        const odd = c % 2 === 1;
        const m = gap[c] || 0;

        if (odd) {
            if (m) slotFor(c, x0, HALF_W);
            else drawBrick(g, rnd, x0, bodyY(c), HALF_W, tones.mortar);
        }

        let k = 0;
        for (let x = x0 + (odd ? PITCH_X >> 1 : 0); x < cols; x += PITCH_X, k += 1) {
            if (k < m) slotFor(c, x, BRICK_W);
            else drawBrick(g, rnd, x, bodyY(c), BRICK_W, tones.mortar);
        }
    }

    /* Bottom to top, and left to right along a course. */
    slots.sort((a, b) => a.c - b.c || a.x - b.x);

    /* ---- who stands where ---- */

    const xA = x0 - 40;
    const spots = {
        A: { x: xA, y: groundY - FIG_H },
        B: { x: x0 - 12, y: bodyY(T) - 4 },
        C: null,
    };
    if (spots.A.y - spots.B.y >= 44) {
        spots.C = { x: x0 - 17, y: Math.round((spots.A.y + spots.B.y) / 2) };
    }

    /* ---- the scaffold ---- */

    const topFeet = spots.B.y + FIG_H - 1;
    const midFeet = spots.C ? spots.C.y + FIG_H - 1 : 0;
    const xl = x0 - 25;
    const xr = x0 - 4;
    const polesTop = topFeet - 6;

    g.fillStyle = tones.scaffold;
    g.fillRect(xl, polesTop, 1, groundY - polesTop);
    g.fillRect(xr, polesTop, 1, groundY - polesTop);

    /* Diagonal bracing across the bottom bay, where nobody stands. */
    const lowest = (spots.C ? midFeet : topFeet) + 1;
    line(g, xl + 1, groundY - 1, xr - 1, lowest + 2);
    line(g, xr - 1, groundY - 1, xl + 1, lowest + 2);

    plank(g, tones, xl - 1, topFeet + 1, x0 - xl);
    if (spots.C) plank(g, tones, xl - 1, midFeet + 1, x0 - xl);

    /* Ladders up the outside, which nobody is using. */
    ladder(g, tones, xl - 7, spots.C ? midFeet + 1 : topFeet + 1, groundY);
    if (spots.C) ladder(g, tones, xl - 7, topFeet + 1, midFeet + 1);

    /* ---- the ground ---- */

    g.fillStyle = tones.line;
    g.fillRect(0, groundY, cols, 1);
    for (let x = 0; x < cols; x += 1) {
        if (x % 2 === 0) { g.fillStyle = tones.hatch; g.fillRect(x, groundY + 1, 1, 1); }
        if (x % 4 === 1) { g.fillStyle = tones.hatch2; g.fillRect(x, groundY + 2, 1, 1); }
    }
    g.fillStyle = tones.pebble;
    for (let i = 0; i < Math.floor(cols / 26); i += 1) {
        g.fillRect(Math.floor(rnd() * cols), groundY - 1, 1 + Math.floor(rnd() * 2), 1);
    }

    /* ---- the pile of spare bricks ---- */

    /* Three stacks of them beside the one who feeds the line, the nearest
       a brick short: its top brick belongs to the simulation, which takes
       it away when somebody picks it up and puts another there a moment
       later. */
    const stacks = [[xA - 22, 3], [xA - 14, 2], [xA - 6, 1]];
    stacks.forEach(([sx, height]) => {
        for (let lvl = 0; lvl < height; lvl += 1) {
            drawBrick(g, rnd, sx, groundY - PITCH_Y * (lvl + 1) + 1, BRICK_W, null);
        }
    });
    const pickable = { x: xA - 6, y: groundY - PITCH_Y * 2 + 1 };

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
        tones,
        dark,
        pickable,
    };
}

export const MIN_COLS = 120;
export const MIN_ROWS = 56;
