import usePlateRail from '../hooks/usePlateRail.js';
import { responsive } from '../data/cloudinary.js';

const PLATE_SIZES = '(min-width: 75rem) 27vw, (min-width: 62rem) 33vw, (min-width: 48rem) 44vw, 74vw';

const pad = (n) => String(n).padStart(2, '0');

export default function PlateRail({ items, profile, reduced }) {
    const { railRef, trackRef, meterRef, shown, live, copies } = usePlateRail({ items, reduced });

    const cells = [];
    for (let copy = 0; copy < copies; copy += 1) {
        items.forEach((item) => cells.push({ item, copy }));
    }

    const shell = live
        ? {
              role: 'group',
              'aria-roledescription': 'gallery',
              'aria-label': 'Selected Behance work — plates',
              tabIndex: 0,
          }
        : {};

    return (
        <>
            <div className="beh__stage">
                <div
                    className="beh__rail"
                    ref={railRef}
                    data-live={live ? '' : undefined}
                    {...shell}
                >
                    <ul className="beh__track" ref={trackRef}>
                        {cells.map(({ item, copy }) => {
                            const again = copy > 0;
                            return (
                                <li
                                    className="beh__cell"
                                    key={`${item.id}-${copy}`}
                                    aria-hidden={again || undefined}
                                >

                                    <a
                                        className="beh__link"
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        draggable="false"
                                        tabIndex={again ? -1 : undefined}
                                    >
                                        <figure className="beh__figure frame">
                                            <span className="frame__media">

                                                <img
                                                    className="beh__shot"
                                                    {...responsive(item.cover, PLATE_SIZES)}
                                                    alt={again ? '' : item.alt}
                                                    width="1600"
                                                    height="1200"
                                                    loading="lazy"
                                                    decoding="async"
                                                    draggable="false"
                                                />
                                            </span>
                                            <figcaption className="cap beh__cap">
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
                            );
                        })}
                    </ul>
                </div>

                {live ? <span className="beh__gate" aria-hidden="true" /> : null}
            </div>

            <div className="shell">
                <div className="grid">
                    <div className="beh__foot">

                        {live ? (
                            <p className="tag beh__lap" aria-hidden="true">
                                <b className="num">
                                    {`${pad(shown + 1)} / ${pad(items.length)}`}
                                </b>
                            </p>
                        ) : null}

                        {live ? (
                            <span
                                className="beh__meter"
                                ref={meterRef}
                                style={{ '--beh-n': items.length }}
                                aria-hidden="true"
                            >
                                <span className="beh__run" />
                                <span className="beh__run beh__run--next" />
                            </span>
                        ) : null}

                        <p className="beh__all">
                            <a
                                className="beh__cta"
                                href={profile}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View all work on Behance
                                <span aria-hidden="true"> ↗</span>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
