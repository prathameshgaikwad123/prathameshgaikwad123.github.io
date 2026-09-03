import { useEffect } from 'react';
import { rafOnce } from './dom.js';

function offsetTop(el) {
    let y = 0;
    let node = el;
    while (node) {
        y += node.offsetTop;
        node = node.offsetParent;
    }
    return y;
}

/* The floating plates gather ground, the scroll progress fills, and the
   section the reader is in marks itself in the navigation panel. Which
   band that is gets decided once per frame, from a single line three
   tenths of the way down the viewport.

   All of this is written straight to the DOM rather than held in state: it
   runs on every scroll frame, and re-rendering the whole page for it would
   be both slower and — for aria-current — a change of behaviour.

   There is one navigation now, so there is one place to mark. The plate
   used to carry a copy of the section list with a travelling ground under
   the current link, and this hook used to place it; both are gone, and
   what is left is the panel's own links, found by the .menu__link class
   they have always carried. */
export default function useChrome() {
    useEffect(() => {
        const masthead = document.getElementById('masthead');
        const progress = document.getElementById('progress');

        const navLinks = [].slice.call(document.querySelectorAll('.menu__link[href^="#"]'));

        const spy = [];
        navLinks.forEach((link) => {
            const id = (link.getAttribute('href') || '').replace(/^#/, '');
            if (!id) return;
            const section = document.getElementById(id);
            if (!section || section === document.body) return;
            if (spy.indexOf(section) === -1) spy.push(section);
        });

        if (!masthead && !progress && !spy.length) return undefined;

        const paintSpy = () => {
            if (!spy.length) return;

            const line = window.scrollY + window.innerHeight * 0.3;
            const bottom =
                window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
            let active = null;

            for (let i = 0; i < spy.length; i++) {
                if (bottom || offsetTop(spy[i]) <= line) active = spy[i];
            }

            /* Above the first section nothing is in view, and the
               navigation panel has a link for exactly that — the top of
               the page. It is marked by attribute rather than by href
               because #top is the body, which is not a section and is
               not spied on. */
            const id = active ? active.id : null;
            navLinks.forEach((link) => {
                const on = id
                    ? link.getAttribute('href') === `#${id}`
                    : link.hasAttribute('data-nav-home');
                if (on) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        };

        let solid = false;
        const schedule = rafOnce();

        const paintChrome = () => {
            const next = window.scrollY > 8;
            if (next !== solid) {
                solid = next;
                if (masthead) masthead.classList.toggle('is-solid', next);
            }

            if (progress) {
                const span = document.documentElement.scrollHeight - window.innerHeight;
                progress.style.setProperty('--p', span > 0 ? Math.min(1, window.scrollY / span) : 0);
            }

            paintSpy();
        };

        const onScroll = () => schedule(paintChrome);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', onScroll);
        paintChrome();

        /* The interface face changes the metrics of every line on the page,
           which moves every section's offsetTop and the scroll height the
           progress bar divides by. One more pass once it lands. */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => schedule(paintChrome));
        }

        return () => {
            schedule.cancel();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('load', onScroll);
        };
    }, []);
}
