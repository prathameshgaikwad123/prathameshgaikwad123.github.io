import { ONSET, POWER, QUAD, STRENGTH, LUT_SIZE } from './config.js';

/* ===================================================================
   THE WARP TABLE
   -------------------------------------------------------------------
   The lens is described by a magnification m(x). Turning that into a
   texture lookup is not the division it looks like.

   A magnifying field is locally isotropic: at every point the picture
   is stretched by m in both directions. Vertically that is a division,
   because m does not vary with y. Horizontally it is not — m varies
   along the very axis it is scaling, so the map from screen back to
   source is the integral of 1/m, not 1/m itself.

   The difference is not academic. Displacing by 1/m with this field
   gives a map that stops being monotone a third of the way through the
   ramp: it folds, and unwarping a frame of the reference through it
   returns cards of negative width. Integrating instead unwarps the
   same frame to a rigid strip — gaps of 39.5, 39.7 and 39.7 pixels
   where the source has a constant 40 — which is the proof that this is
   the map the reference is using.

   There is no closed form, so it is integrated once per resize into a
   small table of two numbers per column: the horizontal displacement,
   and the field strength e that the vertical term, the dispersion and
   the blur are all driven from.
   =================================================================== */

/* The field. Flat across the middle, then a steep rim ramp. */
export function fieldAt(u) {
    const s = Math.min(Math.max((Math.abs(u) - ONSET) / (1 - ONSET), 0), 1);
    return Math.pow(s, POWER);
}

export function magnificationAt(u, dispersion = 0) {
    return 1 + QUAD * u * u + STRENGTH * fieldAt(u) * (1 + dispersion);
}

/* Integrated at eight times the table's resolution and by the
   trapezium rule, which on a field this smooth is already exact to
   well under a hundredth of a pixel — the table's own linear
   interpolation is the larger error and is itself far below one. */
const OVERSAMPLE = 8;

function integrate(dispersion, steps, h) {
    /* Cumulative 1/m from x = 0, then rebased so the middle of the
       stage maps to itself: the lens has no effect there and the
       picture must not slide. */
    const cumulative = new Float64Array(steps + 1);
    let previous = 1 / magnificationAt(-1, dispersion);
    for (let i = 1; i <= steps; i++) {
        const u = (i * h - 0.5) * 2;
        const inv = 1 / magnificationAt(u, dispersion);
        cumulative[i] = cumulative[i - 1] + ((previous + inv) * 0.5) * h;
        previous = inv;
    }
    const middle = cumulative[steps >> 1];
    for (let i = 0; i <= steps; i++) cumulative[i] += 0.5 - middle;
    return cumulative;
}

/* Rows of (dx, e), sampled at texel centres so a LINEAR fetch at any
   normalised x returns the value for that x. The displacement is stored
   as an offset from identity rather than an absolute position: it never
   exceeds about 0.033 of the stage, which keeps a half-float table
   accurate to a twentieth of a pixel. */
export function buildWarpTable(size = LUT_SIZE) {
    const steps = size * OVERSAMPLE;
    const h = 1 / steps;
    const table = integrate(0, steps, h);

    const data = new Float32Array(size * 2);
    for (let i = 0; i < size; i++) {
        const x = (i + 0.5) / size;
        const at = x * steps;
        const lo = Math.min(Math.floor(at), steps - 1);
        data[i * 2] = table[lo] + (table[lo + 1] - table[lo]) * (at - lo) - x;
        data[i * 2 + 1] = fieldAt((x - 0.5) * 2);
    }
    return data;
}
