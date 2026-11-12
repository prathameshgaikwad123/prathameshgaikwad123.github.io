/* The crew: four pointers with a name each, the way collaborators show
   up in a design file — except that all four are the same person.

   They are ordinary elements laid over the canvas, not drawn into it,
   so their type is the site's type and the stylesheet owns how they
   look (section 7, .wall-hand). This file only says where each one is
   going, whether it is on stage, and when it presses.

   Each eases toward wherever it was last sent rather than being placed
   there, so a hand that is sent somewhere new while still travelling
   bends its path instead of jumping. */

const ARROW = '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">'
    + '<path d="M1 1v12.2l3.3-3 2.3 4.9 2.2-1-2.3-4.8H11z"/></svg>';

export function createCrew(stage, names) {
    const hands = names.map((name, n) => {
        const el = document.createElement('span');
        el.className = 'wall-hand';
        el.innerHTML = `${ARROW}<span></span>`;
        el.lastChild.textContent = name;
        stage.appendChild(el);
        return { el, x: -40, y: 40 + n * 30, tx: -40, ty: 40 + n * 30, on: false, until: 0 };
    });

    return {
        hands,

        send(k, x, y) {
            hands[k].tx = x;
            hands[k].ty = y;
        },

        show(k, on, until = Infinity) {
            const hand = hands[k];
            hand.until = until;
            if (hand.on === on) return;
            hand.on = on;
            hand.el.classList.toggle('is-on', on);
        },

        press(k) {
            const { el } = hands[k];
            el.classList.remove('is-press');
            /* Read back so the class coming off and going on again are
               two style changes, not one that cancels out. */
            void el.offsetWidth;
            el.classList.add('is-press');
        },

        clear() {
            hands.forEach((hand, k) => this.show(k, false));
        },

        /* `quick` is how tightly a hand follows what it was sent: loose
           while it travels to a click, tight while it lays a course. */
        tick(dt, now, quick) {
            const k = Math.min(1, dt * quick);
            hands.forEach((hand, n) => {
                if (hand.on && now > hand.until) this.show(n, false);
                hand.x += (hand.tx - hand.x) * k;
                hand.y += (hand.ty - hand.y) * k;
                hand.el.style.transform = `translate(${hand.x.toFixed(1)}px,${hand.y.toFixed(1)}px)`;
            });
        },

        dispose() {
            hands.forEach((hand) => hand.el.remove());
        },
    };
}
