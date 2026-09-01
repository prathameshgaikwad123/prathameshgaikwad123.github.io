import { CARD_W, CARD_H, GAP, STRIP_Y, ASPECT_WIDE, ASPECT_TALL } from './config.js';

/* ===================================================================
   THE VIRTUAL AXIS
   -------------------------------------------------------------------
   One rigid row on an endless line. Cards are laid out once by
   cumulative width, and scrolling moves the line rather than the
   cards — so there is no cloning, no re-ordering, and no seam to hide
   when the last card wraps round to sit beside the first.

   Everything below is in stage pixels, which are CSS pixels of the
   canvas box: the renderer applies device pixel ratio, and nothing
   here needs to know about it.
   =================================================================== */

/* Landscape and portrait alternate, which is where the reference's
   rhythm comes from. With an even number of projects the pattern
   closes on itself and the wrap is invisible; with an odd number two
   landscape cards meet once per lap, which is the lesser of the two
   evils against squashing every cover into one shape. */
export function aspectFor(index) {
    return index % 2 === 0 ? ASPECT_WIDE : ASPECT_TALL;
}

/* The row, measured. `width` is the wrap modulus: the distance you have
   to travel to arrive back where you started. */
export function buildStrip(items, stageW, stageH, vars = {}) {
    const height = Math.round(
        Math.min(stageW * (vars.cardW ?? CARD_W), stageH * (vars.cardH ?? CARD_H)),
    );
    const gap = Math.round(height * (vars.gap ?? GAP));
    const centreY = stageH * (vars.stripY ?? STRIP_Y);

    let x = 0;
    const cards = items.map((item, i) => {
        const aspect = item.aspect ?? aspectFor(i);
        const w = Math.round(height * aspect);
        const card = { index: i, item, x, w, h: height, centre: x + w / 2 };
        x += w + gap;
        return card;
    });

    return { cards, height, gap, centreY, width: x, stageW, stageH };
}

/* Fold a distance into [-half, +half) about the strip's own modulus, so
   a card two laps away is understood as the near copy of itself. */
export function wrapCentred(value, modulus) {
    if (!(modulus > 0)) return value;
    const half = modulus / 2;
    return ((((value + half) % modulus) + modulus) % modulus) - half;
}

/* Where a card sits on screen this frame, in stage pixels, measured to
   its centre. The viewport's own centre is the origin of the fold, so
   the card nearest the middle is always the one reported closest. */
export function screenCentre(card, strip, scroll) {
    return strip.stageW / 2 + wrapCentred(card.centre - scroll - strip.stageW / 2, strip.width);
}

/* Cards with any part inside the stage, plus one card of margin either
   side so nothing pops in at the rim. Returned in draw order, which is
   left to right: the strip has no overlap, so depth never comes up.

   The array and the entries in it are reused between frames. Six small
   objects a frame is not much, but it is sixty times a second for as
   long as the strip is moving, and this costs one line. */
export function visible(strip, scroll, out = []) {
    let n = 0;
    for (const card of strip.cards) {
        const cx = screenCentre(card, strip, scroll);
        const half = card.w / 2;
        if (cx + half < -card.w || cx - half > strip.stageW + card.w) continue;
        const entry = out[n] || (out[n] = { card: null, cx: 0 });
        entry.card = card;
        entry.cx = cx;
        n += 1;
    }
    out.length = n;
    out.sort((a, b) => a.cx - b.cx);
    return out;
}

/* Active is the card nearest the middle of the stage. It is a state the
   overlay reads, and nothing else: no card is drawn differently for it.
   Recomputed every frame from the layout rather than tracked, so it
   cannot drift out of step with what is on screen. */
export function activeIndex(strip, scroll) {
    let best = 0;
    let least = Infinity;
    for (const card of strip.cards) {
        const d = Math.abs(screenCentre(card, strip, scroll) - strip.stageW / 2);
        if (d < least) {
            least = d;
            best = card.index;
        }
    }
    return best;
}

/* The scroll value that would put the nearest card dead centre. Handed
   to the smoother as a target rather than applied, so the settle
   inherits the same decay as everything else. */
export function nearestSnap(strip, scroll) {
    let shift = 0;
    let least = Infinity;
    for (const card of strip.cards) {
        const d = screenCentre(card, strip, scroll) - strip.stageW / 2;
        if (Math.abs(d) < least) {
            least = Math.abs(d);
            shift = d;
        }
    }
    return scroll + shift;
}

/* The scroll value that centres one particular card, by the shortest
   way round. Used when the index below the carousel is hovered and the
   strip has to come and meet it. */
export function snapTo(strip, scroll, index) {
    const card = strip.cards[index];
    if (!card) return scroll;
    return scroll + wrapCentred(card.centre - scroll - strip.stageW / 2, strip.width);
}

/* One card's worth of travel, for the arrow keys. The strip has two
   widths in it, so this is the average pitch rather than any one gap —
   the snap tidies up the remainder on settle. */
export function pitch(strip) {
    return strip.width / strip.cards.length;
}
