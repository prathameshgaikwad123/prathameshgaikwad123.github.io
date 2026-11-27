

import { EASE } from './core.js';

const SAME_LINE = 4;

const UNDER = 115;

const AFTER = 0.085;

export default function lineReveal({ gsap, ScrollTrigger, mm, root, CONDITIONS }) {
    mm.add(CONDITIONS.wide, () => {
        const statement = root.querySelector('.statement');
        const words = statement ? [].slice.call(statement.querySelectorAll('.sw')) : [];
        if (!statement || !words.length) return undefined;

        const inners = words.map((word) => word.firstElementChild || word);

        statement.setAttribute('data-lines', '');
        gsap.set(inners, { yPercent: UNDER, opacity: 0 });

        statement.classList.add('is-in');

        let trigger = null;
        let run = null;

        const play = () => {
            const lines = [];

            words.forEach((word, i) => {
                const top = word.offsetTop;
                let line = null;
                for (let l = 0; l < lines.length; l++) {
                    if (Math.abs(lines[l].top - top) <= SAME_LINE) line = lines[l];
                }
                if (!line) {
                    line = { top, items: [] };
                    lines.push(line);
                }
                line.items.push(inners[i]);
            });

            run = gsap.timeline();
            lines.forEach((line, i) => {
                run.to(
                    line.items,
                    { yPercent: 0, opacity: 1, duration: 0.95, ease: EASE },
                    i * AFTER,
                );
            });
        };

        const arm = () => {
            trigger = ScrollTrigger.create({
                trigger: statement,
                start: 'top 88%',
                once: true,
                onEnter: play,
            });
        };

        if (document.fonts && document.fonts.ready) document.fonts.ready.then(arm, arm);
        else arm();

        return () => {
            if (trigger) trigger.kill();
            if (run) run.kill();
            trigger = null;
            run = null;
            gsap.set(inners, { clearProps: 'transform,opacity' });
            statement.removeAttribute('data-lines');
        };
    });
}
