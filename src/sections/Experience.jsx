import { SITE } from '../data/site.js';
import { ArrowDown } from '../components/Icons.jsx';
import { SUMMARY, FIGURES, ROLES, SKILLS, EDUCATION, LANGUAGES } from '../data/experience.js';
import Words from '../components/Words.jsx';
import useScrollEffect from '../hooks/useScrollEffect.js';
import lineReveal from '../animations/lineReveal.js';

/* The résumé, set the way the rest of the page is set. Everything it
   says is in src/data/experience.js and nothing here adds to it.

   Four parts, in the order a reader asks for them: who it is and the
   three numbers that sum it up, the roles, the skills and tools, and
   where it was learned. The last two are sub-blocks (`.sub`, the same
   rule and step as "In Practice" in About), so the band reads as one
   argument rather than as three sections stacked.

   The roles are a plain ordered list, not a widget: the dates stand in
   the left column and the work beside them, and on a phone they stack.
   Nothing here is hidden behind a click, because a résumé that has to be
   opened is a résumé nobody reads. */
export default function Experience() {
    const ref = useScrollEffect(lineReveal);

    return (
        <section
            data-reveal-rule=""
            className="band"
            id="experience"
            aria-labelledby="experience-title"
            ref={ref}
        >
            <div className="shell">
                <div className="grid">
                    <p className="tag exp__tag" data-reveal="">
                        <span className="tag__no num">04</span>Experience
                    </p>
                    <h2 className="statement exp__statement" id="experience-title" data-reveal="">
                        <Words text={'Five years, from brand to browser.'} className="sw" inner />
                    </h2>
                    <p className="lead exp__lead" data-reveal="">
                        {SUMMARY}
                    </p>

                    <p className="exp__cv" data-reveal="">
                        <a className="btn btn--primary btn--down" href={SITE.resume} download>
                            Download résumé (PDF)
                            <ArrowDown />
                        </a>
                    </p>

                    <ul className="exp__figures" data-reveal="">
                        {FIGURES.map((f) => (
                            <li key={f.label}>
                                <b className="exp__figure num">{f.value}</b>
                                <span className="exp__figure-label">{f.label}</span>
                            </li>
                        ))}
                    </ul>

                    <ol className="exp__roles" aria-label="Roles">
                        {ROLES.map((role) => (
                            <li className="exp__role" key={role.id} data-reveal="">
                                <p className="exp__when num">{role.when}</p>
                                <div className="exp__main">
                                    <h3 className="exp__title">{role.title}</h3>
                                    <p className="exp__org">
                                        <strong>{role.org}</strong>
                                        <span>{role.place}</span>
                                    </p>
                                    <ul className="exp__points">
                                        {role.points.map(([lead, rest]) => (
                                            <li key={lead}>
                                                <strong>{lead}</strong>
                                                {rest}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* ---------- SKILLS ---------- */}
                    <section className="sub" id="skills" aria-labelledby="skills-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="skills-title">
                                What I work with.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">04.1</span>Skills &amp; Tools
                            </p>
                        </header>
                        <dl className="skills">
                            {SKILLS.map((s) => (
                                <div className="skills__row" key={s.group}>
                                    <dt className="skills__group">{s.group}</dt>
                                    <dd>
                                        <ul className="metalist skills__items">
                                            {s.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* ---------- EDUCATION ---------- */}
                    <section className="sub" id="education" aria-labelledby="education-title" data-reveal="">
                        <header className="sub__head">
                            <h3 className="sub__title" id="education-title">
                                Where I learned it.
                            </h3>
                            <p className="tag">
                                <span className="tag__no num">04.2</span>Education &amp; Languages
                            </p>
                        </header>
                        <ul className="edu">
                            {EDUCATION.map((e) => (
                                <li className="edu__row" key={e.id}>
                                    <p className="edu__when num">{e.when || ' '}</p>
                                    <p className="edu__what">
                                        <strong>{e.title}</strong>
                                        <span>
                                            {e.where}
                                            {e.note ? ` · ${e.note}` : ''}
                                        </span>
                                    </p>
                                </li>
                            ))}
                            <li className="edu__row">
                                <p className="edu__when">Languages</p>
                                <p className="edu__what">
                                    <strong>
                                        {LANGUAGES.map(([name, level], i) => (
                                            <span key={name}>
                                                {i ? ', ' : ''}
                                                {name}
                                                {level ? ` (${level})` : ''}
                                            </span>
                                        ))}
                                    </strong>
                                </p>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </section>
    );
}
