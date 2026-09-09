import { ArrowDown } from '../components/Icons.jsx';
import useTypewriter from '../hooks/useTypewriter.js';

/* The statement, as the pieces it is typed in.

   Words rather than one string, because every character is given a box
   of its own below and a box is a place a line is allowed to break: run
   together, the statement would come apart mid-word at the narrow end.
   Each word is one unbreakable run and the spaces between them are the
   only breaks left, which is where a line should break anyway.

   The italic and the stop are the register the heading has always had —
   the emphasis on the noun, the full stop one step down the ramp — so
   they are carried here rather than being lost to the animation. */
const STATEMENT = [
    { text: 'Just' },
    { text: ' ', space: true },
    { text: 'a' },
    { text: ' ', space: true },
    { text: 'designer', em: true },
    { text: '.', stop: true },
];

/* Flattened once, at module scope: every character with the index the
   typing counts up to, so nothing is measured or numbered per render. */
const WORDS = [];
let letters = 0;
for (const word of STATEMENT) {
    WORDS.push({
        ...word,
        chars: word.text.split('').map((ch) => ({ ch, i: letters++ })),
    });
}

const LINE = STATEMENT.map((word) => word.text).join('');

/* One statement, centred, with the first screen kept open around it.
   The headline is the whole subject: everything that used to share the
   screen with it — the ruled name line, the availability block, the
   field of column lines, the scattered covers, the second column of
   supporting copy and the strip of disciplines along the floor — is
   gone, and the space they left is not refilled. The stage takes the
   slack, so what the strip gave up is spent on the statement being
   nearer the centre of the screen rather than on a gap where a strip
   used to be.

   The statement is the only thing on the stage now — the line of
   supporting copy under it went with the strip, for the same reason:
   it named the same four disciplines the strip listed, and a sentence
   that lists them is not what "Just a designer." is for.

   One register remains under it, on the floor of the screen: the scroll
   cue. */
export default function Hero({ ready = false }) {
    const { typed, typing } = useTypewriter(LINE, ready);

    return (
        <section className="hero" aria-labelledby="hero-title">
            <div className="shell hero__inner">
                <div className="grid hero__grid">
                    <div className="hero__stage">
                        {/* The heading's text is the whole statement in
                            the document whatever the animation is doing
                            — the characters are hidden, never withheld
                            — so what is read out, selected, printed or
                            crawled is one line of type and not a count
                            of how far a timer got. */}
                        <h1
                            className="hero__title"
                            id="hero-title"
                            data-reveal=""
                            /* An attribute and not a class, deliberately.
                               The entrance in src/hooks/useReveal.js marks
                               this same element by adding `is-in` to its
                               class list from outside React, and a
                               className this component then rewrites would
                               take that mark off again — leaving the
                               statement at the opacity the entrance starts
                               from, which is none. The two states are kept
                               on separate attributes so neither can erase
                               the other. */
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

                                /* One wrapper per piece, always, and the
                                   piece's own index as its key. Every
                                   child of the heading is keyed off the
                                   same count and every character off
                                   its own, so the two numbering schemes
                                   cannot meet and collide. */
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
