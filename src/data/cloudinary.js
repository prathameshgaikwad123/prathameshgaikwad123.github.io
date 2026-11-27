

const UPLOAD = 'https://res.cloudinary.com/duhuxaukd/image/upload/';

/* Widths for an <img> srcset, in CSS pixels times density. */
export const WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 1920, 2560];

/* Heights for a texture, which the carousel sizes by height. */
export const HEIGHTS = [360, 540, 720, 900, 1080, 1350, 1600, 2048];

export const isCloudinary = (src) => typeof src === 'string' && src.startsWith(UPLOAD);

/* The smallest step on a ladder that is at least `px`, or the top one. */
export const step = (px, ladder) => ladder.find((v) => v >= px) || ladder[ladder.length - 1];

/* One delivery URL. `w` or `h` is a ceiling in device pixels. */
export function cld(src, { w, h } = {}) {
    if (!isCloudinary(src)) return src;
    const t = ['f_auto', 'q_auto', 'c_limit'];
    if (w) t.push(`w_${w}`);
    if (h) t.push(`h_${h}`);
    return `${UPLOAD}${t.join(',')}/${src.slice(UPLOAD.length)}`;
}

export function responsive(src, sizes, { max = 2560, fallback = 800 } = {}) {
    if (!isCloudinary(src)) return { src };
    const ladder = WIDTHS.filter((w) => w <= max);
    return {
        src: cld(src, { w: step(fallback, ladder) }),
        srcSet: ladder.map((w) => `${cld(src, { w })} ${w}w`).join(', '),
        sizes,
    };
}
