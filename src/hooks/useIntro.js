import { useEffect, useRef, useState } from 'react';

const INTRO_MS = 1250;

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

        if (window.getComputedStyle(intro).opacity === '0') endIntro();
        else timer = window.setTimeout(endIntro, INTRO_MS + 500);

        return () => {
            intro.removeEventListener('animationend', onEnd);
            if (timer) window.clearTimeout(timer);
        };
    }, []);

    return { ref, done, hidden };
}
