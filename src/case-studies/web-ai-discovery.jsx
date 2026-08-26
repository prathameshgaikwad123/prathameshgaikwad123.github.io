import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        How people find websites is changing. Alongside conventional search
                        results, answers are increasingly assembled by AI systems that read
                        and summarise pages rather than simply listing them.
                    </p>
                    <p>
                        Working on SEO and technical optimisation for a corporate website
                        made this a practical question rather than an abstract one: what does
                        a site need to look like structurally to be understood by both?
                    </p>
                    <p>
                        This page is honest about its own scope. It documents optimisation
                        work I carried out and research I have been doing — <strong>not</strong>{' '}
                        a claim to expertise in a field that is still forming.
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
                        Traditional SEO practice assumes a human clicks a result and lands on
                        a page. AI-mediated discovery does not guarantee that click — the
                        content may be read, summarised and cited without a visit.
                    </p>
                    <p>
                        That shifts what matters. Clear structure, unambiguous content and
                        machine-readable meaning start to count for more than tactics aimed
                        purely at ranking position.
                    </p>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            body: (
                <ul className="case-list">
                    <li>SEO support and implementation</li>
                    <li>Sitemap structure</li>
                    <li>
                        <code>robots.txt</code> configuration
                    </li>
                    <li>Technical website optimisation</li>
                    <li>Content structure</li>
                    <li>Research into AI search visibility</li>
                    <li>Answer Engine Optimisation (AEO)</li>
                    <li>Research into LLM discovery strategy</li>
                </ul>
            ),
        },
        {
            key: 'app',
            label: 'Approach',
            body: (
                <>
                    <h3>Start with structure</h3>
                    <p>
                        Sitemap and information hierarchy first. A site whose structure
                        reflects how its subject actually divides up is easier for both
                        crawlers and readers.
                    </p>

                    <h3>Make meaning explicit</h3>
                    <p>
                        Headings that describe content rather than decorate it, semantic
                        markup, and metadata that says what a page genuinely is. This is the
                        part that overlaps most directly with design: the structure a
                        designer builds is the structure a machine reads.
                    </p>

                    <h3>Get the technical basics right</h3>
                    <p>
                        <code>robots.txt</code>, canonical URLs, crawlability and performance
                        — the unglamorous layer that determines whether anything else has a
                        chance of working.
                    </p>

                    <h3>Research openly</h3>
                    <p>
                        AEO and LLM discovery are moving quickly and the established
                        practices are not settled. My position is to keep reading, testing on
                        real sites, and stay sceptical of confident claims — including my own.
                    </p>

                    <h3>Applied here</h3>
                    <p>
                        This portfolio is built the way the research suggests: semantic HTML,
                        a real heading hierarchy, canonical URLs, structured data, a sitemap
                        and a <code>robots.txt</code>.
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
                            Placeholders below. Diagrams of site structure and content hierarchy
                            communicate this work better than interface screenshots — see{' '}
                            <code>ASSETS.md</code>.
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
                    <span className="tbd" data-todo="outcome-web-ai-discovery">
                        Outcome to be provided. No traffic, ranking or visibility figures are
                        published here, because none have been verified.
                    </span>
                </p>
            ),
        },
    ];
}
