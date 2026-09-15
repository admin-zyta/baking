---
name: init-memory
description: Claude /init-style project memory bootstrap — scan + AGENTS.md + Baking Memory. baking init-memory + PLAN-ONLY.
disable-model-invocation: false
user-invocable: true
---

# Init-memory — Baking

A lightweight equivalent of Claude Code's **`/init`**: analyze the repo and leave persistent memory behind.

## Step 0 — CLI (user or agent)

From the repo root:

```bash
baking init-memory
# audit without touching an existing AGENTS.md:
baking init-memory
# regenerate the project rule:
baking init-memory --force
```

Generates `.cursor/baking/init/` (scan, draft, memory topics, `NEXT.md`).

## Step 1 — PLAN-ONLY (agent)

1. Read `.cursor/baking/init/NEXT.md` and `scan.json`.
2. Launch **`planner`** (Opus/Fable depending on signals) — **PLAN-ONLY**, no executor.
3. Deliverables in the handoff:
   - Final **`AGENTS.md`** (create) or **audit/merge** (if it already existed).
   - Concise **`.cursor/rules/baking-project.mdc`** if Cursor context is missing.
   - **`baking memory save`** for each topic in `memory-topics.json` (structured, not a transcript).
4. Close: YAML + metrics JSONL.

## Rules

- Don't dump the whole README/handoff into Baking Memory.
- Only what the agent **would misinfer** without context (non-standard commands, ports, monorepo, gotchas).
- **audit** mode if `AGENTS.md` or `CLAUDE.md` already exists — don't overwrite without user review.
