import { ArrowUpInline } from './Icons.jsx';
import Presence from './Presence.jsx';

/* The small pieces of page furniture that every page shares. */

export const SkipLink = () => (
    <a className="skip-link" href="#main">
        Skip to content
    </a>
);

export const Progress = () => (
    <>
        <div className="progress" id="progress" aria-hidden="true">
            <span className="progress__fill" />
        </div>
    </>
);

export const BackToTop = () => (
    <a href="#top">
        Back to top{' '}
        <ArrowUpInline />
    </a>
);

export const SiteFoot = () => (
    <footer className="site-foot">
        <BackToTop />
        <Presence />
    </footer>
);

/* The footer that closes a case study or the 404 page. */
export const PageFoot = ({ backToTop = true }) => (
    <footer className="page-foot">
        <div className="page-foot__inner">
            {backToTop && <BackToTop />}
            <Presence />
        </div>
    </footer>
);
