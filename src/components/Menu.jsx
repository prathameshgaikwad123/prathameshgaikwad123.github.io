import { SECTIONS, SITE } from '../data/site.js';

/* Overlay navigation below 62rem. Focus is trapped inside it by useMenu
   while it is open; following a link closes it, because the anchor scroll
   happens on the page behind. */
export default function Menu({ base, current = null, open, panelRef, onClick }) {
    return (
        <div className={open ? 'menu is-open' : 'menu'} id="menu" ref={panelRef} onClick={onClick}>
            <nav aria-label="Sections">
                <ul className="menu__list">
                    {SECTIONS.map((section) => (
                        <li key={section.id}>
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
            </nav>
            <div className="menu__foot">
                <p className="eyebrow">{SITE.where}</p>
                <p className="eyebrow">{SITE.disciplines}</p>
            </div>
        </div>
    );
}
