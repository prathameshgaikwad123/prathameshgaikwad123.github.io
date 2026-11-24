/* ===================================================================
   EXPERIENCE
   Everything on the home page's Experience band, written once. Every
   line is taken from the résumé (Brand & Digital Designer, 2026) —
   nothing here is added to it. If the résumé changes, change it here.

   A bullet is [lead, rest]: the lead is set in the heavier ink, the way
   the résumé bolds it, and the rest follows. A bullet with no rest is
   just a lead.
   =================================================================== */

export const SUMMARY =
    'Brand and digital designer with five years of in-house, consultancy and freelance ' +
    'experience, working as a one-person design team for B2B manufacturing, healthcare and ' +
    'lifestyle brands. I build brand systems, websites, corporate presentations, product ' +
    'catalogues, print and motion from first concept to launch, and I build the web work ' +
    'too, in HTML, CSS, JavaScript, WordPress and Odoo.';

/* Three figures from the résumé, nothing rounded up. */
export const FIGURES = [
    { value: '5', label: 'Years in design' },
    { value: '5,300+', label: 'LinkedIn followers, up from about 300' },
    { value: '4', label: 'Client sites delivered in Japan' },
];

export const ROLES = [
    {
        id: 'voepl',
        when: 'Apr 2024 — Present',
        title: 'Senior Executive, Digital Marketing & Design',
        org: 'Virtuoso Optoelectronics Limited (VOEPL)',
        place: 'Nashik, India · OEM/ODM/EMS electronics manufacturer',
        points: [
            ['Owns the company’s visual identity across print and digital:', ' brand guidelines, corporate presentations, company profiles, brochures, product catalogues and advertisements.'],
            ['Designed, built and wrote the corporate website end to end on Odoo:', ' site structure, page layouts, responsive UI and all page content, adding custom HTML, CSS and JavaScript where the platform falls short, and maintains it.'],
            ['Turns complex engineering products into clear B2B communication:', ' catalogues, product visuals and sales collateral for air conditioners, LED lighting, EMS, water dispensers and commercial freezers.'],
            ['Designs campaign creative:', ' LinkedIn campaigns, product promotions, newspaper ads, product stickers and signage.'],
            ['Creates motion and film:', ' code-rendered brand films with hand-rigged vector characters, and AI training films.'],
            ['Planned a dedicated laboratory-testing website:', ' structure, testing-category pages and enquiry journeys.'],
            ['Designs internal communication:', ' induction and HSE presentations, email signatures and employee ID cards.'],
            ['Grew the company LinkedIn page from about 300 to 5,300+ followers', ' through a consistent design programme.'],
        ],
    },
    {
        id: 'freelance',
        when: 'Dec 2025 — Mar 2026',
        title: 'Freelance Web Developer, Figma to WordPress',
        org: 'Clients in Japan',
        place: 'Remote, alongside the full-time role',
        points: [
            ['Delivered 4 client websites and several smaller WordPress projects', ' for Japanese businesses, including Horita DM Clinic (Gifu), FotoLib Kyoto and Kuwahara Lab; won through LinkedIn outreach.'],
            ['Built responsive sites faithful to supplied Figma designs;', ' owned client communication, scope, timelines and QA through handover.'],
        ],
    },
    {
        id: 'soch',
        when: 'Sep 2021 — Apr 2024',
        title: 'Graphic Designer (Intern to Associate)',
        org: 'SOCH Business Mentors LLP',
        place: 'Surat, India',
        points: [
            ['Promoted from intern to Associate within 6 months;', ' owned design deliverables across multiple client brands.'],
            ['Designed logos and brand identities, social media post systems and campaigns, pitch and business presentations, and print collateral', ' (brochures, flyers, banners) for client businesses.'],
            ['Led website design, SEO and launch visuals end to end', ' for a year-long digital collectibles (NFT) project.'],
            ['Built reusable brand templates', ' that kept multi-brand output consistent and faster to produce.'],
        ],
    },
];

export const SKILLS = [
    {
        group: 'Design',
        items: ['Brand Identity', 'Logo Design', 'Brand Guidelines', 'Typography', 'Layout', 'Presentation Design', 'Print Production', 'Packaging', 'Motion Graphics'],
    },
    {
        group: 'UI & Web',
        items: ['Figma', 'Responsive Web', 'Wireframing', 'Prototyping', 'HTML', 'CSS', 'JavaScript', 'React', 'WordPress', 'Odoo'],
    },
    {
        group: 'Tools',
        items: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Premiere Pro', 'CorelDRAW', 'Procreate', 'PowerPoint', 'GSAP'],
    },
    {
        group: 'AI',
        items: ['AI-assisted image and video production (Google Veo, ElevenLabs)', 'Claude Code'],
    },
];

export const EDUCATION = [
    {
        id: 'be',
        title: 'B.E., Mechanical Engineering',
        where: 'Sinhgad College of Engineering, Pune',
        note: 'CGPA 8.5',
        when: '2019 — 2021',
    },
    {
        id: 'diploma',
        title: 'Diploma, Mechanical Engineering',
        where: 'Sandip Institute of Engineering & Management, Nashik',
        when: '2016 — 2018',
    },
    {
        id: 'ux',
        title: 'Google UX Design Professional Certificate',
        where: 'Google / Coursera',
        when: 'Feb 2026',
    },
    {
        id: 'pm',
        title: 'Project Management Certificate',
        where: 'Coursera',
    },
];

export const LANGUAGES = [
    ['English', 'Professional'],
    ['Hindi'],
    ['Marathi'],
    ['Gujarati'],
];
