import { useEffect, useState } from 'react';

/* How many people are reading the site right now, and how many have
   ever opened it. The counting is done by api/presence.js — this is
   only the half that says "still here" and reads the answer back.

   The rules it works under:

   One timer, and it is a chained timeout rather than an interval. An
   interval fires whether or not the last request came back, so a slow
   network turns it into a queue; a timeout scheduled by the reply that
   preceded it cannot overlap itself, cannot stack a second copy on a
   re-render, and takes one line to cancel.

   A tab nobody is looking at stops asking. The browser would throttle
   it into the expiry window anyway, so rather than pretend otherwise
   it drops out of the count of its own accord and is put back the
   moment it is looked at again — which is also what makes "active"
   mean active rather than open.

   A failure is not a state the reader should see. The last good answer
   stays on the page and only the dot stands down, until a later
   heartbeat puts it back. */

/* Same origin by default, because that is what the two are on when the
   site and the function are deployed together. The variable is for the
   arrangement where they are not — the pages on one host and the
   function on another — and it is a build-time value, so it is read
   through import.meta.env rather than at run time. */
const ENDPOINT = import.meta.env.VITE_PRESENCE_ENDPOINT || '/api/presence';

/* Twice inside the server's 30s window, so one late reply is not a
   reader leaving. */
const BEAT_MS = 12_000;

/* And a longer wait after a failure, so an endpoint that is down is
   asked five times a minute rather than five times a second. */
const RETRY_MS = 30_000;

const KEY = 'pg-presence';
const ID = /^[A-Za-z0-9_-]{16,64}$/;

/* Sixteen random bytes and nothing else — not derived from anything
   about the reader, not readable as anything about them, and gone when
   the tab is. */
function mint() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    let id = '';
    for (let i = 0; i < bytes.length; i++) id += bytes[i].toString(16).padStart(2, '0');
    return id;
}

/* Session storage rather than local: one tab is one visit, and a
   reload is the same visit rather than a new one — which is the whole
   of what keeps a refresh from being a footstep. Storage that is
   blocked falls back to an id that lives as long as the document,
   which is the same bargain the theme and the intro already make. */
function sessionId() {
    if (typeof window === 'undefined') return null;
    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') return null;

    try {
        const stored = sessionStorage.getItem(KEY);
        if (stored && ID.test(stored)) return stored;
    } catch {
        /* storage blocked — one id for this document and no further
           attempt to keep it, which costs a reload one footstep and
           nothing else */
        return mint();
    }

    const id = mint();
    try {
        sessionStorage.setItem(KEY, id);
    } catch {
        /* blocked — the id simply does not outlive the page */
    }
    return id;
}

const IDLE = { status: 'idle', active: 0, total: 0 };

export default function usePresence() {
    /* Idle on the server and on the first client render, which is what
       keeps the prerendered footer and the hydrated one the same
       document. */
    const [presence, setPresence] = useState(IDLE);

    useEffect(() => {
        const id = sessionId();
        if (!id) return undefined;

        const controller = new AbortController();
        let timer = 0;
        let inFlight = false;
        let stopped = false;
        let explained = false;

        /* The line is meant to be silent when it has nothing true to
           say, and that is right for a reader — but it is wrong for
           whoever is setting it up, to whom an unconfigured store and
           a footer that never had the line look identical. Said once,
           and only for the two answers that mean nobody has finished
           wiring this up. A dropped request says nothing: that is the
           reader's network, not the author's mistake. */
        const explain = async (res) => {
            if (explained) return;
            explained = true;

            if (res.status === 404) {
                console.info(
                    `presence: nothing is serving ${ENDPOINT}. This build is hosted somewhere `
                    + 'that cannot run a function; see the Deployment section of the README.',
                );
                return;
            }

            /* The endpoint knows what is wrong with it — which
               variables it looked for, which it can see — and there is
               no reason to make anyone read the function's logs to
               find that out. Passed through whole rather than
               summarised here, so this half never has to be kept in
               step with the other. */
            const said = await res.json().catch(() => null);
            if (said && said.error) {
                console.info(`presence: ${said.error}. Open ${ENDPOINT} in a browser for the rest.`, said);
                return;
            }

            console.info(`presence: ${ENDPOINT} answered ${res.status}.`);
        };

        async function beat() {
            if (stopped || inFlight) return;
            if (document.visibilityState === 'hidden') return;

            inFlight = true;
            try {
                const res = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ id }),
                    signal: controller.signal,
                });
                if (!res.ok) {
                    await explain(res);
                    throw new Error(`presence ${res.status}`);
                }

                const data = await res.json();
                if (stopped) return;

                /* You are one of them, whatever the store says: a
                   count of nobody, read by somebody, is a bug on
                   display. */
                const active = Math.max(1, Math.floor(Number(data.active)) || 0);
                const total = Math.max(0, Math.floor(Number(data.total)) || 0);

                setPresence((prev) =>
                    prev.status === 'live' && prev.active === active && prev.total === total
                        ? prev
                        : { status: 'live', active, total });

                schedule(BEAT_MS);
            } catch {
                if (stopped) return;
                setPresence((prev) => (prev.status === 'live' ? { ...prev, status: 'stale' } : prev));
                schedule(RETRY_MS);
            } finally {
                inFlight = false;
            }
        }

        const schedule = (ms) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(beat, ms);
        };

        const onVisibility = () => {
            if (document.visibilityState === 'visible') schedule(0);
            else window.clearTimeout(timer);
        };

        document.addEventListener('visibilitychange', onVisibility);
        schedule(0);

        return () => {
            stopped = true;
            window.clearTimeout(timer);
            controller.abort();
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    return presence;
}
