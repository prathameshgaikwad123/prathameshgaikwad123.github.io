import { useEffect } from 'react';
import { rafOnce } from './dom.js';

function offsetTop(el) {
    let y = 0;
    let node = el;
    while (node) {
        y += node.offsetTop;
        node = node.offsetParent;
    }
    return y;
}

export default function useChrome() {
    useEffect(() => {
        const masthead = document.getElementById('masthead');
        const progress = document.getElementById('progress');
        const folio = document.getElementById('folio');
        const folioNo = folio ? folio.querySelector('.folio__no') : null;
        const folioName = folio ? folio.querySelector('.folio__name') : null;

        const navLinks = [].slice.call(document.querySelectorAll('.menu__link[href^="#"]'));

        const nodes = [];

        const mark = (section, role) => {
            if (!section || section === document.body) return;
            let node = null;
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].el === section) node = nodes[i];
            }
            if (!node) {
                node = { el: section, spy: false, band: false, no: '', name: '' };
                nodes.push(node);
            }
            node[role] = true;
        };

        navLinks.forEach((link) => {
            const id = (link.getAttribute('href') || '').replace(/^#/, '');
            if (!id) return;
            mark(document.getElementById(id), 'spy');
        });

        [].slice
            .call(document.querySelectorAll('main .band[id]'))
            .forEach((band) => mark(band, 'band'));

        nodes.sort((a, b) =>
            a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );

        nodes.forEach((node) => {
            if (!node.band) return;
            const tag = node.el.querySelector('.tag');

            if (tag) {
                const numeral = tag.querySelector('.tag__no');
                node.no = numeral ? numeral.textContent.trim() : '';
                node.name = tag.textContent.replace(node.no, '').trim();
                return;
            }

            node.name = (node.el.getAttribute('aria-label') || '').trim();
        });

        const named = nodes.some((node) => node.band);
        if (folio && named) folio.setAttribute('data-on', '');

        if (!masthead && !progress && !nodes.length) return undefined;

        let said = null;

        const paintSpy = () => {
            if (!nodes.length) return;

            const view = window.innerHeight;
            const line = window.scrollY + view * 0.3;
            const bottom = window.scrollY + view >= document.documentElement.scrollHeight - 4;
            let spied = null;
            let band = null;

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const y = offsetTop(node.el);

                if (bottom || y <= line) {
                    if (node.spy) spied = node;
                    if (node.band) band = node;
                }
            }

            const id = spied ? spied.el.id : null;
            navLinks.forEach((link) => {
                const on = id
                    ? link.getAttribute('href') === `#${id}`
                    : link.hasAttribute('data-nav-home');
                if (on) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });

            if (!folio) return;

            const now = band ? band.el.id : '';
            if (now === said) return;
            said = now;

            if (folioNo) folioNo.textContent = band ? band.no : '';
            if (folioName) folioName.textContent = band ? band.name : '';
            if (band) folio.removeAttribute('data-empty');
            else folio.setAttribute('data-empty', '');

            if (band && !band.no) folio.setAttribute('data-unnumbered', '');
            else folio.removeAttribute('data-unnumbered');

            folio.classList.remove('is-turn');
            void folio.offsetWidth;
            folio.classList.add('is-turn');
        };

        let solid = false;
        const schedule = rafOnce();

        const paintChrome = () => {
            const next = window.scrollY > 8;
            if (next !== solid) {
                solid = next;
                if (masthead) masthead.classList.toggle('is-solid', next);
            }

            const span = document.documentElement.scrollHeight - window.innerHeight;
            if (progress) {
                progress.style.setProperty('--p', span > 0 ? Math.min(1, window.scrollY / span) : 0);
            }

            paintSpy();
        };

        const onScroll = () => schedule(paintChrome);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', onScroll);
        paintChrome();

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => schedule(paintChrome));
        }

        return () => {
            schedule.cancel();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('load', onScroll);
        };
    }, []);
}
