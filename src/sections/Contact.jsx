import { useEffect, useRef, useState } from 'react';
import { SITE } from '../data/site.js';
import { SiteFoot } from '../components/Chrome.jsx';
import Shelf from '../components/Shelf.jsx';
import { IconDownload, IconExternal, IconGitHub, IconLinkedIn, IconPin } from '../components/Icons.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import closePanel from '../animations/closePanel.js';
import lineReveal from '../animations/lineReveal.js';

const EFFECTS = [closePanel, lineReveal];

const SAID_FOR = 1600;

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

            <div className="close__ground" aria-hidden="true" />

            <div className="shell close__type">
                <div className="grid">

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
                                <a href={SITE.behance} target="_blank" rel="noopener noreferrer">
                                    <IconExternal />
                                    Behance
                                </a>
                                <a href={SITE.resume} download>
                                    <IconDownload />
                                    Résumé (PDF)
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
