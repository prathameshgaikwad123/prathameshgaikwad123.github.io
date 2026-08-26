import { motion, useReducedMotion } from 'framer-motion';
import { VIEWPORT, fadeUp, still } from './variants.js';

/* The one wrapper the rest of the site will need when a section is moved
   onto Framer Motion: an element that arrives once, when it comes into view,
   with the timing already agreed in variants.js.

   Nothing uses it yet — the existing entrance is still the CSS rule the
   previous build shipped, and this migration deliberately changed no
   animation. It is here so that adding motion to a section later is a
   one-line change rather than a new decision.

       <Reveal as="section" className="band">…</Reveal>

   `as` picks the element, so the markup stays semantic. Everything else is
   passed straight through to the underlying motion component. */
export default function Reveal({
    as = 'div',
    variants = fadeUp,
    delay = 0,
    children,
    ...rest
}) {
    const reduced = useReducedMotion();
    const Tag = motion[as] || motion.div;
    const resolved = reduced ? still(variants) : variants;

    return (
        <Tag
            variants={resolved}
            initial="hidden"
            whileInView="shown"
            viewport={VIEWPORT}
            transition={delay ? { delay } : undefined}
            {...rest}
        >
            {children}
        </Tag>
    );
}
