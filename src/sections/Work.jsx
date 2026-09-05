import WorkCarousel from '../components/WorkCarousel.jsx';
import { useReducedMotion } from '../hooks/dom.js';
import { projects } from '../data/projects.js';

/* The centre of the site, and now one thing rather than two: the
   heading, and the covers as a single rigid row behind a pane of
   glass.

   It used to carry a second view of the same six projects below the
   carousel — a numbered index with a preview plate travelling down the
   right five columns. The carousel had made it a repetition: the same
   projects, in the same order, in the same section, offering the same
   six destinations twice. What it cost was height, and the height was
   the problem: a screen and a half of it between the strip and the next
   section, most of that the empty right-hand columns the travelling
   plate needed to move through.

   So the links moved into the carousel, where the covers already were.
   Every card opens its case study — by click, by tap, and by Enter on
   the project the label is naming — and the section ends where the
   strip does. */
export default function Work() {
    const reduced = useReducedMotion();

    return (
        <section className="band zone-warm" id="work" aria-labelledby="work-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag work__tag" data-reveal="">
                        <span className="tag__no num">01</span>Selected Work
                    </p>
                    <h2 className="statement work__statement" id="work-title" data-reveal="">
                        Work across interfaces, websites, brand systems and digital&nbsp;communication.
                    </h2>
                    <p className="tag tag--end work__count" data-reveal="">
                        <span className="tag__no num">Index</span>
                        {/* Counted from the data, like the carousel's own
                            counter, so the two cannot disagree and adding
                            a project is one edit rather than three. */}
                        <b className="num">{`01 — ${String(projects.length).padStart(2, '0')}`}</b>
                    </p>
                </div>
            </div>

            {/* Outside the shell, and deliberately: the lens is a field
                across the whole width and its rims have to reach the
                edges of the page. A section is exactly the width of the
                page's content box, so full bleed here is `width: 100%`
                and never the viewport unit that would also count the
                scrollbar and push the strip a few pixels off centre. */}
            <WorkCarousel items={projects} reduced={reduced} />
        </section>
    );
}
