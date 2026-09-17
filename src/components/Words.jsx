import { Fragment } from 'react';

/* A sentence, one span per word, with the spaces left between the spans
   rather than inside them. The text stays exactly what it was: real,
   selectable, searchable, copied correctly, and read by a screen reader
   as one sentence rather than as a list of words.

   This is what the reading reveal in section 10 animates, and it is
   written on the server as well as in the browser — so the split costs
   nothing at runtime, and the paragraph is complete in the prerendered
   document whether or not the animation ever runs. */
/* `inner` adds a second span inside each word. The reading reveal in
   About does not need one — it changes a weight, and a weight can be
   changed on the word itself — but the line reveal on the statements
   moves the word inside a box that is holding still, and a box and the
   thing moving in it cannot be the same element. At rest the extra span
   is an inline span with no rule against it and no effect on anything;
   what makes the pair a mask is written by the effect and reverted with
   it (stylesheet section 4). */
export default function Words({ text, className = 'w', inner = false }) {
    const words = String(text).split(' ');

    return words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
            <span className={className}>{inner ? <span>{word}</span> : word}</span>
            {i < words.length - 1 ? ' ' : null}
        </Fragment>
    ));
}
