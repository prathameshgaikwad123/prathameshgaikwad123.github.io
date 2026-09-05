# Content still needed

Several visible placeholders are live on the site. Each is marked in the page with
a dashed outline and a `⌇` symbol, and carries a `data-todo` attribute so you
can find it:

```bash
grep -rn "data-todo" src/
```

Nothing on this list has been guessed or filled in on your behalf.

---

## 1. Behance projects — blocking

The Behance spread ships with six labelled placeholders and no real project
URLs, because a project URL cannot be guessed. Both halves of each record are
replaced together in `src/data/behance.js`:

| Field | What to write |
|---|---|
| `href` | That project's own Behance URL. Until it is replaced every plate points at the profile, which is a link that works but is not the one the plate is offering. |
| `cover` | A 1600×1200 export saved beside the placeholder in `public/assets/images/behance/`, with the extension changed here. |
| `title`, `type`, `alt` | The project's real name, its disciplines, and a real description of the image. |

`span` and `drop` are the composition rather than content — how wide the plate
is and how far down the spread it starts. Leave them alone unless the spread
needs rebalancing after the real covers go in.

---

## 1b. Side quests — blocking

`src/data/sideQuests.js` ships six records describing the *kind* of thing that
belongs there, with placeholder plates and `href: null`. Replace each with a
real one: a title, a one-line note, a 1200×1200 image, and a link if the thing
was ever published. A record with `href: null` renders as a plate with no link
rather than a dead one, so leaving that field null is a valid answer.

---

## 2. Safety Dojo — who owns it

| `data-todo` | File |
|---|---|
| `safety-dojo-owner` | `src/data/projects.js` — the Safety Dojo `facts` |

Your brief listed Safety Dojo as its own category rather than under VOEPL, but
your VOEPL role includes *"internal communication and safety awareness
campaigns"*. Rather than assume they are the same thing, the organisation is
left blank.

If it is VOEPL work, replace the placeholder with
`Virtuoso Optoelectronics Limited (VOEPL)`.

---

## 3. Project outcomes

| `data-todo` | Project |
|---|---|
| `outcome-voepl-website` | 01 — VOEPL website |
| `outcome-voepl-brand-system` | 02 — VOEPL visual system |
| `outcome-safety-dojo` | 03 — Safety Dojo |
| `outcome-web-ai-discovery` | 05 — Search & AI discovery |

Each one is the last block in `src/case-studies/<project>.jsx`.

Only project **04** has a verified outcome (the LinkedIn figure), so it is the
only one with numbers on it.

For the other four, you have three honest options:

1. **Give a real, verifiable outcome.** Best if you have one.
2. **Give a qualitative outcome.** "The system is still in use for new
   collateral" is a legitimate outcome and needs no metrics.
3. **Delete the section.** Remove the `Outcome` entry from the blocks that file
   returns. An absent section reads better than an empty one.

Do not fill these with estimates. A single unverifiable number undermines the
one figure on the site that is real.

---

## 4. Archive entries

| `data-todo` | File |
|---|---|
| `archive-entries` | `src/case-studies/archive.jsx` |

The archive lists categories of work but names no projects or clients, because
none were provided. Add real names and dates, and check you have permission to
publish client work.

---

## Decisions I made that you should confirm

**Email.** The site uses `prathameshg83800@gmail.com`, taken from the old
repository. Your work address was not used — a portfolio should outlive a job.

**Phone number.** `+91 83800 84093` was already public in the old repository, so
it was kept. It is in `src/data/site.js`, shown by the Contact section, if you
would rather remove it; most design portfolios do not list one.

**Location.** "Nashik, India" in Contact and structured data; "Based in India"
in the hero, per your brief.

**Twitter/X removed.** The old link pointed at `twitter.com/yourusername`. Add a
real one in the Contact section if you have an account worth showing.

**GitHub contribution graph — kept, but reframed.** You asked for this section
back after the first build. It lives inside the **About** band, in a block
titled *In Practice* under the heading "I build what I design", rather than as
a bare "GitHub Activity" block.

The reason for the reframing: a contribution graph is the single most recognisable
*developer*-portfolio signal, and your brief was explicit about not reading as a
software engineer. Framed as evidence that you implement your own designs, it
argues for you as a designer who can build — which is an advantage for UI/UX and
web design roles. Framed as "GitHub Activity", it invites a hiring manager to
read you as an engineer and judge the graph on engineering terms.

Two things to know about it:

- The image comes from `ghchart.rshah.org`, a third party. If it goes down, the
  figure hides itself instead of showing a broken image. It also means every
  visitor's browser makes a request to that service.
- The chart is drawn on a permanently light panel in both themes, because its
  empty-day squares are near-white and would glare against the dark palette.

To remove it, delete the `<section className="sub" id="practice">` block in
`src/sections/About.jsx`. Nothing else needs renumbering — the bands are numbered
01–05 by navigation order, not by how many blocks each one holds.

---

## Removed as inaccurate

For the record, everything below was in the old repository and is now gone.
None of it was carried forward in any form.

**Job history**
- "Senior Executive" at VOEPL — wrong title
- "Software Engineer" at "Previous Company"
- "Junior Developer" at "First Company"

**Fabricated achievements**
- AWS cloud infrastructure, "reducing costs by 30%"
- Node.js/Express REST APIs
- CI/CD pipelines, "reducing deployment time by 60%"
- Database optimisation, "improving response times by 40%"
- "Mentored a team of 5 junior developers"
- React + Tailwind interfaces, "85% code coverage"

**Fabricated education**
- MSc Computer Science, "University Name", GPA 3.8/4.0
- BTech Computer Engineering, "College Name", Dean's List

**Fabricated certifications**
- AWS Solutions Architect Associate
- Google Professional Cloud Developer
- "Hackathon Winner — XYZ Hackathon 2021"

**Fabricated projects**
- Project Alpha, Project Beta, Project Gamma

**Other**
- Spanish listed at "Intermediate" — unverified, and the percentage bars it used
  are ruled out by the brief
- Skill cloud: Python, TypeScript, React, Node.js, SQL, Docker, AWS, CI/CD —
  all positioning you as a software engineer
- `twitter.com/yourusername`, `your.email@example.com`
- "I design Stuff." as the bio
- "Built with ❤️"

**Education and certifications now have no section at all.** They are not in the
information architecture you specified. If you want to add real ones, tell me
and I will build the section properly rather than leaving an empty shell.
