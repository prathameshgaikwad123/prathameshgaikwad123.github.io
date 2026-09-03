import { QUAD_VERT, CARD_FRAG, SCREEN_VERT, GLASS_FRAG } from './shaders.js';
import { buildWarpTable } from './warp.js';
import { createTextureSet } from './textures.js';
import {
    QUAD, STRENGTH, DISPERSION, DISPERSION_X, LOD_MAX, PIVOT_NEAR, PIVOT_RIM,
    VIGNETTE, CARD_EDGE, SURGE, LUT_SIZE, MAX_DPR, MAX_PIXELS,
} from './config.js';

/* ===================================================================
   THE RENDERER
   -------------------------------------------------------------------
   WebGL2, by hand. The scene is a handful of textured quads and one
   fullscreen pass, which is less than any library would charge to
   describe it, and the effect needs three texture reads per fragment
   at three different magnifications plus a spatially varying blur —
   which is not something backdrop-filter, an SVG filter chain or a 2D
   canvas can be talked into at sixty frames a second.

     pass one   ground and cards, flat, into a texture; mips generated
     pass two   one triangle, reading that texture back through the lens

   Everything the second pass needs about the field arrives in a small
   lookup built by warp.js. The shader itself does nine texture reads
   and no loops.
   =================================================================== */

function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(log || 'shader failed to compile');
    }
    return shader;
}

function link(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(log || 'program failed to link');
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, '');
        uniforms[name] = gl.getUniformLocation(program, name);
    }
    return { program, uniforms };
}

export function createGlass(canvas, sources, onTextureReady) {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
    });
    if (!gl || gl.isContextLost()) return null;

    let cards;
    let glass;
    try {
        cards = link(gl, QUAD_VERT, CARD_FRAG);
        glass = link(gl, SCREEN_VERT, GLASS_FRAG);
    } catch (error) {
        return null;
    }

    /* Two buffers, both static: the unit quad every card is drawn from,
       and the single oversized triangle the second pass covers the
       viewport with. */
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);

    const screen = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, screen);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0);

    /* The strip's own framebuffer. Its texture carries a mip chain,
       which is where the rim blur comes from: a bias into an existing
       chain rather than a variable-radius kernel nobody can afford. */
    const sceneTexture = gl.createTexture();
    const frame = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /* The warp. Half float rather than full: the values stored are
       displacements from identity, never larger than about a thirtieth
       of the stage, so ten bits of mantissa put the error two orders of
       magnitude below a pixel — and half float is filterable in core
       WebGL2, where float is an extension away. */
    const warpTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, warpTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, LUT_SIZE, 1, 0, gl.RG, gl.FLOAT, buildWarpTable(LUT_SIZE));
    gl.bindTexture(gl.TEXTURE_2D, null);

    const textures = createTextureSet(gl, sources, onTextureReady);

    const size = { w: 0, h: 0, dpr: 1 };
    /* Seeded white rather than the warm tan this used to hold. The
       renderer is built before the stage is measured, so on the paths
       where measure() takes an early return — a stage inside a
       collapsed or display:none ancestor — this is the colour the
       first frames actually clear to. White is the light ground, which
       is what an unresolved theme falls back to everywhere else on the
       site; setGround() replaces it as soon as the stage can be read.
       See readGround() in src/hooks/useGlassCarousel.js. */
    let ground = [1, 1, 1];
    const uniform = {
        quad: QUAD, mag: STRENGTH, disp: DISPERSION, dispX: DISPERSION_X, lod: LOD_MAX,
        pivotNear: PIVOT_NEAR, pivotRim: PIVOT_RIM,
        vignette: VIGNETTE, edge: CARD_EDGE, surge: SURGE,
    };

    function resize(width, height, ratio) {
        /* Two ceilings on how many fragments the second pass has to
           shade. The device ratio is capped because past two the rim
           blur is hiding more detail than a third device pixel could
           add; the area is capped because a very large display would
           otherwise take the same ratio and ask for four times the
           work. The deficit lands where the glass is softening the
           picture anyway. */
        const budget = Math.sqrt(MAX_PIXELS / Math.max(width * height, 1));
        const dpr = Math.min(ratio || 1, MAX_DPR, budget);
        const w = Math.max(2, Math.round(width * dpr));
        const h = Math.max(2, Math.round(height * dpr));
        size.dpr = dpr;
        if (w === size.w && h === size.h) return false;
        size.w = w;
        size.h = h;
        canvas.width = w;
        canvas.height = h;
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return true;
    }

    function setGround(rgb) {
        ground = rgb;
    }

    /* `list` is [{ card, cx }] from the layout, already culled and in
       draw order. Positions arrive in stage pixels and are scaled here,
       so nothing upstream has to think about device ratio. */
    function render(list, centreY, speed = 0) {
        const { w, h, dpr } = size;
        gl.bindVertexArray(vao);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
        gl.viewport(0, 0, w, h);
        gl.clearColor(ground[0], ground[1], ground[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(cards.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(cards.uniforms.uRes, w, h);
        gl.uniform1i(cards.uniforms.uImage, 0);
        gl.uniform1f(cards.uniforms.uEdge, uniform.edge);
        gl.uniform3f(cards.uniforms.uGround, ground[0], ground[1], ground[2]);
        gl.activeTexture(gl.TEXTURE0);

        for (const entry of list) {
            const slot = textures.slots[entry.card.index];
            if (!slot || !slot.texture) continue;
            const cw = entry.card.w * dpr;
            const ch = entry.card.h * dpr;
            const cardAspect = entry.card.w / entry.card.h;

            /* Cover fit: the crop is taken from the middle, and the
               axis that is already right is left alone. */
            let sx = 1;
            let sy = 1;
            if (slot.aspect > cardAspect) sx = cardAspect / slot.aspect;
            else sy = slot.aspect / cardAspect;

            gl.bindTexture(gl.TEXTURE_2D, slot.texture);
            gl.uniform4f(cards.uniforms.uRect, (entry.cx - entry.card.w / 2) * dpr, (centreY - entry.card.h / 2) * dpr, cw, ch);
            gl.uniform2f(cards.uniforms.uCoverScale, sx, sy);
            gl.uniform2f(cards.uniforms.uCoverOffset, (1 - sx) / 2, (1 - sy) / 2);
            gl.uniform2f(cards.uniforms.uHair, (2.2 * dpr) / cw, (2.2 * dpr) / ch);
            gl.uniform1f(cards.uniforms.uFade, slot.fade);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        /* Unbound first: the texture the chain is being built from is
           this framebuffer's own colour attachment, and leaving it
           attached while it is written to is a feedback loop that some
           drivers will quietly get wrong. */
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.viewport(0, 0, w, h);
        gl.bindBuffer(gl.ARRAY_BUFFER, screen);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(glass.program);
        gl.uniform1i(glass.uniforms.uScene, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, warpTexture);
        gl.uniform1i(glass.uniforms.uWarp, 1);
        gl.uniform1f(glass.uniforms.uQuad, uniform.quad);
        gl.uniform1f(glass.uniforms.uMag, uniform.mag);
        gl.uniform1f(glass.uniforms.uDisp, uniform.disp);
        gl.uniform1f(glass.uniforms.uDispX, uniform.dispX);
        gl.uniform1f(glass.uniforms.uLodMax, uniform.lod);
        gl.uniform1f(glass.uniforms.uPivotNear, uniform.pivotNear);
        gl.uniform1f(glass.uniforms.uPivotRim, uniform.pivotRim);
        gl.uniform1f(glass.uniforms.uVignette, uniform.vignette);
        gl.uniform1f(glass.uniforms.uSurge, uniform.surge * Math.min(Math.abs(speed), 1));
        gl.activeTexture(gl.TEXTURE0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
    }

    /* Live knobs. The uniform table is the whole of the effect's
       tuning, and it is reachable from the console and from the
       verification harness so it can be fitted against numbers rather
       than against an opinion. */
    function tune(next) {
        Object.assign(uniform, next);
    }

    /* Deletes what it made and stops there. Forcing the context to be
       lost would hand the driver its memory back a moment sooner and
       cost far more than that: a lost context cannot be re-acquired
       from the same canvas, so a remount — which React does on every
       mount in development, and which any route change can do —  would
       find getContext returning the same dead context and paint
       nothing. The element is being discarded anyway. */
    function dispose() {
        textures.dispose();
        gl.deleteBuffer(quad);
        gl.deleteBuffer(screen);
        gl.deleteVertexArray(vao);
        gl.deleteTexture(sceneTexture);
        gl.deleteTexture(warpTexture);
        gl.deleteFramebuffer(frame);
        gl.deleteProgram(cards.program);
        gl.deleteProgram(glass.program);
    }

    return { gl, size, textures, resize, setGround, render, tune, uniform, dispose };
}
