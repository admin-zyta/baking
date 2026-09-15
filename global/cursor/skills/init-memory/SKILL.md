---
name: init-memory
description: Bootstrap memoria de proyecto estilo Claude /init — scan + AGENTS.md + Engram. baking init-memory + PLAN-ONLY.
disable-model-invocation: false
user-invocable: true
---

# Init-memory — Baking

Equivalente liviano al **`/init` de Claude Code**: analizar el repo y dejar memoria persistente.

## Paso 0 — CLI (usuario o agente)

Desde la raíz del repo:

```bash
baking init-memory
# audit sin tocar AGENTS.md existente:
baking init-memory
# regenerar regla de proyecto:
baking init-memory --force
```

Genera `.cursor/baking/init/` (scan, borrador, temas Engram, `NEXT.md`).

## Paso 1 — PLAN-ONLY (agente)

1. Leer `.cursor/baking/init/NEXT.md` y `scan.json`.
2. Lanzar **`planner`** (Opus/Fable según señales) — **PLAN-ONLY**, sin executor.
3. Entregables en el handoff:
   - **`AGENTS.md`** final (create) o **audit/merge** (si ya existía).
   - **`.cursor/rules/baking-project.mdc`** conciso si falta contexto Cursor.
   - **`mem_save`** por cada tema en `engram-topics.json` (estructurado, no transcript).
4. Cierre: YAML + JSONL métricas.

## Reglas

- No volcar README/handoff entero a Engram.
- Solo lo que el agente **inferiría mal** sin contexto (comandos no estándar, puertos, monorepo, gotchas).
- Modo **audit** si ya hay `AGENTS.md` o `CLAUDE.md` — no sobrescribir sin revisión del usuario.
