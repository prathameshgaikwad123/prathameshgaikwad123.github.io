

const slugs = ['voepl-website', 'gem-opalus-identity', 'flowid-collateral', 'wordpress-japan', 'nft-projects', 'ai-video'];

export const PAGES = [
    { id: 'home', file: 'index.html', kind: 'home' },
    { id: 'notfound', file: '404.html', kind: 'notfound' },
    ...slugs.map((slug) => ({ id: `work/${slug}`, file: `work/${slug}.html`, kind: 'case', slug })),
];
