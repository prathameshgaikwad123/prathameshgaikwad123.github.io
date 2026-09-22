/* The books going over, synthesised rather than loaded — the same
   arrangement the typing sound is built from next door
   (src/hooks/keystroke.js), pitched down two and a half octaves and
   given a body instead of a click. A book landing on its neighbour is
   a short burst of low broadband noise with the top taken off it,
   which is cheaper to make than to fetch and cannot fail to arrive.

   The rule this file is written around is the one that file states: the
   sound is a courtesy and never a condition. Browsers hold audio until
   the visitor has asked for something, so the honest common case is a
   reader who sweeps the shelf with a mouse and hears nothing at all —
   and that is the correct outcome rather than a failure to report.
   Nothing is announced, nothing is offered to switch on, and every call
   below is a no-op until a context exists and is running.

   A context of its own rather than the typing one's: that one is armed
   for the length of the intro and takes its listeners off again when
   the statement has finished typing, so by the time anybody has
   scrolled to the last band there may be no context left to borrow and
   no gesture left to build one on. Two contexts on a page is the cost,
   and it is paid only by a reader who has both heard the intro and
   reached the shelf. */

let ctx = null;
let noise = null;
let last = -1;

/* A fifth of a second of noise, made once and played from. Long enough
   that the envelope below has something to shape — a book has a body
   where a key has only an edge — and short enough that the whole event
   is over before the next one can be asked for. */
function buffer(context) {
    const frames = Math.floor(context.sampleRate * 0.2);
    const buf = context.createBuffer(1, frames, context.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
        /* Faded across its own length, so the burst has no edge of its
           own for the envelope to have to hide. */
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    return buf;
}

/* Listens for the first gesture of any kind and builds the context on
   it. Returns the teardown — the listeners come off with the shelf they
   were armed for, so a reader who has asked for less motion, or who has
   navigated to a case study, is not left holding three of them.

   Pointer movement is deliberately not in the list. Moving a mouse is
   not user activation as a browser counts it, and a context built on it
   is created suspended: the shelf would be silent anyway, and the
   attempt would cost a console warning to say so. */
export function armShelf() {
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

/* One book going over, if there is anything to play it through.

   `weight` is the book's own height as a multiple of the row's, and it
   is the only thing that varies between one thud and the next: a taller
   book is a heavier one, and a heavier one lands lower. Four covers
   that all sounded alike would read as one sample being retriggered,
   which is the thing a synthesised sound is here to avoid.

   Rate-limited off the audio clock rather than the wall clock, for the
   reason the typing sound is: a sweep along the row can ask for four of
   these inside a frame, and four thuds inside a frame is a click. */
export function topple(weight) {
    if (!ctx || !noise || ctx.state !== 'running') return;

    try {
        const now = ctx.currentTime;
        if (now - last < 0.06) return;
        last = now;

        const source = ctx.createBufferSource();
        source.buffer = noise;
        /* Detuned by the same figure that pitches the filter, so the
           body and the noise inside it move together rather than the
           second sliding under the first. */
        source.playbackRate.value = 1 / weight;

        /* The body of a board being struck and nothing above it: past
           about half a kilohertz this stops being a book and starts
           being a page being turned. */
        const low = ctx.createBiquadFilter();
        low.type = 'lowpass';
        low.frequency.value = 340 / weight;
        low.Q.value = 0.8;

        /* And nothing below it either. A thud with its bottom octave
           left in is a sound a laptop speaker renders as a rattle and a
           good pair of headphones renders as a thump in the chest,
           which is more than a shelf should ever be asking for. */
        const high = ctx.createBiquadFilter();
        high.type = 'highpass';
        high.frequency.value = 90;
        high.Q.value = 0.7;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.055, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        source.connect(high);
        high.connect(low);
        low.connect(gain);
        gain.connect(ctx.destination);

        /* Taken off the graph the moment it has finished sounding — a
           node left connected is a node the context keeps. */
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
