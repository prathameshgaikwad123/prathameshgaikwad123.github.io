import { useEffect, useState } from 'react';
import { motionOK } from './dom.js';
import { armKeystroke, keystroke } from './keystroke.js';

/* The statement typing itself out, once, on the first screen.

   What the hook holds is a count — how many characters have arrived —
   and the section that owns the line decides what a count means for its
   own markup. Nothing here touches the DOM, so the animation is a
   render like any other and there is no second copy of the statement
   anywhere.

   Three readers get the finished line and no animation, and all three
   fall out of the same starting state rather than being special-cased:
   the prerendered document, which has no effects; the first client
   render, which has to match it for hydration to stay quiet; and a
   reader who has asked for less motion, whose effect returns before it
   has typed anything. The preference is read here rather than undone in
   the stylesheet afterwards, the same way the carousel and the scroll
   system read it — an animation that never starts needs nothing turned
   off.

   `ready` is the intro. A first-time visitor sees the page arrive, and
   the statement should be typed onto the screen they have arrived at
   rather than behind the overlay they are still looking at. */

/* The beat before the first character: long enough for the heading's
   own entrance to be under way, short enough not to read as a pause. */
const LEAD = 380;

/* A hand rather than a metronome. The variation is read off the
   character's position so the cadence is the same on every visit — a
   line that types differently each time is a line that is being
   generated, and the whole point of this one is that it is being
   written. */
function pause(ch, i) {
    if (ch === ' ') return 132;
    if (ch === '.') return 250;
    return 58 + ((i * 37) % 5) * 13;
}

export default function useTypewriter(line, ready) {
    const [typed, setTyped] = useState(line.length);
    const [typing, setTyping] = useState(false);

    useEffect(() => {
        if (!ready || !motionOK()) return undefined;

        let i = 0;
        let timer = 0;

        setTyped(0);
        setTyping(true);

        /* Armed for the length of the animation and no longer. The
           sound only ever plays for a visitor who was already doing
           something on the page while this ran, which is the only
           moment a browser would allow it and the only moment it would
           not be a surprise. */
        const disarm = armKeystroke();

        const step = () => {
            i += 1;
            setTyped(i);
            if (line.charAt(i - 1) !== ' ') keystroke();

            if (i >= line.length) {
                setTyping(false);
                disarm();
                return;
            }

            timer = window.setTimeout(step, pause(line.charAt(i), i));
        };

        timer = window.setTimeout(step, LEAD);

        return () => {
            window.clearTimeout(timer);
            disarm();
            /* Interrupted, the line is handed over whole. */
            setTyped(line.length);
            setTyping(false);
        };
    }, [line, ready]);

    return { typed, typing };
}
