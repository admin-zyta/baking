# Baking — métricas de routing

Archivo append-only por workspace para medir si el routing (planner / hyper / mecanic / executor) fue acertado.

## Ubicación

Default: **`.cursor/baking/metrics/runs.jsonl`** (una línea JSON por corrida).

Config: `metrics.dir` y `metrics.enabled` en `~/.cursor/opus-sonnet/config.json`.

Bootstrap: Baking crea la carpeta si falta (como `handoff/`).

## Cuándo escribir

**Obligatorio** al cerrar **cualquier** corrida Baking (PLAN-ONLY incluido), después del YAML al usuario.

Usar **Write** o append (Bash) — no omitir por pereza.

## Formato (una línea = un run)

Ver `metrics.schema.json`. Campos clave:

| Campo | Para qué |
|-------|----------|
| `prompt` | Pedido original (completo o truncado 2k chars) |
| `classification.flow` | PLAN+EXECUTE, PLAN-ONLY, TRIVIAL, … |
| `classification.plan_agent` | `planner` \| `hyper` \| `skipped` |
| `classification.exec_agent` | `mecanic` \| `executor` \| `fork` \| `direct` \| `skipped` |
| `classification.plan_mode` | `auto` \| `explicit-deep` \| `explicit-normal` \| `explicit-only` |
| `models.*` | Modelo **real** usado (orchestrator, planner, executor) |
| `signals` | Señales que dispararon la clasificación |
| `review.plan_fit` | `good` \| `overkill` \| `underkill` \| `n/a` |
| `review.exec_fit` | idem |
| `review.note` | Una línea — para mejorar reglas |

## Autoevaluación `review` (Baking al cierre)

| Situación | plan_fit | exec_fit |
|-----------|----------|----------|
| PLAN creativo / arquitectura con `planner` (sin hyper aún) | `underkill` si ≥2 señales deep | — |
| Trivial con subagente | — | `overkill` |
| Mecánico con `executor` Sonnet | — | `overkill` |
| Craft/landing con `mecanic` | — | `underkill` |
| Routing acorde a tabla BAKING.md | `good` | `good` |
| PLAN-ONLY / sin exec | `good` o evaluar plan | `n/a` |

Cuando exista **`planner-hyper`**: `underkill` = debió ir hyper; `overkill` = debió ir planner normal.

## Análisis (offline)

```powershell
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Group-Object { $_.classification.exec_agent } | Select Name, Count

# plan_fit underkill
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.review.plan_fit -eq 'underkill' } | Select prompt, signals
```

Bench AI-flow: copiar `runs.jsonl` a `AI-flow/runs/<escenario>/exports/metrics.jsonl`.

## Privacidad

El `prompt` puede contener datos del repo — no commitear a git público sin revisar. Agregar `.cursor/baking/metrics/` al `.gitignore` del proyecto si hace falta.
