# Components — Baking-AI

← [Volver al README](./README.md)

---

## Core

| ID | Componente | Descripción |
|----|------------|-------------|
| `orchestrator` | **Baking** | Clasifica, delega, cierra YAML + métricas. No edita producto. |
| `handoff` | **Diary** | `.cursor/handoff/*.md` — plan + ejecución + verify en un archivo. |
| `planner` | **Planner** | Opus. Investigación + handoff. Solo escribe en handoffDir. |
| `planner-hyper` | **Hyper** | Fable. Plan deep — arquitectura, creative-brief estratégico. |
| `executor` | **Executor** | Implementa según handoff. Sonnet (Claude) o Composer (Cursor). |
| `executor-mecanic` | **Mecanic** | Haiku. Pasos mecánicos con handoff. **Solo Claude Code.** |
| `executor-cursor` | **Executor Cursor** | Composer 2.5. Perfiles `cursor` / `hybrid`. |
| `metrics` | **runs.jsonl** | Una línea JSON por corrida — routing, costo, review. |
| `creative-brief-bar` | **Craft gates** | Landings: prod + spec + craft + visual. |

---

## Light stack (v1.5+)

| ID | Componente | Problema que ataca |
|----|------------|-------------------|
| `engram` | **Engram MCP** | Amnesia — decisiones entre repos/sesiones |
| `verify` | **Handoff vs diff** | Build OK pero no cumple criterios |
| `witch` | **Witch MCP** | Grep masivo en starter/apps Boogiepop |
| `skill-registry` | **Índice skills** | No usar la skill que ya tenés instalada |

Config: `lightStack` en `config.json`. Doc: [LIGHT-STACK.md](../../LIGHT-STACK.md).

---

## Agentes por entorno

### Cursor (`~/.cursor/agents/`)

| Task name | Archivo |
|-----------|---------|
| `baking` | `baking.md` |
| `planner` | `planner.md` |
| `planner-hyper` | `planner-hyper.md` |
| `planner-cursor` | `planner-cursor.md` |
| `executor-cursor` | `executor-cursor.md` |

### Claude Code (`~/.claude/agents/`)

| Agent | Archivo |
|-------|---------|
| `baking` | `baking.md` |
| `planner` | `planner.md` |
| `planner-hyper` | `planner-hyper.md` |
| `executor` | `executor.md` |
| `executor-mecanic` | `executor-mecanic.md` |

Plantilla handoff compartida: **`~/.cursor/agents/planner.md`**.

Ver [AGENTS.md](../../AGENTS.md).

---

## CLI (`@boogiepop/baking`)

| Comando | Acción |
|---------|--------|
| `baking install` | Deploy global Cursor + Claude |
| `baking doctor` | Agentes + light stack + Engram |
| `baking skill-registry` | Regenera índice de skills |
| `baking metrics-summary` | Ahorro S0 vs S3, promedios |
| `baking metrics-review` | Conclusión routing/ahorro (7 días o 50 runs) |
| `baking version` | Semver instalado |

---

## Perfiles de billing

| Perfil | Planner | Executor | Pool |
|--------|---------|----------|------|
| `cursor` | Opus | Composer | Mixto |
| `hybrid` | Grok | Composer | Cursor Models |
| `claude` | Opus | Sonnet / Haiku | Other Models |

Ver [routing.md](./routing.md) y [consumption.md](../../consumption.md).
