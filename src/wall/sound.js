/* The wall being struck, synthesised rather than loaded — the same
   arrangement as the typing sound (src/hooks/keystroke.js) and the
   books going over (src/hooks/shelfsound.js), and written around the
   same rule: the sound is a courtesy and never a condition.

   It is heard in exactly one circumstance, which is the reader pressing
   the wall. That press is itself the gesture a browser wants before it
   will play anything, so the context is built inside it and nothing has
   to be armed, offered or announced. Nothing the wall does on its own —
   the crew, the pictures arriving, the rows of the navigation — makes a
   sound, because nobody asked it to.

   What a press sounds like is what it looks like: a ring going out
   through the bricks, each one clacking as it is kicked. So it is not
   one click but a short run of them, quick and close at the start and
   thinning out as the ring gets further away. */

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
            /* Later and quieter the further out the ring has gone, and
               never quite evenly spaced: bricks are not a metronome. */
            const at = start + (n / 16) ** 1.5 * 0.5 + Math.random() * 0.012;
            const source = ctx.createBufferSource();
            source.buffer = noise;
            source.playbackRate.value = 0.8 + Math.random() * 0.5;

            /* Fired clay on clay: a knock in the middle of the band,
               with the thud and the hiss either side taken off. */
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
        /* No audio on this device, or none allowed. Silence is the
           fallback and the reader is told nothing. */
        ctx = null;
        noise = null;
    }
}
