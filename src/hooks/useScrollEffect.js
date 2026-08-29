import { useEffect, useRef } from 'react';
import { CONDITIONS, RUNS, SCRUB, loadMotion, scrollSystemRuns } from '../animations/core.js';
import { onMedia } from './dom.js';

/* The one way a section gets scroll choreography.

       const ref = useScrollEffect(openingSplit);
       return <section ref={ref}>…</section>;

   What the effect is handed:

       gsap, ScrollTrigger   the library, already registered
       mm                    a matchMedia scoped to this section, so a
                             selector string inside it resolves against
                             this section and nothing else on the page
       root                  the section element
       CONDITIONS, SCRUB     the shared media condition and scrub lag

   What it must return: nothing. Everything it builds is built inside
   `mm`, and `mm.revert()` on unmount kills every tween and every
   ScrollTrigger it made and puts back every inline style — including
   the ones GSAP wrote for `will-change`, which is why nothing here
   leaves a compositor layer behind.

   Nothing is fetched until the page is one the system runs on — see
   RUNS in core.js — and the same query is watched afterwards, so a
   reader who turns the preference off, or drags a window wider,
   is given the choreography then rather than on their next visit. The
   reverse is handled by matchMedia inside the effects: when the query
   stops matching, every timeline built under it is reverted and the
   page settles back to the state the stylesheet left it in, rather
   than freezing wherever the last frame happened to be. */
export default function useScrollEffect(effect, { enabled = true } = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const root = ref.current;
        /* One section may run more than one effect. Pass them as an
           array declared at module scope, never inline, or a new array
           on every render would tear the timelines down and rebuild
           them. */
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
