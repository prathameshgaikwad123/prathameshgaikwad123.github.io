import { useRef } from 'react';
import { SITE } from '../data/site.js';
import { IconMoon, IconSun } from './Icons.jsx';
import useTheme from '../hooks/useTheme.js';
import useSaying from '../hooks/useSaying.js';

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

    const say = useSaying();

    return (
        <header className="masthead" id="masthead">
            {/* The identity, and it is a face rather than two letters: a
                tightly cropped portrait in one small chip, which is the
                one mark on a site with no logo that could only belong
                to this person.

                Beside it is what the mark says, not who it is. At rest
                that is "oh, hi." on every page and at every width;
                pointed at, focused or tapped it is one of the
                twenty-five asides in src/data/site.js, a different one
                each time. The name that used to sit here is gone from
                the plate entirely — including the tooltip, which was
                the same name said a third way and would have argued
                with the line under the cursor.

                What the LINK is called is a separate matter and is
                still written on the anchor outright: a link's name has
                to hold still, and this one's text is a thing that
                moves. Which is also why the line is `aria-hidden` — it
                is the chip's tone of voice, not a second label — and
                why the portrait is `alt=""`: the identity said one way
                is enough. The reader is told whose site this is by the
                document's title, the hero and the panel.

                Nothing here intercepts the click. The chip is the way
                back to the top of the page, or up to the index from a
                case study, exactly as it was. */}
            <div className="masthead__inner masthead__inner--brand">
                <a className="wordmark" href={home} aria-label={SITE.name} {...say.handlers}>
                    <span className="wordmark__face">
                        {/* The portrait itself is
                            public/assets/images/avatar.png — a square
                            crop of the portrait illustration, and the
                            same crop the favicon and the two
                            home-screen icons are cut from. The chip
                            crops and sizes whatever it is given and the
                            treatment is --nav-face-tone in section 1
                            of the stylesheet, so the file is the only
                            thing this depends on. See ASSETS.md. */}
                        <img
                            src="/assets/images/avatar.png"
                            alt=""
                            width="64"
                            height="64"
                            decoding="async"
                        />
                    </span>
                    {/* Keyed on the phrase, so a new one is a new
                        element and arrives on its own small fade
                        (@keyframes say-in) rather than being swapped
                        under the reader's eye. */}
                    <span className="wordmark__say" key={say.saying} aria-hidden="true">
                        {say.saying}
                    </span>
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
