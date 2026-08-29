/* ===================================================================
   07 · EXPERIENCE — THE DRIFTING PLATES
   Two plates, in the space the roles' own column leaves empty, each
   arriving at its own rate.

   Two, and no more. The section is a list of two roles, so a third
   plate would have nothing to be about — and the point of a margin
   card is that it supports what is being read, not that there are
   several of them.

   Because the meta column is already `position: sticky` above 62rem,
   each plate holds beside its role for as long as that role's
   contribution areas are being read, and is gone the moment the next
   role begins. That is an index-driven visual arrived at through the
   layout rather than through a timeline — which is the cheaper and
   the more robust of the two.

   Each plate is given its own arrival distance in the markup, so the
   pair never moves as one sheet. They only ever travel *to* where the
   stylesheet already put them, so the resting composition is the
   composition.
   =================================================================== */

export default function driftCards({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const plates = gsap.utils.toArray(root.querySelectorAll('.exp__figure'));
        if (!plates.length) return;

        plates.forEach((plate) => {
            const from = Number(plate.dataset.drift) || 14;

            gsap.set(plate, { yPercent: from });
            gsap.to(plate, {
                yPercent: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: plate.closest('.exp') || plate,
                    start: 'top bottom',
                    end: 'top 42%',
                    scrub: SCRUB,
                },
            });
        });
    });
}
