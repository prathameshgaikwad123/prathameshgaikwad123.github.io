import WorkCarousel from '../components/WorkCarousel.jsx';
import Words from '../components/Words.jsx';
import { useReducedMotion } from '../hooks/dom.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import lineReveal from '../animations/lineReveal.js';
import { carouselProjects } from '../data/projects.js';

export default function Work() {
    const reduced = useReducedMotion();
    const ref = useScrollEffect(lineReveal);

    return (
        <section className="band zone-warm" id="work" aria-labelledby="work-title" ref={ref}>
            <div className="shell">
                <div className="grid">
                    <p className="tag work__tag" data-reveal="">
                        Work
                    </p>
                    <h2 className="statement work__statement" id="work-title" data-reveal="">

                        <Words
                            text="Projects in brand identity, web and UI design, and print."
                            className="sw"
                            inner
                        />
                    </h2>
                </div>
            </div>

            <WorkCarousel items={carouselProjects} reduced={reduced} />
        </section>
    );
}
