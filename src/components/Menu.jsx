import { SECTIONS, SITE } from '../data/site.js';
import MenuBuilders from './MenuBuilders.jsx';
import { useEnhanced, usePathname } from '../hooks/dom.js';

/* The navigation — the only one the site has — and the layer underneath
   the page.

   It is fixed to the right of the screen, one --menu-width wide, at
   z-index 1 — under the page layer at every moment, including this one.
   Opening it moves nothing here: the page in front slides off it, and
   what was always there is uncovered. The choreography is in
   src/hooks/useUnderlayNav.js; this file is only the document.

   Everything the site is navigated by is in here, which is what earns
   it the width: four sections, then the six case studies and the elsewhere links below. `base` and `work`
   differ per page because the site is a set of documents, so the home
   page links to its own anchors and a case study links back up to the
   index.

   A row says one thing and it is not the section's name — Me, the work,
   just because. The reader is being told what is down there rather than
   shown a table of contents, and a row that named itself twice was
   saying the quiet half out loud. `label` is still the section behind
   it and still what the code navigates by: Play scrolls to Side Quests,
   which is what that band and every anchor into it still are.

   There is no row for the top of the page. The portrait at the left of
   the masthead is that link, on every page and without opening
   anything, and a panel the reader has just opened over the page does
   not need to offer them the page back.

   Two kinds of current, and neither is passed in as a fact about the
   page. A section is marked by the scroll spy in useChrome, which finds
   these links by the .menu__link class they have always carried — and
   they are now all it finds, so this panel is where every aria-current
   on the site is written. A case study is marked by reading the
   document's own path, so a page never has to be told which page it is;
   that read happens on the client, so the prerendered document carries
   only the `current` it was given.

   It is named Primary because it is: the header's copy of the section
   list is gone, and there is no second navigation to distinguish this
   one from. */
export default function Menu({ base, work, current = null, open, panelRef, onClick }) {
    const path = usePathname();
    const enhanced = useEnhanced();

    return (
        <nav
            className="menu zone-invert"
            id="menu"
            aria-label="Primary"
            ref={panelRef}
            onClick={onClick}
            /* Closed, the panel is behind an opaque page: visible to
               nothing, but still in the tab order and still read out,
               which is a navigation a reader can reach and cannot see.
               Inert is the whole fix, and it is one attribute.

               But only once there is a script to open it again. The
               prerendered document is rendered closed, so an
               unconditional inert shipped in the HTML and stayed there
               for a reader without JavaScript — who is handed this
               panel as a plain block at the top of the page by section
               7 of the stylesheet, and could see every link in it and
               follow none. Gated on the client, the attribute is absent
               from the prerendered markup and from the first client
               render, which is also what keeps hydration quiet. */
            inert={enhanced && !open}
            data-menu=""
        >
            <div className="menu__inner">
                <ul className="menu__list">
                    {SECTIONS.map((section) => (
                        <li data-menu-reveal="l" key={section.id}>
                            <a
                                className="menu__link"
                                href={`${base}#${section.id}`}
                                aria-current={current === section.id ? 'true' : undefined}
                            >
                                {section.said}
                            </a>
                        </li>
                    ))}
                </ul>

                <MenuBuilders open={open} />

                <div className="menu__bottom">
                    <div className="menu__foot">
                        {/* Drawn in with the rest of the choreography
                            rather than being there from the start: the
                            last thing to arrive. */}
                        <span className="menu__rule" aria-hidden="true" />

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
                                {/* CV — no CV file exists in this
                                    repository yet. Save the PDF as
                                    public/assets/prathamesh-gaikwad-cv.pdf,
                                    then uncomment the row below. Not
                                    before the file exists: it would be
                                    a broken link.

                                <li data-menu-reveal="s">
                                    <a
                                        className="menu__small"
                                        href="/assets/prathamesh-gaikwad-cv.pdf"
                                        download
                                    >
                                        CV ↓
                                    </a>
                                </li>
                                */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
