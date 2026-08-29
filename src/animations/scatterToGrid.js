/* ===================================================================
   05 · WORK — THE FIGURE INDEX ASSEMBLING
   Six covers arrive loose and settle into one ruled row above the
   index they belong to. It is the same six projects the list names,
   numbered the same way, so the strip is a figure index rather than
   decoration: the section's own `Index 01 — 06` shown rather than
   stated.

   The row is the CSS layout — what the browser draws first, what the
   prerendered document contains, and what a reader who has asked for
   less motion is left with. The scattered arrangement is only ever a
   state this file puts the strip into in order to take it out again,
   and matchMedia hands the inline styles back on the way out. Nothing
   here can leave a cell anywhere but in its grid.

   The offsets are authored per cell rather than randomised. Random
   scatter reads as noise; a set of offsets chosen so no two neighbours
   arrive from the same side reads as an arrangement being tidied.

   Two opacities, deliberately on two elements. The cell's belongs to
   the stylesheet and says which project the reader is on; the plate's
   belongs to this file and says whether it has arrived yet. They
   multiply, so both can be true at once — and neither library ever
   has to ask the other what a cell should look like.

   None of this touches the index below. Every transform in that
   section belongs to Framer Motion — the travelling plate, the step
   forward, the tick — and a second library writing the same matrix
   would fight it for every frame.
   =================================================================== */

export default function scatterToGrid({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const sheet = root.querySelector('.sheet');
        const cells = gsap.utils.toArray(root.querySelectorAll('.sheet__cell'));
        const parts = gsap.utils.toArray(root.querySelectorAll('.sheet__cell > *'));
        if (!sheet || !cells.length) return;

        /* Set, then move. A staggered `from` only takes its start value
           when each element's own slice of the stagger begins, which
           leaves every cell the stagger has not reached yet sitting in
           its final place — the tidying would be over before it was
           visible. */
        gsap.set(cells, {
            xPercent: (i, el) => Number(el.dataset.sx) || 0,
            yPercent: (i, el) => Number(el.dataset.sy) || 0,
            rotate: (i, el) => Number(el.dataset.sr) || 0,
        });
        gsap.set(parts, { opacity: 0 });

        const trigger = {
            trigger: sheet,
            start: 'top 94%',
            end: 'top 46%',
            scrub: SCRUB,
            invalidateOnRefresh: true,
        };

        gsap.to(cells, {
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            ease: 'power3.out',
            duration: 0.6,
            stagger: { each: 0.055, from: 'start' },
            scrollTrigger: trigger,
        });

        gsap.to(parts, {
            opacity: 1,
            ease: 'power1.out',
            duration: 0.45,
            stagger: { each: 0.055, from: 'start' },
            scrollTrigger: trigger,
        });
    });
}
