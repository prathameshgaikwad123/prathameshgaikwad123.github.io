/* ===================================================================
   08 · CONTACT — THE CLOSE
   The last band arrives as a contained panel and opens out to the
   edges of the screen. It is the opening transition read backwards —
   there, the paper gave way to the ink; here, the ink takes the page.
   Two moments, one idea, at either end of the document.

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

        const trigger = {
            trigger: root,
            start: 'top bottom',
            end: 'top 30%',
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
