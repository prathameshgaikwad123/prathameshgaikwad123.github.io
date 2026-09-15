import Aim from '../components/Aim.jsx';
import { useEnhanced } from '../hooks/dom.js';
import useLift from '../hooks/useLift.js';

/* ===================================================================
   UNDER THE FOLD
   -------------------------------------------------------------------
   The page ends at the footer. This is what is underneath it.

   Four things happen, in this order and in no other: the reader
   reaches the footer; they keep going; a thin curved edge comes up
   from below it with a little light on it; and the edge carries a
   panel up into the screen. Nothing is held, nothing is locked and
   nothing is infinite — every frame of it is a function of how far
   down the page the reader is, so scrolling back up plays it
   backwards exactly, and a reader who wants none of it scrolls past
   at the speed they were already going.

   The edge is the whole idea. It is drawn outside the panel's box,
   sitting on its top edge, and it carries the panel's own ground up
   into the bump — so what the reader sees is not a section arriving
   below the footer but a surface with a curved lip rising from under
   it. The light is the site's one hue, and it is brightest at the
   moment the edge appears and least when the panel is up: a colour
   that only exists while something is being uncovered, which is the
   same bargain the statement's sweep and the live dot make above.

   The curve is one path, drawn once, stretched to whatever the window
   is. Its height never changes — only where it is. A bump that
   flattened as it rose would be a second animation arguing with the
   first, and would re-rasterise a blurred stroke on every frame of
   the scroll; this way the light is an opacity and the rise is a
   transform, and the whole reveal is two compositor properties.

   The game underneath does not start itself. See
   src/components/Aim.jsx.
   =================================================================== */

/* The bump, in a box 1200 x 100, stretched to the width of the window
   and to --under-bump tall. Flat at both ends so it meets the panel's
   top edge without a seam, and horizontal at all three joins — the two
   feet and the apex — so there is no corner anywhere in it. The apex
   is held six units off the top so a stroke centred on it is not
   sitting half outside its own box. */
const EDGE = 'M0 100 H140 C340 100 380 6 600 6 C820 6 860 100 1060 100 H1200';

export default function Under() {
    const ref = useLift();
    const enhanced = useEnhanced();

    return (
        <section className="under" id="under" aria-labelledby="under-title" ref={ref}>
            {/* Everything that rises. The anchor the hook measures is
                this element's distance from the top of the section,
                which a transform cannot move — see
                src/hooks/useLift.js. */}
            <div className="under__rise" data-lift-anchor="">
                <div className="under__lid">
                    <div className="under__edge" aria-hidden="true">
                        {/* The light, and the only blurred thing on the
                            site. An <svg> clips its own box, which is
                            exactly where the glow is meant to be
                            escaping from, so it is told not to. */}
                        <svg className="under__halo" viewBox="0 0 1200 100" preserveAspectRatio="none" focusable="false">
                            <path d={EDGE} vectorEffect="non-scaling-stroke" />
                        </svg>

                        <svg className="under__cut" viewBox="0 0 1200 100" preserveAspectRatio="none" focusable="false">
                            {/* Closed along the bottom, which is the
                                panel's own top edge: the ground runs
                                from the panel up into the bump without
                                a join. */}
                            <path className="under__fill" d={`${EDGE} Z`} />
                            <path className="under__line" d={EDGE} vectorEffect="non-scaling-stroke" />
                            <path className="under__spark" d={EDGE} vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>

                    <div className="under__work">
                        <div className="shell">
                            <div className="grid">
                                <p className="tag under__tag">
                                    <span className="tag__no num">00</span>Under the fold
                                </p>
                                <h2 className="statement under__statement" id="under-title">
                                    You kept <em>going</em>.
                                </h2>
                                <p className="lead under__lead">
                                    Then here is the part that is not on the résumé. A hairline
                                    runs the measure and a mark sits somewhere on it. Five
                                    passes to stop one on the other.
                                </p>

                                {/* A board that cannot move is a picture
                                    of a game. Without a script the
                                    section keeps its type and says so,
                                    rather than laying out a control that
                                    will never answer. */}
                                {enhanced ? <Aim /> : <p className="under__none">This one needs JavaScript.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
