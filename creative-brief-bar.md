# Quality bar — creative / UI briefs

Apply when the request includes visual design, landing pages, portfolios, branding, "feel", vibe, or editorial copy.
**Don't copy concrete references** — translate the brief into measurable criteria in the handoff.

## Why it exists

The planner→executor pipeline can produce flawless code (`build` OK) and still ship a "clean template" UI if the plan optimizes stack and files but **not visual ambition**.

This bar balances: **the same rigor on paths/build, plus more specification of perceptual quality**.

---

## Default build mode (creative landings)

Default composite: **`prod + spec + craft + visual`** (not prod + spec alone).

| Layer | What it covers |
|------|-----------|
| **prod** | build, lint, components, paths |
| **spec** | interaction timing table |
| **craft** | perceptual checklist — `creative-brief-bar` (global) or `docs/CRAFT-BAR.md` + `docs/ORIGINALITY.md` (starter v0.0.5+) |
| **visual** | visual ceiling — `docs/VISUAL-BAR.md` + `docs/ART-DIRECTION.md` + `docs/COPY-CRAFT.md` (starter v0.1.0+) |

The planner must declare which layers apply. The executor verifies **all four** on boutique creative landings.

---

## Classification (Baking)

| Signals in the request | Action |
|---------------------|--------|
| palette, typography, vibe, landing, portfolio, "feels like", interactions | **PLAN** + mandatory creative sections |
| color fix, rename, one component | EXECUTE (no creative bar) |
| design + >3 files | PLAN + creative bar |

---

## Extra mandatory sections in the handoff

In addition to the planner's standard template, include:

### 1. Visual ambition (3–5 bullets)

What the user should feel in the first 5 seconds. One antithesis phrase if the brief includes one ("antidote to gym culture", "printed monograph", etc.).

**Visual ceiling (starter v0.1.0+)** — the planner must explicitly name:

- Atmospheric layers (max 3: grain, light, base texture)
- Editorial typographic system (label line, folios, accent on titles)
- Art strategy: `svg-system` | `photo-treated` | `hybrid`
- Repeatable motif across ≥3 sections
- Hero tagline length (≥120 chars, paragraph)

### 2. Typographic hierarchy

| Level | Font | Weight | Use |
|-------|--------|------|-----|
| Display | … | … | hero, section titles |
| Body | … | … | paragraphs |
| Label | … | … | caps, folios, meta |

Include: tracking, body line-height (≥1.75 for "airy"), copy max-width (`~60ch`).

### 3. Motion system

| Interaction (from the brief) | Duration | Easing | Reduced motion |
|-------------------------|----------|--------|------------------|
| … | … | … | … |

Don't just list — specify the **curve** (`cubic-bezier`) and whether it pauses off-screen.

### 4. Copy and tone

- Minimum length per section (e.g. practices: 2–3 sentences + meta).
- Tone: literary / direct / technical — explicit.
- Fictional name + tagline + 1-line antidote if applicable.
- **Forbidden:** lorem, "compelling", "seamless", generic placeholders.

### 5. Images and assets

- Source (Unsplash with verified IDs, not generic Picsum for visual product).
- Treatment: filters, overlay, aspect ratios.
- What each image should show (light, composition).
- **Asset table** (mandatory if there are external URLs):

```markdown
## Assets (verify before ship)

| URL / ID | Use | Verify |
|----------|-----|-----------|
| https://… | hero | HEAD/GET 2xx before closing |
```

- **Don't** paste Unsplash IDs without marking `verify before ship`.
- The executor must run an HTTP check and append `### Asset verification` under `## Execution`.

If the repo includes **`docs/CRAFT-BAR.md`** and **`docs/ORIGINALITY.md`**, the executor reads them at execute time.

If **v0.1.0+**, also: `docs/VISUAL-BAR.md`, `docs/ART-DIRECTION.md`, `docs/COPY-CRAFT.md`, `docs/PAGE-COHESION.md`.

### 6. Anti-patterns (at least 3)

What to avoid to not fall into "AI slop" / template:

- Generic centered hero + flat gradient with no layers
- Identical sections (same padding/title/short repeated copy)
- Nav hidden until scroll with no design reason
- Minimal form with no trust context
- Only a technical checklist in done criteria with no visual criterion

### 7. Done criteria — creative layer (checklist)

In addition to `npm run build` (**build ≠ completed**):

- [ ] Each section of the brief has its own identity (no clones)
- [ ] Copy meets the plan's tone and length
- [ ] Brief interactions implemented with the plan's timing
- [ ] Typographic hierarchy visible without inspecting code
- [ ] Images aligned to the brief (thematic, not random)
- [ ] External assets verified (2xx) — see Assets table
- [ ] Craft bar reviewed on the running UI (starter: `docs/CRAFT-BAR.md`)
- [ ] Visual bar reviewed on the running UI (starter v0.1.0+: `docs/VISUAL-BAR.md`)
- [ ] Art strategy in `DECISIONS.md` + minimum copy (`docs/COPY-CRAFT.md`)

### 8. External reference (optional)

```markdown
## External reference (read-only)
- Third-party URL or demo
- Use: compare craft bar ambition — **do not copy source**
```

The planner compares ambition; the executor implements **from scratch**. Don't archive session comparisons in the starter.

---

## Executor's role

1. Read both layers: technical steps **and** creative sections.
2. If a technical step contradicts the creative bar → document the deviation; favor the bar unless it's blocking.
3. In `## Execution`, mark the creative checklist the same way as the technical one.

---

## Baking's role (orchestrator)

- Detect a creative brief → tell the planner: "include creative-brief-bar" + **prod+spec+craft+visual** mode.
- Don't shorten the visual request when delegating to the planner.
- Post-exec: evaluate scores before closing (see `BAKING-CURSOR.md` / `claude-code/BAKING.md`):
  - **partial** if build OK but `craft: partial|fail` or `assets: fail`
  - **never completed** with `assets: fail`

Repos with `docs/GENERAL-ONLY.md` should follow it for starter edits — general rules only, no session artifacts.
