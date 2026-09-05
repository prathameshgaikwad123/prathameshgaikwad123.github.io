/* Site-wide constants. Content only — nothing here is generated. */

export const SITE = {
    name: 'Prathamesh Gaikwad',
    role: 'Multidisciplinary Digital Designer',
    initials: 'PG',
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
   page contains. Home is not here — the wordmark in the masthead is the
   way back to the top, and a panel that opens over the page does not
   need a row for the page it opened over. Capabilities is not here
   either: it is a section a reader arrives at by reading, between About
   and Side Quests, rather than one they are sent to. Experience is not
   here because it is not anywhere any more.

   The numerals are the panel's own count, not the page's. A section
   numbers itself in its own header — Capabilities is 04 on the page and
   absent from this list, and neither is wrong, because they are
   counting different things: the page counts its bands, the panel
   counts its destinations. */
export const SECTIONS = [
    { id: 'work', no: '01', label: 'Work' },
    { id: 'about', no: '02', label: 'About' },
    { id: 'side-quests', no: '03', label: 'Side Quests' },
    { id: 'contact', no: '04', label: 'Contact' },
];

export const INTRO_PHRASE = 'Hold that thought';
