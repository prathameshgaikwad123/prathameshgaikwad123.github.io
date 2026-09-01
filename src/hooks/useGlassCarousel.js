import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGlass } from '../carousel/glass.js';
import Scroller from '../carousel/scroll.js';
import { buildStrip, visible, activeIndex, nearestSnap, snapTo, pitch } from '../carousel/layout.js';
import { CARD_W, CARD_H, GAP, STRIP_Y, FADE_IN, FADE_OUT, SURGE_SPEED } from '../carousel/config.js';

/* ===================================================================
   THE LOOP
   -------------------------------------------------------------------
   Input, layout, the frame, and the one piece of state the overlay
   reads. Everything that runs per frame is kept out of React: the
   scroll position, the velocity and the label's opacity are written
   straight to the objects that need them, and the component re-renders
   only when the active project actually changes — six times a lap
   rather than sixty times a second.

   The loop parks itself. A stationary strip behind a static field is a
   static picture, so once the filter has settled and nothing is fading
   there is nothing to draw until the next event.
   =================================================================== */

/* Layout on the client, plain effect on the server — the same guard the
   work index uses, for the same reason: useLayoutEffect has nothing to
   do on a render that never paints, and warns if asked. */
const useLatest =
    typeof window === 'undefined'
        ? (fn) => useEffect(fn)
        : (fn) => useLayoutEffect(fn);

const num = (value, fallback) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

/* The ground the cards sit on has to be the ground the lens magnifies,
   or the rim would reveal a seam. It is read back off the element so
   the canvas follows the theme without knowing anything about it. */
function readGround(element) {
    const declared = getComputedStyle(element).backgroundColor;
    const parts = declared.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return [0.835, 0.776, 0.706];
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export default function useGlassCarousel({ items, active, onActive, reduced }) {
    const stageRef = useRef(null);
    const canvasRef = useRef(null);
    const labelRef = useRef(null);
    const [shown, setShown] = useState(0);
    const [live, setLive] = useState(false);
    /* Bumped when a lost context comes back, which rebuilds everything
       the driver took with it. */
    const [generation, setGeneration] = useState(0);

    const sources = useMemo(() => items.map((item) => item.cover), [items]);

    /* One mutable bag for everything the frame touches. Refs rather
       than state throughout: none of it should cause a render. */
    const engine = useRef({
        glass: null,
        strip: null,
        scroller: new Scroller(),
        list: [],
        frame: 0,
        last: 0,
        running: false,
        onscreen: true,
        pointer: null,
        fade: 1,
        phase: 'in',
        pending: 0,
        current: 0,
        reduced: false,
        external: false,
        arrived: false,
    }).current;

    const measure = useCallback(() => {
        const stage = stageRef.current;
        if (!stage || !engine.glass) return;
        const rect = stage.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const style = getComputedStyle(stage);
        const vars = {
            cardW: num(style.getPropertyValue('--glass-card-w'), CARD_W),
            cardH: num(style.getPropertyValue('--glass-card-h'), CARD_H),
            gap: num(style.getPropertyValue('--glass-gap'), GAP),
            stripY: num(style.getPropertyValue('--glass-strip-y'), STRIP_Y),
        };

        const previous = engine.strip;
        const strip = buildStrip(items, rect.width, rect.height, vars);
        engine.strip = strip;
        engine.scroller.modulus = strip.width;
        engine.scroller.restScale = rect.width;
        if (previous) engine.scroller.rescale(strip.width / previous.width);

        engine.glass.resize(rect.width, rect.height, window.devicePixelRatio || 1);
        engine.glass.setGround(readGround(stage));
        /* The tallest a card is ever drawn: its height at the rim, at
           whatever device ratio the renderer settled on after its own
           ceilings. Anything more is detail the mip chain throws away. */
        engine.glass.textures.start(strip.height * 1.6 * engine.glass.size.dpr);
    }, [items]);

    const draw = useCallback(() => {
        const { glass, strip, scroller } = engine;
        if (!glass || !strip) return;
        visible(strip, scroller.current, engine.list);
        glass.render(
            engine.list,
            strip.centreY,
            Math.abs(scroller.velocity) / (strip.stageW * SURGE_SPEED),
        );
    }, []);

    /* Called when the section leaves the screen. The loop is about to
       stop, and stopping it mid-flight would leave the strip halfway to
       a card and the label halfway through a fade — a state nobody would
       ever see arrive, but one they would come back to. So everything in
       flight is finished at once instead. */
    const settleNow = useCallback(() => {
        const { strip, scroller } = engine;
        if (!strip) return;
        scroller.to(nearestSnap(strip, scroller.target));
        scroller.current = scroller.target;
        scroller.velocity = 0;
        engine.current = activeIndex(strip, scroller.current);
        engine.pending = engine.current;
        engine.external = false;
        engine.phase = 'in';
        engine.fade = 1;
        if (labelRef.current) labelRef.current.style.setProperty('--glass-label', '1');
        setShown(engine.current);
    }, []);

    const wake = useCallback(() => {
        if (engine.running || !engine.onscreen) return;
        engine.running = true;
        engine.last = 0;
        engine.frame = requestAnimationFrame(engine.tick);
    }, []);

    const tick = (now) => {
        const dt = engine.last ? Math.min((now - engine.last) / 1000, 0.1) : 1 / 60;
        engine.last = now;

        const { strip, scroller } = engine;
        if (!strip) {
            engine.running = false;
            return;
        }

        scroller.instant = engine.reduced;
        scroller.step(dt, engine.reduced ? null : nearestSnap(strip, scroller.current));

        const index = activeIndex(strip, scroller.current);
        if (index !== engine.current) {
            engine.current = index;
            engine.pending = index;
            if (engine.phase !== 'out') engine.phase = 'out';
            /* The cards the strip passes through on its way to one the
               index below asked for are not choices the reader made, so
               they are not reported back as such — that would turn one
               hover into a fight between the two halves of the section. */
            if (!engine.external && onActive) onActive(index);
        }
        if (engine.external && scroller.settled) engine.external = false;

        /* The label leaves in a frame and returns over five, and never
           dissolves through the outgoing text: if the active project
           changes again on the way back it turns round from wherever
           the opacity had got to. */
        if (engine.reduced) {
            engine.fade = 1;
            if (engine.phase === 'out') {
                engine.phase = 'in';
                setShown(engine.pending);
            }
        } else if (engine.phase === 'out') {
            engine.fade -= dt / FADE_OUT;
            if (engine.fade <= 0) {
                engine.fade = 0;
                engine.phase = 'in';
                setShown(engine.pending);
            }
        } else if (engine.fade < 1) {
            engine.fade = Math.min(1, engine.fade + dt / FADE_IN);
        }
        if (labelRef.current) labelRef.current.style.setProperty('--glass-label', engine.fade.toFixed(3));

        const fading = engine.glass ? engine.glass.textures.advance(dt) : false;
        draw();

        const busy = !scroller.settled || fading || engine.phase === 'out' || engine.fade < 1;
        if (busy && engine.onscreen) engine.frame = requestAnimationFrame(engine.tick);
        else engine.running = false;
    };

    /* The two values the frame reads that come from props rather than
       from the engine. Written in a layout effect rather than during
       render: a render React throws away must not reach the loop, and
       this still lands before any event handler or frame can run. */
    useLatest(() => {
        /* Reduced motion takes the inertia and the crossfade and leaves
           the lens. The glass is a static optical field, not movement —
           it looks the same on a frame where nothing has happened for
           an hour — and removing it would answer a request about motion
           by taking away the design. What goes is the coasting: the
           strip tracks the pointer one to one, arrives at a keyboard or
           index target directly, and the label swaps rather than
           fading. */
        engine.reduced = !!reduced;
        engine.tick = tick;
    });

    /* --- mount ------------------------------------------------------ */
    useEffect(() => {
        const canvas = canvasRef.current;
        const stage = stageRef.current;
        if (!canvas || !stage) return undefined;

        const glass = createGlass(canvas, sources, () => wake());
        if (!glass) return undefined;
        engine.glass = glass;
        setLive(true);
        measure();
        draw();

        const observer = new ResizeObserver(() => {
            measure();
            wake();
        });
        observer.observe(stage);

        /* Off screen is off: a section three viewports down should not
           be holding a frame budget.

           The first time it does come into view the strip is given a
           short push and allowed to coast to rest. That is the whole
           entrance: no fade, no rise, no second animation library —
           the section arrives in the carousel's own language, which is
           inertia running out. */
        const seen = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                engine.onscreen = entry.isIntersecting;
                if (!entry.isIntersecting) {
                    settleNow();
                    return;
                }
                /* The margin is generous so the loop is awake before the
                   section is reached; the arrival waits for a third of
                   the stage to be genuinely on screen, or it would have
                   played out before anyone could see it. */
                if (!engine.arrived && entry.intersectionRatio > 0.3 && engine.strip && !engine.reduced) {
                    engine.arrived = true;
                    engine.scroller.push(engine.strip.height * 0.9);
                }
                wake();
            },
            { rootMargin: '200px 0px', threshold: [0, 0.32] },
        );
        seen.observe(stage);

        const theme = new MutationObserver(() => {
            glass.setGround(readGround(stage));
            wake();
        });
        theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        const onScheme = () => {
            glass.setGround(readGround(stage));
            wake();
        };
        scheme.addEventListener('change', onScheme);

        return () => {
            cancelAnimationFrame(engine.frame);
            engine.running = false;
            observer.disconnect();
            seen.disconnect();
            theme.disconnect();
            scheme.removeEventListener('change', onScheme);
            glass.dispose();
            engine.glass = null;
        };
    }, [sources, measure, draw, wake, settleNow, generation]);

    /* --- a lost context ---------------------------------------------- */
    /* A backgrounded tab on a phone, a driver reset, a laptop switching
       GPU: the context goes and every buffer, texture and program in it
       goes with it. Preventing the default on the loss is what asks for
       it back; the strip steps in meanwhile, and the restore rebuilds
       the renderer from scratch rather than leaving the reader on the
       fallback for the rest of the visit. This listener outlives the
       renderer, so it is kept in an effect of its own. */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const onLost = (event) => {
            event.preventDefault();
            setLive(false);
        };
        const onRestored = () => setGeneration((n) => n + 1);
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
        return () => {
            canvas.removeEventListener('webglcontextlost', onLost);
            canvas.removeEventListener('webglcontextrestored', onRestored);
        };
    }, []);

    /* --- input ------------------------------------------------------ */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage || !live) return undefined;
        const { scroller } = engine;

        /* Horizontal deltas only. A page section may not eat the
           vertical wheel: the reader is on their way down the document
           and a carousel that swallows that is a trap. Shift plus wheel
           is offered because that is the gesture a mouse has. */
        const onWheel = (event) => {
            const dx = Math.abs(event.deltaX) > 0.5 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
            if (!dx) return;
            event.preventDefault();
            engine.external = false;
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1;
            scroller.push(dx * unit);
            wake();
        };

        const onDown = (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            engine.pointer = event.pointerId;
            engine.external = false;
            /* A pointer that has already gone by the time this runs —
               a synthetic event, a lifted finger — cannot be captured,
               and the drag works without it. */
            try {
                stage.setPointerCapture(event.pointerId);
            } catch (error) { /* not capturable */ }
            scroller.dragStart(event.clientX, event.timeStamp / 1000);
            stage.classList.add('is-held');
            wake();
        };

        const onMove = (event) => {
            if (engine.pointer !== event.pointerId) return;
            scroller.dragMove(event.clientX, event.timeStamp / 1000);
            wake();
        };

        const onUp = (event) => {
            if (engine.pointer !== event.pointerId) return;
            engine.pointer = null;
            if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
            scroller.dragEnd(event.timeStamp / 1000);
            stage.classList.remove('is-held');
            wake();
        };

        const onKey = (event) => {
            const strip = engine.strip;
            if (!strip) return;
            const step = pitch(strip);
            if (event.key === 'ArrowRight') scroller.push(step);
            else if (event.key === 'ArrowLeft') scroller.push(-step);
            else if (event.key === 'Home') scroller.to(snapTo(strip, scroller.current, 0));
            else if (event.key === 'End') scroller.to(snapTo(strip, scroller.current, items.length - 1));
            else return;
            event.preventDefault();
            engine.external = false;
            wake();
        };

        stage.addEventListener('wheel', onWheel, { passive: false });
        stage.addEventListener('pointerdown', onDown);
        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerup', onUp);
        stage.addEventListener('pointercancel', onUp);
        stage.addEventListener('keydown', onKey);
        return () => {
            stage.removeEventListener('wheel', onWheel);
            stage.removeEventListener('pointerdown', onDown);
            stage.removeEventListener('pointermove', onMove);
            stage.removeEventListener('pointerup', onUp);
            stage.removeEventListener('pointercancel', onUp);
            stage.removeEventListener('keydown', onKey);
        };
    }, [live, items.length, wake]);

    /* --- the index below -------------------------------------------- */
    /* Hovering or focusing a row of the work index asks the strip to
       come and meet it, by the shortest way round. The flag keeps the
       two from arguing: a move the carousel started does not get
       echoed back at it. */
    useEffect(() => {
        const strip = engine.strip;
        if (!live || !strip || active == null || active === engine.current) return;
        engine.external = true;
        engine.scroller.to(snapTo(strip, engine.scroller.current, active));
        wake();
    }, [active, live, wake]);

    return { stageRef, canvasRef, labelRef, shown, live };
}
