import { Fragment } from 'react';

export default function Words({ text, className = 'w', inner = false }) {
    const words = String(text).split(' ');

    return words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
            <span className={className}>{inner ? <span>{word}</span> : word}</span>
            {i < words.length - 1 ? ' ' : null}
        </Fragment>
    ));
}
