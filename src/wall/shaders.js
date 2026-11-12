/* The wall's two programs.

   A brick is a unit box, stretched to size, turned about its long axis
   and pushed forward by however far it has to stand out to turn — all
   in the vertex shader, from one small record per brick, so the whole
   wall is a single instanced draw.

   Which face is which is decided by the normal the box was authored
   with, before any turning:

     +z  paper   matt, the face the wall rests on in the light theme
     +y  ink     black lacquer, a quarter turn away
     -z  glaze   a fired colour, a half turn away
     -y  paper   the underside, seen only on an overshoot
     ±x  ends

   A brick that has stopped part way between paper and ink shows a
   stripe of each, and more of the ink the further it has gone — which
   is how the wall draws in greys with two colours of face. The light
   does the rest: the paper face is turning away from it as the ink
   face turns into it.

   The edges are not modelled. Each face carries its own coordinates,
   and within a bevel's width of an edge the normal is leaned over it,
   so a box of twelve triangles takes a highlight along its arrises like
   something that was cast. */

const COMMON = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUV;
layout(location = 3) in vec3 aT;
layout(location = 4) in vec3 aB;
layout(location = 5) in vec4 aI0;      /* x, y, z, angle */
layout(location = 6) in vec4 aI1;      /* lift, scale, tone, length */
layout(location = 7) in vec4 aI2;      /* glaze rgb, seed */

uniform mat4 uSlab;
uniform vec3 uDim;                     /* half extents of a whole brick */

vec3 turn(vec3 v, float c, float s) {
    return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
}

vec3 halfDim() {
    return vec3(uDim.x * aI1.w, uDim.y, uDim.z);
}

vec4 place(float c, float s) {
    vec3 p = turn(aPos * 2.0 * halfDim() * aI1.y, c, s);
    return uSlab * vec4(aI0.xyz + vec3(0.0, 0.0, aI1.x) + p, 1.0);
}
`;

export const DEPTH_VERT = `${COMMON}
uniform mat4 uLightVP;
void main() {
    gl_Position = uLightVP * place(cos(aI0.w), sin(aI0.w));
}
`;

export const DEPTH_FRAG = `#version 300 es
precision mediump float;
void main() {}
`;

export const BRICK_VERT = `${COMMON}
uniform mat4 uVP;
uniform mat4 uLightVP;

out vec3 vWorld;
out vec3 vN;
out vec3 vT;
out vec3 vB;
out vec3 vFlat;
out vec2 vUV;
out vec2 vFace;
out vec4 vLit;
out vec4 vGlaze;
out float vTone;

void main() {
    float c = cos(aI0.w), s = sin(aI0.w);
    vec4 world = place(c, s);
    mat3 m = mat3(uSlab);
    vN = m * turn(aNormal, c, s);
    vT = m * turn(aT, c, s);
    vB = m * turn(aB, c, s);
    vFlat = aNormal;
    vUV = aUV;
    vec3 hd = halfDim();
    vFace = vec2(dot(abs(aT), hd), dot(abs(aB), hd));
    vWorld = world.xyz;
    vLit = uLightVP * world;
    vGlaze = aI2;
    vTone = aI1.z;
    gl_Position = uVP * world;
}
`;

export const BRICK_FRAG = `#version 300 es
precision highp float;
precision highp sampler2DShadow;

in vec3 vWorld;
in vec3 vN;
in vec3 vT;
in vec3 vB;
in vec3 vFlat;
in vec2 vUV;
in vec2 vFace;
in vec4 vLit;
in vec4 vGlaze;
in float vTone;

uniform sampler2DShadow uShadow;
uniform float uTexel;
uniform vec3 uLight;        /* towards the light */
uniform vec3 uEye;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uBed;
uniform vec3 uSky;          /* ambient from above, from below, and the key */
uniform vec3 uFloor;
uniform vec3 uSun;
uniform float uBevel;
uniform int uMode;          /* 0 a brick, 1 the bed behind them */

out vec4 fragColor;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float shade(float ndl) {
    vec3 sc = vLit.xyz / vLit.w * 0.5 + 0.5;
    if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0) return 1.0;
    float bias = mix(0.0022, 0.0007, clamp(ndl, 0.0, 1.0));
    float sum = 0.0;
    for (int y = -1; y <= 1; y += 1) {
        for (int x = -1; x <= 1; x += 1) {
            sum += texture(uShadow, vec3(sc.xy + vec2(float(x), float(y)) * uTexel * 1.6, sc.z - bias));
        }
    }
    return sum / 9.0;
}

void main() {
    vec3 albedo;
    float gloss = 0.0;
    float shine = 8.0;
    float grain = 0.0;

    if (uMode == 1) {
        albedo = uBed;
    } else if (vFlat.z > 0.5) {
        albedo = uPaper * vTone; gloss = 0.05; shine = 10.0; grain = 1.0;
    } else if (vFlat.y > 0.5) {
        albedo = uInk; gloss = 0.62; shine = 70.0;
    } else if (vFlat.z < -0.5) {
        albedo = vGlaze.rgb; gloss = 0.4; shine = 46.0;
    } else if (vFlat.y < -0.5) {
        albedo = uPaper * vTone * 0.94; grain = 1.0;
    } else {
        albedo = uPaper * vTone * 0.9; grain = 1.0;
    }

    /* The arris: within a bevel's width of an edge, lean the normal
       over it. */
    vec3 n = normalize(vN);
    if (uMode == 0) {
        vec2 d = vFace * (1.0 - abs(vUV));
        vec2 k = smoothstep(uBevel, 0.0, d);
        n = normalize(n + (normalize(vT) * sign(vUV.x) * k.x + normalize(vB) * sign(vUV.y) * k.y) * 0.9);
    }

    vec3 L = normalize(uLight);
    vec3 V = normalize(uEye - vWorld);
    vec3 H = normalize(L + V);
    float ndl = dot(n, L);
    float lit = shade(dot(normalize(vN), L));

    vec3 ambient = mix(uFloor, uSky, n.y * 0.5 + 0.5);
    vec3 col = albedo * (ambient + uSun * max(ndl, 0.0) * lit);

    /* Two highlights on anything that shines: the key itself, tight,
       and a broad soft box overhead, which is what makes lacquer read
       as lacquer while it is still turning. */
    if (gloss > 0.0) {
        float spec = pow(max(dot(n, H), 0.0), shine) * gloss * lit;
        vec3 r = reflect(-V, n);
        float box = smoothstep(0.3, 0.95, dot(r, normalize(vec3(-0.25, 0.9, 0.36))));
        col += uSun * (spec * 1.15 + box * gloss * 0.2);
    }

    if (grain > 0.0) {
        col *= 1.0 + (hash(floor(vUV * vFace * 34.0) + vGlaze.a * 91.0) - 0.5) * 0.028;
    }

    fragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), 1.0);
}
`;
