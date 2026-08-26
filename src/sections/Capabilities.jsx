const CAPS = [
    [
        '01',
        'UI/UX & Digital Experiences',
        'Interfaces, user flows, wireframes, responsive experiences and digital interaction.',
    ],
    [
        '02',
        'Web Design',
        'Corporate websites, information architecture, responsive layouts and web implementation.',
    ],
    [
        '03',
        'Brand & Visual Systems',
        'Visual communication, campaign systems, presentations and scalable design assets.',
    ],
    ['04', 'Digital Communication', 'Content design, social media communication and visual storytelling.'],
    [
        '05',
        'Emerging Creative Technology',
        'AI-assisted design and creative workflows, experimentation and evolving digital tools.',
    ],
];

const STEPS = [
    ['01', 'Understand', 'Understanding the business, audience and context before jumping into visual execution.'],
    ['02', 'Structure', 'Organising information, ideas and user journeys into something clear and usable.'],
    ['03', 'Design', 'Creating experiences with visual hierarchy, consistency and purpose.'],
    [
        '04',
        'Build',
        'Using design tools, web technologies and digital platforms to move ideas towards implementation.',
    ],
    ['05', 'Improve', 'Refining work through feedback, real-world requirements and continuous learning.'],
];

const TOOLS = [
    ['Design', ['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Canva']],
    ['Web', ['Odoo', 'HTML', 'CSS', 'JavaScript', 'Webflow']],
    ['Digital', ['SEO', 'Social Media', 'Content Strategy']],
    [
        'Creative Technology',
        ['AI-assisted image workflows', 'AI-assisted video workflows', 'Prompt-based creative tools'],
    ],
];

export default function Capabilities() {
    return (
        <section className="band" id="capabilities" aria-labelledby="capabilities-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag caps__tag" data-reveal="">
                        <span className="tag__no num">03</span>Capabilities
                    </p>
                    <h2 className="statement caps__statement" id="capabilities-title" data-reveal="">
                        Five connected areas, one way of&nbsp;working.
                    </h2>
                    <p className="tag tag--end caps__note" data-reveal="">
                        <span className="tag__no num">05</span>Areas of practice
                    </p>

                    <dl className="caps">
                        {CAPS.map(([index, title, desc]) => (
                            <div className="cap-row" data-reveal="" key={index}>
                                <dt className="cap-row__title" data-index={index}>
                                    {title}
                                </dt>
                                <dd className="cap-row__desc">{desc}</dd>
                            </div>
                        ))}
                    </dl>

                    {/* ---------- MY APPROACH ---------- */}
                    <section className="sub" id="approach" aria-labelledby="approach-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="approach-title">
                                From understanding a problem to improving the result.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">03.1</span>My Approach
                            </p>
                        </header>

                        <ol className="approach">
                            {STEPS.map(([no, title, desc]) => (
                                <li className="step" key={no}>
                                    <p className="step__no num">{no}</p>
                                    <h4 className="step__title">{title}</h4>
                                    <p className="step__desc">{desc}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* ---------- TOOLS ---------- */}
                    <section className="sub" id="tools" aria-labelledby="tools-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="tools-title">
                                What I work in, day to day.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">03.2</span>Tools
                            </p>
                        </header>

                        <div className="tools">
                            {TOOLS.map(([label, items]) => (
                                <div className="tools__group" key={label}>
                                    <h4 className="tools__label">{label}</h4>
                                    <ul className="tools__items">
                                        {items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}
