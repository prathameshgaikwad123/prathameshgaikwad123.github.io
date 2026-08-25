# Content still needed

Eight visible placeholders are live on the site. Each is marked in the page with
a dashed outline and a `⌇` symbol, and carries a `data-todo` attribute so you
can find it:

```bash
grep -rn "data-todo" index.html work/
```

Nothing on this list has been guessed or filled in on your behalf.

---

## 1. Employment dates — blocking

The brief was explicit about not inventing these, so they are placeholders.

| `data-todo` | File | What to write |
|---|---|---|
| `voepl-dates` | `index.html` | Start date at VOEPL, e.g. `April 2024 — Present` |
| `soch-dates` | `index.html` | Dates at Soch Business Mentors LLP |

Replace the whole `<span class="tbd">…</span>` with plain text:

```html
<p class="exp__dates">April 2024 — Present</p>
```

> The old repository claimed *"April 2024 – Present"* for a **Senior Executive**
> role at VOEPL. Since that job title was wrong, I did not carry the date over
> either — it may or may not be right for the Digital Marketing Executive role.
> Confirm before using it.

---

## 2. Safety Dojo — who owns it

| `data-todo` | File |
|---|---|
| `safety-dojo-owner` | `work/safety-dojo.html` |

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

Only project **04** has a verified outcome (the LinkedIn figure), so it is the
only one with numbers on it.

For the other four, you have three honest options:

1. **Give a real, verifiable outcome.** Best if you have one.
2. **Give a qualitative outcome.** "The system is still in use for new
   collateral" is a legitimate outcome and needs no metrics.
3. **Delete the section.** Remove the whole `<section class="case-block">` for
   Outcome. An absent section reads better than an empty one.

Do not fill these with estimates. A single unverifiable number undermines the
one figure on the site that is real.

---

## 4. Archive entries

| `data-todo` | File |
|---|---|
| `archive-entries` | `work/archive.html` |

The archive lists categories of work but names no projects or clients, because
none were provided. Add real names and dates, and check you have permission to
publish client work.

---

## Decisions I made that you should confirm

**Email.** The site uses `prathameshg83800@gmail.com`, taken from the old
repository. Your work address was not used — a portfolio should outlive a job.

**Phone number.** `+91 83800 84093` was already public in the old repository, so
it was kept. It is in the Contact section of `index.html` if you would rather
remove it; most design portfolios do not list one.

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

To remove it, delete the `<section class="sub" id="practice">` block in
`index.html`. Nothing else needs renumbering — the bands are numbered
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
