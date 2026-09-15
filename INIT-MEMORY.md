# Baking init-memory

Project memory bootstrap (Claude `/init` style).

## Commands

```bash
baking init-memory              # scan + drafts in .cursor/baking/init/
baking init-memory --dry-run    # preview without writing
baking init-memory --force      # regenerates .cursor/rules/baking-project.mdc
```

Then: **`/init-memory`** or *use baking PLAN-ONLY to complete init-memory*.

## What it generates

| File | Role |
|---------|-----|
| `.cursor/baking/init/scan.json` | Detected signals (stack, CI, create/audit mode) |
| `.cursor/baking/init/AGENTS.draft.md` | Draft — base for the agent |
| `.cursor/baking/init/engram-topics.json` | Suggested topics for `mem_save` |
| `.cursor/baking/init/NEXT.md` | PLAN-ONLY instructions |
| `AGENTS.md` | Written only in **create** mode (repo with no AGENTS/CLAUDE) |
| `.cursor/rules/baking-project.mdc` | Cursor alwaysApply rule (concise) |

## Auto-route (Baking by default)

Optional — global toggle:

```bash
baking auto-route status
baking auto-route on    # code requests → Baking without "/baking" every time
baking auto-route off
```

Config: `autoRoute.enabled` in `~/.cursor/opus-sonnet/config.json`.

With `autoRoute.on`: the `opus-sonnet-router.mdc` rule applies ROUTER on implementation.
With `off`: `/baking` or *use baking* is required (previous behavior).
