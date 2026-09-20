import { behance, BEHANCE_PROFILE } from '../data/behance.js';
import PlateRail from '../components/PlateRail.jsx';
import Words from '../components/Words.jsx';
import { useReducedMotion } from '../hooks/dom.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import lineReveal from '../animations/lineReveal.js';

/* The gallery, standing between the index and the writing.

   Selected Work is an index: six projects, each with a case study
   behind it and a row that names, describes and links it. This is the
   other half of the same practice and it is not an index — there is
   nothing to read at the end of these, only more of them to look at.

   It was a grid: six plates at one width and one shape on shared
   column and row lines, which was the right answer to "these are a
   set" and the wrong one to what a set of pictures is for. A grid is
   read the way a table is — all at once, by comparison — and six
   covers laid out to be compared are six covers nobody looks at.

   So it is a rail now. One endless row, thrown by hand, with the
   picture inside each plate sitting a little behind its own crop so
   that it lags the frame it is in. That is the whole of it: a set you
   move through rather than scan, with a depth to look into. The plates
   themselves did not change — same 4:3 crop, same caption, same crop
   ticks, same link out — and neither did the section's shape on the
   page: tag, statement and count on the twelve columns, the gallery
   full bleed underneath them, the way out at the foot.

   Everything about the movement is in src/hooks/usePlateRail.js;
   everything about the plates is in src/components/PlateRail.jsx. The
   reduced-motion answer is the stylesheet's, and it is a real one: a
   horizontal gallery with snap points, which is what the prerendered
   document ships and what a reader without a script keeps.  */
export default function Behance() {
    const reduced = useReducedMotion();
    const ref = useScrollEffect(lineReveal);

    return (
        <section
            data-reveal-rule=""
            className="band"
            id="behance"
            aria-labelledby="behance-title"
            ref={ref}
        >
            <div className="shell">
                <div className="grid">
                    <p className="tag beh__tag" data-reveal="">
                        <span className="tag__no num">02</span>Selected Behance Work
                    </p>
                    <h2 className="statement beh__statement" id="behance-title" data-reveal="">
                        <Words
                            text={'Selected creative work and visual\u00A0explorations.'}
                            className="sw"
                            inner
                        />
                    </h2>
                    <p className="tag tag--end beh__count" data-reveal="">
                        <span className="tag__no num">Plates</span>
                        <b className="num">01 — 0{behance.length}</b>
                    </p>
                </div>
            </div>

            {/* Outside the shell, and deliberately: the rail is endless
                and an endless row that stopped at the measure would be
                a row with two ends. A section is exactly the width of
                the page's content box, so full bleed here is the
                element's own `width: 100%` and never the viewport unit
                that would also count the scrollbar. */}
            <PlateRail items={behance} profile={BEHANCE_PROFILE} reduced={reduced} />
        </section>
    );
}
