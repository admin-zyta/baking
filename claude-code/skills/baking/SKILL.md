---
name: baking
description: Baking orchestrator (Claude Code). Mecanic, executor, fork, metrics JSONL, light stack. /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Claude Code (global)

Reference: **`claude-code/BAKING.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**.

Config: **`~/.cursor/opus-sonnet/config.json`** (typically `claude` profile). Metrics: `runtime: claude-code`.

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): Engram `mem_context` + `mem_search` if applicable.
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **Boogiepop explore:** `starter_witch_plan` before Grep (≥4 files, starter MCP).
4. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
5. **End:** YAML with `verify:` + Engram `mem_session_summary`.

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` to calibrate routing

## Routing

Direct TRIVIAL → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (session). PLAN-DEEP → **planner-hyper**. PLAN → **planner**. PLAN-ONLY → planner/hyper, no exec.
