import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

/* Every page is written to static HTML at build time (scripts/prerender.js)
   and then picked up here, so the document a reader — or a crawler — receives
   is complete before any JavaScript runs. The dev server has nothing to pick
   up, so it renders from scratch instead. */
export default function mount(element) {
    const container = document.getElementById('root');
    const tree = <StrictMode>{element}</StrictMode>;

    if (import.meta.env.PROD) hydrateRoot(container, tree);
    else createRoot(container).render(tree);
}
