---
name: baking
description: Baking-AI orchestrator (Claude Code). Mecanic, executor, fork, metrics JSONL, light stack. /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Claude Code (global)

Reference: **`claude-code/BAKING.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**.

Config: **`~/.cursor/opus-sonnet/config.json`** (typically `claude` profile). Metrics: `runtime: claude-code`.

## Gate-out — when **not** to use Baking

Classify **before** subagents, handoff, or metrics.

**GATE-OUT** for pure Q&A, explanation, review-only, or status — no code change requested. Reply directly; optional *"Baking not needed here — …"*. No YAML, JSONL, or handoff.

**Always Baking** for implement/fix/refactor/deploy or explicit **`/baking`** / *use baking*.

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): Engram `mem_context` + `mem_search` if applicable.
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
4. **End:** YAML with `verify:` + Engram `mem_session_summary`.

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` to calibrate routing

## Routing

Direct TRIVIAL → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (session). PLAN-DEEP → **planner-hyper**. PLAN → **planner**. PLAN-ONLY → planner/hyper, no exec.
