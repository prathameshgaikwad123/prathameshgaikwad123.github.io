/* ===================================================================
   TEXTURES
   -------------------------------------------------------------------
   The rim magnifies by 1.57 and the pass runs at up to twice device
   scale, so a card's texture is asked for rather more pixels than the
   card occupies. Everything is therefore rasterised into a canvas at a
   size worked out from that worst case rather than taken at whatever
   intrinsic size it arrived with — which also settles SVG, where the
   intrinsic size is only a suggestion and drawing it small and scaling
   it up would be visibly soft exactly where the glass magnifies most.
   =================================================================== */

import { cld, HEIGHTS, step } from '../data/cloudinary.js';

const CEILING = 2048;

/* How many covers are fetched at once after the first has arrived. The
   first is always fetched alone: it is the card in the middle of the
   glass, and on a slow connection a cover that shares the line with
   six others arrives seven times later than one that does not. */
const LIMIT = 2;

/* One slot per project, filled in as the decode finishes. A card whose
   texture has not arrived draws as ground and fades in over a beat, so
   a slow image never holds up the first frame. `want` is the raster a
   slot has been asked for, so a second request for the same detail is
   a no-op however it arrives. */
export function createTextureSet(gl, sources, onReady) {
    const slots = sources.map(() => ({ texture: null, aspect: 1, fade: 0, ready: false, want: 0 }));
    let cancelled = false;
    let queue = [];
    let active = 0;
    let asked = 0;
    let urgent = false;

    const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic');
    const maxAniso = anisotropy ? Math.min(8, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;

    const upload = (slot, bitmap, width, height, done) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (maxAniso) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
        gl.bindTexture(gl.TEXTURE_2D, null);
        /* A sharper raster replacing an earlier one. The old texture is
           let go here, when it is actually replaced, rather than by
           whichever request happened to start first. */
        if (slot.texture && slot.texture !== texture) gl.deleteTexture(slot.texture);
        slot.texture = texture;
        slot.aspect = width / height;
        slot.ready = true;
        if (onReady) onReady();
    };

    /* A vector source has no true resolution, so it is rasterised at
       whatever the card needs. A photograph has one, and enlarging it
       past that buys nothing but memory. */
    const vector = (src) => /\.svgz?(\?|#|$)/i.test(src);

    /* A photograph is asked for at the height it will be rasterised to
       — the smallest step on the ladder at or above it, in whatever
       format this browser takes — instead of as the original upload.
       The raster below is then the same size it always was: the target,
       or the delivered image's own height if that is smaller, which
       c_limit only allows when the original is. */
    const load = (index, target, done) => {
        const src = sources[index];
        const slot = slots[index];
        const image = new Image();
        image.decoding = 'async';
        image.crossOrigin = 'anonymous';
        /* Low priority throughout while the covers are being fetched
           ahead of the reader — nothing on the first screen should wait
           behind them — and high for the first one when the reader is
           already looking at the stage. */
        image.fetchPriority = urgent && asked === 0 ? 'high' : 'low';
        asked += 1;

        const draw = () => {
            if (cancelled) return;
            /* An SVG can decline to report an intrinsic size at all;
               where it does, its ratio is kept and only the scale is
               chosen here. */
            const iw = image.naturalWidth || 1600;
            const ih = image.naturalHeight || 1000;
            const wantH = vector(src) ? target : Math.min(target, ih);
            let scale = Math.min(wantH, CEILING) / ih;
            if (iw * scale > CEILING) scale = CEILING / iw;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(2, Math.round(iw * scale));
            canvas.height = Math.max(2, Math.round(ih * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            try {
                upload(slot, canvas, iw, ih);
            } catch (error) {
                /* Nothing to draw and nothing to say: the card stays as
                   ground, and the row below still lists and links it. */
            }
        };

        image.src = vector(src) ? src : cld(src, { h: step(target, HEIGHTS) });
        /* Decoded off the main thread before it is drawn. Drawing an
           image that has only loaded decodes it synchronously inside
           drawImage — a long task per cover on a phone — where decode()
           hands back an image that is already pixels. */
        image
            .decode()
            .then(draw)
            .catch(() => {})
            .then(done);
    };

    /* Anything waiting goes as a slot frees up: one at a time until a
       cover has arrived, then LIMIT at a time. */
    const pump = () => {
        const room = slots.some((slot) => slot.ready) ? LIMIT : 1;
        while (!cancelled && queue.length && active < room) {
            const job = queue.shift();
            active += 1;
            load(job.index, job.want, () => {
                active -= 1;
                pump();
            });
        }
    };

    return {
        slots,
        /* `target` is the tallest a card will be drawn, in device
           pixels, including the rim's magnification. Called on every
           resize, but a resize is not a reason to fetch and decode the
           set again: only a request for meaningfully more detail than
           what a slot already has is, and only up to the ceiling.

           `order` is which covers, most wanted first — the middle of
           the glass, then outwards. A cover left out of it is not
           fetched yet; a later call can ask for it. `now` says the
           reader is already looking. */
        start(target, order = sources.map((_, i) => i), now = false) {
            if (now) urgent = true;
            const want = Math.min(Math.round(target), CEILING);
            for (const index of order) {
                const slot = slots[index];
                if (!slot || (slot.want && want <= slot.want * 1.3)) continue;
                slot.want = want;
                queue = queue.filter((job) => job.index !== index);
                queue.push({ index, want });
            }
            pump();
        },
        advance(dt) {
            let moving = false;
            for (const slot of slots) {
                if (!slot.ready || slot.fade >= 1) continue;
                slot.fade = Math.min(1, slot.fade + dt / 0.5);
                moving = true;
            }
            return moving;
        },
        dispose() {
            cancelled = true;
            queue = [];
            for (const slot of slots) if (slot.texture) gl.deleteTexture(slot.texture);
        },
    };
}
