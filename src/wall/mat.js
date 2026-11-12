/* The little linear algebra the wall needs, and no more of it: four by
   four matrices, column-major, as Float32Arrays the way WebGL takes
   them. Six functions for building a view and two for using one. The
   scene is one camera, one light and one tilting slab, so a maths
   library would be mostly unread. */

export function identity() {
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
}

/* a · b — b is applied first. */
export function multiply(a, b, out = new Float32Array(16)) {
    for (let c = 0; c < 4; c += 1) {
        const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
        out[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
        out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
        out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
        out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    return out;
}

export function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) / (near - far);
    m[11] = -1;
    m[14] = (2 * far * near) / (near - far);
    return m;
}

export function ortho(l, r, b, t, n, f) {
    const m = new Float32Array(16);
    m[0] = 2 / (r - l);
    m[5] = 2 / (t - b);
    m[10] = -2 / (f - n);
    m[12] = -(r + l) / (r - l);
    m[13] = -(t + b) / (t - b);
    m[14] = -(f + n) / (f - n);
    m[15] = 1;
    return m;
}

export function lookAt(eye, at, up) {
    let zx = eye[0] - at[0], zy = eye[1] - at[1], zz = eye[2] - at[2];
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    const m = new Float32Array(16);
    m[0] = xx; m[1] = yx; m[2] = zx;
    m[4] = xy; m[5] = yy; m[6] = zy;
    m[8] = xz; m[9] = yz; m[10] = zz;
    m[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    m[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    m[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    m[15] = 1;
    return m;
}

/* The slab's own placement: moved by (`tx`, `ty`), then leaned `ry` about
   the upright and `rx` about the level. A pure rotation and a translation,
   which is what lets the pointer be taken back through it by transpose
   rather than by a general inverse. */
export function placement(ry, rx, tx, ty, out = new Float32Array(16)) {
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    out[0] = cy; out[1] = 0; out[2] = -sy; out[3] = 0;
    out[4] = sy * sx; out[5] = cx; out[6] = cy * sx; out[7] = 0;
    out[8] = sy * cx; out[9] = -sx; out[10] = cy * cx; out[11] = 0;
    out[12] = tx; out[13] = ty; out[14] = 0; out[15] = 1;
    return out;
}

/* A point through a matrix, perspective divide included. */
export function project(m, x, y, z, out) {
    const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}

/* A world-space point or direction taken back into the slab's own
   space: the transpose of the rotation, after the translation is
   undone. `w` is 1 for a point and 0 for a direction. */
export function intoSlab(m, x, y, z, w, out) {
    const px = x - m[12] * w, py = y - m[13] * w, pz = z - m[14] * w;
    out[0] = m[0] * px + m[1] * py + m[2] * pz;
    out[1] = m[4] * px + m[5] * py + m[6] * pz;
    out[2] = m[8] * px + m[9] * py + m[10] * pz;
    return out;
}
