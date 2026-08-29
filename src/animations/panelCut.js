/* ===================================================================
   06 · CAPABILITIES — THE CUT PANEL
   The plainest band on the page becomes the one that is composed: a
   tinted panel whose top and bottom edges are cut on a slant, carrying
   the section's own statement set on shifted baselines.

   Nothing is added and nothing is repeated — the tag, the statement
   and the note are the ones that were already here. What changes is
   that they are now standing on something.

   The rate mismatch is the whole effect, and it needs two things that
   can disagree. The ground is a layer taller than the panel that clips
   it, so moving it moves the two slanted edges without ever exposing
   what is behind; the type moves the other way, and less. One trigger,
   two speeds — which is all any parallax has ever been. Anything
   faster than this would be the panel performing rather than settling.

   Wide windows only. On a phone the panel is a still composition: the
   slant is in the stylesheet, and it is the slant that does the work.
   =================================================================== */

export default function panelCut({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const panel = root.querySelector('.cut');
        const ground = root.querySelector('.cut__ground');
        const type = root.querySelector('.cut__type');
        if (!panel || !ground || !type) return;

        const trigger = {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: SCRUB,
        };

        /* Kept well inside the overflow the ground is given in CSS, so
           the slanted edges travel but the band behind never shows. */
        gsap.fromTo(
            ground,
            { yPercent: -2.5 },
            { yPercent: 2.5, ease: 'none', scrollTrigger: trigger },
        );

        gsap.fromTo(
            type,
            { yPercent: 4 },
            { yPercent: -4, ease: 'none', scrollTrigger: trigger },
        );
    });
}
