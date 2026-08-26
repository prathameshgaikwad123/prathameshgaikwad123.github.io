/* The pages the site publishes. Shared by the Vite build (which needs one
   HTML entry per page) and the prerender step (which needs to know which
   React tree belongs to which built file). */

const slugs = [
    'voepl-website',
    'voepl-brand-system',
    'safety-dojo',
    'digital-communication',
    'web-ai-discovery',
    'archive',
];

export const PAGES = [
    { id: 'home', file: 'index.html', kind: 'home' },
    { id: 'notfound', file: '404.html', kind: 'notfound' },
    ...slugs.map((slug) => ({ id: `work/${slug}`, file: `work/${slug}.html`, kind: 'case', slug })),
];
