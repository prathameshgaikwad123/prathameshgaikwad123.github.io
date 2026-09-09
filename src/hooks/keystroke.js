/* The typing sound, synthesised rather than loaded: one short filtered
   noise burst per keystroke, built from three nodes on the audio graph
   the browser already has. No asset, no dependency, and nothing that
   can fail to arrive — a keyboard click is a few milliseconds of
   broadband noise, which is cheaper to make than to fetch.

   The whole file is written around one rule: the sound is a courtesy
   and never a condition. Browsers block audio until the visitor has
   asked for something, and the statement types itself on load — so the
   common case is that nothing is ever heard, and that is the correct
   outcome rather than a failure to report. Nothing here is announced,
   nothing is offered to switch on, and every call is a no-op until a
   context exists and is running.

   The context is built inside the gesture handler rather than on
   arming, which is the reason there is no console warning: a context
   constructed without one is created suspended and says so. */

let ctx = null;
let noise = null;
let last = -1;

/* Forty milliseconds of white noise, made once and played from. Short
   enough that the burst is a click rather than a hiss. */
function buffer(context) {
    const frames = Math.floor(context.sampleRate * 0.04);
    const buf = context.createBuffer(1, frames, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
        /* Faded across its own length, so the burst has no edge of its
           own for the envelope below to have to hide. */
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    return buf;
}

/* Listens for the first gesture of any kind and builds the context on
   it. Returns the teardown — the listeners come off with the animation
   they were armed for, so a page whose typing has finished is not left
   holding three of them. */
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
            /* No audio on this device, or none allowed. Silence is the
               fallback and the reader is told nothing. */
            ctx = null;
            noise = null;
        }
    };

    off = () => events.forEach((type) => window.removeEventListener(type, wake));
    events.forEach((type) => window.addEventListener(type, wake, { passive: true }));

    return off;
}

/* One keystroke, if there is anything to play it through. Low, short,
   and rate-limited off the audio clock rather than the wall clock, so a
   cadence that ever tightens cannot turn the line into a buzz. */
export function keystroke() {
    if (!ctx || !noise || ctx.state !== 'running') return;

    try {
        const now = ctx.currentTime;
        if (now - last < 0.04) return;
        last = now;

        const source = ctx.createBufferSource();
        source.buffer = noise;

        /* The body of a key being struck, and nothing either side of
           it: the low end is a thud the page has no reason to make and
           the top is a hiss. */
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

        /* Taken off the graph the moment it has finished sounding —
           sixteen of these arrive in a second and a half, and a node
           left connected is a node the context keeps. */
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
