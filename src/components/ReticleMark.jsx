import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MEDIA = '.glass[data-live], .frame__media';

const SPRING = { stiffness: 380, damping: 32, mass: 0.55 };

const AWAY = -400;

export default function ReticleMark() {
    const x = useMotionValue(AWAY);
    const y = useMotionValue(AWAY);
    const sx = useSpring(x, SPRING);
    const sy = useSpring(y, SPRING);

    /* null · over a picture · over a picture that goes somewhere. */
    const [over, setOver] = useState(null);
    const showing = useRef(false);

    useEffect(() => {
        const onMove = (event) => {

            if (event.pointerType === 'touch') {
                setOver(null);
                showing.current = false;
                return;
            }

            const target = event.target;
            const media = target && target.closest ? target.closest(MEDIA) : null;

            if (!media) {
                setOver(null);
                showing.current = false;
                x.set(event.clientX);
                y.set(event.clientY);
                return;
            }

            if (!showing.current) {
                showing.current = true;

                [x, y, sx, sy].forEach((value, i) => {
                    const to = i % 2 === 0 ? event.clientX : event.clientY;
                    if (typeof value.jump === 'function') value.jump(to);
                    else value.set(to);
                });
            } else {
                x.set(event.clientX);
                y.set(event.clientY);
            }

            const linked = !!media.closest('a[href]') || media.classList.contains('is-over');
            setOver(linked ? 'open' : 'plain');
        };

        const gone = () => {
            setOver(null);
            showing.current = false;
        };

        document.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', gone);
        window.addEventListener('blur', gone);

        return () => {
            document.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', gone);
            window.removeEventListener('blur', gone);
        };
    }, [x, y, sx, sy]);

    return (
        <motion.div
            className="reticle"
            aria-hidden="true"
            data-open={over === 'open' ? '' : undefined}
            style={{ x: sx, y: sy }}
            animate={{ opacity: over ? 1 : 0, scale: over ? 1 : 0.72 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
            <span className="reticle__tick" />
            <span className="reticle__tick" />
            <span className="reticle__tick" />
            <span className="reticle__tick" />
            <span className="reticle__say">Open</span>
        </motion.div>
    );
}
