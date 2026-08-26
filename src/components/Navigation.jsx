import { useRef } from 'react';
import { SECTIONS, SITE } from '../data/site.js';
import { IconMoon, IconSun } from './Icons.jsx';
import useTheme from '../hooks/useTheme.js';

/* The masthead: the one rounded thing on the site. A single floating plate
   carrying the monogram, the section list, the theme control and — below the
   desktop breakpoint — the menu button.

   `home` and `base` differ per page because the site is a set of documents:
   the home page links to its own anchors, a case study links back up to the
   index, and the 404 page links to the site root. */
export default function Navigation({
    home,
    base,
    current = null,
    pill = false,
    menuOpen = false,
    onMenuToggle,
    menuButtonRef,
}) {
    const toggleRef = useRef(null);
    useTheme(toggleRef);

    return (
        <header className="masthead" id="masthead">
            <div className="masthead__inner">
                <a className="wordmark" href={home}>
                    <span className="wordmark__initials">{SITE.initials}</span>
                    <span className="wordmark__full">{SITE.name}</span>
                    <span className="wordmark__role">{SITE.role}</span>
                </a>

                <nav className={pill ? 'nav has-pill' : 'nav'} id="nav" aria-label="Primary">
                    <ul className="nav__list">
                        {/* The active section's ground travels rather than
                            being switched on and off under each label: one
                            element behind the list, moved to the current
                            link. Without JavaScript the ground is drawn by
                            CSS on the current link instead, so the state is
                            never lost. */}
                        {pill && <span className="nav__pill" aria-hidden="true" />}
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a
                                    className="nav__link"
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
                    {/* CV BUTTON — no CV file exists in this repository yet.
                        Add your PDF at public/assets/prathamesh-gaikwad-cv.pdf,
                        then uncomment the list below. Do not enable it before
                        the file exists: it would be a broken link.
                    <ul className="nav__list">
                        <li><a className="nav__link" href="/assets/prathamesh-gaikwad-cv.pdf" download>CV</a></li>
                    </ul>
                    */}
                </nav>

                <div className="masthead__actions">
                    <button
                        className="theme-toggle"
                        id="theme-toggle"
                        type="button"
                        aria-label="Switch to dark theme"
                        ref={toggleRef}
                    >
                        <IconSun />
                        <IconMoon />
                    </button>

                    <button
                        className="menu-btn"
                        id="menu-btn"
                        type="button"
                        aria-expanded={menuOpen}
                        aria-controls="menu"
                        onClick={onMenuToggle}
                        ref={menuButtonRef}
                    >
                        <span className="menu-btn__label">Menu</span>
                        <span className="menu-btn__bars" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
}
