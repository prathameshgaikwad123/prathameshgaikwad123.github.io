prathameshgaikwad123.github.io

Portfolio of **Prathamesh Gaikwad** — multidisciplinary digital designer.
UI/UX · Web · Brand · Digital Experiences.

Live at <https://prathameshgaikwad123.github.io/>

---

## Structure

| Path | What it is |
|---|---|
| `index.html` | The home page: hero, then five bands — Selected Work, About, Capabilities, Experience, Contact. One scrolling document; each band is an anchor (`/#work`, `/#about`, …). |
| `work/*.html` | One page per case study. Ordinary documents, linked from the work index. |
| `css/style.css` | The single stylesheet, and the design system: tokens, twelve-column grid, UI language, motion. Castoro for display, Inter for interface and text. |
| `js/script.js` | Theme, scroll chrome, entrance reveals, active navigation, the work-index preview plate, image zoom. No dependencies. |
| `404.html` | Not-found page. |

Nothing is built or compiled: the files in the repository are the files that
are served. With JavaScript disabled the page is a complete, readable document —
the entrance motion and the travelling preview plate are enhancements, and each
project keeps its preview image in the flow.
