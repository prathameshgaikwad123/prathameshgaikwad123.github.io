/* ===================================================================
   06 · THE STATEMENTS — THE LINE REVEAL
   The sentence a band opens on, arriving a line at a time out of a
   mask, bottom to top, each line a beat behind the one above it.

   It replaces nothing. Every statement still carries the site's own
   entrance — a rise and a fade, section 6 of the stylesheet — and that
   is still exactly what a phone, a reader who has asked for less
   motion, and a document whose script never arrives are given. This is
   the wide, motion-allowed case, and the only case: a band's opening
   sentence is the largest type on the screen at that moment, and a
   caption's entrance was never the right size for it.

   WHAT IS SPLIT, AND WHERE. The words are spans in the markup, written
   on the server as well as in the browser, exactly as the reading
   reveal's are next door (src/components/Words.jsx). The sentence is
   one sentence in the document: selectable, searchable, copied whole
   and read by a screen reader as prose rather than as a list of words.
   Nothing here creates an element, moves one, or takes one apart —
   which is the whole reason the split is markup and not script. An
   effect that restructured a heading would have to put it back
   perfectly on every revert, and "perfectly" is not a thing a DOM
   rewrite is ever quite sure of.

   WHAT A LINE IS. Not a thing the markup knows — the browser decides
   where a balanced, fluid heading breaks, and it decides differently at
   every width and again when the display face lands. So the lines are
   read off the layout at the moment the animation plays: words sharing
   a top edge are a line. Doing it then rather than at build time is
   what makes a resize, a late font and a window dragged to another
   screen all cost nothing — there is one measurement, and it is taken
   from what is actually on the screen.
   =================================================================== */

import { EASE } from './core.js';

/* Words whose tops are within this many pixels of each other are on the
   same line. Sub-pixel layout puts a fraction of a pixel between words
   that are plainly level; four pixels is far under the height of any
   line of display type on this site, so nothing can fall through. */
const SAME_LINE = 4;

/* Far enough under the mask that the tallest ascender is clear of it
   before the line starts to rise. */
const UNDER = 115;

/* The beat between one line and the next. Long enough to read as
   sequence, short enough that a four-line statement is finished inside
   a second and a half rather than being performed. */
const AFTER = 0.085;

export default function lineReveal({ gsap, ScrollTrigger, mm, root, CONDITIONS }) {
    mm.add(CONDITIONS.wide, () => {
        const statement = root.querySelector('.statement');
        const words = statement ? [].slice.call(statement.querySelectorAll('.sw')) : [];
        if (!statement || !words.length) return undefined;

        /* The word is the box and the span inside it is what moves. One
           cannot be both: a box that travels takes its own mask with
           it. */
        const inners = words.map((word) => word.firstElementChild || word);

        /* The one thing asked of the stylesheet, and it is asked for
           first: out of sight before a frame is drawn, whatever else
           happens below. */
        statement.setAttribute('data-lines', '');
        gsap.set(inners, { yPercent: UNDER, opacity: 0 });

        /* The block's own entrance is spent rather than left to run
           against this one. Both are triggered by the same element
           reaching the same part of the screen and both animate
           opacity, so the rule is marked arrived, settles at its
           resting values, and what the reader actually watches is the
           words inside it. */
        statement.classList.add('is-in');

        let trigger = null;
        let run = null;

        const play = () => {
            const lines = [];

            words.forEach((word, i) => {
                const top = word.offsetTop;
                let line = null;
                for (let l = 0; l < lines.length; l++) {
                    if (Math.abs(lines[l].top - top) <= SAME_LINE) line = lines[l];
                }
                if (!line) {
                    line = { top, items: [] };
                    lines.push(line);
                }
                line.items.push(inners[i]);
            });

            run = gsap.timeline();
            lines.forEach((line, i) => {
                run.to(
                    line.items,
                    { yPercent: 0, opacity: 1, duration: 0.95, ease: EASE },
                    i * AFTER,
                );
            });
        };

        const arm = () => {
            trigger = ScrollTrigger.create({
                trigger: statement,
                start: 'top 88%',
                once: true,
                onEnter: play,
            });
        };

        /* Castoro decides where this breaks, and until it has arrived
           the lines being counted are the fallback face's. Nothing
           flashes while that is waited for, because being out of sight
           is the state the effect has already written. */
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(arm, arm);
        else arm();

        /* Put back by hand rather than left to the context. The
           timeline is built inside a ScrollTrigger callback, which is
           outside the pass that records what this context made, so it
           is not something mm.revert() knows about — and the attribute
           is the stylesheet's state rather than a tween, which nothing
           but this was ever going to remove. */
        return () => {
            if (trigger) trigger.kill();
            if (run) run.kill();
            trigger = null;
            run = null;
            gsap.set(inners, { clearProps: 'transform,opacity' });
            statement.removeAttribute('data-lines');
        };
    });
}
