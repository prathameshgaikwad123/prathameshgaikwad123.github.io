prathameshgaikwad123.github.io

Portfolio of **Prathamesh Gaikwad** — multidisciplinary digital designer.
UI/UX · Web · Brand · Digital Experiences.

Live at <https://prathameshgaikwad123.github.io/>

---

## Structure

| Path | What it is |
|---|---|
| `index.html` | The whole home experience: six panels — Home, Work, About, Capabilities, Experience, Contact — switched by the router in `js/script.js`. Each panel has its own URL (`/#work`, `/#about`, …). |
| `work/*.html` | One page per case study. Ordinary documents, linked from the work index. |
| `css/style.css` | The single stylesheet. Castoro for display, Inter for text. |
| `js/script.js` | Router, navigation, theme, work-index interaction, image zoom. No dependencies. |
| `404.html` | Not-found page. |

Nothing is built or compiled: the files in the repository are the files that
are served. With JavaScript disabled every panel is simply visible and stacked,
so the page stays complete and navigable.
