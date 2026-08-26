import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        LinkedIn is where a manufacturing company's professional audience
                        actually is — customers, suppliers, industry peers and prospective
                        colleagues. For an OEM/ODM business, it is less a marketing channel
                        than a running demonstration of competence.
                    </p>
                    <p>
                        I contributed to VOEPL's presence there through the design and
                        content side: what gets posted, what it looks like, and whether it
                        holds together over months.
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
                        Manufacturing subject matter is not inherently easy to make engaging.
                        Products are technical, processes are hard to photograph well, and
                        the temptation is to post either dry specifications or generic
                        corporate filler.
                    </p>
                    <p>
                        The challenge was to make the feed consistently recognisable and
                        worth following — so that the account read as{' '}
                        <strong>one considered voice</strong> rather than a series of
                        unrelated announcements.
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
                        This was a team effort, and the audience growth below reflects that.
                        My contribution was the design and content work.
                    </p>
                    <ul className="case-list">
                        <li>Content design for LinkedIn</li>
                        <li>Visual communication and post design</li>
                        <li>Visual storytelling around products and capabilities</li>
                        <li>Maintaining consistency across the feed over time</li>
                    </ul>
                </>
            ),
        },
        {
            key: 'app',
            label: 'Approach',
            body: (
                <>
                    <h3>Consistency as the mechanism</h3>
                    <p>
                        A recognisable visual treatment does more for a company feed than any
                        single strong post. Shared typography, framing and colour meant the
                        account became identifiable in a scroll.
                    </p>

                    <h3>Design the recurring formats</h3>
                    <p>
                        Rather than designing each post from scratch, the work leaned on
                        repeatable formats for the things that come up regularly — product
                        communication, capability highlights, company updates.
                    </p>

                    <h3>Respect the audience's expertise</h3>
                    <p>
                        The audience includes people who know the subject well. Content was
                        designed to be clear without being simplistic.
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
                            Placeholders below — see <code>ASSETS.md</code>.
                        </>
                    }
                />
            ),
        },
        {
            key: 'out',
            label: 'Outcome',
            body: (
                <>
                    <ul className="impact case-impact">
                        <li className="impact__item">
                            <p className="impact__figure">300 → 1,600+</p>
                            <p className="impact__label">
                                Approximate VOEPL LinkedIn follower growth during the period of my
                                contribution
                            </p>
                        </li>
                    </ul>
                    <p>
                        This is the one figure on this site with a number attached to it, and
                        it is deliberately stated as a contribution rather than a personal
                        result. No engagement rates, reach figures or conversion metrics are
                        claimed, because none have been verified.
                    </p>
                </>
            ),
        },
    ];
}
