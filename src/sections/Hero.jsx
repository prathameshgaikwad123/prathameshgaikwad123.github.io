import { ArrowDown } from '../components/Icons.jsx';
import useTypewriter from '../hooks/useTypewriter.js';

const STATEMENT = [
    { text: 'Just' },
    { text: ' ', space: true },
    { text: 'a' },
    { text: ' ', space: true },
    { text: 'designer', em: true },
    { text: '.', stop: true },
];

const WORDS = [];
let letters = 0;
for (const word of STATEMENT) {
    WORDS.push({
        ...word,
        chars: word.text.split('').map((ch) => ({ ch, i: letters++ })),
    });
}

const LINE = STATEMENT.map((word) => word.text).join('');

export default function Hero({ ready = false }) {
    const { typed, typing } = useTypewriter(LINE, ready);

    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="shell hero__inner">
                <div className="grid hero__grid">
                    <div className="hero__stage">

                        <h1
                            className="hero__title"
                            id="hero-title"
                            data-reveal=""

                            data-typing={typing ? '' : undefined}
                        >
                            {WORDS.map((word, w) => {
                                const chars = word.chars.map(({ ch, i }) => (
                                    <span
                                        className={
                                            'hero__char'
                                            + (i < typed ? ' is-on' : '')
                                            + (i === typed ? ' is-caret' : '')
                                        }
                                        key={i}
                                    >
                                        {ch}
                                    </span>
                                ));

                                if (word.em) {
                                    return (
                                        <em className="hero__word" key={w}>
                                            {chars}
                                        </em>
                                    );
                                }

                                return (
                                    <span
                                        className={
                                            (word.space ? 'hero__space' : 'hero__word')
                                            + (word.stop ? ' hero__stop' : '')
                                        }
                                        key={w}
                                    >
                                        {chars}
                                    </span>
                                );
                            })}
                        </h1>
                    </div>

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
