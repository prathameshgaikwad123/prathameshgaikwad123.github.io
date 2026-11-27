import { ONSET, POWER, QUAD, STRENGTH, PIVOT_NEAR, PIVOT_RIM, LUT_SIZE } from './config.js';

/* The field. Flat across the middle, then a steep rim ramp. */
export function fieldAt(u) {
    const s = Math.min(Math.max((Math.abs(u) - ONSET) / (1 - ONSET), 0), 1);
    return Math.pow(s, POWER);
}

export function magnificationAt(u, dispersion = 0) {
    return 1 + QUAD * u * u + STRENGTH * fieldAt(u) * (1 + dispersion);
}

const OVERSAMPLE = 8;

function integrate(dispersion, steps, h) {

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

let lookup = null;

export function unwarpPoint(nx, ny, out = {}) {
    if (!lookup) lookup = buildWarpTable(LUT_SIZE);

    const size = lookup.length / 2;
    const at = Math.min(Math.max(nx * size - 0.5, 0), size - 1);
    const lo = Math.floor(at);
    const hi = Math.min(lo + 1, size - 1);
    const dx = lookup[lo * 2] + (lookup[hi * 2] - lookup[lo * 2]) * (at - lo);

    const u = (nx - 0.5) * 2;
    const e = fieldAt(u);
    const m = 1 + QUAD * u * u + STRENGTH * e;
    const pivot = PIVOT_NEAR + (PIVOT_RIM - PIVOT_NEAR) * Math.sqrt(e);

    out.x = nx + dx;
    out.y = pivot + (ny - pivot) / m;
    return out;
}
