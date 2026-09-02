/* The overlay: one fixed layer that travels with the page and does three
   jobs at once.

   It takes the click that closes the menu, it carries the dimming the
   page goes under, and it draws the frame that turns the page into a
   plate lifted off the panel's ground — a bar on the top and bottom
   edges of the screen, and a fillet at the right-hand end of each,
   which is where the page now meets the navigation.

   It is set in the same inverted zone the panel is, purely to be certain
   of that ground in either theme: the frame reads --paper back out of
   the zone rather than restating a colour the panel already declares.

   Everything in here is decoration for a state, so all of it is hidden
   from assistive technology; the click it takes is a convenience, and
   Escape and the toggle are the ways out that are announced. */
export default function Underlay({ innerRef, onClick }) {
    return (
        <div className="underlay" ref={innerRef} onClick={onClick} aria-hidden="true" data-underlay="">
            <div className="underlay__dark" />
            <div className="underlay__frame zone-invert">
                <div className="underlay__row">
                    <div className="underlay__bar" />
                    <div className="underlay__fillet" />
                </div>
                <div className="underlay__row">
                    <div className="underlay__bar" />
                    <div className="underlay__fillet" />
                </div>
            </div>
        </div>
    );
}
