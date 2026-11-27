import { useCallback, useEffect, useRef, useState } from 'react';

export default function useMenu() {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const lastFocused = useRef(null);
    const restore = useRef(false);

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

    const onPanelClick = useCallback(
        (e) => {
            if (e.target.closest && e.target.closest('a[href^="#"]')) close(false);
        },
        [close],
    );

    const onOverlayClick = useCallback(() => close(true), [close]);

    return { open, toggle, buttonRef, panelRef, onPanelClick, onOverlayClick };
}
