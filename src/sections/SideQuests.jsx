import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { sideQuests } from '../data/sideQuests.js';
import Words from '../components/Words.jsx';
import { useEnhanced } from '../hooks/dom.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import lineReveal from '../animations/lineReveal.js';
import { responsive } from '../data/cloudinary.js';

const ALL = 'all';

const QUEST_SIZES = '(min-width: 92rem) 440px, (min-width: 62rem) 30vw, (min-width: 40rem) 45vw, 92vw';

function Quest({ item }) {
    const inner = (
        <>
            <span className="quest__plate frame">
                <span className="frame__media">

                    <img
                        {...responsive(item.cover, QUEST_SIZES)}
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
    const sectionRef = useScrollEffect(lineReveal);
    const railRef = useRef(null);
    const btnRefs = useRef({});

    const [family, setFamily] = useState(ALL);

    const [touched, setTouched] = useState(false);

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

        if (railRef.current) {
            const from = families.findIndex((f) => f.id === family);
            const to = families.findIndex((f) => f.id === id);
            railRef.current.dataset.dir = to > from ? 'fwd' : 'back';
        }
        setTouched(true);
        setFamily(id);
    };

    return (
        <section
            data-reveal-rule=""
            className="band"
            id="side-quests"
            aria-labelledby="side-quests-title"
            ref={sectionRef}
        >
            <div className="shell">
                <div className="grid">
                    <p className="tag quests__tag" data-reveal="">
                        Side projects
                    </p>
                    <h2 className="statement quests__statement" id="side-quests-title" data-reveal="">
                        <Words text="Experiments and side projects." className="sw" inner />
                    </h2>
                    <p className="lead quests__lead" data-reveal="">
                        Experiments, small builds and other things I was curious about. This section is still being filled in, and each project goes up when it is ready.
                    </p>

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
