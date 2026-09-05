/* ===================================================================
   06 · CAPABILITIES — THE SECTION HEADER'S DRIFT
   The section header used to stand on a tinted panel cut on a slant,
   and the effect was the rate mismatch between the two: the ground
   travelling one way, the type the other and less. The ground is gone
   — a slab of the off-white behind a heading was the one surface on
   the page that was a shade rather than a statement — and what is left
   is the half of it that was never about the panel: the header moving
   against the scroll, a little, so it settles into the band rather
   than arriving with it.

   Wide windows only. On a phone the header is simply where it is.
   =================================================================== */

export default function panelCut({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const panel = root.querySelector('.cut');
        const type = root.querySelector('.cut__type');
        if (!panel || !type) return;

        gsap.fromTo(
            type,
            { yPercent: 4 },
            {
                yPercent: -4,
                ease: 'none',
                scrollTrigger: {
                    trigger: panel,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: SCRUB,
                },
            },
        );
    });
}
