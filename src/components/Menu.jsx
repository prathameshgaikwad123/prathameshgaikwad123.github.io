import { SECTIONS, SITE } from '../data/site.js';
import { useEnhanced, usePathname } from '../hooks/dom.js';

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

                <div className="menu__bottom">
                    <div className="menu__foot">

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
                                <li data-menu-reveal="s">
                                    <a
                                        className="menu__small"
                                        href={SITE.behance}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Behance ↗
                                    </a>
                                </li>
                                <li data-menu-reveal="s">
                                    <a className="menu__small" href={SITE.resume} download>
                                        Résumé ↓
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
