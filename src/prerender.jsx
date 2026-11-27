import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';

import App from './App.jsx';
import CaseStudy from './CaseStudy.jsx';
import NotFound from './NotFound.jsx';

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
