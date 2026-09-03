import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGlass } from '../carousel/glass.js';
import Scroller from '../carousel/scroll.js';
import { buildStrip, visible, activeIndex, cardAt, nearestSnap, snapTo, pitch } from '../carousel/layout.js';
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

/* Layout on the client, plain effect on the server: useLayoutEffect has
   nothing to do on a render that never paints, and warns if asked. */
const useLatest =
    typeof window === 'undefined'
        ? (fn) => useEffect(fn)
        : (fn) => useLayoutEffect(fn);

/* How far a pointer may travel between press and release and still be
   read as a click on a card rather than as a drag of the strip. */
const DRAG_SLOP = 6;

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

export default function useGlassCarousel({ items, reduced, onOpen }) {
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
        arrived: false,
        /* The gesture in progress, so a drag that happens to end where
           it started does not also open a project. */
        startX: 0,
        startY: 0,
        moved: false,
        open: null,
        /* The card the label is naming, beside the state that renders it:
           what a click on the label opens has to be what the label says,
           not what the strip has since moved on to. */
        shown: 0,
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
        engine.phase = 'in';
        engine.fade = 1;
        if (labelRef.current) labelRef.current.style.setProperty('--glass-label', '1');
        engine.shown = engine.current;
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
        }

        /* The label leaves in a frame and returns over five, and never
           dissolves through the outgoing text: if the active project
           changes again on the way back it turns round from wherever
           the opacity had got to. */
        if (engine.reduced) {
            engine.fade = 1;
            if (engine.phase === 'out') {
                engine.phase = 'in';
                engine.shown = engine.pending;
                setShown(engine.pending);
            }
        } else if (engine.phase === 'out') {
            engine.fade -= dt / FADE_OUT;
            if (engine.fade <= 0) {
                engine.fade = 0;
                engine.phase = 'in';
                engine.shown = engine.pending;
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
        /* Held rather than closed over: the component hands down a new
           function on every label change, and re-binding the pointer
           listeners six times a lap — possibly mid-drag — to learn
           nothing new would be the wrong trade. */
        engine.open = onOpen || null;
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

        /* Which project is under a point on the glass. Everything that
           opens something asks this — the click, and the pointer that
           only wants to know whether to change the cursor. */
        const under = (event) => {
            const rect = stage.getBoundingClientRect();
            if (!(rect.width > 0) || !(rect.height > 0)) return -1;
            return cardAt(
                engine.strip,
                scroller.current,
                event.clientX - rect.left,
                event.clientY - rect.top,
            );
        };

        /* Horizontal deltas only. A page section may not eat the
           vertical wheel: the reader is on their way down the document
           and a carousel that swallows that is a trap. Shift plus wheel
           is offered because that is the gesture a mouse has. */
        const onWheel = (event) => {
            const dx = Math.abs(event.deltaX) > 0.5 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
            if (!dx) return;
            event.preventDefault();
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientWidth : 1;
            scroller.push(dx * unit);
            wake();
        };

        const onDown = (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            engine.pointer = event.pointerId;
            engine.startX = event.clientX;
            engine.startY = event.clientY;
            engine.moved = false;
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
            if (engine.pointer !== event.pointerId) {
                /* Not a drag: the cursor is only passing over, and the
                   one thing to decide is whether it is over a card. */
                if (engine.pointer === null && event.pointerType !== 'touch') {
                    stage.classList.toggle('is-over', under(event) >= 0);
                }
                return;
            }
            /* Past this, the gesture is a drag rather than a click —
               including a drag that comes back to where it began. The
               threshold is the few pixels a hand moves while pressing. */
            if (
                Math.abs(event.clientX - engine.startX) > DRAG_SLOP ||
                Math.abs(event.clientY - engine.startY) > DRAG_SLOP
            ) {
                engine.moved = true;
            }
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

        const onLeave = () => stage.classList.remove('is-over');

        /* The cards are a picture inside a canvas, so this is the one
           place on the site where a link has to be found rather than
           followed. The click is where it is done rather than the
           pointer release: it is the event that carries the modifier
           keys, the one a browser's own "activate" produces, and the one
           a drag can be told apart from. */
        const onClick = (event) => {
            if (engine.moved) {
                /* A drag that ended over the label would otherwise
                   follow it. */
                event.preventDefault();
                return;
            }

            /* The anchor was handed the click itself, which happens when
               the press was never captured — a keyboard's own activation,
               most of all. Following a link is the browser's job. */
            if (event.target.closest && event.target.closest('a')) return;

            /* Otherwise the click arrived here retargeted: the drag needs
               pointer capture, and capture redirects the compatibility
               mouse events to the element holding it. So what the reader
               pressed is looked up rather than read off the event. The
               only link the live carousel shows is the label, and the
               label names the card in the middle. */
            const at = document.elementFromPoint(event.clientX, event.clientY);
            const link = at && at.closest ? at.closest('a[href]') : null;
            const index = link ? engine.shown : under(event);

            if (index < 0 || !engine.open) return;
            event.preventDefault();
            engine.open(index, event);
        };

        const onKey = (event) => {
            const strip = engine.strip;
            if (!strip) return;

            /* Enter opens whatever the label is naming, which is the
               project in the middle of the glass. The label itself is an
               anchor and does its own work. */
            if (event.key === 'Enter') {
                if (event.target.closest && event.target.closest('a')) return;
                if (!engine.open) return;
                event.preventDefault();
                engine.open(engine.shown, event);
                return;
            }

            const step = pitch(strip);
            if (event.key === 'ArrowRight') scroller.push(step);
            else if (event.key === 'ArrowLeft') scroller.push(-step);
            else if (event.key === 'Home') scroller.to(snapTo(strip, scroller.current, 0));
            else if (event.key === 'End') scroller.to(snapTo(strip, scroller.current, items.length - 1));
            else return;
            event.preventDefault();
            wake();
        };

        stage.addEventListener('wheel', onWheel, { passive: false });
        stage.addEventListener('pointerdown', onDown);
        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerup', onUp);
        stage.addEventListener('pointercancel', onUp);
        stage.addEventListener('pointerleave', onLeave);
        stage.addEventListener('click', onClick);
        stage.addEventListener('keydown', onKey);
        return () => {
            stage.removeEventListener('wheel', onWheel);
            stage.removeEventListener('pointerdown', onDown);
            stage.removeEventListener('pointermove', onMove);
            stage.removeEventListener('pointerup', onUp);
            stage.removeEventListener('pointercancel', onUp);
            stage.removeEventListener('pointerleave', onLeave);
            stage.removeEventListener('click', onClick);
            stage.removeEventListener('keydown', onKey);
            stage.classList.remove('is-over');
        };
    }, [live, items.length, wake]);

    return { stageRef, canvasRef, labelRef, shown, live };
}
