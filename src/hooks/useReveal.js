import { useEffect } from 'react';
import { motionOK } from './dom.js';

export default function useReveal(ready) {
    useEffect(() => {
        const revealed = [].slice.call(
            document.querySelectorAll(
                '[data-reveal], [data-reveal-rule], [data-reveal-draw]',
            ),
        );
        if (!revealed.length) return undefined;

        const seen = [];
        const counts = [];

        revealed.forEach((el) => {

            if (el.hasAttribute('data-reveal-rule')) return;

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
