import { Zoomable } from '../components/Lightbox.jsx';
import { ArrowLeft } from '../components/Icons.jsx';
import { cld, responsive } from '../data/cloudinary.js';

/* FlowID is shown rather than written: a name, what it was and where,
   and then three plates in the order the work happened — the artwork,
   the artwork standing at the expo, and the brochure handed out beside
   it. Everything it shows is on the project record in
   src/data/projects.js, in the order it is shown; this file is only the
   composition.

   Every picture here keeps its own proportions. None is given a shape
   to be cropped into: each is drawn at the width of its place and its
   own height, and where a picture is taller than the window has room
   for, the place is narrowed until it fits rather than the picture
   being cut. `--ar` carries the ratio the record reserves, which is
   what that narrowing is worked out from. */

const HOME = '../index.html';

const pad = (n) => String(n).padStart(2, '0');

/* How wide each plate is drawn, for the srcset. Worked from the
   stylesheet (section 13, "Plates") at a typical window height and
   rounded up — on a wide screen each of these is held by the window's
   height, not its width. */
const SIZES = {
    banner: '(min-width: 62rem) 50vw, 92vw',
    lead: '(min-width: 62rem) 50vw, 92vw',
    pair: '(min-width: 62rem) 30vw, (min-width: 48rem) 46vw, 92vw',
    page: '(min-width: 62rem) 40vw, 92vw',
};

/* The picture the lightbox opens: the whole of it inside a 2560 square,
   so a tall page and a wide photograph are both asked for at their long
   edge. */
const zoomOf = (src) => cld(src, { w: 2560, h: 2560 });

function Plate({ plate, sizes, alt, eager, onZoom }) {
    return (
        <span className="frame__media">
            <Zoomable
                {...responsive(plate.src, sizes)}
                zoom={zoomOf(plate.src)}
                alt={alt}
                width={String(plate.w)}
                height={String(plate.h)}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                onZoom={onZoom}
            />
        </span>
    );
}

const ratio = (plate) => ({ '--ar': (plate.w / plate.h).toFixed(4) });

export default function FlowID({ project, onZoom }) {
    const { banner, expo, brochure } = project;
    const [lead, ...pair] = expo;

    return (
        <>
            {/* ---------- OPENING ---------- */}
            <section className="case-hero case-hero--plates shell" id="top" aria-labelledby="case-title">
                <a className="breadcrumb" href={`${HOME}#work`}>
                    <ArrowLeft />
                    Selected Work
                </a>

                <p className="case-hero__category">
                    <span className="case-hero__no num">Project</span>
                    <span className="case-hero__cat num">{project.no}</span>
                </p>

                <h1 className="case-hero__title" id="case-title">
                    {project.name}
                </h1>

                <div className="case-hero__about">
                    <p className="case-hero__what">{project.discipline}</p>
                    <p className="case-hero__where">{project.place}</p>
                </div>
            </section>

            <div className="shell plates">
                {/* ---------- 01 · THE ARTWORK ---------- */}
                <section className="plates__sec" aria-labelledby="plates-banner">
                    <header className="plates__head">
                        <h2 className="tag" id="plates-banner">
                            <span className="tag__no num">01</span>Banner Design
                        </h2>
                        <p className="plates__aside num">{banner.size}</p>
                    </header>

                    {/* The first picture on the page, so it is not lazy. */}
                    <figure className="frame plates__banner" style={ratio(banner)}>
                        <Plate plate={banner} sizes={SIZES.banner} alt={banner.alt} eager onZoom={onZoom} />
                    </figure>
                </section>

                {/* ---------- 02 · AT THE EXPO ---------- */}
                <section className="plates__sec" aria-labelledby="plates-expo">
                    <header className="plates__head">
                        <h2 className="tag" id="plates-expo">
                            <span className="tag__no num">02</span>At the Expo
                        </h2>
                        {/* The whole of what this section has to say, and
                            said as a sequence rather than a paragraph. */}
                        <ol className="plates__steps" aria-label="From artwork to expo">
                            <li>Designed</li>
                            <li>Produced</li>
                            <li>Seen in the real world</li>
                        </ol>
                    </header>

                    {/* One photograph large, then two beside each other and
                        set over to the right — same height as each other
                        whatever their shapes, because each takes a share
                        of the row in proportion to its own ratio. */}
                    <div className="plates__expo">
                        <figure className="frame plates__lead" style={ratio(lead)}>
                            <Plate plate={lead} sizes={SIZES.lead} alt={lead.alt} onZoom={onZoom} />
                        </figure>

                        {/* The pair's ratio is the two side by side, so the
                            row can be held to the window's height as one. */}
                        <div
                            className="plates__pair"
                            style={{ '--ar': pair.reduce((sum, p) => sum + p.w / p.h, 0).toFixed(4) }}
                        >
                            {pair.map((photo) => (
                                <figure className="frame plates__photo" style={ratio(photo)} key={photo.src}>
                                    <Plate plate={photo} sizes={SIZES.pair} alt={photo.alt} onZoom={onZoom} />
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------- 03 · THE BROCHURE ---------- */}
                <section className="plates__sec" aria-labelledby="plates-brochure">
                    <header className="plates__head">
                        <h2 className="tag" id="plates-brochure">
                            <span className="tag__no num">03</span>The Brochure
                        </h2>
                        <p className="plates__aside num">{`${brochure.length} pages`}</p>
                    </header>

                    {/* One publication, laid out the way a folded one is
                        read: the cover alone on the right, the inside as
                        one spread, the back alone on the left. Each page
                        keeps the side of the fold it is printed on at
                        every width, and carries its folio under it. */}
                    <ol className="plates__book" style={ratio(brochure[0])}>
                        {brochure.map((page, i) => (
                            <li className="plates__page" key={page.src}>
                                <figure>
                                    <Plate
                                        plate={page}
                                        sizes={SIZES.page}
                                        alt={`FlowID brochure, page ${i + 1} of ${brochure.length}.`}
                                        onZoom={onZoom}
                                    />
                                    <figcaption className="plates__folio num" aria-hidden="true">
                                        {pad(i + 1)}
                                    </figcaption>
                                </figure>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </>
    );
}
