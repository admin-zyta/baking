---
name: baking
description: Orquestador Baking (Cursor). Metrics JSONL, planner, executor-cursor. /baking, usemos baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Cursor (global)

Referencia: **`BAKING-CURSOR.md`**, **`METRICS.md`**.

## Cierre obligatorio

1. YAML al usuario
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` para calibrar routing (`runtime: cursor`)

## Routing

TRIVIAL directo | `planner` / **`planner-hyper`** / `planner-cursor` | `executor-cursor`. **`executor-mecanic` solo Claude Code** — ver `AGENTS.md`.
