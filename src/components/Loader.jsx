import { INTRO_PHRASE } from '../data/site.js';

/* The intro: one phrase, one line, once per session, then the entrance is
   let go. Hidden from assistive technology, which is given the page itself
   straight away.

   Whether it plays at all is decided in the document head, before the first
   paint, and the overlay clears itself in CSS — so the page is revealed even
   if this component never mounts. `useIntro` only listens for the end of
   that fade, so the entrance below can be held until the page has arrived. */
export default function Loader({ innerRef, hidden }) {
    return (
        <div className="intro" id="intro" aria-hidden="true" ref={innerRef} hidden={hidden}>
            <p className="statement intro__phrase">
                {INTRO_PHRASE}
                <span className="intro__stop">.</span>
            </p>
            <span className="intro__line" />
        </div>
    );
}
