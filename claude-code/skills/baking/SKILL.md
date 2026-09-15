---
name: baking
description: Orquestador Baking (Claude Code). Mecanic, executor, fork, metrics JSONL, light stack. /baking, usemos baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Claude Code (global)

Referencia: **`claude-code/BAKING.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**.

Config: **`~/.cursor/opus-sonnet/config.json`** (perfil `claude` típico). Métricas: `runtime: claude-code`.

## Light stack (ligero — si `lightStack.enabled`)

1. **Inicio** (no trivial): Engram `mem_context` + `mem_search` si aplica.
2. **Skill:** matchear pedido con `~/.cursor/baking/skill-registry.md` → Read un SKILL.md.
3. **Boogiepop explore:** `starter_witch_plan` antes de Grep (≥4 archivos, MCP starter).
4. **Cierre EXECUTE:** handoff criterios vs diff → `## Verify` en handoff.
5. **Fin:** YAML con `verify:` + Engram `mem_session_summary`.

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Cierre obligatorio

1. YAML al usuario (incl. `verify` si hubo código)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` para calibrar routing

## Routing

TRIVIAL directo → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (sesión). PLAN-DEEP → **planner-hyper**. PLAN → **planner**. PLAN-ONLY → planner/hyper, sin exec.
