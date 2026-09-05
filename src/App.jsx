import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import { Progress, SkipLink } from './components/Chrome.jsx';

import Hero from './sections/Hero.jsx';
import Opening from './sections/Opening.jsx';
import Work from './sections/Work.jsx';
import Behance from './sections/Behance.jsx';
import About from './sections/About.jsx';
import Capabilities from './sections/Capabilities.jsx';
import SideQuests from './sections/SideQuests.jsx';
import Contact from './sections/Contact.jsx';

import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';
import useReveal from './hooks/useReveal.js';

/* The home page: one scrolling document, six bands under the hero —
   Selected Work, Selected Behance Work, About, Capabilities, Side Quests
   and Contact. Four of the six are in the navigation panel; the other
   two are arrived at by reading, which is the difference between a
   destination and a section.

   Two layers. The navigation is fixed under everything; the page is the
   one layer above it, and opening the menu slides that layer off the
   navigation rather than bringing anything in over it. Everything that
   floats — the intro, the skip link, the header's two plates, the
   reading-progress line and the overlay that travels with the page —
   stays outside the layer that moves. */
export default function App() {
    const intro = useIntro();
    const menu = useMenu();

    useChrome();
    useUnderlayNav(menu.open);
    useReveal(intro.done);

    return (
        <>
            <Loader innerRef={intro.ref} hidden={intro.hidden} />
            <SkipLink />

            <Navigation
                home="#top"
                menuOpen={menu.open}
                onMenuToggle={menu.toggle}
                menuButtonRef={menu.buttonRef}
            />
            <Progress />

            <Menu
                base=""
                work="work/"
                open={menu.open}
                panelRef={menu.panelRef}
                onClick={menu.onPanelClick}
            />
            <Underlay onClick={menu.onOverlayClick} />

            <div data-main="" inert={menu.open || undefined}>
                <main id="main">
                    <Hero />
                    <Opening />
                    <Work />
                    <Behance />
                    <About />
                    <Capabilities />
                    <SideQuests />
                    <Contact />
                </main>
            </div>
        </>
    );
}
