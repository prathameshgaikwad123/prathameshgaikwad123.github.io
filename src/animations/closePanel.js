

import { OPEN, startInset } from './core.js';

export default function closePanel({ gsap, mm, root, CONDITIONS, SCRUB }) {
    mm.add(CONDITIONS.wide, () => {
        const ground = root.querySelector('.close__ground');
        const composition = root.querySelector('.close__type');
        if (!ground) return;

        const trigger = {
            trigger: root,
            start: 'top bottom',
            end: root.getAttribute('data-close-end') || 'top 30%',
            scrub: SCRUB,
        };

        gsap.fromTo(
            ground,
            { clipPath: startInset(ground, '--close-inset') },
            { clipPath: OPEN, ease: 'power2.inOut', scrollTrigger: trigger },
        );

        if (composition) {
            gsap.fromTo(
                composition,
                { yPercent: 2.4 },
                { yPercent: 0, ease: 'power2.out', scrollTrigger: trigger },
            );
        }
    });
}
