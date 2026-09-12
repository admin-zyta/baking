# Planner → Executor — Orquestador **Baking** (global)

Config única: **`~/.cursor/opus-sonnet/config.json`** (`enabled`, `profile`, `handoffDir`).

**No** usar `.claude/planner-executor.json` por repo.

## Baking

- **`/baking`** o *"usemos baking para …"*
- Agentes globales: `~/.claude/agents/` (baking, planner, executor)
- Handoff: `.cursor/handoff/` (Baking crea la carpeta si falta)

## Perfil

Editar `profile` en config global: `claude` | `cursor` | `hybrid`

Referencia: `~/.cursor/opus-sonnet/claude-code/BAKING.md`
