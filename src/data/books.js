

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
            'As someone who designs systems for a living, I kept noticing how much the book is about one: who it serves, who it quietly leaves out, and what it costs to keep it running. Not every sentence lands, but the premise stays with you long after the last page.',
        ],
        alt: 'Cover of The Immortals of Meluha',
    },
    {
        title: 'Metamorphosis',
        tall: 0.93,
        cover: cover('v1790162147/Kafka_fljx2q.png'),
        author: 'Franz Kafka',
        review: [
            'Gregor Samsa wakes up as an insect, and the strangest part is how quickly everyone gets used to it, including him. His first worry isn’t his body; it’s being late for work.',
            'Kafka turns a surreal premise into a quiet study of what we are worth to the people around us once we stop being useful. It’s short enough to finish in an evening and uncomfortable enough to think about for weeks. I read it as a reminder that behind every role, title and deliverable there is a person, and that is who the work is really for.',
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
            'It’s a lesson in restraint: every line earns its place and nothing is there for decoration. That is the kind of economy I aim for in my own work: say less, and make what is left carry the weight.',
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
            'Funny, messy and disarmingly honest: a young graduate in Bangalore ignores every safe career path and builds a business out of an idea, a laptop and a lot of stubbornness, with the question of what the relatives will say hanging over all of it.',
            'It isn’t a polished startup manual, and that’s the point. The wins are half accidental and the plans keep falling apart. It reminded me that the first version of anything is allowed to be rough, as long as you actually put it out into the world.',
        ],
        alt: 'Cover of How I Braved Anu Aunty & Co-founded a Million Dollar Company',
    },
];
