

let ctx = null;
let noise = null;
let last = -1;

function buffer(context) {
    const frames = Math.floor(context.sampleRate * 0.04);
    const buf = context.createBuffer(1, frames, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {

        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    return buf;
}

export function armKeystroke() {
    if (typeof window === 'undefined') return () => {};

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return () => {};

    const events = ['pointerdown', 'keydown', 'touchstart'];
    let off = () => {};

    const wake = () => {
        off();
        try {
            if (!ctx) {
                ctx = new Context();
                noise = buffer(ctx);
            }
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        } catch (e) {

            ctx = null;
            noise = null;
        }
    };

    off = () => events.forEach((type) => window.removeEventListener(type, wake));
    events.forEach((type) => window.addEventListener(type, wake, { passive: true }));

    return off;
}

export function keystroke() {
    if (!ctx || !noise || ctx.state !== 'running') return;

    try {
        const now = ctx.currentTime;
        if (now - last < 0.04) return;
        last = now;

        const source = ctx.createBufferSource();
        source.buffer = noise;

        const band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.value = 1750;
        band.Q.value = 0.9;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.03, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

        source.connect(band);
        band.connect(gain);
        gain.connect(ctx.destination);

        source.onended = () => {
            source.disconnect();
            band.disconnect();
            gain.disconnect();
        };

        source.start(now);
        source.stop(now + 0.04);
    } catch (e) {
        /* Same rule as above. */
    }
}
