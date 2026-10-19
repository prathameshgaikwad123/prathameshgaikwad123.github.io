import CaseVideo from '../components/CaseVideo.jsx';

/* AI-assisted video creation, on the shell every case study shares. Only what
   the project's own summary already says is written down here — that the
   videos were made for VOEPL's HSE department, with AI tools, from concept to
   finished video. The videos carry the page, and they are on the record in
   src/data/projects.js, so adding one is a line there and nothing here. */

export default function blocks(project) {
    return [
        {
            key: 'about',
            label: 'About',
            body: (
                <>
                    <p>
                        A series of videos made for the Health, Safety and Environment (HSE)
                        department at Virtuoso Optoelectronics Limited (VOEPL), an Indian
                        OEM/ODM manufacturing company.
                    </p>
                    <p>
                        They were made with AI-powered tools, which carried the work from the
                        first concept through the visuals to the finished video.
                    </p>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            body: (
                <>
                    <p>I created the videos, and worked across each stage of making them:</p>
                    <ul className="case-list">
                        <li>Concept development</li>
                        <li>Visual creation</li>
                        <li>Video production</li>
                    </ul>
                </>
            ),
        },
        {
            key: 'videos',
            label: 'The videos',
            wide: true,
            body: (
                <div className="case-videos">
                    {project.videos.map((video, i) => (
                        <CaseVideo video={video} no={String(i + 1).padStart(2, '0')} key={video.title + i} />
                    ))}
                </div>
            ),
        },
    ];
}
