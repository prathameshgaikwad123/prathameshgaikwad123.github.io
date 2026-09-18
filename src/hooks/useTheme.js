import { useEffect } from 'react';
import { onMedia, activeTheme, motionOK } from './dom.js';

const THEME_KEY = 'pg-theme';

/* The length of the wipe in the stylesheet (section 15,
   html[data-wipe]::view-transition-new(root)). The one thing script has
   to know about that animation is when it is over, so that a press
   arriving inside it can be told apart from a press arriving after it.
   If the animation's duration changes, this changes with it. */
const WIPE_MS = 420;

/* The wipe's geometry used to be written to <html> as three custom
   properties and taken off again afterwards. That is the single most
   expensive thing the press did, and it had nothing to do with the theme.

   A custom property on the document element is INHERITED BY EVERY
   ELEMENT, so each of those writes invalidated the whole tree: measured
   on a 390x844 mobile viewport at 4x CPU throttle, writing the three
   properties alone — no theme change, no transition — cost one
   full-document style recalc of 35-42ms and about 130ms of main-thread
   time. It happened twice per press, once to set and once to clear, and
   it also woke the carousel's MutationObserver (which watches <html> for
   `style`) two more times on top.

   Nothing in the document ever read them. The only thing that did is a
   keyframe on a pseudo-element, so that is where they are written now: a
   constructed stylesheet holding one rule, replaced wholesale per press.
   Replacing a rule that can only match ::view-transition-new(root)
   invalidates nothing in the tree, because nothing in the tree matches
   it.

   Built lazily rather than at module scope: this module is imported by
   the prerender pass, where there is no document to adopt anything into. */
let geometrySheet = null;
let geometryTried = false;

function wipeGeometry() {
    if (geometryTried) return geometrySheet;
    geometryTried = true;
    try {
        if (
            typeof CSSStyleSheet === 'function'
            && typeof CSSStyleSheet.prototype.replaceSync === 'function'
            && 'adoptedStyleSheets' in document
        ) {
            const sheet = new CSSStyleSheet();
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
            geometrySheet = sheet;
        }
    } catch {
        /* Constructed stylesheets refused. The fallback below writes the
           properties the old way — slower, and correct. */
        geometrySheet = null;
    }
    return geometrySheet;
}

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

        /* The transition in flight, if there is one, and when the last
           change was made. Between them they are the whole of how this
           behaves under a finger that is not waiting — see wipe(). The
           first used to be a bare `wiping` boolean, which could say that
           a wipe was running but not which one, and the rapid-press path
           below has to be able to reach it.

           -Infinity rather than 0 so that the first press of the visit
           is never mistaken for a second one. `changedAt` is compared
           against performance.now(), which is milliseconds since the
           document began, so from 0 a press inside the first 420ms of
           the page would have measured as arriving on top of a wipe that
           never happened. */
        let active = null;
        let changedAt = -Infinity;

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

        const clear = () => {
            root.removeAttribute('data-wipe');

            /* The rule in the sheet is inert the moment the attribute is
               gone — it cannot match anything without it — so it is left
               where it is rather than cleared, which would be a second
               stylesheet mutation for no effect. Only the fallback path
               ever wrote to the tree, and only it has anything to undo. */
            if (wipeGeometry()) return;
            root.style.removeProperty('--wipe-x');
            root.style.removeProperty('--wipe-y');
            root.style.removeProperty('--wipe-r');
        };

        /* `finished` can arrive for a transition this no longer owns:
           press, press again quickly, and the first settles while the
           second is running. Clearing the root on the strength of the
           older promise would take the newer wipe's origin and radius
           out from under it mid-animation, so both ends check who is
           current before tidying anything away. */
        const settle = (run) => {
            if (active !== run) return;
            active = null;
            clear();
        };

        /* The same swap, opened by a circle from the control that asked
           for it.

           All of it is a courtesy and none of it is a condition. Where
           the API is missing, where the reader has asked for less
           motion, and where the press came in on top of the last one,
           the change is made the way it has always been made —
           instantly, with the transitions suppressed for the frame — and
           nothing is reported. Which is why swap() is still the thing
           that does the work and this only stands in front of it.

           The last of those was the one that was wrong, and wrong in a
           way that read as lag rather than as haste. A second press
           inside the first wipe was refused a transition and then
           swap()ped the theme underneath one: the outgoing snapshot is
           a still frame held over the document, so everywhere the first
           circle had not yet reached went on showing the theme the
           reader had just pressed twice to leave, for whatever was left
           of half a second. The change had happened and the screen was
           not allowed to say so. Pressing the button faster made it
           worse, which is exactly how it was found.

           It is answered in two parts. The wipe still in flight is
           SKIPPED, which tears down the snapshot and hands the screen
           back to the live document, so an instant swap is instant on
           screen and not merely in the DOM. And a press that lands
           within one wipe of the last one takes that instant path
           deliberately rather than opening a transition of its own: a
           press costs two frames of setup and a snapshot of the whole
           viewport before its circle can move at all, which is a price
           worth paying once and not worth paying nine times while
           somebody leans on the button. Press once and wait, and the
           wipe is there.

           The origin is the button's own centre and the radius is the
           distance from there to the furthest corner of the window, so
           the circle ends on the last pixel it has to cover rather than
           on a multiple of the screen somebody guessed at. Both go into
           a stylesheet rather than onto an element, because what spends
           them is a rule rather than a tween: a ::view-transition
           pseudo-element is not in the document and cannot be reached
           from script at all. See wipeGeometry() above for why the rule
           and not the root. */
        const wipe = (origin, change) => {
            const now = performance.now();
            const rapid = now - changedAt < WIPE_MS;
            changedAt = now;

            if (active) {
                try {
                    active.skipTransition();
                } catch {
                    /* already over — settle() tidies up either way */
                }
            }

            if (
                rapid
                || !origin
                || !motionOK()
                || typeof document.startViewTransition !== 'function'
            ) {
                swap(change);
                return;
            }

            const box = origin.getBoundingClientRect();
            const x = box.left + box.width / 2;
            const y = box.top + box.height / 2;

            /* Measured against the larger of the two viewports the
               browser will report. On a phone they disagree while the
               address bar is collapsing, and a radius taken from the
               smaller one finishes a few pixels short of the screen it
               has to cover — which the eye catches as the last strip of
               the old theme snapping out rather than arriving. Rounded
               up for the same reason. */
            const vw = Math.max(window.innerWidth, root.clientWidth);
            const vh = Math.max(window.innerHeight, root.clientHeight);

            const r = Math.ceil(Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)));

            const sheet = wipeGeometry();
            if (sheet) {
                sheet.replaceSync(
                    'html[data-wipe]::view-transition-new(root){'
                    + `--wipe-x:${x}px;--wipe-y:${y}px;--wipe-r:${r}px}`,
                );
            } else {
                root.style.setProperty('--wipe-x', `${x}px`);
                root.style.setProperty('--wipe-y', `${y}px`);
                root.style.setProperty('--wipe-r', `${r}px`);
            }

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

            let run;
            try {
                run = document.startViewTransition(() => swap(change));
            } catch (e) {
                /* The API is there and refused. The theme still changes;
                   that is the part that was never optional. */
                swap(change);
                clear();
                return;
            }

            active = run;

            /* `finished` rejects when a transition is skipped or
               interrupted — a second one starting, the tab going away
               mid-flight — and an unhandled rejection is a console error
               raised by something working exactly as intended. Both ends
               settle, because both ends are over. */
            run.finished.then(() => settle(run), () => settle(run));
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
