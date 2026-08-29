import { useEffect } from 'react';
import { motionOK } from './dom.js';

/* One entrance rule for the whole site: a small rise and a fade, staggered
   by position within its own group, played once and then forgotten. The
   animation itself is declared in CSS — this only decides when each element
   has arrived, so nothing about the entrance changed in the migration.

   `data-reveal-draw` is the fourth variant and the odd one: the hand-drawn
   annotation in About, which is a stroke being drawn rather than a block
   arriving. It is here rather than in src/animations/ because it is an
   entrance, not choreography — it happens once, at one point on the page,
   and tying it to the scroll would let the reader undraw it. Keeping it
   here is also what lets a narrow window have it: the scroll system does
   not load its library below 62rem, and this one does not need it.

   `ready` is the intro: a first-time visitor should see the page arrive
   rather than a page that has already arrived. */
export default function useReveal(ready) {
    useEffect(() => {
        const revealed = [].slice.call(
            document.querySelectorAll(
                '[data-reveal], [data-reveal-soft], [data-reveal-rule], [data-reveal-draw]',
            ),
        );
        if (!revealed.length) return undefined;

        /* Stagger is per parent, so a list of six projects counts one to six
           rather than continuing a page-wide tally. */
        const seen = [];
        const counts = [];

        revealed.forEach((el) => {
            const parent = el.parentNode;
            let i = seen.indexOf(parent);
            if (i === -1) {
                seen.push(parent);
                counts.push(0);
                i = seen.length - 1;
            }
            const n = Math.min(counts[i], 6);
            el.style.setProperty('--d', `${n * 70}ms`);
            counts[i] += 1;
        });

        if (typeof IntersectionObserver !== 'function' || !motionOK()) {
            revealed.forEach((el) => el.classList.add('is-in'));
            return undefined;
        }

        if (!ready) return undefined;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.04, rootMargin: '0px 0px -6% 0px' },
        );

        revealed.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, [ready]);
}
