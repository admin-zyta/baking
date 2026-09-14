---
name: init-baking
description: DEPRECATED — Baking es global. No instalar por repo. Usar /baking o "usemos baking".
disable-model-invocation: true
user-invocable: true
---

# DEPRECATED — Baking es global

**No hace falta init por proyecto.** Todo vive en:

- Config: `~/.cursor/opus-sonnet/config.json`
- Cursor: `~/.cursor/skills/baking/`, `~/.cursor/agents/`
- Claude Code: `~/.claude/skills/baking/`, `~/.claude/agents/`
- Otra PC: `npx @boogiepop/baking install`

## Uso

`/baking` o *"usemos baking para …"*

Baking crea solo `.cursor/handoff/` en el workspace si falta.

## Cambiar perfil / enabled

Editá **`~/.cursor/opus-sonnet/config.json`** (ej. `"profile": "cursor"` | `"claude"` | `"hybrid"`).

## Actualizar global

```bash
npx @boogiepop/baking install
```

O desde el repo git: `sync-global.ps1` / `install-claude-skills.ps1`.

No uses `enable-project.ps1` — deprecado.
