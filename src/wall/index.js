import { STRIDE, createRenderer } from './renderer.js';
import { aim, createField, press, ripple, settle, step } from './field.js';
import { ASKED, CREW, PICTURES, REEL, createPainter } from './pictures.js';
import { createCrew } from './crew.js';
import { clatter } from './sound.js';
import { intoSlab, lookAt, multiply, ortho, perspective, placement, project } from './mat.js';

const FOV = (5 * Math.PI) / 180;
const FOOT = 26;            /* css px under the wall, kept for the line it says */
const HOLD = 4.6;           /* seconds a picture is up */
const MIN_ROWS = 16;
const MIN_COLS = 10;

/* Laying the wall: four hands, a course every quarter sweep. */
const COURSE = 0.075;
const SWEEP = COURSE * 4;
const LEAD = 0.45;

/* The same bricks in both themes; only the room changes. All linear. */
const PAPER = [0.93, 0.93, 0.93];
/* Plain black, a hair off, in linear light. */
const INK = [0.008, 0.008, 0.008];
const ROOM = {
    light: { sky: 0.8, floor: 0.6, sun: 0.56, bed: 0.5 },
    dark: { sky: 0.42, floor: 0.2, sun: 0.9, bed: 0.0 },
};
const KEY = [-0.4, 0.72, 0.57];

const SPOTS = [[-0.5, 0.4], [0.45, -0.35], [0, 0.1], [-0.4, -0.4], [0.5, 0.45], [0.1, 0.5], [-0.55, 0], [0.5, -0.1]];
const QUARTERS = [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]];

const easeOut = (x) => 1 - (1 - x) ** 3;
const pad = (n) => String(n).padStart(2, '0');

export function createWall({ canvas, stage, count, say }, { face, built = false, onBuilt } = {}) {
    const renderer = createRenderer(canvas);
    if (!renderer) return null;

    const crew = createCrew(stage, CREW);
    const kit = { face: null };
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false, down: null };

    let dark = false;
    let width = 0, height = 0, pitch = 9, eye = 1, shift = 0, lift = 0;
    let front = 0.45;           /* where a resting brick's face is, in units */
    let field = null, paint = null, angles = null, glazes = null, born = null;

    let time = 0;
    let mode = built ? 'reel' : 'build';
    let laidFrom = -1;
    let showing = 'rest';
    let stamp = '';
    let turn = -1;              /* where in REEL the crew has got to */
    let dueAt = 0.5;
    let pending = null;
    let asked = null;
    const goals = [null, null, null, null];

    let tiltX = 0, tiltY = 0, lampX = 0, lampY = 0;
    let frame = 0, last = 0, running = false;

    const vp = new Float32Array(16);
    const mvp = new Float32Array(16);
    const lightVP = new Float32Array(16);
    const scene = {
        slab: new Float32Array(16), vp, lightVP,
        light: new Float32Array(3), eye: new Float32Array(3),
        dim: new Float32Array([0.95, 0.45, 0.45]), bedDim: new Float32Array(3),
        bedAt: new Float32Array(STRIDE), bedCount: 0,
        paper: new Float32Array(PAPER), ink: new Float32Array(INK), bed: new Float32Array(3),
        sky: new Float32Array(3), floor: new Float32Array(3), sun: new Float32Array(3),
        bevel: 0.085,
    };
    const v3 = new Float32Array(3), o3 = new Float32Array(3), d3 = new Float32Array(3);

    function caption(id) {
        const at = REEL.indexOf(id);
        count.textContent = at < 0 || !field ? '' : `${pad(at + 1)}/${pad(REEL.length)}`;
        say.textContent = field ? PICTURES[id].say : '';
    }

    function put(id, origins, delay) {
        showing = id;
        const picture = PICTURES[id];
        stamp = picture.stamp ? picture.stamp() : '';
        paint(picture, dark, kit, angles, glazes, time);
        aim(field, angles, glazes, origins || [[0, 0]], time, delay);
        if (!delay) settle(field);
        caption(id);
    }

    function room() {
        const r = ROOM[dark ? 'dark' : 'light'];
        scene.sky.fill(r.sky);
        scene.floor.fill(r.floor);
        scene.sun.fill(r.sun);
        scene.bed.fill(r.bed);
    }

    function size(w, h, ratio) {
        width = w;
        height = h;
        const dpr = Math.min(ratio || 1, 2);
        renderer.resize(w, h, dpr);
        const tall = h - FOOT;

        pitch = Math.round(Math.max(7.5, Math.min(9.6, tall / 40)) * dpr) / dpr;
        const rows = Math.floor((tall - 6) / pitch);
        const cols = Math.floor(w / pitch / 2);
        const joint = Math.max(1, Math.round(pitch * 0.1 * dpr)) / dpr / pitch;
        scene.dim.set([1 - joint / 2, 0.5 - joint / 2, 0.5 - joint / 2]);
        front = scene.dim[2];

        if (rows < MIN_ROWS || cols < MIN_COLS) {
            field = null;
            crew.clear();
            caption(showing);
            renderer.clear();
            return;
        }

        /* One unit is one course of pixels at the plane the faces are on. */
        const dist = h / pitch / 2 / Math.tan(FOV / 2);
        eye = front + dist;
        const left = (w - cols * 2 * pitch) / 2, top = (tall - rows * pitch) / 2;
        shift = (Math.round(left * dpr) / dpr - left) / pitch;
        lift = FOOT / pitch / 2 - (Math.round(top * dpr) / dpr - top) / pitch;
        multiply(perspective(FOV, w / h, dist * 0.7, dist * 1.4), lookAt([0, 0, eye], [0, 0, 0], [0, 1, 0]), vp);
        scene.eye.set([0, 0, eye]);

        if (field && field.rows === rows && field.cols === cols) return;
        const fresh = !field;
        field = createField(cols, rows);
        paint = createPainter(field);
        angles = new Float32Array(field.n);
        glazes = new Float32Array(field.n * 3);

        /* One bed strip a course, as wide as the bricks in it. */
        scene.bedAt = new Float32Array(rows * STRIDE);
        for (let r = 0; r < rows; r += 1) {
            const o = r * STRIDE;
            scene.bedAt.set([(field.lo[r] + field.hi[r]) / 2 - cols, r + 0.5 - rows / 2, -0.62, 0, 0, 1, 1, (field.hi[r] - field.lo[r]) / 2], o);
        }

        if (mode === 'build' && fresh && laidFrom < 0) {

            born = new Float32Array(field.n);
            for (let i = 0; i < field.n; i += 1) {
                const r = field.row[i];
                const along = (field.x[i] + cols) / (cols * 2);
                born[i] = LEAD + r * COURSE + (Math.floor(r / 4) % 2 ? 1 - along : along) * SWEEP;
                field.scale[i] = 0;
                field.drop[i] = 6;
            }
            put('rest', null, 0);
            for (let i = 0; i < field.n; i += 1) { field.scale[i] = 0; field.drop[i] = 6; }
            count.textContent = '';
            say.textContent = 'laying courses.';
        } else {

            if (mode === 'build') finish();
            put(showing, null, 0);
        }
    }

    function finish() {
        mode = 'reel';
        crew.clear();
        dueAt = time + 0.25;
        if (onBuilt) onBuilt();
    }

    function toStage(x, y, out) {
        project(mvp, x, y, front + 0.8, v3);
        out[0] = ((v3[0] + 1) / 2) * width;
        out[1] = ((1 - v3[1]) / 2) * height;
        return out;
    }

    function toWall(px, py, out) {
        const t = Math.tan(FOV / 2);
        intoSlab(scene.slab, 0, 0, eye, 1, o3);
        intoSlab(scene.slab, ((px / width) * 2 - 1) * t * (width / height), (1 - (py / height) * 2) * t, -1, 0, d3);
        const k = (front - o3[2]) / d3[2];
        out[0] = o3[0] + d3[0] * k;
        out[1] = o3[1] + d3[1] * k;
        return out;
    }

    function lay(dt) {
        const t = time - laidFrom;
        const { rows, cols } = field;
        for (let i = 0; i < field.n; i += 1) {
            if (field.scale[i] >= 1 || t < born[i]) continue;
            const x = (t - born[i]) / 0.36;
            if (x >= 1) {
                field.scale[i] = 1;
                field.drop[i] = 0;
            } else {
                const e = easeOut(x);
                field.scale[i] = 0.2 + 0.8 * e;
                field.drop[i] = (1 - e) * 6;
            }
        }
        const xy = [0, 0];
        for (let k = 0; k < 4; k += 1) {
            let r = Math.floor((t - LEAD) / COURSE);
            r -= (((r - k) % 4) + 4) % 4;
            if (r < 0 || r >= rows) {
                if (r >= rows) crew.show(k, false);
                continue;
            }
            let along = Math.min(1, Math.max(0, (t - LEAD - r * COURSE) / SWEEP));
            if (Math.floor(r / 4) % 2) along = 1 - along;
            toStage(-cols + along * cols * 2, r + 0.5 - rows / 2, xy);
            crew.send(k, xy[0], xy[1]);
            crew.show(k, true);
        }
        crew.tick(dt, time, 24);
        if (t >= LEAD + (rows - 1) * COURSE + SWEEP + 0.45) finish();
    }

    function plan(n) {
        const id = REEL[n];
        if (id === 'face' && !kit.face) { turn = n; return; }
        const { by } = PICTURES[id];
        const who = by === 'all' ? [0, 1, 2, 3] : by === null ? [] : [by];
        const spots = by === 'all' ? QUARTERS : [SPOTS[n % SPOTS.length]];
        const origins = spots.map(([x, y]) => [x * field.cols * 1.2, y * field.rows * 0.6]);
        who.forEach((k, j) => {
            goals[k] = origins[j];
            crew.show(k, true, time + 0.85 + 1.4);
        });
        pending = { n, at: time + (who.length ? 0.85 : 0), origins, who };
    }

    function direct(dt) {
        if (asked) {
            if (showing !== asked) {
                pending = null;
                crew.clear();
                put(asked, [[-field.cols + 3, field.rows / 2]], 0.024);
            }
        } else {
            if (!pending && time >= dueAt) plan((turn + 1) % REEL.length);
            if (pending && time >= pending.at) {
                turn = pending.n;
                put(REEL[turn], pending.origins, 0.03);
                pending.who.forEach((k) => crew.press(k));
                pending = null;
                dueAt = time + HOLD + (PICTURES[showing].live ? 2.4 : 0);
            }
        }

        const picture = PICTURES[showing];
        if (picture.live) {

            paint(picture, dark, kit, angles, glazes, time);
            for (let i = 0; i < field.n; i += 1) {
                if (field.nextAt[i] > 0) field.next[i] = angles[i];
                else field.goal[i] = angles[i];
            }
        } else if (picture.stamp && picture.stamp() !== stamp) {
            put(showing, [[0, 0]], 0.02);
        }

        const xy = [0, 0];
        crew.hands.forEach((hand, k) => {
            if (!hand.on || !goals[k]) return;
            toStage(goals[k][0], goals[k][1], xy);
            crew.send(k, xy[0], xy[1]);
        });
        crew.tick(dt, time, 5.5);
    }

    function draw(dt) {

        const gx = pointer.inside ? pointer.nx * 0.2 : 0;
        const gy = pointer.inside ? pointer.ny * 0.1 : 0;
        const k = dt ? Math.min(1, dt * 4) : 1;
        tiltY += (gx - tiltY) * k;
        tiltX += (gy - tiltX) * k;
        lampX += ((pointer.inside ? pointer.nx : 0) - lampX) * k;
        lampY += ((pointer.inside ? pointer.ny : 0) - lampY) * k;

        placement(tiltY, tiltX, shift, lift, scene.slab);
        multiply(vp, scene.slab, mvp);

        const { rows, cols } = field;
        const up = mode === 'build' && laidFrom >= 0
            ? Math.min(rows, Math.max(0, (time - laidFrom - LEAD) / COURSE - 2))
            : mode === 'build' ? 0 : rows;
        scene.bedDim.set([1, 0.505, 0.04]);
        scene.bedCount = Math.min(rows, Math.floor(up));

        const lx = KEY[0] + lampX * 0.42, ly = KEY[1] - lampY * 0.3, lz = KEY[2];
        const ll = Math.hypot(lx, ly, lz);
        scene.light[0] = lx / ll; scene.light[1] = ly / ll; scene.light[2] = lz / ll;
        const reach = Math.hypot(field.cols, field.rows / 2) + 3;
        multiply(
            ortho(-reach, reach, -reach, reach, 1, 160),
            lookAt([scene.light[0] * 80, scene.light[1] * 80 + lift, scene.light[2] * 80], [0, lift, 0], [0, 1, 0]),
            lightVP,
        );

        renderer.draw(field.data, field.n, scene);
    }

    function tick(dt) {
        if (!field) return;
        time += dt;

        if (mode === 'build') {
            if (laidFrom < 0) laidFrom = time;
            lay(dt);
        } else {
            direct(dt);
        }

        if (pointer.inside || pointer.down) {
            placement(tiltY, tiltX, shift, lift, scene.slab);
            const at = [0, 0];
            if (pointer.down) {
                toWall(pointer.down[0], pointer.down[1], at);
                ripple(field, at[0], at[1], time);
                pointer.down = null;
            }
            if (pointer.inside) {
                toWall(pointer.x, pointer.y, at);
                press(field, at[0], at[1], time);
            }
        }

        step(field, dt, time);
        draw(dt);
    }

    function loop(now) {
        frame = window.requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        tick(dt);
    }

    function move(e) {
        const r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.nx = (pointer.x / r.width) * 2 - 1;
        pointer.ny = (pointer.y / r.height) * 2 - 1;
        pointer.inside = true;
    }
    function leave() { pointer.inside = false; }
    function down(e) {
        move(e);
        pointer.down = [pointer.x, pointer.y];
        if (running && field) clatter();
        /* A finger has no hover to end: let go of the wall when it lifts. */
        if (e.pointerType !== 'mouse') pointer.inside = false;
    }
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('pointerdown', down);

    function redraw(ids) {
        if (!field || !ids.includes(showing)) return;
        put(showing, [[0, 0]], running ? 0.02 : 0);
        if (!running) { step(field, 0, time); draw(0); }
    }
    if (face) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { kit.face = img; redraw(['face']); };
        img.src = face;
    }
    if (document.fonts && document.fonts.load) {
        Promise.all([
            document.fonts.load('italic 40px Castoro'),
            document.fonts.load('40px Castoro'),
        ]).then(() => redraw(['hi', 'type', 'clock']), () => {});
    }

    room();

    return {
        size,

        theme(isDark) {
            if (isDark === dark) return;
            dark = isDark;
            room();
            if (!field) return;
            /* From the corner the toggle is in. */
            put(showing, [[field.cols, field.rows / 2]], running ? 0.026 : 0);
            if (!running) { step(field, 0, time); draw(0); }
        },

        ask(section) {
            const id = (section && ASKED[section]) || null;
            if (id === asked) return;
            if (asked && !id) dueAt = time + 1.3;
            asked = id;
        },

        start() {
            if (running) return;
            running = true;
            last = performance.now();
            frame = window.requestAnimationFrame(loop);
        },

        stop() {
            running = false;
            window.cancelAnimationFrame(frame);
            pointer.inside = false;
        },

        still() {
            if (!field) return;
            if (mode === 'build') finish();
            put('hi', null, 0);
            step(field, 0, time);
            draw(0);
        },

        dispose() {
            running = false;
            window.cancelAnimationFrame(frame);
            canvas.removeEventListener('pointermove', move);
            canvas.removeEventListener('pointerleave', leave);
            canvas.removeEventListener('pointerdown', down);
            crew.dispose();
            renderer.dispose();
        },
    };
}
