

const img = (slug, file) => `/assets/images/projects/${slug}/${file}`;

const cdn = (file) => `https://res.cloudinary.com/duhuxaukd/image/upload/${file}`;

export const projects = [
    {
        slug: 'voepl-website',
        no: '01',
        category: 'VOEPL',
        short: 'Corporate Website',
        title: 'Building a Corporate Digital Presence',
        /* The index entry on the home page. */
        summary:
            'Designed, built and wrote the corporate website of an Indian OEM/ODM ' +
            'electronics manufacturer on Odoo \u2014 structure, page layouts, responsive ' +
            'UI and all of the content \u2014 and maintain it.',
        meta: ['Web Design', 'UX', 'Information Architecture', 'Odoo', 'SEO'],
        go: 'Read the case study',
        cover: cdn('v1789371081/1_ivtwne.png'),
        tile: img('voepl-website', 'tile.webp'),
        coverAlt: 'Cover image for the VOEPL corporate website case study.',

        href: 'work/voepl-website.html',
        /* The case study page. */
        lead:
            'The corporate website of an Indian OEM/ODM electronics manufacturer, ' +
            'designed, built and written end to end on Odoo, and maintained since.',
        coverCaption: 'The VOEPL corporate website.',
        facts: [
            ['Role', 'Senior Executive, Digital Marketing & Design \u2014 design, build, content and upkeep'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            [
                'Live site',
                { links: [{ text: 'www.voepl.com', href: 'https://www.voepl.com' }] },
            ],
            ['Disciplines', 'Web Design · UX · Information Architecture · Odoo · SEO'],
            [
                'Areas of work',
                'Website design, publishing and maintenance; responsive layouts; product and capability presentation',
            ],
        ],

        gallery: [
            [img('voepl-website', '01.webp'), 'The VOEPL home page at desktop width: the navigation, the \u201cDesign, Manufacture, Delight\u201d hero and the opening company statement.'],
            [img('voepl-website', '02.webp'), 'The VOEPL \u201cOur Products\u201d page: air conditioners, LED lighting, water dispensers, commercial freezers, washing machines and compressors, each given an icon tile.'],
            [img('voepl-website', '03.webp'), 'The VOEPL website on a phone, three pages side by side: the home page, the products page and the electronics manufacturing services page.'],
        ],

        next: {
            href: '../index.html#contact',
            label: 'Next',
            title: 'Open to opportunities, get in touch',
            aria: 'Continue',
        },
    },

    {
        slug: 'gem-opalus-identity',
        no: '02',
        category: 'Brand Identity / Logo Design',
        short: 'Gem Opalus',
        title: 'Gem Opalus logo design and brand identity',
        summary:
            'Created the logo and overall brand identity, establishing a cohesive ' +
            'visual presence for the brand.',
        cover: cdn('v1789371081/2_cxup32.png'),
        tile: img('gem-opalus-identity', 'tile.webp'),
        coverAlt: 'Cover image for the Gem Opalus logo and brand identity project.',
        go: 'View the project',
        href: 'work/gem-opalus-identity.html',

        caseTitle: 'Gem Opalus',
        caseCategory: 'Logo Design & Brand Identity',
        caseCover: false,
        lead:
            'The logo and the whole brand identity for a gemstone trader and analyst: a ' +
            'gold-leaf symbol, a quiet palette and typography, and the rules that carry ' +
            'them from Instagram posts to stationery, packaging and signage.',
        facts: [
            ['Client', 'Gem Opalus'],
            ['Role', 'Logo design and brand identity'],
            [
                'Deliverables',
                'Logo system \u00b7 Colour and type \u00b7 Photography direction \u00b7 Stationery and packaging \u00b7 Social templates',
            ],
            [
                'Guidelines',
                {
                    links: [
                        {
                            text: 'Download the PDF',
                            href: '/assets/gem-opalus-brand-identity.pdf',
                        },
                    ],
                },
            ],
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
        slug: 'amanoya-mascot',
        no: '03',
        category: 'Character Design / Brand Identity',
        short: 'Amanoya Mascot',
        title: 'Amanoya mascot design, Japan',
        summary:
            'Designed and developed a mascot concept, contributing to the brand\u2019s ' +
            'visual identity and character development.',
        cover: cdn('v1789371082/4_dtll6y.png'),
        tile: img('amanoya-mascot', 'tile.webp'),
        coverAlt: 'Cover image for the Amanoya mascot creation project.',
        href: null,
    },

    {
        slug: 'flowid-collateral',
        no: '04',
        category: 'Graphic Design / Marketing Collateral',

        short: 'FLOWID Collateral',
        title: 'FLOWID brochure and banner design, Netherlands',
        summary:
            'Created brochures and banners aligned with the company\u2019s branding and ' +
            'communication requirements.',
        go: 'View the project',

        cover: cdn('v1790314212/Flowid_banner_csf5vg.jpg'),
        tile: img('flowid-collateral', 'tile.webp'),
        coverAlt: 'The FLOWID exhibition banner artwork.',
        href: 'work/flowid-collateral.html',

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
        title: 'WordPress website development, Japan',
        summary:
            'Delivered four WordPress websites for businesses in Japan, including Horita DM ' +
            'Clinic, Kuwahara Lab and FotoLib Kyoto, building supplied Figma designs into ' +
            'responsive sites and owning scope, timelines and QA through handover.',
        go: 'View the project',

        cover: img('wordpress-japan', 'cover.webp'),
        tile: img('wordpress-japan', 'tile.webp'),
        coverAlt:
            'Three websites for clients in Japan: the Horita DM Clinic home page at desktop ' +
            'width and on a phone, beside the top of the FotoLib Kyoto page.',
        href: 'work/wordpress-japan.html',

        caseTitle: 'WordPress Websites \u2014 Japan',
        caseCategory: 'WordPress Development',
        caseCover: false,
        lead:
            'Four WordPress websites for businesses in Japan, won through LinkedIn ' +
            'outreach and delivered between December 2025 and March 2026: a diabetes ' +
            'clinic in Gifu, built from supplied Figma designs for desktop and phone, ' +
            'and the Kuwahara Lab and FotoLib Kyoto sites.',
        facts: [
            ['Clients', 'Horita DM Clinic (\u5800\u7530DM\u30af\u30ea\u30cb\u30c3\u30af) \u00b7 Kuwahara Lab \u00b7 FotoLib Kyoto'],
            ['Location', 'Japan'],
            ['Role', 'Freelance web developer \u2014 Figma to WordPress'],
            ['Period', 'December 2025 \u2013 March 2026'],
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

        fotolib: [
            ['fotolib-hero', 780, 1189, 'The top of the FotoLib Kyoto page: an orange header, a photograph of a woman in a kimono on a Kyoto street, two album plans with their prices, and three photographs of Arashiyama.'],
            ['fotolib-pages', 780, 1133, 'The FotoLib Kyoto page\u2019s list of what each album page includes, set as speech bubbles beside small illustrations of people.'],
            ['fotolib-plans', 780, 1283, 'The FotoLib Kyoto page\u2019s two plans side by side, a \u201cCreate My Kyoto Album\u201d button, and the first of the six ordering steps.'],
        ],

        kuwahara: [
            ['kuwahara-pc', 1440, 1080, 'The Kuwahara Lab blog at desktop width: the Kuwahara Lab logo and search, a row of navigation links, a carousel of featured articles and the start of the recommended-topics section.'],
            ['kuwahara-sp', 780, 1688, 'The Kuwahara Lab blog on a phone: the logo, search box and menu button above the featured-article carousel and the first recommended topic.'],
        ],
        screens: {
            top: [
                ['pc-top-hero', 1440, 950, 'The Horita DM Clinic home page at desktop width: the header with the clinic’s phone number, online booking and LINE buttons, the hero with its consultation-hours table, and a notice banner.'],
                ['pc-top-features', 1440, 830, 'The home page’s “Features” section: three numbered reasons to choose the clinic, each with a photograph and a short paragraph.'],
                ['pc-top-service', 1440, 1350, 'The home page’s “Service” section: the diabetes and metabolic medicine departments as offset cards beside photographs.'],
                ['pc-top-diabetes', 1440, 1020, 'The home page’s “About diabetes” section: four headed columns, types, treatment, tests and medicines, each with an outline icon and a list of links.'],
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
        title: 'NFT projects, from creation to management',
        summary:
            'Contributed to concept development, creative direction, project setup, ' +
            'execution, management, and coordination of NFT projects.',
        go: 'View the project',

        cover: img('nft-projects', 'cover.webp'),
        tile: img('nft-projects', 'tile.webp'),
        coverAlt:
            'Dino The Diamond: a pink, crystal-headed creature with large dark eyes, three ' +
            'small flying saucers circling its head and a green gem at its feet.',
        href: 'work/nft-projects.html',

        caseTitle: 'Dino The Diamond',
        caseCategory: 'NFT Project',
        lead: 'Born from passion, creativity, and the joy of building something timeless.',
        coverCaption: 'Dino The Diamond. The cover artwork is being updated.',
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
            'Created videos for the VOEPL HSE department using AI-powered tools for ' +
            'concept development, visual creation, and video production.',
        go: 'Watch the videos',

        carousel: false,
        cover: cdn('v1789371083/7_kwczeb.png'),
        coverAlt: 'Cover image for the AI-assisted video creation work.',
        href: 'work/ai-video.html',

        /* The case study page. The blocks are src/case-studies/ai-video.jsx. */
        caseTitle: 'AI-Assisted Video for the HSE Department',
        caseCategory: 'AI / Video Production',
        lead:
            'Videos made with AI-powered tools for the Health, Safety and Environment ' +
            'department at VOEPL, from concept to finished video.',
        coverCaption: 'AI-assisted video creation for the VOEPL HSE department.',
        facts: [
            ['Role', 'Video creation, concept, visuals and production'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            ['Department', 'Health, Safety and Environment (HSE)'],
            ['Method', 'AI-assisted'],
        ],

        videos: [
            { title: 'Film 01 \u2014 uploading soon', note: 'Made for the HSE department with AI-assisted tools. Being prepared for upload.', provider: 'youtube', id: null },
            { title: 'Film 02 \u2014 uploading soon', note: 'Made for the HSE department with AI-assisted tools. Being prepared for upload.', provider: 'youtube', id: null },
            { title: 'Film 03 \u2014 uploading soon', note: 'Made for the HSE department with AI-assisted tools. Being prepared for upload.', provider: 'youtube', id: null },
        ],

        /* The way out is the way in: back to the strip this came from. */
        next: {
            href: '../index.html#work',
            title: 'Back to Selected Work',
            aria: 'Back to Selected Work',
            back: true,
        },
    },
];

export const carouselProjects = projects.filter((p) => p.carousel !== false);

export const projectBySlug = (slug) => projects.find((p) => p.slug === slug);
