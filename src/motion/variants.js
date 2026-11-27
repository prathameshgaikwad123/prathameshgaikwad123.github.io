

/* --ease and --ease-io, as coordinate arrays. */
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IO = [0.4, 0, 0.2, 1];

/* --t-slow, --t-mid, --t-fast. */
export const SLOW = 0.7;
export const MID = 0.42;
export const FAST = 0.18;

/* The rise in the existing entrance rule: 0.875rem. */
export const RISE = 14;

export const STEP = 0.07;
export const STEP_LIMIT = 6;

export const VIEWPORT = { once: true, amount: 0.04, margin: '0px 0px -6% 0px' };

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

export const imageReveal = {
    hidden: { opacity: 0, scale: 1.04 },
    shown: {
        opacity: 1,
        scale: 1,
        transition: { duration: SLOW, ease: EASE },
    },
};

export const still = (variant) => ({
    hidden: { opacity: variant.hidden.opacity ?? 1 },
    shown: { opacity: 1, transition: { duration: FAST, ease: EASE_IO } },
});
