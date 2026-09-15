# Baking Light Stack

Three **optional** pieces in `config.json` → `lightStack`. Minimal token usage.

Enable: `"lightStack": { "enabled": true, ... }` (default in global config v1.5+).

**Cursor and Claude Code** share the same config and handoff (`.cursor/handoff/`). Metrics: `runtime: "cursor" | "claude-code"`.

| Environment | Baking reference | Orchestrator | Engram setup |
|---------|-------------------|-------------|--------------|
| **Cursor** | `BAKING-CURSOR.md` | Composer / `/baking` skill | `engram setup cursor` |
| **Claude Code** | `claude-code/BAKING.md` | Sonnet + Agent tool | `engram setup` (plugin) or MCP in Claude |

`claude` profile in config → Claude Code end-to-end. `cursor` / `hybrid` profile → Cursor.

---

## 1. Amnesia — Engram

**Problem:** re-explaining decisions across repos/sessions.

**Setup (once):**

```powershell
# Windows — see https://github.com/Gentleman-Programming/engram/releases
engram setup cursor    # Cursor → ~/.cursor/mcp.json
engram setup           # Claude Code — see Engram docs
# Restart IDE
```

Verify: `baking doctor` → Engram MCP line.

**Light usage (Baking orchestrator):**

| When | Tool | Max |
|--------|------|--------|
| Start of a non-trivial run | `mem_context` + `mem_search` (request terms) | 2 calls |
| Closed decision/convention/bug | `mem_save` (structured, not a transcript) | 1 per relevant finding |
| Baking close (any flow) | `mem_session_summary` | 1 — 5 bullets |

**Don't:** `mem_save` every turn; dump the whole handoff into Engram (it's already in `.cursor/handoff/`).

---

## 2. Verify — handoff vs diff

**Problem:** build OK but the handoff criteria aren't actually met.

**No SDD subagent.** The orchestrator or executor, at close:

1. Read the handoff → **Criteria / Checklist / Acceptance** section (the planner must include it).
2. `git diff` (or diff of the handoff scope).
3. Append to the handoff:

```markdown
## Verify
| Criterion | pass/fail | note |
|----------|-----------|------|
| … | pass | … |
```

4. YAML `verify: pass | partial | fail | skipped`

**Skip:** `TRIVIAL`, `PLAN-ONLY`, EXECUTE with no code changes.

**Rule:** `verify: fail` → `status: partial`, never `completed`.

---

## 3. Skill registry — lightweight catalog

**Problem:** not invoking the right skill (`deploy-vercel`, `send-email`, …).

**Refresh (manual or weekly):**

```bash
baking skill-registry
# or --force if you added new skills
```

Writes: `~/.cursor/baking/skill-registry.md` (global, not per repo).

**Light usage:** when classifying PLAN/EXECUTE, if the request matches a registry row → read **only** that `SKILL.md` (Read tool). Don't re-scan disk every turn.

---

## Order in a Baking run

```
[optional] mem_context / mem_search
→ classify → PLAN / EXECUTE
→ [optional] read skill from the registry
→ executor
→ Verify (handoff vs diff)
→ YAML + metrics JSONL
→ mem_session_summary
```

---

## Doctor

```bash
baking doctor
```

Reports: Baking agents, Engram MCP (optional), skill-registry (age), lightStack.enabled.
