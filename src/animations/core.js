

export const EASE = 'power4.out';

export const SCRUB = 1;

export const WIDE = '(min-width: 62rem)';
export const MOTION = '(prefers-reduced-motion: no-preference)';
export const RUNS = `${WIDE} and ${MOTION}`;

export const CONDITIONS = { wide: RUNS };

export const OPEN = 'inset(0% 0% 0% 0%)';

export function startInset(el, token) {
    const declared = getComputedStyle(el).getPropertyValue(token).trim();
    return /^[\d.\s%a-z-]+$/i.test(declared) && declared ? `inset(${declared})` : OPEN;
}

export const scrollSystemRuns = () =>
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(RUNS).matches;

let pending = null;

export function loadMotion() {
    if (typeof window === 'undefined') return Promise.resolve(null);

    if (!pending) {
        pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
            .then(([core, plugin]) => {
                const gsap = core.gsap || core.default;
                const ScrollTrigger = plugin.ScrollTrigger || plugin.default;

                gsap.registerPlugin(ScrollTrigger);
                gsap.defaults({ ease: EASE });

                ScrollTrigger.config({ ignoreMobileResize: true });

                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
                }

                return { gsap, ScrollTrigger };
            })
            .catch(() => {

                document.documentElement.classList.add('motion-off');
                return null;
            });
    }

    return pending;
}
