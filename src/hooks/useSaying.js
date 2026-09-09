import { useCallback, useRef, useState } from 'react';
import { GREETING, SAYINGS } from '../data/site.js';

/* What the identity chip is saying, and the gesture that changes it.

   One line of state and no DOM: the hook holds the phrase and the
   component renders it, which is the same bargain useTypewriter makes
   and for the same reason — the greeting is in the prerendered
   document, the first client render matches it, and nothing has to be
   undone afterwards.

   A pointer and a finger are answered differently, deliberately.

     A cursor      is a thing that hovers, and a hover is a state with
                   an end: entering puts a phrase up, leaving takes it
                   away, and the chip is back to saying hello before
                   the next one. Nothing cycles while the cursor is
                   inside — the phrase was picked on the way in.

     A finger      has no such state. There is nothing to leave, so a
                   tap puts a phrase up and it stays up; the next tap
                   is the next phrase. That is what `held` is: a phrase
                   put there by a tap survives the blur that follows
                   the reader touching something else.

     A keyboard    is the cursor's case, because it has the same shape:
                   focus puts a phrase up and blur takes it away.

   The link is still a link through all of it. Nothing is prevented,
   nothing is swallowed, and the chip goes where it has always gone —
   the interaction is painted on top of the navigation rather than in
   place of it. */

/* A bag, not a die. Twenty-five phrases shuffled and then spent one at
   a time, so every one of them is seen before any of them is seen
   twice, and a reader who keeps hovering is being read to rather than
   played dice with. The bag is drawn from the end; a reshuffle that
   would hand back the phrase still on screen swaps it to the front
   first, which is the whole of "a DIFFERENT phrase" across the seam
   between one bag and the next. */
function refill(last) {
    const bag = SAYINGS.slice();

    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }

    if (bag.length > 1 && bag[bag.length - 1] === last) {
        [bag[bag.length - 1], bag[0]] = [bag[0], bag[bag.length - 1]];
    }

    return bag;
}

/* Was this focus asked for, or is it the focus a click and a tap hand
   out on the way past? Both of those have already been answered — by
   the hover and by the tap itself — and answering them twice is the
   one thing the brief rules out: a second phrase inside a single
   gesture. `:focus-visible` is the browser's own answer to that
   question, so it is read rather than guessed at from event order. */
function askedFor(el) {
    try {
        return el.matches(':focus-visible');
    } catch {
        /* No support for the selector: a focus is a focus. */
        return true;
    }
}

export default function useSaying() {
    const [saying, setSaying] = useState(GREETING);
    const bag = useRef([]);
    const last = useRef(null);
    const held = useRef(false);
    const hovering = useRef(false);

    const next = useCallback(() => {
        if (!bag.current.length) bag.current = refill(last.current);
        const phrase = bag.current.pop();
        last.current = phrase;
        setSaying(phrase);
    }, []);

    const rest = useCallback(() => setSaying(GREETING), []);

    /* Enter and leave are the cursor's, and only the cursor's. A touch
       fires both of them around its own tap, and a chip that answered
       those would put a phrase up, take it away and put another one up
       for one press of a finger. */
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
