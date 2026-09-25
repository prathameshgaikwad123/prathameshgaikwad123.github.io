import voeplWebsite from './voepl-website.jsx';
import flowid from './flowid-collateral.jsx';

/* The written body of each case study. Everything else about a project —
   its number, title, facts, plates — lives in src/data/projects.js, so the
   shell in CaseStudy.jsx is the same whatever is added here.

   One entry, because one project has a written case study. The rest of
   the carousel is covers and captions until there is something written to
   put behind them; the keys here, the slugs in src/data/pages.js and
   the `href` on the project record are the three places that change
   together when there is. */
export const caseBlocks = {
    'voepl-website': voeplWebsite,
};

/* A project that is shown rather than written. It keeps the shell —
   the masthead, the navigation, the lightbox, the closing plate and the
   footer — and brings its own page in place of the hero, the cover and
   the blocks, which are the parts of a case study that are about
   prose. The same three places change together as for a written one;
   this map stands in for the one above. */
export const caseViews = {
    'flowid-collateral': flowid,
};
