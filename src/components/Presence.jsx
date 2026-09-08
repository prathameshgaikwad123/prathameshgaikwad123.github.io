import usePresence from '../hooks/usePresence.js';

/* The one line in the footer that is not the same on two consecutive
   visits: who else is reading this right now, and how many people have
   ever got this far. It is set in the footer's own micro type, it is
   the last thing on the page, and it is deliberately not announced —
   it is a detail to be found rather than a figure being reported.

   Nothing is rendered until there is a real answer — not a skeleton,
   not a zero, not a dash. A reader without JavaScript, a page whose
   endpoint is not there, and a first request still in the air all get
   the footer exactly as it has always been, which is also what keeps
   the prerendered document and the hydrated one the same document:
   both start with nothing here. src/hooks/usePresence.js does the
   asking. */

/* en-US rather than the reader's own locale: the grouping this asks
   for is the one the composition was set against, and a number that
   regroups itself per visitor is a number that sometimes does not
   fit. */
const GROUPED = new Intl.NumberFormat('en-US');

/* Two digits, so the line does not change width between nine readers
   and ten — the same padding every other counted numeral on the site
   uses. Anything already wider is left as it is. */
const pad = (n) => String(n).padStart(2, '0');

export default function Presence() {
    const { status, active, total } = usePresence();

    if (status === 'idle') return null;

    return (
        <div className="presence" data-state={status}>
            <p className="presence__line">
                <span className="presence__dot" aria-hidden="true" />
                {active === 1 ? (
                    'Just you, for now'
                ) : (
                    <>
                        <span className="presence__no num">{pad(active)}</span> Humans hanging around
                    </>
                )}
            </p>

            {total > 0 && (
                <p className="presence__line">
                    <span className="presence__no num">{GROUPED.format(total)}</span> Digital footsteps
                </p>
            )}
        </div>
    );
}
