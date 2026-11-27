import mount from './mount.jsx';
import CaseStudy from './CaseStudy.jsx';

const slug = document.getElementById('root').dataset.project;

mount(<CaseStudy slug={slug} />);
