# Changelog — Baking

Formato basado en [Keep a Changelog](https://keepachangelog.com/). Versionado en `VERSION` y `config.json` → `bakingVersion`.

## [1.6.0] — 2026-09-15

### Added

- **`baking init-memory`** — scan del repo → `.cursor/baking/init/` + `AGENTS.md` (create) o audit + skill **`/init-memory`** (PLAN-ONLY + Engram).
- **`baking auto-route on|off|status`** — toggle opcional: Baking por default en pedidos de código (`autoRoute.enabled` en config).
- **`INIT-MEMORY.md`** · regla gate actualizada (auto-route + exclusiones Q&A).

## [1.5.3] — 2026-09-15

### Added

- **`baking metrics-review`** — conclusión automática de routing y ahorro cuando pasan **7 días** o **50 corridas** desde la última revisión (config `metrics.review`).
- Escribe `.cursor/baking/metrics/conclusions/YYYY-MM-DD-cycle-N.md` + `review-state.json`.
- **`baking metrics-review --close-cycle`** — archiva `runs.jsonl` a `runs-cycle-N-YYYY-MM-DD.jsonl` y arranca ciclo nuevo (no borra).

## [1.5.2] — 2026-09-15

### Added

- **Baking-AI docs** — `docs/baking-ai/` (README, intended-usage, use-cases, components, routing, quickstart).
- `BAKING-AI.md` índice · `baking-ai-docs.html` (Desktop) para lectura por partes.

## [1.5.1] — 2026-09-15

### Added

- **Paridad Cursor + Claude Code** para light stack: `claude-code/BAKING.md`, agents/skills Claude, `executor` verify, `consumption.md`, `ROUTER.md`.
- Engram doctor detecta `~/.cursor/mcp.json` y `~/.claude/settings.json`.
- Métricas: `outcome.scores.verify` en schema.

## [1.5.0] — 2026-09-15

### Added

- **Light stack** (`config.lightStack`, `LIGHT-STACK.md`): Engram + verify handoff-vs-diff + Witch Boogiepop + skill registry liviano.
- **`baking skill-registry`** — genera `~/.cursor/baking/skill-registry.md` desde skills instaladas.
- **`baking doctor`** — reporta Engram MCP (opcional) y edad del registry.
- YAML de cierre: campo `verify: pass | partial | fail | skipped`.
- Planner: nota en «Criterios de done» para verify al cierre Baking.

### Usage

- Engram: `engram setup cursor` (una vez) + hooks mínimos en skill Baking.
- Registry: `baking skill-registry` (semanal o `--force`).

## [1.4.1] — 2026-09-14

### Fixed

- **Métricas de cierre no se escribían tras un update en caliente** — `consumption.md` documenta el
  caso real: el orquestador dejó de releer `SKILL.md` tras un bump de versión a mitad de sesión y
  siguió orquestando de memoria, sin volver a ver el requisito de `runs.jsonl` (ya vigente desde
  1.2.0). Regla nueva: releer `SKILL.md`/`BAKING.md`/`METRICS.md` cuando el harness informe
  agentes/skills nuevos disponibles, no asumir que el workflow sigue siendo el mismo.

### Evidence

- Sesión lore-forge, 2026-09-14: baking pasó de v1.1.0 a v1.4.0 en la misma sesión; ~15 corridas de
  `planner-hyper`/`executor`/`executor-mecanic` sin una sola línea de métricas, detectado recién
  cuando el usuario preguntó directo "¿se está generando el JSON?".

[1.4.1]: https://github.com/admin-zyta/baking/releases/tag/v1.4.1

## [1.4.0] — 2026-09-14

### Added

- **Métricas de costo** — campos opcionales `usage` (tokens, `total_usd`, `source`) y
  `benchmark` (`scenario_id`, `arm`, `pair_id`) en `metrics.schema.json` / `METRICS.md`.
- **`baking metrics-summary`** — compara brazos emparejados (S0 vs S3) y calcula `savings_pct`.

[1.4.0]: https://github.com/admin-zyta/baking/releases/tag/v1.4.0

## [1.3.1] — 2026-09-14

### Fixed

- **`planner-hyper`** en Cursor — alias en `global/cursor/agents/planner-hyper.md` (Task ya no falla si Baking invoca `planner-hyper` en vez de `planner-hyper-cursor`).
- **`baking doctor`** — verifica agentes en `~/.cursor/agents/` y `~/.claude/agents/`.
- **`AGENTS.md`** — tabla de nombres exactos; aclara que **`executor-mecanic` no existe en Cursor**.

[1.3.1]: https://github.com/admin-zyta/baking/releases/tag/v1.3.1

## [1.3.0] — 2026-09-13

### Added

- **npm `@boogiepop/baking`** — `npx @boogiepop/baking install` despliega skills, agentes, rules y config global (ver `NPM.md`).

### Added (Hyper)

- **`planner-hyper`** (Claude Code) y **`planner-hyper-cursor`** (Cursor) — plan deep con **Fable**
  (`claude-fable-5[effort=high]`).
- Routing **PLAN-DEEP**: explícito (*hyper*, *plan deep*, *pensá bien*) o automático (≥2 señales:
  arquitectura, creative-brief, ambigüedad, >3 archivos).
- Config `profiles.*.plannerHyper` + métricas `plan_agent: hyper`, `plan_mode: explicit-deep|…`.

[1.3.0]: https://github.com/local/baking/releases/tag/v1.3.0

## [1.2.0] — 2026-09-13

### Added

- **Métricas JSONL** — Baking append a `.cursor/baking/metrics/runs.jsonl` por corrida:
  `prompt`, agentes, modelos, señales, `review.plan_fit` / `exec_fit` (`METRICS.md`,
  `metrics.schema.json`, config `metrics.enabled`).
- Preparación `plan_agent: hyper` en schema para futuro `planner-hyper`.

[1.2.0]: https://github.com/local/baking/releases/tag/v1.2.0

## [1.1.1] — 2026-09-12

### Added

- **`executor-mecanic`** — subagente Haiku fijo (`model: haiku` en frontmatter) para pasos
  mecánicos con handoff (rename, doc-only, wiring trivial). Reemplaza override `model: haiku`
  en Agent call (poco confiable).
- Escalera EXECUTE: TRIVIAL directo → mecanic → executor → fork.
- Cierre YAML: `exec_agent: mecanic | executor | fork | direct`.

[1.1.1]: https://github.com/local/baking/releases/tag/v1.1.1

## [1.1.0] — 2026-09-12

### Added

- **Executor barato para tareas mecánicas** — `model: "haiku"` (Claude Code) en vez del Sonnet
  default del perfil para rename/campo suelto/doc-only/verificación sin diseño (`claude-code/BAKING.md`,
  `consumption.md`)
- **Sugerir `/compact` al cerrar** una tarea (`status: completed`), `/clear` si el próximo pedido
  es un tema no relacionado (`claude-code/BAKING.md`, `consumption.md`)
- **Reintento automático ante fallo de infraestructura** de un subagente (stream watchdog, no fallo
  de contenido) — relanzar el mismo pedido sobre el mismo handoff sin escalar al usuario, salvo que
  vuelva a fallar (`consumption.md`)

### Evidence

- Reporte de uso 24h (sesión lore-forge, 2026-09-12): 84% subagent-heavy, 84% sesiones 8h+, 74% de
  uso a >150k de contexto
- `planner` colgado por stream watchdog tras sólo leer el handoff, sin escribir nada — reintento
  manual sobre el mismo handoff intacto resolvió en el segundo intento

[1.1.0]: https://github.com/local/baking/releases/tag/v1.1.0

## [1.0.0] — 2026-09-12

Primera release versionada. Repo: `~/.cursor/opus-sonnet/`.

### Added

- **Git + VERSION** — fuente de verdad versionada; deploy con `sync-global.ps1`
- **Config global única** — `~/.cursor/opus-sonnet/config.json` (sin install por proyecto)
- **Orquestador Baking** — `/baking`, skills y agents en Cursor + Claude Code
- **PLAN-ONLY / PLAN-REVISE** — planear y repreguntar sin executor hasta pedido explícito
- **Closure gates** — scores `spec` / `craft` / `assets`; build ≠ completed
- **creative-brief-bar** — prod+spec+craft, asset verification, anti-fork
- **fork vs executor** (Claude Code) — reglas en `consumption.md` y `claude-code/BAKING.md`
- **Perfiles** — `cursor` | `hybrid` | `claude` en config global

### Deprecated

- `/init-baking`, `enable-project.ps1`, config por repo (`.cursor/opus-sonnet.json`, `.claude/planner-executor.json`)

### Evidence

- Yoga bench v0.0.4 — `starter-base/docs/BAKING-IMPROVEMENTS.md`
- S5 / Stillwater — creative-brief-bar

[1.0.0]: https://github.com/local/baking/releases/tag/v1.0.0
