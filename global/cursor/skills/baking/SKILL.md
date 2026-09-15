---
name: baking
description: Baking-AI orchestrator (Cursor). Metrics JSONL, planner, executor-cursor, light stack (Engram, verify, skill registry). /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Cursor (global)

Reference: **`BAKING-CURSOR.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**. Claude Code: **`claude-code/BAKING.md`** (same `lightStack` config).

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): Engram `mem_context` + `mem_search` if applicable.
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
4. **End:** YAML with `verify:` + Engram `mem_session_summary`.

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` to calibrate routing (`runtime: cursor`)

## Routing

Direct TRIVIAL | `planner` / **`planner-hyper`** / `planner-cursor` | `executor-cursor`. **`executor-mecanic` is Claude Code only** — see `AGENTS.md`.
