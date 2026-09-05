import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { sideQuests } from '../data/sideQuests.js';
import { useEnhanced } from '../hooks/dom.js';

/* ===================================================================
   SIDE QUESTS
   -------------------------------------------------------------------
   The one section with nothing to prove. Everything above it answered
   to somebody — a brief, an organisation, a deadline — and this is the
   rest of it.

   It used to be a wall of plates pinned a degree or two off true. The
   tilt was doing all the work of saying "these are different", and it
   was the wrong kind of different: a grid that has been knocked rather
   than a section that is playful. What is playful here now is the
   thing the reader does, not the angle the pictures sit at.

   So: a rail, and a grid that answers it. The rail names the families
   the quests fall into and carries a rule that travels between them —
   and the rule leads with the edge it is travelling towards, so it
   stretches on the way and settles at the far end rather than sliding
   as a rigid block. That stretch is the whole of the section's
   character, and it is two transition durations rather than a library.

   The grid stays a grid through all of it. Three columns, then two,
   then one; every card the same width, the same ratio, the same
   distance from its neighbour. The families are sized so that every
   state of the rail fills those columns exactly — see the note in
   src/data/sideQuests.js — which is what lets the content change
   without the composition ever going ragged.

   Two entrance systems, and they do not overlap. Until the reader
   touches the rail, the cards carry `data-reveal` and arrive with the
   rest of the page on scroll. From the first press onwards the key
   changes with the family, which remounts the cards and replays the
   settle animation in the stylesheet — and `data-reveal` comes off, so
   a remounted card is never left at the opacity the reveal starts on
   with no observer to take it off again.
   =================================================================== */

const ALL = 'all';

/* One card. An anchor when the quest has somewhere to go and a plain
   block when it does not, which is the only difference a link makes:
   nothing here is clickable that does not lead anywhere. */
function Quest({ item }) {
    const inner = (
        <>
            <span className="quest__plate frame">
                <span className="frame__media">
                    {/* REPLACE: labelled placeholder — see
                        src/data/sideQuests.js. */}
                    <img
                        src={item.cover}
                        alt={item.alt}
                        width="1600"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                    />
                </span>
            </span>

            <span className="quest__meta">
                <span className="quest__no num" aria-hidden="true">
                    {item.no}
                </span>
                <span className="quest__type">{item.type}</span>
            </span>

            <span className="quest__title">
                {item.title}
                {item.href ? (
                    <span className="quest__go" aria-hidden="true">
                        {' '}
                        ↗
                    </span>
                ) : null}
            </span>

            <span className="quest__note">{item.note}</span>

            {/* The rule under the card, drawn from the left on the
                gesture. It is the accent's one appearance here at rest
                scale, and it is a scaleX rather than a width so it
                costs a composite and not a layout. */}
            <span className="quest__rule" aria-hidden="true" />
        </>
    );

    return item.href ? (
        <a className="quest__link" href={item.href} target="_blank" rel="noopener noreferrer">
            {inner}
        </a>
    ) : (
        <div className="quest__link quest__link--flat">{inner}</div>
    );
}

export default function SideQuests() {
    const enhanced = useEnhanced();
    const railRef = useRef(null);
    const btnRefs = useRef({});

    const [family, setFamily] = useState(ALL);
    /* Whether the rail has been used. Before it has, the cards keep the
       page's own entrance; after, they get the rail's. */
    const [touched, setTouched] = useState(false);

    /* The rail, built from the data rather than written out: the
       families in the order they first appear, each with its count. */
    const families = useMemo(() => {
        const seen = [];
        for (const q of sideQuests) if (!seen.includes(q.family)) seen.push(q.family);
        return [
            { id: ALL, label: 'Everything', count: sideQuests.length },
            ...seen.map((id) => ({
                id,
                label: id.charAt(0).toUpperCase() + id.slice(1),
                count: sideQuests.filter((q) => q.family === id).length,
            })),
        ];
    }, []);

    const shown = useMemo(
        () => (family === ALL ? sideQuests : sideQuests.filter((q) => q.family === family)),
        [family],
    );

    /* The travelling rule. Both edges are written as insets so each can
       be given its own duration in the stylesheet — the leading edge
       arrives first and the trailing one catches up, which is the
       stretch. Measured in a layout effect so the rule is already in
       place on the frame the press paints. */
    const place = useCallback(() => {
        const rail = railRef.current;
        const btn = btnRefs.current[family];
        if (!rail || !btn) return;
        const r = rail.getBoundingClientRect();
        const b = btn.getBoundingClientRect();
        rail.style.setProperty('--ml', `${Math.round(b.left - r.left)}px`);
        rail.style.setProperty('--mr', `${Math.round(r.right - b.right)}px`);
        rail.dataset.placed = '';
    }, [family]);

    /* `enhanced` is in the dependencies because the rail is: it is false
       on the first render, so there is nothing to measure then, and
       without it here the effect would never run again once there was.

       The chips are what is observed rather than the rail. The rail is
       the full measure at every width and so never changes size, while
       the chips are the things whose widths the rule is written from —
       and those move when the interface face lands, which is the one
       reflow that would otherwise leave the rule under nothing. */
    useLayoutEffect(() => {
        place();
        if (!enhanced) return undefined;

        const chips = railRef.current?.firstElementChild;
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null;
        if (ro && chips) ro.observe(chips);

        let live = true;
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                if (live) place();
            });
        }

        return () => {
            live = false;
            if (ro) ro.disconnect();
        };
    }, [place, enhanced]);

    const choose = (id) => {
        if (id === family) return;
        /* Which way the rule is going, so the stylesheet knows which
           edge should lead. */
        if (railRef.current) {
            const from = families.findIndex((f) => f.id === family);
            const to = families.findIndex((f) => f.id === id);
            railRef.current.dataset.dir = to > from ? 'fwd' : 'back';
        }
        setTouched(true);
        setFamily(id);
    };

    return (
        <section className="band" id="side-quests" aria-labelledby="side-quests-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag quests__tag" data-reveal="">
                        <span className="tag__no num">05</span>Side Quests
                    </p>
                    <h2 className="statement quests__statement" id="side-quests-title" data-reveal="">
                        Things I made because I&nbsp;wanted&nbsp;to.
                    </h2>
                    <p className="lead quests__lead" data-reveal="">
                        No brief, no client, no deadline. Experiments, small builds and
                        whatever else I was curious about that week.
                    </p>

                    {/* The rail is a control, so it is only offered where
                        it works. Without a script it would be a row of
                        buttons that do nothing over a grid that already
                        shows everything, which is worse than not being
                        there — and the grid below is the full set either
                        way. */}
                    {enhanced ? (
                        <div className="quests__rail" ref={railRef} data-reveal="">
                            <div className="quests__chips" role="group" aria-label="Filter side quests">
                                {families.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        className="quests__chip"
                                        aria-pressed={family === f.id}
                                        onClick={() => choose(f.id)}
                                        ref={(el) => {
                                            btnRefs.current[f.id] = el;
                                        }}
                                    >
                                        {f.label}
                                        <span className="quests__count num" aria-hidden="true">
                                            {String(f.count).padStart(2, '0')}
                                        </span>
                                    </button>
                                ))}
                                <span className="quests__marker" aria-hidden="true" />
                            </div>
                        </div>
                    ) : null}

                    <ul className="quests">
                        {shown.map((item, i) => (
                            <li
                                className="quest"
                                key={touched ? `${family}-${item.id}` : item.id}
                                style={{ '--i': i }}
                                {...(touched ? { 'data-settle': '' } : { 'data-reveal': '' })}
                            >
                                <Quest item={item} />
                            </li>
                        ))}
                    </ul>

                    {/* What changed, for a reader who cannot see the grid
                        re-compose under the rail. */}
                    <p className="visually-hidden" aria-live="polite" aria-atomic="true">
                        {touched
                            ? `${shown.length} of ${sideQuests.length} side quests shown.`
                            : ''}
                    </p>
                </div>
            </div>
        </section>
    );
}
