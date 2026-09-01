/* ===================================================================
   GLSL — two passes
   -------------------------------------------------------------------
   Pass one draws the ground and the cards flat, at stage resolution,
   into a texture. Pass two is the glass: one fullscreen triangle that
   reads that texture back through the warp.

   Nothing about the strip is curved geometry. What was measured off
   the reference is a screen-space field, so it is reproduced as one.
   =================================================================== */

export const QUAD_VERT = `#version 300 es
in vec2 aPos;
uniform vec4 uRect;   /* x, y, w, h — device pixels, origin top left */
uniform vec2 uRes;
out vec2 vUv;
void main() {
    vec2 px = uRect.xy + aPos * uRect.zw;
    gl_Position = vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0);
    vUv = aPos;
}`;

/* One card. The image is cover-fitted into whatever aspect the strip
   gave it, and the only surface treatment is a hairline lift along the
   edges — measured in the reference as a cool near-white a single pixel
   wide, heavier on the top and left, which is a light source at the
   upper left and the one thing that stops the cards reading as holes
   cut in the ground. No radius. No shadow. */
export const CARD_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uImage;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform vec2 uHair;        /* hairline width as a fraction of the card */
uniform float uEdge;
uniform float uFade;       /* cards resolve in as their texture arrives */
uniform vec3 uGround;
void main() {
    vec3 colour = texture(uImage, vUv * uCoverScale + uCoverOffset).rgb;

    float top   = 1.0 - smoothstep(0.0, uHair.y, vUv.y);
    float left  = 1.0 - smoothstep(0.0, uHair.x, vUv.x);
    float base  = 1.0 - smoothstep(0.0, uHair.y, 1.0 - vUv.y);
    float right = 1.0 - smoothstep(0.0, uHair.x, 1.0 - vUv.x);
    float lift  = uEdge * clamp(max(top, left) + max(base, right) * 0.55, 0.0, 1.0);

    /* Additive rather than a blend toward a colour, because that is
       what the reference measures as: the boundary pixels of its centre
       card run about +10 green and +25 blue over a plain ground-to-card
       mix, whichever way round the contrast happens to go. A light
       refracting at the edge of a plate, not a stroke around a box. */
    colour = min(colour + lift * vec3(0.040, 0.076, 0.125), vec3(1.0));
    fragColor = vec4(mix(uGround, colour, uFade), 1.0);
}`;

export const SCREEN_VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    /* One triangle covering the viewport. vUv is top-down so the
       constants below read the same way they were measured. */
    vUv = vec2(aPos.x, 1.0 - aPos.y);
    gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0);
}`;

/* The glass.

   uWarp holds, per column: the horizontal displacement and the field
   strength e. The horizontal term has to be a table because the base
   map is the integral of 1/m and has no closed form; the vertical term
   is a plain division, because m does not vary with y.

   The pivot the vertical division works about sits below the strip and
   walks outward with the field, which is what lifts a card's top edge
   163 pixels while its bottom edge drops 18, and what turns its
   straight vertical sides into curves. No curvature term is written
   anywhere: it falls out of scaling about a point that is not the
   centre.

   Dispersion arrives twice because the base map is not isotropic and
   the reference's dispersion is: vertically as three magnifications,
   horizontally as a radial offset. See config.js — both were measured,
   and neither route produces the other.

   Blur is a bias into the mip chain, driven by the same e. It is not
   driven by velocity — at 200 pixels a frame the reference's card
   edges are still pin-sharp, and the smear at the sides is there on
   frames where nothing is moving at all. There is a knob for it all
   the same, and it is off; config.js says why. */
export const GLASS_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform sampler2D uWarp;
uniform float uQuad;
uniform float uMag;
uniform float uDisp;
uniform float uDispX;
uniform float uLodMax;
uniform float uPivotNear;
uniform float uPivotRim;
uniform float uVignette;
uniform float uSurge;

vec3 pick(vec2 p, float lod) { return textureLod(uScene, vec2(p.x, 1.0 - p.y), lod).rgb; }

void main() {
    float u = (vUv.x - 0.5) * 2.0;
    vec2 warp = texture(uWarp, vec2(vUv.x, 0.5)).rg;

    /* uSurge is zero unless someone has asked for a velocity response
       — see SURGE in config.js. When it is not, it swells the field
       itself, so magnification, dispersion, blur and pivot all move
       together instead of a separate effect being bolted on. */
    float e = min(warp.y + uSurge * (0.22 + 0.78 * warp.y), 1.6);

    float swell = uQuad * u * u;
    float rim   = uMag * e;
    float pivot = mix(uPivotNear, uPivotRim, sqrt(e));
    float lod   = e * uLodMax;

    /* Red outward, blue inward, by the field. */
    float split = uDispX * e * sign(u);
    vec3 x = vUv.x + warp.x + vec3(-split, 0.0, split);

    vec3 m = 1.0 + swell + rim * vec3(1.0 + uDisp, 1.0, 1.0 - uDisp);
    vec3 y = pivot + (vUv.y - pivot) / m;

    vec3 colour = vec3(
        pick(vec2(x.r, y.r), lod).r,
        pick(vec2(x.g, y.g), lod).g,
        pick(vec2(x.b, y.b), lod).b);

    colour *= 1.0 - uVignette * (1.0 - u * u);
    fragColor = vec4(colour, 1.0);
}`;
