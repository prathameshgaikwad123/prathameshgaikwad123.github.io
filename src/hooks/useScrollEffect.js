import { useEffect, useRef } from 'react';
import { CONDITIONS, RUNS, SCRUB, loadMotion, scrollSystemRuns } from '../animations/core.js';
import { onMedia } from './dom.js';

export default function useScrollEffect(effect, { enabled = true } = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const root = ref.current;

        const effects = (Array.isArray(effect) ? effect : [effect]).filter(
            (fn) => typeof fn === 'function',
        );
        if (!enabled || !effects.length || !root) return undefined;

        let media = null;
        let dead = false;

        const build = () => {
            loadMotion().then((motion) => {
                if (!motion || dead || media) return;
                media = motion.gsap.matchMedia(root);
                effects.forEach((fn) => fn({ ...motion, mm: media, root, CONDITIONS, SCRUB }));
            });
        };

        if (scrollSystemRuns()) build();

        const query = window.matchMedia(RUNS);
        const off = onMedia(query, () => {
            if (query.matches) build();
        });

        return () => {
            dead = true;
            off();
            if (media) media.revert();
            media = null;
        };
    }, [effect, enabled]);

    return ref;
}
