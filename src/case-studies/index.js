import voeplWebsite from './voepl-website.jsx';
import voeplBrandSystem from './voepl-brand-system.jsx';
import safetyDojo from './safety-dojo.jsx';
import digitalCommunication from './digital-communication.jsx';
import webAiDiscovery from './web-ai-discovery.jsx';
import archive from './archive.jsx';

/* The written body of each case study. Everything else about a project —
   its number, title, facts, plates — lives in src/data/projects.js, so the
   shell in CaseStudy.jsx is the same for all six. */
export const caseBlocks = {
    'voepl-website': voeplWebsite,
    'voepl-brand-system': voeplBrandSystem,
    'safety-dojo': safetyDojo,
    'digital-communication': digitalCommunication,
    'web-ai-discovery': webAiDiscovery,
    archive,
};
