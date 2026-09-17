import { Suspense, lazy, useEffect, useState } from 'react';
import { motionOK, onMedia } from '../hooks/dom.js';

/* ===================================================================
   THE RETICLE
   -------------------------------------------------------------------
   The site draws a register mark on the corner of every framed picture
   — two ticks, a pixel wide, set a little outside the crop (the .frame
   rules, stylesheet section 5). This is that mark, following the
   pointer, and it exists over pictures and nowhere else: the carousel,
   the Behance plates, the side quests, the portrait, a case study's
   figures. Over type, over the navigation, over a button, there is no
   reticle at all and the cursor is the cursor.

   That restriction is the whole idea. A mark that followed the pointer
   everywhere would be a custom cursor, which is a thing a site does to
   a reader; a mark that appears only where there is an image is a
   crop, which is a thing the site is already saying about its own
   pictures.

   THE GATE. This file decides whether the mark should exist at all and
   loads it if so. Three conditions, and all three are the reader's:

     pointer: fine    a reticle is an answer to a cursor. There is no
                      cursor under a finger, and a mark chasing taps
                      around a phone is a fault, not a flourish.
     motion allowed   it is a thing that moves, and it is decoration.
                      Asked for less, it is not offered at all.
     the library      Framer Motion is a dependency this site has had
                      and never called. It is fetched here rather than
                      imported, in the shape src/animations/core.js
                      fetches GSAP, so that a phone — which will never
                      show this — does not download a spring library to
                      find that out. vite.config.js already gives it a
                      chunk of its own; lazy() is what makes that chunk
                      asynchronous rather than merely separate.

   Both media queries are watched rather than read once: a reader who
   turns the preference on mid-visit, or moves the window to a screen
   they are touching, is answered now rather than on their next visit.
   =================================================================== */

const Mark = lazy(() => import('./ReticleMark.jsx'));

export default function Reticle() {
    /* False on the server and on the first client render, which is what
       the prerendered document says too. */
    const [wanted, setWanted] = useState(false);

    useEffect(() => {
        const fine = window.matchMedia('(pointer: fine)');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        const decide = () => setWanted(fine.matches && motionOK());

        decide();
        const offFine = onMedia(fine, decide);
        const offReduce = onMedia(reduce, decide);

        return () => {
            offFine();
            offReduce();
        };
    }, []);

    if (!wanted) return null;

    /* No fallback, deliberately. There is nothing to show while a
       decoration is being fetched, and a placeholder for a cursor mark
       would be the one thing worse than not having one. */
    return (
        <Suspense fallback={null}>
            <Mark />
        </Suspense>
    );
}
