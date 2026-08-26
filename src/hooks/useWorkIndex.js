import { useCallback, useEffect, useRef, useState } from 'react';
import { onMedia, rafOnce } from './dom.js';
import { projects } from '../data/projects.js';

/* One interaction, repeated for every project: the row becomes the active
   one, and the preview plate travels down the right of the index to meet it.
   Below the desktop breakpoint — or on a touch screen — each row simply
   carries its own preview and a tap opens the case study. */
export default function useWorkIndex() {
    const indexRef = useRef(null);
    const [active, setActive] = useState(projects[0].slug);

    /* pointerenter covers mouse and pen; focusin gives the keyboard the same
       behaviour without a second code path. */
    const onRowEnter = useCallback((slug, e) => {
        if (e.pointerType === 'touch') return;
        setActive(slug);
    }, []);

    const onRowFocus = useCallback((slug) => setActive(slug), []);

    useEffect(() => {
        const index = indexRef.current;
        if (!index) return undefined;

        const list = index.querySelector('.index__list');
        /* Matches the media query that turns on the travelling plate in CSS. */
        const stageQuery = window.matchMedia('(min-width: 62rem) and (hover: hover) and (pointer: fine)');
        const schedule = rafOnce();

        const placePlate = () => {
            const row = index.querySelector('.idx.is-on');
            if (!row || !list || !stageQuery.matches) return;

            const figure = row.querySelector('.idx__figure');
            if (!figure) return;

            const height = figure.offsetHeight;
            let y = row.offsetTop + (row.offsetHeight - height) / 2;
            let limit = list.offsetHeight - height;

            if (limit < 0) limit = 0;
            if (y < 0) y = 0;
            if (y > limit) y = limit;

            index.style.setProperty('--plate-y', `${y.toFixed(1)}px`);
        };

        const onChange = () => schedule(placePlate);

        placePlate();
        schedule(placePlate);

        window.addEventListener('resize', onChange, { passive: true });
        window.addEventListener('load', onChange);
        const offStage = onMedia(stageQuery, onChange);

        return () => {
            schedule.cancel();
            window.removeEventListener('resize', onChange);
            window.removeEventListener('load', onChange);
            offStage();
        };
    }, [active]);

    return { indexRef, active, setActive, onRowEnter, onRowFocus };
}
