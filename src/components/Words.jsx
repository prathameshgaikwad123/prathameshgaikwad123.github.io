import { Fragment } from 'react';

/* A sentence, one span per word, with the spaces left between the spans
   rather than inside them. The text stays exactly what it was: real,
   selectable, searchable, copied correctly, and read by a screen reader
   as one sentence rather than as a list of words.

   This is what the reading reveal in section 10 animates, and it is
   written on the server as well as in the browser — so the split costs
   nothing at runtime, and the paragraph is complete in the prerendered
   document whether or not the animation ever runs. */
export default function Words({ text, className = 'w' }) {
    const words = String(text).split(' ');

    return words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
            <span className={className}>{word}</span>
            {i < words.length - 1 ? ' ' : null}
        </Fragment>
    ));
}
