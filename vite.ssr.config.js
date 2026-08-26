import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The same components, compiled for Node so scripts/prerender.js can write
   each page to static HTML. Kept in its own config because the client build
   takes HTML files as its entries and an SSR build cannot. */
export default defineConfig({
    base: '/',
    plugins: [react()],
    build: {
        ssr: 'src/prerender.jsx',
        outDir: 'dist-ssr',
        emptyOutDir: true,
    },
});
