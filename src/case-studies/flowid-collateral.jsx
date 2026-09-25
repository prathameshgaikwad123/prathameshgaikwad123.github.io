import { useEffect, useRef, useState } from 'react';
import { Zoomable } from '../components/Lightbox.jsx';
import { cld, responsive } from '../data/cloudinary.js';

/* FLOWID, on the same shell as every case study: three blocks, each
   with its label in the left column and its pictures across the right
   one — the banner, the banner at the expo, the brochure. Nothing is
   written that the pictures already say.

   No picture is given a shape. Each is as wide as its place and as tall
   as its own proportions make it, so none is cropped and none is
   stretched. The pictures, and their order, are on the project record
   in src/data/projects.js. */

/* How wide a picture in the body column is drawn, for the srcset: the
   shell's content box less the 12rem label column and its gap. */
const BODY = '(min-width: 92rem) 1072px, (min-width: 62rem) 74vw, 92vw';
const HALF = '(min-width: 92rem) 536px, (min-width: 62rem) 37vw, (min-width: 48rem) 46vw, 92vw';

/* The picture the lightbox opens: the whole of it inside a 2560 square,
   so a tall page and a wide photograph are both asked for at their long
   edge. */
const zoomOf = (src) => cld(src, { w: 2560, h: 2560 });

const pad = (n) => String(n).padStart(2, '0');

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

/* ---------- The expo ------------------------------------------------

   Three photographs, some portrait and some landscape, in a fixed
   order. They are set in rows that fill the column exactly: every
   photograph in a row is the same height, and takes a share of the
   width in proportion to its own ratio. Which photographs share a row
   is worked out from their shapes — the grouping whose rows come
   nearest a comfortable height (about 0.6 of the column's width) wins,
   and on a tie the first photograph is the one given a row of its own.
   So three portraits stand side by side, and a landscape among them is
   given the width it needs, without anybody having to say which is
   which. */
const TARGET = 1 / 0.6;

const groupings = (n) => {
    if (n <= 1) return [[Array.from({ length: n }, (_, i) => i)]];
    const out = [];
    /* Every way of cutting 0..n-1 into consecutive rows. */
    for (let mask = 0; mask < 1 << (n - 1); mask += 1) {
        const rows = [[0]];
        for (let i = 1; i < n; i += 1) {
            if (mask & (1 << (i - 1))) rows.push([i]);
            else rows[rows.length - 1].push(i);
        }
        out.push(rows);
    }
    return out;
};

function arrange(ratios) {
    let best = null;
    let least = Infinity;
    for (const rows of groupings(ratios.length)) {
        const cost = rows.reduce((sum, row) => {
            const width = row.reduce((w, i) => w + ratios[i], 0);
            return sum + Math.log(width / TARGET) ** 2;
        }, 0);
        /* Ties go to the grouping that gives the first photograph the
           most room, which is the one with the fewest in its first row. */
        if (cost < least - 1e-9 || (Math.abs(cost - least) <= 1e-9 && rows[0].length < best[0].length)) {
            least = cost;
            best = rows;
        }
    }
    return best;
}

function Expo({ photos, onZoom }) {
    const ref = useRef(null);
    const [ratios, setRatios] = useState(() => photos.map((p) => p.w / p.h));

    /* The record's ratios are a guess for photographs nobody measured,
       so each one's own is read once it has arrived. Listening on the
       container, in the capture phase, because `load` does not bubble
       and the <img> is replaced once the zoom control is added. */
    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;

        const read = () => {
            const imgs = root.querySelectorAll('img');
            const next = photos.map((p, i) => {
                const img = imgs[i];
                return img && img.naturalWidth && img.naturalHeight
                    ? img.naturalWidth / img.naturalHeight
                    : p.w / p.h;
            });
            setRatios((was) => (was.every((r, i) => Math.abs(r - next[i]) < 0.005) ? was : next));
        };

        read();
        root.addEventListener('load', read, true);
        return () => root.removeEventListener('load', read, true);
    }, [photos]);

    /* One flex row that wraps where a break is placed, so a change of
       grouping moves the breaks and never the photographs. */
    const items = [];
    arrange(ratios).forEach((row, r) => {
        if (r > 0) items.push(<span className="case-expo__break" aria-hidden="true" key={`break-${row[0]}`} />);
        row.forEach((i) => {
            const photo = photos[i];
            items.push(
                <figure className="frame" style={{ '--ar': ratios[i].toFixed(4) }} key={photo.src}>
                    <Plate plate={photo} sizes={BODY} alt={photo.alt} onZoom={onZoom} />
                </figure>,
            );
        });
    });

    return (
        <div className="case-expo" ref={ref}>
            {items}
        </div>
    );
}

export default function blocks(project, onZoom) {
    const { banner, expo, brochure } = project;

    return [
        {
            key: 'banner',
            label: 'Banner Design',
            wide: true,
            body: (
                /* The first picture on the page, so it is not lazy. */
                <figure className="frame case-plate">
                    <Plate plate={banner} sizes={BODY} alt={banner.alt} eager onZoom={onZoom} />
                </figure>
            ),
        },
        {
            key: 'expo',
            label: 'At the Expo',
            wide: true,
            body: <Expo photos={expo} onZoom={onZoom} />,
        },
        {
            key: 'brochure',
            label: 'The Brochure',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">{`${brochure.length} pages`}</p>
                    {/* One publication: its pages in order, two to a row,
                        each with its number in the same place under it. */}
                    <ol className="case-pages">
                        {brochure.map((page, i) => (
                            <li key={page.src}>
                                <figure className="frame">
                                    <Plate
                                        plate={page}
                                        sizes={HALF}
                                        alt={`FLOWID brochure, page ${i + 1} of ${brochure.length}.`}
                                        onZoom={onZoom}
                                    />
                                    <figcaption className="case-pages__no num" aria-hidden="true">
                                        {pad(i + 1)}
                                    </figcaption>
                                </figure>
                            </li>
                        ))}
                    </ol>
                </>
            ),
        },
    ];
}
