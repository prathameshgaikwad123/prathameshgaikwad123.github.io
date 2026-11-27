

export const MUTED = 0.62;

export default function wordReveal({ gsap, mm, root, CONDITIONS }) {
    mm.add(CONDITIONS.wide, () => {
        const lede = root.querySelector('.about__lede');
        const words = gsap.utils.toArray(root.querySelectorAll('.about__lede .w'));
        if (!lede || !words.length) return;

        gsap.set(words, { opacity: MUTED });
        gsap.to(words, {
            opacity: 1,
            ease: 'none',
            duration: 0.35,
            stagger: { each: 0.06, from: 'start' },
            scrollTrigger: {
                trigger: lede,
                start: 'top 78%',
                end: 'bottom 56%',
                scrub: 0.6,
            },
        });
    });
}
