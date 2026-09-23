import usePlateRail from '../hooks/usePlateRail.js';
import { responsive } from '../data/cloudinary.js';

/* A plate's share of the rail at each of its four widths (.beh__rail's
   --beh-plate). A placeholder ignores this; a Cloudinary upload is
   fetched to match. */
const PLATE_SIZES = '(min-width: 75rem) 27vw, (min-width: 62rem) 33vw, (min-width: 48rem) 44vw, 74vw';

/* ===================================================================
   THE PLATE RAIL
   -------------------------------------------------------------------
   The Behance gallery, and the document half of it. Everything that
   moves is measured and written in src/hooks/usePlateRail.js; this
   file is the part that has to be a document — the plates, their
   captions, the links out, and the instrument line under the rail.

   The plates are real anchors in reading order, always. That is the
   difference between this and the carousel above it: there, the cards
   are pixels in a canvas and the one link a reader can reach is the
   label, so the section needs a strip underneath it to be a document
   at all. Here the rail *is* the document — six links a crawler
   indexes, a keyboard tabs through and a screen reader reads as a
   list, with the wrap and the parallax laid over the top of them. Take
   the script away and what is left is a horizontal gallery with snap
   points, which is a perfectly good gallery.

   Three states, in the order they arrive:

     prerendered   a snapping horizontal scroller, as static markup
     reduced       the same, kept. The rail is motion all the way down,
                   so a reader who asked for less is given the plates
                   rather than an apology for them
     live          the wrap, the parallax, the throw and the drift

   THE REPEAT. `copies` is how many times the set is laid end to end so
   that the endless line is longer than the stage. It is 1 for the six
   plates this section carries, at every width they are set at; the
   repeat is there so a shorter list cannot open a hole in the middle
   of the row. A repeated plate is the same link to the same project —
   hidden from assistive technology, kept out of the tab order, and
   still perfectly clickable, because on screen it is simply that plate
   coming round again.

   THE FOOT. The rail is full bleed and the line under it is set on the
   twelve columns with everything else on the page, so the component
   returns both and the section puts nothing between them. They are one
   component because they share one answer — which plate is in the gate
   — and a page should only work that out once.
   =================================================================== */

const pad = (n) => String(n).padStart(2, '0');

export default function PlateRail({ items, profile, reduced }) {
    const { railRef, trackRef, meterRef, shown, live, copies } = usePlateRail({ items, reduced });

    /* One flat list, so the track stays a single flex row in ordinary
       flow and the browser goes on deciding every plate's width and
       position from the stylesheet. The wrap only ever moves a plate
       away from where CSS put it — which is the rule every other
       effect on this site is held to. */
    const cells = [];
    for (let copy = 0; copy < copies; copy += 1) {
        items.forEach((item) => cells.push({ item, copy }));
    }

    /* Live, it is a widget: one tab stop on the rail itself, arrow keys
       to move it, Home and End to fetch the first and the last plate.
       The plates inside stay in the tab order either way — the rail is
       a convenience for a reader using it as an instrument, not a gate
       in front of the links. */
    const shell = live
        ? {
              role: 'group',
              'aria-roledescription': 'gallery',
              'aria-label': 'Selected Behance work — plates',
              tabIndex: 0,
          }
        : {};

    return (
        <>
            <div className="beh__stage">
                <div
                    className="beh__rail"
                    ref={railRef}
                    data-live={live ? '' : undefined}
                    {...shell}
                >
                    <ul className="beh__track" ref={trackRef}>
                        {cells.map(({ item, copy }) => {
                            const again = copy > 0;
                            return (
                                <li
                                    className="beh__cell"
                                    key={`${item.id}-${copy}`}
                                    aria-hidden={again || undefined}
                                >
                                    {/* `draggable` is off because a link
                                        the browser offers to drag away is
                                        a link that cannot be the start of
                                        a throw. */}
                                    <a
                                        className="beh__link"
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        draggable="false"
                                        tabIndex={again ? -1 : undefined}
                                    >
                                        <figure className="beh__figure frame">
                                            <span className="frame__media">
                                                {/* REPLACE: labelled placeholder
                                                    — see src/data/behance.js. */}
                                                <img
                                                    className="beh__shot"
                                                    {...responsive(item.cover, PLATE_SIZES)}
                                                    alt={again ? '' : item.alt}
                                                    width="1600"
                                                    height="1200"
                                                    loading="lazy"
                                                    decoding="async"
                                                    draggable="false"
                                                />
                                            </span>
                                            <figcaption className="cap beh__cap">
                                                <span className="cap__no num">{item.no}</span>
                                                <span className="beh__names">
                                                    <span className="beh__title">{item.title}</span>
                                                    <span className="beh__type">{item.type}</span>
                                                </span>
                                                <span className="beh__go" aria-hidden="true">
                                                    ↗
                                                </span>
                                            </figcaption>
                                        </figure>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* The gate: two register ticks on the stage's centre
                    line, above the rail and below it. It is the axis the
                    parallax is measured from and the point the focus
                    falls away from, and it is the site's own mark rather
                    than a new device — the same hairline tick that sits
                    on the corner of every framed picture on the page,
                    turned to mark a middle instead of a corner.

                    Only while the rail is live. Unmoving there is no
                    gate, and a mark across a static gallery would be
                    pointing at nothing. */}
                {live ? <span className="beh__gate" aria-hidden="true" /> : null}
            </div>

            <div className="shell">
                <div className="grid">
                    <div className="beh__foot">
                        {/* Where in the lap the reader is. Hidden from
                            assistive technology because it is a readout
                            of a position, and a position in a gallery
                            that does not snap is not a fact anybody can
                            act on — the six links are. */}
                        {live ? (
                            <p className="tag beh__lap" aria-hidden="true">
                                <span className="tag__no num">Lap</span>
                                <b className="num">
                                    {`${pad(shown + 1)} / ${pad(items.length)}`}
                                </b>
                            </p>
                        ) : null}

                        {/* Two runs rather than one, a lap apart, so the
                            meter is endless in the same way the rail is:
                            as the first leaves the right edge the second
                            is already entering from the left, and there
                            is no frame where the mark is nowhere. */}
                        {live ? (
                            <span
                                className="beh__meter"
                                ref={meterRef}
                                style={{ '--beh-n': items.length }}
                                aria-hidden="true"
                            >
                                <span className="beh__run" />
                                <span className="beh__run beh__run--next" />
                            </span>
                        ) : null}

                        <p className="beh__all">
                            <a
                                className="beh__cta"
                                href={profile}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View all work on Behance
                                <span aria-hidden="true"> ↗</span>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
