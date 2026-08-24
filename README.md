# prathameshgaikwad123.github.io

Portfolio of **Prathamesh Gaikwad** — multidisciplinary digital designer.
UI/UX · Web · Brand · Digital Experiences.

Live at <https://prathameshgaikwad123.github.io/>

---

## What this is

A static, dependency-free site on GitHub Pages. No build step, no framework, no
package manager — edit a file, commit, and it is live.

```
index.html              one page: hero, work, about, approach, capabilities,
                        experience, impact, tools, in practice, contact
work/*.html             six case studies
404.html
css/style.css           design tokens + all styles
js/script.js            theme, nav, scrollspy, reveal
assets/                 icons, share image, project images
robots.txt sitemap.xml
ASSETS.md               images you need to supply, with dimensions
CONTENT-TODO.md         content still needed, and what was removed
fonts/                  UNUSED — see "Fonts" below
```

## Working on it locally

```bash
python -m http.server 4321
```

Then open <http://localhost:4321>. A plain `file://` open mostly works, but
root-relative paths in `404.html` need a server.

## Design system

Everything visual is a custom property at the top of `css/style.css`. Change a
token there and it propagates.

| | Light | Dark |
|---|---|---|
| Page | `#F6F5F2` | `#0D0D0C` |
| Text | `#121211` | `#F2F1EC` |
| Accent | `#A93F24` | `#FF7A57` |

Type is **Archivo** (display) and **Inter** (text), both OFL-licensed, in a
single Google Fonts request — 2 woff2 files, about 81 KB.

The two display sizes — `--t-hero` and `--t-xxl` — are tuned so the longest
single word they carry ("MULTIDISCIPLINARY", "COMMUNICATION") still fits its
column at every viewport from 320 px up. Raising either cap will overflow the
hero, so re-check if you change them.

## Theme

Follows the operating system by default. Clicking the toggle stores an explicit
choice in `localStorage` under `pg-theme`, and only then does the site stop
following the system. An inline script in `<head>` applies the theme before
first paint, so there is no flash.

## Accessibility

Skip link · semantic landmarks · one `h1` per page, no skipped levels · visible
focus rings that invert with the theme · mobile menu with focus trap, Escape and
focus restore · `prefers-reduced-motion` honoured · `forced-colors` handled ·
all text meets WCAG AA (body text 6.9:1, the lightest meta text 4.75:1).

**The page is fully readable with JavaScript disabled.** Reveal transitions are
gated behind a `.js` class that the inline script adds, so nothing is hidden
unless JavaScript is present to reveal it again.

## Fonts

`fonts/GoogleSans-*.ttf` are **no longer referenced** and can be deleted.

Two reasons they were dropped:

1. **Licensing.** Google Sans is Google's proprietary corporate typeface. It is
   not licensed for redistribution or for use on third-party websites.
2. **Weight.** The two files are 4.06 MB of unhinted TTF — more than the rest of
   the site combined, on the critical path.

```bash
git rm -r fonts/
```

They were left in place rather than deleted, since removing files is your call.

## The one external dependency

Section 08 embeds a GitHub contribution chart from `ghchart.rshah.org`. It is the
only third-party runtime dependency on the site. If the service is unreachable,
`script.js` hides the whole figure rather than leaving a broken image, so an
outage degrades quietly. See `CONTENT-TODO.md` for how to remove it.

## Editing content

- **Text** — directly in the HTML. It is plain and commented.
- **Images** — see `ASSETS.md`. Every `<img>` has a `REPLACE:` comment above it.
- **Placeholders** — see `CONTENT-TODO.md`. Find them with
  `grep -rn "data-todo" index.html work/`.

### Adding a project

1. Copy an existing file in `work/` and edit it.
2. Add an `<article class="project">` block to `index.html`, incrementing the
   number.
3. Create `assets/images/projects/<slug>/`.
4. Add the URL to `sitemap.xml`.
5. Update the "Next project" link on the case study before it.

Nothing depends on project count or order — no `nth-child` selectors are used
for layout, so blocks can be reordered freely.
