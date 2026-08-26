/* Writes each page's markup into its built HTML file.
   Runs after `vite build` (the client bundle) and `vite build --ssr` (the
   same components, compiled for Node). */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const MOUNT = '<div id="root"';

const { render, PAGES } = await import(resolve(root, 'dist-ssr/prerender.js'));

for (const page of PAGES) {
    const file = resolve(root, 'dist', page.file);
    const html = await readFile(file, 'utf8');

    const open = html.indexOf(MOUNT);
    const close = open === -1 ? -1 : html.indexOf('>', open);
    if (close === -1) throw new Error(`No mount point found in ${page.file}`);

    const endTag = '</div>';
    const end = html.indexOf(endTag, close);
    if (end === -1) throw new Error(`Unclosed mount point in ${page.file}`);

    const filled = `${html.slice(0, close + 1)}${render(page)}${html.slice(end)}`;
    await writeFile(file, filled);
    process.stdout.write(`prerendered  ${page.file}\n`);
}
