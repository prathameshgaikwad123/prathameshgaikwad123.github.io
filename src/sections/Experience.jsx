const ROLES = [
    {
        index: '01',
        role: 'Digital Marketing Executive',
        org: 'Virtuoso Optoelectronics Limited (VOEPL)',
        todo: 'voepl-dates',
        summary:
            'Working across digital design, web experiences and corporate ' +
            'communication for an OEM/ODM manufacturing organisation.',
        areas: [
            'Website design and maintenance using Odoo',
            'Digital content and visual communication',
            'UI/UX and responsive web improvements',
            'Corporate presentations, brochures and product communication',
            'Social media and LinkedIn content',
            'SEO and website optimisation initiatives',
            'Research into AI search and emerging digital discovery',
            'Internal communication and safety awareness campaigns',
        ],
    },
    {
        index: '02',
        role: 'Graphic Designer & Social Media Manager',
        org: 'Soch Business Mentors LLP',
        todo: 'soch-dates',
        summary: null,
        areas: [
            'Graphic design',
            'Social media management',
            'Website projects',
            'Digital initiatives',
            'Multiple website projects',
            'NFT-related projects',
        ],
    },
];

const IMPACT = [
    ['1,600+', 'VOEPL LinkedIn followers'],
    ['300 → 1,600+', 'Approximate audience growth during my contribution'],
    ['3+', 'Years of experience across design, web and digital communication'],
];

export default function Experience() {
    return (
        <section className="band" id="experience" aria-labelledby="experience-title">
            <div className="shell">
                <div className="grid">
                    <p className="tag exp__tag" data-reveal="">
                        <span className="tag__no num">04</span>Experience
                    </p>
                    <h2 className="statement exp__statement" id="experience-title" data-reveal="">
                        Design, web and communication inside manufacturing and&nbsp;consulting.
                    </h2>

                    <ol className="exp-list">
                        {ROLES.map((item) => (
                            <li className="exp" data-reveal="" key={item.index}>
                                <div className="exp__meta">
                                    <p className="exp__index num" aria-hidden="true">
                                        {item.index}
                                    </p>
                                    <h3 className="exp__role">{item.role}</h3>
                                    <p className="exp__org">{item.org}</p>
                                    <p className="exp__dates">
                                        <span className="tbd" data-todo={item.todo}>
                                            Employment dates to be provided
                                        </span>
                                    </p>
                                </div>

                                <div className="exp__body">
                                    {item.summary && <p className="exp__summary">{item.summary}</p>}
                                    <div>
                                        <p className="exp__areas-label">Contribution areas</p>
                                        <ul className="exp__areas">
                                            {item.areas.map((area) => (
                                                <li key={area}>{area}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* ---------- SELECTED IMPACT ---------- */}
                    <section className="sub" id="impact" aria-labelledby="impact-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="impact-title">
                                A small number of figures I can stand behind.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">04.1</span>Selected Impact
                            </p>
                        </header>

                        <ul className="impact">
                            {IMPACT.map(([figure, label]) => (
                                <li className="impact__item" key={figure}>
                                    <p className="impact__figure num">{figure}</p>
                                    <p className="impact__label">{label}</p>
                                </li>
                            ))}
                        </ul>

                        <p className="impact__note">
                            Audience growth reflects a period of team effort to which I contributed through
                            consistent visual communication and content.
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
}
