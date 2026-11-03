/* The crew's bodies.

   There is no sprite sheet. A worker is drawn each frame from a few
   numbers — which way they face, how far they lean, how deep they
   crouch, and where their two hands are — and the arms are worked out
   from the hands: each is two bones that reach from the shoulder to the
   hand, so a hand that is on a brick or at the catch point is always
   attached to a believable arm, whatever the pose in between.

   They are silhouettes in the site's own ink (black on the light theme,
   white on the dark one) with one touch of red each: a headband, a hard
   hat, a beanie. The far arm and leg are a step lighter than the near
   ones, which is all the depth they need.

   Coordinates are in cells. x grows right, y grows down, and a cell at
   integer (i, j) covers [i, i + 1) × [j, j + 1). */

export const FIG_W = 7;
export const FIG_H = 16;

const BONE = 3.8;       /* each of the two bones of an arm, in cells */

const INK = {
    light: { k: '#17161b', t: '#4b4953', g: '#8d8a93', r: '#d8412f', R: '#9e2c1f' },
    dark: { k: '#f0eee8', t: '#b4b1a8', g: '#77746d', r: '#e5543f', R: '#b03b2a' },
};

export function inkFor(dark) {
    return dark ? INK.dark : INK.light;
}

function cell(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

/* A one-cell line between two points, drawn cell by cell. */
function line(ctx, x0, y0, x1, y1, color) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.6));
    for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        cell(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, color);
    }
}

/* Where the elbow goes when a hand at (hx, hy) is reached from a shoulder
   at (sx, sy) by two bones: the lower of the two places it could be. */
function elbowFor(sx, sy, hx, hy) {
    let dx = hx - sx;
    let dy = hy - sy;
    let d = Math.hypot(dx, dy);
    const max = BONE * 2 - 0.05;
    if (d > max) {
        dx *= max / d;
        dy *= max / d;
        d = max;
    }
    const base = Math.atan2(dy, dx);
    const bend = Math.acos(Math.min(1, Math.max(-1, d / (2 * BONE))));
    const a = { x: sx + Math.cos(base + bend) * BONE, y: sy + Math.sin(base + bend) * BONE };
    const b = { x: sx + Math.cos(base - bend) * BONE, y: sy + Math.sin(base - bend) * BONE };
    return a.y >= b.y ? a : b;
}

function arm(ctx, sx, sy, hand, color) {
    /* A hand out of reach is stopped at the end of the arm, not stretched. */
    let hx = hand[0];
    let hy = hand[1];
    const d = Math.hypot(hx - sx, hy - sy);
    const max = BONE * 2 - 0.05;
    if (d > max) {
        hx = sx + ((hx - sx) * max) / d;
        hy = sy + ((hy - sy) * max) / d;
    }
    const e = elbowFor(sx, sy, hx, hy);
    line(ctx, sx, sy, e.x, e.y, color);
    line(ctx, e.x, e.y, hx, hy, color);
}

/* The accent: what makes the three of them different people. */
function accent(put, kind, pal, t) {
    switch (kind) {
        case 'band':
            /* A headband, and the ends of it blowing about. */
            put(-1, 1, pal.r); put(0, 1, pal.r); put(1, 1, pal.r);
            put(-2, 1, pal.R);
            put(-3, Math.floor(t * 4) % 2 ? 1 : 2, pal.R);
            break;
        case 'hat':
            put(-1, 0, pal.r); put(0, 0, pal.r); put(1, 0, pal.r);
            put(-2, 1, pal.r); put(-1, 1, pal.r); put(0, 1, pal.r); put(1, 1, pal.r); put(2, 1, pal.R);
            put(3, 1, pal.R);
            break;
        default:
            /* A beanie with a bobble. */
            put(-1, 0, pal.r); put(0, 0, pal.r); put(1, 0, pal.r);
            put(-1, 1, pal.R); put(0, 1, pal.R); put(1, 1, pal.R);
            put(0, -1, pal.r);
            break;
    }
}

/* Draw one worker.

   `x`, `y` is the top left of their box when standing; `dir` is 1 facing
   right and -1 facing left. `lean` leans the upper body forward (positive)
   or back; `crouch` is 0 standing to 1 bent right down; `hands` is
   [near, far] in world cells; `brick`, if there is one, is drawn between
   the arms by the caller through `drawBrick`. */
export function drawFigure(ctx, fig, pal, t, drawBrick) {
    const { x, y, dir, lean, crouch, hands, kind } = fig;
    const ax = x + 3;                          /* the centre column */
    const drop = Math.round(crouch * 3);
    const put = (dx, row, color) => cell(ctx, ax + dir * dx, y + row + drop, color);

    /* Shoulders, where the arms start. */
    const lx = Math.round(lean);
    const shoulderNear = [ax + 0.5 + dir * (1.5 + lx * 0.5), y + 5.5 + drop];
    const shoulderFar = [ax + 0.5 + dir * (-0.5 + lx * 0.5), y + 5.5 + drop];

    /* The far arm, behind everything. */
    arm(ctx, shoulderFar[0], shoulderFar[1], hands[1], pal.g);

    /* Legs: straight when standing, folding forward at the knee as they
       crouch, with the feet staying where they are. */
    const hipY = y + 10 + drop;
    const footY = y + FIG_H - 1;
    const bend = Math.round(crouch * 2);
    for (let row = hipY; row <= footY; row += 1) {
        /* The knee is the middle of the leg, and it goes forward. */
        const u = footY === hipY ? 0 : (row - hipY) / (footY - hipY);
        const k = Math.round(bend * (1 - Math.abs(2 * u - 1)));
        cell(ctx, ax + dir * -1, row, pal.g);
        cell(ctx, ax + dir * k, row, pal.k);
        cell(ctx, ax + dir * (1 + k), row, pal.k);
    }
    cell(ctx, ax + dir * 2, footY, pal.k);               /* the toe */
    cell(ctx, ax + dir * -2, footY, pal.g);

    /* Torso, a column four wide that leans from the hips, in a shirt tone
       a step off the ink so that the arms in front of it can be seen. */
    for (let r = 0; r < 6; r += 1) {
        const shift = Math.round(lean * (1 - r / 5));
        for (let dx = -1; dx <= 2; dx += 1) put(dx + shift, 4 + r, r === 5 ? pal.k : pal.t);
    }

    /* Head, with a nose to say which way they are facing. */
    for (let r = 0; r < 4; r += 1) {
        for (let dx = -1; dx <= 1; dx += 1) put(dx + lx, r, pal.k);
    }
    put(2 + lx, 2, pal.k);
    accent((dx, row, color) => put(dx + lx, row, color), kind, pal, t);

    if (drawBrick) drawBrick();

    /* The near arm, in front of the brick. */
    arm(ctx, shoulderNear[0], shoulderNear[1], hands[0], pal.k);
}
