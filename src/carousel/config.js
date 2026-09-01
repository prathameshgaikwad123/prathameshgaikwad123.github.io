/* ===================================================================
   LIQUID-GLASS CAROUSEL — measured constants
   -------------------------------------------------------------------
   Every number here was read off the reference recording rather than
   estimated: 124 frames at 1440 × 900, card edges traced column by
   column against the ground, then fitted. The comment beside each value
   is what it was fitted against, so a future change can be checked the
   same way rather than argued about.

   The whole effect is one screen-space field in x. Nothing here is a
   per-card transform; the strip itself is rigid and the glass is a lens
   the strip passes behind.
   =================================================================== */

/* --- The lens ------------------------------------------------------
   Magnification as a function of the normalised horizontal coordinate
   u = (x / width - 0.5) * 2, so u is -1 at the left rim and +1 at the
   right:

       e = clamp((|u| - ONSET) / (1 - ONSET), 0, 1) ^ POWER
       m = 1 + QUAD * u² + STRENGTH * e

   Flat across the middle 73% — the QUAD term is a 3% swell, not a
   feature you can see — then a steep ramp through the outer 200px.
   Fitted jointly with the pivot below against the traced top *and*
   bottom edge of every usable column of a stationary reference frame —
   795 columns, 1590 edge positions, rms 1.46px. m(±1) lands on 1.557,
   and the rim card's top edge rises 163px while its bottom drops 18,
   which is what the recording does to within a third of a pixel. */
export const ONSET = 0.7348;
export const POWER = 1.2121;
export const QUAD = 0.0535;
export const STRENGTH = 0.5032;

/* --- Where the lens displaces from ---------------------------------
   Scaling radiates from a point below the strip, which is why a card
   at the rim has its top edge swept 164px up and its bottom edge only
   20px down, and why its straight vertical edges arrive as curves.

   The pivot is not fixed: fitted independently at each column it walks
   from 0.584 of the stage height in the shoulder of the ramp to 0.651
   at the rim, and it walks in √e. Holding it still costs nearly twice
   the error, for one mix() in the shader. */
export const PIVOT_NEAR = 0.584;
export const PIVOT_RIM = 0.6513;

/* --- Chromatic dispersion ------------------------------------------
   Red is displaced outward most and blue least, which is what puts the
   warm amber hairline along the rim card's inner edge and the cool
   fringe outboard of it. Both are proportional to the field, so the
   whole thing cancels itself across the flat middle with no masking
   term needed.

   It takes two numbers, because the reference's dispersion is isotropic
   in screen space and the base warp is not. Vertically the map is a
   division by m, so giving each channel its own m produces a separation
   that grows with distance from the pivot: 5.3px at the top edge at
   x=42, 3.1px at x=78, both matched by DISPERSION below.

   Horizontally the base map is an integral, and by the inner edge of a
   rim card the three channels' integrals have barely diverged — that
   route gives a tenth of a pixel where the recording plainly shows two
   and a half. Scanning every fourth frame for a card edge crossing the
   ground cleanly in all three channels gives an outward red-to-blue
   split of 7.8px at |u| = 0.90 and 2.5px at |u| = 0.80, whose ratio is
   the ratio of e at those points to within a tenth of a pixel. So the
   horizontal term is what it measures as: a radial offset proportional
   to the field, of DISPERSION_X of the stage width at the rim. */
export const DISPERSION = 0.02;
export const DISPERSION_X = 0.0048;

/* --- Rim blur -------------------------------------------------------
   Present on completely stationary frames — it belongs to the glass,
   not to the movement. Traced 10–90% edge width runs 1.4px across the
   middle and 9px at the rim; as a bias into a mip chain that is ~2.6
   levels. There is deliberately no velocity term: at 200px/frame the
   reference's card edges are still pin-sharp. */
export const LOD_MAX = 2.6;

/* --- Velocity ------------------------------------------------------
   How much the field swells with speed. Zero, because the reference
   has no velocity term in it at all, and that is a measurement rather
   than a reading of the spec:

     · Sharpness in the flat band is 0.130 on stationary frames and
       0.124 at over 130 pixels a frame — five per cent across a
       hundred-fold change in speed, which is the difference between
       one photograph and another, not motion blur. Card edges at 200
       pixels a frame are pin-sharp.
     · The smear at the rims is present on frames 1 and 119–124, where
       the strip has not moved at all. It belongs to the glass.

   What makes the reference feel like it responds to a flick is that
   the field is fixed and the cards travel *through* it: the harder the
   throw, the faster a card is stretched, bent and pulled apart as it
   reaches the rim, and the faster it settles as it leaves. That is a
   velocity response without a velocity term.

   Turn this up if a swell on top of that is wanted anyway. It adds to
   the field itself, so it moves the magnification, the dispersion, the
   blur and the pivot together rather than bolting a separate effect on
   the side, and it decays with the same filter as the scroll. 0.15 is
   noticeable; 0.4 is a lot. It will move A6 and A7 off the reference. */
export const SURGE = 0;

/* Speed, in stage widths per second, at which SURGE reaches full
   strength. The reference's hardest flick peaks at about four. */
export const SURGE_SPEED = 4;

/* Faint darkening toward the horizontal centre, about 1.5% at its
   deepest. Barely above the recording's noise floor, but the ground
   reads flat and dead without it. */
export const VIGNETTE = 0.02;

/* A hairline lift along the edges of every card, heavier on the top
   and left, consistent with a light source at the upper left. It is
   what stops a card reading as a hole cut in the ground. Not a border:
   a gradient in the card shader, a device pixel and a bit wide, in the
   cool near-white the reference's own card edges measure. */
export const CARD_EDGE = 1;

/* --- The strip ------------------------------------------------------
   Card height is the invariant and widths follow from aspect.

   It is set from the stage's *width*, not its height, and only then
   capped against the height. That is what holds the reference's
   rhythm: how many cards reach across the rim is a ratio of card to
   viewport width, and a section given a shorter band than the
   recording's full screen would otherwise quietly fit five where the
   reference fits three. The cap is there so a very wide, very short
   stage cannot push the row out through the top and bottom.

   Both are fractions, and CSS may override either — along with the gap
   and the row's height on the stage — through --glass-card-w,
   --glass-card-h, --glass-gap and --glass-strip-y, so a breakpoint can
   change the rhythm without changing the code. */
export const CARD_W = 0.225; /* of stage width — 324px of 1440 */
export const CARD_H = 0.46; /* ceiling, as a fraction of stage height */
export const GAP = 0.122; /* of card height — 39.6px of 324 */
export const STRIP_Y = 0.505; /* of stage height — the row's centre line */

/* Landscape and portrait, alternating. Measured at 430/324 = 1.326 and
   256/324 = 0.791 once the frame was unwarped back to source space. */
export const ASPECT_WIDE = 4 / 3;
export const ASPECT_TALL = 4 / 5;

/* --- Motion ---------------------------------------------------------
   Exponential smoothing toward a driven target, not a tween. Measured
   velocity retention is 0.84 per frame at 30fps — a halving every four
   to five frames — which is this coefficient once per frame at 60. */
export const DECAY = 0.084;

/* Below this — in stage widths per second — the strip is treated as at
   rest: the snap engages and the render loop is allowed to stop. */
export const REST_SPEED = 0.03;

/* --- The overlay ----------------------------------------------------
   The title does not cross-dissolve. It leaves in a single frame and
   returns over five, and if the active card changes again on the way
   back it restarts from wherever the opacity had got to. */
export const FADE_OUT = 0.06;
export const FADE_IN = 0.17;

/* Resolution of the warp lookup. The map has no closed form, so it is
   integrated on the CPU once per resize; 1024 samples across the stage
   leave the interpolation error far below a pixel. */
export const LUT_SIZE = 1024;

/* Past this the rim blur is hiding more detail than a third device
   pixel could add, and the second pass is the expensive one. */
export const MAX_DPR = 2;

/* And a ceiling on the second pass's area whatever the ratio, so a
   very large display does not ask for four times the work at the same
   device ratio. 2560 × 1440 clears this at 1×; a retina window clears
   it at 2×. Where it bites, it bites in the band the glass is already
   softening. */
export const MAX_PIXELS = 4.6e6;
