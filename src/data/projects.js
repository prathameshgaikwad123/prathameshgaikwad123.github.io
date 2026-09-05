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

/* REPLACE: every path below points at a labelled SVG placeholder in
   public/assets/images/projects/. Swap the extension here when you drop in
   a real 1600×1000 cover or 1400×1050 gallery plate, and rewrite the alt
   text next to it. */
const img = (slug, file) => `/assets/images/projects/${slug}/${file}`;

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
        cover: img('voepl-website', 'cover.svg'),
        coverAlt: 'Placeholder for the VOEPL corporate website case study cover image.',
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
        cover: img('gem-opalus-identity', 'cover.svg'),
        coverAlt: 'Placeholder for the Gem Opalus logo and brand identity project.',
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
        cover: img('amanoya-mascot', 'cover.svg'),
        coverAlt: 'Placeholder for the Amanoya mascot creation project.',
        href: null,
    },

    {
        slug: 'flowid-collateral',
        no: '04',
        category: 'Graphic Design / Marketing Collateral',
        short: 'FlowID Collateral',
        title: 'Brochure & Banner Design — FlowID, Netherlands',
        summary:
            'Created brochures and banners aligned with the company\u2019s branding and ' +
            'communication requirements.',
        cover: img('flowid-collateral', 'cover.svg'),
        coverAlt: 'Placeholder for the FlowID brochure and banner design project.',
        href: null,
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
        cover: img('wordpress-japan', 'cover.svg'),
        coverAlt: 'Placeholder for the WordPress website development project.',
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
        cover: img('nft-projects', 'cover.svg'),
        coverAlt: 'Placeholder for the NFT projects creation and management work.',
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
        cover: img('ai-video', 'cover.svg'),
        coverAlt: 'Placeholder for the AI-assisted video creation work.',
        href: null,
    },
];

export const projectBySlug = (slug) => projects.find((p) => p.slug === slug);
