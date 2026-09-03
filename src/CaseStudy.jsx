import { useState } from 'react';

import Loader from './components/Loader.jsx';
import Navigation from './components/Navigation.jsx';
import Menu from './components/Menu.jsx';
import Underlay from './components/Underlay.jsx';
import Lightbox, { Zoomable } from './components/Lightbox.jsx';
import { PageFoot, Progress, SkipLink } from './components/Chrome.jsx';
import { ArrowLeft, ArrowRight } from './components/Icons.jsx';

import { projectBySlug } from './data/projects.js';
import { caseBlocks } from './case-studies/index.js';

import useIntro from './hooks/useIntro.js';
import useMenu from './hooks/useMenu.js';
import useChrome from './hooks/useChrome.js';
import useUnderlayNav from './hooks/useUnderlayNav.js';

const HOME = '../index.html';

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
                home={HOME}
                base={HOME}
                work=""
                current="work"
                open={menu.open}
                panelRef={menu.panelRef}
                onClick={menu.onPanelClick}
            />
            <Underlay onClick={menu.onOverlayClick} />
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
                        <div className="zone-invert">
                            <div className="shell">
                                <nav className="case-next" aria-label={project.next.aria || 'Next project'}>
                                    <a href={project.next.href}>
                                        <p className="case-next__label">{project.next.label}</p>
                                        <p className="case-next__title">{project.next.title}</p>
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
