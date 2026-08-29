import { SITE } from '../data/site.js';
import { projectBySlug } from '../data/projects.js';
import { ArrowDown, ArrowRight } from '../components/Icons.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import heroScatter from '../animations/heroScatter.js';

const DISCIPLINES = [
    { no: '01', name: 'UI/UX' },
    { no: '02', name: 'Web' },
    { no: '03', name: 'Brand' },
    { no: '04', name: 'Digital Experiences' },
];

/* Three plates from the index below, standing in the negative space the
   hero's own composition leaves: two in the two columns the headline
   does not reach, one in the channel between the two body columns. They
   are placed with the same column arithmetic the stylesheet uses for
   everything else — `start` is the column line they begin on, `span` how
   many columns wide — so the scatter lands on the grid the hero is
   already drawing rather than floating over it.

   Three, and real work, because the point of the field is that the
   practice is more than one thing. Twenty would be a screensaver.

   `drift` is where each one travels to as the first screen leaves,
   as a percentage of its own height. Two rise and one falls: it is the
   mismatch that makes depth, and a single direction would read as one
   sheet sliding past. The numbers are short on purpose — the gaps
   between the headline, the body and the discipline strip are what
   these sit in, and the composition has to hold all the way through.

   The first two overlap at a corner and rise at visibly different
   rates, so the pair reads as a small stack whose arrangement keeps
   shifting rather than as two plates that happen to be near each
   other. That is as much of a riffling cluster as this page wants: the
   idea of images moving over one another, without a loop running for
   its own sake in the corner of the screen. `z` decides which of the
   two is on top, and it never changes — a stack that reshuffles its
   order would be a card trick. */
const FRAGMENTS = [
    { slug: 'voepl-brand-system', start: '10', span: '2', y: '23%', depth: 1.5, drift: -14, z: 1 },
    { slug: 'digital-communication', start: '10.4', span: '1.5', y: '31%', depth: 0.9, drift: -42, z: 2 },
    { slug: 'safety-dojo', start: '5', span: '2', y: '55%', depth: 0.6, drift: 34, z: 1 },
];

/* Name, positioning, the editorial line, the metadata and the discipline
   strip are one composition: four registers of scale hung off the same
   twelve columns. */
export default function Hero() {
    const ref = useScrollEffect(heroScatter);

    return (
        <section className="hero" aria-labelledby="hero-title" ref={ref}>
            <div className="hero__field" aria-hidden="true">
                <span>
                    {Array.from({ length: 12 }, (_, i) => (
                        <i key={i} />
                    ))}
                </span>
            </div>

            {/* Decorative: every one of these is the cover of a project
                the index below names, links and describes. Nothing here
                is the only place any of it appears. */}
            <div className="hero__scatter" aria-hidden="true">
                <div className="hero__scatter-in">
                    {FRAGMENTS.map((fragment) => {
                        const project = projectBySlug(fragment.slug);
                        if (!project) return null;

                        return (
                            <div
                                className="hero__frag"
                                key={fragment.slug}
                                data-depth={fragment.depth}
                                data-drift={fragment.drift}
                                style={{
                                    '--start': fragment.start,
                                    '--span': fragment.span,
                                    '--y': fragment.y,
                                    '--z': fragment.z,
                                }}
                            >
                                <div className="hero__frag-in">
                                    <img
                                        src={project.cover}
                                        alt=""
                                        width="1600"
                                        height="1000"
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
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
