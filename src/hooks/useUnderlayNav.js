import { useEffect, useRef } from 'react';
import { motionOK } from './dom.js';

/* ===================================================================
   THE UNDERLAY NAVIGATION'S CHOREOGRAPHY
   -------------------------------------------------------------------
   One timeline, built paused, split in two by a pause, and driven from
   whichever end of it the playhead happens to be sitting at.

   The technique is GSAP 3.15's `easeReverse`: a tween can carry one
   curve for playing forward and a different one for playing back, so a
   single timeline can be both the open and the close and still have its
   own character in each direction. Everything before addPause() is the
   open. Closing while it is still playing reverses it, on the reverse
   curves, which is snappier than the open was and reads as the menu
   answering rather than finishing what it started. Closing after it has
   arrived plays the second half instead, which is written out
   separately and is free to be a different animation.

   Four branches, because there are four states the playhead can be in
   when the toggle is pressed, and the reference this is built from is
   worth reading for them: opening from rest, opening from a completed
   close, closing mid-open, closing from rest.

   What is deliberately NOT the reference:

     · The playhead is only invalidated at rest. Invalidating re-reads
       every tween's start value off the DOM, which is what makes the
       travel distance follow --menu-width — but done mid-flight it
       re-reads a half-shifted page as the place the shift begins, and
       the next frame jumps the rest of the way. At rest there is
       nothing to jump.

     · The panel's hairline is taken back down in the close. Left up, it
       is drawn once on the first open and never again.

     · The page's transform is cleared outright once the menu is shut,
       both ways out, rather than being left at a translate of zero.
       What the page keeps between times is the layer hint below and not
       a transform, which is the difference between a promise that it
       will move and a claim that it has.

       Both make the page layer a containing block for anything fixed
       inside it, and a stacking context, so both were checked against
       what is in there: nothing is position: fixed — every fixed thing
       on this site is a sibling of the page layer, not a child of it —
       the two sticky elements are unaffected by either, and the
       cross-document transition on the project covers was measured
       against the same page without them and behaves identically.

     · The links fade on opacity rather than autoAlpha. Hidden
       visibility cannot take focus, and the panel puts focus on its
       first link the moment it opens.

   The library is asked for once, on mount, and the menu works without
   it: section 7 of the stylesheet moves the page off the panel on a
   plain transition, which is what a reader gets in the moment before
   this arrives, if it never arrives, and — because that transition is
   shortened to nothing by the reduced-motion query — for good if they
   have asked for less motion. `nav-live` on the document is how the
   stylesheet knows to stand down.
   =================================================================== */

let pending = null;

/* GSAP and CustomEase, once per document. Resolves to null on the
   server and on a network failure, and the caller treats null as "the
   stylesheet keeps the menu", which is a working menu.

   ScrollTrigger is deliberately not asked for here. The scroll system
   loads that itself, on the home page, above 62rem and only for a
   reader who wants it — and this menu is on every page at every width,
   so bundling the two loaders would put the whole scroll system on six
   case studies that never scrub anything. */
function loadNavMotion() {
    if (typeof window === 'undefined') return Promise.resolve(null);

    if (!pending) {
        pending = Promise.all([import('gsap'), import('gsap/CustomEase')])
            .then(([core, plugin]) => {
                const gsap = core.gsap || core.default;
                const CustomEase = plugin.CustomEase || plugin.default;

                gsap.registerPlugin(CustomEase);
                /* The primary motion character: leaves quickly, arrives
                   slowly, and never overshoots. Named rather than
                   inlined so the two halves can share it. */
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

    /* The one measure, read off the panel itself rather than restated
       here: the stylesheet owns --menu-width, and the page travels
       exactly as far as the panel is wide. A function, so invalidating
       the timeline re-reads it after a resize or a breakpoint. */
    const offset = () => -menu.offsetWidth;

    /* The closed state, written inline so it wins over the stylesheet's
       own resting values. Everything the stylesheet leaves visible is
       put away here and nowhere else: before this runs, and if it never
       runs, the panel is simply complete under the page. */
    gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' });
    gsap.set(dark, { autoAlpha: 0 });
    gsap.set(labels, { yPercent: 0 });
    gsap.set(bars, { y: 0, rotation: 0 });
    gsap.set(rule, { scaleX: 0 });
    gsap.set(rows[0], { yPercent: -100 });
    gsap.set(rows[1], { yPercent: 100 });
    gsap.set(fillets, { scale: 0 });
    /* The two fromTo tweens below declare this same state, and a fromTo
       is supposed to write it out the moment it is built — but inside a
       paused timeline it does not, and the links spend the first frames
       of the first open at full opacity before being taken back to
       nothing. Under the page, where nobody sees it. Set anyway: the
       closed state should be a thing this function states, not a thing
       the first tween happens to leave behind. */
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
            y: '0.25em',
            rotation: 45,
            duration: 0.35,
            ease: 'back.out(1.4)',
            easeReverse: 'power3.out',
        }, 0.05)

        .to(bars[1], {
            y: '-0.25em',
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
    /* Not a reversal: the links go before the page moves, so the panel
       is empty by the time it is covered, and the page comes back a
       tenth of a second faster than it left. */

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

    /* The page layer is the whole document — on the home page some twelve
       thousand pixels of it — and the first frame of a transform is where
       the browser decides to give all of that a compositing layer of its
       own. Painting a layer that size is not something it can finish
       inside that frame, and what shows until it does is the layer's
       ground with nothing on it: the page, blank, for as long as the
       raster takes. Measured here at a third of a second on a machine
       with no GPU to help it.

       So the layer is asked for in advance and then kept. Advance is the
       whole point — hinting on the pointer arriving at the toggle buys a
       couple of hundred milliseconds, which measurably is not enough —
       and keeping it is the price: one promoted layer for the page shell,
       which is what a page shell that slides is. It is asked for in an
       idle moment rather than on load, because the faces, the index and
       a canvas all have a better claim on the first second than a menu
       nobody has reached for yet. The pointer and the focus are left in
       as well, for the case where that moment has not come round yet. */
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

    /* Shut, and shut by either route: the page gives its transform back
       rather than holding a translate of zero. */
    const settle = () => {
        if (isOpen()) return;
        gsap.set([main, overlay], { clearProps: 'transform' });
    };

    tl.eventCallback('onComplete', settle);
    tl.eventCallback('onReverseComplete', settle);

    /* A window that changes width changes how far the page has to
       travel. Open, the page is put where it now belongs; shut, the
       timeline is told to measure again the next time it plays. */
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
        /* Every inline value this hook wrote, handed back: what is left
           is the page the stylesheet describes. */
        gsap.set([main, overlay, dark, rule], { clearProps: 'all' });
        gsap.set([labels, bars, fillets, rows, large, small], { clearProps: 'all' });
    };

    return { tl, enterEnd, promote, destroy };
}

export default function useUnderlayNav(open) {
    const nav = useRef(null);
    /* The open state as the timeline's own callbacks and the resize
       listener see it: both fire outside a render. */
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

            /* Opened before the library arrived. The stylesheet has
               already put the page where it belongs, so the playhead is
               placed rather than played. */
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
            /* Last resort on the layer, for the case where neither the
               idle moment nor a pointer has come round: too late to help
               this open, in time for the next one. */
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
