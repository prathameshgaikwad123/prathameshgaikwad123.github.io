import { ArrowUpInline } from './Icons.jsx';
import Presence from './Presence.jsx';

/* The small pieces of page furniture that every page shares. */

export const SkipLink = () => (
    <a className="skip-link" href="#main">
        Skip to content
    </a>
);

/* The reading line, and the folio that reads it.

   The line is what it has always been: two pixels across the top of the
   window, filling with the reader's progress down the document. It
   carried a tick per band for a while, hung under the line so the fill
   passed over their heads; at the top of a page, where the fill has
   covered none of them, they read as specks on the screen rather than
   as a measure, and they are gone. What is beside it says which band is
   being read, which was the half of that idea that worked.

   The running head is set in the left margin, vertically, which is
   where a folio goes and also the one part of the screen the site has
   left empty on purpose: the masthead is two plates pinned to the
   gutters with the whole span between them open, and a running head
   laid across that span would close the gap the header was split to
   make.

   Both are chrome and both are hidden from assistive technology. The
   sections they name are headings in the document and the reader who
   cannot see this has a better instrument for the same question; what
   is here is a picture of where you are, and a picture is the one thing
   it would be dishonest to read out.

   Everything inside is empty in the markup. It is written by
   src/hooks/useChrome.js from the bands' own tags, so the names cannot
   drift out of step with the page, and so the prerendered document does
   not ship a running head naming a section nobody is reading yet. */
export const Progress = () => (
    <>
        <div className="progress" id="progress" aria-hidden="true">
            <span className="progress__fill" />
        </div>

        <div className="folio" id="folio" aria-hidden="true">
            <p className="folio__line">
                <span className="folio__slot">
                    <span className="folio__no num" />
                </span>
                <span className="folio__slot">
                    <span className="folio__name" />
                </span>
            </p>
        </div>
    </>
);

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
