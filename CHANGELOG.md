# Changelog — Baking

Formato basado en [Keep a Changelog](https://keepachangelog.com/). Versionado en `VERSION` y `config.json` → `bakingVersion`.

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
