import { useEffect } from 'react';

/* Cross-document view transitions on the project covers. Forward: tag the
   cover of the project being opened so it settles into the case-study cover
   instead of cross-fading with the page. Back: tag the cover of the project
   being returned from, so the case-study image settles back into the index.

   This is the reason the site is still built as separate documents rather
   than one client-routed page: the transition is a navigation, not a state
   change, and a single-page router would remove it. */
export default function useCaseTransition(indexRef, setActive) {
    useEffect(() => {
        const index = indexRef.current;
        if (!index) return undefined;
        if (typeof document.startViewTransition !== 'function') return undefined;

        const rows = [].slice.call(index.querySelectorAll('.idx'));
        if (!rows.length) return undefined;

        const rowFor = (url) => {
            for (let i = 0; i < rows.length; i++) {
                const slug = rows[i].getAttribute('data-project');
                if (slug && url.indexOf(`/work/${slug}.html`) !== -1) return rows[i];
            }
            return null;
        };

        const onPageSwap = (e) => {
            if (!e.viewTransition || !e.activation || !e.activation.entry) return;

            const row = rowFor(e.activation.entry.url || '');
            if (!row) return;

            const img = row.querySelector('.idx__figure img');
            if (img && row.classList.contains('is-on')) {
                img.style.viewTransitionName = 'project-cover';
            }
        };

        const onPageReveal = (e) => {
            if (!e.viewTransition) return;

            const nav = window.navigation;
            const from = nav && nav.activation && nav.activation.from ? nav.activation.from.url : '';
            if (!from) return;

            const row = rowFor(from);
            if (!row) return;

            const img = row.querySelector('.idx__figure img');
            if (!img) return;

            /* Moved on the element as well as in state: the snapshot is taken
               at the first rendering opportunity, which can arrive before a
               re-render would. */
            rows.forEach((other) => {
                if (other !== row) other.classList.remove('is-on');
            });
            row.classList.add('is-on');
            setActive(row.getAttribute('data-project'));

            img.style.viewTransitionName = 'project-cover';
            const clear = () => {
                img.style.viewTransitionName = '';
            };
            e.viewTransition.finished.then(clear, clear);
        };

        const hasSwap = 'onpageswap' in window;
        const hasReveal = 'onpagereveal' in window;

        if (hasSwap) window.addEventListener('pageswap', onPageSwap);
        if (hasReveal) window.addEventListener('pagereveal', onPageReveal);

        return () => {
            if (hasSwap) window.removeEventListener('pageswap', onPageSwap);
            if (hasReveal) window.removeEventListener('pagereveal', onPageReveal);
        };
    }, [indexRef, setActive]);
}
