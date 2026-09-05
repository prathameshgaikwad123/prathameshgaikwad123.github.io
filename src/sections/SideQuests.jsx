import { sideQuests } from '../data/sideQuests.js';

/* The one section on the site with nothing to prove.

   Everything above it is work that answered to somebody: a brief, an
   organisation, a deadline. This is the rest of it — the things made
   because I wanted to see what would happen — and it is set the way
   such things actually accumulate: pinned up, a degree or two off
   true, at whatever size they happened to be.

   The tilt is the whole of the manner, and it is small on purpose. Two
   degrees reads as pinned; five reads as a template with a rotation in
   it. It is authored per quest in src/data/sideQuests.js so no two
   neighbours lean the same way, it straightens under the cursor — the
   one thing a pinned plate can do that is worth doing — and it is not
   applied at all on a phone or for a reader who has asked for less
   motion, where it would only be a plate that is crooked.

   It is carried by the plate and not by the figure, so the caption
   under it stays level. A pinned thing is pinned; its label is still
   printed straight, and a line of type set a degree off true does not
   read as charm, it reads as a mistake.

   A quest with no `href` is a plate and a caption, not a dead link:
   the anchor is only rendered when there is somewhere to go, so
   nothing here is clickable that does not lead anywhere.            */

/* One quest, as a figure. Rendered inside an anchor or on its own,
   which is the only difference a link makes to it. */
function Quest({ item }) {
    return (
        <figure className="quest__figure">
            {/* The plate is the only thing that leans, and it takes the
                frame's two crop ticks with it because they are drawn on
                it rather than beside it. */}
            <span className="quest__plate frame">
                <span className="frame__media">
                    {/* REPLACE: labelled placeholder — see
                        src/data/sideQuests.js. */}
                    <img
                        src={item.cover}
                        alt={item.alt}
                        width="1200"
                        height="1200"
                        loading="lazy"
                        decoding="async"
                    />
                </span>
            </span>
            <figcaption className="quest__cap">
                <span className="quest__type">
                    <span className="quest__no num" aria-hidden="true">
                        {item.no}
                    </span>
                    {item.type}
                </span>
                <span className="quest__title">
                    {item.title}
                    {item.href ? (
                        <span className="quest__go" aria-hidden="true">
                            {' '}
                            ↗
                        </span>
                    ) : null}
                </span>
                <span className="quest__note">{item.note}</span>
            </figcaption>
        </figure>
    );
}

export default function SideQuests() {
    return (
        <section className="band" id="side-quests" aria-labelledby="side-quests-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag quests__tag" data-reveal="">
                        <span className="tag__no num">05</span>Side Quests
                    </p>
                    <h2 className="statement quests__statement" id="side-quests-title" data-reveal="">
                        Things I made because I&nbsp;wanted&nbsp;to.
                    </h2>
                    <p className="lead quests__lead" data-reveal="">
                        No brief, no client, no deadline. Experiments, small builds and
                        whatever else I was curious about that week.
                    </p>

                    <ul className="quests">
                        {sideQuests.map((item) => (
                            <li
                                className="quest"
                                key={item.id}
                                data-reveal=""
                                style={{ '--tilt': `${item.tilt}deg` }}
                            >
                                {item.href ? (
                                    <a
                                        className="quest__link"
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Quest item={item} />
                                    </a>
                                ) : (
                                    <Quest item={item} />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
