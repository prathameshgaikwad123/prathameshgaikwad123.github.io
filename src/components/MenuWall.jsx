import { useEffect, useRef } from 'react';
import { activeTheme, onMedia, useReducedMotion } from '../hooks/dom.js';

/* The stretch of the menu between the rows and the foot, put to use: a
   wall of bricks that turn — paper on one face, ink on the next, a
   glaze behind — and draw whatever they are told by stopping part way.
   What it is told, and by whom, is at the head of src/wall/index.js.
   This file is only the wall's place in the document, and its manners.

   Nothing of it is in any page's first load. The code is fetched the
   first time the panel is opened and not before, so a reader who never
   opens the menu never pays for it; and it is written against WebGL2
   directly, like the carousel, so what is fetched is the wall and not
   a library with the wall inside it.

   It runs only while the panel is open. Closed, the panel is behind an
   opaque page and nobody can see it, so the loop is stopped rather than
   left to burn frames under it. For a reader who has asked for less
   motion there is no loop at all: one frame, the wall standing, saying
   hello.

   The four rows of the navigation are its switches. It listens for the
   pointer and the focus arriving on a row and reads the section off the
   row's own href, so the panel does not have to know the wall is there
   and a fifth row would need nothing done here.

   The wall is laid, course by course, the first time the panel is
   opened in a visit — and only then. That is remembered for the length
   of the tab, across pages, because being made to watch a wall go up
   again on every case study would turn a welcome into a wait.

   Where the browser has no WebGL2, or the room is too short to hold
   enough courses to draw with, nothing is drawn and nothing is said. */

const FACE = '/assets/images/wall-face.png';
const LAID = 'wall-laid';

function laid() {
    try {
        return window.sessionStorage.getItem(LAID) === '1';
    } catch (error) {
        return false;
    }
}

function remember() {
    try {
        window.sessionStorage.setItem(LAID, '1');
    } catch (error) {
        /* A tab that will not keep it lays the wall again. */
    }
}

export default function MenuWall({ open }) {
    const box = useRef(null);
    const canvas = useRef(null);
    const stage = useRef(null);
    const count = useRef(null);
    const say = useRef(null);
    /* null until the panel is first opened; false if it was tried and
       the browser would not have it. */
    const wall = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => () => {
        if (wall.current) wall.current.dispose();
        wall.current = null;
    }, []);

    useEffect(() => {
        const el = box.current;
        if (!open || !el) return undefined;
        let alive = true;
        let undo = () => {};

        const run = (w) => {
            const fit = () => {
                w.size(el.clientWidth, el.clientHeight, window.devicePixelRatio || 1);
                if (reduced) w.still();
            };
            const tint = () => w.theme(activeTheme() === 'dark');

            /* The section a row leads to, read off the row. */
            const row = (e) => {
                const link = e.target && e.target.closest ? e.target.closest('.menu__link') : null;
                return link ? (link.getAttribute('href') || '').split('#')[1] || null : null;
            };
            const over = (e) => { const id = row(e); if (id) w.ask(id); };
            const out = (e) => { if (row(e)) w.ask(null); };

            tint();
            fit();

            const menu = el.closest('.menu');
            const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
            if (resize) resize.observe(el);
            const attr = new MutationObserver(tint);
            attr.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
            const system = onMedia(window.matchMedia('(prefers-color-scheme: dark)'), tint);
            if (menu) {
                menu.addEventListener('pointerover', over);
                menu.addEventListener('pointerout', out);
                menu.addEventListener('focusin', over);
                menu.addEventListener('focusout', out);
            }
            if (!reduced) w.start();

            undo = () => {
                w.stop();
                w.ask(null);
                if (resize) resize.disconnect();
                attr.disconnect();
                system();
                if (menu) {
                    menu.removeEventListener('pointerover', over);
                    menu.removeEventListener('pointerout', out);
                    menu.removeEventListener('focusin', over);
                    menu.removeEventListener('focusout', out);
                }
            };
        };

        if (wall.current) {
            run(wall.current);
        } else if (wall.current === null) {
            import('../wall/index.js').then(({ createWall }) => {
                if (!alive || wall.current) return;
                const made = createWall(
                    { canvas: canvas.current, stage: stage.current, count: count.current, say: say.current },
                    { face: FACE, built: laid(), onBuilt: remember },
                );
                wall.current = made || false;
                if (made) run(made);
            }, () => {
                /* A chunk that never arrived is a wall that is not
                   there, and the panel is complete without it. */
            });
        }

        return () => {
            alive = false;
            undo();
        };
    }, [open, reduced]);

    return (
        <div className="menu__wall" data-menu-reveal="s" aria-hidden="true" ref={box}>
            <canvas ref={canvas} />
            <div className="menu__wall-crew" ref={stage} />
            <p className="menu__wall-says">
                <span ref={count} />
                <b ref={say} />
            </p>
        </div>
    );
}
