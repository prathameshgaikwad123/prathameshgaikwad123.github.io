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

const CEILING = 2048;

/* One slot per project, filled in as the decode finishes. A card whose
   texture has not arrived draws as ground and fades in over a beat, so
   a slow image never holds up the first frame. */
export function createTextureSet(gl, sources, onReady) {
    const slots = sources.map(() => ({ texture: null, aspect: 1, fade: 0, ready: false }));
    let cancelled = false;

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
        slot.texture = texture;
        slot.aspect = width / height;
        slot.ready = true;
        if (done) done();
        if (onReady) onReady();
    };

    /* A vector source has no true resolution, so it is rasterised at
       whatever the card needs. A photograph has one, and enlarging it
       past that buys nothing but memory. */
    const vector = (src) => /\.svgz?(\?|#|$)/i.test(src);

    const load = (src, slot, target, done) => {
        const image = new Image();
        image.decoding = 'async';
        image.crossOrigin = 'anonymous';
        image.onload = () => {
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
                upload(slot, canvas, iw, ih, done);
            } catch (error) {
                /* Nothing to draw and nothing to say: the card stays as
                   ground, and the row below still lists and links it. */
            }
        };
        image.onerror = () => {};
        image.src = src;
    };

    let raster = 0;

    return {
        slots,
        /* `target` is the tallest a card will be drawn, in device
           pixels, including the rim's magnification. Called on every
           resize, but a resize is not a reason to fetch and decode the
           set again: only a request for meaningfully more detail than
           what is already uploaded is, and only up to the ceiling. */
        start(target) {
            const want = Math.min(Math.round(target), CEILING);
            if (want <= raster * 1.3) return;
            const first = raster === 0;
            raster = want;
            sources.forEach((src, i) => {
                const slot = slots[i];
                const previous = slot.texture;
                load(src, slot, want, () => {
                    if (!first && previous) gl.deleteTexture(previous);
                });
            });
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
            for (const slot of slots) if (slot.texture) gl.deleteTexture(slot.texture);
        },
    };
}
