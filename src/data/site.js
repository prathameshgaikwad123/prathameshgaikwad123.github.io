/* Site-wide constants. Content only — nothing here is generated. */

export const SITE = {
    name: 'Prathamesh Gaikwad',
    role: 'Multidisciplinary Digital Designer',
    email: 'prathameshg83800@gmail.com',
    phone: '+91 83800 84093',
    phoneHref: 'tel:+918380084093',
    place: 'Nashik, India',
    linkedin: 'https://www.linkedin.com/in/prathamesh-gaikwad-224734171',
    github: 'https://github.com/prathameshgaikwad123',
    githubHandle: '@prathameshgaikwad123',
    where: 'Based in India · Available Worldwide',
    disciplines: 'UI/UX · Web · Brand · Digital Experiences',
    /* Replaced with the real year on the client, exactly as the previous
       build did — this is only what a reader without JavaScript sees. */
    year: 2026,
};

/* What the navigation offers, which is deliberately less than what the
   page contains. Home is not here — the mark at the left of the
   masthead is the way back to the top, and a panel that opens over the
   page does not need a row for the page it opened over. Capabilities is
   not here either: it is a section a reader arrives at by reading,
   between About and Side Quests, rather than one they are sent to.
   Experience is not here because it is not anywhere any more.

   Two names per row, and only one of them is painted. `said` is the
   reader being told, in their own words, what is down there, and it is
   the whole of the row. `label` is the section's own name, kept because
   the code and the writing both need it — the panel is the one place on
   the site where the sections get to introduce themselves rather than
   be listed, and a row that named itself as well would be saying the
   quiet half out loud.

   `id` is the section the row scrolls to and is not the label: Play is
   Side Quests, which is what the band, its heading and every anchor
   pointing at it still are. Only the row's name changed.

   The numerals are the panel's own count, not the page's. A section
   numbers itself in its own header — Capabilities is 04 on the page and
   absent from this list, and neither is wrong, because they are
   counting different things: the page counts its bands, the panel
   counts its destinations. */
export const SECTIONS = [
    { id: 'about',       no: '01', label: 'About',   said: 'Me.' },
    { id: 'work',        no: '02', label: 'Work',    said: 'The work.' },
    { id: 'side-quests', no: '03', label: 'Play',    said: 'Just because.' },
    { id: 'contact',     no: '04', label: 'Contact', said: 'Say hi.' },
];

/* The last row of the panel, and the only one that goes nowhere. There
   is no fifth section and inventing one to receive this would be a page
   built to justify a word: it is the sign-off on the list, so it is
   written as the end of the list and not as a link to be followed. */
export const MENU_END = { no: '05', label: 'End', said: "That's it." };

export const INTRO_PHRASE = 'Hold that thought';

/* The first thing the identity in the masthead says, and it says it
   once a visit: the first hover, focus or tap spends this and nothing
   spends it again. At rest the chip says nothing at all — the portrait
   is the mark — which is what leaves this line something to do. It is
   an answer to being noticed, and a greeting already sitting on screen
   when the cursor arrives is not answering anything.

   The name used to be here and is not any more: a name in the corner
   of a portfolio is a label on something that is already the person's,
   and the reader is one line further down the page from being told it
   anyway. */
export const GREETING = 'oh, hi.';

/* And what it says from the second gesture on: these, in this order,
   one per gesture. Written in the order they are meant to be read —
   the first few are the ones a stranger meets, so they are the ones
   that have to earn the second hover — and dealt from the top rather
   than picked at random, so a visit hears an opening rather than a
   sample. Once all twenty-five are spent they are shuffled and dealt
   again, and never so that the same one lands twice in a row.

   All in the site's own lower case, each of them something a person
   making things would actually mutter. They are the whole of the
   chip's second state — no card, no tooltip, no menu — so the register
   matters more than the count: nothing here sells anything, and
   nothing here is a caption for the work. */
export const SAYINGS = [
    'made this at 2am.',
    'yes, i use figma.',
    'probably overthinking it.',
    'this looked better yesterday.',
    "i'll fix it later.",
    'one more tweak.',
    'currently making something.',
    'this was supposed to be simple.',
    'i have a tab for that.',
    "there's probably a prototype.",
    'it started as an idea.',
    'somewhere between pixels & pixels.',
    'designing things, breaking things.',
    'i collect unfinished ideas.',
    'another side quest.',
    'not another case study.',
    "yes, that's my face.",
    'the pixels are mine.',
    'built, not found.',
    'made from curiosity.',
    'too many ideas.',
    'still experimenting.',
    'currently somewhere in Figma.',
    'i make weird little things.',
    "there's more than this.",
];
