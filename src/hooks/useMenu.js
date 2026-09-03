import { useCallback, useEffect, useRef, useState } from 'react';

/* The navigation's state, and the accessibility that goes with it. The
   motion is next door in useUnderlayNav; this hook decides only whether
   the menu is open, and makes sure that on either side of that the
   keyboard and the reading order tell the truth.

   Three things it writes outside its own tree, all off the one state:

     body[data-menu-status]  the stylesheet's hook — it moves the page
                             off the panel before GSAP arrives, and for
                             a reader who has asked for less motion it
                             is the whole animation. It also locks the
                             document's scroll, so the page behind
                             cannot be read past while it is covered.

     inert on the panel      closed, the panel is behind an opaque page:
                             visible to nobody, and without this still
                             in the tab order.

     inert on the page       open, the page is behind an overlay that
                             takes the clicks — this is the same
                             sentence for the keyboard and the screen
                             reader.

   The panel is the navigation, at every width and on every page —
   there is no second copy of it in the header to defer to, and nothing
   retires it at a breakpoint. */
export default function useMenu() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const lastFocused = useRef(null);
    const restore = useRef(false);
    /* The open state as the listeners below see it: Escape and the
       overlay's click both fire outside a render. */
    const isOpen = useRef(false);
    useEffect(() => {
        isOpen.current = open;
    }, [open]);

    const close = useCallback((restoreFocus) => {
        if (!isOpen.current) return;
        restore.current = !!restoreFocus;
        setOpen(false);
    }, []);

    const toggle = useCallback(() => {
        if (isOpen.current) {
            close(true);
            return;
        }
        const previous = document.activeElement;
        lastFocused.current =
            previous && previous !== document.body ? previous : buttonRef.current;
        setOpen(true);
    }, [close]);

    useEffect(() => {
        const button = buttonRef.current;

        if (open) {
            document.body.setAttribute('data-menu-status', 'open');

            /* The panel is inert until this render lands, and an inert
               element cannot take focus, so wait for the attribute to
               come off. The links themselves are only faded in, never
               hidden, so there is nothing else to wait for. */
            const frame = requestAnimationFrame(() => {
                const first = panelRef.current
                    ? panelRef.current.querySelector('a[href], button:not([disabled])')
                    : null;
                if (first) first.focus();
                if (document.activeElement !== first && button) button.focus();
            });
            return () => cancelAnimationFrame(frame);
        }

        document.body.removeAttribute('data-menu-status');

        if (restore.current) {
            restore.current = false;
            const back =
                lastFocused.current && document.contains(lastFocused.current)
                    ? lastFocused.current
                    : button;
            if (back) back.focus();
            if (document.activeElement !== back && button) button.focus();
        }
        lastFocused.current = null;
        return undefined;
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                close(true);
                return;
            }
            if (e.key !== 'Tab') return;

            /* The toggle leads the cycle, because that is where it is in
               the document: the plate comes before the panel. Put last,
               as it was, the ring runs off the end of the panel's own
               links and into the page behind — which is inert, and so
               takes the focus nowhere at all. */
            const items = (buttonRef.current ? [buttonRef.current] : []).concat(
                [].slice.call(panelRef.current.querySelectorAll('a[href], button:not([disabled])')),
            );
            if (!items.length) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, close]);

    /* Following a link inside the panel closes it: on the home page the
       anchor scroll happens on the page behind, and everywhere else the
       link is a navigation that replaces the document anyway. The two
       that are neither — the elsewhere links and the mail address —
       leave the reader on this page, and the menu with it. */
    const onPanelClick = useCallback(
        (e) => {
            if (e.target.closest && e.target.closest('a[href^="#"]')) close(false);
        },
        [close],
    );

    /* The overlay is the page, as far as a pointer is concerned, and
       pressing the page is how you put a menu away. */
    const onOverlayClick = useCallback(() => close(true), [close]);

    return { open, toggle, buttonRef, panelRef, onPanelClick, onOverlayClick };
}
