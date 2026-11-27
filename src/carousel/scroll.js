import { DECAY, REST_SPEED } from './config.js';

const SAMPLE_WINDOW = 0.1;

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

    push(dx) {
        this.target += dx;
        this._settled = false;
        if (this.instant) this.current = this.target;
    }

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

    dragMove(x, now) {
        if (!this.dragging) return;
        this.target = this._from - (x - this._origin);
        this.current = this.target;
        this.velocity = 0;
        const s = this._samples;
        s.push({ x, t: now });
        while (s.length > 2 && now - s[0].t > SAMPLE_WINDOW) s.shift();
    }

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

            if (dt > 1e-4 && now - last.t < SAMPLE_WINDOW) v = -(last.x - first.x) / dt;
        }
        if (v !== 0) {
            const k = 1 - Math.pow(1 - DECAY, 1); /* per 60Hz frame */
            this.target = this.current + (v / 60) / k;
            this._settled = false;
        }
    }

    rescale(factor) {
        if (!(factor > 0) || factor === 1) return;
        this.current *= factor;
        this.target *= factor;
        this._from *= factor;
    }

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

        if (this.snap && !this.dragging && settle != null) {
            const speed = Math.abs(this.velocity);
            const remaining = Math.abs(this.target - this.current);
            if (speed < this._restSpeed && remaining < this._restSpeed * 0.5) {
                this.target = settle;
            }
        }

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
