/* ===================================================================
   MOTION FOUNDATION
   A small set of shared patterns for Framer Motion, expressed in the
   same numbers the stylesheet already uses (section 1, "Motion", and
   section 6, "Entrance motion"). Nothing here is applied yet: the site's
   existing entrance is still the CSS one, so the migration changed no
   animation. These exist so a section can be moved over deliberately,
   one at a time, without inventing new timing each time.

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
