import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site.js';
import Words from '../components/Words.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import wordReveal from '../animations/wordReveal.js';
import lineReveal from '../animations/lineReveal.js';

const EFFECTS = [wordReveal, lineReveal];

const LEDE =
    'My work sits between design, technology and communication. I enjoy taking '
    + 'an idea from an early concept through structure, visual design and digital '
    + 'execution.';

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
    const ref = useScrollEffect(EFFECTS);

    return (
        <section data-reveal-rule="" className="band" id="about" aria-labelledby="about-title" ref={ref}>
            <div className="shell">
                <div className="grid">
                    <p className="tag about__tag" data-reveal="">
                        About
                    </p>
                    <h2 className="statement about__statement" id="about-title" data-reveal="">
                        <Words text="A brand designer who also builds for the web." className="sw" inner />
                    </h2>

                    <div className="about__body">
                        <div className="about__aside" data-reveal="">
                            <figure className="about__portrait frame">
                                <span className="frame__media">

                                    <img
                                        src="/assets/images/portrait.webp"
                                        alt={`Illustrated portrait of ${SITE.name}.`}
                                        width="1000"
                                        height="1250"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <figcaption className="cap">
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
                                    Over the past five years, I have worked across brand identity, graphic design,
                                    websites, UI/UX, social media, print, motion and digital communication, as
                                    an in-house designer, in consultancy and as a freelancer. This range has shaped how
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
                                Design and front-end work
                            </h3>
                        </header>

                        <div className="practice">
                            <p className="practice__copy">
                                I do a lot of my web work in the browser as well as in Figma. This portfolio is built with React and hand-written CSS, with no template or UI kit.
                            </p>

                            <GitHubChart />
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
