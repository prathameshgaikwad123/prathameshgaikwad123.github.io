prathameshgaikwad123.github.io

Portfolio of **Prathamesh Gaikwad** — multidisciplinary digital designer.
UI/UX · Web · Brand · Digital Experiences.

Live at <https://prathameshgaikwad123.github.io/>

---

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production build into dist/
npm run preview  # serve the production build
```

React with Vite, and two animation systems that never overlap.

**Framer Motion** handles component motion — anything that answers a pointer,
a focus ring or a press. Its shared patterns live in `src/motion/`. No section
is built on them at the moment; they are there so the next one that needs them
does not have to invent its own timing.

**GSAP with ScrollTrigger** handles scroll choreography — anything whose
progress is the reader's own progress down the page. Every effect is one file
in `src/animations/`, and every one of them is written against the same rule:
the stylesheet holds the resting composition, and the effect may only move
things away from it and back. Nothing on the page depends on an animation
having run.

**WebGL2, by hand**, draws one thing: the glass carousel at the top of Selected
Work. It is in `src/carousel/`, it pulls in no library, and every constant in
it was measured off a recording rather than chosen — `src/carousel/config.js`
says what each number was fitted against, and `src/carousel/warp.js` explains
the one piece of the maths that is not obvious.

No two of the three ever touch the same element. Where the boundary matters it
is written down at the point it matters — the top of stylesheet section 9.

## Structure

| Path | What it is |
|---|---|
| `index.html`, `work/*.html`, `404.html` | One HTML entry per published page. Each carries its own `<head>` — title, description, canonical, Open Graph, structured data — and the small script that settles the theme and the intro before the first paint. The body is a mount point. |
| `src/App.jsx` | The home page: hero, then six bands — Selected Work, Selected Behance Work, About, Capabilities, Side Quests, Contact. One scrolling document; each band is an anchor (`/#work`, `/#behance`, …). Four of the six are in the navigation panel; Behance and Capabilities are arrived at by reading. |
| `src/CaseStudy.jsx` | The shell every case study shares. |
| `src/sections/` | The six bands of the home page. |
| `src/components/` | The masthead's two plates, the navigation panel fixed under the page, the overlay that travels with the page, the loader, the glass carousel's document half, the image lightbox, the shared page furniture. |
| `src/carousel/` | The glass carousel: the virtual axis, the scroll model, the warp table, the shaders and the WebGL2 renderer. No dependencies. |
| `src/case-studies/` | The written body of each case study. |
| `src/data/` | Project records, site constants, the page list. |
| `src/hooks/` | Theme, scroll chrome and the section spy, the navigation's state and its reveal choreography, entrance reveals, the carousel's frame loop and input. |
| `src/motion/` | The Framer Motion foundation: `fade`, `fadeUp`, `stagger`, `imageReveal`, and the `Reveal` wrapper. |
| `src/animations/` | The scroll system. `core.js` is the loader, the one media condition and the shared helpers; every other file is a single effect. See below. |
| `src/styles/style.css` | The single stylesheet, and the design system: tokens, twelve-column grid, UI language, motion. Castoro for display, Inter for interface and text. |
| `public/` | Assets served as-is: images, fonts, `robots.txt`, `sitemap.xml`. |
| `scripts/prerender.js` | Writes each page's markup into its built HTML file. |
| `api/presence.js` | The only server-side code the site has: the live-presence counter behind the footer. See below. |

The site is built as separate documents rather than one client-routed page.
That keeps the published URLs exactly as they are, and it keeps the
cross-document view transition on the project covers — which is a navigation,
not a state change.

Every page is written to static HTML at build time and picked up again in the
browser, so with JavaScript disabled the page is still a complete, readable
document — the entrance motion and the travelling preview plate are
enhancements, and each project keeps its preview image in the flow.

Navigable, too, and that rests on one attribute: the panel's `inert` is
written on the client rather than into the markup, so the prerendered
document ships a navigation whose links work. Without it the panel would
arrive readable and dead, and since the header carries no section list of its
own, that would be the whole of the site's navigation gone. `src/components/Menu.jsx`.

## The scroll system

The spine, in scroll order. Each line is one file in `src/animations/`, one
block in the stylesheet, and one section of the page.

| # | Section | Effect | File |
|---|---|---|---|
| 1 | About | One paragraph filling word by word as it is read | `wordReveal.js` |
| 2 | About | The one hand-drawn annotation — an entrance, not choreography, so it lives in `useReveal` and costs no library | *(stylesheet §6)* |
| 3 | Work | Six covers as one rigid strip behind a pane of glass: neutral across the middle, refracting hard at the rims | `src/carousel/` *(WebGL2)* |
| 4 | Work | Every cover a link: the card under the pointer is found by taking the click back through the lens | `src/carousel/layout.js` |
| 5 | Capabilities | The section header on a panel cut on a slant, panel and type at different rates | `panelCut.js` |
| 6 | Contact | The last band arriving as a contained panel and opening to the edges | `closePanel.js` |

Three rules hold the whole thing together, and they are worth knowing before
changing any of it:

1. **The stylesheet owns the resting state.** An effect may only move an
   element away from where CSS already put it, and back. That is one fallback
   covering three cases — reduced motion, a script that never arrives, and the
   prerendered document — rather than three separate ones.
2. **One condition, in one place.** `RUNS` in `core.js` is the only answer to
   "does the scroll system exist here", and the stylesheet asks the same
   question in the same words. Below 62rem, or for a reader who has asked for
   less motion, no timeline is built and ScrollTrigger is never fetched. GSAP
   core still is, on every page at every width, because the navigation's own
   loader asks for it — which is why the two loaders are separate.
3. **One file per effect, and `mm.revert()` cleans up after it.** Every
   timeline is built inside a `gsap.matchMedia` scoped to its own section, so
   unmounting — or the condition ceasing to match — removes every trigger and
   every inline style it wrote.

To tune, change `end`, `scrub` and `ease` in one file at a time, and the
distances in the tokens at the top of the stylesheet. To add an effect: a new
file in `src/animations/`, a `useScrollEffect(...)` call in its section, and a
resting state in the stylesheet first.

## The presence line

The last line of both footers says how many people are reading the site
right now and how many have ever opened it. It is the only thing on the
site that is not a static file, and the only thing that changes without
a gesture.

| Piece | What it does |
|---|---|
| `api/presence.js` | One serverless function. One `EVAL` per request against Upstash Redis: sweep the sessions older than the window, refresh this one, count what is left, and claim a footstep if this session has never been seen. |
| `src/hooks/usePresence.js` | The browser half. An anonymous id per tab, a heartbeat every twelve seconds, and nothing at all while the tab is not being looked at. |
| `src/components/Presence.jsx` | Two lines of the footer's own micro type, rendered only once there is a real answer. |
| stylesheet §13 | `.presence`, and the one repeating animation on the site. |

**It is off until it is configured, and off is not broken.** Without a
usable store the endpoint answers 503, the hook's first request fails,
and the footer renders exactly as it always has — no placeholder, no
zero, no gap. The same is true of a build served from somewhere with no
`/api` at all, which is what GitHub Pages is.

**Off is not silent, though.** `GET /api/presence` is a health check
meant to be opened in a browser: it either names the variable it took
its credentials from and returns the two current numbers, or it says
which variables it looked for and which it can actually see. The same
answer reaches the browser console on any page where the line does not
appear. Variable *names* are named; a value never is.

**The credential names are discovered, not assumed.** Upstash writes one
pair, Vercel's integration has written another, and a marketplace
connection can be given a prefix of its own. `api/presence.js` takes any
`<PREFIX>_REST_URL` with a matching `<PREFIX>_REST_TOKEN` beside it (or
the `_REST_API_` form), preferring a real `.upstash.io` host, then
Upstash's naming, then Vercel's. A `redis://` url is the TCP endpoint
and is not one of these — the REST pair is what this needs.

**No personal data is involved.** The id is sixteen random bytes the
browser makes up for itself and forgets when the tab closes. No address,
no header and no fingerprint is read, stored or logged, and the two
numbers the endpoint returns are the whole of what comes back.

Copy `.env.example` for the variable names. `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are the two that matter; the other two are for
the arrangement where the pages and the function are not on the same
origin.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`dist/`. GitHub Pages must be set to **Settings → Pages → Build and deployment
→ Source: GitHub Actions** for it to take effect.

GitHub Pages serves files and nothing else, so the presence endpoint cannot
run there. `vercel.json` is what makes the same repository deploy on Vercel,
where it can. Three lines, and each of them is load-bearing:

- `buildCommand` — Vercel's Vite preset would run `vite build` alone, which
  is the client bundle without the SSR pass or the prerender step behind it.
  The published pages would arrive as an empty mount point.
- `outputDirectory` — the same value the preset would infer, written down.
- `cleanUrls: false` — the default, written down because it is the setting
  most likely to be flipped by someone who has not read this. Turning it on
  redirects `/work/<slug>.html` to `/work/<slug>`, which invalidates every
  page's own canonical, every `<loc>` in `sitemap.xml` and every inbound
  link at once.

The two arrangements that work, and what each needs:

**Everything on Vercel.** Set `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` in the project's environment variables and
redeploy — Vercel does not hand new variables to a function that was built
before them. Nothing else is needed: the pages and `/api/presence` are on
one origin. If Vercel becomes the site's real home, the canonical URL,
`og:url`, both JSON-LD `@id`s, `robots.txt` and `sitemap.xml` all name
`prathameshgaikwad123.github.io` and would have to be rewritten with it.

**Pages here, endpoint on Vercel.** Add `PRESENCE_ALLOWED_ORIGIN` to the
Vercel project so the function answers this origin, and set the repository
variable `VITE_PRESENCE_ENDPOINT` (Settings → Secrets and variables →
Actions → Variables) to the function's absolute URL so the Pages build
knows where to ask. Both are already wired; they are simply unset.
