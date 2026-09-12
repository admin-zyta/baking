# Changelog — Baking

Formato basado en [Keep a Changelog](https://keepachangelog.com/). Versionado en `VERSION` y `config.json` → `bakingVersion`.

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
