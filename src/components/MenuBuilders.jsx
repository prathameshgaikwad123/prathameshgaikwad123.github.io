import { useEffect, useRef } from 'react';
import { activeTheme, useReducedMotion } from '../hooks/dom.js';
import { MIN_COLS, MIN_ROWS, buildScene } from './builders/scene.js';
import { createSim, drawSim, finish, stepSim } from './builders/sim.js';

/* The empty stretch of the menu, put to use: a building crew of three
   finishing a brick wall. One takes bricks off a pile and throws them up
   a line of two more standing on a scaffold, and the last of them throws
   each into its gap in the wall, until the wall is done and they
   cheer. Then the wall comes apart and they begin again.

   It is a canvas drawn one "pixel" at a time — PX css pixels square, the
   browser scaling the small bitmap up with image-rendering: pixelated.
   There are no image files in it. The set is painted once off-screen by
   ./builders/scene.js and copied under the crew every frame; the crew is
   assembled from the art in ./builders/art.js and moved by the
   simulation in ./builders/sim.js.

   It only runs while the panel is open. Closed, the panel is behind the
   page and nobody can see it, so the loop is cancelled rather than left
   to burn frames under an opaque layer. For a reader who has asked for
   less motion it is a single still frame — the wall finished, the crew
   cheering — and nothing moves.

   Where the space is too short to hold a wall and a crew (a landscape
   phone, a small laptop window) nothing is drawn. */

const PX = 2;            /* css px per drawn pixel */

export default function MenuBuilders({ open }) {
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
        let sim = null;

        const layout = () => {
            const cols = Math.floor(wrap.clientWidth / PX);
            const rows = Math.floor(wrap.clientHeight / PX);
            cv.width = cols;      /* also clears the bitmap */
            cv.height = rows;
            if (cols < MIN_COLS || rows < MIN_ROWS) {
                sim = null;
                return;
            }
            dark = activeTheme() === 'dark';
            sim = createSim(buildScene(cols, rows, dark));
            if (reduced) {
                finish(sim);
                drawSim(ctx, sim);
            }
        };

        const tick = (now) => {
            raf = window.requestAnimationFrame(tick);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!sim) return;

            /* The mortar is the one colour that depends on the theme, so
               the set is repainted if the toggle is pressed while the
               panel is open. */
            if (now - themeAt > 400) {
                themeAt = now;
                const nowDark = activeTheme() === 'dark';
                if (nowDark !== dark) {
                    dark = nowDark;
                    /* Same set, same slots, same bricks landed: only the
                       paint is swapped. */
                    const fresh = buildScene(cv.width, cv.height, dark);
                    sim.sc.layer = fresh.layer;
                    fresh.slots.forEach((s, i) => { sim.sc.slots[i].canvas = s.canvas; });
                }
            }

            stepSim(sim, dt);
            drawSim(ctx, sim);
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
