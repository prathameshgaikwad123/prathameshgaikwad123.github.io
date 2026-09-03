import { DECAY, REST_SPEED } from './config.js';

/* ===================================================================
   THE SCROLL MODEL
   -------------------------------------------------------------------
   Exponential smoothing toward a driven target — fifteen lines, no
   library, and the only model that reproduces what the reference
   actually does. Traced frame to frame it ramps linearly while the
   input is live and then decays geometrically once it is released,
   holding 0.84 of its velocity per frame at 30fps. A tween cannot do
   that, because a tween has to know where it is going before it
   starts, and a flick does not.

       target  += whatever the input asked for
       current += (target - current) * k
       velocity = current - previous

   The single coefficient is fixed against real time rather than
   frames, so a 120Hz display and a struggling one decay at the same
   rate rather than at the same number of steps.
   =================================================================== */

/* Pointer samples older than this are dropped before the release
   velocity is worked out, so a throw is read from the last flick of
   the wrist and not from the whole gesture. */
const SAMPLE_WINDOW = 0.1;

/* A frame longer than this is a tab coming back from the background or
   a long task. Stepping the filter by its real length would teleport
   the strip; clamping loses a little travel instead, which nobody can
   see. */
const MAX_STEP = 1 / 20;

export default class Scroller {
    constructor() {
        this.target = 0;
        this.current = 0;
        this.velocity = 0; /* stage px per second */
        this.dragging = false;
        this.snap = true;
        this.instant = false; /* set for reduced motion: no inertia */
        this.modulus = 0; /* set by the owner once the strip is measured */
        this._samples = [];
        this._origin = 0;
        this._from = 0;
        this._settled = true;
    }

    /* Wheel, trackpad, keyboard: everything that arrives as a distance
       goes to the target and lets the filter do the rest. */
    push(dx) {
        this.target += dx;
        this._settled = false;
        if (this.instant) this.current = this.target;
    }

    /* An absolute destination — the snap, or Home and End asking for
       the first or the last project. */
    to(value) {
        this.target = value;
        this._settled = false;
        if (this.instant) this.current = this.target;
    }

    dragStart(x, now) {
        this.dragging = true;
        this._settled = false;
        this._origin = x;
        this._from = this.current;
        this._samples.length = 0;
        this._samples.push({ x, t: now });
    }

    /* One to one with the pointer while it is down. Both target and
       current are moved, so the strip is attached to the finger rather
       than chasing it. */
    dragMove(x, now) {
        if (!this.dragging) return;
        this.target = this._from - (x - this._origin);
        this.current = this.target;
        this.velocity = 0;
        const s = this._samples;
        s.push({ x, t: now });
        while (s.length > 2 && now - s[0].t > SAMPLE_WINDOW) s.shift();
    }

    /* Release hands the gesture's velocity to the filter. Because the
       filter's first step is (target - current) * k, the distance that
       produces a given opening velocity is that velocity divided by k —
       which is the whole of the throw, worked out once. */
    dragEnd(now) {
        if (!this.dragging) return;
        this.dragging = false;
        if (this.instant) return;

        const s = this._samples;
        let v = 0;
        if (s.length > 1) {
            const first = s[0];
            const last = s[s.length - 1];
            const dt = last.t - first.t;
            /* A pointer that stopped before it lifted has no throw in
               it, however fast it was moving a moment earlier. */
            if (dt > 1e-4 && now - last.t < SAMPLE_WINDOW) v = -(last.x - first.x) / dt;
        }
        if (v !== 0) {
            const k = 1 - Math.pow(1 - DECAY, 1); /* per 60Hz frame */
            this.target = this.current + (v / 60) / k;
            this._settled = false;
        }
    }

    /* A resize changes what a lap is worth. Everything the filter is
       holding — including the anchor a drag in progress is measured
       from — moves with it, so the reader keeps their place in the set
       rather than their place in pixels, and a drag that spans the
       resize does not jump. */
    rescale(factor) {
        if (!(factor > 0) || factor === 1) return;
        this.current *= factor;
        this.target *= factor;
        this._from *= factor;
    }

    /* Advance one frame. `dt` is real seconds; `settle` is where the
       strip would like to come to rest, or null for no snap. */
    step(dt, settle) {
        const h = Math.min(Math.max(dt, 1 / 240), MAX_STEP);
        const previous = this.current;

        if (this.instant) {
            this.current = this.target;
        } else if (!this.dragging) {
            const k = 1 - Math.pow(1 - DECAY, h * 60);
            this.current += (this.target - this.current) * k;
        }

        this.velocity = (this.current - previous) / h;

        /* The snap is a change of target, never a change of position:
           it is drawn through the same filter as everything else, so it
           arrives with the same weight as a flick running out. */
        if (this.snap && !this.dragging && settle != null) {
            const speed = Math.abs(this.velocity);
            const remaining = Math.abs(this.target - this.current);
            if (speed < this._restSpeed && remaining < this._restSpeed * 0.5) {
                this.target = settle;
            }
        }

        /* Fold both ends of the filter together so neither runs away
           over a long session and loses its floating point precision.
           Folding only when they agree keeps the difference — which is
           what the filter is actually integrating — untouched. */
        const m = this.modulus;
        if (m > 0 && (this.current < -m || this.current > m)) {
            const shift = Math.floor(this.current / m) * m;
            this.current -= shift;
            this.target -= shift;
            this._from -= shift;
        }

        this._settled =
            !this.dragging &&
            Math.abs(this.velocity) < this._restSpeed &&
            Math.abs(this.target - this.current) < 0.05;

        return this.current;
    }

    /* Whether the frame just drawn is the last one worth drawing. The
       loop parks on this rather than running at 60fps over a still
       image — the glass is a static field, so a stationary strip is a
       stationary picture. */
    get settled() {
        return this._settled;
    }

    set restScale(stageW) {
        this._rest = stageW;
    }

    get _restSpeed() {
        return (this._rest || 1440) * REST_SPEED;
    }
}
