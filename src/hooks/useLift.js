import { useEffect, useRef } from 'react';
import { onMedia, rafOnce } from './dom.js';

/* How far the reader travels, as a fraction of the screen, between the
   panel's first pixel and the panel fully up. Six tenths of a screen is
   long enough that the rise is something the reader is doing and short
   enough that it is over before they have to wonder how long it goes
   on for. Nothing is held while it runs — this is scroll the page was
   going to do anyway. */
const RUN = 0.62;

/* Where the hidden panel is in its rise, 0 to 1, written to a custom
   property on every scroll frame. That number is the whole interface
   between this and the stylesheet: section 12.1 is a set of functions
   of --lift and nothing else, so there is exactly one thing here that
   can be wrong, and it is a number between nought and one.

   It is measured off an anchor inside the section rather than the
   section itself, and the anchor is the element the stylesheet then
   moves. That is deliberate: getBoundingClientRect() reports a
   transformed box, so reading the thing being moved would feed the
   rise back into its own input. offsetTop is layout, not paint, and a
   transform cannot reach it — which makes the anchor's distance from
   the top of the section the one measurement that stays true while the
   panel is travelling.

   Nothing is bound at all for a reader who has asked for less motion:
   every rule that reads --lift is inside a no-preference query, so
   there would be nobody listening. The query is watched afterwards, so
   a preference changed mid-visit is answered then rather than on the
   next visit — the same bargain the scroll system makes in
   src/animations/core.js. */
export default function useLift() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window.matchMedia !== 'function') return undefined;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const anchor = el.querySelector('[data-lift-anchor]') || el;
        const schedule = rafOnce();
        let bound = false;

        const paint = () => {
            const top = el.getBoundingClientRect().top + anchor.offsetTop;
            const vh = window.innerHeight || 1;
            const p = (vh - top) / (vh * RUN);
            el.style.setProperty('--lift', Math.min(1, Math.max(0, p)).toFixed(4));
        };

        const onScroll = () => schedule(paint);

        /* `load` is here for the one scroll this never sees: a browser
           restoring where the reader was on a reload can put the page
           at the bottom of the document without a scroll event to say
           so. The same reason useChrome listens for it. */
        const bind = () => {
            if (bound) return;
            bound = true;
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll, { passive: true });
            window.addEventListener('load', onScroll);
            paint();
        };

        /* The property is removed rather than parked at 1: the resting
           state belongs to the stylesheet, and an inline value would
           outrank it for good. */
        const release = () => {
            if (!bound) return;
            bound = false;
            schedule.cancel();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('load', onScroll);
            el.style.removeProperty('--lift');
        };

        if (!reduced.matches) bind();
        const off = onMedia(reduced, () => (reduced.matches ? release() : bind()));

        /* The two faces change the height of everything above this, and
           the panel's distance from the top of the document with it. */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => bound && schedule(paint)).catch(() => {});
        }

        return () => {
            off();
            release();
        };
    }, []);

    return ref;
}
