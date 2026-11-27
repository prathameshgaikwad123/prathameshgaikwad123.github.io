import { useCallback, useRef, useState } from 'react';
import { GREETING, SAYINGS } from '../data/site.js';

/* The opening hand, in writing order: the greeting, then the pool. */
const opening = () => [GREETING, ...SAYINGS];

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

function askedFor(el) {
    try {
        return el.matches(':focus-visible');
    } catch {
        /* No support for the selector: a focus is a focus. */
        return true;
    }
}

export default function useSaying() {

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

    const onBlur = useCallback(() => {
        if (!held.current && !hovering.current) rest();

        held.current = false;
    }, [rest]);

    return {
        saying,
        handlers: { onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur },
    };
}
