# Baking — planner → executor (global)

Orquestador **Baking**: Opus planifica, executor implementa, diary en `.cursor/handoff/`.

**Versión:** ver `VERSION` y `config.json` → `bakingVersion`.

> **Clonar GitHub ≠ instalar.** Después del clone: `node bin/baking.js install`  
> Verificar: `node bin/baking.js doctor` · Nombres de agentes: **`AGENTS.md`**

## Repo (fuente de verdad)

```
~/.cursor/opus-sonnet/
  VERSION
  CHANGELOG.md
  config.json
  sync-global.ps1
  package.json
  global/cursor/     → deploy a ~/.cursor/
  global/claude/     → deploy a ~/.claude/
  BAKING-CURSOR.md
  claude-code/BAKING.md
  ROUTER.md, consumption.md, creative-brief-bar.md
```

## Deploy (después de pull o editar el repo)

```powershell
& "$env:USERPROFILE\.cursor\opus-sonnet\sync-global.ps1"
```

O desde npm (otra máquina o sin clonar el repo):

```bash
npx @boogiepop/baking install
# o desde GitHub (privado): clone https://github.com/admin-zyta/baking
```

Repo: https://github.com/admin-zyta/baking

Ver `NPM.md` para publicar.

Copia skills, agents y rule gate a Cursor + Claude Code. **No** toca proyectos.

## Uso

| Entorno | Invocación | Instalar global |
|---------|------------|-----------------|
| Cursor | `/baking` o *"usemos baking para …"* | `npx @boogiepop/baking install` |
| Claude Code | `/baking` o *"usemos baking para …"* | idem |

Perfil: editar `"profile"` en `config.json` (`cursor` | `claude` | `hybrid`).

## Flujos

- **PLAN-ONLY** — solo plan / repreguntas; sin executor hasta *"ejecutá"*
- **PLAN+EXECUTE** — plan + implementación
- **Closure gates** — spec / craft / assets (landings creativas)

## Versionar cambios

1. Editar archivos en este repo (preferir `global/` + docs raíz)
2. Actualizar `VERSION`, `CHANGELOG.md`, `bakingVersion` en `config.json`
3. `git commit` + tag `vX.Y.Z`
4. `sync-global.ps1`

Otras sesiones: citar `bakingVersion` en cierre YAML del handoff.

Métricas: `.cursor/baking/metrics/runs.jsonl` — ver `METRICS.md`.

## Deprecado

Instalación por proyecto, `/init-baking`, `enable-project.ps1` (solo crean `handoff/` con warning).
