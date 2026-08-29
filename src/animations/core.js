/* ===================================================================
   THE SCROLL MOTION CORE
   One loader, one media condition, one ease. Every effect in this
   folder is handed the same things and nothing else, so the whole page
   speaks with one accent.

   Three rules the rest of the folder inherits from here:

   1. GSAP is loaded on demand, never at module scope. The site is
      prerendered in Node and served as separate documents; a top-level
      import would put an animation library in the server bundle and on
      every case-study page that never calls it. It is also not fetched
      at all where the system does not run — see RUNS below.

   2. Every effect is built inside a gsap.matchMedia() scoped to its own
      section. That is what makes standing down structural rather than
      an afterthought: a condition that never matches never builds a
      timeline, and matchMedia reverts every tween, every trigger and
      every inline style it made the moment it stops matching. A reader
      who turns on reduced motion halfway down the page watches it
      settle, rather than freeze.

   3. The resting state is the stylesheet's, always. An effect may only
      move an element away from where CSS already put it, and back.
      That is one fallback covering three cases at once — reduced
      motion, a script that never arrives, and the prerendered
      document — rather than three that have to be kept in step.
   =================================================================== */

/* The stylesheet's --ease, as the name GSAP knows it by.

   `cubic-bezier(0.22, 1, 0.36, 1)` is the standard approximation of
   easeOutQuint, and GSAP's power4.out is that curve exactly — the two
   agree to four decimal places at every point. The name matters,
   though: GSAP does not parse CSS cubic-bezier strings at all. Handed
   one it silently falls back to power1.out, which is a much softer
   curve than anything else on this site uses, and nothing warns. So
   the whole system would have been eased wrong, quietly, by a line
   that read as if it were doing the opposite. */
export const EASE = 'power4.out';

/* One effect on the page needs scrolling of its own to play across:
   the opening transition, which holds a screen while it happens. That
   run is layout, so the stylesheet owns it (--run-opening, section 1)
   and the timeline simply ends where the run does — `end: 'bottom
   bottom'` — rather than repeating the number here where the two could
   drift apart. Every other effect plays across scrolling the page was
   going to do anyway. */

/* Scrub is a lag, not a switch. 1 is roughly a beat behind the wheel —
   enough to feel considered, not enough to feel disconnected. */
export const SCRUB = 1;

/* When the scroll system exists at all: a window wide enough for the
   compositions to have room, and a reader who has not asked for less
   motion. Deliberately one condition rather than a set of them.

   The library is ~45kB over the wire, and it earns that only where
   there is choreography to run. Below 62rem the page is rebuilt rather
   than rescaled — held stages, scrubbed timelines and scattered
   compositions all fight a phone rather than serve it — so a narrow
   window would have been paying an animation library for a couple of
   small entrance effects. Those belong to the stylesheet's own
   entrance system instead (section 6), which costs nothing and was
   already there.

   Because the loader and every timeline are gated on this same string,
   the two cannot drift apart: there is no condition an effect can ask
   for that the loader has not already agreed to fetch the library for.
   Widening the system means widening this one line, on purpose. */
export const WIDE = '(min-width: 62rem)';
export const MOTION = '(prefers-reduced-motion: no-preference)';
export const RUNS = `${WIDE} and ${MOTION}`;

export const CONDITIONS = { wide: RUNS };

/* The fully-open state, written out in full. Every clipped panel on
   the site animates to exactly this string, and starts from the one
   its stylesheet token declares — see `startInset` below. */
export const OPEN = 'inset(0% 0% 0% 0%)';

/* The four-sided inset a panel starts from, read from the custom
   property that declares it rather than restated here.

   The indirection earns itself: a browser normalises
   `inset(9% 4% 0% 4%)` down to `inset(9% 4% 0%)` in the computed
   style, dropping the fourth value because left equals right. Reading
   the *declared* token instead gives an animation four numbers to
   interpolate against OPEN's four, rather than three — which is the
   difference between a panel that opens evenly and one whose left
   edge snaps to the screen on the first frame.

   The fallback is the open state, so a missing or malformed token
   costs the effect and nothing else. */
export function startInset(el, token) {
    const declared = getComputedStyle(el).getPropertyValue(token).trim();
    return /^[\d.\s%a-z-]+$/i.test(declared) && declared ? `inset(${declared})` : OPEN;
}

export const scrollSystemRuns = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(RUNS).matches;

let pending = null;

/* GSAP and ScrollTrigger, once per document. Resolves to null on the
   server, and on a network failure — every caller treats null as "the
   page stays as the stylesheet left it", which is a correct page. */
export function loadMotion() {
    if (typeof window === 'undefined') return Promise.resolve(null);

    if (!pending) {
        pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
            .then(([core, plugin]) => {
                const gsap = core.gsap || core.default;
                const ScrollTrigger = plugin.ScrollTrigger || plugin.default;

                gsap.registerPlugin(ScrollTrigger);
                gsap.defaults({ ease: EASE });

                /* Mobile browsers resize the viewport as their chrome
                   shows and hides. Left alone, every one of those counts
                   as a resize and refreshes every trigger mid-scroll,
                   which is exactly the stutter that makes scrubbed
                   timelines feel wrong on a phone. */
                ScrollTrigger.config({ ignoreMobileResize: true });

                /* Castoro and Inter arrive over the network and change
                   the height of everything they set, so every trigger
                   measured before they land is measured against the
                   fallback face. */
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
                }

                return { gsap, ScrollTrigger };
            })
            .catch(() => {
                /* The stylesheet has already laid the page out for a
                   scroll system that is now never going to arrive: a
                   run of empty scrolling reserved, and two panels held
                   at the inset they were meant to open from. This is
                   the one signal that stands those rules down —
                   `.js:not(.motion-off)` in sections 8.1 and 13 — so a
                   chunk that fails to load costs the choreography and
                   nothing else. The page it leaves behind is the same
                   one a phone gets. */
                document.documentElement.classList.add('motion-off');
                return null;
            });
    }

    return pending;
}
