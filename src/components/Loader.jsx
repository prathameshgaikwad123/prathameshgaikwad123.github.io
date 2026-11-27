import { INTRO_PHRASE } from '../data/site.js';

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
