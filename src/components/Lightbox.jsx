import { useEffect, useRef, useState } from 'react';
import { useEnhanced } from '../hooks/dom.js';

const dialogSupported = () =>
    typeof HTMLDialogElement === 'function' && typeof HTMLDialogElement.prototype.showModal === 'function';

/* An image that can be opened full size. The control is added after mount
   rather than shipped in the markup, so the pages stay plain HTML and keep
   working without JavaScript — the same reason the previous build created
   this button in script. */
export function Zoomable({ src, alt, width, height, loading, fetchPriority, onZoom }) {
    const enhanced = useEnhanced();
    const ref = useRef(null);

    const image = (
        <img
            ref={ref}
            src={src}
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
                onZoom({
                    src: img ? img.currentSrc || img.src : src,
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

    return (
        <dialog
            className="lightbox"
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
            <img src={item ? item.src : undefined} alt={item ? item.alt : ''} />
            <div className="lightbox__bar">
                <span className="lightbox__caption">{item ? item.alt : ''}</span>
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
