import { LazyMotion, domAnimation, useReducedMotion } from 'framer-motion';
import ProjectItem from '../components/ProjectItem.jsx';
import WorkCarousel from '../components/WorkCarousel.jsx';
import { projects } from '../data/projects.js';
import { workTiming, workTimingStill } from '../motion/variants.js';

/* The centre of the site. An index on a warm ground: one large numeral
   per project, and a single preview plate that travels down the right five
   columns to meet the active row.

   The interaction is one system, held in useWorkIndex and animated in
   ProjectItem. Two things decide whether it moves: a reader who has asked
   for less motion, and the frame before hydration — in both cases the states
   are identical and the transitions are simply gone, so the same information
   arrives without the movement.

   Above the header sits the carousel: the same six covers, in the same
   order, as one rigid row behind a pane of glass. It is the section's
   `Index 01 — 06` shown rather than stated, and it is index-driven both
   ways — scrolling the strip moves the list's active project, and hovering
   or focusing a row of the list brings the strip round to meet it, by the
   shortest way. What it does not carry is a second set of links: every
   project in it is named, described and linked by the list below, and
   offering the same six destinations twice would only make the section
   longer to get through. */
export default function Work({ index }) {
    const { indexRef, active, engaged, stage, plateY, ready, indexProps, onRowEnter, onRowFocus, setActive } = index;

    const reduced = useReducedMotion();
    const timing = ready && !reduced ? workTiming : workTimingStill;

    return (
        <section className="band zone-warm" id="work" aria-labelledby="work-title">
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
                </div>
            </div>

            {/* Outside the shell, and deliberately: the lens is a field
                across the whole width and its rims have to reach the
                edges of the page. A section is exactly the width of the
                page's content box, so full bleed here is `width: 100%`
                and never the viewport unit that would also count the
                scrollbar and push the strip a few pixels off centre. */}
            <WorkCarousel items={projects} active={active} onActive={setActive} reduced={!!reduced} />

            <div className="shell">
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
