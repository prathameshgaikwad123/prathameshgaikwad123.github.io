import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createGlass } from '../carousel/glass.js';
import Scroller from '../carousel/scroll.js';
import { buildStrip, visible, activeIndex, cardAt, nearestSnap, snapTo, pitch } from '../carousel/layout.js';
import { CARD_W, CARD_H, GAP, STRIP_Y, FADE_IN, FADE_OUT, SURGE_SPEED } from '../carousel/config.js';
import { activeTheme, afterLoad } from './dom.js';

const useLatest =
    typeof window === 'undefined'
        ? (fn) => useEffect(fn)
        : (fn) => useLayoutEffect(fn);

const DRAG_SLOP = 6;

const ring = (centre, count) =>
    Array.from({ length: count }, (_, i) => i).sort((a, b) => {
        const da = Math.min(Math.abs(a - centre), count - Math.abs(a - centre));
        const db = Math.min(Math.abs(b - centre), count - Math.abs(b - centre));
        return da - db || a - b;
    });

const num = (value, fallback) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

function themeGround() {
    return activeTheme() === 'dark' ? [0, 0, 0] : [1, 1, 1];
}

function readGround(element) {
    const declared = getComputedStyle(element).backgroundColor;
    const parts = declared.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return themeGround();
    if (parts.length > 3 && Number.parseFloat(parts[3]) < 1) return themeGround();
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

export default function useGlassCarousel({ items, reduced, onOpen }) {
    const stageRef = useRef(null);
    const canvasRef = useRef(null);
    const labelRef = useRef(null);
    const [shown, setShown] = useState(0);
    const [live, setLive] = useState(false);

    const [fallback, setFallback] = useState(false);

    const [generation, setGeneration] = useState(0);

    const sources = useMemo(() => items.map((item) => item.tile || item.cover), [items]);

    const engine = useRef({
        glass: null,
        strip: null,
        scroller: new Scroller(),
        list: [],
        frame: 0,
        last: 0,
        running: false,
        onscreen: true,

        fetching: false,
        target: 0,
        pointer: null,
        fade: 1,
        phase: 'in',
        pending: 0,
        current: 0,
        reduced: false,
        arrived: false,

        startX: 0,
        startY: 0,
        moved: false,
        open: null,

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

        engine.target = strip.height * 1.6 * engine.glass.size.dpr;
        if (engine.fetching) {
            engine.glass.textures.start(
                engine.target,
                ring(activeIndex(strip, engine.scroller.current), items.length),
            );
        }
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

    useLatest(() => {

        engine.reduced = !!reduced;
        engine.tick = tick;

        engine.open = onOpen || null;
    });

    /* --- mount ------------------------------------------------------ */
    useEffect(() => {
        const canvas = canvasRef.current;
        const stage = stageRef.current;
        if (!canvas || !stage) return undefined;

        const glass = createGlass(canvas, sources, () => wake());
        if (!glass) {
            setFallback(true);
            return undefined;
        }
        engine.glass = glass;
        setLive(true);
        setFallback(false);
        measure();
        draw();

        const observer = new ResizeObserver(() => {
            measure();
            wake();
        });
        observer.observe(stage);

        const seen = new IntersectionObserver(
            (entries) => {
                const entry = entries[entries.length - 1];
                engine.onscreen = entry.isIntersecting;
                if (!entry.isIntersecting) {
                    settleNow();
                    return;
                }

                if (!engine.arrived && entry.intersectionRatio > 0.3 && engine.strip && !engine.reduced) {
                    engine.arrived = true;
                    engine.scroller.push(engine.strip.height * 0.9);
                }
                wake();
            },
            { rootMargin: '200px 0px', threshold: [0, 0.32] },
        );
        seen.observe(stage);

        let loaded = false;
        let near = false;
        const fetchCovers = (now) => {
            if (engine.fetching || !engine.strip) return;
            if (!now && !(loaded && near)) return;
            engine.fetching = true;
            glass.textures.start(
                engine.target,
                ring(activeIndex(engine.strip, engine.scroller.current), sources.length),
                now,
            );
        };
        const offLoad = afterLoad(() => {
            loaded = true;
            fetchCovers();
        });
        const ahead = new IntersectionObserver(
            (entries) => {
                if (!entries[entries.length - 1].isIntersecting) return;
                near = true;
                ahead.disconnect();
                fetchCovers();
            },
            { rootMargin: '100% 0px' },
        );
        ahead.observe(stage);

        const arrived = new IntersectionObserver((entries) => {
            if (!entries[entries.length - 1].isIntersecting) return;
            arrived.disconnect();
            fetchCovers(true);
        });
        arrived.observe(stage);

        let ground = null;
        let groundFrame = 0;

        const followGround = () => {
            if (groundFrame) return;
            groundFrame = requestAnimationFrame(() => {
                groundFrame = 0;
                const next = readGround(stage);
                if (
                    ground
                    && next[0] === ground[0]
                    && next[1] === ground[1]
                    && next[2] === ground[2]
                ) return;
                ground = next;
                glass.setGround(next);

                if (engine.onscreen && !engine.running) draw();
            });
        };

        const theme = new MutationObserver(followGround);

        theme.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        const scheme = window.matchMedia('(prefers-color-scheme: dark)');
        const onScheme = followGround;
        scheme.addEventListener('change', onScheme);

        return () => {
            cancelAnimationFrame(engine.frame);
            if (groundFrame) cancelAnimationFrame(groundFrame);
            engine.running = false;
            observer.disconnect();
            seen.disconnect();
            ahead.disconnect();
            arrived.disconnect();
            offLoad();
            engine.fetching = false;
            theme.disconnect();
            scheme.removeEventListener('change', onScheme);
            glass.dispose();
            engine.glass = null;
        };
    }, [sources, measure, draw, wake, settleNow, generation]);

    /* --- a lost context ---------------------------------------------- */

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const onLost = (event) => {
            event.preventDefault();
            setLive(false);
            setFallback(true);
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

            try {
                stage.setPointerCapture(event.pointerId);
            } catch (error) { /* not capturable */ }
            scroller.dragStart(event.clientX, event.timeStamp / 1000);
            stage.classList.add('is-held');
            wake();
        };

        const leads = (index) => index >= 0 && !!(items[index] && items[index].href);

        const onMove = (event) => {
            if (engine.pointer !== event.pointerId) {

                if (engine.pointer === null && event.pointerType !== 'touch') {
                    stage.classList.toggle('is-over', leads(under(event)));
                }
                return;
            }

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

        const onClick = (event) => {
            if (engine.moved) {

                event.preventDefault();
                return;
            }

            if (event.target.closest && event.target.closest('a')) return;

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
    }, [live, items, wake]);

    return { stageRef, canvasRef, labelRef, shown, live, fallback };
}
