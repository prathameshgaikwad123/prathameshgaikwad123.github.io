import { behance, BEHANCE_PROFILE } from '../data/behance.js';
import PlateRail from '../components/PlateRail.jsx';
import Words from '../components/Words.jsx';
import { useReducedMotion } from '../hooks/dom.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import lineReveal from '../animations/lineReveal.js';

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
                        Behance
                    </p>
                    <h2 className="statement beh__statement" id="behance-title" data-reveal="">
                        <Words text="More work on Behance." className="sw" inner />
                    </h2>
                </div>
            </div>

            <PlateRail items={behance} profile={BEHANCE_PROFILE} reduced={reduced} />
        </section>
    );
}
