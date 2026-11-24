import { Zoomable } from '../components/Lightbox.jsx';

/* The site itself, from the live pages: the home page and the products
   page at desktop width, and three pages on a phone. The plates are on the
   project record (src/data/projects.js), 1400 by 1050. */
function Plate({ plate: [src, alt], eager, onZoom }) {
    return (
        <figure className="frame">
            <span className="frame__media">
                <Zoomable
                    src={src}
                    alt={alt}
                    width="1400"
                    height="1050"
                    loading={eager ? 'eager' : 'lazy'}
                    onZoom={onZoom}
                />
            </span>
        </figure>
    );
}

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
                        I joined VOEPL in April 2024 and own the site. I designed it,
                        built it on Odoo, wrote its page content, and maintain it, so the
                        structure, the layouts and the words were decided together rather
                        than handed from one person to the next.
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
                        The website is one part of a wider job as VOEPL's only in-house
                        designer. What follows is what I did on the site itself.
                    </p>
                    <ul className="case-list">
                        <li>Site structure and information architecture</li>
                        <li>Page layouts and responsive UI</li>
                        <li>All page content, written for the site</li>
                        <li>Product and capability presentation</li>
                        <li>Odoo implementation, with custom HTML, CSS and JavaScript where the platform falls short</li>
                        <li>Publishing and ongoing maintenance</li>
                        <li>Planning a separate laboratory-testing website: structure, testing-category pages and enquiry journeys</li>
                    </ul>
                </>
            ),
        },
        {
            key: 'site',
            label: 'The site',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        Captured from the live site at www.voepl.com: desktop width, and a
                        phone.
                    </p>
                    <div className="case-stack">
                        {project.gallery.map((plate, i) => (
                            <Plate plate={plate} eager={false} onZoom={onZoom} key={plate[0]} />
                        ))}
                    </div>
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
    ];
}
