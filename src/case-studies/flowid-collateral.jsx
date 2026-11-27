import { useEffect, useRef, useState } from 'react';
import { Zoomable } from '../components/Lightbox.jsx';
import { cld, responsive } from '../data/cloudinary.js';

const BODY = '(min-width: 92rem) 1072px, (min-width: 62rem) 74vw, 92vw';
const HALF = '(min-width: 92rem) 536px, (min-width: 62rem) 37vw, (min-width: 48rem) 46vw, 92vw';

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
