import voeplWebsite from './voepl-website.jsx';
import gemOpalus, { Opening as gemOpalusOpening } from './gem-opalus-identity.jsx';
import flowid from './flowid-collateral.jsx';
import wordpressJapan from './wordpress-japan.jsx';
import nft from './nft-projects.jsx';
import aiVideo from './ai-video.jsx';

export const caseBlocks = {
    'voepl-website': voeplWebsite,
    'gem-opalus-identity': gemOpalus,
    'flowid-collateral': flowid,
    'wordpress-japan': wordpressJapan,
    'nft-projects': nft,
    'ai-video': aiVideo,
};

export const caseOpenings = {
    'gem-opalus-identity': gemOpalusOpening,
};
