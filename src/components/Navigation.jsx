import { useRef } from 'react';
import { SITE } from '../data/site.js';
import { IconMoon, IconSun } from './Icons.jsx';
import useTheme from '../hooks/useTheme.js';

/* The masthead: two plates, one at each end of the screen, and nothing
   between them.

   The site has one navigation now — the panel fixed under the page — so
   the header has one job at either end of the screen: say whose site
   this is, and carry the control that opens the index. The section list
   that used to run across the middle is gone, and with it the reason
   the header was a single centred bar. Two plates pinned to the gutters
   is what is left when the middle has nothing to hold: identity read
   from the left edge, controls from the right, and the span between
   them left open rather than closed up around a gap.

   Both plates are the same .masthead__inner, deliberately. The ground,
   the hairline, the blur, the cast, the tuck on scroll, the opaque
   fallback where there is no backdrop filter, the forced-colours border
   and the print rule are all written against that one class, so each
   end simply is one and none of it is restated.

   Pinning also settles the seam. The plate was centred, so at every
   width it straddled the edge the page slides to and sat half over the
   page and half over the panel. Now the identity stays over the page it
   belongs to and the toggle stands over the panel it opens — from the
   small-phone step up. Below about 23rem the panel is 80vw and the page
   keeps too little of itself for a 54px plate to sit clear of, so at
   360px and narrower the identity still catches the seam by a few
   pixels. The panel's measure is the deliberate half of that pair, so
   it is the sentence that gets qualified and not the width.

   `home` differs per page because the site is a set of documents: the
   home page links to its own top, a case study links back up to the
   index, and the 404 page links to the site root. */
export default function Navigation({ home, menuOpen = false, onMenuToggle, menuButtonRef }) {
    const toggleRef = useRef(null);
    useTheme(toggleRef);

    return (
        <header className="masthead" id="masthead">
            {/* The identity. The monogram is the mark at every width;
                the name is set beside it from the tablet step up, where
                there is room for the lockup and a lone square would
                otherwise sit adrift in a header with nothing else in
                it. Below that step the name is still in the document,
                only unpainted — which is what keeps the link called the
                same thing on both sides of the breakpoint. */}
            <div className="masthead__inner masthead__inner--brand">
                <a className="wordmark" href={home}>
                    <span className="wordmark__initials">{SITE.initials}</span>
                    <span className="wordmark__full">{SITE.name}</span>
                </a>
            </div>

            <div className="masthead__inner masthead__inner--actions">
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

                {/* The control that opens the navigation, and the only
                    navigation control the site has: what is behind it is
                    the whole index.

                    Both labels are in the document at once, stacked in a
                    window one line tall, and both bars are real elements
                    — the timeline in useUnderlayNav has to be able to
                    reach them, and a pseudo-element cannot be reached.
                    Which means the button's own text reads "MenuClose",
                    so the whole of it is hidden and the name is given
                    outright. */}
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
