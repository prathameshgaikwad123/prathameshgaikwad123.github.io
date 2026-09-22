import { useEffect, useRef } from 'react';
import { BOOKS } from '../data/books.js';
import { onMedia, rafOnce } from '../hooks/dom.js';
import { armShelf, topple } from '../hooks/shelfsound.js';

/* ===================================================================
   THE SHELF
   -------------------------------------------------------------------
   Four books on a rule, beside the last heading on the page, and the
   one thing on the site that answers a cursor before it has arrived
   anywhere.

   THE GESTURE. A book leans toward the pointer, and the further the
   pointer is from its spine the less it leans, until at a little over
   one book's width away it does not lean at all. Which side it goes is
   not a decision the code makes — it is the sign of the same number
   that decides how far, so a cursor to the left of a spine tips it left
   and a cursor to the right tips it right, and a cursor sitting exactly
   on the spine tips it nowhere. That last case is why the curve is the
   shape it is rather than a simple falloff: a book being pushed dead
   centre is a book being pushed, not one being toppled, and a falloff
   that peaked there would have to pick a side at the moment the reader
   crossed the middle and would snap between the two every time they
   did.

   What is left is a row that collapses toward the gap the pointer is
   making in it — which is what a shelf does when a book is taken out of
   it, and is the whole of the reference. The neighbours come with it,
   an order of magnitude less, because the reach is a little wider than
   one book and the tail of the curve is all they are standing in.

   HOW IT MOVES. A spring per book rather than an eased transition,
   under-damped by about a sixth. A book that arrived at its angle and
   stopped dead reads as a value being set; one that goes a shade past
   and comes back reads as a thing with a mass. The overshoot is small
   enough to be felt rather than seen, which is the only size it is
   allowed to be on a page that is otherwise this still.

   Everything per-frame is written straight to the elements, as two
   custom properties and a transform origin — the arrangement the plate
   rail uses (src/hooks/usePlateRail.js). React renders four list items
   once and is not told about any of this.

   WHAT IS NOT HERE. No focus ring, no count, no rating, no link out,
   no cursor of its own. The books are a list of titles that happens to
   be legible as a shelf; a reader who never moves a pointer over them
   has lost nothing but a flourish, and a reader who cannot see them at
   all is read the four titles as a list, which is what they are.
   =================================================================== */

/* How far a book goes over at the peak of the curve, and how far it
   slides while it does. The slide is what separates toppling from
   pivoting: a book that rotates about a fixed corner is hinged to the
   shelf, and three pixels of travel in the direction it is falling is
   the difference between a hinge and a book. */
const LEAN = 9;
const SLIDE = 3;

/* Nine rather than the twelve this started at, and the reason is the
   gap. A pointer resting between two books is the same distance from
   both, so under any symmetric curve both of them go over by the same
   amount and they meet in the middle — which is the gesture, and is
   also two solid covers occupying one piece of the screen. Nine is the
   angle at which that reads as a pair of books leaning on each other
   rather than as a shape. The hairline the stylesheet puts round each
   cover is the other half of the same answer.

   The reach, as a multiple of the distance between two spines, and the
   height of the curve that fills it.

   t is the pointer's distance from a spine over the reach, so it runs
   from -1 to 1 across the whole of a book's influence; the lean is
   t·(1-|t|)², which is zero at the spine, zero at the rim and peaks a
   third of the way out. PEAK is 27/4 — the reciprocal of that peak —
   and its only job is to make the maximum of the curve exactly one, so
   that LEAN above is in degrees and means what it says.

   1.15 is chosen against the row rather than the page: the peak then
   falls just outside a book's own edge, and a neighbour one spine away
   is standing in the last tenth of the curve. That is the difference
   between a row that bends and a row where one book goes over and the
   next one notices. */
const REACH = 1.15;
const PEAK = 27 / 4;

/* The spring. Critical damping for this stiffness is 2√170 ≈ 26.1, and
   22 is a sixth under it — one visible return and nothing after it. */
const STIFF = 170;
const DAMP = 22;

/* When every book is within this of where it is being asked to stand,
   and moving slower than this, the row has arrived and the loop stops —
   whether that is upright or leaning. A cursor parked over the shelf
   holds its angle without a frame being drawn for it; only the ones
   where something actually changes are spent. The first figure is in
   the units of the curve above and the second in those units a second.

   If what it arrived at was upright, the properties are taken off as
   well, so a shelf nobody is pointing at carries no inline style at
   all. */
const QUIET = 0.004;
const STILL = 0.03;

/* A book sounds on its way over, once, at this much of full lean, and
   is not allowed to sound again until it has come back under the
   second figure. Two thresholds rather than one because a pointer held
   still at the top of the curve sits on a single one and rings against
   it on every frame. */
const LOUD = 0.4;
const HUSH = 0.15;

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

/* What an upright book reads as, written the way the loop writes it so
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
       being thrown away. The volume inside it is what leans. */
    const vols = books.map((book) => book.querySelector('.shelf__vol') || book);
    const weight = books.map((book) => Number(book.dataset.tall) || 1);

    const at = books.map(() => 0);
    const vel = books.map(() => 0);
    const side = books.map(() => 0);
    const rung = books.map(() => false);

    /* What is on each cover already. A property removed and a property
       set to zero render identically — the stylesheet declares the
       fallback — so an upright book is recorded as the zero it would
       have been written, and a frame that computes the same value
       again touches nothing. Without it a pointer crossing the far side
       of the page rewrites four style attributes for every frame it is
       moving, all of them with the value they already had. */
    const shown = books.map(() => ({ lean: ZERO_LEAN, slide: ZERO_SLIDE, on: false }));

    let centres = [];
    let reach = 1;
    /* Where the pointer was last seen, in the viewport's own
       coordinates, or null once it has gone. Whether that is anywhere
       near the shelf is not decided here — see the note on point(). */
    let pointer = null;
    let frame = 0;
    let clock = 0;
    let held = 0;

    /* offsetLeft rather than a client rect, and this is the whole
       reason the row is positioned: offset geometry is what the layout
       says and a client rect is what the screen shows. The second one
       is measured through the rotation this file is writing, so a book
       that leans reports a wider box and a moved centre, the next frame
       reads that moved centre, and the row walks away from the pointer
       under its own feedback. */
    const measure = () => {
        centres = books.map((book) => book.offsetLeft + book.offsetWidth / 2);
        const pitch = centres.length > 1
            ? Math.abs(centres[1] - centres[0])
            : books[0].offsetWidth * 1.4;
        reach = (pitch || books[0].offsetWidth || 1) * REACH;
    };

    const write = (i) => {
        const vol = vols[i];
        const lean = `${(at[i] * LEAN).toFixed(2)}deg`;
        const slide = `${(at[i] * SLIDE).toFixed(2)}px`;

        if (lean !== shown[i].lean) {
            vol.style.setProperty('--lean', lean);
            shown[i].lean = lean;
            shown[i].on = true;
        }
        if (slide !== shown[i].slide) {
            vol.style.setProperty('--slide', slide);
            shown[i].slide = slide;
            shown[i].on = true;
        }

        /* The pivot is the bottom corner on the side the book is going,
           which is the corner a book actually turns about. It can only
           change while the angle is passing through zero, so the swap
           is never on screen. */
        const s = at[i] > QUIET ? 1 : at[i] < -QUIET ? -1 : side[i];
        if (s !== side[i]) {
            side[i] = s;
            vol.style.setProperty('--pivot', s < 0 ? '0%' : '100%');
        }
    };

    const tick = (stamp) => {
        frame = 0;

        /* Clamped, for the reason the scroll model clamps a long frame:
           a tab that has been in the background for a second should
           come back to a shelf, not to four books mid-flight. */
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
        let aim = null;
        if (pointer
            && pointer.y > box.top - NEAR
            && pointer.y < box.bottom + NEAR
            && pointer.x > box.left - reach
            && pointer.x < box.right + reach) {
            aim = pointer.x;
        }

        let alive = false;
        let upright = true;

        for (let i = 0; i < books.length; i++) {
            let to = 0;
            if (aim !== null) {
                const t = (aim - (box.left + centres[i])) / reach;
                if (t > -1 && t < 1) {
                    const a = t < 0 ? -t : t;
                    to = t * (1 - a) * (1 - a) * PEAK;
                }
            }

            vel[i] += (-STIFF * (at[i] - to) - DAMP * vel[i]) * dt;
            at[i] += vel[i] * dt;

            const a = at[i] < 0 ? -at[i] : at[i];
            const gap = at[i] - to < 0 ? to - at[i] : at[i] - to;
            const v = vel[i] < 0 ? -vel[i] : vel[i];

            /* Still moving, or not yet where it is being asked to
               stand. Either way there is another frame to draw. */
            if (gap > QUIET || v > STILL) alive = true;
            if (a > QUIET) upright = false;

            /* A book sounds on the way over and not on the way back.
               The two thresholds keep a cover resting at the top of the
               curve from ringing against a single one on every frame;
               the direction is what keeps a row swinging — the page
               scrolling under a held lean, a window being dragged —
               from ringing on the return leg of every swing. Falling
               further is the sign of the velocity agreeing with the
               sign of the angle. */
            const falling = at[i] > 0 ? vel[i] > 0 : vel[i] < 0;

            if (!rung[i] && a > LOUD && falling) {
                rung[i] = true;
                topple(weight[i]);
            } else if (rung[i] && a < HUSH) {
                rung[i] = false;
            }

            write(i);
        }

        if (alive) {
            frame = requestAnimationFrame(tick);
            return;
        }

        clock = 0;

        /* Arrived. If where it arrived is upright, the row is put back
           to the state the stylesheet left it in rather than held at a
           rounded-down version of it; if it arrived leaning — a cursor
           resting on the shelf — the angles stand, and the next move of
           the pointer picks them up from where they are. */
        if (!upright) return;

        for (let i = 0; i < books.length; i++) {
            at[i] = 0;
            vel[i] = 0;
            /* `on` rather than the values, because a cover that came
               back to zero has those values written on it and is not
               the same thing as one that was never touched. */
            if (!shown[i].on) continue;
            vols[i].style.removeProperty('--lean');
            vols[i].style.removeProperty('--slide');
            shown[i].lean = ZERO_LEAN;
            shown[i].slide = ZERO_SLIDE;
            shown[i].on = false;
        }
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
       books while the page scrolls would otherwise take its angles with
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
       two layout reads a book. Coalesced to one a frame, through the
       same helper the chrome and the rail use. */
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
        remeasure.cancel();
        window.removeEventListener('blur', gone);
        document.documentElement.removeEventListener('pointerleave', gone);

        window.clearTimeout(held);
        if (frame) cancelAnimationFrame(frame);
        offSound();

        vols.forEach((vol) => {
            vol.style.removeProperty('--lean');
            vol.style.removeProperty('--slide');
            vol.style.removeProperty('--pivot');
        });
        shown.forEach((cover) => {
            cover.lean = ZERO_LEAN;
            cover.slide = ZERO_SLIDE;
            cover.on = false;
        });
    };
}

export default function Shelf() {
    const ref = useRef(null);

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
    }, []);

    return (
        <div className="shelf" ref={ref}>
            {/* The role is not redundant: a list whose markers the
                stylesheet removes stops being announced as a list in
                Safari, and four titles are worth being told there are
                four of. */}
            <ul className="shelf__row" role="list">
                {BOOKS.map((book) => (
                    <li
                        className="shelf__book"
                        key={book.title}
                        data-reveal=""
                        data-tall={book.tall || 1}
                        style={{ '--tall': book.tall || 1 }}
                    >
                        <span className="shelf__vol">
                            <span className="shelf__spine" aria-hidden="true">
                                {book.spine || book.title}
                            </span>
                        </span>
                        {/* The cover prints what fits down a spine; this
                            is the book. */}
                        <span className="visually-hidden">{book.title}</span>
                    </li>
                ))}
            </ul>

            {/* The shelf itself is a rule, so it arrives the way every
                other rule on the site does — drawn from its left edge,
                by the entrance system, off the same attribute the band
                dividers use (src/hooks/useReveal.js). */}
            <div className="shelf__board" data-reveal-rule="" aria-hidden="true" />
        </div>
    );
}
