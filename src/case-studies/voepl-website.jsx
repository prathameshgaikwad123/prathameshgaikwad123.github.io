import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        Virtuoso Optoelectronics Limited (VOEPL) is an Indian OEM/ODM
                        manufacturing company. Its website is the first place prospective
                        customers, partners and candidates go to understand what the
                        organisation actually makes and what it is capable of.
                    </p>
                    <p>
                        I joined the in-house team working on that digital presence, and
                        contributed across the site's design, its structure and the ongoing
                        work of keeping it current.
                    </p>
                </>
            ),
        },
        {
            key: 'chl',
            label: 'Challenge',
            body: (
                <>
                    <p>
                        A manufacturing website has to do several jobs at once. It needs to
                        present manufacturing capability, a product range and organisational
                        credibility — to readers whose technical knowledge varies enormously,
                        from procurement teams to engineers to first-time visitors.
                    </p>
                    <p>
                        The design problem is therefore mostly a <strong>structural</strong> one:
                        deciding what belongs on which page, in what order, and how much detail a
                        visitor should meet before they have to ask for more.
                    </p>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            body: (
                <>
                    <p>
                        This was collaborative, in-house work. The areas below are the ones
                        I contributed to — not a claim to have delivered the site alone.
                    </p>
                    <ul className="case-list">
                        <li>Website design</li>
                        <li>Website publishing and maintenance</li>
                        <li>Information architecture</li>
                        <li>Product and capability presentation</li>
                        <li>Responsive design</li>
                        <li>Odoo implementation</li>
                        <li>HTML, CSS and JavaScript work</li>
                        <li>SEO support</li>
                        <li>Technical website optimisation</li>
                    </ul>
                </>
            ),
        },
        {
            key: 'app',
            label: 'Approach',
            body: (
                <>
                    <h3>Structure before surface</h3>
                    <p>
                        Work started with how the information wanted to be organised — the
                        relationship between capabilities, products and company information —
                        rather than with page decoration.
                    </p>

                    <h3>Designing inside a platform</h3>
                    <p>
                        The site is built and maintained on Odoo, so design decisions had to
                        survive contact with a real CMS. Working directly in HTML, CSS and
                        JavaScript where the platform's own components fell short kept the
                        layouts closer to the intended design.
                    </p>

                    <h3>Responsive as a requirement, not a pass</h3>
                    <p>
                        Layouts were treated as needing to work at each size rather than
                        simply shrink, with particular attention to how dense product and
                        capability information behaves on a phone.
                    </p>

                    <h3>Maintenance as part of the design</h3>
                    <p>
                        Because I also published and maintained the site, patterns that were
                        quick to update correctly mattered as much as how they first looked.
                    </p>
                </>
            ),
        },
        {
            key: 'work',
            label: 'Selected work',
            wide: true,
            body: (
                <CaseGallery
                    project={project}
                    onZoom={onZoom}
                    note={
                        <>
                            Placeholders below. Replace with real screens — see <code>ASSETS.md</code>{' '}
                            for filenames and dimensions.
                        </>
                    }
                />
            ),
        },
        {
            key: 'out',
            label: 'Outcome',
            body: (
                <p>
                    <span className="tbd" data-todo="outcome-voepl-website">
                        Outcome to be provided — only verifiable results will be published here.
                        If no measurable outcome can be shared, this section will be removed
                        rather than filled with estimates.
                    </span>
                </p>
            ),
        },
    ];
}
