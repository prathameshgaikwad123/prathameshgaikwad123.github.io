import { useEffect, useRef } from 'react';
import { onMedia, rafOnce } from './dom.js';

/* ===================================================================
   THE PULL
   -------------------------------------------------------------------
   One number, and the shape of an edge, written on every scroll frame.

   The number is --pull: nought when the top of the section under the
   footer is level with the bottom of the screen, one when it is level
   with the top. It is a plain function of where the reader is — no
   timeline, no observer deciding a section has "arrived", nothing
   held, nothing added to the scroll. Which is what makes the reverse
   free: read the same function the other way and the edge goes back
   down under the footer exactly the way it came up.

   The shape is the part CSS cannot do. A curve that only *moved*
   would be a divider being scrolled to; what the reader is meant to
   see is a sheet with two anchored sides and a centre being pulled,
   so the path is rebuilt from --pull on every frame rather than
   translated. That is one string and one setAttribute per layer, and
   the layers all point at the same path through <use> — so it is two
   attribute writes a frame, not six, and no element is ever laid out
   again.

   It is written on the two elements that need it and on no others,
   which matters more here than it looks. A custom property is
   inherited, so writing one is a style invalidation of everything
   underneath it: put --pull on <main> — the obvious place, since the
   footer above has to read it too and a sibling cannot inherit from a
   sibling — and every scroll frame recomputes the style of the whole
   page. Measured on a phone-class processor that is the difference
   between a frame of about sixteen milliseconds and one of about a
   hundred, and it is the whole cost of the effect: the curve, the
   light and the two grounds together are free next to it. So the
   section gets it for its own layers, and the footer's composition
   gets it for its hold — the element carries [data-pull-hold] to say
   so, because a hook reaching up the page by class name would be a
   coupling nobody could see from either end.

   Everything that reads it is inside a no-preference query, and this
   hook binds nothing at all outside one — a reader who has asked for
   less motion gets the section as the stylesheet leaves it, which is
   an ordinary section at the bottom of an ordinary page.
   =================================================================== */

/* How far up the centre of the edge is pulled, as a fraction of the
   room it has: nought at both ends of the run and one at its peak,
   which the exponent puts a little past halfway. Nought at the far end
   matters as much as nought at the near one — it is what leaves no
   curve behind once the reader is simply on the section. */
const lift = (p) => Math.sin(Math.PI * p ** 1.3) ** 1.2;

/* The apex may take this much of the box; the rest is room for the
   light to spread into, which an <svg> would otherwise cut off at its
   own top edge. */
const APEX = 0.88;

/* Half the width the bump stands on. A phone gets very nearly the
   whole measure — the sheet is the width of the screen and its edge
   should read that way — and a wide window gets a bump of about the
   same physical size instead of one stretched to fit, which is the
   one thing scaling the effect up would get wrong. */
const foot = (w) => Math.min(w * 0.46, Math.max(w * 0.22, 380));

/* The membrane. Two feet on the sheet's own top edge, a centre pulled
   up off it, and four handles that decide what happens in between:
   the ones at the feet lengthen as the pull goes on, so the shoulders
   flare out and hollow, and the ones at the apex shorten, so the peak
   sharpens instead of staying a dome. The base narrows a little at the
   same time. That is the whole of what makes it read as something
   being stretched rather than something being raised.

   Both joins are horizontal — the feet and the apex alike — so there
   is no corner anywhere in it at any point in the run. */
function membrane(w, h, p) {
    const apex = h - h * APEX * lift(p);
    /* Eased, so the first few frames of the gesture are gentle and the
       deformation arrives with the height rather than ahead of it. */
    const t = p * p * (3 - 2 * p);

    const cx = w / 2;
    const half = foot(w) * (1 - 0.34 * t);
    const x0 = Math.max(0, cx - half);
    const x1 = Math.min(w, cx + half);
    const kFoot = half * (0.36 + 0.60 * t);
    const kApex = half * (0.42 - 0.35 * t);

    const r = (n) => Math.round(n * 10) / 10;

    return `M0 ${r(h)}H${r(x0)}C${r(x0 + kFoot)} ${r(h)} ${r(cx - kApex)} ${r(apex)} ${r(cx)} ${r(apex)}`
        + `C${r(cx + kApex)} ${r(apex)} ${r(x1 - kFoot)} ${r(h)} ${r(x1)} ${r(h)}H${r(w)}`;
}

export default function usePull() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof window.matchMedia !== 'function') return undefined;

        /* The footer's composition, which is above this section and so
           cannot inherit anything from it. Absent on any page this
           section is not on, and the hold is simply not written then. */
        const held = document.querySelector('[data-pull-hold]');
        const box = el.querySelector('[data-pull-edge]');
        const line = el.querySelector('[data-pull-line]');
        const fill = el.querySelector('[data-pull-fill]');
        const svg = box && box.firstElementChild;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const schedule = rafOnce();
        let bound = false;
        let w = 0;
        let h = 0;
        /* The last frame's numbers, so a scroll anywhere else on the
           page — which is most of the scrolling anyone does here —
           invalidates no style and rebuilds no path. */
        let last = -1;

        /* Layout, and only on the frames that can have changed it. The
           box is sized by the stylesheet (--pull-lift, section 1) and
           measured rather than restated, so there is one place the
           depth of the pull is decided. */
        const measure = () => {
            if (!box || !svg) return;
            const nw = box.clientWidth;
            const nh = box.clientHeight;
            if (nw === w && nh === h) return;
            w = nw;
            h = nh;
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            last = -1;
        };

        const paint = () => {
            const vh = window.innerHeight || 1;
            const top = el.getBoundingClientRect().top;
            const p = Math.min(1, Math.max(0, (vh - top) / vh));

            if (Math.abs(p - last) < 0.0005) return;
            last = p;

            const v = p.toFixed(4);
            el.style.setProperty('--pull', v);
            if (held) held.style.setProperty('--pull', v);
            /* The light comes up much faster than the edge does, so the
               first thing the reader sees is a glow on something barely
               there rather than a shape that later lights up — and it
               is gone by the far end, because a straight bright line
               across a settled section is exactly the permanent divider
               none of this is meant to leave behind. */
            el.style.setProperty('--pull-light', (lift(p) ** 0.45).toFixed(4));

            if (!w || !line || !fill) return;
            const d = membrane(w, h, p);
            line.setAttribute('d', d);
            /* The same curve, closed along the bottom of its box — which
               is the sheet's own top edge — so the ground runs up into
               the bump with no join to see. */
            fill.setAttribute('d', `${d}Z`);
        };

        const onScroll = () => schedule(paint);

        const onResize = () => schedule(() => {
            measure();
            paint();
        });

        /* `load` is here for the one scroll this never sees: a browser
           restoring where the reader was on a reload can put the page
           at the bottom of the document without a scroll event to say
           so. The same reason useChrome listens for it. */
        const bind = () => {
            if (bound) return;
            bound = true;
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onResize, { passive: true });
            window.addEventListener('load', onResize);
            measure();
            paint();
        };

        /* The properties are removed rather than parked at nought: the
           resting state belongs to the stylesheet, and an inline value
           would outrank it for good. */
        const release = () => {
            if (!bound) return;
            bound = false;
            schedule.cancel();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('load', onResize);
            el.style.removeProperty('--pull');
            el.style.removeProperty('--pull-light');
            if (held) held.style.removeProperty('--pull');
            last = -1;
        };

        if (!reduced.matches) bind();
        const off = onMedia(reduced, () => (reduced.matches ? release() : bind()));

        /* The two faces change the height of everything above this, and
           the section's distance from the top of the document with it. */
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => bound && onResize()).catch(() => {});
        }

        return () => {
            off();
            release();
        };
    }, []);

    return ref;
}
