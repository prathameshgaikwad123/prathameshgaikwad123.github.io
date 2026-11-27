import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Scroller from '../carousel/scroll.js';
import { wrapCentred } from '../carousel/layout.js';

const PARALLAX = 0.12;
const SHOT_SCALE = 1.34;

const PARALLAX_CLAMP = 1.25;

const FOCUS_ONSET = 0.38;
const FOCUS_FADE = 0.34;

const SMEAR = 0.07;
const SMEAR_SPEED = 1.2;

const DRIFT = 0.16;
const DRIFT_MAX = 900;

const DRAG_SLOP = 6;

const HYSTERESIS = 0.1;

const MAX_COPIES = 8;

const useLatest =
    typeof window === 'undefined' ? (fn) => useEffect(fn) : (fn) => useLayoutEffect(fn);

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

export default function usePlateRail({ items, reduced }) {
    const railRef = useRef(null);
    const trackRef = useRef(null);
    const meterRef = useRef(null);

    const [shown, setShown] = useState(0);
    const [live, setLive] = useState(false);

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

    const measure = useCallback(() => {
        const rail = railRef.current;
        const track = trackRef.current;
        if (!rail || !track) return;

        const stageW = rail.clientWidth;
        if (!(stageW > 1)) return;

        const cells = [].slice.call(track.children);
        if (!cells.length) return;

        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;

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

        const shots = cells.map((cell) => cell.querySelector('.beh__shot'));
        const last = cells.length - 1;
        const modulus = base[last] + width[last] + gap - base[0];
        if (!(modulus > 0)) return;

        const widest = width.reduce((a, b) => (b > a ? b : a), 0);
        const unit = modulus / engine.copies;

        const seat =
            anchor && anchor.i < base.length
                ? base[anchor.i] + width[anchor.i] / 2 - stageW / 2 - anchor.off * width[anchor.i]
                : null;
        if (seat != null) {
            const flight = engine.scroller.target - engine.scroller.current;
            engine.scroller.current = seat;
            engine.scroller.target = seat + flight;

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

            const centre = half + wrapCentred(base[i] + w / 2 - scroll - half, modulus);

            const away = Math.abs(centre - half);
            if (away < least) {
                least = away;
                nearest = i;
            }
            if (i === engine.held) heldAway = away;

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

        rail.scrollLeft = 0;

        const sized = new ResizeObserver(() => {
            measure();
            place();
            wake();
        });
        sized.observe(rail);

        const seen = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                engine.onscreen = entry.isIntersecting;
                if (entry.isIntersecting) wake();
            },
            { rootMargin: '250px 0px' },
        );
        seen.observe(rail);

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

    useEffect(() => {
        const rail = railRef.current;
        if (!rail || !live) return undefined;
        const { scroller } = engine;

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
