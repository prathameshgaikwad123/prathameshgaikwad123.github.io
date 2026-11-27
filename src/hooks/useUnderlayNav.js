import { useEffect, useRef } from 'react';
import { motionOK } from './dom.js';

let pending = null;

function loadNavMotion() {
    if (typeof window === 'undefined') return Promise.resolve(null);

    if (!pending) {
        pending = Promise.all([import('gsap'), import('gsap/CustomEase')])
            .then(([core, plugin]) => {
                const gsap = core.gsap || core.default;
                const CustomEase = plugin.CustomEase || plugin.default;

                gsap.registerPlugin(CustomEase);

                CustomEase.create('menu-energy', 'M0,0 C0.32,0.72 0,1 1,1');

                return gsap;
            })
            .catch(() => null);
    }

    return pending;
}

function build(gsap, isOpen) {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-menu]');
    const overlay = document.querySelector('[data-underlay]');
    const main = document.querySelector('[data-main]');
    if (!toggle || !menu || !overlay || !main) return null;

    const labels = toggle.querySelectorAll('.menu-btn__label');
    const bars = toggle.querySelectorAll('.menu-btn__bar');
    const large = menu.querySelectorAll('[data-menu-reveal="l"]');
    const small = menu.querySelectorAll('[data-menu-reveal="s"]');
    const rule = menu.querySelector('.menu__rule');
    const dark = overlay.querySelector('.underlay__dark');
    const fillets = overlay.querySelectorAll('.underlay__fillet');
    const rows = overlay.querySelectorAll('.underlay__row');
    if (bars.length < 2 || rows.length < 2 || !dark || !rule) return null;

    const offset = () => -menu.offsetWidth;

    gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(dark, { autoAlpha: 0 });
    gsap.set(labels, { yPercent: 0 });
    gsap.set(bars, { y: 0, rotation: 0 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set(rows[0], { yPercent: -100 });
    gsap.set(rows[1], { yPercent: 100 });
    gsap.set(fillets, { scale: 0 });

    gsap.set([large, small], { opacity: 0 });

    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'menu-energy', easeReverse: 'power2.inOut' },
    });

    /* ---------- the open ---------- */

    tl.set(overlay, { visibility: 'visible', pointerEvents: 'auto' }, 0)

        .to([main, overlay], {
            x: offset,
            duration: 0.7,
        }, 0)

        .to(dark, {
            autoAlpha: 1,
            duration: 0.5,
        }, 0)

        .to(fillets, {
            scale: 1,
            duration: 0.5,
        }, 0)

        .to(rows, {
            yPercent: 0,
            duration: 0.5,
        }, 0)

        .to(labels, {
            yPercent: -100,
            duration: 0.4,
        }, 0)

        .to(bars[0], {
            y: 3.5,
            rotation: 45,
            duration: 0.35,
            ease: 'back.out(1.4)',
            easeReverse: 'power3.out',
        }, 0.05)

        .to(bars[1], {
            y: -3.5,
            rotation: -45,
            duration: 0.35,
            ease: 'back.out(1.4)',
            easeReverse: 'power3.out',
        }, 0.05)

        .fromTo(large,
            { opacity: 0, xPercent: 25 },
            {
                opacity: 1,
                xPercent: 0,
                duration: 0.7,
                stagger: 0.05,
            },
            0)

        .fromTo(small,
            { opacity: 0, yPercent: 100 },
            {
                opacity: 1,
                yPercent: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: 'power3.out',
            },
            0.3)

        .to(rule, {
            scaleX: 1,
            duration: 0.5,
        }, '<');

    const enterEnd = tl.duration();

    tl.addPause();

    /* ---------- the close ---------- */

    tl.to([large, small], {
        opacity: 0,
        duration: 0.3,
    }, '<')

        .to([main, overlay], {
            x: 0,
            duration: 0.6,
        }, '<')

        .to(dark, {
            autoAlpha: 0,
            duration: 0.35,
            ease: 'power2.inOut',
        }, '<')

        .to(fillets, {
            scale: 0,
            duration: 0.5,
        }, '<')

        .to(rows[0], {
            yPercent: -100,
            duration: 0.5,
        }, '<')

        .to(rows[1], {
            yPercent: 100,
            duration: 0.5,
        }, '<')

        .to(rule, {
            scaleX: 0,
            duration: 0.3,
        }, '<')

        .to(labels, {
            yPercent: 0,
            duration: 0.25,
            ease: 'power3.in',
        }, '<+=0.1')

        .to(bars, {
            y: 0,
            rotation: 0,
            duration: 0.25,
            ease: 'power3.in',
        }, '<')

        .set(overlay, {
            visibility: 'hidden',
            pointerEvents: 'none',
        });

    let promoted = false;
    const promote = () => {
        if (promoted) return;
        promoted = true;
        main.style.willChange = 'transform';
        overlay.style.willChange = 'transform';
    };

    const idle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(promote, { timeout: 3000 })
        : window.setTimeout(promote, 1200);

    toggle.addEventListener('pointerenter', promote);
    toggle.addEventListener('focus', promote);

    const settle = () => {
        if (isOpen()) return;
        gsap.set([main, overlay], { clearProps: 'transform' });
    };

    tl.eventCallback('onComplete', settle);
    tl.eventCallback('onReverseComplete', settle);

    let timer = 0;
    const onResize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (isOpen()) gsap.set([main, overlay], { x: offset() });
            else tl.invalidate();
        }, 150);
    };

    window.addEventListener('resize', onResize);

    const destroy = () => {
        clearTimeout(timer);
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
        else clearTimeout(idle);
        main.style.willChange = '';
        overlay.style.willChange = '';
        toggle.removeEventListener('pointerenter', promote);
        toggle.removeEventListener('focus', promote);
        window.removeEventListener('resize', onResize);
        tl.kill();

        gsap.set([main, overlay, dark, rule], { clearProps: 'all' });
        gsap.set([labels, bars, fillets, rows, large, small], { clearProps: 'all' });
    };

    return { tl, enterEnd, promote, destroy };
}

export default function useUnderlayNav(open) {
    const nav = useRef(null);

    const live = useRef(open);
    const applied = useRef(open);
    live.current = open;

    useEffect(() => {
        if (!motionOK()) return undefined;

        let mounted = true;
        let ctx = null;

        loadNavMotion().then((gsap) => {
            if (!mounted || !gsap) return;

            ctx = build(gsap, () => live.current);
            if (!ctx) return;

            nav.current = ctx;
            document.documentElement.classList.add('nav-live');

            if (live.current) ctx.tl.time(ctx.enterEnd).pause();
        });

        return () => {
            mounted = false;
            document.documentElement.classList.remove('nav-live');
            if (ctx) ctx.destroy();
            nav.current = null;
        };
    }, []);

    useEffect(() => {
        if (applied.current === open) return;
        applied.current = open;

        const ctx = nav.current;
        /* No timeline yet, or none coming: the stylesheet has it. */
        if (!ctx) return;

        const { tl, enterEnd } = ctx;
        const at = tl.time();
        const rest = at <= 0 || at >= enterEnd;

        if (open) {

            ctx.promote();
            if (rest) tl.invalidate();
            if (at >= enterEnd) tl.timeScale(1).restart();
            else tl.timeScale(1).play();
            return;
        }

        if (at < enterEnd) tl.timeScale(1).reverse();
        else tl.timeScale(1).play();
    }, [open]);
}
