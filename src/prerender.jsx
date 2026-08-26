import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';

import App from './App.jsx';
import CaseStudy from './CaseStudy.jsx';
import NotFound from './NotFound.jsx';

/* Run at build time by scripts/prerender.js. Each page is written into its
   built HTML file so the published site is still a set of complete
   documents: readable with JavaScript off, and crawlable by anything that
   does not run it. React picks the same markup back up in the browser. */
export function render(page) {
    if (page.kind === 'home') return renderToString(<StrictMode><App /></StrictMode>);
    if (page.kind === 'notfound') return renderToString(<StrictMode><NotFound /></StrictMode>);
    return renderToString(
        <StrictMode>
            <CaseStudy slug={page.slug} />
        </StrictMode>,
    );
}

export { PAGES } from './data/pages.js';
