import { useEffect, useState } from 'react';

const ENDPOINT = import.meta.env.VITE_PRESENCE_ENDPOINT || '/api/presence';

const BEAT_MS = 12_000;

const RETRY_MS = 30_000;

const KEY = 'pg-presence';
const ID = /^[A-Za-z0-9_-]{16,64}$/;

function mint() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    let id = '';
    for (let i = 0; i < bytes.length; i++) id += bytes[i].toString(16).padStart(2, '0');
    return id;
}

function sessionId() {
    if (typeof window === 'undefined') return null;
    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') return null;

    try {
        const stored = sessionStorage.getItem(KEY);
        if (stored && ID.test(stored)) return stored;
    } catch {

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

    const [presence, setPresence] = useState(IDLE);

    useEffect(() => {
        const id = sessionId();
        if (!id) return undefined;

        const controller = new AbortController();
        let timer = 0;
        let inFlight = false;
        let stopped = false;
        let explained = false;

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
