import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/dom.js';

/* The empty stretch of the menu, put to use: a small pixel person who
   walks up to a brick wall, climbs it, slips once in a while, waves from
   the top, jumps off and goes round again.

   It is a canvas drawn one "pixel" at a time — PX css pixels square, the
   browser scaling the small bitmap up with image-rendering: pixelated —
   and there are no image files in it: the wall and the person are
   rectangles. It reads its colours from the stylesheet's own tokens, so
   it follows the theme toggle without being told about it.

   It only runs while the panel is open. Closed, the panel is behind the
   page and nobody can see it, so the loop is cancelled rather than left
   to burn frames under an opaque layer. For a reader who has asked for
   less motion it is a single still frame — mid-climb — and nothing
   moves at all.

   Where the space is too short to hold a wall and a person (a landscape
   phone, a small laptop window) nothing is drawn: the flex item simply
   shrinks to nothing, which is what an unused gap should do. */

const PX = 3;            /* css px per drawn pixel */
const CHAR_W = 5;
const CHAR_H = 9;
const WALL_W = 12;
const WALL_TOP = 11;     /* rows of headroom above the wall */
const MIN_COLS = 40;
const MIN_ROWS = 30;
const GRAVITY = 70;      /* rows per second per second */

function readColors(el) {
    const style = getComputedStyle(el);
    const get = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
        ink: get('--ink', '#000'),
        ground: get('--ink-3', '#6b6b6b'),
        brick: get('--rule-2', '#b9b9b9'),
        paper: get('--paper', '#fff'),
    };
}

function makeScene(cols, rows) {
    const groundY = rows - 1;
    const wallLeft = Math.round(cols * 0.6);
    const floorY = groundY - CHAR_H;           /* a person standing on the ground */
    return {
        cols,
        rows,
        groundY,
        wallLeft,
        floorY,
        baseX: wallLeft - CHAR_W,              /* hands on the wall's face */
        homeX: Math.max(1, wallLeft - CHAR_W - 24),
        climbTopY: WALL_TOP - 3,               /* head just over the ledge */
        standY: WALL_TOP - CHAR_H,             /* feet on top of the wall */
        topX: wallLeft + 3,
    };
}

function makeActor(sc) {
    return { mode: 'walk', t: 0, x: sc.homeX, y: sc.floorY, dir: 1, vx: 0, vy: 0, willSlip: false, slipAt: 0, slipTo: 0 };
}

function go(s, mode) {
    s.mode = mode;
    s.t = 0;
}

function step(s, sc, dt) {
    s.t += dt;

    switch (s.mode) {
        case 'walk':
            s.dir = 1;
            s.x += 14 * dt;
            if (s.x >= sc.baseX) {
                s.x = sc.baseX;
                s.willSlip = Math.random() < 0.65;
                s.slipAt = 0.3 + Math.random() * 0.4;
                go(s, 'climb');
            }
            break;

        case 'climb': {
            s.y -= 8 * dt;
            const progress = (sc.floorY - s.y) / (sc.floorY - sc.climbTopY);
            if (s.willSlip && progress >= s.slipAt) {
                s.willSlip = false;
                s.slipTo = Math.min(sc.floorY, s.y + 9);
                go(s, 'slip');
            } else if (s.y <= sc.climbTopY) {
                s.y = sc.climbTopY;
                go(s, 'mantle');
            }
            break;
        }

        case 'slip':
            s.y += 34 * dt;
            if (s.y >= s.slipTo) {
                s.y = s.slipTo;
                go(s, 'beat');
            }
            break;

        case 'beat':
            if (s.t > 0.45) go(s, 'climb');
            break;

        case 'mantle': {
            const k = Math.min(1, s.t / 0.4);
            s.x = sc.baseX + (sc.topX - sc.baseX) * k;
            s.y = sc.climbTopY + (sc.standY - sc.climbTopY) * k;
            if (k >= 1) {
                s.dir = -1;
                go(s, 'top');
            }
            break;
        }

        case 'top':
            if (s.t > 1.5) {
                /* Work out a jump that lands somewhere back near where
                   the walk began, whatever the height of the wall. */
                const target = sc.homeX + Math.random() * 8;
                const vy = -16;
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
                go(s, 'land');
            }
            break;

        case 'land':
            if (s.t > 0.35) go(s, 'walk');
            break;

        default:
            break;
    }
}

function sprite(ctx, col, s) {
    const x = Math.round(s.x);
    const y = Math.round(s.y);
    const rect = (rx, ry, w, h, color = col.ink) => {
        const fx = s.dir > 0 ? rx : CHAR_W - rx - w;
        ctx.fillStyle = color;
        ctx.fillRect(x + fx, y + ry, w, h);
    };

    const flip = Math.floor(s.t * (s.mode === 'walk' ? 8 : 5.5)) % 2;
    const squat = s.mode === 'land';
    const headY = squat ? 3 : 0;

    rect(1, headY, 3, 3);
    rect(3, headY + 1, 1, 1, col.paper);

    if (squat) {
        rect(0, 6, 5, 3);
        return;
    }

    rect(1, 3, 3, 3);

    switch (s.mode) {
        case 'walk':
            rect(0, 3, 1, 2);
            rect(4, 3, 1, 2);
            rect(1, 6, 1, flip ? 2 : 3);
            rect(3, 6, 1, flip ? 3 : 2);
            break;

        case 'climb':
        case 'mantle':
            if (flip) {
                rect(4, 3, 1, 2);
                rect(0, 0, 1, 3);
                rect(1, 6, 1, 2);
                rect(3, 6, 1, 3);
            } else {
                rect(4, 0, 1, 3);
                rect(0, 4, 1, 2);
                rect(1, 6, 1, 3);
                rect(3, 6, 1, 2);
            }
            break;

        case 'slip':
        case 'beat':
            rect(0, 0, 1, 3);
            rect(4, 0, 1, 3);
            rect(1, 6, 1, 3);
            rect(3, 6, 1, 3);
            /* An exclamation mark over the head. */
            rect(2, -4, 1, 2);
            rect(2, -1, 1, 1);
            break;

        case 'top':
            rect(0, 3, 1, 2);
            rect(4, flip ? 0 : 1, 1, flip ? 3 : 2);
            rect(1, 6, 1, 3);
            rect(3, 6, 1, 3);
            break;

        case 'fall':
            rect(0, 0, 1, 3);
            rect(4, 0, 1, 3);
            rect(0, 6, 1, 3);
            rect(4, 6, 1, 3);
            break;

        default:
            rect(0, 3, 1, 2);
            rect(4, 3, 1, 2);
            rect(1, 6, 1, 3);
            rect(3, 6, 1, 3);
            break;
    }
}

function draw(ctx, sc, s, col) {
    ctx.clearRect(0, 0, sc.cols, sc.rows);

    /* The wall: courses of bricks two rows tall with a row of mortar
       between them. The mortar is simply left unpainted, so the panel
       shows through it. */
    ctx.fillStyle = col.brick;
    for (let c = 0; WALL_TOP + c * 3 < sc.groundY; c += 1) {
        const y = WALL_TOP + c * 3;
        const h = Math.min(2, sc.groundY - y);
        ctx.fillRect(sc.wallLeft, y, WALL_W, h);
        for (let x = sc.wallLeft + (c % 2 ? 2 : 5); x < sc.wallLeft + WALL_W; x += 6) {
            ctx.clearRect(x, y, 1, h);
        }
    }

    ctx.fillStyle = col.ground;
    ctx.fillRect(0, sc.groundY, sc.cols, 1);

    sprite(ctx, col, s);
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
        let colorsAt = 0;
        let sc = null;
        let actor = null;
        let col = readColors(cv);

        const layout = () => {
            const cols = Math.floor(wrap.clientWidth / PX);
            const rows = Math.floor(wrap.clientHeight / PX);
            cv.width = cols;      /* also clears the bitmap */
            cv.height = rows;
            if (cols < MIN_COLS || rows < MIN_ROWS) {
                sc = null;
                return;
            }
            sc = makeScene(cols, rows);
            actor = makeActor(sc);
            if (reduced) {
                /* One still frame: halfway up the wall. */
                actor.mode = 'climb';
                actor.x = sc.baseX;
                actor.y = Math.round((sc.floorY + sc.climbTopY) / 2);
                col = readColors(cv);
                draw(ctx, sc, actor, col);
            }
        };

        const tick = (now) => {
            raf = window.requestAnimationFrame(tick);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (now - colorsAt > 500) {
                col = readColors(cv);
                colorsAt = now;
            }
            if (!sc) return;
            step(actor, sc, dt);
            draw(ctx, sc, actor, col);
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
