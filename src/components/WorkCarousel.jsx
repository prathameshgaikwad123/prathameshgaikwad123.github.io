import useGlassCarousel from '../hooks/useGlassCarousel.js';

/* ===================================================================
   THE WORK CAROUSEL
   -------------------------------------------------------------------
   The section's figure index, rebuilt as the interaction it was
   standing in for: one rigid row of covers behind a pane of glass that
   is optically neutral across its middle and refracts hard at the
   rims. Everything about the effect is measured in src/carousel/ and
   drawn in WebGL; this file is the part of it that has to be a
   document — the label, the counter, and the strip a reader gets when
   there is no canvas to draw into.

   Three states, in the order they arrive:

     prerendered   the strip below, as static markup, which is what a
                   crawler and a reader without JavaScript receive
     no WebGL      the same strip, still scrollable, no glass
     live          the canvas takes over and the strip steps aside

   The label and the counter sit outside the canvas so they stay crisp
   at any scale, stay selectable, and stay in the document.
   =================================================================== */

const pad = (n) => String(n + 1).padStart(2, '0');

export default function WorkCarousel({ items, active, onActive, reduced }) {
    const index = items.findIndex((item) => item.slug === active);
    const { stageRef, canvasRef, labelRef, shown, live } = useGlassCarousel({
        items,
        active: index < 0 ? null : index,
        onActive: (i) => onActive && onActive(items[i].slug),
        reduced,
    });

    const on = items[shown] || items[0];

    /* Two accessibility states, because there are two components here.

       Live, it is a widget: a group with a roledescription, one tab
       stop, arrow keys, and a polite region saying where in the set the
       reader is. What it deliberately does not carry is a second set of
       links — every project in it is named, described and linked by the
       index directly below, and offering the same six destinations
       twice only makes the section longer to get through.

       Not live, it is the strip: a picture of six covers that the same
       index already accounts for, so it is taken out of the tree
       entirely, exactly as the row it replaces was. */
    const shell = live
        ? {
              role: 'group',
              'aria-roledescription': 'carousel',
              'aria-label': 'Selected work — cover previews',
              tabIndex: 0,
          }
        : { 'aria-hidden': true, tabIndex: -1 };

    return (
        <div className="glass" ref={stageRef} data-live={live ? '' : undefined} {...shell}>
            {/* The canvas is the picture, and the picture is described
                by everything around it, so it carries nothing itself. */}
            <canvas className="glass__canvas" ref={canvasRef} aria-hidden="true" />

            <p className="glass__label" ref={labelRef} aria-hidden="true">
                <b className="glass__title">{on.title}</b>
                <span className="glass__sub">{on.category}</span>
            </p>

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

            {/* tabIndex on a scroll container that is hidden from the
                tree, or the browser would offer it as a tab stop that
                announces nothing. */}
            <ul className="glass__strip" aria-hidden="true" tabIndex={-1}>
                {items.map((item) => (
                    <li className="glass__cell" key={item.slug}>
                        <img
                            src={item.cover}
                            alt=""
                            width="1600"
                            height="1000"
                            loading="lazy"
                            decoding="async"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
