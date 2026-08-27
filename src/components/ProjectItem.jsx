import { useCallback, useState } from 'react';
import { m } from 'framer-motion';
import { ArrowRight } from './Icons.jsx';
import {
    PLATE_SCALE,
    ROW_RECEDE,
    STEP_NO,
    STEP_TITLE,
    TICK_IN,
    TICK_NUDGE,
} from '../motion/variants.js';

/* One row of the work index: a large numeral, the title, and a preview that
   — above the desktop breakpoint — is lifted out and travels down the right
   five columns as the reader moves through the list.

   Every move here hangs off `active`, so the six rows behave as one system:
   the plate travels to this row and clears over the one it replaces, the
   numeral and title step forward, the tick sweeps in from the left, and the
   same pair on every other row recedes while the index is being read.

   `stage` is the desktop plate. When it is false — a narrow window, or a
   touch screen — none of the positional work applies: every row carries its
   own preview at full strength, and there is nothing to hover. The tick still
   answers a press, which is the one acknowledgement a finger is offered.

   Every target is a plain object of resolved values, and every one of them is
   declared unconditionally, including on the server. Two reasons. Framer
   Motion needs a state it has held since the first render to fade from, and a
   target withheld until hydration is read as an initial state and applied
   without ever reaching the element — enough on its own to lose the
   crossfade. And an inherited gesture variant is skipped when the same event
   re-renders the child with an `animate` variant whose resolved values have
   not changed, which is precisely what a hover below the breakpoint does. So
   nothing here uses variants or gesture props: the hover, the focus ring and
   the press are ordinary state, like the rest of the row.

   What the prerendered document therefore carries is the narrow-window state
   — every plate opaque — and above the breakpoint the stylesheet's visibility
   is what leaves one plate showing until React picks the section up. */
export default function ProjectItem({
    project,
    index,
    active,
    stage,
    engaged,
    plateY,
    reduced,
    timing,
    onEnter,
    onFocus,
}) {
    const first = index === 0;

    /* Whether the reader is on this row in particular: a pointer over it, the
       focus ring on it, or a finger holding it down. Only the tick reads it. */
    const [near, setNear] = useState(false);
    const draw = useCallback((e) => {
        if (e && e.pointerType === 'touch') return;
        setNear(true);
    }, []);
    const hold = useCallback(() => setNear(true), []);
    const drop = useCallback(() => setNear(false), []);

    /* Anything positional belongs to the desktop plate, and to nobody who has
       asked for less movement. */
    const shift = stage && !reduced;

    const recede = stage && engaged && !active ? ROW_RECEDE : 1;
    const step = (distance) => (shift && active ? distance : 0);

    /* The tick waits to the left of its place until the row is the active one,
       and takes a small nudge forward while the reader is on the row. */
    const waiting = stage && !active;
    const tickX = reduced ? 0 : (near ? TICK_NUDGE : (waiting ? TICK_IN : 0));

    return (
        <li
            className={active ? 'idx is-on' : 'idx'}
            data-project={project.slug}
            data-reveal-soft=""
            onPointerEnter={(e) => onEnter(project.slug, e)}
            onFocus={() => onFocus(project.slug)}
        >
            <a
                className="idx__link"
                href={`work/${project.slug}.html`}
                onPointerEnter={draw}
                onPointerLeave={drop}
                onPointerDown={hold}
                onPointerUp={drop}
                onPointerCancel={drop}
                onFocus={draw}
                onBlur={drop}
            >
                <m.span
                    className="idx__no num"
                    aria-hidden="true"
                    initial={false}
                    animate={{ x: step(STEP_NO), opacity: recede }}
                    transition={{ x: timing.step, opacity: timing.tone }}
                >
                    {project.no}
                </m.span>
                <span className="idx__cat">{project.category}</span>
                <m.h3
                    className="idx__title"
                    initial={false}
                    animate={{ x: step(STEP_TITLE), opacity: recede }}
                    transition={{ x: timing.step, opacity: timing.tone }}
                >
                    {project.title}
                </m.h3>

                <m.figure
                    className="idx__figure frame"
                    initial={false}
                    /* The incoming plate is the one on top, so it clears over
                       the outgoing one rather than blending with it. */
                    style={stage ? { zIndex: active ? 2 : 1 } : undefined}
                    animate={
                        stage
                            ? { y: plateY, opacity: active ? 1 : 0 }
                            : { y: 0, opacity: 1 }
                    }
                    transition={{
                        y: timing.travel,
                        opacity: active ? timing.arrive : timing.leave,
                    }}
                >
                    <span className="frame__media">
                        {/* REPLACE: the cover is a 1600×1000 placeholder. Its path
                            and alt text are in src/data/projects.js. */}
                        <m.img
                            src={project.cover}
                            alt={project.coverAlt}
                            width="1600"
                            height="1000"
                            loading={first ? 'eager' : 'lazy'}
                            fetchPriority={first ? 'high' : undefined}
                            decoding="async"
                            initial={false}
                            animate={{ scale: shift && !active ? PLATE_SCALE : 1 }}
                            transition={timing.settle}
                        />
                    </span>
                    <figcaption className="cap">
                        <span className="cap__no num">Fig. {project.no}</span>
                    </figcaption>
                </m.figure>

                <p className="idx__desc">{project.summary}</p>

                <ul className="idx__meta metalist">
                    {project.meta.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>

                <span className="idx__go">
                    <span className="idx__go-label">{project.go}</span>
                    <m.span
                        className="idx__go-tick"
                        initial={false}
                        animate={{ opacity: waiting ? 0 : 1, x: tickX }}
                        transition={{ x: timing.tick, opacity: timing.tone }}
                    >
                        <ArrowRight />
                    </m.span>
                </span>
            </a>
        </li>
    );
}
