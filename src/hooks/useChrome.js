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

/* The floating plates gather ground, the reading line fills and ticks
   itself, the folio in the left margin names the band being read, and
   that same band marks itself in the navigation panel. All of it gets
   decided once per frame, from a single line three tenths of the way
   down the viewport.

   All of this is written straight to the DOM rather than held in state: it
   runs on every scroll frame, and re-rendering the whole page for it would
   be both slower and — for aria-current — a change of behaviour.

   There is one navigation now, so there is one place to mark. The plate
   used to carry a copy of the section list with a travelling ground under
   the current link, and this hook used to place it; both are gone, and
   what is left is the panel's own links, found by the .menu__link class
   they have always carried.

   Which sections those are is the panel's business and the order they
   are searched in is not: the list is sorted into document order below
   before anything is decided from it. */
export default function useChrome() {
    useEffect(() => {
        const masthead = document.getElementById('masthead');
        const progress = document.getElementById('progress');
        const ticks = progress ? progress.querySelector('.progress__ticks') : null;
        const folio = document.getElementById('folio');
        const folioNo = folio ? folio.querySelector('.folio__no') : null;
        const folioName = folio ? folio.querySelector('.folio__name') : null;

        const navLinks = [].slice.call(document.querySelectorAll('.menu__link[href^="#"]'));

        /* Two questions are asked of one walk down the page, and they do
           not have the same answer, because they are not asked of the
           same list.

           What the panel marks is the panel's business — the sections it
           lists, found through its own links, exactly as before. What
           the folio names is the document's: every band with an id,
           including the Behance spread, which is a band a reader arrives
           at by reading rather than a destination in the index. A
           running head that went quiet for the length of a whole section
           would be telling them they were still in the one above it.

           So both lists are collected into one array of nodes, each
           flagged with what it is wanted for, and the walk below reads
           every offset once and answers both. */
        const nodes = [];

        const mark = (section, role) => {
            if (!section || section === document.body) return;
            let node = null;
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].el === section) node = nodes[i];
            }
            if (!node) {
                node = { el: section, spy: false, band: false, no: '', name: '', tick: null, at: -1 };
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

        /* Down the page, whatever order the panel lists them in. The
           search below walks this array and keeps the last section it
           has passed, which is only the section the reader is in if the
           array is in document order — and the panel's order is now the
           panel's own: it opens on About, which is the third band on the
           page. Read off the document rather than assumed of the list,
           so the two are free to disagree and this stays right. */
        nodes.sort((a, b) =>
            a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );

        /* What each band is called, read off the band rather than kept in
           a list here. Every one of them opens on the same tag — an index
           numeral and a name — which is the same pair a running head
           wants, already written, already correct, and already the thing
           that changes if the page is ever renumbered. */
        nodes.forEach((node) => {
            if (!node.band) return;
            const tag = node.el.querySelector('.tag');
            if (!tag) return;
            const numeral = tag.querySelector('.tag__no');
            node.no = numeral ? numeral.textContent.trim() : '';
            node.name = tag.textContent.replace(node.no, '').trim();
        });

        /* One tick per band, built here rather than rendered, because
           which bands there are is a question about the document and the
           component that draws the line has no way to ask it. */
        if (ticks) {
            nodes.forEach((node) => {
                if (!node.band) return;
                node.tick = document.createElement('span');
                node.tick.className = 'progress__tick';
                ticks.appendChild(node.tick);
            });
        }

        /* A case study has no bands, so it gets no folio — and not an
           empty one. There is one thing to be in on that page and the
           reader is in it. */
        const named = nodes.some((node) => node.band);
        if (folio && named) folio.setAttribute('data-on', '');

        if (!masthead && !progress && !nodes.length) return undefined;

        /* What the folio is currently saying, so that it is only written
           when it changes rather than once a frame. Null rather than an
           empty string, because an empty string is a real answer here —
           it is the hero, above every band — and the first paint has to
           be able to tell the two apart. */
        let said = null;

        const paintSpy = (span) => {
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

                /* The tick is set at the scroll position where this band
                   becomes the one being read — the same line the folio
                   changes on — rather than at the band's own top edge.
                   Two marks for one event, a third of a screen apart,
                   would read as a fault in the instrument. Written only
                   when it moves, which is a resize or a font landing and
                   not a scroll. */
                if (node.tick && span > 0) {
                    const at = Math.max(0, Math.min(1, (y - view * 0.3) / span));
                    if (at !== node.at) {
                        node.at = at;
                        node.tick.style.setProperty('--t', at);
                    }
                }
            }

            /* Above the first section nothing is in view, and the
               navigation panel has a link for exactly that — the top of
               the page. It is marked by attribute rather than by href
               because #top is the body, which is not a section and is
               not spied on. */
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

            /* Restarting the animation takes the class off, forces the
               style to be resolved, and puts it back. It is the one
               deliberate synchronous layout read in this file, and it is
               spent five or six times in a whole reading of the page
               rather than once a frame — which is the trade that makes a
               running head that turns worth having over one that
               swaps. */
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

            paintSpy(span);
        };

        const onScroll = () => schedule(paintChrome);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('load', onScroll);
        paintChrome();

        /* The interface face changes the metrics of every line on the page,
           which moves every section's offsetTop and the scroll height the
           progress bar divides by. One more pass once it lands. */
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
