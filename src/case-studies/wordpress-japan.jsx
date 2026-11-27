import { Zoomable } from '../components/Lightbox.jsx';

const DIR = '/assets/images/projects/wordpress-japan/';

function Shot({ shot: [file, w, h, alt], eager, onZoom }) {
    const src = `${DIR}${file}.webp`;
    return (
        <figure className="frame">
            <span className="frame__media">
                <Zoomable
                    src={src}
                    alt={alt}
                    width={String(w)}
                    height={String(h)}
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : undefined}
                    onZoom={onZoom}
                />
            </span>
        </figure>
    );
}

export default function blocks(project, onZoom) {
    const { top, phone, inner } = project.screens;

    return [
        {
            key: 'ctx',
            label: 'Context',
            body: (
                <>
                    <p>
                        Between December 2025 and March 2026 I delivered four client websites,
                        and several smaller WordPress projects, for businesses in Japan. The
                        work came through LinkedIn outreach and ran alongside my full-time
                        role, with the sites built to be responsive and to match the Figma
                        designs they were given. Three of them are shown here.
                    </p>
                    <p>
                        <strong>Horita DM Clinic</strong> is a diabetes and
                        metabolic-medicine clinic in Minokamo, Gifu. Its website is where a
                        patient first finds out what the clinic treats, when it is open, and
                        how to reach it — by phone, by booking online, or on LINE. The design
                        arrived as a Figma file, and my part was to build it in WordPress.
                    </p>
                    <p>
                        <strong>FotoLib Kyoto</strong> is a photo-album service for visitors
                        to Kyoto, live at fotolib-kyoto.com; its page is shown below.{' '}
                        <strong>Kuwahara Lab</strong>, an inspection, finishing and
                        quality-improvement lab, publishes its news and articles at
                        blog.kuwatechno.jp, and that site is shown last.
                    </p>
                    <p>
                        On every one of them I also owned the conversation with the client:
                        scope, timelines and QA, through to handover.
                    </p>
                </>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            body: (
                <ul className="case-list">
                    <li>WordPress development of all three websites</li>
                    <li>Client communication, scope, timelines and QA through handover</li>
                    <li>Horita DM Clinic: building the supplied Figma designs, from the desktop and phone frames</li>
                    <li>Horita DM Clinic: the header, the phone navigation panel and the footer</li>
                    <li>Horita DM Clinic: the booking and LINE buttons that stay with the reader down the page</li>
                    <li>Horita DM Clinic: the consultation-hours table, the news list and the diabetes pages</li>
                </ul>
            ),
        },
        {
            key: 'file',
            label: 'Horita · The design file',
            body: (
                <>
                    <p>
                        Every page is drawn twice, once at 1440&nbsp;px and once at
                        375&nbsp;px, so the phone layout was a design to follow rather than
                        a desktop page to shrink.
                    </p>
                    <p>
                        The file also states its own grid in a note: backgrounds and large
                        images sit in a <strong>1280&nbsp;px safe area</strong>, and
                        text-led body copy in a <strong>1080&nbsp;px content width</strong>.
                        The build keeps to both.
                    </p>
                </>
            ),
        },
        {
            key: 'pc',
            label: 'Horita · Home, desktop',
            wide: true,
            body: (
                <div className="case-stack">
                    {top.map((shot, i) => (
                        <Shot shot={shot} eager={i === 0} onZoom={onZoom} key={shot[0]} />
                    ))}
                </div>
            ),
        },
        {
            key: 'sp',
            label: 'Horita · Home, phone',
            wide: true,
            body: (
                <div className="case-phones">
                    {phone.map((shot) => (
                        <Shot shot={shot} onZoom={onZoom} key={shot[0]} />
                    ))}
                </div>
            ),
        },
        {
            key: 'inner',
            label: 'Horita · Inner pages',
            wide: true,
            body: (
                <div className="case-stack">
                    {inner.map((shot) => (
                        <Shot shot={shot} onZoom={onZoom} key={shot[0]} />
                    ))}
                </div>
            ),
        },
        {
            key: 'fotolib',
            label: 'FotoLib Kyoto',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        A page that explains a Kyoto photo-album service: two plans, what each
                        page of the album includes, and a six-step order process. Captured
                        from the live site.
                    </p>
                    <div className="case-phones">
                        {project.fotolib.map((shot) => (
                            <Shot shot={shot} onZoom={onZoom} key={shot[0]} />
                        ))}
                    </div>
                </>
            ),
        },
        {
            key: 'kuwahara',
            label: 'Kuwahara Lab',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        The Kuwahara Lab blog: the featured-article carousel, the navigation
                        and the recommended topics, at desktop width and on a phone. Captured
                        from the live site.
                    </p>
                    <div className="case-stack">
                        <Shot shot={project.kuwahara[0]} onZoom={onZoom} />
                    </div>
                    <div className="case-phones">
                        <Shot shot={project.kuwahara[1]} onZoom={onZoom} />
                    </div>
                </>
            ),
        },
    ];
}
