import { SITE } from '../data/site.js';
import useSaying from '../hooks/useSaying.js';

export default function Navigation({ home, menuOpen = false, onMenuToggle, menuButtonRef }) {
    const say = useSaying();

    return (
        <header className="masthead" id="masthead">

            <div className="masthead__inner masthead__inner--brand">
                <a className="wordmark" href={home} aria-label={SITE.name} {...say.handlers}>
                    <span className="wordmark__face">

                        <img
                            src="/assets/images/avatar.png"
                            srcSet="/assets/images/avatar.webp 128w"
                            sizes="2rem"
                            alt=""
                            width="64"
                            height="64"
                            decoding="async"
                        />
                    </span>

                    {say.saying && (
                        <span className="wordmark__say" key={say.saying} aria-hidden="true">
                            {say.saying}
                        </span>
                    )}
                </a>
            </div>

            <div className="masthead__inner masthead__inner--actions">

                <button
                    className="menu-btn"
                    id="menu-btn"
                    type="button"
                    aria-expanded={menuOpen}
                    aria-controls="menu"
                    aria-label={menuOpen ? 'Close the menu' : 'Open the menu'}
                    onClick={onMenuToggle}
                    ref={menuButtonRef}
                    data-menu-toggle=""
                >
                    <span className="menu-btn__text" aria-hidden="true">
                        <span className="menu-btn__label">Menu</span>
                        <span className="menu-btn__label">Close</span>
                    </span>
                    <span className="menu-btn__bars" aria-hidden="true">
                        <span className="menu-btn__bar" />
                        <span className="menu-btn__bar" />
                    </span>
                </button>
            </div>
        </header>
    );
}
