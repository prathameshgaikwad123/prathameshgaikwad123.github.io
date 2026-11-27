import { useCallback, useEffect, useState } from 'react';
import useGlassCarousel from '../hooks/useGlassCarousel.js';
import { responsive } from '../data/cloudinary.js';

const pad = (n) => String(n + 1).padStart(2, '0');

const STRIP_SIZES = '(max-width: 40rem) 92vw, (max-width: 62rem) 55vw, 36vw';

const DRAG_KEY = 'pg-drag';

const OFF = 0;
const ON = 1;
const SPENT = 2;

function useDragHint(stageRef, live, reduced) {
    const [state, setState] = useState(OFF);

    useEffect(() => {
        if (!live || reduced) return undefined;

        let seen = true;
        try {
            seen = sessionStorage.getItem(DRAG_KEY) === 'seen';
        } catch (e) {
            /* storage blocked — see DRAG_KEY */
        }
        if (seen) return undefined;

        const stage = stageRef.current;
        if (!stage) return undefined;

        let io = null;
        const events = ['pointerdown', 'wheel', 'keydown', 'touchstart'];

        const off = () => {
            events.forEach((type) => stage.removeEventListener(type, spend));
            if (io) io.disconnect();
            io = null;
        };

        function spend() {
            setState(SPENT);
            try {
                sessionStorage.setItem(DRAG_KEY, 'seen');
            } catch (e) {
                /* see above */
            }
            off();
        }

        events.forEach((type) => stage.addEventListener(type, spend, { passive: true }));

        if (typeof IntersectionObserver === 'function') {
            io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        setState((was) => (was === OFF ? ON : was));
                        if (io) io.disconnect();
                        io = null;
                    });
                },
                { threshold: 0.35 },
            );
            io.observe(stage);
        } else {
            setState(ON);
        }

        return off;
    }, [live, reduced, stageRef]);

    return state;
}

const href = (item) => item?.href || null;

export default function WorkCarousel({ items, reduced }) {

    const open = useCallback(
        (index, event) => {
            const item = items[index];
            if (!item) return;
            const url = href(item);

            if (!url) return;
            if (event && (event.metaKey || event.ctrlKey || event.shiftKey)) {
                window.open(url, '_blank', 'noopener');
                return;
            }
            window.location.href = url;
        },
        [items],
    );

    const { stageRef, canvasRef, labelRef, shown, live, fallback } = useGlassCarousel({
        items,
        reduced,
        onOpen: open,
    });

    const hint = useDragHint(stageRef, live, reduced);

    const on = items[shown] || items[0];

    const shell = live
        ? {
              role: 'group',
              'aria-roledescription': 'carousel',
              'aria-label': 'Selected work — cover previews',
              tabIndex: 0,
          }
        : {};

    const onHref = href(on);
    const Label = live && onHref ? 'a' : 'p';
    const labelProps =
        live && onHref ? { href: onHref, draggable: 'false' } : { 'aria-hidden': !live || undefined };

    return (
        <div
            className="glass"
            ref={stageRef}
            data-live={live ? '' : undefined}
            data-strip={fallback ? '' : undefined}
            {...shell}
        >

            <canvas className="glass__canvas" ref={canvasRef} aria-hidden="true" />

            <Label className="glass__label" ref={labelRef} {...labelProps}>
                <b className="glass__title">{on.title}</b>
                <span className="glass__sub">{on.category}</span>
                {live && on.go ? <span className="glass__hint">{on.go}</span> : null}
            </Label>

            {hint ? (
                <p
                    className="glass__drag"
                    data-spent={hint === SPENT ? '' : undefined}
                    aria-hidden="true"
                >
                    Drag
                    <span className="glass__drag-mark">&#8596;</span>
                </p>
            ) : null}

            <p className="glass__count num" aria-hidden="true">
                {`${pad(shown)}/${pad(items.length - 1)}`}
            </p>

            {live ? (
                <p className="visually-hidden" aria-live="polite" aria-atomic="true">
                    {`${on.title} — ${pad(shown)} of ${pad(items.length - 1)}`}
                </p>
            ) : null}

            <ul className="glass__strip">
                {items.map((item) => {

                    const to = href(item);
                    const Cell = to ? 'a' : 'span';
                    const cellProps = to ? { href: to, draggable: 'false' } : {};

                    return (
                        <li className="glass__cell" key={item.slug}>
                            <Cell className="glass__cell-link" {...cellProps}>
                                <img
                                    {...responsive(item.tile || item.cover, STRIP_SIZES)}
                                    alt=""
                                    width="1600"
                                    height="1000"
                                    loading="lazy"
                                    decoding="async"
                                    draggable="false"
                                />
                                <span className="glass__name">{item.title}</span>
                            </Cell>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
