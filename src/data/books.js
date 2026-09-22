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

   To add one: append a record. The shelf measures its own row from the
   markup and the lean measures its reach from the spacing between two
   spines, so a fifth book is one line here and nothing anywhere else.
   =================================================================== */

export const BOOKS = [
    { title: 'The Immortals of Meluha', spine: 'Immortals of Meluha', tall: 1 },
    { title: 'Metamorphosis', tall: 0.93 },
    { title: 'Ghachar Ghochar', tall: 0.97 },
    {
        title: 'How I Braved Anu Aunty & Co-founded a Million Dollar Company',
        spine: 'How I Braved Anu Aunty',
        tall: 1.07,
    },
];
