import { useCallback } from 'react';
import useGlassCarousel from '../hooks/useGlassCarousel.js';

/* ===================================================================
   THE WORK CAROUSEL
   -------------------------------------------------------------------
   The section's index, and now the whole of it: one rigid row of
   covers behind a pane of glass that is optically neutral across its
   middle and refracts hard at the rims. Everything about the effect is
   measured in src/carousel/ and drawn in WebGL; this file is the part
   of it that has to be a document — the label, the counter, the six
   links, and the strip a reader gets when there is no canvas to draw
   into.

   Three states, in the order they arrive:

     prerendered   the strip below, as static markup, which is what a
                   crawler and a reader without JavaScript receive
     no WebGL      the same strip, still scrollable, no glass
     live          the canvas takes over and the strip steps aside

   The label and the counter sit outside the canvas so they stay crisp
   at any scale, stay selectable, and stay in the document.
   =================================================================== */

const pad = (n) => String(n + 1).padStart(2, '0');

/* Relative, like every other link to a case study on this page: the
   site is a multi-page build served from the domain root, and the home
   page is its index. */
const href = (item) => `work/${item.slug}.html`;

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

    const on = items[shown] || items[0];

    /* Two accessibility states, because there are two components here.

       Live, it is a widget: a group with a roledescription, one tab
       stop, arrow keys, Enter to open what is in the middle, and a
       polite region saying where in the set the reader is. The label
       under it is a real anchor to that same project, so the keyboard
       has a link to land on rather than a gesture to guess at.

       Not live, it is the strip: six covers, each one a link. It is
       what the prerendered document carries, so a crawler and a reader
       without a script are given the whole of the work either way. */
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
       offer as an element. Not live, the strip below is showing all six
       as links itself, and a seventh naming whichever happens to be
       first would be the same destination twice: it goes back to being
       what it was, a caption over a picture. */
    const Label = live ? 'a' : 'p';
    const labelProps = live ? { href: href(on), draggable: 'false' } : { 'aria-hidden': true };

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
                {live ? <span className="glass__hint">{on.go}</span> : null}
            </Label>

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
                {items.map((item) => (
                    <li className="glass__cell" key={item.slug}>
                        <a className="glass__cell-link" href={href(item)} draggable="false">
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
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
