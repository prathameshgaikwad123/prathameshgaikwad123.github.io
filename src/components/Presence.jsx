import usePresence from '../hooks/usePresence.js';

const GROUPED = new Intl.NumberFormat('en-US');

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
