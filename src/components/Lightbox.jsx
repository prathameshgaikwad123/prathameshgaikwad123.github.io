import { useEffect, useRef, useState } from 'react';
import { useEnhanced } from '../hooks/dom.js';

const dialogSupported = () =>
    typeof HTMLDialogElement === 'function' && typeof HTMLDialogElement.prototype.showModal === 'function';

/* An image that can be opened full size. The control is added after mount
   rather than shipped in the markup, so the pages stay plain HTML and keep
   working without JavaScript — the same reason the previous build created
   this button in script. */
export function Zoomable({ src, srcSet, sizes, zoom, alt, width, height, loading, fetchPriority, onZoom }) {
    const enhanced = useEnhanced();
    const ref = useRef(null);

    const image = (
        <img
            ref={ref}
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            fetchPriority={fetchPriority}
            decoding="async"
        />
    );

    if (!enhanced || !dialogSupported()) return image;

    return (
        <button
            type="button"
            className="zoom-btn"
            aria-label="Expand image"
            onClick={(e) => {
                const img = ref.current;
                /* `zoom` is the picture at the size the dialog shows it,
                   which a responsive figure's own choice — made for the
                   column it sits in — can be well short of. */
                onZoom({
                    src: zoom || (img ? img.currentSrc || img.src : src),
                    alt: alt || '',
                    opener: e.currentTarget,
                });
            }}
        >
            {image}
        </button>
    );
}

/* The modal itself. One per page, closed by the button, the backdrop or
   Escape — which <dialog> handles on its own. */
export default function Lightbox({ item, onClose }) {
    const ref = useRef(null);
    const opener = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => setReady(dialogSupported()), []);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (item) {
            opener.current = item.opener;
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [item]);

    if (!ready) return null;

    const review = item && item.review && item.review.length ? item.review : null;

    return (
        <dialog
            className={review ? 'lightbox lightbox--book' : 'lightbox'}
            ref={ref}
            /* Clicking the backdrop — anywhere outside the image and its bar. */
            onClick={(e) => {
                if (e.target === ref.current) ref.current.close();
            }}
            onClose={() => {
                const back = opener.current;
                opener.current = null;
                onClose();
                if (back && document.contains(back)) back.focus();
            }}
        >
            {review ? (
                /* A book: the cover and the note on it, side by side where
                   there is room and stacked where there is not. The
                   caption bar is the title here, so the note is not
                   introduced twice. */
                <div className="lightbox__book">
                    <img className="lightbox__cover" src={item.src} alt={item.alt} />
                    <article className="lightbox__review" aria-labelledby="lightbox-review-title">
                        <h2 className="lightbox__title" id="lightbox-review-title">{item.title}</h2>
                        {item.author ? <p className="lightbox__author">{item.author}</p> : null}
                        <div className="lightbox__note">
                            {review.map((para) => (
                                <p key={para.slice(0, 32)}>{para}</p>
                            ))}
                        </div>
                    </article>
                </div>
            ) : (
                <img src={item ? item.src : undefined} alt={item ? item.alt : ''} />
            )}
            <div className="lightbox__bar">
                <span className="lightbox__caption">{review ? 'What I thought' : item ? item.alt : ''}</span>
                <button
                    type="button"
                    className="lightbox__close"
                    onClick={() => ref.current && ref.current.close()}
                >
                    Close
                </button>
            </div>
        </dialog>
    );
}
