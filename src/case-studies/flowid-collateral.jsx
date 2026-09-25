import { useEffect, useRef } from 'react';
import { Zoomable } from '../components/Lightbox.jsx';
import { ArrowLeft } from '../components/Icons.jsx';
import { cld, responsive } from '../data/cloudinary.js';

/* FLOWID is shown rather than written: a name, what it was and where,
   and then three numbered plates in the order the work happened — the
   artwork, the artwork standing at the expo, and the brochure handed
   out beside it. Everything it shows is on the project record in
   src/data/projects.js, in the order it is shown; this file is only the
   composition.

   One container and one grid from the top of the page to the bottom:
   the shell, and its twelve columns. Every block starts on the first
   column. A picture is given a number of columns and nothing else — it
   is as wide as they are and as tall as its own proportions make it, so
   none is cropped, none is stretched, and none is centred on its own. */

const HOME = '../index.html';

const pad = (n) => String(n).padStart(2, '0');

/* How wide each plate is drawn, for the srcset. Worked from the
   stylesheet (section 13, "Plates"): the shell's content box is 1344px
   at most, a lead plate is seven of its twelve columns, a page is six,
   and the pair shares the full width. */
const SIZES = {
    lead: '(min-width: 92rem) 790px, (min-width: 62rem) 56vw, 92vw',
    pair: '(min-width: 92rem) 860px, (min-width: 48rem) 64vw, 92vw',
    page: '(min-width: 92rem) 670px, (min-width: 48rem) 47vw, 92vw',
};

/* The picture the lightbox opens: the whole of it inside a 2560 square,
   so a tall page and a wide photograph are both asked for at their long
   edge. */
const zoomOf = (src) => cld(src, { w: 2560, h: 2560 });

const ratio = (plate) => (plate.w / plate.h).toFixed(4);

/* The two photographs in the pair share their row in proportion to
   their ratios, which is what keeps them the same height. The ratio the
   record reserves is a guess for a photograph nobody measured, so once
   the picture itself has arrived its own is written over it. Listening
   on the container, in the capture phase, because `load` does not
   bubble and the <img> is replaced once the zoom control is added. */
function useMeasured(ref) {
    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;

        const measure = (img) => {
            const plate = img.closest('[data-measure]');
            if (plate && img.naturalWidth && img.naturalHeight) {
                plate.style.setProperty('--ar', (img.naturalWidth / img.naturalHeight).toFixed(4));
            }
        };

        root.querySelectorAll('[data-measure] img').forEach((img) => {
            if (img.complete) measure(img);
        });

        const onLoad = (event) => {
            if (event.target instanceof HTMLImageElement) measure(event.target);
        };
        root.addEventListener('load', onLoad, true);
        return () => root.removeEventListener('load', onLoad, true);
    }, [ref]);
}

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

/* A plate's heading: its number, then its name, and under them a line
   of fact where there is one. */
function Head({ id, no, title, meta }) {
    return (
        <header className="plates__head">
            <h2 className="plates__heading" id={id}>
                <span className="plates__no num">{no}</span>
                <span className="plates__title">{title}</span>
            </h2>
            {meta ? <p className="plates__meta">{meta}</p> : null}
        </header>
    );
}

export default function Flowid({ project, onZoom }) {
    const { banner, expo, brochure } = project;
    const [lead, ...pair] = expo;
    const pairRef = useRef(null);

    useMeasured(pairRef);

    return (
        <>
            {/* ---------- OPENING ---------- */}
            <section className="case-hero case-hero--plates shell" id="top" aria-labelledby="case-title">
                <a className="breadcrumb" href={`${HOME}#work`}>
                    <ArrowLeft />
                    Selected Work
                </a>

                <p className="case-hero__category case-hero__project">
                    Project <span className="num">{project.no}</span>
                </p>

                <h1 className="case-hero__title" id="case-title">
                    {project.name}
                </h1>

                <div className="case-hero__about">
                    <p className="case-hero__what">{project.discipline}</p>
                    <p className="case-hero__where">{project.place}</p>
                    <p className="case-hero__where num">{project.size}</p>
                </div>
            </section>

            <div className="shell plates">
                {/* ---------- 01 · BANNER DESIGN ---------- */}
                <section className="plates__sec" aria-labelledby="plates-banner">
                    <Head id="plates-banner" no="01" title="Banner Design" />

                    <div className="plates__grid">
                        {/* The first picture on the page, so it is not lazy. */}
                        <figure className="frame plates__lead">
                            <Plate plate={banner} sizes={SIZES.lead} alt={banner.alt} eager onZoom={onZoom} />
                        </figure>
                    </div>
                </section>

                {/* ---------- 02 · AT THE EXPO ---------- */}
                <section className="plates__sec" aria-labelledby="plates-expo">
                    <Head id="plates-expo" no="02" title="At the Expo" />

                    {/* The first photograph on the same seven columns as the
                        banner above it, then the other two across the whole
                        width at one height. */}
                    <div className="plates__grid">
                        <figure className="frame plates__lead">
                            <Plate plate={lead} sizes={SIZES.lead} alt={lead.alt} onZoom={onZoom} />
                        </figure>

                        <div className="plates__pair" ref={pairRef}>
                            {pair.map((photo) => (
                                <figure
                                    className="frame plates__photo"
                                    style={{ '--ar': ratio(photo) }}
                                    data-measure=""
                                    key={photo.src}
                                >
                                    <Plate plate={photo} sizes={SIZES.pair} alt={photo.alt} onZoom={onZoom} />
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ---------- 03 · THE BROCHURE ---------- */}
                <section className="plates__sec" aria-labelledby="plates-brochure">
                    <Head
                        id="plates-brochure"
                        no="03"
                        title="The Brochure"
                        meta={`${brochure.length} pages`}
                    />

                    {/* One publication: its pages in order, the same size,
                        each with its number in the same place under it. */}
                    <ol className="plates__grid plates__book">
                        {brochure.map((page, i) => (
                            <li className="plates__page" key={page.src}>
                                <figure className="frame">
                                    <Plate
                                        plate={page}
                                        sizes={SIZES.page}
                                        alt={`${project.name} brochure, page ${i + 1} of ${brochure.length}.`}
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
