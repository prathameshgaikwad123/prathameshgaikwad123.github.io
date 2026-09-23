/* ===================================================================
   BOOKS
   The four on the shelf in the closing band. Read, not ranked — there
   is no rating and no link out. What each one does carry is a note:
   a press on the spine opens the cover with a few paragraphs beside
   it on what the book was like to read, in the first person.

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

   `author` is printed under the title in the open cover, and `review`
   is the note beside it — one string per paragraph. A book without a
   review opens as a cover on its own, the way a case-study figure does.

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
        author: 'Amish',
        review: [
            'I picked it up for the mythology and stayed for the idea underneath it: that a god might begin as a man who simply chose to act. Amish writes Shiva as a restless tribal leader who questions everything before he believes any of it, and Meluha as a society so perfectly ordered that its cracks become the most interesting thing in it.',
            'As someone who designs systems for a living, I kept noticing how much the book is about one — who it serves, who it quietly leaves out, and what it costs to keep it running. Not every sentence lands, but the premise stays with you long after the last page.',
        ],
        alt: 'Cover of The Immortals of Meluha',
    },
    {
        title: 'Metamorphosis',
        tall: 0.93,
        cover: cover('v1790162147/Kafka_fljx2q.png'),
        author: 'Franz Kafka',
        review: [
            'Gregor Samsa wakes up as an insect, and the strangest part is how quickly everyone gets used to it — including him. His first worry isn’t his body; it’s being late for work.',
            'Kafka turns a surreal premise into a quiet study of what we are worth to the people around us once we stop being useful. It’s short enough to finish in an evening and uncomfortable enough to think about for weeks. I read it as a reminder that behind every role, title and deliverable there is a person — and that is who the work is really for.',
        ],
        alt: 'Cover of Metamorphosis',
    },
    {
        title: 'Ghachar Ghochar',
        tall: 0.97,
        cover: cover('v1790162147/Shanbhag_pfom66.png'),
        author: 'Vivek Shanbhag',
        review: [
            'A small book about a Bangalore family whose fortunes rise, and whose ordinary decency doesn’t quite survive the rise. Shanbhag never raises his voice; the tension builds in kitchen conversations, silences at the dinner table and the things nobody says out loud.',
            'It’s a lesson in restraint — every line earns its place and nothing is there for decoration. That is the kind of economy I aim for in my own work: say less, and make what is left carry the weight.',
        ],
        alt: 'Cover of Ghachar Ghochar',
    },
    {
        title: 'How I Braved Anu Aunty & Co-founded a Million Dollar Company',
        spine: 'How I Braved Anu Aunty',
        tall: 1.07,
        cover: cover('v1790162147/HIBAACAMDC_adzo4d.png'),
        author: 'Varun Agarwal',
        review: [
            'Funny, messy and disarmingly honest: a young graduate in Bangalore ignores every safe career path and builds a business out of an idea, a laptop and a lot of stubbornness — with the question of what the relatives will say hanging over all of it.',
            'It isn’t a polished startup manual, and that’s the point. The wins are half accidental and the plans keep falling apart. It reminded me that the first version of anything is allowed to be rough, as long as you actually put it out into the world.',
        ],
        alt: 'Cover of How I Braved Anu Aunty & Co-founded a Million Dollar Company',
    },
];
