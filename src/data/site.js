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

   Two names per row. `label` is the destination and `said` is the
   reader being told, in their own words, what is down there — the panel
   is the one place on the site where the sections get to introduce
   themselves rather than be listed.

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
