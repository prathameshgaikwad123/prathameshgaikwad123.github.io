/* ===================================================================
   SELECTED WORK
   One record per project. The work index on the home page and the case
   study pages are both built from this, so a project is described once —
   including the path of every plate, which is where you change a
   placeholder's extension when you replace it. See ASSETS.md.
   =================================================================== */

/* REPLACE: every path below points at a labelled SVG placeholder in
   public/assets/images/projects/. Swap the extension here when you drop in
   a real 1600×1000 cover or 1400×1050 gallery plate, and rewrite the alt
   text next to it. */
const img = (slug, file) => `/assets/images/projects/${slug}/${file}`;

export const projects = [
    {
        slug: 'voepl-website',
        no: '01',
        category: 'VOEPL',
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
        next: {
            href: 'voepl-brand-system.html',
            label: 'Next project — 02',
            title: 'Designing a Connected Corporate Visual System',
        },
    },

    {
        slug: 'voepl-brand-system',
        no: '02',
        category: 'VOEPL',
        title: 'Designing a Connected Corporate Visual System',
        summary:
            'Designing consistent visual communication across multiple touchpoints ' +
            'of a manufacturing organisation.',
        meta: ['Brand Systems', 'Visual Design', 'Corporate Communication'],
        go: 'Read the case study',
        cover: img('voepl-brand-system', 'cover.svg'),
        coverAlt: 'Placeholder for the VOEPL corporate visual system case study cover image.',
        lead:
            'Designing consistent visual communication across multiple touchpoints of a ' +
            'manufacturing organisation.',
        coverCaption: 'Placeholder — replace with an overview showing several touchpoints together.',
        facts: [
            ['Role', 'Digital Marketing Executive — visual design and corporate communication'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            ['Disciplines', 'Brand Systems · Visual Design · Corporate Communication'],
            [
                'Areas of work',
                'Presentations, product communication, print collateral, internal and HR materials, event design',
            ],
        ],
        gallery: [
            [
                img('voepl-brand-system', '01.svg'),
                'Placeholder for corporate presentation and product communication design.',
            ],
            [img('voepl-brand-system', '02.svg'), 'Placeholder for brochure, catalogue and fact sheet design.'],
            [
                img('voepl-brand-system', '03.svg'),
                'Placeholder for internal communication and HR induction material.',
            ],
        ],
        next: {
            href: 'safety-dojo.html',
            label: 'Next project — 03',
            title: 'Making Safety Communication More Memorable',
        },
    },

    {
        slug: 'safety-dojo',
        no: '03',
        category: 'Safety Dojo',
        title: 'Making Safety Communication More Memorable',
        summary:
            'Developing a modern visual safety awareness system designed to make ' +
            'important workplace messages clearer, more engaging and easier to remember.',
        meta: ['Creative Direction', 'Campaign Design', 'Visual Communication'],
        go: 'Read the case study',
        cover: img('safety-dojo', 'cover.svg'),
        coverAlt: 'Placeholder for the Safety Dojo campaign case study cover image.',
        lead:
            'Developing a modern visual safety awareness system designed to make important ' +
            'workplace messages clearer, more engaging and easier to remember.',
        coverCaption: 'Placeholder — replace with the series shown together, so the system reads first.',
        facts: [
            ['Role', 'Creative direction and design'],
            /* The owning organisation is still to be confirmed; the marker is
               carried through rather than filled in. */
            [
                'Programme',
                { text: 'Safety Dojo — ', tbd: 'confirm the owning organisation', todo: 'safety-dojo-owner' },
            ],
            ['Disciplines', 'Creative Direction · Campaign Design · Visual Communication'],
            ['Format', 'A connected series of industrial safety posters'],
        ],
        gallery: [
            [img('safety-dojo', '01.svg'), 'Placeholder for the Safety Dojo poster series shown together.'],
            [img('safety-dojo', '02.svg'), 'Placeholder for an individual Safety Dojo poster.'],
            [
                img('safety-dojo', '03.svg'),
                'Placeholder for Safety Dojo illustration and visual language detail.',
            ],
        ],
        next: {
            href: 'digital-communication.html',
            label: 'Next project — 04',
            title: "Growing a Manufacturing Brand's Digital Presence",
        },
    },

    {
        slug: 'digital-communication',
        no: '04',
        category: 'Digital Communication',
        title: "Growing a Manufacturing Brand's Digital Presence",
        summary:
            "Contributed to the growth of VOEPL's LinkedIn audience from approximately " +
            '300 to 1,600+ followers through consistent visual communication and content.',
        meta: ['Content Design', 'Social Media', 'Visual Communication'],
        go: 'Read the case study',
        cover: img('digital-communication', 'cover.svg'),
        coverAlt: 'Placeholder for the digital communication case study cover image.',
        lead:
            "Contributed to the growth of VOEPL's LinkedIn audience from approximately " +
            '300 to 1,600+ followers through consistent visual communication and content.',
        coverCaption: 'Placeholder — replace with a grid of posts showing the visual consistency.',
        facts: [
            ['Role', 'Digital Marketing Executive — content design and visual communication'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            ['Disciplines', 'Content Design · Social Media · Visual Communication'],
            ['Channel', 'LinkedIn'],
        ],
        gallery: [
            [
                img('digital-communication', '01.svg'),
                'Placeholder for a grid of LinkedIn posts showing visual consistency.',
            ],
            [
                img('digital-communication', '02.svg'),
                'Placeholder for an individual product communication post.',
            ],
            [img('digital-communication', '03.svg'), 'Placeholder for a recurring post format.'],
        ],
        next: {
            href: 'web-ai-discovery.html',
            label: 'Next project — 05',
            title: 'Designing for Search and AI Discovery',
        },
    },

    {
        slug: 'web-ai-discovery',
        no: '05',
        category: 'The Evolving Web',
        title: 'Designing for Search and AI Discovery',
        summary:
            'Exploring how websites can be structured for traditional search while ' +
            'adapting to emerging AI-driven discovery experiences.',
        meta: ['SEO', 'Web Strategy', 'AEO Research'],
        go: 'Read the case study',
        cover: img('web-ai-discovery', 'cover.svg'),
        coverAlt: 'Placeholder for the search and AI discovery case study cover image.',
        lead:
            'Exploring how websites can be structured for traditional search while ' +
            'adapting to emerging AI-driven discovery experiences.',
        coverCaption:
            'Placeholder — a diagram of site structure or content hierarchy suits this page better than a screenshot.',
        facts: [
            ['Role', 'Digital Marketing Executive — SEO, web strategy and research'],
            ['Organisation', 'Virtuoso Optoelectronics Limited (VOEPL)'],
            ['Disciplines', 'SEO · Web Strategy · AEO Research'],
            ['Nature of the work', 'Ongoing optimisation work plus independent research — not a finished product'],
        ],
        gallery: [
            [img('web-ai-discovery', '01.svg'), 'Placeholder for a site structure or sitemap diagram.'],
            [
                img('web-ai-discovery', '02.svg'),
                'Placeholder for a content hierarchy or structured data example.',
            ],
            [
                img('web-ai-discovery', '03.svg'),
                'Placeholder for technical optimisation notes or research findings.',
            ],
        ],
        next: {
            href: 'archive.html',
            label: 'Next project — 06',
            title: 'Websites, Digital Projects & Earlier Work',
        },
    },

    {
        slug: 'archive',
        no: '06',
        category: 'Selected Archive',
        title: 'Websites, Digital Projects & Earlier Work',
        summary:
            'Selected earlier work across websites, digital projects, graphic design ' +
            'and social media — including work from Soch Business Mentors LLP.',
        meta: ['Web Design', 'Graphic Design', 'Social Media'],
        go: 'View the archive',
        cover: img('archive', 'cover.svg'),
        coverAlt: 'Placeholder for the selected archive case study cover image.',
        /* The archive cover carries its own alt text on the case page. */
        caseCoverAlt: 'Placeholder for the selected archive cover image.',
        lead:
            'Selected earlier work across websites, digital projects, graphic design and ' +
            'social media — including work from Soch Business Mentors LLP.',
        coverCaption: 'Placeholder — a composite of several earlier pieces works well here.',
        facts: [
            ['Role', 'Graphic Designer & Social Media Manager'],
            ['Organisation', 'Soch Business Mentors LLP'],
            ['Disciplines', 'Web Design · Graphic Design · Social Media'],
            ['Nature of this page', 'An archive rather than a single case study'],
        ],
        gallery: [
            [img('archive', '01.svg'), 'Placeholder for an earlier website project.'],
            [img('archive', '02.svg'), 'Placeholder for earlier graphic design work.'],
            [img('archive', '03.svg'), 'Placeholder for earlier social media design work.'],
        ],
        next: {
            href: '../index.html#contact',
            label: 'Next',
            title: 'Open to Opportunities — get in touch',
            aria: 'Continue',
        },
    },
];

export const projectBySlug = (slug) => projects.find((p) => p.slug === slug);
