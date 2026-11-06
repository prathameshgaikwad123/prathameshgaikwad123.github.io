import voeplWebsite from './voepl-website.jsx';
import gemOpalus from './gem-opalus-identity.jsx';
import flowid from './flowid-collateral.jsx';
import wordpressJapan from './wordpress-japan.jsx';
import nft from './nft-projects.jsx';
import aiVideo from './ai-video.jsx';

/* The written body of each case study. Everything else about a project —
   its number, title, facts, plates — lives in src/data/projects.js, so the
   shell in CaseStudy.jsx is the same whatever is added here.

   Six entries, because six projects have a case study. The rest of the
   carousel is covers and captions until there is something written to
   put behind them; the keys here, the slugs in src/data/pages.js and
   the `href` on the project record are the three places that change
   together when there is. */
export const caseBlocks = {
    'voepl-website': voeplWebsite,
    'gem-opalus-identity': gemOpalus,
    'flowid-collateral': flowid,
    'wordpress-japan': wordpressJapan,
    'nft-projects': nft,
    'ai-video': aiVideo,
};
