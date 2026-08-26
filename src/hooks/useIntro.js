import { useEffect, useRef, useState } from 'react';

/* --intro-fill plus --intro-exit. A backstop only: the fade begins at the
   first paint, which this file cannot time, so the end of the fade itself is
   what is listened for. */
const INTRO_MS = 1250;

/* Whether the intro plays was settled in the document head, before the first
   paint, and the overlay fades itself out in CSS — so the page is revealed
   whatever happens to this file. The only thing held here is the entrance,
   so that a first-time visitor sees the page arrive instead of a page that
   has already arrived. */
export default function useIntro() {
    const ref = useRef(null);
    const [done, setDone] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const intro = ref.current;
        const playing = !!(intro && root.classList.contains('is-intro'));

        if (!playing) {
            setDone(true);
            return undefined;
        }

        let over = false;
        let timer = 0;

        const endIntro = () => {
            if (over) return;
            over = true;
            root.classList.remove('is-intro');
            setHidden(true);
            setDone(true);
        };

        /* The overlay's own fade, not the line's fill or the phrase's. */
        const onEnd = (e) => {
            if (e.target === intro) endIntro();
        };
        intro.addEventListener('animationend', onEnd);

        /* A fade that finished before this file arrived leaves no event to
           wait for; one that never runs at all would leave the page behind
           the overlay. Either way the intro is over. */
        if (window.getComputedStyle(intro).opacity === '0') endIntro();
        else timer = window.setTimeout(endIntro, INTRO_MS + 500);

        return () => {
            intro.removeEventListener('animationend', onEnd);
            if (timer) window.clearTimeout(timer);
        };
    }, []);

    return { ref, done, hidden };
}
