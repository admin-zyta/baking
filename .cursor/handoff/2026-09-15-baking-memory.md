# Plan: Baking Memory

**Created:** 2026-09-15  
**Original request:** Cross-repo/session amnesia — queryable global memory native to Baking-AI.  
**Handoff:** `.cursor/handoff/2026-09-15-baking-memory.md`

## Objective

Native **Baking Memory** for decisions that outlive a handoff or AGENTS.md — shared by **Cursor and Claude Code**.

## Decision

| Option | Verdict |
|--------|---------|
| External MCP memory | **Rejected** — not part of Baking-AI |
| Markdown only | **Rejected** — weak queries at scale |
| **SQLite + FTS5** (`node:sqlite`) | **Chosen** v1.9 |
| Embeddings | **Later** if FTS insufficient |

## Done criteria

- [x] `lib/baking-memory.js` + `baking memory` CLI
- [x] `config.lightStack.memory.provider: "baking"`
- [x] `MEMORY.md` + LIGHT-STACK updated
- [x] Skills/agents hooks → `baking memory …`
- [x] Docs/skills/agents — Baking Memory only (no third-party memory product names)
- [x] init-memory topics → `baking memory save` wording
- [x] Rule `baking-memory.mdc`; legacy `engram-memory.mdc` removed on install

## Execution

See git tags `v1.9.0` · `v1.9.1`.

### 2026-09-15 — closed

- Fixed `bin/baking.js` — restored `async function main()` wrapper (syntax error).
- Smoke test: `memory save/search/status` + `doctor` → sqlite OK.
- Docs/skills/agents: Baking Memory across README, LIGHT-STACK, init-memory, Claude/Cursor globals.
- `init-memory`: `memory-topics.json` + `baking memory save` wording.
- v1.9.1: purge third-party memory references; deploy `baking-memory.mdc`.
