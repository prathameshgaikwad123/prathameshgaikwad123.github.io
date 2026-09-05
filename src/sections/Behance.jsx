import { behance, BEHANCE_PROFILE } from '../data/behance.js';

/* The gallery, standing between the index and the writing.

   Selected Work is an index: six projects, each with a case study
   behind it and a row that names, describes and links it. This is the
   other half of the same practice and it is not an index — there is
   nothing to read at the end of these, only more of them to look at.
   So it is set as a spread rather than a list: six plates laid across
   the twelve columns at four different widths and five different
   heights, each one a link out.

   The composition is in the data, in `span` and `drop`, for the reason
   the scatter in Selected Work is: a spread is authored or it is
   noise. Below the tablet step both are ignored and the plates stack
   in one column at one width, which is the only thing a phone has room
   for and is also the honest reading order.

   Every plate leaves the site, so every plate says so — the arrow in
   the caption is the same mark the elsewhere links in the panel carry,
   and the new tab is given the two attributes it needs to be safe.  */
export default function Behance() {
    return (
        <section className="band" id="behance" aria-labelledby="behance-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag beh__tag" data-reveal="">
                        <span className="tag__no num">02</span>Selected Behance Work
                    </p>
                    <h2 className="statement beh__statement" id="behance-title" data-reveal="">
                        Selected creative work and visual&nbsp;explorations.
                    </h2>
                    <p className="tag tag--end beh__count" data-reveal="">
                        <span className="tag__no num">Plates</span>
                        <b className="num">01 — 0{behance.length}</b>
                    </p>

                    <ul className="beh">
                        {behance.map((item) => (
                            <li
                                className="beh__item"
                                key={item.id}
                                data-reveal=""
                                style={{ '--span': item.span, '--drop': item.drop }}
                            >
                                <a
                                    className="beh__link"
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <figure className="beh__figure frame">
                                        <span className="frame__media">
                                            {/* REPLACE: labelled placeholder —
                                                see src/data/behance.js. */}
                                            <img
                                                src={item.cover}
                                                alt={item.alt}
                                                width="1600"
                                                height="1200"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </span>
                                        <figcaption className="cap beh__cap">
                                            <span className="cap__no num">{item.no}</span>
                                            <span className="beh__names">
                                                <span className="beh__title">{item.title}</span>
                                                <span className="beh__type">{item.type}</span>
                                            </span>
                                            <span className="beh__go" aria-hidden="true">
                                                ↗
                                            </span>
                                        </figcaption>
                                    </figure>
                                </a>
                            </li>
                        ))}
                    </ul>

                    <p className="beh__all" data-reveal="">
                        <a
                            className="beh__cta"
                            href={BEHANCE_PROFILE}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View all work on Behance
                            <span aria-hidden="true"> ↗</span>
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
