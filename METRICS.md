# Baking — métricas de routing y costo

Archivo append-only por workspace para:

1. **Routing** — ¿planner / hyper / mecanic / executor fue acertado vs el pedido?
2. **Costo** — ¿pagamos menos que baseline (S0 vs S3, Opus padre vs Baking)?

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
| **`benchmark.scenario_id`** | Opcional — `S0-baseline`, `S3-plan-complex`, … |
| **`benchmark.arm`** | `baseline` \| `baking` \| `opus-parent` |
| **`benchmark.pair_id`** | Mismo ID en ambos brazos del **mismo prompt** |
| **`usage.total_usd`** | Opcional — costo corrida (Usage manual) |
| **`usage.total_tokens`** | Opcional — o suma de tokens in/out por capa |
| **`usage.source`** | `manual` \| `transcript` \| `usage_export` |
| **`outcome.scores.verify`** | `pass` \| `partial` \| `fail` \| `skipped` — light stack handoff vs diff |
| **`runtime`** | `cursor` \| `claude-code` — mismo light stack, distinto entorno |

## Costo y benchmark (opcional pero recomendado en bench)

Para **“ahorramos X%”** hace falta `usage.total_usd` (y `benchmark` para emparejar).

### S0 vs S3 (mismo prompt, dos brazos)

| Corrida | `benchmark.scenario_id` | `benchmark.arm` | `benchmark.pair_id` |
|---------|-------------------------|-----------------|---------------------|
| Sin router (Opus/Composer todo el chat) | `S0-baseline` | `baseline` o `opus-parent` | `stream-plans-s3-badge` |
| Con Baking | `S3-plan-complex` | `baking` | **`stream-plans-s3-badge`** (igual) |

Después del cierre, copiá costo desde **Cursor Usage** o **Claude Code usage** → `usage.total_usd`, `source: "manual"`.

### Ejemplo línea con costo

```json
{
  "ts": "2026-09-14T16:00:00-03:00",
  "bakingVersion": "1.4.0",
  "runtime": "claude-code",
  "profile": "claude",
  "prompt": "Agregá badge Más popular en PlanCard…",
  "handoff": ".cursor/handoff/2026-09-14-badge.md",
  "classification": { "flow": "PLAN+EXECUTE", "plan_agent": "planner", "exec_agent": "executor", "plan_mode": "auto", "exec_mode": "auto" },
  "models": { "orchestrator": "sonnet", "planner": "opus", "executor": "sonnet" },
  "signals": ["multi_file"],
  "benchmark": { "scenario_id": "S3-plan-complex", "arm": "baking", "pair_id": "stream-plans-s3-badge" },
  "usage": { "total_usd": 0.42, "total_tokens": 185000, "planner_tokens_in": 12000, "planner_tokens_out": 8000, "executor_tokens_in": 90000, "executor_tokens_out": 75000, "source": "manual", "notes": "Usage Claude 24h export" },
  "outcome": { "status": "completed", "scores": { "spec": "pass" } },
  "review": { "plan_fit": "good", "exec_fit": "good", "note": "" }
}
```

**Baseline** (S0): misma estructura, `"arm": "baseline"`, `"scenario_id": "S0-baseline"`, mismo `pair_id`, `total_usd` típicamente mayor.

### Resumen de ahorro (CLI)

Desde la raíz del proyecto (donde está `.cursor/baking/metrics/runs.jsonl`):

```bash
baking metrics-summary
# o
node ~/.cursor/opus-sonnet/bin/baking.js metrics-summary .cursor/baking/metrics/runs.jsonl
```

Imprime promedios por escenario/brazo y **savings_pct** por `pair_id` cuando ambos tienen `usage.total_usd`.

## Autoevaluación `review` (Baking al cierre)

| Situación | plan_fit | exec_fit |
|-----------|----------|----------|
| PLAN creativo / arquitectura con `planner` cuando ≥2 señales deep | `underkill` | — |
| Arquitectura con `hyper` para typo/fix acotado | `overkill` | — |
| Trivial con subagente | — | `overkill` |
| Mecánico con `executor` Sonnet | — | `overkill` |
| Craft/landing con `mecanic` | — | `underkill` |
| Routing acorde a tabla BAKING.md | `good` | `good` |
| PLAN-ONLY / sin exec | `good` o evaluar plan | `n/a` |

Cuando exista **`planner-hyper`**: `underkill` = debió ir hyper; `overkill` = debió ir planner normal.

Señales deep típicas en `signals`: `architecture`, `creative_brief`, `multi_file`, `strategic_only`, `explicit_plan_deep`.

## Análisis (offline)

```powershell
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Group-Object { $_.classification.exec_agent } | Select Name, Count

# plan_fit underkill
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.review.plan_fit -eq 'underkill' } | Select prompt, signals
```

Bench AI-flow: copiar `runs.jsonl` a `AI-flow/runs/<escenario>/exports/metrics.jsonl`.

## Ciclo de conclusión (routing + ahorro)

**Disparo:** cada **7 días** *o* cada **50 corridas** desde la última conclusión (lo que ocurra primero). Config en `metrics.review` (`~/.cursor/opus-sonnet/config.json`).

| Comando | Qué hace |
|---------|----------|
| `baking metrics-review --status` | Cuánto falta para la próxima conclusión |
| `baking metrics-review` | Si corresponde, genera conclusión en `conclusions/` |
| `baking metrics-review --force` | Conclusión aunque no haya llegado el umbral |
| `baking metrics-review --close-cycle` | Archiva JSONL y reinicia ciclo (después de objetivo cumplido) |

**Umbrales default (conclusión “objetivo cumplido”):**

| Dimensión | Criterio |
|-----------|----------|
| Routing | ≤10% underkill/overkill en muestra de 20 últimas corridas → `ROUTING_OK` |
| Ahorro | ≥3 pares bench con ≥25% ahorro y `usage.total_usd` en ambos brazos → `SAVINGS_PROVEN` |

Si routing OK pero no hay bench de costo → conclusión igual, veredicto `NO_BENCH_DATA`.

**No borrar** el JSONL al cerrar — archivar con `--close-cycle`. Las conclusiones `.md` son el resumen legible; el JSONL archivado es evidencia.

## Privacidad

El `prompt` puede contener datos del repo — no commitear a git público sin revisar. Agregar `.cursor/baking/metrics/` al `.gitignore` del proyecto si hace falta.
