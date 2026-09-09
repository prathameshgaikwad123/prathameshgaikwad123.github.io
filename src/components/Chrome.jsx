import { ArrowUpInline } from './Icons.jsx';
import Presence from './Presence.jsx';

/* The small pieces of page furniture that every page shares. */

export const SkipLink = () => (
    <a className="skip-link" href="#main">
        Skip to content
    </a>
);

export const Progress = () => <div className="progress progress--bar" id="progress" aria-hidden="true" />;

export const BackToTop = () => (
    <a href="#top">
        Back to top{' '}
        <ArrowUpInline />
    </a>
);

/* The footer inside the contact band on the home page. Presence is
   last in both footers because it is last on the page: everything above
   it is fixed, and this is the one line that is about the moment it is
   being read. It rules itself out of the markup until it has something
   true to say — src/components/Presence.jsx. */
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
