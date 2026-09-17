/* ===================================================================
   08 · CONTACT — THE CLOSE
   The last band arrives as a contained panel and opens out to the
   edges of the screen. It is the one transition the document ends on
   rather than passes through, and the only one left that opens a
   ground instead of moving type across it.

   The panel is the section's ground, and only the ground: the
   composition inside it never moves outward with it. That is the
   restraint the whole effect turns on. A wordmark or an address
   scaling up to fill the screen would be somebody else's ending; this
   one is the page's own ground closing over, with the address sitting
   exactly where the stylesheet put it.

   The expansion is over before the composition is readable. The
   window runs from the band's top edge entering the screen to a third
   of the way up it, so by the time the address is in front of the
   reader the panel has already reached the edges — nothing is ever
   read through a moving clip.

   Full bleed is the resting state. A phone, a reader who has asked
   for less motion, and a document whose script never arrives all get
   the band exactly as it has always been.
   =================================================================== */

import { OPEN, startInset } from './core.js';

export default function closePanel({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const ground = root.querySelector('.close__ground');
        const composition = root.querySelector('.close__type');
        if (!ground) return;

        /* Where the panel has finished opening.

           On the home page it is a third of the way up the screen,
           which is the whole point of the effect: the last band is a
           screen and a half of composition, and the ground has to have
           reached the edges before any of it is readable.

           A case study ends on a single plate with a footer under it,
           and there is simply not that much page left — the block's top
           never gets within a third of the screen, so a window measured
           that way would leave the panel a few per cent short of the
           edges for good, which is worse than not animating it. That
           page asks for `max` instead: the panel is open exactly when
           the document is over, whatever the block's height and
           whatever the window's.

           Read off the section rather than passed in, because
           useScrollEffect hands every effect the same four things and
           this is the only tuning on the site that is genuinely per
           section rather than per effect. The default is the home
           page's, so the band that has always had this is untouched. */
        const trigger = {
            trigger: root,
            start: 'top bottom',
            end: root.getAttribute('data-close-end') || 'top 30%',
            scrub: SCRUB,
        };

        /* Both ends given here, for the reason startInset() explains:
           the browser has already dropped one side from the computed
           value, and an animation that reads it back would open the
           panel unevenly. */
        gsap.fromTo(
            ground,
            { clipPath: startInset(ground, '--close-inset') },
            { clipPath: OPEN, ease: 'power2.inOut', scrollTrigger: trigger },
        );

        /* The one rate mismatch: the composition settles the last few
           pixels as the ground arrives under it. */
        if (composition) {
            gsap.fromTo(
                composition,
                { yPercent: 2.4 },
                { yPercent: 0, ease: 'power2.out', scrollTrigger: trigger },
            );
        }
    });
}
