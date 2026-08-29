/* ===================================================================
   01 · HERO — SCATTER ON THE GRID
   Three fragments of real work, placed on the same twelve columns the
   hero already draws behind itself, each moving at its own rate as the
   first screen leaves.

   The depth illusion is entirely in the rates being different, so they
   are authored rather than random — and one of the three moves *down*
   while the others move up, which is what stops the set reading as a
   single sheet sliding past. Travel is deliberately short: these sit
   in the negative space between the headline, the body columns and the
   discipline strip, and the composition has to hold at every point of
   the scroll, not just at the ends.

   Two transforms, two elements. The scrubbed parallax is on the frame;
   the idle drift is on the plate inside it. One element cannot carry
   both — they would write the same matrix and the last one to run
   would win.

   Below 62rem none of this is registered at all. The narrow hero is
   already a dense column of type, and fragments in its margins would
   be clutter rather than composition.
   =================================================================== */

export default function heroScatter({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const fragments = gsap.utils.toArray('.hero__frag');
        if (!fragments.length) return;

        fragments.forEach((frame) => {
            const depth = Number(frame.dataset.depth) || 1;
            const drift = Number(frame.dataset.drift) || 0;

            /* The hero's own height is the whole timeline: the fragments
               have finished moving by the time the first screen is gone. */
            gsap.to(frame, {
                yPercent: drift,
                ease: 'none',
                scrollTrigger: {
                    trigger: root,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: SCRUB,
                },
            });

            /* Breathing, not floating: a few pixels over several seconds,
               below the threshold at which the eye reads it as animation
               and above the one at which the page feels frozen. */
            const plate = frame.querySelector('.hero__frag-in');
            if (!plate) return;

            gsap.to(plate, {
                y: 3 + depth * 3.5,
                duration: 5.5 + depth * 1.8,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                delay: depth * 0.9,
            });
        });
    });
}
