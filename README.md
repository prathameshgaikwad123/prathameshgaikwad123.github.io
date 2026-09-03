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
a focus ring or a press. Its shared patterns live in `src/motion/`, and the
work index is the section built on them.

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
| `src/App.jsx` | The home page: hero, then five bands — Selected Work, About, Capabilities, Experience, Contact. One scrolling document; each band is an anchor (`/#work`, `/#about`, …). |
| `src/CaseStudy.jsx` | The shell every case study shares. |
| `src/sections/` | The five bands of the home page. |
| `src/components/` | The masthead's two plates, the navigation panel fixed under the page, the overlay that travels with the page, the loader, a work-index row, the glass carousel's document half, the image lightbox, the shared page furniture. |
| `src/carousel/` | The glass carousel: the virtual axis, the scroll model, the warp table, the shaders and the WebGL2 renderer. No dependencies. |
| `src/case-studies/` | The written body of each case study. |
| `src/data/` | Project records, site constants, the page list. |
| `src/hooks/` | Theme, scroll chrome and the section spy, the navigation's state and its reveal choreography, entrance reveals, the work-index preview plate, the cross-document cover transition. |
| `src/motion/` | The Framer Motion foundation: `fade`, `fadeUp`, `stagger`, `imageReveal`, and the `Reveal` wrapper. |
| `src/animations/` | The scroll system. `core.js` is the loader, the one media condition and the shared helpers; every other file is a single effect. See below. |
| `src/styles/style.css` | The single stylesheet, and the design system: tokens, twelve-column grid, UI language, motion. Castoro for display, Inter for interface and text. |
| `public/` | Assets served as-is: images, fonts, `robots.txt`, `sitemap.xml`. |
| `scripts/prerender.js` | Writes each page's markup into its built HTML file. |

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
| 1 | Hero → Work | The statement parts and an inverted panel opens between the halves until it is the Work band's ground | `openingSplit.js` |
| 2 | About | One paragraph filling word by word as it is read | `wordReveal.js` |
| 3 | About | The one hand-drawn annotation — an entrance, not choreography, so it lives in `useReveal` and costs no library | *(stylesheet §6)* |
| 4 | Work | Six covers as one rigid strip behind a pane of glass: neutral across the middle, refracting hard at the rims | `src/carousel/` *(WebGL2)* |
| 5 | Work | The active project, driven both ways — scrolling the strip moves the list, hovering the list brings the strip round | *(Framer Motion)* |
| 6 | Capabilities | The section header on a panel cut on a slant, panel and type at different rates | `panelCut.js` |
| 7 | Experience | One plate per role, arriving at its own rate into the space the meta column leaves | `driftCards.js` |
| 8 | Contact | The last band arriving as a contained panel and opening to the edges | `closePanel.js` |

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

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`dist/`. GitHub Pages must be set to **Settings → Pages → Build and deployment
→ Source: GitHub Actions** for it to take effect.
