import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site.js';

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
    return (
        <section className="band" id="about" aria-labelledby="about-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag about__tag" data-reveal="">
                        <span className="tag__no num">02</span>About
                    </p>
                    <h2 className="statement about__statement" id="about-title" data-reveal="">
                        A designer who works across <em>disciplines</em>.
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
                                My work sits between design, technology and communication. I enjoy taking
                                an idea from an early concept through structure, visual design and digital
                                execution.
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
                                <span className="tag__no num">02.1</span>In Practice
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
