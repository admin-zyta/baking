# Use Cases — Baking-AI

← [Back to README](./README.md)

Real cases. Each one: request → classification → what runs → what's left on disk.

---

## 1. Trivial fix — color / typo / rename

**Request:** *"Change the primary button to `#c9a227` in PlanCard."*

| | |
|---|---|
| **Classification** | TRIVIAL or direct EXECUTE |
| **Subagents** | None (orchestrator resolves it) or executor if a handoff exists |
| **Light stack** | Skip Engram search · skip verify if there's a single obvious criterion |
| **Handoff** | Optional minimal or none |
| **Savings** | Not paying Opus to plan a color |

**When NOT to use Baking:** if you're already in the middle of a big plan — follow the existing handoff.

---

## 2. Editorial landing — craft bar

**Request:** *"use baking — editorial landing for a yoga studio, mood landing, editorial visual, VISUAL-SCORE ≥27."*

| | |
|---|---|
| **Classification** | PLAN (+ creative-brief-bar) |
| **Planner** | Opus or **Hyper** if the brief is ambitious / multi-section |
| **Handoff** | Spec template + layout recipes + motion + copy |
| **Executor** | Composer/Sonnet · craft bars if present · asset verify 2xx |
| **Verify** | Done criteria vs diff + honest VISUAL-SCORE |
| **Output** | App in repo + handoff with `## Execution` |

**Why Baking and not SDD:** on-disk bars (CRAFT-BAR, VISUAL-BAR) replace extra phases when the repo already ships them.

---

## 3. Zyta feature — badge only on Plan Pro

**Request:** *"Add a Most popular badge only on Plan Pro, not on Enterprise."*

| | |
|---|---|
| **Classification** | PLAN (business rule) + EXECUTE |
| **Planner** | Handoff with explicit **Done criteria** |
| **Executor** | Implements |
| **Verify** | Table: "badge only on Pro" → pass/fail vs diff |
| **Engram** | `mem_save` if it's a recurring product convention |
| **Metrics** | `verify: fail` if it copied the component to all plans |

**Problem it solves:** build OK but the rule was violated — Verify catches misinterpretation.

---

## 4. Plan only — architecture without coding

**Request:** *"Plan only — compare JWT vs sessions for auth in the monorepo, don't execute."*

| | |
|---|---|
| **Classification** | PLAN-ONLY |
| **Planner** | Opus or Hyper (≥2 architecture signals) |
| **Executor** | **Skipped** |
| **Close** | `flow: PLAN-ONLY`, `status: plan-ready` |
| **Next turn** | *"execute the handoff"* → EXECUTE |

**Rule:** Baking does **not** infer EXECUTE until explicitly asked.

---

## 5. Deep plan — multi-service migration

**Request:** *"hyper — design an auth refresh-token migration across all backend services."*

| | |
|---|---|
| **Classification** | PLAN-DEEP |
| **Planner** | **planner-hyper** (Fable) |
| **Handoff** | Decisions, trade-offs, files, measurable criteria |
| **When Hyper** | Explicit "hyper" or ≥2 signals (architecture, >3 files, ambiguity) |
| **Execute** | Afterward, with the executor — not Fable coding everything |

**~10% of projects** — the rest are fine with the regular Opus planner.

---

## 6. Mechanical — rename field (Claude Code)

**Request:** *"Rename `userId` → `accountId` in yesterday's handoff."*

| | |
|---|---|
| **Classification** | EXECUTE |
| **Agent** | **executor-mecanic** (Haiku) |
| **Profile** | `claude` |
| **Prompt** | Only the handoff path |
| **Savings** | Haiku vs Sonnet for trivial wiring |

**Cursor:** there's no mecanic — `executor-cursor` or direct.

---

## 7. Long session — fork vs fresh executor (Claude Code)

**Request:** *"Keep debugging the encoding issue — we already have the API token in this session."*

| | |
|---|---|
| **Classification** | EXECUTE |
| **Mode** | **fork** (inherits session context) |
| **Why** | Re-reading 38k tokens of already-obtained context is expensive |
| **Handoff** | Append `## Execution` to the same diary |

See [consumption.md](../../consumption.md) § fork vs fresh.

---

## 8. Amnesia — Comms decision across repos

**Request (Thursday, different repo):** *"Build a transactional email for password reset."*

| | |
|---|---|
| **Light stack** | Start: `mem_search "transactional comms template"` |
| **Engram** | Recovers: "on Tuesday we decided to always use template X, never ad hoc HTML" |
| **Baking** | Short PLAN or EXECUTE with a minimal handoff |
| **Close** | `mem_session_summary` 5 bullets |

**A code map ≠ a decision log** — use Engram for cross-session conventions.

---

## 9. Vercel deploy with the right skill

**Request:** *"Deploy a preview of the dashboard to Vercel."*

| | |
|---|---|
| **Registry** | Matches `deploy-vercel` in the skill-registry |
| **Action** | Read `~/.cursor/skills/deploy-vercel/SKILL.md` |
| **Baking** | EXECUTE following the skill + handoff if multi-step |
| **Refresh** | `baking skill-registry --force` when installing a new skill |

---

## 10. Benchmark — justifying savings

**Request:** *"Same Plan Pro badge — baseline run without baking vs with baking."*

| | |
|---|---|
| **Arm A** | Opus/Composer the whole chat · `benchmark.arm: baseline` |
| **Arm B** | `/baking` · `benchmark.arm: baking` |
| **Same** | `benchmark.pair_id` |
| **After** | manual `usage.total_usd` · `baking metrics-summary` |

See [METRICS.md](../../METRICS.md).

---

## Quick matrix — what to enable

| Case | PLAN | Hyper | Verify | Engram |
|------|------|-------|--------|--------|
| Color / typo | — | — | skip | optional |
| Craft landing | ✓ | sometimes | ✓ | ✓ |
| Business rule | ✓ | — | ✓ | ✓ |
| Plan only | ✓ | sometimes | skip | ✓ |
| Large migration | ✓ | ✓ | ✓ | ✓ |
| CC mechanical | — | — | light | — |
| Cross-repo context | — | — | — | **✓** |
