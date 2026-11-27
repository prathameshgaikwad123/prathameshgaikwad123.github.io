import { useEffect, useState } from 'react';
import { motionOK } from './dom.js';
import { armKeystroke, keystroke } from './keystroke.js';

const LEAD = 380;

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
