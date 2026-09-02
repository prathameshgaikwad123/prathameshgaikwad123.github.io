import { useEffect, useRef } from 'react';
import { onMedia, rafOnce } from './dom.js';

function offsetTop(el) {
    let y = 0;
    let node = el;
    while (node) {
        y += node.offsetTop;
        node = node.offsetParent;
    }
    return y;
}

/* The floating plate gathers ground, the scroll progress fills, and the
   active section's ground travels with the reader. Which band the reader is
   in is decided once per frame, from a single line three tenths of the way
   down the viewport.

   All of this is written straight to the DOM rather than held in state: it
   runs on every scroll frame, and re-rendering the whole page for it would
   be both slower and — for aria-current — a change of behaviour.

   `pillReady` is the flag that says the travelling ground has been rendered.
   Without JavaScript there is no plate to move and the current link keeps
   the ground CSS draws under it instead, so the state is never lost. */
export default function useChrome({ pillReady }) {
    const placed = useRef(false);

    useEffect(() => {
        const masthead = document.getElementById('masthead');
        const progress = document.getElementById('progress');
        const navBar = document.getElementById('nav');
        const navList = navBar ? navBar.querySelector('.nav__list') : null;
        const navPill = navList ? navList.querySelector('.nav__pill') : null;

        const navLinks = [].slice.call(
            document.querySelectorAll('.nav__link[href^="#"], .menu__link[href^="#"]'),
        );

        const spy = [];
        navLinks.forEach((link) => {
            const id = (link.getAttribute('href') || '').replace(/^#/, '');
            if (!id) return;
            const section = document.getElementById(id);
            if (!section || section === document.body) return;
            if (spy.indexOf(section) === -1) spy.push(section);
        });

        if (!masthead && !progress && !spy.length && !navPill) return undefined;

        const placeNavPill = () => {
            if (!navPill) return;

            const link = navList.querySelector('.nav__link[aria-current]');

            /* Below the desktop breakpoint the list is not laid out at all,
               and on a page with no section in view there is nothing to
               mark. */
            if (!link || !navList.offsetWidth) {
                navPill.classList.remove('is-on');
                placed.current = false;
                return;
            }

            /* The first placement arrives in position and fades; only later
               changes travel. */
            if (!placed.current) navPill.classList.add('is-first');

            navPill.style.setProperty('--x', `${link.offsetLeft}px`);
            navPill.style.setProperty('--w', `${link.offsetWidth}px`);
            navPill.classList.add('is-on');

            if (!placed.current) {
                placed.current = true;
                requestAnimationFrame(() => navPill.classList.remove('is-first'));
            }
        };

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
            placeNavPill();
        };

        const onScroll = () => schedule(paintChrome);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', onScroll);
        paintChrome();

        /* Label widths settle when the interface face arrives, and the list
           is only measurable once the desktop breakpoint is met. */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => schedule(paintChrome));
        }
        const wide = window.matchMedia('(min-width: 62rem)');
        const offWide = onMedia(wide, onScroll);

        return () => {
            schedule.cancel();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('load', onScroll);
            offWide();
        };
    }, [pillReady]);
}
