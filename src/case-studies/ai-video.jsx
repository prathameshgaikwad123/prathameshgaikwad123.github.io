import CaseVideo from '../components/CaseVideo.jsx';

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
