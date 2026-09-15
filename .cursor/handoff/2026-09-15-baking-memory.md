# Plan: Baking Memory (replace Engram)

**Created:** 2026-09-15  
**Original request:** Cross-repo/session amnesia without Engram — queryable global memory.  
**Handoff:** `.cursor/handoff/2026-09-15-baking-memory.md`

## Objective

Native **Baking Memory** for decisions that outlive a handoff or AGENTS.md — shared by **Cursor and Claude Code**.

## Decision

| Option | Verdict |
|--------|---------|
| Engram MCP | **Rejected** — external skill, not Baking-AI |
| Markdown only | **Rejected** — weak queries at scale |
| **SQLite + FTS5** (`node:sqlite`) | **Chosen** v1.9 |
| Embeddings | **Later** if FTS insufficient |

## Done criteria

- [x] `lib/baking-memory.js` + `baking memory` CLI
- [x] `config.lightStack.memory.provider: "baking"`
- [x] `MEMORY.md` + LIGHT-STACK updated
- [x] Skills/agents hooks → `baking memory …`
- [x] Remaining doc grep (quickstart, use-cases) — follow-up
- [x] init-memory topics → `baking memory save` wording

## Execution

See git commit v1.9.0.

### 2026-09-15 — closed

- Fixed `bin/baking.js` — restored `async function main()` wrapper (syntax error).
- Smoke test: `memory save/search/status` + `doctor` → sqlite OK, 1 obs.
- Docs/skills/agents: Engram → Baking Memory across README, LIGHT-STACK, init-memory, Claude/Cursor globals.
- `init-memory`: `memory-topics.json` + `baking memory save` wording.
- `baking install` run; ready for tag `v1.9.0`.
