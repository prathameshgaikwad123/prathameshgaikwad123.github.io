import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import { Progress, SkipLink } from './components/Chrome.jsx';

import Hero from './sections/Hero.jsx';
import Opening from './sections/Opening.jsx';
import Work from './sections/Work.jsx';
import About from './sections/About.jsx';
import Capabilities from './sections/Capabilities.jsx';
import Experience from './sections/Experience.jsx';
import Contact from './sections/Contact.jsx';

import { useEnhanced } from './hooks/dom.js';
import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';
import useReveal from './hooks/useReveal.js';
import useWorkIndex from './hooks/useWorkIndex.js';
import useCaseTransition from './hooks/useCaseTransition.js';

/* The home page: one scrolling document, five anchored sections.

   Two layers. The navigation is fixed under everything; the page is the
   one layer above it, and opening the menu slides that layer off the
   navigation rather than bringing anything in over it. Everything that
   floats — the intro, the skip link, the plate, the reading-progress
   line and the overlay that travels with the page — stays outside the
   layer that moves. */
export default function App() {
    const enhanced = useEnhanced();
    const intro = useIntro();
    const menu = useMenu();
    const index = useWorkIndex();

    useChrome({ pillReady: enhanced });
    useUnderlayNav(menu.open);
    useReveal(intro.done);
    useCaseTransition(index.indexRef, index.setActive);

    return (
        <>
            <Loader innerRef={intro.ref} hidden={intro.hidden} />
            <SkipLink />

            <Navigation
                home="#top"
                base=""
                pill={enhanced}
                menuOpen={menu.open}
                onMenuToggle={menu.toggle}
                menuButtonRef={menu.buttonRef}
            />
            <Progress />

            <Menu
                home="#top"
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
                    <Work index={index} />
                    <About />
                    <Capabilities />
                    <Experience />
                    <Contact />
                </main>
            </div>
        </>
    );
}
