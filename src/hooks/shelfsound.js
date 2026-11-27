

let ctx = null;
let noise = null;
let last = -1;

function buffer(context) {
    const frames = Math.floor(context.sampleRate * 0.2);
    const buf = context.createBuffer(1, frames, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {

        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    return buf;
}

export function armShelf() {
    if (typeof window === 'undefined') return () => {};

    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return () => {};

    const events = ['pointerdown', 'keydown', 'touchstart'];
    let off = () => {};
    let armed = true;

    const settle = () => {
        if (!armed || !ctx || ctx.state !== 'running') return;
        armed = false;
        off();
    };

    const wake = () => {
        try {
            if (!ctx) {
                ctx = new Context();
                noise = buffer(ctx);
            }
            if (ctx.state === 'suspended') ctx.resume().then(settle, () => {});
            else settle();
        } catch (e) {

            ctx = null;
            noise = null;
        }
    };

    off = () => events.forEach((type) => window.removeEventListener(type, wake));
    events.forEach((type) => window.addEventListener(type, wake, { passive: true }));

    return off;
}

export function topple(weight) {
    if (!ctx || !noise || ctx.state !== 'running') return;

    try {
        const now = ctx.currentTime;
        if (now - last < 0.06) return;
        last = now;

        const source = ctx.createBufferSource();
        source.buffer = noise;

        source.playbackRate.value = 1 / weight;

        const low = ctx.createBiquadFilter();
        low.type = 'lowpass';
        low.frequency.value = 1150 / weight;
        low.Q.value = 0.9;

        const high = ctx.createBiquadFilter();
        high.type = 'highpass';
        high.frequency.value = 120;
        high.Q.value = 0.7;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.38, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        source.connect(high);
        high.connect(low);
        low.connect(gain);
        gain.connect(ctx.destination);

        source.onended = () => {
            source.disconnect();
            high.disconnect();
            low.disconnect();
            gain.disconnect();
        };

        source.start(now);
        source.stop(now + 0.2);
    } catch (e) {
        /* Same rule as above. */
    }
}
