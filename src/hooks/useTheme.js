import { useEffect } from 'react';
import { onMedia, activeTheme, motionOK } from './dom.js';

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
        let wiping = false;

        const swap = (change) => {
            root.classList.add('theme-switch');
            change();
            requestAnimationFrame(() => {
                requestAnimationFrame(() => root.classList.remove('theme-switch'));
            });
        };

        /* The same swap, opened by a circle from the control that asked
           for it.

           All of it is a courtesy and none of it is a condition. Where
           the API is missing, where the reader has asked for less
           motion, and where a transition is already running, the change
           is made the way it has always been made — instantly, with the
           transitions suppressed for the frame — and nothing is
           reported. Which is why swap() is still the thing that does the
           work and this only stands in front of it.

           The origin is the button's own centre and the radius is the
           distance from there to the furthest corner of the window, so
           the circle ends on the last pixel it has to cover rather than
           on a multiple of the screen somebody guessed at. Both are
           written to the root as custom properties, because what spends
           them is a rule rather than a tween: a ::view-transition
           pseudo-element is not in the document and cannot be reached
           from script at all. */
        const wipe = (origin, change) => {
            if (
                !origin
                || wiping
                || !motionOK()
                || typeof document.startViewTransition !== 'function'
            ) {
                swap(change);
                return;
            }

            const box = origin.getBoundingClientRect();
            const x = box.left + box.width / 2;
            const y = box.top + box.height / 2;

            root.style.setProperty('--wipe-x', `${x}px`);
            root.style.setProperty('--wipe-y', `${y}px`);
            root.style.setProperty(
                '--wipe-r',
                `${Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y),
                )}px`,
            );

            /* Set before the snapshot is taken, which is the whole of
               why it is an attribute and not a class added afterwards:
               it stands down the two view-transition names the site
               carries for its cross-document navigations (stylesheet
               section 15). A named element is lifted out of the root
               snapshot and animated on its own terms, which across a
               wipe would be the masthead — and, on a case study, the
               cover — changing theme on a different curve from the page
               underneath them. */
            root.setAttribute('data-wipe', '');
            wiping = true;

            const settle = () => {
                wiping = false;
                root.removeAttribute('data-wipe');
                root.style.removeProperty('--wipe-x');
                root.style.removeProperty('--wipe-y');
                root.style.removeProperty('--wipe-r');
            };

            let run;
            try {
                run = document.startViewTransition(() => swap(change));
            } catch (e) {
                /* The API is there and refused. The theme still changes;
                   that is the part that was never optional. */
                swap(change);
                settle();
                return;
            }

            /* `finished` rejects when a transition is skipped or
               interrupted — a second one starting, the tab going away
               mid-flight — and an unhandled rejection is a console error
               raised by something working exactly as intended. Both ends
               settle, because both ends are over. */
            run.finished.then(settle, settle);
        };

        const onClick = () => {
            const next = activeTheme() === 'dark' ? 'light' : 'dark';

            wipe(toggle, () => root.setAttribute('data-theme', next));

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

        /* The system route is deliberately not wiped. A circle opening
           from a point is an answer to a press at that point, and this
           change did not come from anywhere on the page — it came from
           the operating system, possibly while the reader was looking at
           something else entirely. There is no origin to open from, so
           it keeps the instant swap it has always had. */
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
