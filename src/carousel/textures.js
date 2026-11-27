

import { cld, HEIGHTS, step } from '../data/cloudinary.js';

const CEILING = 2048;

const LIMIT = 2;

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

        if (slot.texture && slot.texture !== texture) gl.deleteTexture(slot.texture);
        slot.texture = texture;
        slot.aspect = width / height;
        slot.ready = true;
        if (onReady) onReady();
    };

    const vector = (src) => /\.svgz?(\?|#|$)/i.test(src);

    const load = (index, target, done) => {
        const src = sources[index];
        const slot = slots[index];
        const image = new Image();
        image.decoding = 'async';
        image.crossOrigin = 'anonymous';

        image.fetchPriority = urgent && asked === 0 ? 'high' : 'low';
        asked += 1;

        const draw = () => {
            if (cancelled) return;

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

            }
        };

        image.src = vector(src) ? src : cld(src, { h: step(target, HEIGHTS) });

        image
            .decode()
            .then(draw)
            .catch(() => {})
            .then(done);
    };

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
