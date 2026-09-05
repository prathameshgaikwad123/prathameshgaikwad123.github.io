import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import { PageFoot, SkipLink } from './components/Chrome.jsx';
import { ArrowRight } from './components/Icons.jsx';

import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';

export default function NotFound() {
    const intro = useIntro();
    const menu = useMenu();

    useChrome();
    useUnderlayNav(menu.open);

    return (
        <>
            <Loader innerRef={intro.ref} hidden={intro.hidden} />
            <SkipLink />

            <Navigation
                home="/"
                menuOpen={menu.open}
                onMenuToggle={menu.toggle}
                menuButtonRef={menu.buttonRef}
            />
            <Menu
                base="/"
                work="/work/"
                open={menu.open}
                panelRef={menu.panelRef}
                onClick={menu.onPanelClick}
            />
            <Underlay onClick={menu.onOverlayClick} />

            <div data-main="" inert={menu.open || undefined}>
                <main id="main" className="page">
                    <section className="notfound" aria-labelledby="nf-title">
                        <div className="shell">
                            <div className="grid">
                                <p className="tag notfound__tag">
                                    <span className="tag__no num">404</span>Error
                                </p>

                                <h1 className="notfound__title" id="nf-title">
                                    Page
                                    <br />
                                    <em>Not Found</em>
                                    <span className="hero__stop">.</span>
                                </h1>

                                <div className="notfound__body">
                                    <p>This page doesn't exist — or it moved.</p>
                                    <p>
                                        The portfolio was rebuilt, so some older links no longer resolve.
                                        The selected work is all reachable from the home page.
                                    </p>
                                    <div className="notfound__actions">
                                        <a className="btn btn--primary" href="/">
                                            Go to the home page
                                            <ArrowRight />
                                        </a>
                                        <a className="btn btn--ghost" href="/#work">
                                            Selected Work
                                            <ArrowRight />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <PageFoot backToTop={false} />
            </div>
        </>
    );
}
