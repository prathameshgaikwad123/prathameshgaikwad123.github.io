import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from './src/data/pages.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const page = (file) => resolve(root, file);

/* The site is a user GitHub Pages site served from the domain root, so the
   base stays "/" and every asset path in the source is already correct.

   It is also built as a multi-page app rather than a single-page one. That
   keeps the published URLs exactly as they are (/work/<slug>.html), needs no
   404 rewrite trick on GitHub Pages, and — because navigation between pages
   is still a real document navigation — keeps the cross-document view
   transition on the project covers working. */
export default defineConfig({
    base: '/',
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        /* Kept out of /assets, which is the site's own folder of images,
           icons and social cards and is served from public/ untouched. */
        assetsDir: '_build',
        rollupOptions: {
            input: Object.fromEntries(PAGES.map((p) => [p.id, page(p.file)])),
            output: {
                /* Otherwise the shared chunk is named after whichever module
                   happened to pull it in.

                   Framer Motion gets a chunk of its own. Only the work index
                   on the home page animates, and vendor is loaded by every
                   page — including six case studies that would otherwise pay
                   for an animation library they never call. Its two internal
                   packages go with it, or vendor ends up importing them back.

                   React is named first, and named vendor, only so that the
                   motion group cannot claim it: the first matching group wins,
                   and react/jsx-runtime reaches the graph through Framer
                   Motion as well, which is enough to pull all of React into
                   the motion chunk and undo the split. Same-named groups
                   become one chunk, so vendor is still one file. */
                advancedChunks: {
                    groups: [
                        { name: 'vendor', test: /node_modules[\\/]react/ },
                        {
                            name: 'motion',
                            test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
                        },
                        /* GSAP has two callers now, and they ask on
                           different terms. The scroll choreography wants it
                           only once the home page has decided it is going
                           to move — a wide enough window, and a reader who
                           has not asked for less motion. The navigation
                           wants it on every page at every width, still only
                           for a reader who wants motion, and without
                           ScrollTrigger — which is why the two loaders are
                           separate and why six case studies do not pay for
                           a scroll system they never scrub.

                           One chunk serves both, because both ask for it
                           at run time. Naming it keeps that visible in the
                           network panel rather than hiding it inside
                           vendor. */
                        { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/ },
                        { name: 'vendor', test: /node_modules/ },
                    ],
                },
                /* Likewise the stylesheet, which is the design system and
                   deserves to be recognisable in the network panel. */
                assetFileNames: (info) => {
                    const name = (info.names && info.names[0]) || info.name || '';
                    return name.endsWith('.css')
                        ? '_build/style-[hash][extname]'
                        : '_build/[name]-[hash][extname]';
                },
            },
        },
    },
});
