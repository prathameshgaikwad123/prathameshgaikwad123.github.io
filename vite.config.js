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
                   happened to pull it in. */
                advancedChunks: {
                    groups: [{ name: 'vendor', test: /node_modules/ }],
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
