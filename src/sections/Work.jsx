import ProjectItem from '../components/ProjectItem.jsx';
import { projects } from '../data/projects.js';

/* The centre of the site. An index on an inverted ground: one large numeral
   per project, and a single preview plate that travels down the right five
   columns to meet the active row. */
export default function Work({ indexRef, active, onRowEnter, onRowFocus }) {
    return (
        <section className="band zone-invert" id="work" aria-labelledby="work-title">
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

                <div className="index" id="work-index" ref={indexRef}>
                    <ul className="index__list">
                        {projects.map((project, i) => (
                            <ProjectItem
                                key={project.slug}
                                project={project}
                                index={i}
                                active={active === project.slug}
                                onEnter={onRowEnter}
                                onFocus={onRowFocus}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
