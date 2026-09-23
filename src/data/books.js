/* ===================================================================
   BOOKS
   The four on the shelf in the closing band. Read, not recommended —
   there is no rating, no link and no review anywhere near them,
   because a list of what somebody has read says something a list of
   what they think of it does not, and the second list is a different
   page.

   One record per spine. `title` is the book, and it is what a screen
   reader is given. `spine` is what is printed down the cover, and it
   is here for the one thing a spine cannot do: carry a title long
   enough that the cover is nothing but type. Leave it out and the
   title is printed.

   `tall` is a multiple of the shelf's own book height and is the only
   field here that is not information. Four identical rectangles read
   as a chart; a tenth either side of one is the difference between a
   row of books and a bar graph, and there is no reason to go past it.

   `cover` is the poster a press on the spine opens. Like the carousel
   covers (src/data/projects.js) they are delivered from Cloudinary, and
   the URLs carry no transformation on purpose: an upload URL with
   nothing between `upload/` and the version is the original file, at
   its own resolution and without a recompression pass, which is what a
   poster opened at up to 80% of the window height wants. `alt` is what
   a reader who cannot see the poster is given instead of it.

   To add one: append a record. The shelf measures its own row from the
   markup and the lean measures its reach from the spacing between two
   spines, so a fifth book is one line here and nothing anywhere else.
   =================================================================== */

const cover = (file) => `https://res.cloudinary.com/duhuxaukd/image/upload/${file}`;

export const BOOKS = [
    {
        title: 'The Immortals of Meluha',
        spine: 'Immortals of Meluha',
        tall: 1,
        cover: cover('v1790162147/IM_icierl.png'),
        alt: 'Cover of The Immortals of Meluha',
    },
    {
        title: 'Metamorphosis',
        tall: 0.93,
        cover: cover('v1790162147/Kafka_fljx2q.png'),
        alt: 'Cover of Metamorphosis',
    },
    {
        title: 'Ghachar Ghochar',
        tall: 0.97,
        cover: cover('v1790162147/Shanbhag_pfom66.png'),
        alt: 'Cover of Ghachar Ghochar',
    },
    {
        title: 'How I Braved Anu Aunty & Co-founded a Million Dollar Company',
        spine: 'How I Braved Anu Aunty',
        tall: 1.07,
        cover: cover('v1790162147/HIBAACAMDC_adzo4d.png'),
        alt: 'Cover of How I Braved Anu Aunty & Co-founded a Million Dollar Company',
    },
];
