/* ===================================================================
   CLOUDINARY DELIVERY
   Every raster on the site that comes from Cloudinary is recorded in
   the data files as its original upload — the URL with nothing between
   `upload/` and the version — and is asked for through here, at the
   size the page is about to draw it.

   An original is the file as it was exported: a full-size PNG, several
   megabytes of it, whatever the screen. What is asked for here is the
   same picture with three things decided by Cloudinary at the edge:

     f_auto   the format — AVIF or WebP to a browser that says it takes
              them (the Accept header, which Cloudinary varies on), the
              original format to one that does not.
     q_auto   the compression, chosen per image by Cloudinary's own
              perceptual measure rather than a fixed number; `good`, its
              default, is the level it describes as visually lossless.
     c_limit  a ceiling, not a resize: the width or height asked for is
              a maximum, and an original smaller than it is delivered at
              its own size rather than enlarged.

   The sizes come from two short fixed ladders rather than from the
   exact pixel count a layout happens to work out. Every distinct URL
   is a separate derivative Cloudinary has to make and its CDN has to
   hold, so a few dozen widths shared by every visitor stay warm at the
   edge where a new one per window size would miss every time.

   A URL that is not a Cloudinary upload — the labelled SVG placeholders
   in public/assets/images — is handed back untouched, so a record can
   move from a placeholder to a real upload by changing its path and
   nothing else.
   =================================================================== */

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

/* The attributes of a responsive <img>: a srcset over the width ladder
   up to `max` (the original's own width — a candidate past it would be
   the same file described as a larger one), the `sizes` that says how
   wide the image is drawn, and a `src` for a browser that reads neither.
   The covers are uploaded around 2560 wide, which is the default top.
   A placeholder gets its own src and nothing else. */
export function responsive(src, sizes, { max = 2560, fallback = 800 } = {}) {
    if (!isCloudinary(src)) return { src };
    const ladder = WIDTHS.filter((w) => w <= max);
    return {
        src: cld(src, { w: step(fallback, ladder) }),
        srcSet: ladder.map((w) => `${cld(src, { w })} ${w}w`).join(', '),
        sizes,
    };
}
