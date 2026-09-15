import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/dom.js';

/* ===================================================================
   AIM — the thing under the fold
   -------------------------------------------------------------------
   A hairline runs the measure. A mark sits somewhere on it. Five
   passes to stop one on the other.

   It is a game made of the parts the site already has: a rule, two
   ticks, a tabular numeral and a button. Nothing here is drawn that
   is not already drawn somewhere above — which is the only reason a
   game belongs on this page at all. A scoreboard, a progress ring or a
   badge would be somebody else's furniture arriving at the bottom of a
   portfolio.

   It never starts itself. The reveal above puts it in front of the
   reader and stops there; the first press is theirs. From then on one
   button carries the whole state — Start, Stop, Next pass, Play again
   — so the control the reader pressed is the control they press next,
   and the keyboard never has to go looking for it.

   The travelling line is written straight to a custom property inside
   a rAF loop, never to React state: it moves sixty times a second and
   a render for each of those would be sixty renders of a scoreboard
   that changed on none of them. Everything that changes once a pass —
   the mark, the score, the readout — is state, and is rendered.

   Two things stop the loop. rAF is not called at all in a hidden tab,
   which the browser handles and the frame clamp below absorbs on the
   way back; and a panel scrolled off the screen is not one anybody is
   playing, so the observer parks it where it stands rather than
   letting it run in a room nobody is in.
   =================================================================== */

const PASSES = 5;

/* Seconds for one traverse of the measure, tightening a little each
   pass. For a reader who has asked for less motion it is one slower
   rate that does not tighten: the game is a moving line and cannot be
   anything else, but it was entered on purpose and it can be given at
   a pace that is closer to a reading speed than a reflex. */
const pace = (i, slow) => (slow ? 2.8 : 2 - i * 0.18);

/* Error is a percentage of the measure, so a score means the same
   thing on a phone as it does on a desk. At these rates a good press
   lands within two or three percent, which is seventy or eighty
   points; ten percent is the whole of it. A hundred is reserved for a
   stop that lands inside the width of the line itself, which is the
   only thing here anybody would call a win. */
const scoreOf = (off) => (off < 0.4 ? 100 : Math.max(0, Math.round(100 - off * 10)));

const verdict = (total) => {
    if (total >= 460) return 'Dead on. You have done this before.';
    if (total >= 380) return 'Close enough to ship.';
    if (total >= 260) return 'Within tolerance.';
    if (total >= 140) return 'The grid forgives.';
    return 'On the page, at least.';
};

const said = (off) => (off < 0.4 ? 'dead on' : `off by ${off.toFixed(1)} per cent`);

export default function Aim() {
    const reduced = useReducedMotion();

    const fieldRef = useRef(null);
    const xRef = useRef(0.5);
    const dirRef = useRef(1);

    const [phase, setPhase] = useState('idle');
    const [done, setDone] = useState(0);
    /* A fixed opening mark, not a random one: this is rendered at build
       time and picked back up in the browser, and a number drawn twice
       is two different documents. The first press is what randomises
       it, which is also the first moment it matters. */
    const [target, setTarget] = useState(0.5);
    const [last, setLast] = useState(null);
    const [score, setScore] = useState(0);
    const [say, setSay] = useState('');
    const [inView, setInView] = useState(true);

    useEffect(() => {
        const field = fieldRef.current;
        if (!field || typeof IntersectionObserver !== 'function') return undefined;
        const io = new IntersectionObserver(
            (entries) => setInView(entries[0].isIntersecting),
            { threshold: 0.25 },
        );
        io.observe(field);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        const field = fieldRef.current;
        if (phase !== 'running' || !inView || !field) return undefined;

        const span = pace(done, reduced) * 1000;
        let prev = 0;
        let frame = 0;

        const step = (now) => {
            if (prev) {
                /* A frame longer than four is a tab that was somewhere
                   else, and the line should be where it was left rather
                   than wherever the missing seconds would have carried
                   it. */
                const dt = Math.min(64, now - prev);
                let x = xRef.current + (dirRef.current * dt) / span;
                if (x > 1) {
                    x = 2 - x;
                    dirRef.current = -1;
                } else if (x < 0) {
                    x = -x;
                    dirRef.current = 1;
                }
                xRef.current = x;
                field.style.setProperty('--x', x.toFixed(4));
            }
            prev = now;
            frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [phase, inView, done, reduced]);

    const begin = useCallback(() => {
        /* Both ends of the measure are left alone. A mark in the last
           tenth is not a harder pass, it is a pass the line turns round
           in the middle of. */
        const mark = 0.12 + Math.random() * 0.76;
        const from = Math.random();

        xRef.current = from;
        dirRef.current = Math.random() < 0.5 ? -1 : 1;

        const field = fieldRef.current;
        if (field) {
            field.style.setProperty('--x', from.toFixed(4));
            field.style.removeProperty('--a');
            field.style.removeProperty('--w');
        }

        setTarget(mark);
        setLast(null);
        setPhase('running');
    }, []);

    const stop = useCallback(() => {
        const x = xRef.current;
        const gap = Math.abs(x - target);
        const off = gap * 100;
        const got = scoreOf(off);
        const n = done + 1;
        const total = score + got;

        const field = fieldRef.current;
        if (field) {
            field.style.setProperty('--a', Math.min(x, target).toFixed(4));
            field.style.setProperty('--w', gap.toFixed(4));
        }

        setLast({ off, points: got });
        setScore(total);
        setDone(n);
        setPhase(n >= PASSES ? 'over' : 'scored');
        setSay(
            n >= PASSES
                ? `Pass ${n}: ${said(off)}, ${got} points. Final score ${total} of 500. ${verdict(total)}`
                : `Pass ${n}: ${said(off)}, ${got} points.`,
        );
    }, [done, score, target]);

    const again = useCallback(() => {
        setDone(0);
        setScore(0);
        setSay('');
        begin();
    }, [begin]);

    const act = () => {
        if (phase === 'running') stop();
        else if (phase === 'over') again();
        else begin();
    };

    const label =
        phase === 'running' ? 'Stop'
            : phase === 'scored' ? 'Next pass'
                : phase === 'over' ? 'Play again'
                    : 'Start';

    const showing = phase === 'scored' || phase === 'over' ? done : Math.min(done + 1, PASSES);

    return (
        <div className="aim" data-phase={phase}>
            <div className="aim__head">
                <p>
                    Pass <span className="num">{String(showing).padStart(2, '0')}</span>
                    {' / '}
                    <span className="num">{String(PASSES).padStart(2, '0')}</span>
                </p>
                <p>
                    Score <span className="num">{String(score).padStart(3, '0')}</span>
                </p>
            </div>

            {/* The board is a picture of a number, and the number is
                said in full in the live region below it. */}
            <div className="aim__field" ref={fieldRef} style={{ '--t': target }} aria-hidden="true">
                <div className="aim__track">
                    <span className="aim__rule" />
                    <span className="aim__span" />
                    <span className="aim__target"><i /></span>
                    <span className="aim__line"><i /></span>
                </div>
            </div>

            <p className="aim__read" aria-hidden="true">
                {last ? (
                    <>
                        <span>{last.off < 0.4 ? 'Dead on' : `Off by ${last.off.toFixed(1)}%`}</span>
                        <span className="aim__sep">·</span>
                        <span className="aim__pts num">{last.points}</span>
                    </>
                ) : (
                    <span>Stop the line on the mark.</span>
                )}
            </p>

            {phase === 'over' ? (
                <div className="aim__close">
                    <p className="aim__total">
                        <span className="num">{score}</span>
                        <span className="aim__of num">/500</span>
                    </p>
                    <p className="aim__verdict">{verdict(score)}</p>
                </div>
            ) : null}

            <button type="button" className="btn btn--primary aim__go" onClick={act}>
                {label}
            </button>

            <p className="visually-hidden" aria-live="polite" aria-atomic="true">
                {say}
            </p>
        </div>
    );
}
