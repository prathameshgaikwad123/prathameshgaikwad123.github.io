import { useEffect, useState } from 'react';

import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import Grid from './components/Grid.jsx';
import Reticle from './components/Reticle.jsx';
import Lightbox, { Zoomable } from './components/Lightbox.jsx';
import { PageFoot, Progress, SkipLink } from './components/Chrome.jsx';
import { ArrowLeft, ArrowRight } from './components/Icons.jsx';

import { projectBySlug } from './data/projects.js';
import { caseBlocks } from './case-studies/index.js';

import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';
import useScrollEffect from './hooks/useScrollEffect.js';
import closePanel from './animations/closePanel.js';

const HOME = '../index.html';

/* Two elements on one page cannot carry the same view-transition name —
   a browser handed a duplicate abandons the transition altogether — and
   a case study has two covers on it the moment the plate at the foot of
   the page carries one: its own, at the top, and the next project's.

   So the name is moved rather than shared, and it is moved in the
   stylesheet (section 15) off an attribute written here, for the same
   reason the theme wipe does it that way: a name is a style, and a style
   the stylesheet owns cannot be left behind by a navigation that never
   happened. From the press until the document goes away, the cover that
   is named is the one the reader is travelling to.

   Only a plain press. A modified click opens a tab, which is not a
   navigation this document is taking part in, and naming anything for
   it would leave the mark on a page the reader is still reading. */
function useHandover() {
    useEffect(() => {
        const root = document.documentElement;
        const link = document.querySelector('.case-next a[data-cover]');
        if (!link) return undefined;

        const go = (event) => {
            if (
                event.defaultPrevented
                || event.button !== 0
                || event.metaKey
                || event.ctrlKey
                || event.shiftKey
                || event.altKey
            ) {
                return;
            }
            root.setAttribute('data-going', '');
        };

        /* A page restored from the back-forward cache comes back exactly
           as it left, attribute and all — which on this page would be a
           document whose own cover has given its name away to a plate at
           the bottom of it. */
        const back = () => root.removeAttribute('data-going');

        link.addEventListener('click', go);
        window.addEventListener('pageshow', back);

        return () => {
            link.removeEventListener('click', go);
            window.removeEventListener('pageshow', back);
            root.removeAttribute('data-going');
        };
    }, []);
}

/* One fact row. Most values are a plain string; the one that is still to be
   confirmed carries its marker through rather than being filled in. */
function Fact({ label, value }) {
    return (
        <div className="case-facts__item">
            <dt className="case-facts__key">{label}</dt>
            <dd className="case-facts__val">
                {typeof value === 'string' ? (
                    value
                ) : (
                    <>
                        {value.text}
                        <span className="tbd" data-todo={value.todo}>
                            {value.tbd}
                        </span>
                    </>
                )}
            </dd>
        </div>
    );
}

/* The shell every case study shares. The written body of each one comes from
   src/case-studies/, and everything else is read from the project record. */
export default function CaseStudy({ slug }) {
    const project = projectBySlug(slug);
    const intro = useIntro();
    const menu = useMenu();
    const [zoomed, setZoomed] = useState(null);

    useChrome();
    useUnderlayNav(menu.open);
    useHandover();

    /* The same ending the home page has, for the same reason: the last
       thing in a document is a ground closing over rather than another
       block of it passing. One effect, one set of tokens — see
       src/animations/closePanel.js. */
    const closeRef = useScrollEffect(closePanel);

    const blocks = caseBlocks[slug](project, setZoomed);

    return (
        <>
            <Loader innerRef={intro.ref} hidden={intro.hidden} />
            <SkipLink />

            <Navigation
                home={HOME}
                menuOpen={menu.open}
                onMenuToggle={menu.toggle}
                menuButtonRef={menu.buttonRef}
            />
            <Menu
                base={HOME}
                work=""
                current="work"
                open={menu.open}
                panelRef={menu.panelRef}
                onClick={menu.onPanelClick}
            />
            <Underlay onClick={menu.onOverlayClick} />
            <Grid />
            <Reticle />
            <Progress />

            <div data-main="" inert={menu.open || undefined}>
                <main id="main" className="page">
                    <article>
                        {/* ---------- HERO ---------- */}
                        <section className="case-hero shell" id="top" aria-labelledby="case-title">
                            <a className="breadcrumb" href={`${HOME}#work`}>
                                <ArrowLeft />
                                Selected Work
                            </a>

                            <div className="case-hero__category">
                                <span className="case-hero__no num">{project.no}</span>
                                <span className="case-hero__cat">{project.category}</span>
                            </div>

                            <h1 className="case-hero__title" id="case-title">
                                {project.title}
                            </h1>

                            <p className="lead case-hero__lead">{project.lead}</p>

                            <dl className="case-facts">
                                {project.facts.map(([label, value]) => (
                                    <Fact label={label} value={value} key={label} />
                                ))}
                            </dl>
                        </section>

                        {/* ---------- COVER ---------- */}
                        <div className="shell">
                            <figure className="case-figure case-figure--cover frame">
                                {/* REPLACE: the cover is a 1600×1000 placeholder. Its
                                    path and alt text are in src/data/projects.js. */}
                                <span className="frame__media">
                                    <Zoomable
                                        src={project.cover}
                                        alt={project.caseCoverAlt || project.coverAlt}
                                        width="1600"
                                        height="1000"
                                        loading="eager"
                                        fetchPriority="high"
                                        onZoom={setZoomed}
                                    />
                                </span>
                                <figcaption>{project.coverCaption}</figcaption>
                            </figure>
                        </div>

                        {/* ---------- BODY ---------- */}
                        <div className="shell case-body">
                            {blocks.map((block) => {
                                const id = `${block.key}-${project.no}`;
                                return (
                                    <section className="case-block" aria-labelledby={id} key={block.key}>
                                        <h2 className="case-block__label" id={id}>
                                            {block.label}
                                        </h2>
                                        <div
                                            className={
                                                block.wide
                                                    ? 'case-block__body case-block__body--wide'
                                                    : 'case-block__body'
                                            }
                                        >
                                            {block.body}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* ---------- NEXT ---------- */}
                        <div className="case-close zone-invert close" data-close-end="max" ref={closeRef}>
                            {/* The band's ground, as its own layer, so it can
                                arrive as a contained panel and open out to
                                the edges without the plate inside it ever
                                moving. Full bleed is the resting state. */}
                            <div className="close__ground" aria-hidden="true" />

                            <div className="shell close__type">
                                <nav className="case-next" aria-label={project.next.aria || 'Next project'}>
                                    {/* The cover is optional on the record and
                                        the plate is a complete link without it:
                                        a `next` can point at a project, and
                                        then it has one, or at somewhere on the
                                        home page, and then there is no cover to
                                        show and nothing is invented. See the
                                        note on `next` in src/data/projects.js. */}
                                    <a
                                        href={project.next.href}
                                        data-cover={project.next.cover ? '' : undefined}
                                    >
                                        <p className="case-next__label">{project.next.label}</p>
                                        <p className="case-next__title">{project.next.title}</p>

                                        {project.next.cover ? (
                                            <span className="case-next__cover frame">
                                                <span className="frame__media">
                                                    <img
                                                        src={project.next.cover}
                                                        alt={project.next.coverAlt || ''}
                                                        width="1600"
                                                        height="1000"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </span>
                                            </span>
                                        ) : null}

                                        <span className="case-next__go" aria-hidden="true">
                                            <ArrowRight />
                                        </span>
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </article>
                </main>

                <PageFoot />
            </div>

            {/* The lightbox is a dialog, so it is drawn in the top layer
                and belongs outside the layer that travels — and outside
                what the menu makes inert, or a reader could open one and
                then not close it. */}
            <Lightbox item={zoomed} onClose={() => setZoomed(null)} />
        </>
    );
}
