import { ArrowRight } from './Icons.jsx';

/* One row of the work index: a large numeral, the title, and a preview that
   — above the desktop breakpoint — is lifted out and travels down the right
   five columns as the reader moves through the list. */
export default function ProjectItem({ project, index, active, onEnter, onFocus }) {
    const first = index === 0;

    return (
        <li
            className={active ? 'idx is-on' : 'idx'}
            data-project={project.slug}
            data-reveal-soft=""
            onPointerEnter={(e) => onEnter(project.slug, e)}
            onFocus={() => onFocus(project.slug)}
        >
            <a className="idx__link" href={`work/${project.slug}.html`}>
                <span className="idx__no num" aria-hidden="true">
                    {project.no}
                </span>
                <span className="idx__cat">{project.category}</span>
                <h3 className="idx__title">{project.title}</h3>

                <figure className="idx__figure frame">
                    <span className="frame__media">
                        {/* REPLACE: the cover is a 1600×1000 placeholder. Its path
                            and alt text are in src/data/projects.js. */}
                        <img
                            src={project.cover}
                            alt={project.coverAlt}
                            width="1600"
                            height="1000"
                            loading={first ? 'eager' : 'lazy'}
                            fetchPriority={first ? 'high' : undefined}
                            decoding="async"
                        />
                    </span>
                    <figcaption className="cap">
                        <span className="cap__no num">Fig. {project.no}</span>
                    </figcaption>
                </figure>

                <p className="idx__desc">{project.summary}</p>

                <ul className="idx__meta metalist">
                    {project.meta.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>

                <span className="idx__go">
                    <span className="idx__go-label">{project.go}</span>
                    <ArrowRight />
                </span>
            </a>
        </li>
    );
}
