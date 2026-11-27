import { motion, useReducedMotion } from 'framer-motion';
import { VIEWPORT, fadeUp, still } from './variants.js';

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
