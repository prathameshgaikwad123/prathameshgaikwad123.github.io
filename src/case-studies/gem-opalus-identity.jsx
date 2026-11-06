import { useCallback, useEffect, useRef, useState } from 'react';
import { Zoomable } from '../components/Lightbox.jsx';
import { ArrowLeft, ArrowRight } from '../components/Icons.jsx';

/* Gem Opalus, on the same shell as every case study, but opened differently:
   a long document read top to bottom is a page nobody finishes, so the
   brand identity is shown in two stages instead.

     1. At a glance. Five tiles straight under the title — the ring, the
        logo, the packaging, the palette, the Instagram system — so the whole
        identity reads in one screen. Each tile is a way in to its chapter.
     2. Explore the system. The document's 23 pages, one chapter at a time
        (Brand, Logo, Colour, …), each chapter a row of pages to swipe
        through. Nothing is cut: a page is shown whole and opens full size.

   Without script, every chapter is simply shown in turn, so the page is
   still the whole document.

   The pages are the PDF's own, rendered at 2000px wide
   (public/assets/images/projects/gem-opalus-identity/brand-NN.webp, NN being
   the page number in the PDF), the tiles are crops of them (glance-*.webp)
   and the PDF itself is offered as a download. All of it is the designer's
   own work, shown unaltered. */

const DIR = '/assets/images/projects/gem-opalus-identity';
const PDF = '/assets/gem-opalus-brand-identity.pdf';

/* Every page is A4 landscape; 2000 × 1413 is the exported size, so only
   the ratio matters to the page reserving room for it. */
const W = 2000;
const H = 1413;
const SLIDE = '(min-width: 92rem) 1000px, (min-width: 48rem) 70vw, 86vw';

/* [page in the PDF, caption, alt]. The caption is the page's own
   headline; the alt says what is on it, because the text inside a picture
   is not text to a screen reader. */
const P = {
    1: ['The Earth’s treasures, shaped by time, made to be yours.',
        'The cover of the Gem Opalus brand identity guidelines: the gold-leaf G symbol and wordmark beside a gold signet ring engraved with the G, under the line “The Earth’s treasures, shaped by time, made to be yours.”'],
    3: ['A trusted source of natural gemstones.',
        'Brand overview: Gem Opalus as a gemstone trader and analyst offering natural precious and semi-precious stones, beside the Instagram gemstone chart for amethyst, citrine, peridot, garnet and opal, and a citrine ring on linen.'],
    5: ['A gold-leaf tile, a calligraphic G.',
        'The primary logo: a softly rounded tile of hammered gold leaf with a flowing G cut out of it, finishing in a small faceted point, above the GEM OPALUS wordmark in tracked capitals.'],
    6: ['From the original artwork only.',
        'Four logo variations: the symbol, the wordmark, a solid one-colour symbol on Earth brown, and an earlier outline study kept for reference.'],
    7: ['Measured from the master artwork.',
        'The logo’s construction: the unit X is the cap height of the wordmark, the symbol is about 6.1 X tall, the gap to the wordmark 0.8 X, and the clear space is 2 X on every side. Minimum sizes are 25 mm for the lockup and 8 mm for the symbol.'],
    8: ['Approved backgrounds, and the corner signature.',
        'The five approved backgrounds — White, Pearl, Linen, Earth and Ink — and where the logo sits: flush top-right at a quarter of the frame width on a post, centred on a package, top-left on stationery.'],
    9: ['Never redraw, recolour or rearrange.',
        'Incorrect logo usage: do not stretch, recolour, rotate, add shadows or glows, place on busy imagery, or retype the wordmark.'],
    11: ['Proportion and combinations.',
        'Colour proportion: white and Pearl 58 per cent, Ink 20, Linen 10, gold 7, with four text-and-ground combinations and their contrast ratios.'],
    12: ['Three voices, one register.',
        'The three typefaces: Aboreto in capitals for the wordmark and labels, Cormorant Garamond for headlines, and Poppins for body text, with the hierarchy set out from eyebrow to caption.'],
    13: ['Four quiet devices.',
        'The graphic language: the Tile, a rounded frame for photographs; the Facet, a small diamond used as a bullet or divider; the Callout, hairline elbows linking a stone to its facts; and the Monogram Field, the solid G tiled at low contrast. Five layout principles sit beside them.'],
    14: ['Daylight, texture, truth.',
        'Photography house style: a citrine ring on linen in raking late sun, with notes on light, surface, colour truth, scale, focus and crop.'],
    15: ['Three kinds of image.',
        'Image types: stones in hand and on a surface, studio close-ups of lapis lazuli and turquoise on white, and an editorial photograph of the signet ring, with notes on grading, backgrounds, composition and what to avoid.'],
    16: ['One ring, two languages.',
        'The hero product shown two ways: a photograph of the citrine solitaire on a hand against a warm backdrop, and a painterly 9:16 illustration of the same moment with the symbol as the corner signature.'],
    17: ['Letterhead, business cards, envelope.',
        'Stationery on a Linen ground: an A4 letterhead with the lockup and a gold rule, a white business card, an Earth-brown card with a gold-leaf symbol, and a DL envelope.'],
    18: ['White, with one gold signature.',
        'Packaging: a matte white box and a white paper bag, each with the lockup foiled in gold leaf, photographed against stone and a coloured set.'],
    19: ['Small pieces, the same calm.',
        'An Earth-brown authenticity card folded open to its gemstone details, a rounded product tag on a gold cord, a thank-you card, and tissue printed with the Monogram Field.'],
    20: ['The feed is the shop window.',
        'The @gem_opalus Instagram profile on a phone: five highlight covers, a checkerboard of white educational posts and in-hand photographs, and the digital assets — avatar, app icon and watermark.'],
    21: ['The post system, stretched to 9:16.',
        'Three Instagram story templates: a gemstone profile for lapis lazuli with callouts, a “Did you know?” card for turquoise, and a new-arrival story with a citrine ring in the Tile frame.'],
    22: ['Celebrate without leaving the house style.',
        'Promotional and seasonal posts: a restrained Happy New Year 2026 post as the model, and a Dipawali post and a New Arrival post marked for refinement.'],
    23: ['The leaf behind the letter.',
        'The hammered gold-leaf surface the symbol was cut from, full bleed beside a note on using it as a material and never as a background.'],
    24: ['Gemstone profiles.',
        'Seven of the founder’s Instagram creatives: five rare gemstones, a peridot “Did you know?”, turquoise, citrine, lapis lazuli, the January birthstone and the colours of garnet.'],
    25: ['Signet ring artwork.',
        'The G symbol interpreted as a hand-engraved gold signet ring in polished, hammered and relief finishes, on a dark workshop table.'],
    26: ['One system — street to hand.',
        'The brand in application: blade signs on shopfronts, a white paper bag, a wall plaque and business cards, all carrying the gold-leaf lockup on white.'],
};

/* The palette is the document's own, set here as colour rather than
   shown as a picture of colour, so a reader can read and copy the values. */
const PALETTE = [
    ['Opalus Gold', '#B6915E', 'Primary', 'Wordmark colour'],
    ['Leaf Gold', '#EBB44B', 'Primary', 'Gold-leaf backdrop of the symbol'],
    ['Pearl', '#F3F0EE', 'Primary', 'Canvas of the gem-profile posts'],
    ['Linen', '#CCB397', 'Secondary', 'Linen in the house photograph'],
    ['Umber', '#84421F', 'Secondary', 'Wall of the plaque mockup'],
    ['Earth', '#45342B', 'Neutral', 'Raw stone, box mockup'],
    ['Ink', '#1C1A18', 'Neutral', 'Text — post black, warmed'],
    ['White', '#FFFFFF', 'Neutral', 'Packaging and digital ground'],
];

const TRAITS = [
    ['Authentic', 'Natural stones, honestly shown. Real photography in hand and on linen; colour that matches the stone.'],
    ['Knowledgeable', 'Every post teaches — colour, clarity, cut, origin, history. The brand earns trust by explaining.'],
    ['Personal', 'Pieces are made for one person. The tone invites a conversation, not a checkout.'],
    ['Timeless', 'Stones formed over millennia deserve a calm, lasting identity — nothing trend-led.'],
];

/* The chapters, in the order of the document. `extra` is what a chapter
   sets natively above its pages. */
const CHAPTERS = [
    {
        key: 'brand',
        label: 'Brand',
        title: 'Shaped by time. Made to be yours.',
        text:
            'A gemstone trader and analyst whose identity speaks the way an analyst does: ' +
            'generous white space, quiet typography and a single note of gold, so the stone ' +
            'is always the most colourful thing on the page.',
        pages: [1, 3],
        extra: 'traits',
    },
    {
        key: 'logo',
        label: 'Logo',
        title: 'A gold-leaf tile, a calligraphic G.',
        text:
            'A softly rounded tile of hammered gold leaf with a flowing G cut out of it, ' +
            'ending in a small faceted point — a stone held at the top of the letter.',
        pages: [5, 6, 7, 8, 9],
    },
    {
        key: 'colour',
        label: 'Colour',
        title: 'Every colour is taken from the work.',
        text:
            'Light grounds dominate and gold is an accent — the logo, a title, a hairline — ' +
            'never a flood fill. The gemstone itself supplies the colour.',
        pages: [11],
        extra: 'palette',
    },
    {
        key: 'type',
        label: 'Type',
        title: 'Three voices, one register.',
        text:
            'Aboreto for the wordmark and labels, Cormorant Garamond for headlines and quotes, ' +
            'Poppins for everything that informs — with four quiet graphic devices.',
        pages: [12, 13],
    },
    {
        key: 'photo',
        label: 'Photography',
        title: 'Daylight, texture, truth.',
        text:
            'One surface per series, one stone in sharp focus, and colour that matches the ' +
            'stone in the hand.',
        pages: [14, 15, 16],
    },
    {
        key: 'print',
        label: 'Print',
        title: 'Small pieces, the same calm.',
        text: 'Stationery, packaging, authenticity cards and tags: white, with one gold signature.',
        pages: [17, 18, 19],
    },
    {
        key: 'digital',
        label: 'Digital',
        title: 'The feed is the shop window.',
        text:
            'The Instagram profile, a story system stretched to 9:16 and a restrained way ' +
            'to celebrate festivals without leaving the house style.',
        pages: [20, 21, 22],
    },
    {
        key: 'use',
        label: 'In use',
        title: 'One system — street to hand.',
        text:
            'The gold leaf the symbol was cut from, the founder’s gemstone profiles, the ' +
            'signet ring, and the brand on signs, bags and cards.',
        pages: [23, 24, 25, 26],
    },
];

/* The way in. Each tile is a crop of the document that stands for a
   chapter, and a press on it opens that chapter below. */
const TILES = [
    {
        key: 'ring',
        chapter: 'brand',
        label: 'The brand',
        src: `${DIR}/glance-ring.webp`,
        w: 986,
        h: 1406,
        alt: 'A gold signet ring engraved with the Gem Opalus G, on a dark leather workshop table.',
    },
    {
        key: 'logo',
        chapter: 'logo',
        label: 'The logo',
        src: `${DIR}/glance-logo.webp`,
        w: 680,
        h: 723,
        alt: 'The Gem Opalus logo: a gold-leaf tile with a calligraphic G cut out of it, above the wordmark.',
    },
    {
        key: 'pack',
        chapter: 'print',
        label: 'Packaging',
        src: `${DIR}/glance-pack.webp`,
        w: 1000,
        h: 924,
        alt: 'A matte white gift box with the Gem Opalus lockup foiled in gold leaf, leaning on raw stone beside a dried seed pod.',
    },
    {
        key: 'phone',
        chapter: 'digital',
        label: 'Digital',
        src: `${DIR}/glance-phone.webp`,
        w: 496,
        h: 1080,
        alt: 'The @gem_opalus Instagram profile on a phone: highlight covers over a grid of white gemstone-profile posts.',
    },
];

const pad = (n) => String(n).padStart(2, '0');
const motion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';

/* ---------- One chapter's pages, as a row to swipe -------------------- */

function Reel({ pages, onZoom }) {
    const track = useRef(null);
    const [index, setIndex] = useState(0);

    const step = useCallback(() => {
        const slides = track.current ? track.current.children : [];
        return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0;
    }, []);

    /* Which page is in front, read from where the row has been scrolled to. */
    const read = useCallback(() => {
        const s = step();
        if (!s || !track.current) return;
        setIndex(Math.min(pages.length - 1, Math.max(0, Math.round(track.current.scrollLeft / s))));
    }, [pages.length, step]);

    useEffect(() => {
        const el = track.current;
        if (!el) return undefined;
        el.addEventListener('scroll', read, { passive: true });
        return () => el.removeEventListener('scroll', read);
    }, [read]);

    const to = (i) => {
        const next = Math.min(pages.length - 1, Math.max(0, i));
        track.current.scrollTo({ left: next * step(), behavior: motion() });
    };

    const onKey = (event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); to(index + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); to(index - 1); }
    };

    const [caption] = P[pages[index]];

    return (
        <div className="gem-reel">
            <ul className="gem-reel__track" ref={track} tabIndex={0} onKeyDown={onKey} aria-label="Pages, swipe or use the arrow keys">
                {pages.map((no, i) => {
                    const src = `${DIR}/brand-${pad(no)}.webp`;
                    return (
                        <li className="gem-reel__slide" key={no}>
                            <span className="frame__media">
                                <Zoomable
                                    src={src}
                                    zoom={src}
                                    sizes={SLIDE}
                                    alt={P[no][1]}
                                    width={String(W)}
                                    height={String(H)}
                                    loading={i === 0 ? 'eager' : 'lazy'}
                                    onZoom={onZoom}
                                />
                            </span>
                        </li>
                    );
                })}
            </ul>

            <div className="gem-reel__bar">
                <p className="gem-reel__caption" aria-live="polite">
                    <span className="num case-gem__no">{pad(pages[index])}</span>
                    {caption}
                </p>
                {pages.length > 1 ? (
                    <div className="gem-reel__ctl">
                        <span className="num gem-reel__count">
                            {pad(index + 1)} / {pad(pages.length)}
                        </span>
                        <button type="button" aria-label="Previous page" disabled={index === 0} onClick={() => to(index - 1)}>
                            <ArrowLeft />
                        </button>
                        <button
                            type="button"
                            aria-label="Next page"
                            disabled={index === pages.length - 1}
                            onClick={() => to(index + 1)}
                        >
                            <ArrowRight />
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function Palette() {
    return (
        <ul className="case-gem__palette" aria-label="Brand palette">
            {PALETTE.map(([name, hex, tier, note]) => (
                <li className="case-gem__swatch" style={{ '--swatch': hex }} key={name}>
                    <span className="case-gem__chip" aria-hidden="true" />
                    <span className="case-gem__swatch-name">{name}</span>
                    <span className="case-gem__swatch-hex num">{hex}</span>
                    <span className="case-gem__swatch-note">
                        {tier} · {note}
                    </span>
                </li>
            ))}
        </ul>
    );
}

function Traits() {
    return (
        <ol className="case-gem__traits" aria-label="Brand personality">
            {TRAITS.map(([name, text], i) => (
                <li key={name}>
                    <span className="num case-gem__no">{pad(i + 1)}</span>
                    <h3>{name}</h3>
                    <p>{text}</p>
                </li>
            ))}
        </ol>
    );
}

/* ---------- The opening: at a glance, then the system ---------------- */

export function Opening({ onZoom }) {
    const [active, setActive] = useState(CHAPTERS[0].key);
    const tabs = useRef([]);
    const explore = useRef(null);

    const go = (key, { scroll = false } = {}) => {
        setActive(key);
        if (scroll && explore.current) {
            explore.current.scrollIntoView({ behavior: motion(), block: 'start' });
        }
    };

    const onTabKey = (event, i) => {
        const to =
            event.key === 'ArrowRight' ? (i + 1) % CHAPTERS.length
            : event.key === 'ArrowLeft' ? (i + CHAPTERS.length - 1) % CHAPTERS.length
            : event.key === 'Home' ? 0
            : event.key === 'End' ? CHAPTERS.length - 1
            : -1;
        if (to < 0) return;
        event.preventDefault();
        go(CHAPTERS[to].key);
        tabs.current[to]?.focus();
    };

    return (
        <div className="shell gem">
            {/* ---- At a glance ---- */}
            <ul className="gem-glance" aria-label="The identity at a glance">
                {TILES.map((tile) => (
                    <li className={`gem-glance__tile gem-glance__tile--${tile.key}`} key={tile.key}>
                        <a
                            href={`#gem-${tile.chapter}`}
                            onClick={(e) => {
                                e.preventDefault();
                                go(tile.chapter, { scroll: true });
                            }}
                        >
                            <img
                                src={tile.src}
                                alt={tile.alt}
                                width={String(tile.w)}
                                height={String(tile.h)}
                                loading="eager"
                                decoding="async"
                            />
                            <span className="gem-glance__label">{tile.label}</span>
                        </a>
                    </li>
                ))}
                <li className="gem-glance__tile gem-glance__tile--palette">
                    <a
                        href="#gem-colour"
                        aria-label="The palette: Opalus Gold, Leaf Gold, Pearl, Linen, Umber, Earth and Ink"
                        onClick={(e) => {
                            e.preventDefault();
                            go('colour', { scroll: true });
                        }}
                    >
                        <span className="gem-glance__stripes" aria-hidden="true">
                            {PALETTE.slice(0, 7).map(([name, hex]) => (
                                <span style={{ '--swatch': hex }} key={name} />
                            ))}
                        </span>
                        <span className="gem-glance__label">The palette</span>
                    </a>
                </li>
            </ul>

            {/* ---- Explore the system ---- */}
            <section className="gem-explore" id="gem-explore" ref={explore} aria-labelledby="gem-explore-title">
                <header className="gem-explore__head">
                    <h2 className="gem-explore__title" id="gem-explore-title">
                        Explore the system
                    </h2>
                    <a className="gem-explore__pdf" href={PDF} download>
                        Full guidelines, PDF
                    </a>
                </header>

                <div className="gem-tabs" role="tablist" aria-label="Chapters of the brand identity">
                    {CHAPTERS.map((chapter, i) => (
                        <button
                            type="button"
                            role="tab"
                            id={`gem-tab-${chapter.key}`}
                            aria-controls={`gem-${chapter.key}`}
                            aria-selected={active === chapter.key}
                            tabIndex={active === chapter.key ? 0 : -1}
                            key={chapter.key}
                            ref={(el) => { tabs.current[i] = el; }}
                            onClick={() => go(chapter.key)}
                            onKeyDown={(e) => onTabKey(e, i)}
                        >
                            <span className="num">{pad(i + 1)}</span>
                            {chapter.label}
                        </button>
                    ))}
                </div>

                {CHAPTERS.map((chapter) => (
                    <div
                        className="gem-panel"
                        role="tabpanel"
                        id={`gem-${chapter.key}`}
                        aria-labelledby={`gem-tab-${chapter.key}`}
                        hidden={active !== chapter.key}
                        key={chapter.key}
                    >
                        <div className="gem-panel__intro">
                            <h3 className="gem-panel__title">{chapter.title}</h3>
                            <p className="gem-panel__text">{chapter.text}</p>
                        </div>
                        {chapter.extra === 'traits' ? <Traits /> : null}
                        {chapter.extra === 'palette' ? <Palette /> : null}
                        <Reel pages={chapter.pages} onZoom={onZoom} />
                    </div>
                ))}
            </section>
        </div>
    );
}

export default function blocks() {
    return [
        {
            key: 'guidelines',
            label: 'The full guidelines',
            body: (
                <>
                    <p>
                        The complete 27-page document, as designed — logo rules, colour,
                        type, photography and every application.
                    </p>
                    <p>
                        <a className="case-gem__download" href={PDF} download>
                            Download the brand identity (PDF, 12 MB)
                        </a>
                    </p>
                </>
            ),
        },
    ];
}
