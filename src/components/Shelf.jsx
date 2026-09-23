import { useEffect, useRef, useState } from 'react';
import { BOOKS } from '../data/books.js';
import Lightbox from './Lightbox.jsx';
import { onMedia, rafOnce, useEnhanced } from '../hooks/dom.js';
import { armShelf, topple } from '../hooks/shelfsound.js';

/* ===================================================================
   THE SHELF
   -------------------------------------------------------------------
   Four books on a rule, beside the last heading on the page, and the
   one thing on the site that answers a cursor before it has arrived
   anywhere.

   THE GESTURE. The row leans toward the pointer, all of it at once and
   all of it by the same angle — a stack of books going over together
   rather than four objects each answering for itself. Which way it
   goes is not a decision the code makes: it is the sign of the same
   number that decides how far, so a cursor to the left of the row
   tips it left, a cursor to the right tips it right, and a cursor
   sitting exactly at the middle of it tips it nowhere.

   That last case is why the curve is the shape it is rather than a
   simple falloff. A stack pushed dead centre is a stack being pushed,
   not one being toppled — and a falloff that peaked in the middle
   would have to pick a side at the moment the reader crossed it, and
   would snap between the two every time they did. Zero at the middle,
   zero at the rim, and a peak a third of the way out: the peak lands
   about where the outer books are, so the row is fully over while the
   pointer is still on it.

   Because every cover takes the same angle they stay parallel, and a
   parallel row keeps the gaps the shelf set. Nothing overlaps, nothing
   collides, and what leans is the stack.

   HOW IT MOVES. One spring rather than an eased transition,
   under-damped by about a sixth. A row that arrived at its angle and
   stopped dead reads as a value being set; one that goes a shade past
   and comes back reads as a thing with a mass. The overshoot is small
   enough to be felt rather than seen, which is the only size it is
   allowed to be on a page that is otherwise this still.

   Everything per-frame is written straight to the elements, as two
   custom properties and a transform origin — the arrangement the plate
   rail uses (src/hooks/usePlateRail.js). React renders four list items
   once and is told nothing about any of this; the only state it keeps
   is which cover is open.

   THE COVER. A press on a spine opens that book's cover over the page,
   through the same dialog a case-study figure opens in
   (src/components/Lightbox.jsx) — the site's own answer to showing a
   picture larger without leaving the page for it. The spine is only a
   button where a script ran and the browser has the dialog to open, so
   a document with neither is four titles on a shelf, which is what it
   was.

   WHAT IS NOT HERE. No count, no rating, no star, no link out, no
   cursor of its own. The books are a list of titles that happens to be
   legible as a shelf; a reader who never moves a pointer over them has
   lost nothing but a flourish, and a reader who cannot see them at all
   is read the four titles as a list, which is what they are.
   =================================================================== */

/* How far the row goes over at the peak of the curve, and how far it
   slides while it does. The slide is what separates toppling from
   pivoting: a stack that rotates about a fixed corner is hinged to the
   shelf, and three pixels of travel in the direction it is falling is
   the difference between a hinge and a row of books. */
const LEAN = 9;
const SLIDE = 3;

/* The reach, as a multiple of the width of the whole row, and the
   height of the curve that fills it.

   t is the pointer's distance from the middle of the row over the
   reach, so it runs from -1 to 1 across the whole of the row's
   influence; the lean is t·(1-|t|)², which is zero in the middle, zero
   at the rim and peaks a third of the way out. PEAK is 27/4 — the
   reciprocal of that peak — and its only job is to make the maximum of
   the curve exactly one, so that LEAN above is in degrees and means
   what it says.

   1.25 puts that peak at about five-eighths of the way from the middle
   of the row to its end, which is under the second and third covers.
   The row is therefore all the way over while the pointer is still on
   the books, and still answering for half a row's width beyond either
   end of them. */
const REACH = 1.25;
const PEAK = 27 / 4;

/* The spring. Critical damping for this stiffness is 2√170 ≈ 26.1, and
   22 is a sixth under it — one visible return and nothing after it. */
const STIFF = 170;
const DAMP = 22;

/* When the row is within this of where it is being asked to stand, and
   moving slower than this, it has arrived and the loop stops — whether
   that is upright or leaning. A cursor parked over the shelf holds its
   angle without a frame being drawn for it; only the ones where
   something actually changes are spent. The first figure is in the
   units of the curve above and the second in those units a second.

   If what it arrived at was upright, the properties are taken off as
   well, so a shelf nobody is pointing at carries no inline style at
   all. */
const QUIET = 0.004;
const STILL = 0.03;

/* The row sounds on its way over, once, at this much of full lean, and
   is not allowed to sound again until it has come back under the
   second figure. Two thresholds rather than one because a row held
   still at the top of the curve sits on a single one and rings against
   it on every frame. */
const LOUD = 0.4;
const HUSH = 0.15;

/* Four covers going over together are heavier than one, so the thud
   they make is pitched below a single book's. */
const WEIGHT = 1.25;

/* How far above and below the row a pointer still counts as being at
   the shelf. Generous vertically and mean horizontally — a reader
   moving down the page toward the band should find the books already
   answering, and a reader reading the heading beside them should not.
   Horizontally the reach does the same job and is already the right
   size for it. */
const NEAR = 110;

/* How long a tapped row stays leaning. A finger has no dwell — it is
   gone before the spring has finished — so the lean is held for a beat
   at the place it was put and then let go. Long enough to be seen as a
   thing that happened, short enough that a reader scrolling past with
   a thumb is not leaving books over behind them. */
const HELD_FOR = 1100;

/* What an upright row reads as, written the way the loop writes it so
   the two can be compared as strings rather than as numbers that have
   already been rounded once. */
const ZERO_LEAN = '0.00deg';
const ZERO_SLIDE = '0.00px';

function arm(root) {
    const row = root.querySelector('.shelf__row');
    const books = row ? [].slice.call(row.querySelectorAll('.shelf__book')) : [];
    if (!row || !books.length) return () => {};

    /* The list item is the box the entrance owns — it carries the
       site's own rise and fade (stylesheet section 6), which is a
       transform, and two transforms on one element is one of them
       being thrown away. The cover inside it is what leans. */
    const vols = books.map((book) => book.querySelector('.shelf__vol') || book);

    /* One angle for the row, so one spring for the row. */
    let at = 0;
    let vel = 0;
    let side = 0;
    let rung = false;

    /* What is on the covers already. A property removed and a property
       set to zero render identically — the stylesheet declares the
       fallback — so an upright row is recorded as the zero it would
       have been written, and a frame that computes the same value
       again touches nothing. Without it a pointer crossing the far side
       of the page rewrites four style attributes for every frame it is
       moving, all of them with the value they already had. */
    const shown = { lean: ZERO_LEAN, slide: ZERO_SLIDE, on: false };

    let middle = 0;
    let reach = 1;
    /* Where the pointer was last seen, in the viewport's own
       coordinates, or null once it has gone. Whether that is anywhere
       near the shelf is not decided here — see the note on point(). */
    let pointer = null;
    let frame = 0;
    let clock = 0;
    let held = 0;

    /* offset geometry rather than a client rect, and this is the whole
       reason the row is positioned: offset geometry is what the layout
       says and a client rect is what the screen shows. The second one
       is measured through the rotation this file is writing, so a row
       that leans reports a wider box and a moved middle, the next frame
       reads that moved middle, and the row walks away from the pointer
       under its own feedback. */
    const measure = () => {
        const first = books[0];
        const last = books[books.length - 1];
        const left = first.offsetLeft;
        const right = last.offsetLeft + last.offsetWidth;
        middle = (left + right) / 2;
        reach = ((right - left) || first.offsetWidth || 1) * REACH;
    };

    const write = () => {
        const lean = `${(at * LEAN).toFixed(2)}deg`;
        const slide = `${(at * SLIDE).toFixed(2)}px`;

        /* The pivot is the bottom corner on the side the row is going,
           which is the corner a book actually turns about. It can only
           change while the angle is passing through zero, so the swap
           is never on screen. */
        const s = at > QUIET ? 1 : at < -QUIET ? -1 : side;
        const turned = s !== side;
        if (turned) side = s;

        if (lean === shown.lean && slide === shown.slide && !turned) return;

        for (let i = 0; i < vols.length; i++) {
            const vol = vols[i];
            if (lean !== shown.lean) vol.style.setProperty('--lean', lean);
            if (slide !== shown.slide) vol.style.setProperty('--slide', slide);
            if (turned) vol.style.setProperty('--pivot', s < 0 ? '0%' : '100%');
        }

        shown.lean = lean;
        shown.slide = slide;
        shown.on = true;
    };

    const clear = () => {
        at = 0;
        vel = 0;
        if (!shown.on) return;
        for (let i = 0; i < vols.length; i++) {
            vols[i].style.removeProperty('--lean');
            vols[i].style.removeProperty('--slide');
        }
        shown.lean = ZERO_LEAN;
        shown.slide = ZERO_SLIDE;
        shown.on = false;
    };

    const tick = (stamp) => {
        frame = 0;

        /* Clamped, for the reason the scroll model clamps a long frame:
           a tab that has been in the background for a second should
           come back to a shelf, not to a row mid-flight. */
        const dt = clock ? Math.min((stamp - clock) / 1000, 1 / 30) : 1 / 60;
        clock = stamp;

        /* The one geometry read of the frame, taken before anything is
           written, so the loop never reads back what it has just set. */
        const box = row.getBoundingClientRect();

        /* And the one place the pointer is asked whether it is at the
           shelf at all. It is asked here rather than in the event
           handler because the answer needs this box, and reading a box
           in a pointermove handler is a synchronous layout on every
           move of the mouse anywhere on the page — for a row of four
           books in the corner of the last section. */
        let to = 0;
        if (pointer
            && pointer.y > box.top - NEAR
            && pointer.y < box.bottom + NEAR) {
            const t = (pointer.x - (box.left + middle)) / reach;
            if (t > -1 && t < 1) {
                const a = t < 0 ? -t : t;
                to = t * (1 - a) * (1 - a) * PEAK;
            }
        }

        vel += (-STIFF * (at - to) - DAMP * vel) * dt;
        at += vel * dt;

        const a = at < 0 ? -at : at;
        const gap = at - to < 0 ? to - at : at - to;
        const v = vel < 0 ? -vel : vel;

        /* A row sounds on the way over and not on the way back. The two
           thresholds keep a row resting at the top of the curve from
           ringing against a single one on every frame; the direction is
           what keeps a row swinging — the page scrolling under a held
           lean, a window being dragged — from ringing on the return leg
           of every swing. Falling further is the sign of the velocity
           agreeing with the sign of the angle. */
        const falling = at > 0 ? vel > 0 : vel < 0;

        if (!rung && a > LOUD && falling) {
            rung = true;
            topple(WEIGHT);
        } else if (rung && a < HUSH) {
            rung = false;
        }

        write();

        /* Still moving, or not yet where it is being asked to stand.
           Either way there is another frame to draw. */
        if (gap > QUIET || v > STILL) {
            frame = requestAnimationFrame(tick);
            return;
        }

        clock = 0;

        /* Arrived. If where it arrived is upright, the row is put back
           to the state the stylesheet left it in rather than held at a
           rounded-down version of it; if it arrived leaning — a cursor
           resting on the shelf — the angle stands, and the next move of
           the pointer picks it up from where it is. */
        if (a <= QUIET) clear();
    };

    const start = () => {
        if (frame) return;
        clock = 0;
        frame = requestAnimationFrame(tick);
    };

    /* Two numbers and a frame, and nothing else — no geometry, no
       arithmetic, no decision. This runs on every movement of the
       pointer across the whole document, so what it costs is what the
       shelf costs a reader who is nowhere near it: one assignment, and
       at most one frame in which the loop reads the row, finds the
       pointer is not at it, and stops again. */
    const point = (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        start();
    };

    const release = () => {
        pointer = null;
        start();
    };

    /* A reader can move the shelf without moving the pointer. The loop
       stops once the row has arrived, so a cursor left resting on the
       books while the page scrolls would otherwise take its angle with
       it — the shelf sliding up the screen still leaning at a pointer
       that is no longer anywhere near it, until the mouse was next
       moved. One frame per scroll is enough to answer that, and it is
       asked for only when there is a pointer on the page to answer it
       about; the frame itself writes nothing unless something has
       actually changed. */
    const onScroll = () => {
        if (pointer) start();
    };

    const onMove = (event) => {
        window.clearTimeout(held);
        point(event);
    };

    const onDown = (event) => {
        window.clearTimeout(held);
        point(event);
    };

    /* A mouse keeps pointing after it has stopped pressing and is
       answered by the next move; a finger does not, so the lean it left
       behind is the one thing on this shelf that is on a timer. */
    const onUp = (event) => {
        if (event.pointerType === 'mouse') return;
        window.clearTimeout(held);
        held = window.setTimeout(release, HELD_FOR);
    };

    /* A mouse that has left the window is not pointing at anything and
       the row stands up. A finger that has lifted is not either — but
       the browser says so the same way, by firing pointerleave up the
       tree the instant the touch ends, and letting that through would
       cancel the hold above on every tap before a reader had seen it.
       So the leave is answered for the pointer it is actually about,
       and the blur — which has no pointer and no type — is answered
       whatever was pointing. */
    const gone = (event) => {
        if (event && event.pointerType && event.pointerType !== 'mouse') return;
        window.clearTimeout(held);
        release();
    };

    /* A drag of a window edge is a stream of these, and measuring is
       two layout reads. Coalesced to one a frame, through the same
       helper the chrome and the rail use. */
    const remeasure = rafOnce();
    const onResize = () => remeasure(measure);

    measure();

    /* The sound is armed now rather than when the band comes into view.

       It was armed on the band, which was the wrong end of the visit:
       the listeners build an audio context on the first gesture of any
       kind, and a browser gives a page one of those only for a press or
       a key — never for a scroll. So a reader who clicked something in
       the masthead, read the whole page, and arrived here had already
       spent the only gesture they were going to make before anything
       was listening for it, and the shelf was silent for the rest of
       the visit. Armed from the start, the press they have already made
       is the one that opens the audio.

       What that costs is an audio context for a reader who presses
       something and never reaches the last section. It is built inside
       their gesture handler either way, and the intro's typing sound
       has asked for exactly this since the site was written. */
    const offSound = armShelf();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('blur', gone);
    document.documentElement.addEventListener('pointerleave', gone);

    return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('blur', gone);
        document.documentElement.removeEventListener('pointerleave', gone);

        window.clearTimeout(held);
        remeasure.cancel();
        if (frame) cancelAnimationFrame(frame);
        offSound();

        vols.forEach((vol) => {
            vol.style.removeProperty('--lean');
            vol.style.removeProperty('--slide');
            vol.style.removeProperty('--pivot');
        });
        shown.lean = ZERO_LEAN;
        shown.slide = ZERO_SLIDE;
        shown.on = false;
    };
}

const dialogSupported = () =>
    typeof HTMLDialogElement === 'function'
    && typeof HTMLDialogElement.prototype.showModal === 'function';

export default function Shelf() {
    const ref = useRef(null);
    /* The one thing React is told about this section: which cover is
       open. It changes on a press and at no other time. */
    const [poster, setPoster] = useState(null);

    /* False on the server and on the first client render, which is what
       the prerendered document says too — so the spine is a plain box
       in the markup and becomes a button afterwards, exactly as a
       case-study figure becomes zoomable. */
    const enhanced = useEnhanced();
    const opens = enhanced && dialogSupported();

    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;

        /* Asked rather than assumed, and watched rather than read once —
           the rule every moving thing on this site is under. A reader
           who turns the preference on mid-visit has the listeners taken
           off and the books put back upright; one who turns it off is
           given the shelf then rather than on their next visit. */
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        let off = () => {};

        const decide = () => {
            off();
            off = reduce.matches ? () => {} : arm(root);
        };

        decide();
        const offMedia = onMedia(reduce, decide);

        return () => {
            offMedia();
            off();
        };
        /* `opens` is a dependency because it rewrites the markup this
           effect is holding on to: the spine ships as a plain box and
           becomes a button on the first client render after mount, and
           React replaces the element rather than changing it. Armed
           once and never again, the loop would spend the rest of the
           visit writing angles to four spans that are no longer in the
           document — the shelf answering a pointer that nothing on
           screen is attached to. */
    }, [opens]);

    return (
        <>
            <div className="shelf" ref={ref}>
                {/* The role is not redundant: a list whose markers the
                    stylesheet removes stops being announced as a list in
                    Safari, and four titles are worth being told there are
                    four of. */}
                <ul className="shelf__row" role="list">
                    {BOOKS.map((book) => {
                        const spine = (
                            <span className="shelf__spine" aria-hidden="true">
                                {book.spine || book.title}
                            </span>
                        );

                        return (
                            <li
                                className="shelf__book"
                                key={book.title}
                                data-reveal=""
                                style={{ '--tall': book.tall || 1 }}
                            >
                                {opens ? (
                                    <button
                                        type="button"
                                        className="shelf__vol"
                                        /* The cover prints what fits down a
                                           spine; this is the book, and the
                                           whole of what the press does. */
                                        aria-label={`${book.title} — show cover`}
                                        onClick={(event) =>
                                            setPoster({
                                                src: book.cover,
                                                alt: book.alt || book.title,
                                                title: book.title,
                                                author: book.author,
                                                review: book.review,
                                                opener: event.currentTarget,
                                            })}
                                    >
                                        {spine}
                                    </button>
                                ) : (
                                    <span className="shelf__vol">
                                        {spine}
                                        <span className="visually-hidden">{book.title}</span>
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* The shelf itself is a rule, so it arrives the way every
                    other rule on the site does — drawn from its left edge,
                    by the entrance system, off the same attribute the band
                    dividers use (src/hooks/useReveal.js). */}
                <div className="shelf__board" data-reveal-rule="" aria-hidden="true" />
            </div>

            {/* Outside the shelf on purpose. A modal dialog is painted in
                the top layer but it is still a descendant for the sake of
                inheritance, and the shelf gives up its pointer events so
                that its empty half stops catching presses meant for the
                heading underneath — inherited onto the dialog, that would
                be a cover nobody can close. */}
            <Lightbox item={poster} onClose={() => setPoster(null)} />
        </>
    );
}
