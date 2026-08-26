import { useCallback, useEffect, useRef, useState } from 'react';
import { onMedia } from './dom.js';

/* Overlay navigation below 62rem, with focus kept inside the panel and the
   button that opened it. */
export default function useMenu() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const lastFocused = useRef(null);
    const restore = useRef(false);
    /* The open state as the listeners below see it: Escape and the
       breakpoint change both fire outside a render. */
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
            document.body.classList.add('is-locked');

            /* The panel starts at visibility:hidden and a hidden element
               cannot take focus, so wait for the style change to land. */
            const frame = requestAnimationFrame(() => {
                const first = panelRef.current
                    ? panelRef.current.querySelector('a[href], button:not([disabled])')
                    : null;
                if (first) first.focus();
                if (document.activeElement !== first && button) button.focus();
            });
            return () => cancelAnimationFrame(frame);
        }

        document.body.classList.remove('is-locked');

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

            const items = [].slice
                .call(panelRef.current.querySelectorAll('a[href], button:not([disabled])'))
                .concat(buttonRef.current ? [buttonRef.current] : []);
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

    /* Reaching the desktop breakpoint retires the overlay entirely. */
    useEffect(() => {
        const wide = window.matchMedia('(min-width: 62rem)');
        return onMedia(wide, (e) => {
            if (e.matches) close(false);
        });
    }, [close]);

    /* Following a link inside the overlay closes it: the anchor scroll
       happens on the page behind. */
    const onPanelClick = useCallback(
        (e) => {
            if (e.target.closest && e.target.closest('a[href^="#"]')) close(false);
        },
        [close],
    );

    return { open, toggle, buttonRef, panelRef, onPanelClick };
}
