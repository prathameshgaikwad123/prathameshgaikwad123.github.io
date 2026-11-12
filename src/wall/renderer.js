import { BRICK_FRAG, BRICK_VERT, DEPTH_FRAG, DEPTH_VERT } from './shaders.js';

/* ===================================================================
   THE WALL'S RENDERER
   -------------------------------------------------------------------
   WebGL2, by hand, like the carousel's — and for the same reason: the
   scene is one box drawn a few hundred times, which is less than any
   library would charge to describe it.

     pass one   every brick, from the light, into a depth texture
     pass two   the bed and every brick, from the camera, reading that
                texture back for the shadows they throw on each other

   Two draw calls a pass. Everything that changes from frame to frame is
   in one buffer of twelve floats a brick, which the simulation fills
   and this file uploads; the box itself is thirty-six vertices that
   never change.
   =================================================================== */

export const STRIDE = 12;       /* floats per brick in the instance buffer */
const SHADOW = 1024;

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

function link(gl, vertexSource, fragmentSource, names) {
    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(log || 'program failed to link');
    }
    const at = {};
    names.forEach((name) => { at[name] = gl.getUniformLocation(program, name); });
    return { program, at };
}

/* The box: six faces, each with the normal it was authored with, its
   own two axes and its own coordinates across them, so the fragment
   shader knows which face it is on and how far it is from an edge.
   Wound anticlockwise seen from outside. */
function box() {
    const faces = [
        [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
        [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
        [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
        [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
        [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
    ];
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
    const out = [];
    faces.forEach(([n, t, b]) => {
        corners.forEach(([u, v]) => {
            out.push(
                (n[0] + t[0] * u + b[0] * v) / 2, (n[1] + t[1] * u + b[1] * v) / 2, (n[2] + t[2] * u + b[2] * v) / 2,
                n[0], n[1], n[2], u, v, t[0], t[1], t[2], b[0], b[1], b[2],
            );
        });
    });
    return new Float32Array(out);
}

export function createRenderer(canvas) {
    const gl = canvas.getContext('webgl2', {
        alpha: true, antialias: true, premultipliedAlpha: true, depth: true,
        stencil: false, powerPreference: 'default',
    });
    if (!gl) return null;

    let brick;
    let depth;
    try {
        brick = link(gl, BRICK_VERT, BRICK_FRAG, [
            'uSlab', 'uDim', 'uVP', 'uLightVP', 'uShadow', 'uTexel', 'uLight', 'uEye',
            'uPaper', 'uInk', 'uBed', 'uSky', 'uFloor', 'uSun', 'uBevel', 'uMode',
        ]);
        depth = link(gl, DEPTH_VERT, DEPTH_FRAG, ['uSlab', 'uDim', 'uLightVP']);
    } catch (error) {
        return null;
    }

    const mesh = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
    gl.bufferData(gl.ARRAY_BUFFER, box(), gl.STATIC_DRAW);

    /* One vertex array per instance buffer: the bricks', which is
       rewritten every frame, and the bed's, which is one record. */
    function array(instances) {
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh);
        const size = 14 * 4;
        [[0, 3, 0], [1, 3, 12], [2, 2, 24], [3, 3, 32], [4, 3, 44]].forEach(([loc, count, offset]) => {
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, count, gl.FLOAT, false, size, offset);
        });
        gl.bindBuffer(gl.ARRAY_BUFFER, instances);
        [[5, 0], [6, 16], [7, 32]].forEach(([loc, offset]) => {
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, STRIDE * 4, offset);
            gl.vertexAttribDivisor(loc, 1);
        });
        gl.bindVertexArray(null);
        return vao;
    }

    const bricks = gl.createBuffer();
    const bed = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bed);
    gl.bufferData(gl.ARRAY_BUFFER, STRIDE * 4, gl.DYNAMIC_DRAW);
    let bedCapacity = STRIDE;
    const bricksArray = array(bricks);
    const bedArray = array(bed);
    let capacity = 0;

    const shadow = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, SHADOW, SHADOW, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    const target = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadow, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);

    return {
        resize(width, height, ratio) {
            const w = Math.max(1, Math.round(width * ratio));
            const h = Math.max(1, Math.round(height * ratio));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        },

        clear() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        },

        /* `scene` is everything about the frame that is not a brick:
           the three matrices, the light, the eye, the brick's and the
           bed's half extents, and the palette — all in linear light. */
        draw(data, count, scene) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bricks);
            if (count > capacity) {
                gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
                capacity = count;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, count * STRIDE);

            /* From the light. Back faces only, so a face never shadows
               itself. */
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            gl.viewport(0, 0, SHADOW, SHADOW);
            gl.clear(gl.DEPTH_BUFFER_BIT);
            gl.cullFace(gl.FRONT);
            gl.useProgram(depth.program);
            gl.uniformMatrix4fv(depth.at.uSlab, false, scene.slab);
            gl.uniformMatrix4fv(depth.at.uLightVP, false, scene.lightVP);
            gl.uniform3fv(depth.at.uDim, scene.dim);
            gl.bindVertexArray(bricksArray);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, count);

            /* From the camera. */
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.cullFace(gl.BACK);
            gl.useProgram(brick.program);
            const at = brick.at;
            gl.uniformMatrix4fv(at.uSlab, false, scene.slab);
            gl.uniformMatrix4fv(at.uVP, false, scene.vp);
            gl.uniformMatrix4fv(at.uLightVP, false, scene.lightVP);
            gl.uniform3fv(at.uLight, scene.light);
            gl.uniform3fv(at.uEye, scene.eye);
            gl.uniform3fv(at.uPaper, scene.paper);
            gl.uniform3fv(at.uInk, scene.ink);
            gl.uniform3fv(at.uBed, scene.bed);
            gl.uniform3fv(at.uSky, scene.sky);
            gl.uniform3fv(at.uFloor, scene.floor);
            gl.uniform3fv(at.uSun, scene.sun);
            gl.uniform1f(at.uBevel, scene.bevel);
            gl.uniform1f(at.uTexel, 1 / SHADOW);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, shadow);
            gl.uniform1i(at.uShadow, 0);

            /* The bed: a strip a course, as wide as that course has been
               laid, so a ragged edge shows what is behind it, not a slab. */
            gl.bindBuffer(gl.ARRAY_BUFFER, bed);
            if (scene.bedAt.length > bedCapacity) {
                gl.bufferData(gl.ARRAY_BUFFER, scene.bedAt.byteLength, gl.DYNAMIC_DRAW);
                bedCapacity = scene.bedAt.length;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, scene.bedAt, 0, scene.bedCount * STRIDE);
            gl.uniform1i(at.uMode, 1);
            gl.uniform3fv(at.uDim, scene.bedDim);
            gl.bindVertexArray(bedArray);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, scene.bedCount);

            gl.uniform1i(at.uMode, 0);
            gl.uniform3fv(at.uDim, scene.dim);
            gl.bindVertexArray(bricksArray);
            gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, count);
            gl.bindVertexArray(null);
        },

        dispose() {
            gl.deleteBuffer(mesh);
            gl.deleteBuffer(bricks);
            gl.deleteBuffer(bed);
            gl.deleteVertexArray(bricksArray);
            gl.deleteVertexArray(bedArray);
            gl.deleteTexture(shadow);
            gl.deleteFramebuffer(target);
            gl.deleteProgram(brick.program);
            gl.deleteProgram(depth.program);
            /* Not loseContext(): under React's double mount the canvas
               is the same element, and a context lost on purpose is the
               one the next mount would be handed back. */
        },
    };
}
