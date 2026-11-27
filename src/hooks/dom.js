import { useEffect, useState } from 'react';

export function onMedia(query, handler) {
    if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', handler);
        return () => query.removeEventListener('change', handler);
    }
    if (typeof query.addListener === 'function') {
        query.addListener(handler); /* Safari < 14 */
        return () => query.removeListener(handler);
    }
    return () => {};
}

/* One shared rAF slot per caller: handlers coalesce to one write. */
export function rafOnce() {
    let pending = false;
    let run = null;
    let frame = 0;

    const schedule = (fn) => {
        run = fn;
        if (pending) return;
        pending = true;
        frame = requestAnimationFrame(() => {
            pending = false;
            if (run) run();
        });
    };

    schedule.cancel = () => {
        if (pending) cancelAnimationFrame(frame);
        pending = false;
        run = null;
    };

    return schedule;
}

export function afterLoad(fn) {
    if (typeof window === 'undefined') return () => {};
    let idle = 0;
    let beat = 0;
    const settle = () => {
        if (typeof window.requestIdleCallback === 'function') {
            idle = window.requestIdleCallback(fn, { timeout: 1500 });
        } else {
            beat = window.setTimeout(fn, 200);
        }
    };
    if (document.readyState === 'complete') settle();
    else window.addEventListener('load', settle, { once: true });
    return () => {
        window.removeEventListener('load', settle);
        if (idle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
        if (beat) window.clearTimeout(beat);
    };
}

export const motionOK = () =>
    !(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export const activeTheme = () => {
    if (typeof document === 'undefined') return 'light';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    return typeof window !== 'undefined'
        && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
};

export function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        return onMedia(query, () => setReduced(query.matches));
    }, []);

    return reduced;
}

export function useEnhanced() {
    const [enhanced, setEnhanced] = useState(false);
    useEffect(() => setEnhanced(true), []);
    return enhanced;
}

export function usePathname() {
    const [path, setPath] = useState('');
    useEffect(() => setPath(window.location.pathname), []);
    return path;
}
