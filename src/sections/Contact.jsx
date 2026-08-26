import { SITE } from '../data/site.js';
import { SiteFoot } from '../components/Chrome.jsx';
import { IconGitHub, IconLinkedIn, IconPhone, IconPin } from '../components/Icons.jsx';

const INTERESTS = [
    'UI/UX Design',
    'Digital Product Design',
    'Web Design',
    'Digital Experience Design',
    'Visual & Brand Systems',
];

export default function Contact() {
    return (
        <section className="band zone-invert" id="contact" aria-labelledby="contact-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag contact__tag" data-reveal="">
                        <span className="tag__no num">05</span>Contact
                    </p>
                    <h2 className="statement contact__statement" id="contact-title" data-reveal="">
                        Open to <em>Opportunities</em>.
                    </h2>
                    <p className="lead contact__lead" data-reveal="">
                        Currently based in India and open to remote roles, international
                        opportunities and relocation.
                    </p>

                    <div className="contact__mail-wrap" data-reveal="">
                        <a className="contact__mail" href={`mailto:${SITE.email}`}>
                            {SITE.email}
                        </a>
                    </div>

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
