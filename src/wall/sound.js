

let ctx = null;
let noise = null;

/* Thirty milliseconds of noise, faded across its own length. */
function buffer(context) {
    const frames = Math.floor(context.sampleRate * 0.03);
    const buf = context.createBuffer(1, frames, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    return buf;
}

/* Call from inside the pointerdown that caused it. */
export function clatter() {
    if (typeof window === 'undefined') return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;

    try {
        if (!ctx) {
            ctx = new Context();
            noise = buffer(ctx);
        }
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const start = ctx.currentTime + 0.01;

        for (let n = 0; n < 16; n += 1) {

            const at = start + (n / 16) ** 1.5 * 0.5 + Math.random() * 0.012;
            const source = ctx.createBufferSource();
            source.buffer = noise;
            source.playbackRate.value = 0.8 + Math.random() * 0.5;

            const band = ctx.createBiquadFilter();
            band.type = 'bandpass';
            band.frequency.value = 1500 + Math.random() * 1400;
            band.Q.value = 1.6;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.05 * (1 - n / 18), at);
            gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);

            source.connect(band).connect(gain).connect(ctx.destination);
            source.start(at);
            source.stop(at + 0.06);
        }
    } catch (error) {

        ctx = null;
        noise = null;
    }
}
