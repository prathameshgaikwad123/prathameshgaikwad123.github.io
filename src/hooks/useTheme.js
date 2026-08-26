import { useEffect } from 'react';
import { onMedia } from './dom.js';

const THEME_KEY = 'pg-theme';

function readStored() {
    try {
        const v = localStorage.getItem(THEME_KEY);
        return v === 'light' || v === 'dark' ? v : null;
    } catch {
        return null;
    }
}

/* Light/dark, system-aware, persisted only on a deliberate choice. The
   attribute lives on <html> and is set before the first paint by the inline
   script in each page's head, so this only has to keep it up to date.

   The button's own labels are written to the DOM rather than rendered, so
   the markup the reader receives without JavaScript is the same markup the
   previous build shipped. */
export default function useTheme(buttonRef) {
    useEffect(() => {
        const root = document.documentElement;
        const toggle = buttonRef.current;
        const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

        /* The theme actually on screen, whether it came from a stored choice
           or from the operating system. */
        const activeTheme = () => {
            const attr = root.getAttribute('data-theme');
            if (attr === 'light' || attr === 'dark') return attr;
            return darkQuery.matches ? 'dark' : 'light';
        };

        const describe = () => {
            if (!toggle) return;
            const next = activeTheme() === 'dark' ? 'light' : 'dark';
            toggle.setAttribute('aria-label', `Switch to ${next} theme`);
            toggle.setAttribute('title', `Switch to ${next} theme`);
        };

        const onClick = () => {
            const next = activeTheme() === 'dark' ? 'light' : 'dark';

            /* Backgrounds flip instantly while colour would animate, which
               puts some text briefly at low contrast against the new ground.
               Suppress transitions for the swap itself. */
            root.classList.add('theme-switch');
            root.setAttribute('data-theme', next);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => root.classList.remove('theme-switch'));
            });

            /* Storage is written only here — on a deliberate choice — so an
               untouched visit keeps following the system preference. */
            try {
                localStorage.setItem(THEME_KEY, next);
            } catch {
                /* storage blocked — the choice simply does not outlive the page */
            }
            describe();
        };

        describe();
        if (toggle) toggle.addEventListener('click', onClick);

        const offMedia = onMedia(darkQuery, () => {
            if (!readStored()) {
                root.removeAttribute('data-theme');
                describe();
            }
        });

        return () => {
            if (toggle) toggle.removeEventListener('click', onClick);
            offMedia();
        };
    }, [buttonRef]);
}
