import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        A manufacturing organisation communicates through far more surfaces
                        than a logo and a website. Sales decks, product sheets, brochures,
                        catalogues, HR induction material, ID cards, email signatures and
                        event graphics all speak on the company's behalf — often to the same
                        audience, in the same week.
                    </p>
                    <p>
                        My work at VOEPL involved designing across that whole range rather
                        than treating any one item as a standalone job.
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
                        When collateral is produced item by item, on request, it drifts. Two
                        brochures made months apart stop looking related. A presentation
                        prepared for one meeting sets a precedent nobody intended.
                    </p>
                    <p>
                        The challenge was less about any single artefact looking good, and
                        more about making the whole set feel like it came from{' '}
                        <strong>one organisation</strong> — while staying practical for
                        colleagues who need material quickly.
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
                        In-house design work across the touchpoints below, alongside the
                        teams who requested and used them.
                    </p>
                    <ul className="case-list">
                        <li>Corporate presentations</li>
                        <li>Product communication</li>
                        <li>Brochures</li>
                        <li>Catalogues</li>
                        <li>Fact sheets</li>
                        <li>Email signatures</li>
                        <li>ID cards</li>
                        <li>Internal communication</li>
                        <li>HR induction materials</li>
                        <li>Corporate event design</li>
                    </ul>
                </>
            ),
        },
        {
            key: 'app',
            label: 'Approach',
            body: (
                <>
                    <h3>Treat the set as the deliverable</h3>
                    <p>
                        Each request was an opportunity to settle a decision that would hold
                        for the next one — how a product is introduced, how technical
                        specifications are laid out, how a cover behaves.
                    </p>

                    <h3>Systems, not templates alone</h3>
                    <p>
                        Shared typography, spacing and layout logic meant new material could
                        be produced quickly without renegotiating the look every time. The
                        aim was consistency that survives being used by other people.
                    </p>

                    <h3>Match the medium</h3>
                    <p>
                        A catalogue, a projected slide and an ID card have genuinely
                        different constraints. Rather than forcing one layout across all of
                        them, the system carried the family resemblance while each format
                        was set appropriately.
                    </p>

                    <h3>Internal audiences count</h3>
                    <p>
                        HR induction material and internal communication were designed with
                        the same care as customer-facing work — they are often a new
                        colleague's first real impression of the company.
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
                            Placeholders below. Show these as a connected system rather than a
                            gallery of unrelated pieces — see <code>ASSETS.md</code>.
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
                    <span className="tbd" data-todo="outcome-voepl-brand-system">
                        Outcome to be provided — only verifiable results will be published here.
                    </span>
                </p>
            ),
        },
    ];
}
