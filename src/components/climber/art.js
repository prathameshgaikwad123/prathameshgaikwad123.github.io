/* The pixel art for the menu climber: one small person, drawn as a grid
   of palette letters rather than as an image, so there is no file to
   fetch and the frames can be assembled in code.

   The person is SPRITE_W × SPRITE_H cells and faces right; the canvas
   flips a frame when they face left. Every frame is a head, a torso, two
   legs and two arms, put together by `frame()` from a few hand-drawn
   pieces. */

export const SPRITE_W = 10;
export const SPRITE_H = 15;

export const COLORS = {
    k: '#1b1722',   /* outline */
    h: '#3a2618',   /* hair */
    s: '#f6c9a0',   /* skin */
    S: '#d9996f',   /* skin, shaded */
    w: '#ffffff',   /* eye white */
    r: '#e63946',   /* headband */
    R: '#a8222e',   /* headband, shaded */
    b: '#3d7be0',   /* shirt */
    B: '#2a56a8',   /* shirt, shaded */
    p: '#4b507c',   /* trousers */
    P: '#333760',   /* trousers, shaded */
    g: '#8a5230',   /* boots */
    G: '#5a3520',   /* boots, shaded */
};

const HEAD = [
    '...kkkkk..',
    '..khhhhhk.',
    '.krrrrrrRk',
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
   end, drawn straight up or down from its shoulder. `back` arms are the
   shaded one, behind the body. */
function arm({ put, rect }, x, y, len, { up = false, back = false } = {}) {
    const sleeve = back ? 'B' : 'b';
    const edge = back ? 'k' : 'k';
    if (up) {
        /* hand at the top, sleeve running down to the shoulder at y + len */
        rect(x, y, 2, 2, 's');
        rect(x, y + 2, 2, len - 2, sleeve);
        rect(x - 1, y + 2, 1, len - 2, edge);
        put(x + 2, y + 2, back ? 'k' : 'B');
    } else {
        rect(x, y, 2, len - 1, sleeve);
        rect(x - 1, y, 1, len - 1, edge);
        rect(x, y + len - 1, 2, 1, 's');
    }
}

const LEGS = {
    stand: ({ rect }) => {
        rect(3, 11, 2, 3, 'P'); rect(2, 14, 3, 1, 'G');
        rect(5, 11, 2, 3, 'p'); rect(5, 14, 4, 1, 'g');
    },
    walkA: ({ rect }) => {
        rect(2, 11, 2, 2, 'P'); rect(1, 13, 2, 1, 'P'); rect(0, 14, 3, 1, 'G');
        rect(5, 11, 2, 2, 'p'); rect(6, 13, 2, 1, 'p'); rect(6, 14, 4, 1, 'g');
    },
    walkB: ({ rect }) => {
        rect(3, 11, 2, 3, 'P'); rect(2, 14, 3, 1, 'G');
        rect(5, 11, 2, 2, 'p'); rect(5, 13, 4, 1, 'g');
    },
    climbA: ({ rect }) => {
        rect(3, 11, 2, 3, 'P'); rect(2, 14, 3, 1, 'G');
        rect(5, 11, 3, 1, 'p'); rect(7, 12, 2, 1, 'p'); rect(7, 13, 3, 1, 'g');
    },
    climbB: ({ rect }) => {
        rect(3, 11, 3, 1, 'P'); rect(5, 12, 2, 1, 'P'); rect(5, 13, 3, 1, 'G');
        rect(5, 11, 2, 3, 'p'); rect(5, 14, 4, 1, 'g');
    },
    air: ({ rect }) => {
        rect(2, 11, 2, 2, 'P'); rect(1, 13, 3, 1, 'G');
        rect(6, 11, 2, 2, 'p'); rect(6, 13, 4, 1, 'g');
    },
};

const POSES = {
    stand: (f) => {
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 5, 7, 4);
    },
    walkA: (f) => {
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.walkA(f);
        arm(f, 3, 7, 4, { back: true });
    },
    walkB: (f) => {
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.walkB(f);
        arm(f, 6, 7, 4);
    },
    climbA: (f) => {
        arm(f, 1, 3, 5, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.climbA(f);
        arm(f, 8, 0, 7, { up: true });
    },
    climbB: (f) => {
        arm(f, 1, 0, 8, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.climbB(f);
        arm(f, 8, 3, 4, { up: true });
    },
    slip: (f) => {
        arm(f, 1, 1, 6, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        /* mouth open */
        f.put(7, 4, 'k'); f.put(7, 5, 'k');
        LEGS.air(f);
        arm(f, 8, 0, 7, { up: true });
    },
    cheerA: (f) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 1, 6, { up: true });
    },
    cheerB: (f) => {
        arm(f, 1, 0, 8, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.stand(f);
        arm(f, 7, 3, 4, { up: true });
    },
    air: (f) => {
        arm(f, 1, 2, 5, { up: true, back: true });
        f.blit(HEAD, 0, 0); f.blit(TORSO, 0, 6);
        LEGS.air(f);
        arm(f, 7, 1, 6, { up: true });
    },
    crouch: (f) => {
        /* Knees bent, head down a few rows, arms out for balance. */
        f.blit(HEAD, 0, 3);
        f.blit(TORSO.slice(0, 3), 0, 9);
        f.rect(2, 12, 6, 1, 'p');
        f.rect(1, 13, 2, 1, 'P'); f.rect(7, 13, 2, 1, 'p');
        f.rect(0, 14, 3, 1, 'G'); f.rect(7, 14, 3, 1, 'g');
        f.rect(0, 10, 2, 1, 's'); f.rect(8, 10, 2, 1, 's');
    },
};

export const FRAMES = Object.fromEntries(
    Object.entries(POSES).map(([name, draw]) => [name, frame(draw)]),
);

/* The alternating pair a moving pose swaps between. */
export const CYCLES = {
    walk: ['walkA', 'walkB'],
    climb: ['climbA', 'climbB'],
    cheer: ['cheerA', 'cheerB'],
};
