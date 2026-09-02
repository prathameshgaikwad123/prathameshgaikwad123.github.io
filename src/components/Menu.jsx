import { SECTIONS, SITE } from '../data/site.js';
import { projects } from '../data/projects.js';
import { usePathname } from '../hooks/dom.js';

/* The navigation, and the layer underneath the page.

   It is fixed to the right of the screen, one --menu-width wide, at
   z-index 1 — under the page layer at every moment, including this one.
   Opening it moves nothing here: the page in front slides off it, and
   what was always there is uncovered. The choreography is in
   src/hooks/useUnderlayNav.js; this file is only the document.

   Everything the site can be reached by is in here, which is what earns
   it the width: the five sections above, the six case studies and the
   elsewhere links below. `home`, `base` and `work` differ per page for
   the same reason they do on the plate — the site is a set of documents,
   so the home page links to its own anchors and a case study links back
   up to the index.

   Two kinds of current, and neither is passed in as a fact about the
   page. A section is marked by the scroll spy in useChrome, which finds
   these links by the .menu__link class they have always carried. A case
   study is marked by reading the document's own path, so a page never
   has to be told which page it is. */
export default function Menu({ home, base, work, current = null, open, panelRef, onClick }) {
    const path = usePathname();

    return (
        <nav
            className="menu zone-invert"
            id="menu"
            aria-label="Site"
            ref={panelRef}
            onClick={onClick}
            /* Closed, the panel is behind an opaque page: visible to
               nothing, but still in the tab order and still read out,
               which is a navigation a reader can reach and cannot see.
               Inert is the whole fix, and it is one attribute. */
            inert={!open}
            data-menu=""
        >
            <div className="menu__inner">
                <ul className="menu__list">
                    {/* The top of the page, numbered like everything else
                        in the index — and marked by useChrome when no
                        section has been reached yet. */}
                    <li data-menu-reveal="l">
                        <a className="menu__link" href={home} data-nav-home="">
                            <span className="nav__num" aria-hidden="true">
                                00
                            </span>
                            Home
                        </a>
                    </li>

                    {SECTIONS.map((section) => (
                        <li data-menu-reveal="l" key={section.id}>
                            <a
                                className="menu__link"
                                href={`${base}#${section.id}`}
                                aria-current={current === section.id ? 'true' : undefined}
                            >
                                <span className="nav__num" aria-hidden="true">
                                    {section.no}
                                </span>
                                {section.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="menu__bottom">
                    <div className="menu__foot">
                        {/* Drawn in with the rest of the choreography
                            rather than being there from the start: the
                            last thing to arrive. */}
                        <span className="menu__rule" aria-hidden="true" />

                        {/* The two labels name their lists rather than
                            heading them. The panel comes before the page in
                            the document, so a heading here would be an h2
                            standing in front of the page's h1 — and a list
                            with a name is what a reader of the panel
                            actually wants from them. */}
                        <div className="menu__col">
                            <p className="eyebrow" id="menu-work" data-menu-reveal="s">
                                Selected Work
                            </p>
                            <ul className="menu__links" aria-labelledby="menu-work">
                                {projects.map((project) => (
                                    <li data-menu-reveal="s" key={project.slug}>
                                        <a
                                            className="menu__small"
                                            href={`${work}${project.slug}.html`}
                                            aria-current={
                                                path.endsWith(`/work/${project.slug}.html`)
                                                    ? 'page'
                                                    : undefined
                                            }
                                        >
                                            <span className="nav__num" aria-hidden="true">
                                                {project.no}
                                            </span>
                                            {project.short}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="menu__col">
                            <p className="eyebrow" id="menu-elsewhere" data-menu-reveal="s">
                                Elsewhere
                            </p>
                            <ul className="menu__links" aria-labelledby="menu-elsewhere">
                                <li data-menu-reveal="s">
                                    <a
                                        className="menu__small"
                                        href={SITE.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        LinkedIn ↗
                                    </a>
                                </li>
                                <li data-menu-reveal="s">
                                    <a
                                        className="menu__small"
                                        href={SITE.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        GitHub ↗
                                    </a>
                                </li>
                                <li data-menu-reveal="s">
                                    <a className="menu__small" href={`mailto:${SITE.email}`}>
                                        Email
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="menu__meta" data-menu-reveal="s">
                        <p className="eyebrow">{SITE.where}</p>
                        <p className="eyebrow">{SITE.disciplines}</p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
