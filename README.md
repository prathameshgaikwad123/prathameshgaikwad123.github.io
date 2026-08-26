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

React with Vite. Framer Motion is installed as the site's animation system;
the shared patterns live in `src/motion/` and are applied section by section
rather than all at once.

## Structure

| Path | What it is |
|---|---|
| `index.html`, `work/*.html`, `404.html` | One HTML entry per published page. Each carries its own `<head>` — title, description, canonical, Open Graph, structured data — and the small script that settles the theme and the intro before the first paint. The body is a mount point. |
| `src/App.jsx` | The home page: hero, then five bands — Selected Work, About, Capabilities, Experience, Contact. One scrolling document; each band is an anchor (`/#work`, `/#about`, …). |
| `src/CaseStudy.jsx` | The shell every case study shares. |
| `src/sections/` | The five bands of the home page. |
| `src/components/` | Navigation, the overlay menu, the loader, a work-index row, the image lightbox, the shared page furniture. |
| `src/case-studies/` | The written body of each case study. |
| `src/data/` | Project records, site constants, the page list. |
| `src/hooks/` | Theme, scroll chrome, entrance reveals, active navigation, the work-index preview plate, the cross-document cover transition. |
| `src/motion/` | The Framer Motion foundation: `fade`, `fadeUp`, `stagger`, `imageReveal`, and the `Reveal` wrapper. |
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

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`dist/`. GitHub Pages must be set to **Settings → Pages → Build and deployment
→ Source: GitHub Actions** for it to take effect.
