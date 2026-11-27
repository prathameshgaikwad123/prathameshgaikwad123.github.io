import { useEffect, useRef } from 'react';
import { activeTheme, onMedia, useReducedMotion } from '../hooks/dom.js';

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
                    { built: laid(), onBuilt: remember },
                );
                wall.current = made || false;
                if (made) run(made);
            }, () => {

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
