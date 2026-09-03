import { projectBySlug } from '../data/projects.js';
import useScrollEffect from '../hooks/useScrollEffect.js';
import openingSplit from '../animations/openingSplit.js';

/* The seam between the first screen and the work.

   The statement returns — the same two groups the hero sets, at the
   same scale — and opens. It is a refrain rather than a repetition:
   the hero states it, and here it is what parts to let the work
   through. The section is decorative in the accessibility tree for
   exactly that reason: a screen reader has already been given this
   sentence once, as the page's heading, and nothing here is new
   information or reachable by keyboard.

   The plate is project 01, which is also the project the carousel
   below opens on: by the time the panel is the whole screen the reader
   has already been shown the cover the strip is about to arrive at.

   Without the scroll system — a narrow window, a reader who has asked
   for less motion, a script that never arrives — this is a plain
   editorial stack: statement, plate, statement. That is the state the
   stylesheet declares, and every part of the transition is an
   override on top of it rather than the other way round. */
export default function Opening() {
    const ref = useScrollEffect(openingSplit);
    const project = projectBySlug('voepl-website');

    if (!project) return null;

    return (
        <section className="opening" aria-hidden="true" ref={ref}>
            <div className="opening__stage">
                <p className="opening__line opening__line--a">Multidisciplinary</p>

                <div className="opening__panel zone-warm">
                    <div className="opening__panel-in">
                        <div className="opening__plate">
                            <figure className="frame">
                                <span className="frame__media">
                                    <img
                                        src={project.cover}
                                        alt=""
                                        width="1600"
                                        height="1000"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <figcaption className="cap opening__cap">
                                    <span className="cap__no num">Fig. {project.no}</span>
                                    <span className="cap__text">{project.category}</span>
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </div>

                <p className="opening__line opening__line--b">
                    <em>Digital&nbsp;Designer</em>
                    <span className="opening__stop">.</span>
                </p>
            </div>
        </section>
    );
}
