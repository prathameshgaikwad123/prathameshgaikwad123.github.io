import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        Before my current work, I spent time as a graphic designer and social
                        media manager at Soch Business Mentors LLP, working across multiple
                        website projects and digital initiatives.
                    </p>
                    <p>
                        This page exists because that range is part of how I work now. It is
                        presented as an archive, not as a set of finished case studies —
                        earlier work that shaped the approach rather than work I would lead
                        with today.
                    </p>
                </>
            ),
        },
        {
            key: 'areas',
            label: 'Areas of work',
            body: (
                <>
                    <ul className="case-list">
                        <li>Graphic design</li>
                        <li>Social media management and design</li>
                        <li>Multiple website projects</li>
                        <li>Digital initiatives</li>
                        <li>NFT-related projects</li>
                    </ul>
                    <p>
                        <span className="tbd" data-todo="archive-entries">
                            Project names, clients and dates to be provided. Nothing here has been
                            named or dated on your behalf.
                        </span>
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
                            Placeholders below. Add only work you are comfortable showing
                            publicly, and check client permission where relevant — see{' '}
                            <code>ASSETS.md</code>.
                        </>
                    }
                />
            ),
        },
        {
            key: 'note',
            label: 'A note on this archive',
            body: (
                <p>
                    An archive is more useful when it is short. As newer work replaces it,
                    this page is meant to shrink rather than grow — the point is to show
                    range, not volume.
                </p>
            ),
        },
    ];
}
