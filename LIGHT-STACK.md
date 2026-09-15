# Baking Light Stack

Three **optional** pieces in `config.json` → `lightStack`. Minimal token usage.

Enable: `"lightStack": { "enabled": true, ... }` (default in global config v1.5+).

**Cursor and Claude Code** share the same config and handoff (`.cursor/handoff/`). Metrics: `runtime: "cursor" | "claude-code"`.

| Environment | Baking reference | Orchestrator | Memory setup |
|---------|-------------------|-------------|--------------|
| **Cursor** | `BAKING-CURSOR.md` | Composer / `/baking` skill | `baking memory status` |
| **Claude Code** | `claude-code/BAKING.md` | Sonnet + Agent tool | same CLI + global DB |

`claude` profile in config → Claude Code end-to-end. `cursor` / `hybrid` profile → Cursor.

---

## 1. Amnesia — Baking Memory (global)

**Problem:** re-explaining **decisions** across repos/sessions (not the same as a handoff).

**Store:** `~/.cursor/baking/memory/baking-memory.db` (SQLite + FTS5, Node 22+). Fallback: `observations.jsonl`.

**Setup:** `lightStack.memory.provider: "baking"` in config (default in template v1.9+). No MCP.

Verify: `baking doctor` → Baking memory line · `baking memory status`.

Full reference: **`MEMORY.md`**.

**Light usage (orchestrator):**

| When | CLI | Max |
|--------|-----|--------|
| Start of a non-trivial run | `baking memory context --query "<terms>"` | 1–2 |
| Closed decision/convention | `baking memory save --topic … --title … --body …` | 1 per finding |
| Baking close | `baking memory save --type session --title "Summary" --body "5 bullets"` | 1 |

**Don't:** paste whole handoffs; save structured What/Why/Where.

**Baking Memory** — same global path for Cursor and Claude Code; queries via FTS5.

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
[optional] baking memory context / search
→ classify → PLAN / EXECUTE
→ [optional] read skill from the registry
→ executor
→ Verify (handoff vs diff)
→ YAML + metrics JSONL
→ baking memory save (session summary)
```

---

## Doctor

```bash
baking doctor
```

Reports: Baking agents, Baking memory (if enabled), skill-registry (age), lightStack.enabled.
