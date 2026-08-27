import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { onMedia, rafOnce } from './dom.js';
import { projects } from '../data/projects.js';

/* One interaction, repeated for every project: the row becomes the active
   one, and the preview plate travels down the right of the index to meet it.
   Below the desktop breakpoint — or on a touch screen — each row simply
   carries its own preview and a tap opens the case study.

   This hook holds the state that interaction is drawn from; the motion
   itself is in ProjectItem, on Framer Motion, with the timing in
   src/motion/variants.js.

     active   which project the index is showing
     stage    whether the travelling plate is on: the desktop breakpoint,
              with a pointer that can hover
     plateY   where the plate has to be to meet the active row, measured
     engaged  whether the index is being read — a pointer inside it, or a
              row holding focus. The only thing this decides is whether
              the rows that are not active recede.
     ready    one frame after mount, when real timings start. The first
              state the section resolves to on the client is therefore
              applied without a transition, so correcting the prerendered
              document to the measured one is invisible. */

/* Layout on the client, plain effect on the server. The breakpoint and the
   plate's offset have to be settled before the browser paints, or the section
   would show the prerendered arrangement for a frame first. */
const useLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* Matches the media query that turns on the travelling plate in CSS. */
const STAGE = '(min-width: 62rem) and (hover: hover) and (pointer: fine)';

export default function useWorkIndex() {
    const indexRef = useRef(null);
    const [active, setActive] = useState(projects[0].slug);
    const [engaged, setEngaged] = useState(false);
    const [stage, setStage] = useState(false);
    const [plateY, setPlateY] = useState(0);
    const [ready, setReady] = useState(false);
    /* Bumped by anything that can move the rows without changing which one
       is active — a resize, a late font, the breakpoint itself. */
    const [revision, setRevision] = useState(0);

    /* pointerenter covers mouse and pen; focusin gives the keyboard the same
       behaviour without a second code path. */
    const onRowEnter = useCallback((slug, e) => {
        if (e.pointerType === 'touch') return;
        setActive(slug);
    }, []);

    const onRowFocus = useCallback((slug) => setActive(slug), []);

    /* The index as a whole, rather than a row: a pointer leaving it leaves
       the last project on show, but stops the others receding. */
    const indexProps = {
        onPointerEnter: useCallback((e) => {
            if (e.pointerType === 'touch') return;
            setEngaged(true);
        }, []),
        onPointerLeave: useCallback(() => setEngaged(false), []),
        /* React's onFocus and onBlur are focusin and focusout, so they carry
           up from the row that gained or lost focus. Moving between two rows
           fires both in one batch and nets out true. */
        onFocus: useCallback(() => setEngaged(true), []),
        onBlur: useCallback(() => setEngaged(false), []),
    };

    useLayout(() => {
        const query = window.matchMedia(STAGE);
        const schedule = rafOnce();

        const sync = () => {
            setStage(query.matches);
            setRevision((n) => n + 1);
        };

        setStage(query.matches);
        const frame = requestAnimationFrame(() => setReady(true));

        const onChange = () => schedule(sync);

        window.addEventListener('resize', onChange, { passive: true });
        window.addEventListener('load', onChange);
        const offStage = onMedia(query, onChange);

        return () => {
            cancelAnimationFrame(frame);
            schedule.cancel();
            window.removeEventListener('resize', onChange);
            window.removeEventListener('load', onChange);
            offStage();
        };
    }, []);

    /* Where the plate has to be to meet the active row. Measured before the
       paint that shows the new active row, so the travel starts from where
       the plate actually is. */
    useLayout(() => {
        const index = indexRef.current;
        if (!stage || !index) return;

        const list = index.querySelector('.index__list');
        const row = index.querySelector('.idx.is-on');
        const figure = row && row.querySelector('.idx__figure');
        if (!list || !figure) return;

        const height = figure.offsetHeight;
        let y = row.offsetTop + (row.offsetHeight - height) / 2;
        const limit = Math.max(0, list.offsetHeight - height);

        if (y < 0) y = 0;
        if (y > limit) y = limit;

        setPlateY(Math.round(y * 10) / 10);
    }, [active, stage, revision]);

    return {
        indexRef,
        active,
        setActive,
        engaged,
        stage,
        plateY,
        ready,
        indexProps,
        onRowEnter,
        onRowFocus,
    };
}
