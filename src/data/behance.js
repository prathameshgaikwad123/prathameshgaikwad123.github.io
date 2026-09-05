/* ===================================================================
   SELECTED BEHANCE WORK
   One record per plate in the Behance spread on the home page. The
   section is a gallery rather than an index — nothing here has a case
   study behind it — so a record is only what the spread needs: the
   plate, what to call it, what it is, and where it goes.

   REPLACE: every `cover` below points at a labelled SVG placeholder in
   public/assets/images/behance/, and every `href` points at the profile
   rather than at a project, because a project URL cannot be invented.
   Replace both together — the cover with a real 1600×1200 export (swap
   the extension here) and the href with that project's own Behance URL
   — and rewrite the `alt` beside it. See ASSETS.md and CONTENT-TODO.md.
   =================================================================== */

export const BEHANCE_PROFILE = 'https://www.behance.net/prathamgaikwad1';

const plate = (file) => `/assets/images/behance/${file}`;

/* `span` and `drop` are the composition, not data about the project:
   how many of the twelve columns a plate takes on a wide screen, and
   how far down the spread it starts. Authored in pairs so no two
   neighbours are the same width and no row sits level — which is what
   makes six plates read as a spread rather than as six cards. Both are
   ignored below the tablet step, where the spread is one column. */
export const behance = [
    {
        id: 'brand-campaign',
        no: '01',
        title: 'Brand & Campaign Visuals',
        type: 'Brand · Campaign',
        href: BEHANCE_PROFILE,
        cover: plate('01-brand-campaign.svg'),
        alt: 'Placeholder for a Behance project of brand and campaign visuals.',
        span: 7,
        drop: 0,
    },
    {
        id: 'web-ui',
        no: '02',
        title: 'Web & Interface Explorations',
        type: 'UI · Web',
        href: BEHANCE_PROFILE,
        cover: plate('02-web-ui.svg'),
        alt: 'Placeholder for a Behance project of web and interface explorations.',
        span: 5,
        drop: 5,
    },
    {
        id: 'social-systems',
        no: '03',
        title: 'Social Media Design Systems',
        type: 'Social · Systems',
        href: BEHANCE_PROFILE,
        cover: plate('03-social-systems.svg'),
        alt: 'Placeholder for a Behance project of social media design systems.',
        span: 5,
        drop: 4,
    },
    {
        id: 'print-collateral',
        no: '04',
        title: 'Print & Corporate Collateral',
        type: 'Print · Collateral',
        href: BEHANCE_PROFILE,
        cover: plate('04-print-collateral.svg'),
        alt: 'Placeholder for a Behance project of print and corporate collateral.',
        span: 7,
        drop: 0,
    },
    {
        id: 'visual-studies',
        no: '05',
        title: 'Visual & Typographic Studies',
        type: 'Type · Visual',
        href: BEHANCE_PROFILE,
        cover: plate('05-visual-studies.svg'),
        alt: 'Placeholder for a Behance project of visual and typographic studies.',
        span: 6,
        drop: 0,
    },
    {
        id: 'motion-concepts',
        no: '06',
        title: 'Motion & Concept Work',
        type: 'Motion · Concept',
        href: BEHANCE_PROFILE,
        cover: plate('06-motion-concepts.svg'),
        alt: 'Placeholder for a Behance project of motion and concept work.',
        span: 6,
        drop: 3,
    },
];
