# Components — Baking-AI

← [Back to README](./README.md)

---

## Core

| ID | Component | Description |
|----|------------|-------------|
| `orchestrator` | **Baking** | Classifies, delegates, closes with YAML + metrics. Doesn't edit product code. |
| `handoff` | **Diary** | `.cursor/handoff/*.md` — plan + execution + verify in one file. |
| `planner` | **Planner** | Opus. Research + handoff. Only writes in handoffDir. |
| `planner-hyper` | **Hyper** | Fable. Deep plan — architecture, strategic creative-brief. |
| `executor` | **Executor** | Implements per the handoff. Sonnet (Claude) or Composer (Cursor). |
| `executor-mecanic` | **Mecanic** | Haiku. Mechanical steps with a handoff. **Claude Code only.** |
| `executor-cursor` | **Executor Cursor** | Composer 2.5. `cursor` / `hybrid` profiles. |
| `metrics` | **runs.jsonl** | One JSON line per run — routing, cost, review. |
| `creative-brief-bar` | **Craft gates** | Landings: prod + spec + craft + visual. |

---

## Light stack (v1.5+)

| ID | Component | Problem it addresses |
|----|------------|-------------------|
| `baking-memory` | **Baking Memory** (SQLite FTS) | Amnesia — decisions across repos/sessions |
| `verify` | **Handoff vs diff** | Build OK but criteria not met |
| `skill-registry` | **Skill index** | Not using a skill you already have installed |

Config: `lightStack` in `config.json`. Doc: [LIGHT-STACK.md](../../LIGHT-STACK.md).

---

## Agents by environment

### Cursor (`~/.cursor/agents/`)

| Task name | File |
|-----------|---------|
| `baking` | `baking.md` |
| `planner` | `planner.md` |
| `planner-hyper` | `planner-hyper.md` |
| `planner-cursor` | `planner-cursor.md` |
| `executor-cursor` | `executor-cursor.md` |

### Claude Code (`~/.claude/agents/`)

| Agent | File |
|-------|---------|
| `baking` | `baking.md` |
| `planner` | `planner.md` |
| `planner-hyper` | `planner-hyper.md` |
| `executor` | `executor.md` |
| `executor-mecanic` | `executor-mecanic.md` |

Shared handoff template: **`~/.cursor/agents/planner.md`**.

See [AGENTS.md](../../AGENTS.md).

---

## CLI (`@admin-zyta/baking-ai`)

| Command | Action |
|---------|--------|
| `baking install` | Global deploy to Cursor + Claude |
| `baking doctor` | Agents + light stack + Baking Memory |
| `baking skill-registry` | Regenerates the skill index |
| `baking metrics-summary` | S0 vs S3 savings, averages |
| `baking metrics-review` | Routing/savings conclusion (7 days or 50 runs) |
| `baking version` | Installed semver |

---

## Billing profiles

| Profile | Planner | Executor | Pool |
|--------|---------|----------|------|
| `cursor` | Opus | Composer | Mixed |
| `hybrid` | Grok | Composer | Cursor Models |
| `claude` | Opus | Sonnet / Haiku | Other Models |

See [routing.md](./routing.md) and [consumption.md](../../consumption.md).
