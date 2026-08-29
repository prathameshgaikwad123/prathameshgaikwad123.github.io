import { ArrowDown } from '../components/Icons.jsx';

const DISCIPLINES = [
    { no: '01', name: 'UI/UX' },
    { no: '02', name: 'Web' },
    { no: '03', name: 'Brand' },
    { no: '04', name: 'Digital Experiences' },
];

/* One statement, centred, with the first screen kept open around it.
   The headline is the whole subject: everything that used to share the
   screen with it — the ruled name line, the availability block, the
   field of column lines, the scattered covers and the second column of
   supporting copy — is gone, and the space they left is not refilled.

   Two registers remain under it, both on the floor of the screen: the
   discipline strip and the scroll cue. */
export default function Hero() {
    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="shell hero__inner">
                <div className="grid hero__grid">
                    <div className="hero__stage">
                        <h1 className="hero__title" id="hero-title" data-reveal="">
                            <span>Multidisciplinary</span>
                            <span>
                                <em>Digital&nbsp;Designer</em>
                                <span className="hero__stop">.</span>
                            </span>
                        </h1>

                        <p className="hero__said" data-reveal="">
                            I design interfaces, websites, brands and&nbsp;digital&nbsp;experiences.
                        </p>
                    </div>

                    {/* The four disciplines, given four cells on the grid rather
                        than one line of prose. */}
                    <ul className="hero__strip" data-reveal="">
                        {DISCIPLINES.map((d) => (
                            <li className="hero__cell" key={d.no}>
                                <span className="hero__cell-no num" aria-hidden="true">
                                    {d.no}
                                </span>
                                <span className="hero__cell-name">{d.name}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="hero__foot">
                        <a className="hero__scroll" href="#work">
                            Scroll
                            <ArrowDown />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
