import { Zoomable } from '../components/Lightbox.jsx';

/* Gem Opalus, on the same shell as every case study. The body is the
   brand guidelines document itself — twenty-three of its pages, in order,
   each opened full size — with the three things that read better as a page
   than as a picture of one set natively: the brand's essence and
   personality, and its palette. Everything is grouped under the document's
   own section names.

   The pages are the PDF's, rendered at 2000px wide
   (public/assets/images/projects/gem-opalus-identity/brand-NN.webp, NN being
   the page number in the PDF), and the PDF itself is offered at the foot of
   the page. Both are the designer's own work, shown unaltered. */

const DIR = '/assets/images/projects/gem-opalus-identity';
const PDF = '/assets/gem-opalus-brand-identity.pdf';

/* Every page is A4 landscape; 2000 × 1413 is the exported size, so only
   the ratio matters to the page reserving room for it. */
const W = 2000;
const H = 1413;
const BODY = '(min-width: 92rem) 1072px, (min-width: 62rem) 74vw, 92vw';

/* [page in the PDF, caption, alt]. The caption is the page's own
   headline; the alt says what is on it, because the text inside a picture
   is not text to a screen reader. */
const PAGES = {
    cover: [
        [1, 'The Earth’s treasures, shaped by time, made to be yours.',
            'The cover of the Gem Opalus brand identity guidelines: the gold-leaf G symbol and wordmark beside a gold signet ring engraved with the G, under the line “The Earth’s treasures, shaped by time, made to be yours.”'],
        [3, 'A trusted source of natural gemstones.',
            'Brand overview: Gem Opalus as a gemstone trader and analyst offering natural precious and semi-precious stones, beside the Instagram gemstone chart for amethyst, citrine, peridot, garnet and opal, and a citrine ring on linen.'],
    ],
    logo: [
        [5, 'A gold-leaf tile, a calligraphic G.',
            'The primary logo: a softly rounded tile of hammered gold leaf with a flowing G cut out of it, finishing in a small faceted point, above the GEM OPALUS wordmark in tracked capitals.'],
        [6, 'From the original artwork only.',
            'Four logo variations: the symbol, the wordmark, a solid one-colour symbol on Earth brown, and an earlier outline study kept for reference.'],
        [7, 'Measured from the master artwork.',
            'The logo’s construction: the unit X is the cap height of the wordmark, the symbol is about 6.1 X tall, the gap to the wordmark 0.8 X, and the clear space is 2 X on every side. Minimum sizes are 25 mm for the lockup and 8 mm for the symbol.'],
        [8, 'Approved backgrounds, and the corner signature.',
            'The five approved backgrounds — White, Pearl, Linen, Earth and Ink — and where the logo sits: flush top-right at a quarter of the frame width on a post, centred on a package, top-left on stationery.'],
        [9, 'Never redraw, recolour or rearrange.',
            'Incorrect logo usage: do not stretch, recolour, rotate, add shadows or glows, place on busy imagery, or retype the wordmark.'],
    ],
    colour: [
        [11, 'Proportion and combinations.',
            'Colour proportion: white and Pearl 58 per cent, Ink 20, Linen 10, gold 7, with four text-and-ground combinations and their contrast ratios.'],
    ],
    type: [
        [12, 'Three voices, one register.',
            'The three typefaces: Aboreto in capitals for the wordmark and labels, Cormorant Garamond for headlines, and Poppins for body text, with the hierarchy set out from eyebrow to caption.'],
    ],
    graphic: [
        [13, 'Four quiet devices.',
            'The graphic language: the Tile, a rounded frame for photographs; the Facet, a small diamond used as a bullet or divider; the Callout, hairline elbows linking a stone to its facts; and the Monogram Field, the solid G tiled at low contrast. Five layout principles sit beside them.'],
    ],
    photo: [
        [14, 'Daylight, texture, truth.',
            'Photography house style: a citrine ring on linen in raking late sun, with notes on light, surface, colour truth, scale, focus and crop.'],
        [15, 'Three kinds of image.',
            'Image types: stones in hand and on a surface, studio close-ups of lapis lazuli and turquoise on white, and an editorial photograph of the signet ring, with notes on grading, backgrounds, composition and what to avoid.'],
        [16, 'One ring, two languages.',
            'The hero product shown two ways: a photograph of the citrine solitaire on a hand against a warm backdrop, and a painterly 9:16 illustration of the same moment with the symbol as the corner signature.'],
    ],
    print: [
        [17, 'Letterhead, business cards, envelope.',
            'Stationery on a Linen ground: an A4 letterhead with the lockup and a gold rule, a white business card, an Earth-brown card with a gold-leaf symbol, and a DL envelope.'],
        [18, 'White, with one gold signature.',
            'Packaging: a matte white box and a white paper bag, each with the lockup foiled in gold leaf, photographed against stone and a coloured set.'],
        [19, 'Small pieces, the same calm.',
            'An Earth-brown authenticity card folded open to its gemstone details, a rounded product tag on a gold cord, a thank-you card, and tissue printed with the Monogram Field.'],
    ],
    digital: [
        [20, 'The feed is the shop window.',
            'The @gem_opalus Instagram profile on a phone: five highlight covers, a checkerboard of white educational posts and in-hand photographs, and the digital assets — avatar, app icon and watermark.'],
        [21, 'The post system, stretched to 9:16.',
            'Three Instagram story templates: a gemstone profile for lapis lazuli with callouts, a “Did you know?” card for turquoise, and a new-arrival story with a citrine ring in the Tile frame.'],
        [22, 'Celebrate without leaving the house style.',
            'Promotional and seasonal posts: a restrained Happy New Year 2026 post as the model, and a Dipawali post and a New Arrival post marked for refinement.'],
    ],
    artwork: [
        [23, 'The leaf behind the letter.',
            'The hammered gold-leaf surface the symbol was cut from, full bleed beside a note on using it as a material and never as a background.'],
        [24, 'Gemstone profiles.',
            'Seven of the founder’s Instagram creatives: five rare gemstones, a peridot “Did you know?”, turquoise, citrine, lapis lazuli, the January birthstone and the colours of garnet.'],
        [25, 'Signet ring artwork.',
            'The G symbol interpreted as a hand-engraved gold signet ring in polished, hammered and relief finishes, on a dark workshop table.'],
    ],
    use: [
        [26, 'One system — street to hand.',
            'The brand in application: blade signs on shopfronts, a white paper bag, a wall plaque and business cards, all carrying the gold-leaf lockup on white.'],
    ],
};

/* The palette is the document's own, set here as colour rather than
   shown as a picture of colour, so a reader can read and copy the values. */
const PALETTE = [
    ['Opalus Gold', '#B6915E', 'Primary', 'Wordmark colour', 'light'],
    ['Leaf Gold', '#EBB44B', 'Primary', 'Gold-leaf backdrop of the symbol', 'dark'],
    ['Pearl', '#F3F0EE', 'Primary', 'Canvas of the gem-profile posts', 'dark'],
    ['Linen', '#CCB397', 'Secondary', 'Linen in the house photograph', 'dark'],
    ['Umber', '#84421F', 'Secondary', 'Wall of the plaque mockup', 'light'],
    ['Earth', '#45342B', 'Neutral', 'Raw stone, box mockup', 'light'],
    ['Ink', '#1C1A18', 'Neutral', 'Text — post black, warmed', 'light'],
    ['White', '#FFFFFF', 'Neutral', 'Packaging and digital ground', 'dark'],
];

const TRAITS = [
    ['Authentic', 'Natural stones, honestly shown. Real photography in hand and on linen; colour that matches the stone.'],
    ['Knowledgeable', 'Every post teaches — colour, clarity, cut, origin, history. The brand earns trust by explaining.'],
    ['Personal', 'Pieces are made for one person. The tone invites a conversation, not a checkout.'],
    ['Timeless', 'Stones formed over millennia deserve a calm, lasting identity — nothing trend-led.'],
];

function Plate({ page, eager, onZoom }) {
    const [no, caption, alt] = page;
    const src = `${DIR}/brand-${String(no).padStart(2, '0')}.webp`;
    return (
        <figure className="frame case-plate case-gem__plate">
            <span className="frame__media">
                <Zoomable
                    src={src}
                    zoom={src}
                    sizes={BODY}
                    alt={alt}
                    width={String(W)}
                    height={String(H)}
                    loading={eager ? 'eager' : 'lazy'}
                    fetchPriority={eager ? 'high' : undefined}
                    onZoom={onZoom}
                />
            </span>
            <figcaption>
                <span className="num case-gem__no">{String(no).padStart(2, '0')}</span>
                {caption}
            </figcaption>
        </figure>
    );
}

const plates = (pages, onZoom, eagerFirst) => (
    <div className="case-gem">
        {pages.map((page, i) => (
            <Plate page={page} eager={eagerFirst && i === 0} onZoom={onZoom} key={page[0]} />
        ))}
    </div>
);

export default function blocks(project, onZoom) {
    return [
        {
            key: 'overview',
            label: 'The brand',
            wide: true,
            body: (
                <>
                    <p className="case-gem__essence">
                        Shaped by time.
                        <br />
                        Made to be yours.
                    </p>
                    <p className="case-block__note">
                        Gem Opalus is a gemstone trader and analyst offering natural precious
                        and semi-precious stones, rashi ratna and handcrafted settings in gold
                        or silver. The brand speaks the way an analyst does: every stone is
                        introduced through what can be known about it. The identity is built to
                        carry that knowledge-first voice — generous white space, quiet
                        typography and a single note of gold, so the stone is always the most
                        colourful thing on the page.
                    </p>
                    {plates(PAGES.cover, onZoom, true)}
                    <ol className="case-gem__traits" aria-label="Brand personality">
                        {TRAITS.map(([name, text], i) => (
                            <li key={name}>
                                <span className="num case-gem__no">{String(i + 1).padStart(2, '0')}</span>
                                <h3>{name}</h3>
                                <p>{text}</p>
                            </li>
                        ))}
                    </ol>
                </>
            ),
        },
        {
            key: 'logo',
            label: 'Logo identity',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        A softly rounded tile of hammered gold leaf with a flowing G cut out of
                        it. The G ends in a small faceted point — a stone held at the top
                        of the letter. Beneath it, the wordmark is set in Aboreto capitals in
                        Opalus Gold.
                    </p>
                    {plates(PAGES.logo, onZoom)}
                </>
            ),
        },
        {
            key: 'colour',
            label: 'Colour system',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        Every colour is taken from the work. Light grounds dominate and gold is
                        an accent — the logo, a title, a hairline — never a flood
                        fill; the gemstone itself supplies the colour.
                    </p>
                    <ul className="case-gem__palette" aria-label="Brand palette">
                        {PALETTE.map(([name, hex, tier, note, tone]) => (
                            <li
                                className="case-gem__swatch"
                                data-tone={tone}
                                style={{ '--swatch': hex }}
                                key={name}
                            >
                                <span className="case-gem__chip" aria-hidden="true" />
                                <span className="case-gem__swatch-name">{name}</span>
                                <span className="case-gem__swatch-hex num">{hex}</span>
                                <span className="case-gem__swatch-note">
                                    {tier} · {note}
                                </span>
                            </li>
                        ))}
                    </ul>
                    {plates(PAGES.colour, onZoom)}
                </>
            ),
        },
        {
            key: 'type',
            label: 'Typography',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        Aboreto for the wordmark and labels, Cormorant Garamond for headlines
                        and quotes, Poppins for everything that informs.
                    </p>
                    {plates(PAGES.type, onZoom)}
                </>
            ),
        },
        {
            key: 'graphic',
            label: 'Graphic language',
            wide: true,
            body: plates(PAGES.graphic, onZoom),
        },
        {
            key: 'photo',
            label: 'Photography & art direction',
            wide: true,
            body: (
                <>
                    <p className="case-block__note">
                        Daylight, texture, truth. One surface per series, one stone in sharp
                        focus, and colour that matches the stone in the hand.
                    </p>
                    {plates(PAGES.photo, onZoom)}
                </>
            ),
        },
        {
            key: 'print',
            label: 'Stationery & packaging',
            wide: true,
            body: plates(PAGES.print, onZoom),
        },
        {
            key: 'digital',
            label: 'Digital identity',
            wide: true,
            body: plates(PAGES.digital, onZoom),
        },
        {
            key: 'artwork',
            label: 'Existing artwork',
            wide: true,
            body: plates(PAGES.artwork, onZoom),
        },
        {
            key: 'use',
            label: 'The brand in use',
            wide: true,
            body: plates(PAGES.use, onZoom),
        },
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
