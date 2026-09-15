# Planner → Executor — **Baking** orchestrator (global)

Single config: **`~/.cursor/opus-sonnet/config.json`** (`enabled`, `profile`, `handoffDir`).

**Do not** use per-repo `.claude/planner-executor.json`.

## Baking

- **`/baking`** or *"use baking for …"*
- Global agents: `~/.claude/agents/` (baking, planner, executor)
- Handoff: `.cursor/handoff/` (Baking creates the folder if missing)

## Profile

Edit `profile` in global config: `claude` | `cursor` | `hybrid`

Reference: `~/.cursor/opus-sonnet/claude-code/BAKING.md`
