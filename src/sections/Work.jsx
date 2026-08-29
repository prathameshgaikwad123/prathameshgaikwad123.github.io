import { LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import ProjectItem from '../components/ProjectItem.jsx';
import { projects } from '../data/projects.js';
import { workTiming, workTimingStill } from '../motion/variants.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import scatterToGrid from '../animations/scatterToGrid.js';

/* Where each cell of the figure index comes in from, as a percentage of
   its own size, plus a small rotation it loses on the way. Authored, not
   randomised: no two neighbours arrive from the same side, which is what
   makes the strip read as an arrangement being tidied rather than as
   noise settling. src/animations/scatterToGrid.js reads these. */
const SCATTER = [
    [-38, 26, -2.2],
    [22, -30, 1.6],
    [-16, 38, 2.4],
    [34, 18, -1.4],
    [-28, -24, 1.9],
    [18, 34, -2.6],
];

/* The centre of the site. An index on an inverted ground: one large numeral
   per project, and a single preview plate that travels down the right five
   columns to meet the active row.

   The interaction is one system, held in useWorkIndex and animated in
   ProjectItem. Two things decide whether it moves: a reader who has asked
   for less motion, and the frame before hydration — in both cases the states
   are identical and the transitions are simply gone, so the same information
   arrives without the movement.

   Above the header sits the figure index: the same six covers, in the same
   order, as one ruled row. It is the section's `Index 01 — 06` shown rather
   than stated, and it is index-driven too — the cell for the project the
   reader is on holds full strength while the rest step back, so the strip
   is a map of the list rather than an ornament above it. It carries no
   links and is hidden from the accessibility tree: every project in it is
   named, described and linked by the list below, and offering the same six
   destinations twice would only make the section longer to get through. */
export default function Work({ index }) {
    const { indexRef, active, engaged, stage, plateY, ready, indexProps, onRowEnter, onRowFocus } = index;

    const reduced = useReducedMotion();
    const timing = ready && !reduced ? workTiming : workTimingStill;
    const sheetRef = useScrollEffect(scatterToGrid);

    return (
        <section className="band zone-invert" id="work" aria-labelledby="work-title" ref={sheetRef}>
            <div className="shell">
                <div className="grid">
                    <p className="tag work__tag" data-reveal="">
                        <span className="tag__no num">01</span>Selected Work
                    </p>
                    <h2 className="statement work__statement" id="work-title" data-reveal="">
                        Work across interfaces, websites, brand systems and digital&nbsp;communication.
                    </h2>
                    <p className="tag tag--end work__count" data-reveal="">
                        <span className="tag__no num">Index</span>
                        <b className="num">01 — 06</b>
                    </p>

                    <ul className={stage ? 'sheet is-live' : 'sheet'} aria-hidden="true">
                        {projects.map((project, i) => (
                            <li
                                className={active === project.slug ? 'sheet__cell is-on' : 'sheet__cell'}
                                key={project.slug}
                                data-sx={SCATTER[i][0]}
                                data-sy={SCATTER[i][1]}
                                data-sr={SCATTER[i][2]}
                            >
                                <span className="sheet__plate">
                                    <img
                                        src={project.cover}
                                        alt=""
                                        width="1600"
                                        height="1000"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <span className="sheet__no num">{project.no}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="index" id="work-index" ref={indexRef} {...indexProps}>
                    {/* domAnimation is animation, variants and the hover,
                        focus and press gestures — everything this section asks
                        for and nothing else. Paired with the `m` components in
                        ProjectItem it keeps layout projection and drag out of
                        the build: 26kB gzipped rather than 39, and, because of
                        the chunk it is given in vite.config.js, only on this
                        page. */}
                    <LazyMotion features={domAnimation}>
                        <ul className="index__list">
                            {projects.map((project, i) => (
                                <ProjectItem
                                    key={project.slug}
                                    project={project}
                                    index={i}
                                    active={active === project.slug}
                                    stage={stage}
                                    engaged={engaged}
                                    plateY={plateY}
                                    reduced={!!reduced}
                                    timing={timing}
                                    onEnter={onRowEnter}
                                    onFocus={onRowFocus}
                                />
                            ))}
                        </ul>
                    </LazyMotion>
                </div>
            </div>
        </section>
    );
}
