import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site.js';
import { SiteFoot } from '../components/Chrome.jsx';
import Shelf from '../components/Shelf.jsx';
import { IconGitHub, IconLinkedIn, IconPhone, IconPin } from '../components/Icons.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import closePanel from '../animations/closePanel.js';
import lineReveal from '../animations/lineReveal.js';

/* See the note in About: module scope, or the timelines are rebuilt on
   every render. */
const EFFECTS = [closePanel, lineReveal];

/* How long the line says it has copied before going back to being an
   address. Long enough to be read at a glance, short enough that a
   reader who looks back at the section has an address there again. */
const SAID_FOR = 1600;

/* The address, and the one thing on the last screen somebody actually
   has to take away with them.

   It stays an anchor and it stays a mailto: the href is in the
   prerendered document, and a middle click, a modifier click, a drag
   and the context menu all still reach a mail client, which is what an
   address that is a link promises. What changes is the plain press —
   the gesture most people make here wanting the text rather than a
   compose window they did not ask for — so that one copies, and the
   line says so for a moment in the one hue the site keeps for something
   being touched.

   Where the clipboard is not there to be written to — an insecure
   origin, a refused permission, a browser old enough not to have the
   API — nothing is intercepted and the mail client opens exactly as it
   does today. The promise is never made and then broken: the
   confirmation is written only by the branch that has already been told
   the write succeeded.

   Both states are in the document at once, in one cell of a grid, so
   the box is the width of the address at all times and the composition
   around it cannot be moved by a word appearing. The visible word is
   hidden from assistive technology and the same news is given once,
   properly, through the status line — a reader who hears "Copied."
   twice has been told something about the markup rather than about the
   address. */
function MailAddress() {
    const [said, setSaid] = useState(false);
    const timer = useRef(0);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const onClick = (event) => {
        if (
            event.defaultPrevented
            || event.button !== 0
            || event.metaKey
            || event.ctrlKey
            || event.shiftKey
            || event.altKey
        ) {
            return;
        }

        const clip = navigator.clipboard;
        if (!clip || typeof clip.writeText !== 'function') return;

        event.preventDefault();
        clip.writeText(SITE.email).then(
            () => {
                setSaid(true);
                window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setSaid(false), SAID_FOR);
            },
            () => {
                /* Asked for and refused, and by now the navigation this
                   click was is already cancelled. The mail client is
                   what the reader would have got without any of this,
                   so it is what they get. */
                window.location.href = `mailto:${SITE.email}`;
            },
        );
    };

    return (
        <div className="contact__mail-wrap" data-reveal="">
            <a
                className="contact__mail"
                href={`mailto:${SITE.email}`}
                onClick={onClick}
                data-said={said ? '' : undefined}
            >
                <span className="contact__mail-text">{SITE.email}</span>
                <span className="contact__mail-said" aria-hidden="true">
                    Copied.
                </span>
            </a>
            {/* Empty until there is something true to say, and emptied
                again afterwards, so the region announces the event
                rather than describing a state. */}
            <p className="visually-hidden" role="status">
                {said ? 'Email address copied to the clipboard.' : ''}
            </p>
        </div>
    );
}

const INTERESTS = [
    'UI/UX Design',
    'Digital Product Design',
    'Web Design',
    'Digital Experience Design',
    'Visual & Brand Systems',
];

export default function Contact() {
    const ref = useScrollEffect(EFFECTS);

    return (
        <section data-reveal-rule="" className="band zone-invert close" id="contact" aria-label="Contact" ref={ref}>
            {/* The band's ground, as its own layer, so the section can
                arrive as a contained panel and open out to the edges
                without the composition inside ever moving with it.
                Full bleed is its resting state — see
                src/animations/closePanel.js. */}
            <div className="close__ground" aria-hidden="true" />

            <div className="shell close__type">
                <div className="grid">
                    {/* The words are spans because the line reveal reads
                        them off the layout rather than splitting the
                        heading itself — see src/animations/lineReveal.js.
                        The band's numbered eyebrow is gone from here and
                        from nowhere else: this is the one section that
                        opens on its own subject. */}
                    <h2 className="statement contact__statement" data-reveal="">
                        <span className="sw">
                            <span>Books</span>
                        </span>{' '}
                        <span className="sw">
                            <span>I</span>
                        </span>{' '}
                        <span className="sw">
                            <span>have</span>
                        </span>{' '}
                        <span className="sw">
                            <span>
                                <em>read</em>.
                            </span>
                        </span>
                    </h2>

                    <Shelf />

                    <MailAddress />

                    <div className="contact__cols">
                        <div data-reveal="">
                            <h3 className="contact__label">Areas of interest</h3>
                            <ul className="contact__interests">
                                {INTERESTS.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div data-reveal="">
                            <h3 className="contact__label">Elsewhere</h3>
                            <div className="contact__links">
                                <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
                                    <IconLinkedIn />
                                    LinkedIn
                                </a>
                                <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                                    <IconGitHub />
                                    GitHub
                                </a>
                                <a href={SITE.phoneHref}>
                                    <IconPhone />
                                    {SITE.phone}
                                </a>
                                <span>
                                    <IconPin />
                                    {SITE.place}
                                </span>
                            </div>
                        </div>
                    </div>

                    <SiteFoot />
                </div>
            </div>
        </section>
    );
}
