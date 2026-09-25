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
            'Developed WordPress websites from provided Figma designs, translating UI ' +
            'designs into functional and responsive websites.',
        cover: cdn('v1789371081/5_sfpk7n.png'),
        coverAlt: 'Cover image for the WordPress website development project.',
        href: null,
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
        cover: cdn('v1789371082/6_unamem.png'),
        coverAlt: 'Cover image for the NFT projects creation and management work.',
        href: null,
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
