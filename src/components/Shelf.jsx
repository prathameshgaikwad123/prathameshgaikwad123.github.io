import { useEffect, useRef, useState } from 'react';
import { BOOKS } from '../data/books.js';
import Lightbox from './Lightbox.jsx';
import { onMedia, rafOnce, useEnhanced } from '../hooks/dom.js';
import { armShelf, topple } from '../hooks/shelfsound.js';

const LEAN = 9;
const SLIDE = 3;

const REACH = 1.25;
const PEAK = 27 / 4;

const STIFF = 170;
const DAMP = 22;

const QUIET = 0.004;
const STILL = 0.03;

const LOUD = 0.4;
const HUSH = 0.15;

const WEIGHT = 1.25;

const NEAR = 110;

const HELD_FOR = 1100;

const ZERO_LEAN = '0.00deg';
const ZERO_SLIDE = '0.00px';

function arm(root) {
    const row = root.querySelector('.shelf__row');
    const books = row ? [].slice.call(row.querySelectorAll('.shelf__book')) : [];
    if (!row || !books.length) return () => {};

    const vols = books.map((book) => book.querySelector('.shelf__vol') || book);

    /* One angle for the row, so one spring for the row. */
    let at = 0;
    let vel = 0;
    let side = 0;
    let rung = false;

    const shown = { lean: ZERO_LEAN, slide: ZERO_SLIDE, on: false };

    let middle = 0;
    let reach = 1;

    let pointer = null;
    let frame = 0;
    let clock = 0;
    let held = 0;

    const measure = () => {
        const first = books[0];
        const last = books[books.length - 1];
        const left = first.offsetLeft;
        const right = last.offsetLeft + last.offsetWidth;
        middle = (left + right) / 2;
        reach = ((right - left) || first.offsetWidth || 1) * REACH;
    };

    const write = () => {
        const lean = `${(at * LEAN).toFixed(2)}deg`;
        const slide = `${(at * SLIDE).toFixed(2)}px`;

        const s = at > QUIET ? 1 : at < -QUIET ? -1 : side;
        const turned = s !== side;
        if (turned) side = s;

        if (lean === shown.lean && slide === shown.slide && !turned) return;

        for (let i = 0; i < vols.length; i++) {
            const vol = vols[i];
            if (lean !== shown.lean) vol.style.setProperty('--lean', lean);
            if (slide !== shown.slide) vol.style.setProperty('--slide', slide);
            if (turned) vol.style.setProperty('--pivot', s < 0 ? '0%' : '100%');
        }

        shown.lean = lean;
        shown.slide = slide;
        shown.on = true;
    };

    const clear = () => {
        at = 0;
        vel = 0;
        if (!shown.on) return;
        for (let i = 0; i < vols.length; i++) {
            vols[i].style.removeProperty('--lean');
            vols[i].style.removeProperty('--slide');
        }
        shown.lean = ZERO_LEAN;
        shown.slide = ZERO_SLIDE;
        shown.on = false;
    };

    const tick = (stamp) => {
        frame = 0;

        const dt = clock ? Math.min((stamp - clock) / 1000, 1 / 30) : 1 / 60;
        clock = stamp;

        const box = row.getBoundingClientRect();

        let to = 0;
        if (pointer
            && pointer.y > box.top - NEAR
            && pointer.y < box.bottom + NEAR) {
            const t = (pointer.x - (box.left + middle)) / reach;
            if (t > -1 && t < 1) {
                const a = t < 0 ? -t : t;
                to = t * (1 - a) * (1 - a) * PEAK;
            }
        }

        vel += (-STIFF * (at - to) - DAMP * vel) * dt;
        at += vel * dt;

        const a = at < 0 ? -at : at;
        const gap = at - to < 0 ? to - at : at - to;
        const v = vel < 0 ? -vel : vel;

        const falling = at > 0 ? vel > 0 : vel < 0;

        if (!rung && a > LOUD && falling) {
            rung = true;
            topple(WEIGHT);
        } else if (rung && a < HUSH) {
            rung = false;
        }

        write();

        if (gap > QUIET || v > STILL) {
            frame = requestAnimationFrame(tick);
            return;
        }

        clock = 0;

        if (a <= QUIET) clear();
    };

    const start = () => {
        if (frame) return;
        clock = 0;
        frame = requestAnimationFrame(tick);
    };

    const point = (event) => {
        pointer = { x: event.clientX, y: event.clientY };
        start();
    };

    const release = () => {
        pointer = null;
        start();
    };

    const onScroll = () => {
        if (pointer) start();
    };

    const onMove = (event) => {
        window.clearTimeout(held);
        point(event);
    };

    const onDown = (event) => {
        window.clearTimeout(held);
        point(event);
    };

    const onUp = (event) => {
        if (event.pointerType === 'mouse') return;
        window.clearTimeout(held);
        held = window.setTimeout(release, HELD_FOR);
    };

    const gone = (event) => {
        if (event && event.pointerType && event.pointerType !== 'mouse') return;
        window.clearTimeout(held);
        release();
    };

    const remeasure = rafOnce();
    const onResize = () => remeasure(measure);

    measure();

    const offSound = armShelf();

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('blur', gone);
    document.documentElement.addEventListener('pointerleave', gone);

    return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('blur', gone);
        document.documentElement.removeEventListener('pointerleave', gone);

        window.clearTimeout(held);
        remeasure.cancel();
        if (frame) cancelAnimationFrame(frame);
        offSound();

        vols.forEach((vol) => {
            vol.style.removeProperty('--lean');
            vol.style.removeProperty('--slide');
            vol.style.removeProperty('--pivot');
        });
        shown.lean = ZERO_LEAN;
        shown.slide = ZERO_SLIDE;
        shown.on = false;
    };
}

const dialogSupported = () =>
    typeof HTMLDialogElement === 'function'
    && typeof HTMLDialogElement.prototype.showModal === 'function';

export default function Shelf() {
    const ref = useRef(null);

    const [poster, setPoster] = useState(null);

    const enhanced = useEnhanced();
    const opens = enhanced && dialogSupported();

    useEffect(() => {
        const root = ref.current;
        if (!root) return undefined;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        let off = () => {};

        const decide = () => {
            off();
            off = reduce.matches ? () => {} : arm(root);
        };

        decide();
        const offMedia = onMedia(reduce, decide);

        return () => {
            offMedia();
            off();
        };

    }, [opens]);

    return (
        <>
            <div className="shelf" ref={ref}>

                <ul className="shelf__row" role="list">
                    {BOOKS.map((book) => {
                        const spine = (
                            <span className="shelf__spine" aria-hidden="true">
                                {book.spine || book.title}
                            </span>
                        );

                        return (
                            <li
                                className="shelf__book"
                                key={book.title}
                                data-reveal=""
                                style={{ '--tall': book.tall || 1 }}
                            >
                                {opens ? (
                                    <button
                                        type="button"
                                        className="shelf__vol"

                                        aria-label={`${book.title} — show cover`}
                                        onClick={(event) =>
                                            setPoster({
                                                src: book.cover,
                                                alt: book.alt || book.title,
                                                title: book.title,
                                                author: book.author,
                                                review: book.review,
                                                opener: event.currentTarget,
                                            })}
                                    >
                                        {spine}
                                    </button>
                                ) : (
                                    <span className="shelf__vol">
                                        {spine}
                                        <span className="visually-hidden">{book.title}</span>
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="shelf__board" data-reveal-rule="" aria-hidden="true" />
            </div>

            <Lightbox item={poster} onClose={() => setPoster(null)} />
        </>
    );
}
