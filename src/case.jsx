import mount from './mount.jsx';
import CaseStudy from './CaseStudy.jsx';

/* Which case study this document is comes from the mount point, so all six
   work pages share one entry. */
const slug = document.getElementById('root').dataset.project;

mount(<CaseStudy slug={slug} />);
