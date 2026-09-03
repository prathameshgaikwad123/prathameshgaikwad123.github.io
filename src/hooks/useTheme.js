import { useEffect } from 'react';
import { onMedia, activeTheme } from './dom.js';

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

        /* The one thing on the page that is not a CSS rule and so cannot
           read the ramp: the colour the browser paints its own chrome
           with. Each document declares the pair as media-gated metas,
           which is right for a reader who has expressed no choice and
           wrong for one who has — an explicit light theme on a phone set
           to dark leaves the address bar black above a white page.

           Written here rather than in the click handler because both
           routes into a theme change end up in describe(), and the media
           route has to correct it too: taking a stored choice away hands
           the page back to the system preference, and the bar has to
           follow it back. */
        const paintBrowserChrome = () => {
            const light = document.querySelector('meta[name="theme-color"][media*="light"]');
            const dark = document.querySelector('meta[name="theme-color"][media*="dark"]');
            if (!light || !dark) return;

            /* The two metas are rewritten in place rather than a third,
               unconditional one being added beside them. A browser takes
               the FIRST theme-color whose media matches, so an unmedia'd
               tag placed before these would win permanently and take the
               no-script reader's system preference with it, and placed
               after them it would never be reached at all.

               Rewriting both is what makes an explicit choice hold: it
               does not matter which of the two the browser matches if
               they agree. With no choice stored the pair goes back to
               disagreeing, which is exactly how the system preference is
               meant to be answered. */
            const chosen = readStored();
            light.setAttribute('content', chosen ? (chosen === 'dark' ? '#000000' : '#FFFFFF') : '#FFFFFF');
            dark.setAttribute('content', chosen ? (chosen === 'dark' ? '#000000' : '#FFFFFF') : '#000000');
        };

        const describe = () => {
            paintBrowserChrome();
            if (!toggle) return;
            const next = activeTheme() === 'dark' ? 'light' : 'dark';
            toggle.setAttribute('aria-label', `Switch to ${next} theme`);
            toggle.setAttribute('title', `Switch to ${next} theme`);
        };

        /* Backgrounds flip instantly while colour would animate, which
           puts some text briefly at low contrast against the new ground.
           Both routes into a change suppress the transitions for the swap
           itself — the click below, and the system preference changing
           under a reader who never made a choice. It used to be written
           inline in the first of those only, so a theme that arrived from
           the operating system cross-faded and the one that arrived from
           the button did not. */
        const swap = (change) => {
            root.classList.add('theme-switch');
            change();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => root.classList.remove('theme-switch'));
            });
        };

        const onClick = () => {
            const next = activeTheme() === 'dark' ? 'light' : 'dark';

            swap(() => root.setAttribute('data-theme', next));

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
                swap(() => root.removeAttribute('data-theme'));
                describe();
            }
        });

        return () => {
            if (toggle) toggle.removeEventListener('click', onClick);
            offMedia();
        };
    }, [buttonRef]);
}
