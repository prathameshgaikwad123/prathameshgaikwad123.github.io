import { useCallback } from 'react';
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
