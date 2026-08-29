/* ===================================================================
   03 · ABOUT — THE READING REVEAL
   One paragraph, and the reader's own progress through the section is
   what brings it up to full strength, word by word, left to right.

   Opacity rather than colour. Colour would mean writing two hex values
   into a timeline, and this site has four palettes — light, dark, and
   an inverted zone in each — so a tween holding #6E6B60 would be wrong
   in three of them and wrong again the moment the reader used the
   theme toggle. The muted state is the ink the stylesheet already
   chose, simply not yet at full weight: theme-proof, compositable, and
   the same one value everywhere.

   0.62 is not an arbitrary softness. Ink at that weight over the
   paper measures 4.6:1, and over the dark ground 6.4:1 — so a reader
   who stops halfway is still reading text that meets AA, not text
   waiting to become legible.

   Wide windows only, like everything else in this folder. A reading
   cursor tied to the scroll and a phone's momentum are two things
   competing for the same gesture, and the cursor loses; below the
   breakpoint the paragraph simply arrives at full strength with the
   rest of its block.
   =================================================================== */

/* The weight an unread word sits at. See the note above before moving
   it: this number is a contrast ratio as much as it is a look. */
export const MUTED = 0.62;

export default function wordReveal({ gsap, mm, root, CONDITIONS }) {
    mm.add(CONDITIONS.wide, () => {
        const lede = root.querySelector('.about__lede');
        const words = gsap.utils.toArray(root.querySelectorAll('.about__lede .w'));
        if (!lede || !words.length) return;

        /* Set, then reveal. In a staggered `from`, each word only takes
           its start value when its own slice of the stagger begins, so
           every word the cursor has not reached yet would sit at the
           stylesheet's full weight — and the effect would be a
           six-word ripple travelling through an already-black
           paragraph rather than a line being read. */
        gsap.set(words, { opacity: MUTED });
        gsap.to(words, {
            opacity: 1,
            ease: 'none',
            duration: 0.35,
            stagger: { each: 0.06, from: 'start' },
            scrollTrigger: {
                trigger: lede,
                start: 'top 78%',
                end: 'bottom 56%',
                scrub: 0.6,
            },
        });
    });
}
