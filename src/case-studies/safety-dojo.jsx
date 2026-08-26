import CaseGallery from '../components/CaseGallery.jsx';

export default function blocks(project, onZoom) {
    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        Safety Dojo is a workplace safety awareness programme. Its job is to
                        keep genuinely important messages — about attention, habit and
                        conscious decision-making — present in people's minds while they work.
                    </p>
                    <p>
                        I developed the visual system for it: a series of industrial safety
                        posters intended to be seen daily, in the places where the risk
                        actually is.
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
                        Traditional safety communication can become visually repetitive. The
                        same warning triangles, the same stock imagery, the same tone —
                        material that people stop registering precisely because it looks like
                        what they already expect.
                    </p>
                    <p>
                        A poster that is no longer noticed is not doing its job, however
                        correct its content. So the real problem was <strong>attention</strong>,
                        not information.
                    </p>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            body: (
                <ul className="case-list">
                    <li>Creative direction for the series</li>
                    <li>Concept development</li>
                    <li>Visual language and illustration</li>
                    <li>Campaign design and consistency across the set</li>
                </ul>
            ),
        },
        {
            key: 'app',
            label: 'Approach',
            body: (
                <>
                    <h3>Concept</h3>
                    <p>
                        Build a distinctive visual language around awareness and conscious
                        decision-making — the moment of noticing — rather than around hazard
                        symbols alone.
                    </p>

                    <h3>System</h3>
                    <p>
                        Design a connected series rather than individual posters. Shared
                        composition, colour and illustration treatment let each new poster
                        read as part of something recognisable, which is what makes a
                        campaign accumulate rather than reset.
                    </p>

                    <h3>Execution</h3>
                    <p>
                        Modern visual storytelling and illustration, with campaign
                        consistency held across the set. Each poster carries one idea
                        clearly, at the distance and speed people actually read at in a
                        working environment.
                    </p>

                    <h3>Memorability as the design goal</h3>
                    <p>
                        Every decision was measured against a single question: would someone
                        who walks past this every day still register it, and would they
                        remember it later?
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
                            Placeholders below. Show several posters together so the shared
                            visual language is visible — see <code>ASSETS.md</code>.
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
                    <span className="tbd" data-todo="outcome-safety-dojo">
                        Outcome to be provided. No campaign performance data is published here,
                        because none has been verified.
                    </span>
                </p>
            ),
        },
    ];
}
