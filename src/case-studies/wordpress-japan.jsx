import { Zoomable } from '../components/Lightbox.jsx';

/* WordPress websites for clients in Japan, on the same shell as every
   case study: the brief in words, then Horita DM Clinic's screens in
   pictures — the home page at desktop width, the same page on a phone, and
   the inner pages — and then FotoLib Kyoto, from the export of its design.
   Kuwahara Lab has no screens and appears by name and link only.

   The clinic's pictures are the frames of the Figma file its site was built
   from, cut at section edges and kept in the repository, so they are plain
   local files rather than Cloudinary uploads. Each is given its width and
   never a shape, as FLOWID's are: the desktop plates run the width of the
   column and the phone frames stand three to a row at their own height, so
   nothing is cropped or stretched. They are listed, with their sizes and
   what each shows, on the project record in src/data/projects.js. */

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
                        Three websites for clients in Japan, built in WordPress to be
                        responsive and to work as designed.
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
                        <strong>Kuwahara Lab</strong>, the third, is a website the team
                        created, live at blog.kuwatechno.jp.
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
                        page of the album includes, and a six-step order process.
                    </p>
                    <div className="case-phones">
                        {project.fotolib.map((shot) => (
                            <Shot shot={shot} onZoom={onZoom} key={shot[0]} />
                        ))}
                    </div>
                </>
            ),
        },
    ];
}
