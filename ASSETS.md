# Assets you need to provide

Every image on the site is currently a **labelled SVG placeholder**. Each one
states, on the image itself, the path it lives at and the size it should be —
so you can find and replace them without reading this file.

Nothing here is a stock photo or a fake screenshot of client work. Placeholders
are neutral on purpose.

---

## How to replace an image

1. Export your image at the size in the table below.
2. Save it in the same folder, keeping the same base name — e.g.
   `cover.svg` becomes `cover.jpg`.
3. Update the `src` in the HTML **and change the extension**, then write a real
   `alt` description.
4. Delete the `.svg` placeholder.

Each `<img>` in the HTML has a `REPLACE:` comment directly above it with the
exact path, so search for `REPLACE:` to find them all.

```bash
grep -rn "REPLACE:" index.html work/
```

**Formats.** Prefer WebP for photography and screenshots (smaller than JPEG at
the same quality); JPEG is a fine fallback. Use PNG only for images that need
hard edges or transparency. Keep each file under about 300 KB.

**Do not change `width` and `height`** on the `<img>` unless your replacement
has a different aspect ratio. Those attributes are what stop the page jumping
around while images load.

---

## Project images

Six projects, each with one cover and three gallery images.

| Path | Size | Ratio | Used on |
|---|---|---|---|
| `assets/images/projects/voepl-website/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/voepl-website/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |
| `assets/images/projects/voepl-brand-system/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/voepl-brand-system/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |
| `assets/images/projects/safety-dojo/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/safety-dojo/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |
| `assets/images/projects/digital-communication/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/digital-communication/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |
| `assets/images/projects/web-ai-discovery/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/web-ai-discovery/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |
| `assets/images/projects/archive/cover.*` | 1600 × 1000 | 16:10 | Home + case study |
| `assets/images/projects/archive/01–03.*` | 1400 × 1050 | 4:3 | Case study gallery |

Each cover appears twice. On the **work index** it fills the preview panel
beside the project list — roughly 500 px wide on a laptop — and swaps as the
visitor moves between projects, so it has to read instantly at that size. On
the **case study** it runs the full content width, up to 1264 px. Choose it for
both: a cropped detail usually survives the small size better than a whole
squeezed-down screen.

### What each cover wants to be

| Project | Suggested cover |
|---|---|
| 01 VOEPL website | A wide view of the site, or a few key pages together |
| 02 VOEPL visual system | Several touchpoints side by side, so the *system* reads first |
| 03 Safety Dojo | The poster series together, not one poster |
| 04 Digital communication | A grid of posts, showing the visual consistency |
| 05 Search & AI discovery | A structure or hierarchy diagram — better than a screenshot |
| 06 Selected archive | A composite of several earlier pieces |

### The first gallery image is wider

In each gallery the **first** image spans the full width at 16:9, and images two
and three sit side by side. Put your strongest overview first.

---

## Site-level assets

| Path | Size | Status |
|---|---|---|
| `assets/favicon.svg` | 64 × 64 | **Done** — "PG" monogram, adapts to light/dark |
| `assets/apple-touch-icon.png` | 180 × 180 | **Done** — placeholder, replace if you want |
| `assets/og-image.png` | 1200 × 630 | **Done** — typographic placeholder, replace if you want |
| `assets/images/portrait.*` | 1000 × 1250 (4:5) | **Optional** — About section |

`og-image.png` is what appears when the site is shared on LinkedIn, Slack or
WhatsApp. The generated one is typographic and works; a version with your own
design would be better. It must stay a **PNG or JPEG** — most link previewers
will not render an SVG.

The portrait is optional. To drop it, delete the `<figure class="about__portrait">`
block in `index.html`.

---

## Not provided, and deliberately so

**A CV.** There is no CV file, so there is no CV button — a button leading to a
404 is worse than no button. To enable it: save your PDF as
`assets/prathamesh-gaikwad-cv.pdf`, then uncomment the block marked
`CV BUTTON` in `index.html`.

---

## Before you publish

- Check you have the right to publish each piece of client work.
- Redact anything commercially sensitive in screenshots — pricing, unreleased
  products, customer names, internal notes.
- Write real `alt` text. The placeholder alt text describes a placeholder, which
  is useless to a screen reader once the real image is in place.
