---
name: baking
description: Orquestador Baking (Cursor). Metrics JSONL, planner, executor-cursor, light stack (Engram, verify, Witch, skill registry). /baking, usemos baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Cursor (global)

Referencia: **`BAKING-CURSOR.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**. Claude Code: **`claude-code/BAKING.md`** (misma config `lightStack`).

## Light stack (ligero — si `lightStack.enabled`)

1. **Inicio** (no trivial): Engram `mem_context` + `mem_search` si aplica.
2. **Skill:** matchear pedido con `~/.cursor/baking/skill-registry.md` → Read un SKILL.md.
3. **Boogiepop explore (opcional):** si `lightStack.witch.enabled` y repo con `witch.json` / starter-base → `starter_witch_plan` antes de Grep (≥4 archivos).
4. **Cierre EXECUTE:** handoff criterios vs diff → `## Verify` en handoff.
5. **Fin:** YAML con `verify:` + Engram `mem_session_summary`.

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Cierre obligatorio

1. YAML al usuario (incl. `verify` si hubo código)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` para calibrar routing (`runtime: cursor`)

## Routing

TRIVIAL directo | `planner` / **`planner-hyper`** / `planner-cursor` | `executor-cursor`. **`executor-mecanic` solo Claude Code** — ver `AGENTS.md`.
