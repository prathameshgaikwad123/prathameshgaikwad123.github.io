/* The pixel art for the menu's building crew: three cats, drawn as grids
   of palette letters rather than as images, so there is no file to fetch
   and the frames can be assembled in code.

   A cat is SPRITE_W × SPRITE_H cells and faces right; the canvas flips a
   frame when they face left. Every frame is a head, a torso, two legs,
   two arms and a tail, put together by `frame()` from a few hand-drawn
   pieces. The poses are the ones the crew has always had — the cats stand
   upright and throw bricks with their paws.

   There are three of them and they share all of it. Only the palette and
   a few patches differ: an orange cat, a white cat, and a white one with
   orange patches, each in a bandana of their own. The letters keep the
   names of the body parts they used to colour — `b` is the main fur,
   `B` the fur in shade, `p` and `P` the same again on the legs, `g` and
   `G` the paws, `s` and `S` the light muzzle and belly, `h` the stripes
   or patches — so that a new coat is only a new palette. */

export const SPRITE_W = 10;
export const SPRITE_H = 15;

const BASE = {
    k: '#1b1722',   /* outline */
    n: '#e8788c',   /* nose */
    w: '#ffffff',
};

const HEAD = [
    '..kk..kk..',
    '.kbbkkbbk.',
    '.kbhbbhbbk',
    '.kbbbbkbbk',
    '.kbbsssnbk',
    '..kkbbbbk.',
];

/* The patched one: orange over an ear and half the forehead. */
const HEAD_PATCHED = [
    '..kk..kk..',
    '.khhkkbbk.',
    '.khhhbbbbk',
    '.khhbbkbbk',
    '.kbbsssnbk',
    '..kkbbbbk.',
];

const TORSO = [
    '..krrrrRk.',
    '..kbrrRBk.',
    '..kbssbBk.',
    '..kbssbBk.',
    '..kppppPk.',
];

/* The patched one: orange on the back and flank. */
const TORSO_PATCHED = [
    '..krrrrRk.',
    '..khbrRBk.',
    '..khhsbBk.',
    '..kbhsbBk.',
    '..kppppPk.',
];

export const VARIANTS = {
    /* The one on the ground: an orange tabby in a blue bandana. */
    A: {
        head: HEAD,
        torso: TORSO,
        colors: {
            ...BASE,
            b: '#f29a3d', B: '#c76a17', p: '#f29a3d', P: '#c76a17',
            g: '#fff0d8', G: '#e6c9a0', s: '#fff0d8', S: '#e6c9a0', h: '#b8570d',
            r: '#3d7be0', R: '#2a56a8',
        },
    },
    /* The one in the middle: a white cat in a red bandana. */
    C: {
        head: HEAD,
        torso: TORSO,
        colors: {
            ...BASE,
            b: '#fffdf8', B: '#cdc7ba', p: '#fffdf8', P: '#cdc7ba',
            g: '#f4f1ea', G: '#cdc7ba', s: '#f6d9d4', S: '#e6bfb8', h: '#aaa498',
            r: '#e63946', R: '#a8222e',
        },
    },
    /* The one at the top: white with orange patches, in a yellow bandana. */
    B: {
        head: HEAD_PATCHED,
        torso: TORSO_PATCHED,
        colors: {
            ...BASE,
            b: '#fffdf8', B: '#cdc7ba', p: '#fffdf8', P: '#cdc7ba',
            g: '#f4f1ea', G: '#cdc7ba', s: '#f6d9d4', S: '#e6bfb8', h: '#f29a3d',
            r: '#ffd23f', R: '#d9a400',
        },
    },
};

function frame(draw) {
    const g = Array.from({ length: SPRITE_H }, () => Array(SPRITE_W).fill('.'));
    const put = (x, y, c) => {
        if (x >= 0 && x < SPRITE_W && y >= 0 && y < SPRITE_H) g[y][x] = c;
    };
    const rect = (x, y, w, h, c) => {
        for (let j = 0; j < h; j += 1) for (let i = 0; i < w; i += 1) put(x + i, y + j, c);
    };
    const blit = (art, ox, oy) => {
        art.forEach((row, j) => {
            [...row].forEach((c, i) => {
                if (c !== '.') put(ox + i, oy + j, c);
            });
        });
    };
    draw({ put, rect, blit });
    return g.map((row) => row.join(''));
}

/* An arm is a sleeve with an outline on its far side and a hand at the
   end, drawn straight up or down from its shoulder. */
function arm({ put, rect }, x, y, len, { up = false, back = false } = {}) {
    const sleeve = back ? 'B' : 'b';
    if (up) {
        rect(x, y, 2, 2, 's');
        rect(x, y + 2, 2, len - 2, sleeve);
        rect(x - 1, y + 2, 1, len - 2, 'k');
        put(x + 2, y + 2, back ? 'k' : 'B');
    } else {
        rect(x, y, 2, len - 1, sleeve);
        rect(x - 1, y, 1, len - 1, 'k');
        rect(x, y + len - 1, 2, 1, 's');
    }
}

const LEGS = {
    stand: ({ rect }) => {
        rect(3, 11, 2, 3, 'P'); rect(2, 14, 3, 1, 'G');
        rect(5, 11, 2, 3, 'p'); rect(5, 14, 4, 1, 'g');
    },
    step: ({ rect }) => {
        rect(2, 11, 2, 2, 'P'); rect(1, 13, 2, 1, 'P'); rect(0, 14, 3, 1, 'G');
        rect(5, 11, 2, 2, 'p'); rect(6, 13, 2, 1, 'p'); rect(6, 14, 4, 1, 'g');
    },
};


/* A cat's tail goes behind everything else: a few cells curving up from
   the hip, outlined, and swaying between two shapes while they wait. */
const TAILS = {
    up: [[1, 11], [0, 10], [0, 9], [0, 8], [1, 7]],
    sway: [[1, 11], [0, 11], [0, 10], [0, 9], [1, 8]],
    low: [[1, 12], [0, 12], [0, 11]],
    back: [[1, 11], [0, 11]],
};

function tail({ put }, name) {
    const cells = TAILS[name];
    cells.forEach(([x, y]) => {
        put(x - 1, y, 'k'); put(x + 1, y, 'k'); put(x, y - 1, 'k'); put(x, y + 1, 'k');
    });
    cells.forEach(([x, y], i) => put(x, y, i === cells.length - 1 ? 'h' : 'b'));
}

const TAIL_FOR = {
    stand: 'up', stand2: 'sway', pick: 'low', carry: 'up', windup: 'sway',
    throw: 'back', reach: 'up', cheerA: 'up', cheerB: 'sway',
};

const POSES = {
    /* Waiting: the arm swings a little between the two. */
    stand: (f, head, torso) => {
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 5, 7, 4);
    },
    stand2: (f, head, torso) => {
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 6, 7, 4);
    },
    /* Bent over to pick a brick up off the pile. */
    pick: (f, head, torso) => {
        f.blit(head, 0, 3);
        f.blit(torso.slice(0, 3), 0, 9);
        f.rect(2, 12, 6, 1, 'p');
        f.rect(1, 13, 2, 1, 'P'); f.rect(7, 13, 2, 1, 'p');
        f.rect(0, 14, 3, 1, 'G'); f.rect(7, 14, 3, 1, 'g');
        f.rect(0, 10, 2, 1, 's'); f.rect(8, 10, 2, 2, 's');
    },
    /* Holding one against the chest. */
    carry: (f, head, torso) => {
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        f.rect(5, 7, 3, 2, 'B');
        f.rect(8, 7, 2, 2, 's');
    },
    /* Arm up and back, brick over the head. */
    windup: (f, head, torso) => {
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    /* The follow-through: a step forward and the arm out ahead. */
    throw: (f, head, torso) => {
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.step(f);
        f.rect(6, 6, 2, 2, 'b');
        f.rect(8, 4, 2, 2, 'b');
        f.rect(8, 2, 2, 2, 's');
    },
    /* Both hands up for a brick coming down. */
    reach: (f, head, torso) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    cheerA: (f, head, torso) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    cheerB: (f, head, torso) => {
        arm(f, 1, 0, 8, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(torso, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 3, 4, { up: true });
    },
};

export const FRAMES = Object.fromEntries(
    Object.entries(VARIANTS).map(([id, v]) => [
        id,
        Object.fromEntries(
            Object.entries(POSES).map(([name, draw]) => [
                name,
                frame((f) => { tail(f, TAIL_FOR[name]); draw(f, v.head, v.torso); }),
            ]),
        ),
    ]),
);

export const COLORS = Object.fromEntries(
    Object.entries(VARIANTS).map(([id, v]) => [id, v.colors]),
);
