import { SITE } from '../data/site.js';
import { ArrowDown, ArrowRight } from '../components/Icons.jsx';

const DISCIPLINES = [
    { no: '01', name: 'UI/UX' },
    { no: '02', name: 'Web' },
    { no: '03', name: 'Brand' },
    { no: '04', name: 'Digital Experiences' },
];

/* Name, positioning, the editorial line, the metadata and the discipline
   strip are one composition: four registers of scale hung off the same
   twelve columns. */
export default function Hero() {
    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="hero__field" aria-hidden="true">
                <span>
                    {Array.from({ length: 12 }, (_, i) => (
                        <i key={i} />
                    ))}
                </span>
            </div>

            <div className="shell hero__inner">
                <div className="grid">
                    <p className="eyebrow hero__name" data-reveal="">
                        {SITE.name}
                    </p>

                    <p className="eyebrow hero__where" data-reveal="">
                        <span className="hero__dot" aria-hidden="true" />
                        {' '}
                        {SITE.where}
                    </p>

                    <div className="hero__rule" data-reveal-rule="" />

                    <h1 className="hero__title" id="hero-title" data-reveal="">
                        <span>Multidisciplinary</span>
                        <span>
                            <em>Digital&nbsp;Designer</em>
                            <span className="hero__stop">.</span>
                        </span>
                    </h1>

                    <div className="hero__body">
                        <div className="hero__said-wrap" data-reveal="">
                            <p className="hero__said">
                                I design interfaces, websites, brands and&nbsp;digital&nbsp;experiences.
                            </p>
                        </div>

                        <div className="hero__aside" data-reveal="">
                            <p className="hero__support">
                                I work across UI/UX, web design, visual communication and digital
                                experiences—combining creative thinking with technology to build work
                                that is clear, useful and memorable.
                            </p>
                            <div className="hero__actions">
                                <a className="btn btn--primary" href="#work">
                                    View Selected Work
                                    <ArrowRight />
                                </a>
                                <a className="btn btn--ghost" href="#about">
                                    About Me
                                    <ArrowRight />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* The four disciplines, given four cells on the grid rather
                        than one line of prose. */}
                    <ul className="hero__strip" data-reveal="">
                        {DISCIPLINES.map((d) => (
                            <li className="hero__cell" key={d.no}>
                                <span className="hero__cell-no num" aria-hidden="true">
                                    {d.no}
                                </span>
                                <span className="hero__cell-name">{d.name}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="hero__foot">
                        <a className="hero__scroll" href="#work">
                            Scroll
                            <ArrowDown />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
