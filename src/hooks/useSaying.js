import { useCallback, useRef, useState } from 'react';
import { GREETING, SAYINGS } from '../data/site.js';

/* What the identity chip is saying, and the gesture that makes it say
   anything at all.

   At rest it says nothing. The mark is the portrait and only the
   portrait — the plate is one chip wide, exactly as it was before any
   of this — and every word beside it is something the reader asked
   for. Which is what makes the first one land: "oh, hi." is an answer
   to being noticed, and a greeting that was already on screen before
   the cursor arrived is not answering anything.

   So the order is a queue rather than a mood. The first hover of a
   visit spends the greeting; the next twenty-five spend the pool in
   the order it is written in src/data/site.js, which is the order it
   was written to be read in. Only once all twenty-six are spent does
   chance come into it: the twenty-five are shuffled and dealt again,
   and the greeting is not among them — it belongs to the first hello
   of a visit and there is only one of those.

   One line of state and no DOM: the hook holds the phrase and the
   component renders it, which is the same bargain useTypewriter makes
   and for the same reason — the prerendered document has the chip at
   rest, the first client render agrees with it, and nothing has to be
   undone afterwards.

   A pointer and a finger are answered differently, deliberately.

     A cursor      is a thing that hovers, and a hover is a state with
                   an end: entering spends one phrase, leaving takes it
                   away, and the chip is silent again before the next
                   one. Nothing cycles while the cursor is inside — the
                   phrase was drawn on the way in.

     A finger      has no such state. There is nothing to leave, so a
                   tap puts a phrase up and it stays up; the next tap
                   is the next phrase. That is what `held` is: a phrase
                   put there by a tap survives the blur that follows
                   the reader touching something else.

     A keyboard    is the cursor's case, because it has the same shape:
                   focus spends a phrase and blur takes it away.

   The link is still a link through all of it. Nothing is prevented,
   nothing is swallowed, and the chip goes where it has always gone —
   the interaction is painted on top of the navigation rather than in
   place of it. */

/* The opening hand, in writing order: the greeting, then the pool. */
const opening = () => [GREETING, ...SAYINGS];

/* And every hand after it, shuffled — so a long visit is not the same
   recital twice, while still spending all twenty-five before repeating
   any of them. The queue is drawn from the front, so a shuffle that
   would deal back the phrase still on screen swaps it out of the front
   first: that is the whole of "never the same phrase twice in a row"
   across the seam between one hand and the next. */
function shuffled(last) {
    const bag = SAYINGS.slice();

    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }

    if (bag.length > 1 && bag[0] === last) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }

    return bag;
}

/* Was this focus asked for, or is it the focus a click and a tap hand
   out on the way past? Both of those have already been answered — by
   the hover and by the tap itself — and answering them twice would
   spend a phrase nobody asked for. `:focus-visible` is the browser's
   own answer to that question, so it is read rather than guessed at
   from event order. */
function askedFor(el) {
    try {
        return el.matches(':focus-visible');
    } catch {
        /* No support for the selector: a focus is a focus. */
        return true;
    }
}

export default function useSaying() {
    /* null is the resting state, and it is the state the document is
       served in: nothing beside the portrait until a gesture asks. */
    const [saying, setSaying] = useState(null);
    const queue = useRef(null);
    const last = useRef(null);
    const held = useRef(false);
    const hovering = useRef(false);

    const next = useCallback(() => {
        if (!queue.current) queue.current = opening();
        if (!queue.current.length) queue.current = shuffled(last.current);
        const phrase = queue.current.shift();
        last.current = phrase;
        setSaying(phrase);
    }, []);

    const rest = useCallback(() => setSaying(null), []);

    /* Enter and leave are the cursor's, and only the cursor's. A touch
       fires both of them around its own tap, and a chip that answered
       those would spend three phrases on one press of a finger. */
    const onPointerEnter = useCallback(
        (e) => {
            if (e.pointerType !== 'mouse') return;
            hovering.current = true;
            held.current = false;
            next();
        },
        [next],
    );

    const onPointerLeave = useCallback(
        (e) => {
            if (e.pointerType !== 'mouse') return;
            hovering.current = false;
            held.current = false;
            rest();
        },
        [rest],
    );

    /* And the press is the finger's. Read on the way down rather than
       on the click, so the phrase has changed by the time the tap
       finishes — on a page where the chip's link is an anchor to the
       top, the two happen together. */
    const onPointerDown = useCallback(
        (e) => {
            if (e.pointerType === 'mouse') return;
            held.current = true;
            next();
        },
        [next],
    );

    const onFocus = useCallback(
        (e) => {
            if (held.current || !askedFor(e.currentTarget)) return;
            next();
        },
        [next],
    );

    /* Losing focus is not the same as the reader looking away, and on
       this link it usually is not: the chip's href is the top of the
       page, and following a fragment hands focus back to the document —
       so a plain click blurs the link with the cursor still sitting on
       it. Whoever still has the chip keeps what it is saying: the hover
       if the cursor is inside, the tap if a finger put the phrase
       there. Only a focus that was the last thing holding it takes it
       away. */
    const onBlur = useCallback(() => {
        if (!held.current && !hovering.current) rest();
        /* Spent: the phrase a tap left behind has outlived the focus it
           came with, and the next keyboard visit is a keyboard visit. */
        held.current = false;
    }, [rest]);

    return {
        saying,
        handlers: { onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur },
    };
}
