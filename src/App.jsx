import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import { Progress, SkipLink } from './components/Chrome.jsx';

import Hero from './sections/Hero.jsx';
import Work from './sections/Work.jsx';
import About from './sections/About.jsx';
import Capabilities from './sections/Capabilities.jsx';
import Experience from './sections/Experience.jsx';
import Contact from './sections/Contact.jsx';

import { useEnhanced } from './hooks/dom.js';
import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useReveal from './hooks/useReveal.js';
import useWorkIndex from './hooks/useWorkIndex.js';
import useCaseTransition from './hooks/useCaseTransition.js';

/* The home page: one scrolling document, five anchored sections. */
export default function App() {
    const enhanced = useEnhanced();
    const intro = useIntro();
    const menu = useMenu();
    const index = useWorkIndex();

    useChrome({ pillReady: enhanced });
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
            <Menu base="" open={menu.open} panelRef={menu.panelRef} onClick={menu.onPanelClick} />

            <main id="main">
                <Hero />
                <Work index={index} />
                <About />
                <Capabilities />
                <Experience />
                <Contact />
            </main>
        </>
    );
}
