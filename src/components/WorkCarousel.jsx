import { useCallback, useEffect, useState } from 'react';
import useGlassCarousel from '../hooks/useGlassCarousel.js';

/* ===================================================================
   THE WORK CAROUSEL
   -------------------------------------------------------------------
   The section's index, and now the whole of it: one rigid row of
   covers behind a pane of glass that is optically neutral across its
   middle and refracts hard at the rims. Everything about the effect is
   measured in src/carousel/ and drawn in WebGL; this file is the part
   of it that has to be a document — the label, the counter, the
   links, and the strip a reader gets when there is no canvas to draw
   into.

   Not every project has somewhere to go. A card whose record carries
   no `href` is a cover and a caption: it still sits in the row, still
   takes its turn in the counter, still comes to the middle and is
   still named by the label — it simply is not an anchor, and clicking
   it does nothing rather than going nowhere. The moment a destination
   is added to the record it becomes a link again, here and in the
   strip, with no other change.

   Three states, in the order they arrive:

     prerendered   the strip below, as static markup, which is what a
                   crawler and a reader without JavaScript receive
     no WebGL      the same strip, still scrollable, no glass
     live          the canvas takes over and the strip steps aside

   The label and the counter sit outside the canvas so they stay crisp
   at any scale, stay selectable, and stay in the document.
   =================================================================== */

const pad = (n) => String(n + 1).padStart(2, '0');

/* Spent once per session, in the shape the intro's own flag already
   uses — see the inline script in index.html. Blocked storage counts as
   spent, for the same reason it does there: a session that cannot be
   marked would otherwise be told the same thing on every page of it. */
const DRAG_KEY = 'pg-drag';

/* Not shown · showing · spent. Three states rather than two, because a
   hint that is taken away the instant the reader touches the strip
   disappears at exactly the moment their eye is on it. Spent, it is
   still in the document long enough to fade. */
const OFF = 0;
const ON = 1;
const SPENT = 2;

/* The one thing the carousel does not say about itself.

   Everything else here is either in the document or drawn in the glass:
   the covers, the counter, the name of what is in the middle and where
   it goes. That it can be thrown sideways is the one fact with nothing
   to carry it — a canvas has no affordance, and the cursor only says so
   once the pointer is already over it, which is after the moment this
   is for.

   So it is said once, quietly, when the strip is first actually in
   front of the reader rather than when the page loads, and it is spent
   by any gesture at all: a drag, a wheel, a key, a finger. A reader who
   already knew is told nothing, because they will have moved the strip
   before the sentence was worth reading.

   Nothing here is offered to anybody who cannot act on it. The whole
   line is hidden from assistive technology, because a carousel that can
   be dragged is not news to a reader who cannot drag it — what they are
   given instead is the widget the live strip already declares itself
   to be, with its arrow keys and its polite counter, both of which are
   announced without any help from here. */
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

        /* Every one of these is a gesture the strip answers, and every
           one of them is therefore a reader who has worked it out.
           Passive, because not one of them is being cancelled here —
           the hook next door is what decides whether a wheel belongs to
           the strip or to the page. */
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

/* The destination a card carries, or nothing. Relative, like every
   other link on this page: the site is a multi-page build served from
   the domain root, and the home page is its index. */
const href = (item) => item?.href || null;

export default function WorkCarousel({ items, reduced }) {
    /* Opening a project from the canvas. Every card is a destination
       now — the strip is the only place the six projects are listed —
       and inside the lens there is no element to be an anchor, so the
       one the reader is pointing at is worked out from the layout and
       followed here. Modified clicks are left to mean what they mean
       everywhere else. */
    const open = useCallback(
        (index, event) => {
            const item = items[index];
            if (!item) return;
            const url = href(item);
            /* Nothing to open. Left deliberately silent: a card with no
               destination is not a broken one, and a click that does
               nothing is the honest answer to it. */
            if (!url) return;
            if (event && (event.metaKey || event.ctrlKey || event.shiftKey)) {
                window.open(url, '_blank', 'noopener');
                return;
            }
            window.location.href = url;
        },
        [items],
    );

    const { stageRef, canvasRef, labelRef, shown, live } = useGlassCarousel({
        items,
        reduced,
        onOpen: open,
    });

    const hint = useDragHint(stageRef, live, reduced);

    const on = items[shown] || items[0];

    /* Two accessibility states, because there are two components here.

       Live, it is a widget: a group with a roledescription, one tab
       stop, arrow keys, Enter to open what is in the middle, and a
       polite region saying where in the set the reader is. The label
       under it is a real anchor to that same project, so the keyboard
       has a link to land on rather than a gesture to guess at.

       Not live, it is the strip: one cover per project, each one a
       link if its project has a destination. It is what the prerendered
       document carries, so a crawler and a reader without a script are
       given the whole of the work either way. */
    const shell = live
        ? {
              role: 'group',
              'aria-roledescription': 'carousel',
              'aria-label': 'Selected work — cover previews',
              tabIndex: 0,
          }
        : {};

    /* Live, the label is the section's one visible link — the project in
       the middle of the glass, which is the only one the canvas cannot
       offer as an element. Not live, the strip below is showing the
       linked projects itself, and one more naming whichever happens to
       be first would be the same destination twice: it goes back to
       being what it was, a caption over a picture.

       And it is a link only while the project under it has somewhere to
       go. On one that does not, it is the same caption at the same size
       in the same place — the only difference is that there is nothing
       to follow. */
    const onHref = href(on);
    const Label = live && onHref ? 'a' : 'p';
    const labelProps =
        live && onHref ? { href: onHref, draggable: 'false' } : { 'aria-hidden': !live || undefined };

    return (
        <div className="glass" ref={stageRef} data-live={live ? '' : undefined} {...shell}>
            {/* The canvas is the picture, and the picture is described
                by everything around it, so it carries nothing itself. */}
            <canvas className="glass__canvas" ref={canvasRef} aria-hidden="true" />

            {/* `draggable` is off because a link the browser offers to
                drag away is a link that cannot be the start of a flick. */}
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

            {/* Where in the set the reader is, for anyone who cannot
                see the strip move. Only once there is a strip moving. */}
            {live ? (
                <p className="visually-hidden" aria-live="polite" aria-atomic="true">
                    {`${on.title} — ${pad(shown)} of ${pad(items.length - 1)}`}
                </p>
            ) : null}

            <ul className="glass__strip">
                {items.map((item) => {
                    /* Same cell either way, so the strip keeps its
                       rhythm: the anchor is swapped for a span when
                       there is nothing to follow, and the class it
                       carries — which is what the stylesheet sizes and
                       crops — is the same one. */
                    const to = href(item);
                    const Cell = to ? 'a' : 'span';
                    const cellProps = to ? { href: to, draggable: 'false' } : {};

                    return (
                        <li className="glass__cell" key={item.slug}>
                            <Cell className="glass__cell-link" {...cellProps}>
                                <img
                                    src={item.cover}
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
