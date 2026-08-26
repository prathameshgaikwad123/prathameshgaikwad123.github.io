import { useEffect, useState } from 'react';
import { SITE } from '../data/site.js';
import { ArrowUpInline } from './Icons.jsx';

/* The small pieces of page furniture that every page shares. */

export const SkipLink = () => (
    <a className="skip-link" href="#main">
        Skip to content
    </a>
);

export const Progress = () => <div className="progress progress--bar" id="progress" aria-hidden="true" />;

/* The copyright year. The prerendered HTML carries the year the site was
   written, exactly as the hand-written build did, and the real one is put in
   once the page is running. */
export function Year() {
    const [year, setYear] = useState(SITE.year);
    useEffect(() => setYear(new Date().getFullYear()), []);
    return <span id="year">{year}</span>;
}

export const Colophon = () => (
    <>
        <p>
            © <Year /> {SITE.name} — {SITE.role}
        </p>
        <p>Designed and built by {SITE.name}</p>
    </>
);

export const BackToTop = () => (
    <a href="#top">
        Back to top{' '}
        <ArrowUpInline />
    </a>
);

/* The footer inside the contact band on the home page. */
export const SiteFoot = () => (
    <footer className="site-foot">
        <Colophon />
        <BackToTop />
    </footer>
);

/* The footer that closes a case study or the 404 page. */
export const PageFoot = ({ backToTop = true }) => (
    <footer className="page-foot">
        <div className="page-foot__inner">
            <Colophon />
            {backToTop && <BackToTop />}
        </div>
    </footer>
);
