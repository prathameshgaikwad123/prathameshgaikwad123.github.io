/* ===================================================================
   MOTION FOUNDATION
   A small set of shared patterns for Framer Motion, expressed in the
   same numbers the stylesheet already uses (section 1, "Motion", and
   section 6, "Entrance motion"). The site's entrance is still the CSS
   one; these exist so a section can be moved over deliberately, one at a
   time, without inventing new timing each time. The work index (section
   9) is the first section to use them — see the end of this file.

   Usage:

       import { motion } from 'framer-motion';
       import { fadeUp, stagger } from './motion/variants.js';

       <motion.ul variants={stagger()} initial="hidden" whileInView="shown"
                  viewport={VIEWPORT}>
           {items.map((item) => <motion.li variants={fadeUp} key={item} />)}
       </motion.ul>
   =================================================================== */

/* --ease and --ease-io, as coordinate arrays. */
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IO = [0.4, 0, 0.2, 1];

/* --t-slow, --t-mid, --t-fast. */
export const SLOW = 0.7;
export const MID = 0.42;
export const FAST = 0.18;

/* The rise in the existing entrance rule: 0.875rem. */
export const RISE = 14;

/* One step of the existing stagger, and the point at which it stops
   growing — a list of twenty should not take two seconds to arrive. */
export const STEP = 0.07;
export const STEP_LIMIT = 6;

/* Matches the IntersectionObserver the entrance already uses, so anything
   moved onto Framer Motion arrives at the same point on the page. */
export const VIEWPORT = { once: true, amount: 0.04, margin: '0px 0px -6% 0px' };

/* --- Opacity only. Safe where a transform would create a containing block
       for an absolutely positioned child. ----------------------------- */
export const fade = {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: SLOW, ease: EASE_IO } },
};

/* --- The site's entrance: a small rise and a fade. ------------------- */
export const fadeUp = {
    hidden: { opacity: 0, y: RISE },
    shown: {
        opacity: 1,
        y: 0,
        transition: {
            opacity: { duration: SLOW, ease: EASE_IO },
            y: { duration: SLOW, ease: EASE },
        },
    },
};

/* --- A parent that hands its children the same entrance in order. ---- */
export const stagger = (step = STEP, delay = 0) => ({
    hidden: {},
    shown: {
        transition: { staggerChildren: step, delayChildren: delay },
    },
});

/* --- A plate arriving: the frame clears while the image settles back to
       its resting scale, which is how the work index already behaves on
       hover. ---------------------------------------------------------- */
export const imageReveal = {
    hidden: { opacity: 0, scale: 1.04 },
    shown: {
        opacity: 1,
        scale: 1,
        transition: { duration: SLOW, ease: EASE },
    },
};

/* Reduced motion keeps the arrival but drops everything positional, exactly
   as the stylesheet's preference overrides do. */
export const still = (variant) => ({
    hidden: { opacity: variant.hidden.opacity ?? 1 },
    shown: { opacity: 1, transition: { duration: FAST, ease: EASE_IO } },
});


/* ===================================================================
   THE WORK INDEX (stylesheet section 9)
   One interaction, and every part of it hangs off which project is
   active: the preview plate travels down the right five columns to meet
   that row, the numeral and title step forward while the pair on every
   other row steps back, and the tick sweeps in. The numbers are the ones
   the stylesheet was already using for the same moves, so the section
   feels as it did — only now it is one timing system rather than six
   independent CSS transitions.
   =================================================================== */

/* How far the active row steps forward. 0.5rem for the title — the value
   the stylesheet used — and half of it for the numeral, so the pair moves
   as a unit with the title leading. In pixels because a transform has no
   font size of its own to resolve a rem against. */
export const STEP_TITLE = 8;
export const STEP_NO = 4;

/* The tick: waiting to the left of its resting place, and the nudge it
   takes on hover, focus or press. 0.3rem was the stylesheet's nudge. */
export const TICK_IN = -8;
export const TICK_NUDGE = 5;

/* How far the numeral and title of a row that is not the active one recede
   while the index is being read. Only those two: they carry the row, they
   are the only text in it large enough to spare the contrast, and the
   category, summary and metadata stay fully legible either way. */
export const ROW_RECEDE = 0.75;

/* The plate's resting overscan, settling back as it becomes the active
   one — the scale(1.04) the stylesheet already applied. */
export const PLATE_SCALE = 1.04;

/* travel   the plate moving to meet a new row
   arrive   a plate clearing · leave  the one it replaces, which goes more
            slowly and from underneath, so the two crossfade without the
            ground showing through between them
   settle   the image easing back off its overscan
   step     the numeral and title stepping forward
   tone     a change of weight rather than of place
   tick     the fastest thing on the row                                */
export const workTiming = {
    travel: { duration: 0.55, ease: EASE },
    arrive: { duration: 0.3, ease: EASE_IO },
    leave: { duration: MID, ease: EASE_IO },
    settle: { duration: 0.9, ease: EASE },
    step: { duration: MID, ease: EASE },
    tone: { duration: MID, ease: EASE_IO },
    tick: { duration: FAST, ease: EASE },
};

/* The same states, reached without the movement — which is what the
   stylesheet's own reduced-motion override already does to this section,
   and what the first frame after hydration needs so that handing the
   resting state over to Framer Motion costs nothing. */
export const workTimingStill = {
    travel: { duration: 0 },
    arrive: { duration: 0 },
    leave: { duration: 0 },
    settle: { duration: 0 },
    step: { duration: 0 },
    tone: { duration: 0 },
    tick: { duration: 0 },
};
