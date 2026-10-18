/* ===================================================================
   SELECTED WORK
   One record per project, in carousel order. The carousel on the home
   page and the case study pages are both built from this, so a project
   is described once — including the path of every plate, which is where
   you change a placeholder's extension when you replace it. See
   ASSETS.md.

   A record needs seven fields to be a card: slug, no, category, short,
   title, summary and cover. Everything past `href` is the case study,
   and only a project that has one carries it.

   `href` is what makes a card a link, and it is the only thing that
   does. A project with a case study points at its page; a project
   without one is `null`, and the carousel renders it as a cover and a
   caption rather than as a link to nowhere — the card, the counter,
   the label and the strip all behave exactly as they do for a linked
   project, minus the anchor. Giving one a destination later is one
   line here and nothing anywhere else: a case study page, or an
   external URL, or a Behance project.
   =================================================================== */

/* REPLACE: the gallery plates below point at labelled SVG placeholders in
   public/assets/images/projects/. Swap the extension here when you drop in
   a real 1400×1050 gallery plate, and rewrite the alt text next to it. */
const img = (slug, file) => `/assets/images/projects/${slug}/${file}`;

/* The covers are the real thing, and they are not in the repository:
   they are delivered from Cloudinary. Nothing about the carousel had to
   change to take them — a cover is a URL, and the strip's `img` and the
   WebGL pass that rasterises it both take a remote one as readily as a
   local one. The second of those asks for it cross-origin, so the
   delivery host has to answer with `Access-Control-Allow-Origin`; a
   card whose texture cannot be read draws as ground and the strip
   below still shows and links it. One entry per card, in carousel
   order. */
const cdn = (file) => `https://res.cloudinary.com/duhuxaukd/image/upload/${file}`;

/* `short` is the index label — the name this project answers to in a
   list rather than on a page. The navigation panel's work list is set
   from it, and that list carries only the projects that have somewhere
   to go, so a `short` on an unlinked project is what it would be
   called once it does. */

export const projects = [
    {
        slug: 'voepl-website',
        no: '01',
        category: 'VOEPL',
        short: 'Corporate Website',
        title: 'Building a Corporate Digital Presence',
        /* The index entry on the home page. */
        summary:
            'Contributing to the digital presence of an Indian OEM/ODM manufacturing ' +
            'company by working across website design, content structure, digital ' +
            'communication and ongoing optimisation.',
        meta: ['Web Design', 'UX', 'Information Architecture', 'Odoo', 'SEO'],
        go: 'Read the case study',
        cover: cdn('v1789371081/1_ivtwne.png'),
        coverAlt: 'Cover image for the VOEPL corporate website case study.',
        /* The one project with a case study, so the one card that is a
           link. The URL is the one the carousel used to build from the
           slug, written out rather than derived now that not every card
           has one. */
        href: 'work/voepl-website.html',
        /* The case study page. */
        lead:
            'Contributing to the digital presence of an Indian OEM/ODM manufacturing ' +
            'company by working across website design, content structure, digital ' +
            'communication and ongoing optimisation.',
        coverCaption: 'Placeholder — replace with a wide view of the website.',
        facts: [
            ['Role', 'Digital Marketing Executive — design, web and communication'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            ['Disciplines', 'Web Design · UX · Information Architecture · Odoo · SEO'],
            [
                'Areas of work',
                'Website design, publishing and maintenance; responsive layouts; product and capability presentation',
            ],
        ],
        gallery: [
            [img('voepl-website', '01.svg'), 'Placeholder for a VOEPL website page layout.'],
            [img('voepl-website', '02.svg'), 'Placeholder for a VOEPL website product or capability page.'],
            [img('voepl-website', '03.svg'), 'Placeholder for VOEPL website responsive layouts.'],
        ],
        /* The only line of this record that had to change. It pointed
           at the second case study, and there is no second case study
           any more — so it points where the last project's pointer
           always pointed, which is the way out of the work. */
        /* Where the case study goes at the end of itself. `href`, `label`,
           `title` and `aria` are the plate; `cover` and `coverAlt` are
           optional and are what make it carry a picture. A `next` that
           points at another project should have them — the cover is also
           what the cross-document view transition settles into on the
           page it opens (stylesheet section 15). This one points back at
           the home page's last band rather than at a project, because
           there is only one case study so far, and a plate for a section
           has no cover to show. */
        next: {
            href: '../index.html#contact',
            label: 'Next',
            title: 'Open to Opportunities — get in touch',
            aria: 'Continue',
        },
    },

    {
        slug: 'gem-opalus-identity',
        no: '02',
        category: 'Brand Identity / Logo Design',
        short: 'Gem Opalus',
        title: 'Logo Design & Brand Identity — Gem Opalus',
        summary:
            'Created the logo and overall brand identity, establishing a cohesive ' +
            'visual presence for the brand.',
        cover: cdn('v1789371081/2_cxup32.png'),
        coverAlt: 'Cover image for the Gem Opalus logo and brand identity project.',
        href: null,
    },

    {
        slug: 'amanoya-mascot',
        no: '03',
        category: 'Character Design / Brand Identity',
        short: 'Amanoya Mascot',
        title: 'Mascot Creation — Amanoya, Japan',
        summary:
            'Designed and developed a mascot concept, contributing to the brand\u2019s ' +
            'visual identity and character development.',
        cover: cdn('v1789371082/4_dtll6y.png'),
        coverAlt: 'Cover image for the Amanoya mascot creation project.',
        href: null,
    },

    {
        slug: 'flowid-collateral',
        no: '04',
        category: 'Graphic Design / Marketing Collateral',
        /* FLOWID is the client's own styling of its name, and it is
           written that way here rather than set in capitals by the
           stylesheet: the carousel, the navigation, the page, its title
           and every description of a picture all read these strings. */
        short: 'FLOWID Collateral',
        title: 'Brochure & Banner Design — FLOWID, Netherlands',
        summary:
            'Created brochures and banners aligned with the company\u2019s branding and ' +
            'communication requirements.',
        go: 'View the project',
        /* The banner artwork itself rather than a photograph of it: the
           card stands for the design. It is 4:5, which is the shape the
           strip gives this slot (every even card is tall), so the glass
           crops nothing off it. */
        cover: cdn('v1790314212/Flowid_banner_csf5vg.jpg'),
        coverAlt: 'The FLOWID exhibition banner artwork.',
        href: 'work/flowid-collateral.html',

        /* The case study page, on the same shell and in the same places
           as VOEPL's: the hero with its lead and facts, then one block per
           part of the work — the banner, the banner at the expo, the
           brochure — each with its label in the left column and its
           pictures in the right. The blocks are src/case-studies/
           flowid-collateral.jsx; the pictures, and the order they are
           shown in, are here.

           No 16:10 cover: it would cut the banner, which is 4:5, so the
           banner opens the first block uncut instead.

           `w` and `h` are what the page reserves before a picture has
           arrived, so only their ratio matters. The banner's is its
           print size, 2 m by 2.5 m, and the brochure's pages are A4. The
           photographs are a mix of portrait and landscape and were not
           measured, so they are reserved as portrait 3:4; the block
           measures each one when it arrives and lays the three out from
           their real shapes. Entering a photograph's real size here stops
           the page moving when it does. */
        caseTitle: 'FLOWID',
        caseCategory: 'Brochure & Banner Design',
        caseCover: false,
        lead:
            'Created brochures and banners aligned with the company\u2019s branding and ' +
            'communication requirements.',
        facts: [
            ['Client', 'FLOWID'],
            ['Location', 'Netherlands'],
            ['Deliverables', 'Exhibition banner \u00b7 Four-page brochure'],
            ['Banner size', '2 m \u00d7 2.5 m'],
        ],
        banner: {
            src: cdn('v1790314212/Flowid_banner_csf5vg.jpg'),
            w: 2000,
            h: 2500,
            alt: 'The FLOWID exhibition banner artwork, designed for a 2 m by 2.5 m print.',
        },
        /* In the order the page shows them. */
        expo: [
            {
                src: cdn('v1790315145/Booth_3_icvngf.jpg'),
                w: 3000,
                h: 4000,
                alt: 'The printed FLOWID banner standing on the stand at the expo.',
            },
            {
                src: cdn('v1790315145/Booth_1_y6hnrz.jpg'),
                w: 3000,
                h: 4000,
                alt: 'The FLOWID stand at the expo, with the banner in place.',
            },
            {
                src: cdn('v1790315145/Booth_2_mapxic.jpg'),
                w: 3000,
                h: 4000,
                alt: 'Another view of the FLOWID banner on the expo floor.',
            },
        ],
        /* Four A4 pages of one brochure, first to last. */
        brochure: [
            { src: cdn('v1790315381/flowfn_conv_0_a5k3ew.png'), w: 2480, h: 3508 },
            { src: cdn('v1790315382/flowfn_conv_1_pf1hzy.png'), w: 2480, h: 3508 },
            { src: cdn('v1790315381/flowfn_conv_2_fo3f9a.png'), w: 2480, h: 3508 },
            { src: cdn('v1790315398/flowfn_conv_3_rmqhko.png'), w: 2480, h: 3508 },
        ],
        /* The way out is the way in: back to the strip this came from.
           No label: the title already says what the plate does. */
        next: {
            href: '../index.html#work',
            title: 'Back to Selected Work',
            aria: 'Back to Selected Work',
            back: true,
        },
    },

    {
        slug: 'wordpress-japan',
        no: '05',
        category: 'Web Development / WordPress',
        short: 'WordPress Development',
        title: 'WordPress Website Development — Japan',
        summary:
            'Developed WordPress websites for clients in Japan \u2014 Horita DM Clinic, ' +
            'Kuwahara Lab and FotoLib Kyoto \u2014 including translating provided Figma ' +
            'designs into functional and responsive sites.',
        go: 'View the project',
        /* A collage made for the card: the clinic's home page at desktop
           width and on a phone, beside the top of the FotoLib page. Kuwahara
           Lab has no pictures and is in the card by name and link only. */
        cover: img('wordpress-japan', 'cover.webp'),
        coverAlt:
            'Three websites for clients in Japan: the Horita DM Clinic home page at desktop ' +
            'width and on a phone, beside the top of the FotoLib Kyoto page.',
        href: 'work/wordpress-japan.html',

        /* The case study page: the hero with its lead and facts, then one
           block per part of the work. The sites share it, because they are
           the same kind of work for the same kind of client: the clinic's
           and FotoLib's, which have screens, and Kuwahara Lab's, which has
           only its link, in the facts and in the context. The blocks are
           src/case-studies/wordpress-japan.jsx.

           The clinic's pictures are the Figma file's own frames, exported and
           cut at section edges (public/assets/images/projects/wordpress-japan/),
           so they are local WebP rather than Cloudinary uploads; the page
           reads them as they are. The numbers beside each are the exported
           size, which is what the page reserves before a picture has arrived.

           The clinic's name is the logo's, which is how it spells itself in
           Latin letters; the Japanese is the name on its site.

           No 16:10 cover, as with FLOWID: the first block opens with the
           desktop home page uncut instead. */
        caseTitle: 'WordPress Websites \u2014 Japan',
        caseCategory: 'WordPress Development',
        caseCover: false,
        lead:
            'Built WordPress websites for clients in Japan: a diabetes clinic in Gifu, ' +
            'from supplied Figma designs for desktop and for phones, and the Kuwahara ' +
            'Lab and FotoLib Kyoto websites.',
        facts: [
            ['Clients', 'Horita DM Clinic (\u5800\u7530DM\u30af\u30ea\u30cb\u30c3\u30af) \u00b7 Kuwahara Lab \u00b7 FotoLib Kyoto'],
            ['Location', 'Japan'],
            ['Role', 'WordPress development'],
            [
                'Live sites',
                {
                    links: [
                        { text: 'h-cl.jp', href: 'https://h-cl.jp/' },
                        { text: 'blog.kuwatechno.jp', href: 'https://blog.kuwatechno.jp/' },
                        { text: 'fotolib-kyoto.com', href: 'https://fotolib-kyoto.com/' },
                    ],
                },
            ],
        ],
        /* FotoLib Kyoto, from the PNG export of its design: the whole page
           shrunk into a strip about 260px wide, so these are crops of it,
           enlarged 2×, and soft. REPLACE with crops of a full-size export
           (Figma, Export, PNG at 2×) and the three can be re-cut sharp. */
        fotolib: [
            ['fotolib-hero', 510, 610, 'The top of the FotoLib Kyoto page: an orange header, a photograph of a woman in a kimono on a Kyoto street, two album plans with their prices, and three photographs of Arashiyama.'],
            ['fotolib-pages', 510, 510, 'The FotoLib Kyoto page\u2019s list of what each album page includes, set as speech bubbles beside small illustrations of people.'],
            ['fotolib-plans', 510, 580, 'The FotoLib Kyoto page\u2019s two plans side by side, a \u201cCreate My Kyoto Album\u201d button, and the first of the six ordering steps.'],
        ],
        screens: {
            top: [
                ['pc-top-hero', 1440, 950, 'The Horita DM Clinic home page at desktop width: the header with the clinic’s phone number, online booking and LINE buttons, the hero with its consultation-hours table, and a notice banner.'],
                ['pc-top-features', 1440, 830, 'The home page’s “Features” section: three numbered reasons to choose the clinic, each with a photograph and a short paragraph.'],
                ['pc-top-service', 1440, 1350, 'The home page’s “Service” section: the diabetes and metabolic medicine departments as offset cards beside photographs.'],
                ['pc-top-diabetes', 1440, 1020, 'The home page’s “About diabetes” section: four headed columns — types, treatment, tests and medicines — each with an outline icon and a list of links.'],
            ],
            phone: [
                ['sp-top-1', 375, 1540, 'The home page on a phone, top: the hero with booking and LINE buttons, the notice, and the news list.'],
                ['sp-top-2', 375, 1577, 'The home page on a phone, middle: the clinic’s three features stacked, one under another, each with its photograph.'],
                ['sp-top-3', 375, 1402, 'The home page on a phone: the service section, with the two departments set as photograph and card.'],
                ['sp-top-4', 375, 1681, 'The home page on a phone: the diabetes section as four stacked, headed lists of links.'],
                ['sp-top-5', 375, 2157, 'The home page on a phone, foot: the director’s message, a map, and the footer navigation.'],
                ['sp-menu', 375, 645, 'The phone navigation panel: the page list, with a sub-list under “About the clinic”.'],
            ],
            inner: [
                ['pc-diabetes-page', 1440, 1330, 'The diabetes medicine page at desktop width: a banner, anchor links to its three sections, and a list of symptoms to see a doctor about.'],
                ['pc-diabetes-treatments', 1440, 1160, 'The diabetes page’s treatment section, with medication, exercise and diet each given a tile.'],
                ['pc-news-list', 1440, 1620, 'The news archive page at desktop width: each notice a row with its date, its title and an arrow, under a photographic banner.'],
            ],
        },
        /* The way out is the way in: back to the strip this came from. */
        next: {
            href: '../index.html#work',
            title: 'Back to Selected Work',
            aria: 'Back to Selected Work',
            back: true,
        },
    },

    {
        slug: 'nft-projects',
        no: '06',
        category: 'Creative Direction / Web3',
        short: 'NFT Projects',
        title: 'NFT Projects — End-to-End Creation & Management',
        summary:
            'Contributed to concept development, creative direction, project setup, ' +
            'execution, management, and coordination of NFT projects.',
        go: 'View the project',
        /* REPLACE: Dino The Diamond's artwork, set on its own flat grey so the
           card can crop it to either shape and the ground carries on. It is
           the placeholder for the cover; swap it for the real one, a 1600×1000
           upload on Cloudinary, when there is one. */
        cover: img('nft-projects', 'cover.webp'),
        coverAlt:
            'Dino The Diamond: a pink, crystal-headed creature with large dark eyes, three ' +
            'small flying saucers circling its head and a green gem at its feet.',
        href: 'work/nft-projects.html',

        /* The case study page: the project in its owner's own words, and where
           to find it. The blocks are src/case-studies/nft-projects.jsx. The
           cover is the page's cover as well, so it is replaced in one place. */
        caseTitle: 'Dino The Diamond',
        caseCategory: 'NFT Project',
        lead: 'Born from passion, creativity, and the joy of building something timeless.',
        coverCaption: 'Dino The Diamond.',
        facts: [
            ['Project', 'Dino The Diamond'],
            ['Type', 'NFT collection of 10,000'],
            ['Platform', 'OpenSea'],
            [
                'Collection',
                {
                    links: [
                        {
                            text: 'View on OpenSea',
                            href: 'https://opensea.io/collection/dino-the-diamond-2/overview',
                        },
                    ],
                },
            ],
        ],
        /* The picture the collection started from, which was found rather than
           made, so it is the page's own and not the cover. Name, width,
           height and alt, as the screens on the Japan page are. */
        inspiration: [
            'inspiration', 1024, 1024,
            'The inspiration image: a small blue creature with large eyes and a faceted, ' +
            'glowing crystal for a head, standing beside a green gem.',
        ],
        /* The way out is the way in: back to the strip this came from. */
        next: {
            href: '../index.html#work',
            title: 'Back to Selected Work',
            aria: 'Back to Selected Work',
            back: true,
        },
    },

    {
        slug: 'ai-video',
        no: '07',
        category: 'AI / Video Production',
        short: 'AI-Assisted Video',
        title: 'AI-Assisted Video Creation',
        summary:
            'Created videos using AI-powered tools for concept development, visual ' +
            'creation, and video production.',
        cover: cdn('v1789371083/7_kwczeb.png'),
        coverAlt: 'Cover image for the AI-assisted video creation work.',
        href: null,
    },
];

export const projectBySlug = (slug) => projects.find((p) => p.slug === slug);
