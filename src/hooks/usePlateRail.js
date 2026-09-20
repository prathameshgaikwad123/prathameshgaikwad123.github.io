import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Scroller from '../carousel/scroll.js';
import { wrapCentred } from '../carousel/layout.js';

/* ===================================================================
   THE PLATE RAIL — THE LOOP
   -------------------------------------------------------------------
   The Behance gallery as one endless horizontal rail, thrown by hand
   and read through a fixed gate at the middle of the stage.

   It is the second moving strip on the page and it is deliberately not
   the first one again. Selected Work is a rigid row passing behind a
   pane of glass: the strip is flat, the field is the effect, and it
   snaps so the reader is always looking at one project. This is the
   opposite arrangement — the field is flat, the depth is in the
   plates, and nothing snaps. A gallery has no one thing to be looking
   at, so it is never brought to a stop on one.

   What the plates do that a grid cannot:

     parallax   the picture sits behind its own crop, so it lags the
                frame it is in. That is the whole of the reference
                effect, and the one thing a static plate cannot say —
                that there is a depth to look into.
     focus      a plate fades toward the page as it leaves the middle,
                so the rail dissolves into the margin rather than
                running into a hard edge. Flat across the middle and
                then a ramp, which is the shape the glass lens next
                door has — at its own onset, not this one.
     smear      thrown hard, the picture stretches and the frame does
                not. A frame is a measuring device on this site — it
                has crop ticks on it — and a measuring device that
                deforms is a broken one. The photograph inside it is
                free to smear.
     drift      the rail is pushed by the page's own scrolling while
                it is on screen, so the gallery is already moving when
                it is reached rather than waiting to be touched.

   Everything per-frame is written straight to the elements. React sees
   one piece of state — which plate is in the gate, for the counter —
   and that changes six times a lap rather than sixty times a second.

   The scroll model is the carousel's, imported rather than copied:
   exponential smoothing toward a driven target, with the release
   velocity of the throw handed to it on lift. See src/carousel/scroll.js,
   where the coefficient is fitted against a real recording. This is the
   second instrument playing it, which is the point — two strips on one
   page that coast differently would read as two sites.
   =================================================================== */

/* --- Parallax ------------------------------------------------------
   How far the picture lags its frame, as a fraction of the plate's own
   width, at the rim of the stage. Small on purpose: this is a depth
   cue and not a pan, and every pixel of it is a pixel of the export
   that is off the plate at one end of the rail — so it is bounded by
   what a cover can lose rather than by what reads best on its own.

   SHOT_SCALE is what pays for it. The picture is blown up inside its
   crop so that the lag can never reach an edge: PARALLAX of overhang
   either side, and the widest the smear below can stretch it, and a
   little over. Raise either of the two and this has to come up with
   them, or a plate at the rim shows the ground behind its own
   photograph. ASSETS.md carries the other half of this — what it
   means for the export. */
const PARALLAX = 0.12;
const SHOT_SCALE = 1.34;

/* A plate at the very rim of the stage is a little past u = ±1, and
   without this its picture would keep sliding after the plate had
   stopped being worth looking at. */
const PARALLAX_CLAMP = 1.25;

/* --- Focus ---------------------------------------------------------
   Flat across the middle, then a ramp to the rims — the same shape the
   lens in section 9 has, and for the same reason: an effect that
   starts at the centre is an effect the reader cannot see the start
   of. ONSET is where the ramp begins in u, FADE is how much of the
   plate is left at the end of it.

   It fades toward the page rather than toward grey, because opacity is
   the one treatment that is correct in both themes without being
   declared twice: a plate leaving the middle dissolves into white on
   the white page and into black on the black one. */
const FOCUS_ONSET = 0.38;
const FOCUS_FADE = 0.34;

/* --- Smear ---------------------------------------------------------
   The picture's horizontal stretch at full speed, and the speed that
   counts as full — in stage widths per second, which is what the
   scroll model already reports velocity in.

   The saturation point is deliberately below what a hard flick
   reaches, so that the top of a throw is a smear that holds for a beat
   rather than a spike on one frame. It is the picture that stretches
   and never the plate: seven per cent, on an image already blown up by
   a third, is a softening at speed rather than a distortion anybody
   can point at once the rail has stopped. */
const SMEAR = 0.07;
const SMEAR_SPEED = 1.2;

/* --- Drift ---------------------------------------------------------
   What one pixel of page scrolling is worth to the rail. At this rate
   a screenful of reading moves the rail by something between a third
   and a half of a plate, whatever the screen — enough that the gallery
   is alive on the way past, far too little to read as the page having
   taken the scroll away from the reader.

   A jump — an anchor, a restored position, a swipe on a phone that
   flings the whole document — is clamped rather than passed on, for
   the same reason the scroll model clamps a long frame: the rail would
   teleport, and nobody can see the travel it loses instead. */
const DRIFT = 0.16;
const DRIFT_MAX = 900;

/* How far a pointer may travel between press and release and still be
   read as a click on a plate rather than as a throw of the rail. The
   carousel's own figure, because it is the same hand. */
const DRAG_SLOP = 6;

/* How much nearer the gate a plate has to be before it takes the
   counter off the one that is there. Without it a boundary sitting on
   the gate flickers between two numbers; a tenth of a plate of
   stickiness is under what a reader can see and well over what the
   filter's own jitter can cross. */
const HYSTERESIS = 0.1;

/* A ceiling on how many times the set is repeated to fill the stage —
   see `copies` below. Six plates at the widths this section is set at
   need one copy at every breakpoint, measured from 390 to 2400 across;
   the ceiling is there so a list that is somehow measured at nothing
   cannot ask for a thousand of them. */
const MAX_COPIES = 8;

/* Layout on the client, plain effect on the server: useLayoutEffect has
   nothing to do on a render that never paints, and warns if asked. */
const useLatest =
    typeof window === 'undefined' ? (fn) => useEffect(fn) : (fn) => useLayoutEffect(fn);

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export default function usePlateRail({ items, reduced }) {
    const railRef = useRef(null);
    const trackRef = useRef(null);
    const meterRef = useRef(null);

    /* The plate in the gate, for the counter under the rail. Along
       with `live` and `copies`, one of the three things on this hook
       that React is told about at all — and the only one that changes
       while the reader is doing something. */
    const [shown, setShown] = useState(0);
    const [live, setLive] = useState(false);

    /* How many times the set of plates is laid down end to end.

       The rail wraps rather than clones: each plate is placed once, on
       an endless line, and scrolling moves the line. That works as long
       as the line is longer than the stage with a plate to spare at
       each end — otherwise the fold leaves a hole in the middle of the
       row, which is the one thing an endless rail must never show.

       Six plates at this section's widths are always long enough, on
       every screen, because the plate's width is a fraction of the
       stage's. The repeat exists for the case the data changes and
       nobody thinks to check: three plates, or two. A repeated plate is
       the same link to the same project — it is hidden from assistive
       technology and kept out of the tab order, and it is still
       perfectly clickable, because on screen it is simply the plate
       coming round again. */
    const [copies, setCopies] = useState(1);

    const engine = useRef({
        scroller: new Scroller(),
        cells: [],
        shots: [],
        base: [],
        width: [],
        stageW: 0,
        modulus: 0,
        unit: 0, /* one lap of the set, whatever the repeat is */
        frame: 0,
        last: 0,
        running: false,
        onscreen: false,
        reduced: false,
        pointer: null,
        startX: 0,
        startY: 0,
        lastX: 0,
        moved: false,
        scrollY: 0,
        current: 0,
        held: 0,
        copies: 1,
    }).current;

    /* --- measurement -------------------------------------------------
       Read off the layout rather than computed from tokens. The track
       is a flex row in ordinary flow, so the browser has already
       decided every plate's width and position from the stylesheet —
       including at a breakpoint this file knows nothing about. The wrap
       only ever moves a plate away from where CSS put it, which is the
       site's rule for every other effect on the page. */
    const measure = useCallback(() => {
        const rail = railRef.current;
        const track = trackRef.current;
        if (!rail || !track) return;

        const stageW = rail.clientWidth;
        if (!(stageW > 1)) return;

        const cells = [].slice.call(track.children);
        if (!cells.length) return;

        /* The gap is the stylesheet's, and it is part of the lap: the
           distance from the last plate back round to the first is one
           gap, or the seam would close up once a lap. */
        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;

        /* Read before anything below replaces it: the plate nearest the
           gate, and how far off the gate it stood in its own widths. */
        let anchor = null;
        if (engine.unit > 0 && engine.cells.length) {
            const was = engine.stageW / 2;
            let least = Infinity;
            for (let i = 0; i < engine.cells.length; i += 1) {
                const at =
                    wrapCentred(
                        engine.base[i] + engine.width[i] / 2 - engine.scroller.current - was,
                        engine.modulus,
                    );
                if (Math.abs(at) < least) {
                    least = Math.abs(at);
                    anchor = { i, off: at / engine.width[i] };
                }
            }
        }

        const base = cells.map((cell) => cell.offsetLeft);
        const width = cells.map((cell) => cell.offsetWidth);
        /* Looked up once per resize rather than once per plate per
           frame. A querySelector inside the loop is a tree walk sixty
           times a second for an answer that only changes when the
           markup does. */
        const shots = cells.map((cell) => cell.querySelector('.beh__shot'));
        const last = cells.length - 1;
        const modulus = base[last] + width[last] + gap - base[0];
        if (!(modulus > 0)) return;

        const widest = width.reduce((a, b) => (b > a ? b : a), 0);
        const unit = modulus / engine.copies;

        /* A resize rebuilds the layout under the reader, and what they
           are owed across it is the plate they were looking at, where
           they were looking at it.

           So it is re-seated rather than scaled. The carousel next door
           hands its filter the ratio of the old lap to the new one,
           which keeps the reader's place *in the set* — the right
           answer there, because the strip snaps and the card in the
           middle is the whole state. Here there is no snap and the
           stage's own middle is the state, and a ratio does not carry
           it: between two breakpoints both the plate and the stage
           change, by different amounts, and the plate the reader was
           reading walks a fifth of the screen sideways.

           What is recorded instead is that plate and how far off the
           gate it stood, measured in its own widths, and the scroll is
           solved back out of it afterwards. The gap between target and
           current — a throw still running — is carried over so a
           resize mid-flight slows down rather than stopping dead. */
        const seat =
            anchor && anchor.i < base.length
                ? base[anchor.i] + width[anchor.i] / 2 - stageW / 2 - anchor.off * width[anchor.i]
                : null;
        if (seat != null) {
            const flight = engine.scroller.target - engine.scroller.current;
            engine.scroller.current = seat;
            engine.scroller.target = seat + flight;
            /* A hand still on the rail is holding an anchor measured in
               the layout that has just been replaced — a phone turned
               mid-swipe is the case — and the next move would snap the
               row to it. Restarting the gesture from where the finger
               actually is re-takes that anchor against the new layout.
               What it costs is the samples behind it, so a throw
               released in the same instant as the rotation lands with
               no inertia; the alternative is a jump. */
            if (engine.scroller.dragging) {
                engine.scroller.dragStart(engine.lastX, performance.now() / 1000);
            }
        }

        engine.cells = cells;
        engine.shots = shots;
        engine.base = base;
        engine.width = width;
        engine.stageW = stageW;
        engine.modulus = modulus;
        engine.unit = unit;
        engine.scroller.modulus = modulus;
        engine.scroller.restScale = stageW;

        /* The line has to outlast the stage by a plate at either end. */
        const needed = stageW + widest * 2;
        if (modulus < needed) {
            const wanted = Math.min(MAX_COPIES, Math.ceil(needed / unit));
            if (wanted !== engine.copies) {
                engine.copies = wanted;
                setCopies(wanted);
            }
        }
    }, []);

    /* --- the frame ---------------------------------------------------
       One pass over the cells: where each one is on the endless line,
       how far its picture lags, how far it has left the gate, and —
       for any that are wholly outside the stage — nothing at all.

       Written as inline styles rather than as custom properties. A
       custom property is the more declarative way to hand a number to
       the stylesheet, and it is the wrong one here: setting one
       invalidates the whole subtree under the element it is set on, and
       this runs on every plate in the row for as long as the rail is
       moving. The one number that is handed over as a property is the
       meter's, which has two spans under it and changes once a
       frame. */
    const place = useCallback(() => {
        const { cells, shots, base, width, stageW, modulus, unit, scroller } = engine;
        if (!cells.length || !(stageW > 0) || !(modulus > 0)) return;

        const half = stageW / 2;
        const speed = clamp(Math.abs(scroller.velocity) / (stageW * SMEAR_SPEED), 0, 1);
        const smear = 1 + speed * SMEAR;
        const scroll = scroller.current;

        let nearest = 0;
        let least = Infinity;
        let heldAway = Infinity;

        for (let i = 0; i < cells.length; i += 1) {
            const cell = cells[i];
            const w = width[i];
            /* Where the plate's centre is on the stage this frame, by
               the near copy of itself: the fold is about the stage's
               own middle, so the plate reported closest to the gate is
               always the one the reader is actually looking at. */
            const centre = half + wrapCentred(base[i] + w / 2 - scroll - half, modulus);

            const away = Math.abs(centre - half);
            if (away < least) {
                least = away;
                nearest = i;
            }
            if (i === engine.held) heldAway = away;

            /* Off the stage by more than its own width: not drawn, not
               measured, and not composited. */
            if (centre + w < -w || centre - w > stageW + w) {
                if (cell.style.visibility !== 'hidden') cell.style.visibility = 'hidden';
                continue;
            }
            if (cell.style.visibility) cell.style.visibility = '';

            cell.style.transform = `translate3d(${(centre - w / 2 - base[i]).toFixed(2)}px,0,0)`;

            const u = (centre - half) / half;
            const e = clamp((Math.abs(u) - FOCUS_ONSET) / (1 - FOCUS_ONSET), 0, 1);
            cell.style.opacity = (1 - FOCUS_FADE * e * e).toFixed(3);

            const shot = shots[i];
            if (shot) {
                const lag = -clamp(u, -PARALLAX_CLAMP, PARALLAX_CLAMP) * PARALLAX * 100;
                shot.style.transform =
                    `translate3d(${lag.toFixed(2)}%,0,0) scaleX(${smear.toFixed(4)}) scale(${SHOT_SCALE})`;
            }
        }

        /* Which plate the gate is on. Sticky, so a seam sitting exactly
           on the gate does not flicker the counter between two numbers
           at sixty hertz: the plate holding it keeps it until another
           is nearer by a tenth of a plate. */
        const n = items.length;
        if (nearest !== engine.held && least < heldAway - (unit / n) * HYSTERESIS) {
            engine.held = nearest;
            const next = nearest % n;
            if (next !== engine.current) {
                engine.current = next;
                setShown(next);
            }
        }

        const meter = meterRef.current;
        if (meter && unit > 0) {
            const lap = (((scroll % unit) + unit) % unit) / unit;
            meter.style.setProperty('--beh-lap', lap.toFixed(4));
        }
    }, [items.length]);

    const wake = useCallback(() => {
        if (engine.running || !engine.onscreen) return;
        engine.running = true;
        engine.last = 0;
        engine.frame = requestAnimationFrame(engine.tick);
    }, []);

    const tick = (now) => {
        const dt = engine.last ? Math.min((now - engine.last) / 1000, 0.1) : 1 / 60;
        engine.last = now;

        /* No settle value, ever. The rail does not snap: a gallery has
           no one plate to be brought to rest on, and a rail that always
           ends on one would be an index with the numbers taken off. */
        engine.scroller.step(dt, null);
        place();

        if (!engine.scroller.settled && engine.onscreen) {
            engine.frame = requestAnimationFrame(engine.tick);
        } else {
            engine.running = false;
        }
    };

    useLatest(() => {
        engine.reduced = !!reduced;
        engine.tick = tick;
    });

    /* --- going live --------------------------------------------------
       Until this runs the rail is what the stylesheet made it: a plain
       horizontal scroller with snap points, which is what the
       prerendered document ships, what a reader without a script gets,
       and what a reader who has asked for less motion keeps. The
       takeover is one attribute and one set of listeners, and undoing
       it puts every plate back where CSS had it. */
    useEffect(() => {
        if (reduced) {
            setLive(false);
            return undefined;
        }
        const rail = railRef.current;
        const track = trackRef.current;
        if (!rail || !track) return undefined;

        setLive(true);
        engine.copies = copies;
        measure();
        place();

        /* A reader may have pushed the native scroller sideways in the
           beat before this ran. The rail is about to stop being one. */
        rail.scrollLeft = 0;

        const sized = new ResizeObserver(() => {
            measure();
            place();
            wake();
        });
        sized.observe(rail);

        /* A section three screens down should not be holding a frame
           budget, so the loop only runs while the rail is on screen.

           There is no entrance here, and that is not an omission. The
           carousel next door is given a push as it is reached and
           coasts to rest, because it is a strip that would otherwise
           be standing still when the reader arrived at it. This one
           never is: the drift below has been moving it for the whole
           screen of reading it took to get here, so by the time the
           rail is on screen it is already in motion, and the thing
           that put it there is the reader's own scrolling rather than
           a cue fired at them. A reader who lands on the section
           directly — a link to /#behance — finds it at rest with the
           first plate flush against the page's own gutter, which is
           the composition the grid it replaced had. */
        const seen = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                engine.onscreen = entry.isIntersecting;
                if (entry.isIntersecting) wake();
            },
            { rootMargin: '250px 0px' },
        );
        seen.observe(rail);

        /* The page's own scrolling, handed to the rail at about a
           sixth of its value. Sampled on the event rather than read per
           frame, so a document that has not moved costs nothing and a
           rail that is not on screen costs one comparison. */
        engine.scrollY = window.scrollY || window.pageYOffset || 0;
        const onScroll = () => {
            const y = window.scrollY || window.pageYOffset || 0;
            const dy = y - engine.scrollY;
            engine.scrollY = y;
            if (!engine.onscreen || engine.scroller.dragging) return;
            if (!dy) return;
            engine.scroller.push(clamp(dy, -DRIFT_MAX, DRIFT_MAX) * DRIFT);
            wake();
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        /* Overflow is hidden while the rail is live, and a browser will
           still scroll a hidden box to reveal something focused inside
           it — which would take the whole row sideways and leave every
           plate a scrollbar's width from where the loop thinks it is.
           So the box is put back and the rail is asked to bring that
           plate to the gate instead, which is what the reader wanted
           and the only thing the rail can honour. */
        const onRailScroll = () => {
            if (rail.scrollLeft !== 0) rail.scrollLeft = 0;
        };
        rail.addEventListener('scroll', onRailScroll);

        const onFocus = (event) => {
            const cell = event.target.closest ? event.target.closest('.beh__cell') : null;
            const i = cell ? engine.cells.indexOf(cell) : -1;
            if (i < 0) return;
            const half = engine.stageW / 2;
            const scroll = engine.scroller.current;
            engine.scroller.to(
                scroll +
                    wrapCentred(
                        engine.base[i] + engine.width[i] / 2 - scroll - half,
                        engine.modulus,
                    ),
            );
            wake();
        };
        rail.addEventListener('focusin', onFocus);

        return () => {
            cancelAnimationFrame(engine.frame);
            engine.running = false;
            sized.disconnect();
            seen.disconnect();
            window.removeEventListener('scroll', onScroll);
            rail.removeEventListener('scroll', onRailScroll);
            rail.removeEventListener('focusin', onFocus);
            /* Back to the resting state the stylesheet declares, so a
               reader who turns reduced motion on mid-visit is handed a
               plain scroller rather than a row frozen mid-throw. */
            engine.cells.forEach((cell) => {
                cell.style.transform = '';
                cell.style.opacity = '';
                cell.style.visibility = '';
                const shot = cell.querySelector('.beh__shot');
                if (shot) shot.style.transform = '';
            });
            engine.cells = [];
            engine.unit = 0;
        };
    }, [items, copies, reduced, measure, place, wake]);

    /* --- input -------------------------------------------------------
       Throw, wheel and keyboard. Every plate is a real anchor in the
       document, so nothing here has to find a link: the only thing a
       click needs from this hook is to be told when it was the end of a
       gesture rather than a press. */
    useEffect(() => {
        const rail = railRef.current;
        if (!rail || !live) return undefined;
        const { scroller } = engine;

        /* Horizontal only. A page section may not eat the vertical
           wheel — the reader is on their way down the document and a
           gallery that swallows that is a trap. Shift plus wheel is
           offered because that is the gesture a mouse has. */
        const onWheel = (event) => {
            const dx =
                Math.abs(event.deltaX) > 0.5 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
            if (!dx) return;
            event.preventDefault();
            const unit =
                event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
            scroller.push(dx * unit);
            wake();
        };

        /* The throw is tracked on the window rather than through
           setPointerCapture, and that is not a style preference.

           Capture redirects the compatibility mouse events to the
           element holding it, `click` among them — so a press on a
           plate arrives at the rail instead of at the anchor, and every
           link in the gallery quietly stops working. The carousel next
           door lives with that because its cards are pixels in a canvas
           and it has to find the link by hit-testing anyway. Here the
           plates *are* links, and a slider that breaks its own links to
           be draggable has the trade the wrong way round.

           What capture was for is still needed: a hand that leaves the
           rail mid-throw, or lifts over the navigation, must not leave
           the strip stuck to it. The window listeners do that, and they
           exist only for the length of the gesture. */
        let tracking = null;

        const onMove = (event) => {
            if (engine.pointer !== event.pointerId) return;
            if (
                Math.abs(event.clientX - engine.startX) > DRAG_SLOP ||
                Math.abs(event.clientY - engine.startY) > DRAG_SLOP
            ) {
                engine.moved = true;
            }
            engine.lastX = event.clientX;
            scroller.dragMove(event.clientX, event.timeStamp / 1000);
            wake();
        };

        const onUp = (event) => {
            if (engine.pointer !== event.pointerId) return;
            engine.pointer = null;
            scroller.dragEnd(event.timeStamp / 1000);
            rail.classList.remove('is-held');
            untrack();
            wake();
        };

        function untrack() {
            if (!tracking) return;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            tracking = null;
        }

        const onDown = (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            engine.pointer = event.pointerId;
            engine.startX = event.clientX;
            engine.startY = event.clientY;
            engine.lastX = event.clientX;
            engine.moved = false;
            scroller.dragStart(event.clientX, event.timeStamp / 1000);
            rail.classList.add('is-held');
            untrack();
            tracking = true;
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
            wake();
        };

        /* A throw that happens to end over a plate must not also open
           it. Captured, because the anchor is a real one and would
           otherwise have followed itself before this ran. */
        const onClick = (event) => {
            if (!engine.moved) return;
            event.preventDefault();
            event.stopPropagation();
            engine.moved = false;
        };

        const onKey = (event) => {
            /* Enter and Space on a plate belong to the plate. */
            if (event.target.closest && event.target.closest('a')) {
                if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            }
            const step = engine.unit / items.length;
            /* Home and End fetch the first and the last plate to the
               gate by the shortest way round, rather than winding the
               rail back to an origin the reader has no picture of. */
            const fetch = (i) => {
                const half = engine.stageW / 2;
                const at = scroller.current;
                scroller.to(
                    at +
                        wrapCentred(
                            engine.base[i] + engine.width[i] / 2 - at - half,
                            engine.modulus,
                        ),
                );
            };
            if (event.key === 'ArrowRight') scroller.push(step);
            else if (event.key === 'ArrowLeft') scroller.push(-step);
            else if (event.key === 'Home') fetch(0);
            else if (event.key === 'End') fetch(items.length - 1);
            else return;
            event.preventDefault();
            wake();
        };

        rail.addEventListener('wheel', onWheel, { passive: false });
        rail.addEventListener('pointerdown', onDown);
        /* Captured, so it runs before the anchor it is about to stop. */
        rail.addEventListener('click', onClick, true);
        rail.addEventListener('keydown', onKey);

        return () => {
            /* A gesture can outlive this effect — reduced motion set
               with a finger still down, or a repeat added mid-throw.
               The filter must not be left believing it is being held,
               or the drift below it never runs again. */
            untrack();
            engine.pointer = null;
            scroller.dragging = false;
            rail.removeEventListener('wheel', onWheel);
            rail.removeEventListener('pointerdown', onDown);
            rail.removeEventListener('click', onClick, true);
            rail.removeEventListener('keydown', onKey);
            rail.classList.remove('is-held');
        };
    }, [live, items.length, wake]);

    return { railRef, trackRef, meterRef, shown, live, copies };
}
