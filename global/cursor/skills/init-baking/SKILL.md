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

## Uso

`/baking` o *"usemos baking para …"*

Baking crea solo `.cursor/handoff/` en el workspace si falta.

## Cambiar perfil / enabled / versión

Editá **`~/.cursor/opus-sonnet/config.json`** en el **repo git**, commit, tag, deploy:

```powershell
cd ~/.cursor/opus-sonnet
# editar VERSION, CHANGELOG, config.json bakingVersion
git commit -am "baking: ..."
git tag v1.0.1
& ./sync-global.ps1
```
