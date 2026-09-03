import { useEffect, useState } from 'react';

/* Shared primitives, carried over from the hand-written build so the
   behaviour is identical. */

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

export const motionOK = () =>
    !(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* The same preference, as state, for the one thing that has to follow it
   while the page is open rather than decide once: the carousel keeps its
   lens either way and gives up only the coasting, so a reader who changes
   the setting mid-visit is answered without a reload. False on the server
   and on the first client render, which is what the prerendered document
   assumes. */
export function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        return onMedia(query, () => setReduced(query.matches));
    }, []);

    return reduced;
}

/* False during the prerendered pass and on the very first client render, so
   markup that only makes sense with JavaScript running — the zoom control
   on a case-study image — is added afterwards rather than shipped dead in
   the HTML.

   It is also read the other way round, to WITHHOLD an attribute: the
   navigation panel's `inert` (src/components/Menu.jsx) must not reach the
   prerendered document, because there it would never be taken off again
   and the panel is the whole of the navigation a reader without a script
   is given. Either way the first client render matches the markup, which
   is what keeps hydration quiet. */
export function useEnhanced() {
    const [enhanced, setEnhanced] = useState(false);
    useEffect(() => setEnhanced(true), []);
    return enhanced;
}

/* The document's own path, and — for the same reason as above — only
   once the page is running: the prerendered pass has no location, and
   the first client render has to match what it wrote. Which of the case
   studies is open is read from here rather than handed down, so a page
   never has to be told which page it is. */
export function usePathname() {
    const [path, setPath] = useState('');
    useEffect(() => setPath(window.location.pathname), []);
    return path;
}
