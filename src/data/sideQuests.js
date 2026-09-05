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

   To add one: copy a record, give it the next `no`, and pick a `tilt`
   that does not match either neighbour. Nothing else needs touching.
   =================================================================== */

const plate = (file) => `/assets/images/side-quests/${file}`;

/* `tilt` is the whole of the section's manner: a degree or two off
   true, authored rather than randomised so no two neighbours lean the
   same way and the wall reads as things pinned up over time rather
   than as a grid that has been shaken. It is dropped outright below
   the tablet step and for a reader who has asked for less motion —
   see section 12 of the stylesheet. */
export const sideQuests = [
    {
        id: 'css-experiments',
        no: '01',
        title: 'CSS experiments',
        type: 'Creative coding',
        note: 'Layouts and effects built to find out whether the browser would agree to them.',
        href: null,
        cover: plate('01-css-experiments.svg'),
        alt: 'Placeholder for a set of CSS experiments.',
        tilt: -2.1,
    },
    {
        id: 'tiny-tools',
        no: '02',
        title: 'Tiny web tools',
        type: 'Small builds',
        note: 'Single-purpose pages made because the thing I wanted did not exist yet.',
        href: null,
        cover: plate('02-tiny-tools.svg'),
        alt: 'Placeholder for a set of small single-purpose web tools.',
        tilt: 1.4,
    },
    {
        id: 'generative',
        no: '03',
        title: 'Generative sketches',
        type: 'Creative coding',
        note: 'Rules given to a canvas, then argued with until something came out worth keeping.',
        href: null,
        cover: plate('03-generative.svg'),
        alt: 'Placeholder for a set of generative drawing sketches.',
        tilt: -1.2,
    },
    {
        id: 'illustration',
        no: '04',
        title: 'Illustration doodles',
        type: 'Drawing',
        note: 'Drawn with no brief, no deadline and no particular plan.',
        href: null,
        cover: plate('04-illustration.svg'),
        alt: 'Placeholder for a set of illustration doodles.',
        tilt: 2.3,
    },
    {
        id: 'ai-experiments',
        no: '05',
        title: 'AI experiments',
        type: 'Emerging tools',
        note: 'Prompt-led image and video workflows, kept when the result surprised me.',
        href: null,
        cover: plate('05-ai-experiments.svg'),
        alt: 'Placeholder for a set of AI-assisted design experiments.',
        tilt: -1.7,
    },
    {
        id: 'ui-oddities',
        no: '06',
        title: 'UI oddities',
        type: 'Interface play',
        note: 'Interactions that are almost certainly a bad idea, built to see how bad.',
        href: null,
        cover: plate('06-ui-oddities.svg'),
        alt: 'Placeholder for a set of experimental interface ideas.',
        tilt: 1.9,
    },
];
