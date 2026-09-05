import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site.js';
import Words from '../components/Words.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import wordReveal from '../animations/wordReveal.js';

/* The statement this section turns on. Split into words here rather
   than in script so the sentence is complete, selectable and correct
   in the prerendered document — the reveal only changes its weight. */
const LEDE =
    'My work sits between design, technology and communication. I enjoy taking '
    + 'an idea from an early concept through structure, visual design and digital '
    + 'execution.';

/* The contribution chart comes from ghchart.rshah.org, a third party. If
   that service is unreachable, hide the whole figure rather than leaving a
   broken image in the middle of the page. */
function GitHubChart() {
    const imgRef = useRef(null);
    const [down, setDown] = useState(false);

    useEffect(() => {
        const img = imgRef.current;
        /* A cached failure can complete before React attaches its handler. */
        if (img && img.complete && img.naturalWidth === 0) setDown(true);
    }, []);

    return (
        <figure className="chart" id="gh-chart" hidden={down}>
            <div className="chart__scroll">
                <img
                    ref={imgRef}
                    src={`https://ghchart.rshah.org/${SITE.githubHandle.replace('@', '')}`}
                    alt={`Calendar chart of ${SITE.name}'s GitHub contributions over the past year.`}
                    width="663"
                    height="104"
                    loading="lazy"
                    decoding="async"
                    onError={() => setDown(true)}
                />
            </div>
            <figcaption className="cap">
                <span className="cap__no num">Fig. 08</span>
                <span className="cap__text">
                    GitHub contribution activity ·{' '}
                    <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                        {SITE.githubHandle}
                    </a>
                </span>
            </figcaption>
        </figure>
    );
}

export default function About() {
    const ref = useScrollEffect(wordReveal);

    return (
        <section className="band" id="about" aria-labelledby="about-title" ref={ref}>
            <div className="shell">
                <div className="grid">
                    <p className="tag about__tag" data-reveal="">
                        <span className="tag__no num">03</span>About
                    </p>
                    <h2 className="statement about__statement" id="about-title" data-reveal="">
                        A designer who works across{' '}
                        <span className="mark" data-reveal-draw="">
                            <em>disciplines</em>
                            {/* The one annotated phrase on the site. Two
                                strokes that do not quite retrace each
                                other, drawn in sequence, so the mark reads
                                as authored rather than as a rule the
                                interface drew.

                                `pathLength` normalises each curve to a
                                length of 1, so the stylesheet can draw
                                them with a dash of 1 and an offset of 1
                                without measuring anything — which is what
                                keeps this an entrance (section 6) rather
                                than something that needs the scroll
                                system's library to exist. */}
                            <svg
                                className="mark__draw"
                                viewBox="0 0 220 20"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path
                                    pathLength="1"
                                    d="M4 12.4C41 7.6 92 15.2 137 9.8c26-3.1 51-1.4 79 2.2"
                                />
                                <path
                                    pathLength="1"
                                    d="M17 17.1c38-3.9 88 3.1 132-1.7 21-2.3 42-1.2 62 1.1"
                                />
                            </svg>
                        </span>
                        .
                    </h2>

                    <div className="about__body">
                        <div className="about__aside" data-reveal="">
                            <figure className="about__portrait frame">
                                <span className="frame__media">
                                    {/* OPTIONAL. REPLACE: public/assets/images/portrait.svg
                                        → your own 1000×1250 portrait (JPG/WebP), or delete
                                        this <figure>. */}
                                    <img
                                        src="/assets/images/portrait.svg"
                                        alt={`Placeholder for a portrait photograph of ${SITE.name}.`}
                                        width="1000"
                                        height="1250"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <figcaption className="cap">
                                    <span className="cap__no num">Fig. 07</span>
                                    <span className="cap__text">
                                        {SITE.name} · {SITE.place}
                                    </span>
                                </figcaption>
                            </figure>
                        </div>

                        <div className="about__text" data-reveal="">
                            <p className="about__lede">
                                <Words text={LEDE} />
                            </p>
                            <div className="prose about__prose">
                                <p>
                                    Over the past 3+ years, I have worked across graphic design, websites,
                                    UI/UX, social media and digital communication. This range has shaped how
                                    I approach design: I don't see interfaces, brands and communication as
                                    isolated outputs, but as connected parts of an experience.
                                </p>
                                <p>
                                    I am particularly interested in digital product design, web experiences,
                                    visual systems and the evolving relationship between design and emerging
                                    technology.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ---------- IN PRACTICE ---------- */}
                    <section className="sub" id="practice" aria-labelledby="practice-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="practice-title">
                                I build what I design.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">03.1</span>In Practice
                            </p>
                        </header>

                        <div className="practice">
                            <p className="practice__copy">
                                Design decisions survive contact with implementation, or they don't survive
                                at all. A lot of my web work happens in the browser rather than only in
                                Figma — this portfolio included, which is hand-written HTML, CSS and
                                vanilla JavaScript with no framework.
                            </p>

                            <GitHubChart />
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
