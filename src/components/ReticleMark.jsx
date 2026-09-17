import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* The mark itself, and the only part of the site built on Framer
   Motion. See src/components/Reticle.jsx for why it is a chunk of its
   own and what has to be true before it is fetched.

   WHAT COUNTS AS A PICTURE. One selector, and it is the site's own
   answer rather than a list kept in step by hand: .frame__media is the
   class every framed image on the site is wrapped in — the plates, the
   quests, the portrait, a case study's figures — and .glass[data-live]
   is the carousel, which is a picture drawn in WebGL and so has no
   frame to be inside of. Add a framed image anywhere and it is in;
   there is nothing here to remember to update. */
const MEDIA = '.glass[data-live], .frame__media';

/* Tight enough that the mark is never somewhere the pointer has left,
   loose enough that it is a mark being carried rather than one nailed
   on. Critical damping for this pair is 2 * sqrt(380 * 0.55), which is
   about 28.9, so 32 is just the other side of it: the mark settles
   without ever overshooting, and a register mark that wobbles as it
   arrives is a toy. The mass is under one for the same reason — it
   shortens the tail without having to stiffen the spring into
   something that snaps. */
const SPRING = { stiffness: 380, damping: 32, mass: 0.55 };

/* Far enough off-screen that the first frame is never drawn at the
   corner of the window on its way to the pointer. */
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
            /* A hybrid machine has a fine pointer and a touchscreen. The
               gate upstairs can only ask about the first; this is where
               the second is turned down. */
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

            /* Arriving, rather than travelling: the mark is put where the
               pointer already is instead of being flown there from
               wherever it was last seen, which on a page with two
               galleries on it would be a line drawn across the screen
               every time the reader looked at something. */
            if (!showing.current) {
                showing.current = true;
                /* Guarded rather than assumed. jump() is the documented
                   way to move a value without animating to it, and it
                   is in every version of the library this project could
                   resolve — but the fallback is the mark flying in from
                   wherever it was, which is a worse entrance and not a
                   broken one, and that is not worth a thrown error. */
                [x, y, sx, sy].forEach((value, i) => {
                    const to = i % 2 === 0 ? event.clientX : event.clientY;
                    if (typeof value.jump === 'function') value.jump(to);
                    else value.set(to);
                });
            } else {
                x.set(event.clientX);
                y.set(event.clientY);
            }

            /* A word only where there is somewhere to go. A framed image
               inside an anchor has a destination; a side quest that was
               never published does not, and the carousel says so itself
               — .is-over is written by its own hit-test through the
               lens, which is the only thing that knows whether the
               pointer is over a card or over the ground between two. */
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
