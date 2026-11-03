import { useEffect, useRef } from 'react';
import { activeTheme, useReducedMotion } from '../hooks/dom.js';
import { COLORS, CYCLES, FRAMES, SPRITE_H, SPRITE_W } from './climber/art.js';
import { MIN_COLS, MIN_ROWS, buildScene } from './climber/scene.js';

/* The empty stretch of the menu, put to use: a small pixel person on a
   building site who walks up to an unfinished brick wall, climbs its
   toothed end, slips now and then, cheers and waves from the top, jumps
   off and goes round again.

   It is a canvas drawn one "pixel" at a time — PX css pixels square, the
   browser scaling the small bitmap up with image-rendering: pixelated.
   There are no image files in it. The set (wall, grass, spare bricks) is
   painted once into an off-screen bitmap by ./climber/scene.js and
   copied under the person every frame; the person is assembled from the
   art in ./climber/art.js.

   It only runs while the panel is open. Closed, the panel is behind the
   page and nobody can see it, so the loop is cancelled rather than left
   to burn frames under an opaque layer. For a reader who has asked for
   less motion it is a single still frame — mid-climb — and nothing moves.

   Where the space is too short to hold a wall and a person (a landscape
   phone, a small laptop window) nothing is drawn: the flex item simply
   shrinks to nothing, which is what an unused gap should do. */

const PX = 2;            /* css px per drawn pixel */
/* Speeds below were tuned at 3 css px per pixel; K keeps them the same
   on screen at any other size. */
const K = 3 / PX;
const GRAVITY = 70 * K;  /* rows per second per second */

const DUST = ['#d9cfbc', '#c2b79f', '#e8e0d0'];
const CRUMBS = ['#b8382c', '#e0654c', '#7a2119', '#d9cfbc'];

function makeActor(sc) {
    return {
        mode: 'walk', t: 0, x: sc.homeX, y: sc.floorY, dir: 1,
        vx: 0, vy: 0, willSlip: false, slipAt: 0, slipTo: 0, parts: [],
    };
}

function go(s, mode) {
    s.mode = mode;
    s.t = 0;
}

function burst(s, x, y, colors, n, spread, lift) {
    for (let i = 0; i < n; i += 1) {
        s.parts.push({
            x,
            y,
            vx: (Math.random() - 0.5) * spread,
            vy: -Math.random() * lift,
            life: 0.35 + Math.random() * 0.35,
            c: colors[Math.floor(Math.random() * colors.length)],
        });
    }
}

function step(s, sc, dt) {
    s.t += dt;

    switch (s.mode) {
        case 'walk':
            s.dir = 1;
            if (s.t < 0.5) break;            /* look at the wall a moment */
            s.x += 14 * K * dt;
            if (s.x >= sc.baseX) {
                s.x = sc.baseX;
                s.willSlip = Math.random() < 0.65;
                s.slipAt = 0.3 + Math.random() * 0.4;
                go(s, 'climb');
            }
            break;

        case 'climb': {
            s.y -= 8 * K * dt;
            const climbTop = sc.standY + 8;
            const progress = (sc.floorY - s.y) / (sc.floorY - climbTop);
            if (s.willSlip && progress >= s.slipAt) {
                s.willSlip = false;
                s.slipTo = Math.min(sc.floorY, s.y + Math.round(9 * K));
                burst(s, s.x + 9, s.y + 3, CRUMBS, 7, 14 * K, 6 * K);
                go(s, 'slip');
            } else if (s.y <= climbTop) {
                s.y = climbTop;
                go(s, 'mantle');
            }
            break;
        }

        case 'slip':
            s.y += 34 * K * dt;
            if (s.y >= s.slipTo) {
                s.y = s.slipTo;
                go(s, 'beat');
            }
            break;

        case 'beat':
            if (s.t > 0.5) go(s, 'climb');
            break;

        case 'mantle': {
            const k = Math.min(1, s.t / 0.45);
            const climbTop = sc.standY + 8;
            s.x = sc.baseX + (sc.topX - sc.baseX) * k;
            s.y = climbTop + (sc.standY - climbTop) * k - Math.sin(k * Math.PI) * 4;
            if (k >= 1) {
                s.y = sc.standY;
                s.dir = -1;
                go(s, 'cheer');
            }
            break;
        }

        case 'cheer':
            if (s.t > 0.9) go(s, 'wave');
            break;

        case 'wave':
            if (s.t > 1.3) {
                /* A jump that lands back near where the walk began,
                   whatever the height of the wall. */
                const target = sc.homeX + Math.random() * 8 * K;
                const vy = -16 * K;
                const drop = sc.floorY - s.y;
                const flight = (-vy + Math.sqrt(vy * vy + 2 * GRAVITY * drop)) / GRAVITY;
                s.vx = (target - s.x) / flight;
                s.vy = vy;
                go(s, 'fall');
            }
            break;

        case 'fall':
            s.vy += GRAVITY * dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            if (s.y >= sc.floorY && s.vy > 0) {
                s.y = sc.floorY;
                burst(s, s.x + 5, sc.groundY - 1, DUST, 9, 26 * K, 7 * K);
                go(s, 'land');
            }
            break;

        case 'land':
            if (s.t > 0.4) go(s, 'walk');
            break;

        default:
            break;
    }

    /* Dust and crumbs. */
    s.parts = s.parts.filter((p) => {
        p.life -= dt;
        p.vy += GRAVITY * 0.6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0 && p.y < sc.groundY;
    });
}

function poseOf(s) {
    const cycle = (names, rate) => names[Math.floor(s.t * rate) % names.length];
    switch (s.mode) {
        case 'walk': return s.t < 0.5 ? 'stand' : cycle(CYCLES.walk, 8);
        case 'climb': return cycle(CYCLES.climb, 5.5);
        case 'mantle': return 'climbB';
        case 'slip':
        case 'beat': return 'slip';
        case 'cheer': return cycle(CYCLES.cheer, 6);
        case 'wave': return cycle(CYCLES.cheer, 4);
        case 'fall': return 'air';
        case 'land': return 'crouch';
        default: return 'stand';
    }
}

function drawSprite(ctx, frameName, x, y, dir) {
    const rows = FRAMES[frameName];
    const px = Math.round(x);
    const py = Math.round(y);
    for (let j = 0; j < rows.length; j += 1) {
        const row = rows[j];
        for (let i = 0; i < SPRITE_W; i += 1) {
            const c = row[i];
            if (c === '.') continue;
            ctx.fillStyle = COLORS[c];
            ctx.fillRect(px + (dir > 0 ? i : SPRITE_W - 1 - i), py + j, 1, 1);
        }
    }
}

function drawSparkle(ctx, x, y, size) {
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(x, y, 1, 1);
    if (size > 0) {
        ctx.fillRect(x - 1, y, 1, 1);
        ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1);
        ctx.fillRect(x, y + 1, 1, 1);
    }
}

function draw(ctx, sc, s) {
    ctx.clearRect(0, 0, sc.cols, sc.rows);
    ctx.drawImage(sc.layer, 0, 0);

    const px = Math.round(s.x);
    const py = Math.round(s.y);

    /* A shadow on the grass while their feet are near it. */
    const clearance = sc.groundY - (py + SPRITE_H);
    if (clearance < 14 && s.x < sc.x0 - 4) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fillRect(px + 1, sc.groundY, SPRITE_W - 1, 1);
    }

    drawSprite(ctx, poseOf(s), s.x, s.y, s.dir);

    /* The exclamation mark of somebody who has just lost their grip. */
    if (s.mode === 'slip' || (s.mode === 'beat' && s.t < 0.35)) {
        ctx.fillStyle = '#e63946';
        ctx.fillRect(px + 5, py - 6, 1, 3);
        ctx.fillRect(px + 5, py - 2, 1, 1);
    }

    /* Stars round somebody who has made it to the top. */
    if (s.mode === 'cheer' || s.mode === 'wave') {
        const tw = Math.floor(s.t * 5);
        drawSparkle(ctx, px - 3, py + 2, tw % 2);
        drawSparkle(ctx, px + 13, py + 5, (tw + 1) % 2);
        if (s.mode === 'cheer') drawSparkle(ctx, px + 6, py - 4, tw % 2);
    }

    for (let i = 0; i < s.parts.length; i += 1) {
        const p = s.parts[i];
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
}

export default function MenuClimber({ open }) {
    const box = useRef(null);
    const canvas = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        const wrap = box.current;
        const cv = canvas.current;
        if (!wrap || !cv) return undefined;
        const ctx = cv.getContext('2d');
        if (!ctx) return undefined;

        let raf = 0;
        let last = 0;
        let themeAt = 0;
        let dark = activeTheme() === 'dark';
        let sc = null;
        let actor = null;

        const layout = () => {
            const cols = Math.floor(wrap.clientWidth / PX);
            const rows = Math.floor(wrap.clientHeight / PX);
            cv.width = cols;      /* also clears the bitmap */
            cv.height = rows;
            if (cols < MIN_COLS || rows < MIN_ROWS) {
                sc = null;
                return;
            }
            dark = activeTheme() === 'dark';
            sc = buildScene(cols, rows, dark);
            actor = makeActor(sc);
            if (reduced) {
                /* One still frame: halfway up the wall. */
                actor.mode = 'climb';
                actor.x = sc.baseX;
                actor.y = Math.round((sc.floorY + sc.standY + 8) / 2);
                draw(ctx, sc, actor);
            }
        };

        const tick = (now) => {
            raf = window.requestAnimationFrame(tick);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!sc) return;

            /* The mortar is the one colour that depends on the theme, so
               the set is repainted if the toggle is pressed while the
               panel is open. */
            if (now - themeAt > 400) {
                themeAt = now;
                const nowDark = activeTheme() === 'dark';
                if (nowDark !== dark) {
                    dark = nowDark;
                    sc = buildScene(cv.width, cv.height, dark);
                }
            }

            step(actor, sc, dt);
            draw(ctx, sc, actor);
        };

        layout();
        let observer = null;
        if (typeof ResizeObserver === 'function') {
            observer = new ResizeObserver(layout);
            observer.observe(wrap);
        }

        if (open && !reduced) {
            last = performance.now();
            raf = window.requestAnimationFrame(tick);
        }

        return () => {
            window.cancelAnimationFrame(raf);
            if (observer) observer.disconnect();
        };
    }, [open, reduced]);

    return (
        <div className="menu__climb" data-menu-reveal="s" aria-hidden="true" ref={box}>
            <canvas ref={canvas} />
        </div>
    );
}
