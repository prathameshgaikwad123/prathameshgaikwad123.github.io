import { SITE } from '../data/site.js';
import { BEHANCE_PROFILE } from '../data/behance.js';
import usePull from '../hooks/usePull.js';

/* ===================================================================
   EXPLORATIONS
   -------------------------------------------------------------------
   The page used to end at the footer. It still reads as if it does —
   nothing about the contact band changed, and nothing here announces
   itself above it. Carry on scrolling and a thin lit edge comes up
   from under the footer, stretches, and brings this over it.

   The depth is the whole idea, and it is three layers in one order.
   The footer is the front of the page. The veil is the sheet's own
   material running on ahead of its edge, which is what subdues the
   footer rather than hiding it. The edge is the lit lip of the sheet,
   drawn outside the sheet's box and standing on its top corner, so
   what climbs into the screen is a surface with a curved edge rather
   than a section arriving below one. The sheet is the section.

   Every frame of it is a function of where the reader is — see
   src/hooks/usePull.js — so there is no state to get out of step, a
   flick lands on the frame it should land on, and scrolling back up
   plays it backwards exactly.

   What is on the sheet is deliberately small. It is a coda, not a
   sixth band: three places the work carries on into, two of which are
   further up this same page. A section invented to receive a reveal
   would be a page built to justify an effect, which is the same
   mistake as a row in the navigation invented to receive a word — see
   MENU_END in src/data/site.js.
   =================================================================== */

/* Where the reader can keep going. In-page first, because the two
   playful bands are the answer to the heading and they are already
   written; the profile last, because it is the one that leaves. */
const OUT = [
    { href: '#side-quests', label: 'Side Quests', note: 'The ones with no brief behind them.' },
    { href: '#behance', label: 'Selected Behance Work', note: 'The spread between Work and About.' },
    { href: BEHANCE_PROFILE, label: 'Behance', note: 'Everything that did not fit on this page.', out: true },
    { href: SITE.github, label: 'GitHub', note: SITE.githubHandle, out: true },
];

export default function Explorations() {
    const ref = usePull();

    return (
        <section className="pull" id="explorations" aria-labelledby="explorations-title" ref={ref}>
            {/* The sheet's material, ahead of its edge. It covers the
                screen above the sheet's top corner and nothing else, so
                the footer is subdued by the thing coming over it rather
                than by a rule that fades it out on its own. */}
            <div className="pull__veil" aria-hidden="true" />

            {/* The edge, drawn entirely outside the sheet and sitting on
                its top corner. Absolute, so its height is never part of
                anything's layout: the path is rebuilt on every frame
                and nothing reflows.

                One path, five times. The fill carries the sheet's own
                ground up into the bump; the four strokes over it are a
                bright hairline core and three progressively wider,
                fainter passes standing in for a blur — which is the one
                way to have a soft light on a curve that changes shape
                without re-rasterising a filter sixty times a second. */}
            <div className="pull__edge" data-pull-edge="" aria-hidden="true">
                <svg preserveAspectRatio="none" focusable="false">
                    <defs>
                        <path id="pull-edge" data-pull-line="" />
                    </defs>
                    <path className="pull__fill" data-pull-fill="" />
                    <use className="pull__halo" href="#pull-edge" />
                    <use className="pull__haze" href="#pull-edge" />
                    <use className="pull__soft" href="#pull-edge" />
                    <use className="pull__core" href="#pull-edge" />
                </svg>
            </div>

            <div className="pull__sheet">
                <div className="shell">
                    <div className="grid">
                        {/* Nought, because this is outside the run the
                            page numbers: the five bands above count
                            themselves and this is not one of them. */}
                        <p className="tag pull__tag">
                            <span className="tag__no num">00</span>Explorations
                        </p>
                        <h2 className="statement pull__statement" id="explorations-title">
                            Play more
                            {/* The one hue is not allowed to rest anywhere
                                on this site (section 1). This is the only
                                thing on the sheet that takes it, and it
                                only has it while the edge is lit — by the
                                time the reader is reading this, it is ink
                                again. */}
                            <span className="pull__stop" aria-hidden="true">.</span>
                        </h2>
                        <p className="lead pull__lead">
                            The page ends at the footer. This is under it: the work that
                            answered to nobody, and the places the rest of it is kept.
                        </p>

                        <ul className="pull__out">
                            {OUT.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        {...(item.out
                                            ? { target: '_blank', rel: 'noopener noreferrer' }
                                            : {})}
                                    >
                                        <span className="pull__out-label">
                                            {item.label}
                                            {item.out ? (
                                                <span className="pull__go" aria-hidden="true">
                                                    {' '}
                                                    ↗
                                                </span>
                                            ) : null}
                                        </span>
                                        <span className="pull__out-note">{item.note}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
