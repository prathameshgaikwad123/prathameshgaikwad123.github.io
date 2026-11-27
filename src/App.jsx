import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import { Progress, SkipLink } from './components/Chrome.jsx';

import Hero from './sections/Hero.jsx';
import Work from './sections/Work.jsx';
import Behance from './sections/Behance.jsx';
import About from './sections/About.jsx';
import SideQuests from './sections/SideQuests.jsx';
import Contact from './sections/Contact.jsx';

import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';
import useReveal from './hooks/useReveal.js';

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
                    <Hero ready={intro.done} />
                    <Work />
                    <Behance />
                    <About />
                    <SideQuests />
                    <Contact />
                </main>
            </div>
        </>
    );
}
