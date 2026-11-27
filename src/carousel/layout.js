import { CARD_W, CARD_H, GAP, STRIP_Y, ASPECT_WIDE, ASPECT_TALL } from './config.js';
import { unwarpPoint } from './warp.js';

export function aspectFor(index) {
    return index % 2 === 0 ? ASPECT_WIDE : ASPECT_TALL;
}

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

export function wrapCentred(value, modulus) {
    if (!(modulus > 0)) return value;
    const half = modulus / 2;
    return ((((value + half) % modulus) + modulus) % modulus) - half;
}

export function screenCentre(card, strip, scroll) {
    return strip.stageW / 2 + wrapCentred(card.centre - scroll - strip.stageW / 2, strip.width);
}

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

export function snapTo(strip, scroll, index) {
    const card = strip.cards[index];
    if (!card) return scroll;
    return scroll + wrapCentred(card.centre - scroll - strip.stageW / 2, strip.width);
}

export function pitch(strip) {
    return strip.width / strip.cards.length;
}

const under = { x: 0, y: 0 };

export function cardAt(strip, scroll, x, y) {
    if (!strip || !(strip.stageW > 0) || !(strip.stageH > 0)) return -1;

    unwarpPoint(x / strip.stageW, y / strip.stageH, under);
    const px = under.x * strip.stageW;
    const py = under.y * strip.stageH;

    if (Math.abs(py - strip.centreY) > strip.height / 2) return -1;
    for (const card of strip.cards) {
        if (Math.abs(px - screenCentre(card, strip, scroll)) <= card.w / 2) return card.index;
    }
    return -1;
}
