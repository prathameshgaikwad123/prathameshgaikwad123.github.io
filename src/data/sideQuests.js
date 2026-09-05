/* ===================================================================
   SIDE QUESTS
   Things made because I wanted to. Personal, experimental, small — the
   work that has no brief behind it and no client at the end of it.

   One record per pinned plate. Everything except `href` is required;
   a quest without a link is a plate that simply sits there, which is
   the right answer for the ones that were never published anywhere.

   REPLACE: every `cover` points at a labelled SVG placeholder in
   public/assets/images/side-quests/. Swap the extension here when a
   real 1200×1200 export goes in beside it, and rewrite the `alt`. See
   ASSETS.md.

   To add one: copy a record, give it the next `no` and a `family`.
   Nothing else needs touching — the rail and its counts follow.
   =================================================================== */

const plate = (file) => `/assets/images/side-quests/${file}`;

/* `family` is what the rail above the grid sorts by, and it is
   deliberately coarser than `type`. There are five types across six
   quests, so a rail built from them would have five states in which a
   single card sat alone in a three-column grid. Two families divide
   the same six evenly — three each — so every state of the rail fills
   the grid exactly, which is the whole reason the grid can stay
   aligned while the content changes.

   `type` is still what the card says about itself. The family is how
   it is found; the type is what it is.

   A new family needs nothing but this field: the rail is built from
   whatever families the data contains, in the order they first appear,
   and counts itself. */
export const sideQuests = [
    {
        id: 'css-experiments',
        no: '01',
        family: 'code',
        title: 'CSS experiments',
        type: 'Creative coding',
        note: 'Layouts and effects built to find out whether the browser would agree to them.',
        href: null,
        cover: plate('01-css-experiments.svg'),
        alt: 'Placeholder for a set of CSS experiments.',
    },
    {
        id: 'tiny-tools',
        no: '02',
        family: 'code',
        title: 'Tiny web tools',
        type: 'Small builds',
        note: 'Single-purpose pages made because the thing I wanted did not exist yet.',
        href: null,
        cover: plate('02-tiny-tools.svg'),
        alt: 'Placeholder for a set of small single-purpose web tools.',
    },
    {
        id: 'generative',
        no: '03',
        family: 'code',
        title: 'Generative sketches',
        type: 'Creative coding',
        note: 'Rules given to a canvas, then argued with until something came out worth keeping.',
        href: null,
        cover: plate('03-generative.svg'),
        alt: 'Placeholder for a set of generative drawing sketches.',
    },
    {
        id: 'illustration',
        no: '04',
        family: 'visual',
        title: 'Illustration doodles',
        type: 'Drawing',
        note: 'Drawn with no brief, no deadline and no particular plan.',
        href: null,
        cover: plate('04-illustration.svg'),
        alt: 'Placeholder for a set of illustration doodles.',
    },
    {
        id: 'ai-experiments',
        no: '05',
        family: 'visual',
        title: 'AI experiments',
        type: 'Emerging tools',
        note: 'Prompt-led image and video workflows, kept when the result surprised me.',
        href: null,
        cover: plate('05-ai-experiments.svg'),
        alt: 'Placeholder for a set of AI-assisted design experiments.',
    },
    {
        id: 'ui-oddities',
        no: '06',
        family: 'visual',
        title: 'UI oddities',
        type: 'Interface play',
        note: 'Interactions that are almost certainly a bad idea, built to see how bad.',
        href: null,
        cover: plate('06-ui-oddities.svg'),
        alt: 'Placeholder for a set of experimental interface ideas.',
    },
];
