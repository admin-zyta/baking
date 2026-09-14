# Agentes Baking — nombres exactos para Task

**Importante:** los agentes viven en **`~/.cursor/agents/`** y **`~/.claude/agents/`** después de `node bin/baking.js install`. Clonar el repo **no** alcanza.

## Cursor (`~/.cursor/agents/`)

| Task `subagent_type` | Archivo | Rol |
|----------------------|---------|-----|
| `baking` | `baking.md` | Orquestador |
| `planner` | `planner.md` | Plan normal (Opus) |
| `planner-hyper` | `planner-hyper.md` | Plan deep (Fable) |
| `planner-hyper-cursor` | `planner-hyper-cursor.md` | Idem (nombre alternativo) |
| `planner-cursor` | `planner-cursor.md` | Plan normal hybrid (Grok) |
| `executor-cursor` | `executor-cursor.md` | Ejecutor (Composer) |
| `executor` | `executor.md` | Referencia |

**No existe en Cursor:** `executor-mecanic` (solo Claude Code / Haiku). Tareas mecánicas → `executor-cursor` o resolver directo.

## Claude Code (`~/.claude/agents/`)

| Agent | Archivo | Rol |
|-------|---------|-----|
| `baking` | `baking.md` | Orquestador |
| `planner` | `planner.md` | Plan normal (Opus) |
| `planner-hyper` | `planner-hyper.md` | Plan deep (Fable) |
| `executor` | `executor.md` | Ejecutor (Sonnet) |
| `executor-mecanic` | `executor-mecanic.md` | Mecánico (Haiku) |

## Verificar instalación

```bash
node bin/baking.js doctor
```

Debe listar todos los archivos anteriores como **OK**.
