/* The pixel art for the menu's building crew: three workers, drawn as
   grids of palette letters rather than as images, so there is no file to
   fetch and the frames can be assembled in code.

   A worker is SPRITE_W × SPRITE_H cells and faces right; the canvas flips
   a frame when they face left. Every frame is a head, a torso, two legs
   and two arms, put together by `frame()` from a few hand-drawn pieces.

   There are three of them and they share all of it. Only the head and
   the palette differ: the one with the red headband is the original, the
   other two wear hard hats — yellow over an orange shirt, white over a
   green one. */

export const SPRITE_W = 10;
export const SPRITE_H = 15;

const BASE = {
    k: '#1b1722',   /* outline */
    h: '#3a2618',   /* hair */
    s: '#f6c9a0',   /* skin */
    S: '#d9996f',   /* skin, shaded */
    w: '#ffffff',
    r: '#e63946',   /* headband */
    R: '#a8222e',   /* headband, shaded */
    y: '#ffd23f',   /* hard hat */
    Y: '#d9a400',   /* hard hat, shaded */
    b: '#3d7be0',   /* shirt */
    B: '#2a56a8',   /* shirt, shaded */
    p: '#4b507c',   /* trousers */
    P: '#333760',   /* trousers, shaded */
    g: '#8a5230',   /* boots */
    G: '#5a3520',   /* boots, shaded */
};

const HEAD_BAND = [
    '...kkkkk..',
    '..khhhhhk.',
    '.krrrrrrRk',
    '.khhhsskSk',
    '.khhsssssk',
    '..kkssssk.',
];

const HEAD_HAT = [
    '...kyyyk..',
    '..kyyyyyk.',
    '.kYYYYYYYk',
    '.khhhsskSk',
    '.khhsssssk',
    '..kkssssk.',
];

const TORSO = [
    '..kbbbbBk.',
    '..kbbbbBk.',
    '..kbbbBBk.',
    '..kbbbBBk.',
    '..kppppPk.',
];

export const VARIANTS = {
    A: { head: HEAD_BAND, colors: BASE },
    B: {
        head: HEAD_HAT,
        colors: { ...BASE, y: '#ffd23f', Y: '#d9a400', b: '#f2832b', B: '#b85a12' },
    },
    C: {
        head: HEAD_HAT,
        colors: {
            ...BASE,
            y: '#f4f4f4', Y: '#c4c4c4', b: '#3fae5a', B: '#2a7d3f',
            p: '#6a5443', P: '#4a3a2e', h: '#1f1a14', s: '#e0ab82', S: '#bf875f',
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

const POSES = {
    /* Waiting: the arm swings a little between the two. */
    stand: (f, head) => {
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 5, 7, 4);
    },
    stand2: (f, head) => {
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 6, 7, 4);
    },
    /* Bent over to pick a brick up off the pile. */
    pick: (f, head) => {
        f.blit(head, 0, 3);
        f.blit(TORSO.slice(0, 3), 0, 9);
        f.rect(2, 12, 6, 1, 'p');
        f.rect(1, 13, 2, 1, 'P'); f.rect(7, 13, 2, 1, 'p');
        f.rect(0, 14, 3, 1, 'G'); f.rect(7, 14, 3, 1, 'g');
        f.rect(0, 10, 2, 1, 's'); f.rect(8, 10, 2, 2, 's');
    },
    /* Holding one against the chest. */
    carry: (f, head) => {
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        f.rect(5, 7, 3, 2, 'B');
        f.rect(8, 7, 2, 2, 's');
    },
    /* Arm up and back, brick over the head. */
    windup: (f, head) => {
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    /* The follow-through: a step forward and the arm out ahead. */
    throw: (f, head) => {
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.step(f);
        f.rect(6, 6, 2, 2, 'b');
        f.rect(8, 4, 2, 2, 'b');
        f.rect(8, 2, 2, 2, 's');
    },
    /* Both hands up for a brick coming down. */
    reach: (f, head) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    cheerA: (f, head) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    cheerB: (f, head) => {
        arm(f, 1, 0, 8, { up: true, back: true });
        f.blit(head, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 3, 4, { up: true });
    },
};

export const FRAMES = Object.fromEntries(
    Object.entries(VARIANTS).map(([id, v]) => [
        id,
        Object.fromEntries(Object.entries(POSES).map(([name, draw]) => [name, frame((f) => draw(f, v.head))])),
    ]),
);

export const COLORS = Object.fromEntries(
    Object.entries(VARIANTS).map(([id, v]) => [id, v.colors]),
);
