/* The pages the site publishes. Shared by the Vite build (which needs one
   HTML entry per page) and the prerender step (which needs to know which
   React tree belongs to which built file). */

/* The projects that have a case study behind them, which is not every
   project in src/data/projects.js — a project there without an `href`
   is a card in the carousel and nothing else, and publishes no page.
   Adding one here means adding its written body to
   src/case-studies/index.js and its `href` to the project record. */
const slugs = ['voepl-website'];

export const PAGES = [
    { id: 'home', file: 'index.html', kind: 'home' },
    { id: 'notfound', file: '404.html', kind: 'notfound' },
    ...slugs.map((slug) => ({ id: `work/${slug}`, file: `work/${slug}.html`, kind: 'case', slug })),
];
