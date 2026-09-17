import { useEffect, useState } from 'react';

/* ===================================================================
   THE GRID, SHOWN
   -------------------------------------------------------------------
   The first paragraph of the stylesheet says the identity is "a
   12-column grid that is allowed to show itself". This is the literal
   reading of that: press G and the grid the page is actually set on is
   drawn over it — the twelve columns, the gaps between them, and the
   two edges where the shell stops and the margin begins.

   It is drawn with the layout's own elements rather than with a picture
   of them. A .shell inside a .grid with twelve marks in it is the same
   .shell and the same .grid every band on the site is built from, so
   the overlay is measured by the rules that do the measuring: change
   the gutter, the gap, the shell's maximum or the number of columns and
   this follows, because it is not a copy. A repeating-linear-gradient
   of twelve stops would have been the obvious way to draw it and the
   wrong one — it would have had to restate every one of those values,
   and the day one of them changed it would go on being confidently
   wrong, which is worse than not having it.

   Below the step where the grid becomes twelve columns it is one
   column, so one mark is drawn. That is not a degraded version of the
   overlay; it is the grid, and a phone really is set on one column.

   Nothing advertises the key. It is not a feature of the site, it is a
   drawing instrument left in the drawer of one — the reader it is for
   is the one who would try it, and everybody else is not missing
   anything. What is on screen while it is open says how to close it,
   which is the one thing somebody who found it by accident needs.

   The state is kept for the session rather than the page, and
   deliberately: the reason to have it open is to walk the site and see
   whether the pages agree with each other, and an overlay that had to
   be switched on again at every navigation would be off for exactly the
   moment being compared.
   =================================================================== */

const GRID_KEY = 'pg-grid';

/* The twelve of the twelve-column grid, named once. */
const COLUMNS = 12;

export default function Grid() {
    /* False through the prerender and through the first client render,
       so the markup the browser is handed and the markup React first
       draws are the same markup — and so a document with no script in it
       is never shipped an overlay it has no way to put away. */
    const [on, setOn] = useState(false);

    useEffect(() => {
        try {
            if (sessionStorage.getItem(GRID_KEY) === 'on') setOn(true);
        } catch (e) {
            /* storage blocked — the overlay simply does not outlive the page */
        }

        const onKey = (event) => {
            if (event.defaultPrevented) return;
            if (event.key !== 'g' && event.key !== 'G') return;
            /* A modifier makes it somebody else's shortcut. */
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            /* Anywhere a key is a character rather than a command. */
            const focused = document.activeElement;
            if (
                focused
                && (focused.isContentEditable
                    || /^(input|textarea|select)$/i.test(focused.tagName))
            ) {
                return;
            }

            /* Two states in which the page is not what is on the screen:
               the navigation, which the page has slid off, and a
               lightbox, which is drawn in the top layer above every
               layer this could be in. A grid under either is a grid
               nobody can see, and a key that answers with something
               invisible reads as a key that does nothing. */
            if (document.body.hasAttribute('data-menu-status')) return;
            if (document.querySelector('dialog[open]')) return;

            setOn((was) => {
                const next = !was;
                try {
                    sessionStorage.setItem(GRID_KEY, next ? 'on' : 'off');
                } catch (e) {
                    /* see above */
                }
                return next;
            });
        };

        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    if (!on) return null;

    const marks = [];
    for (let i = 0; i < COLUMNS; i++) marks.push(<span className="rule-grid__col" key={i} />);

    return (
        <div className="rule-grid" aria-hidden="true">
            <div className="shell">
                <div className="grid">{marks}</div>
            </div>

            <p className="rule-grid__say">
                Grid
                <b>G</b>
            </p>
        </div>
    );
}
