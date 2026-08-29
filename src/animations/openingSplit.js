/* ===================================================================
   02 · HERO → WORK — THE OPENING
   The signature transition, and the only place on the site where one
   section becomes another rather than following it.

   The statement returns at full scale, parts, and an inverted panel
   opens between the two halves until it is the whole screen — at which
   point it is already the Selected Work ground, because the panel
   carries `zone-invert` and is therefore painted in the same tokens
   the Work band re-declares for itself. There is no cut. The reader
   watches the paper become the ink.

   What moves, and nothing else: two translations and one clip-path.
   No scale — a container growing from two per cent is a zoom, and a
   zoom is a different, louder idea than a panel opening.

   The words leave before the panel reaches them. That is not a
   nicety: it is the only reason ink type never finds itself over an
   ink ground mid-transition.

   The whole thing hangs off `position: sticky` rather than
   ScrollTrigger's pin. Pinning rewrites the DOM around the section it
   holds, which here would mean wrapping a band that the anchor
   navigation, the reading-progress bar and the floating plate all
   measure against. Sticky is the same effect with none of that, and
   `end: 'bottom bottom'` lines the timeline up exactly with the run
   the stylesheet reserved.
   =================================================================== */

import { OPEN, startInset } from './core.js';

export default function openingSplit({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const stage = root.querySelector('.opening__stage');
        const panel = root.querySelector('.opening__panel');
        if (!stage || !panel) return;

        /* Far enough that each half is off its edge of the stage at
           every viewport, measured rather than guessed — and measured
           again on every refresh, so a resize or a late font does not
           leave a word stranded on screen. */
        const away = (sign) => () => sign * stage.offsetHeight * 0.62;

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: 'bottom bottom',
                scrub: SCRUB,
                invalidateOnRefresh: true,
            },
        });

        tl
            /* Pressed apart, accelerating: the panel is doing it. */
            .to('.opening__line--a', { y: away(-1), duration: 0.55, ease: 'power2.in' }, 0)
            .to('.opening__line--b', { y: away(1), duration: 0.55, ease: 'power2.in' }, 0)

            /* The panel is already the size of the screen. All that
               changes is how much of it is allowed through — from the
               band the stylesheet declares to the whole of it. Both
               ends are given here so the four sides open together;
               see startInset() for why reading the computed value
               instead would not. */
            .fromTo(
                panel,
                { clipPath: startInset(panel, '--opening-inset') },
                { clipPath: OPEN, duration: 0.92, ease: 'power2.inOut' },
                0.08,
            )

            /* The plate settles as the window clears it — the rate
               mismatch that keeps the panel from reading as one flat
               sheet being pulled back. */
            .fromTo(
                '.opening__plate',
                { yPercent: 9 },
                { yPercent: 0, duration: 0.92, ease: 'power2.out' },
                0.08,
            )

            /* The caption is the last thing to arrive, once there is
               ground for it to sit on. */
            .fromTo('.opening__cap', { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0.62);
    });
}
