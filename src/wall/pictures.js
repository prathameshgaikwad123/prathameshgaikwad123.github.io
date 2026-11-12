import { GLAZE, tone } from './field.js';

/* ===================================================================
   WHAT THE WALL SAYS
   -------------------------------------------------------------------
   Each picture is drawn the ordinary way, small, on a 2D canvas — one
   unit of the wall to four pixels — and the wall is read off it: a
   brick takes the average of the patch it covers, and stops at the
   angle that shows that much ink. So type is set in the site's own
   Castoro, an edge that crosses a brick at a slant leaves it part
   turned, and a photograph needs nothing special done to it.

   A patch that is mostly a colour turns the brick right round to its
   glazed face instead, and fires it that colour.

   `by` is which of the crew starts the picture — an index into CREW,
   'all', or nobody — and `say` is the line under the wall while it is
   up. The lines are the masthead chip's own register: nothing here is
   a caption for the work.
   =================================================================== */

export const CREW = ['ui/ux', 'web', 'brand', 'motion'];

/* The project tiles' own colours, in carousel order — the six cards
   that have a tile. Sampled from public/assets/images/projects/…/tile.webp. */
const TILES = ['#1b4db0', '#0e8b8a', '#8a3fae', '#ff7a2c', '#c7112e', '#0e8f5f'];

const SERIF = "Castoro, 'Iowan Old Style', Georgia, serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/* Set `text` as large as will fit inside the given fractions of the
   wall, centred on its own ink rather than on its em box. */
function set(g, W, H, text, font, high, wide, heavy = 0) {
    let size = H * high;
    g.font = font.replace('%', size);
    let m = g.measureText(text);
    const span = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    if (span > W * wide) {
        size *= (W * wide) / span;
        g.font = font.replace('%', size);
        m = g.measureText(text);
    }
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    const x = (W - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft)) / 2;
    const y = (H + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    g.fillText(text, x, y);
    /* And a little heavier than it was cut: a hairline is thinner than
       a course, and a serif that vanishes is not a serif. */
    if (heavy) {
        g.lineJoin = 'round';
        g.lineWidth = heavy;
        g.strokeText(text, x, y);
    }
}

function nashik() {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(new Date());
    } catch (error) {
        return '';
    }
}

export const PICTURES = {
    hi: {
        say: 'oh, hi.', by: 0,
        draw(g, W, H) { set(g, W, H, 'hi.', `italic %px ${SERIF}`, 1.0, 0.76, 0.9); },
    },

    type: {
        say: 'type & identity', by: 2,
        draw(g, W, H) { set(g, W, H, 'Aa', `%px ${SERIF}`, 0.92, 0.78, 0.9); },
    },

    pointer: {
        say: 'interface', by: 0,
        draw(g, W, H) {
            const u = H * 0.05, x = W / 2 - 5.3 * u, y = H / 2 - 8.1 * u;
            g.beginPath();
            [[0, 0], [0, 13.4], [3.3, 10.4], [5.9, 16.2], [8.6, 15], [6, 9.4], [10.6, 9.4]].forEach(([px, py], n) => {
                if (n) g.lineTo(x + px * u, y + py * u);
                else g.moveTo(x + px * u, y + py * u);
            });
            g.closePath();
            g.fill();
        },
    },

    code: {
        say: 'web, by hand', by: 1,
        draw(g, W, H) { set(g, W, H, '</>', `700 %px ${MONO}`, 0.6, 0.82); },
    },

    play: {
        say: 'motion & video', by: 3,
        draw(g, W, H) {
            const cx = W / 2, cy = H / 2, r = Math.min(H * 0.4, W * 0.42);
            g.beginPath();
            g.arc(cx, cy, r, 0, Math.PI * 2);
            g.arc(cx, cy, r - 2.7, 0, Math.PI * 2, true);
            g.fill();
            g.beginPath();
            g.moveTo(cx - r * 0.3, cy - r * 0.5);
            g.lineTo(cx + r * 0.56, cy);
            g.lineTo(cx - r * 0.3, cy + r * 0.5);
            g.closePath();
            g.fill();
        },
    },

    /* A path with its handles out: the pen tool, mid-stroke. The curve
       is heavy and the handles are fine, and the wall keeps the
       difference — the handles come out as bricks only part turned. */
    pen: {
        say: 'drawn, not found.', by: 2,
        draw(g, W, H) {
            const a = [W * 0.14, H * 0.7], b = [W * 0.86, H * 0.3];
            const ca = [W * 0.3, H * 0.12], cb = [W * 0.7, H * 0.88];
            g.lineCap = 'round';
            g.lineWidth = 1.1;
            g.beginPath();
            g.moveTo(a[0], a[1]); g.lineTo(ca[0], ca[1]);
            g.moveTo(b[0], b[1]); g.lineTo(cb[0], cb[1]);
            g.stroke();
            g.lineWidth = 2.8;
            g.beginPath();
            g.moveTo(a[0], a[1]);
            g.bezierCurveTo(ca[0], ca[1], cb[0], cb[1], b[0], b[1]);
            g.stroke();
            [ca, cb].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 1.9, 0, Math.PI * 2); g.fill(); });
            [a, b].forEach(([x, y]) => { g.fillRect(x - 3, y - 2.5, 6, 5); });
        },
    },

    /* Six tiles in two rows of three, cut to whole bricks. */
    work: {
        say: 'the work.', by: 'all',
        draw(g, W, H) {
            const gap = 4;
            const w = Math.floor((W - 6 - gap * 2) / 6) * 2;
            const h = Math.floor((H - 6 - 2) / 2);
            const x = Math.round((W - (w * 3 + gap * 2)) / 4) * 2;
            const y = Math.round((H - (h * 2 + 2)) / 2);
            TILES.forEach((hex, n) => {
                g.fillStyle = hex;
                g.fillRect(x + (n % 3) * (w + gap), y + Math.floor(n / 3) * (h + 2), w, h);
            });
        },
    },

    /* Not a picture: a rule, asked again every frame. Stripes bent by a
       second, slower wave, so the bands of ink wander across the wall
       and never quite repeat. */
    field: {
        say: 'weird little things.', by: 1,
        live(x, y, t) {
            const bend = Math.sin(y * 0.2 + t * 0.55) * 2.3 + Math.sin(x * 0.07 - t * 0.31) * 1.4;
            const u = 0.5 + 0.5 * Math.sin(x * 0.27 + bend + t * 0.7);
            return u < 0.32 ? 0 : u > 0.68 ? 1 : (u - 0.32) / 0.36;
        },
    },

    /* What time it is where the person you are about to write to is. */
    clock: {
        say: 'in nashik, right now.', by: null,
        stamp: nashik,
        /* Hours over minutes, the way a flap clock stacks them: at this
           size five characters on one line are too fine to lay in brick. */
        draw(g, W, H) {
            const [hh, mm] = nashik().split(':');
            if (!mm) return;
            g.save();
            g.translate(0, -H * 0.235);
            set(g, W, H, hh, `%px ${SERIF}`, 0.52, 0.66, 1.1);
            g.translate(0, H * 0.47);
            set(g, W, H, mm, `%px ${SERIF}`, 0.52, 0.66, 1.1);
            g.restore();
        },
    },

    rest: { say: 'built, not found.', by: null, draw() {} },
};

/* The order they come round in when nobody is asking for one. */
export const REEL = ['hi', 'type', 'pointer', 'code', 'play', 'pen', 'work', 'field', 'rest'];

/* And the one each row of the navigation asks for, by the section the
   row leads to. */
export const ASKED = { about: 'hi', work: 'work', 'side-quests': 'field', contact: 'clock' };

const SCALE = 4;
const linear = (v) => Math.pow(v / 255, 2.2);

/* Returns paint(picture, dark, kit, angles, glazes, time): fills
   `angles` with one angle a brick, and `glazes` with a linear colour
   for each brick that has turned to its glazed face. */
export function createPainter(field) {
    const W = field.width, H = field.rows;
    const canvas = document.createElement('canvas');
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const g = canvas.getContext('2d', { willReadFrequently: true });

    return function paint(picture, dark, kit, angles, glazes, time) {
        if (picture.live) {
            for (let i = 0; i < field.n; i += 1) {
                const ink = picture.live(field.x[i], field.y[i], time);
                angles[i] = tone(dark ? 1 - ink : ink);
            }
            return;
        }

        g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#000';
        g.strokeStyle = '#000';
        picture.draw(g, W, H, kit);
        const px = g.getImageData(0, 0, W * SCALE, H * SCALE).data;
        const line = W * SCALE * 4;

        for (let i = 0; i < field.n; i += 1) {
            const x0 = field.from[i] * SCALE, x1 = x0 + field.span[i] * SCALE;
            const y0 = (H - 1 - field.row[i]) * SCALE;
            let a = 0, r = 0, gr = 0, b = 0;
            for (let y = y0; y < y0 + SCALE; y += 1) {
                for (let x = x0; x < x1; x += 1) {
                    const o = y * line + x * 4, al = px[o + 3];
                    a += al; r += px[o] * al; gr += px[o + 1] * al; b += px[o + 2] * al;
                }
            }
            const cover = a / (255 * SCALE * (x1 - x0));
            if (a > 0) { r /= a; gr /= a; b /= a; }
            const lum = (0.3 * r + 0.59 * gr + 0.11 * b) / 255;

            if (cover >= 0.5 && Math.max(r, gr, b) - Math.min(r, gr, b) > 40) {
                angles[i] = GLAZE;
                glazes[i * 3] = linear(r);
                glazes[i * 3 + 1] = linear(gr);
                glazes[i * 3 + 2] = linear(b);
            } else if (!picture.photo) {
                /* A drawing is ink or it is not: only a brick an edge
                   really crosses is left part turned. */
                const t = Math.min(1, Math.max(0, (cover * (1 - lum) - 0.22) / 0.56));
                const ink = t * t * (3 - 2 * t);
                angles[i] = tone(dark ? 1 - ink : ink);
            } else if (cover < 0.14) {
                angles[i] = dark ? tone(1) : tone(0);
            } else {
                /* The same greys on either wall: a photograph is not a
                   drawing to be reversed. On the dark one its blacks are
                   held a little off black, so the hair keeps an edge
                   against a wall that is black already; and a brick the
                   cut-out only partly covers is fired part way to the
                   wall's own colour. */
                const ground = dark ? 0.06 : 0.965;
                const grey = dark ? 0.15 + 0.85 * lum : lum;
                const v = (ground + (grey - ground) * Math.min(1, cover / 0.92)) * 255;
                angles[i] = GLAZE;
                glazes[i * 3] = glazes[i * 3 + 1] = glazes[i * 3 + 2] = linear(v);
            }
        }
    };
}
