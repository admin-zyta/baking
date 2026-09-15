# Routing — Baking-AI

← [Volver al README](./README.md)

Referencia completa: [ROUTER.md](../../ROUTER.md) · Cursor: [BAKING-CURSOR.md](../../BAKING-CURSOR.md) · Claude: [claude-code/BAKING.md](../../claude-code/BAKING.md)

---

## Paso 0 — Clasificar

```
                    ┌─────────────┐
                    │   Usuario   │
                    └──────┬──────┘
                           ▼
              ┌────────────────────────┐
              │   Baking orquestador   │
              └────────────┬───────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 TRIVIAL              PLAN / PLAN-ONLY        EXECUTE
 (directo)            / PLAN-REVISE          (handoff ok)
     │                     │                     │
     │              ┌──────┴──────┐              │
     │              ▼             ▼              │
     │         planner      planner-hyper         │
     │         (Opus/Grok)     (Fable)           │
     │              │             │              │
     └──────────────┴─────────────┴──────────────┘
                           │
                           ▼ (si pidió ejecutar)
              ┌────────────────────────┐
              │ executor / mecanic /   │
              │ fork / directo         │
              └────────────────────────┘
```

---

## Tabla de decisión

| Flow | Señales | Subagente | Modelo |
|------|---------|-----------|--------|
| **TRIVIAL** | 2–3 comandos, status | Orquestador | Composer/Sonnet |
| **PLAN** | multi-file, ambigüedad, landing | `planner` | Opus / Grok |
| **PLAN-DEEP** | "hyper", arquitectura, ≥2 señales | `planner-hyper` | Fable |
| **PLAN-ONLY** | "solo plan", "no ejecutes" | planner / hyper | — sin exec |
| **PLAN-REVISE** | "cambiá el plan" | planner actualiza `.md` | — |
| **EXECUTE** | handoff + "implementá" | `executor-cursor` / `executor` | Composer / Sonnet |
| **EXECUTE-MECANIC** | mecánico, handoff simple | `executor-mecanic` | Haiku (CC only) |
| **EXECUTE-FORK** | debug sesión, contexto ya cargado | `fork` | hereda padre (CC) |

---

## PLAN-DEEP — cuándo Hyper (Fable)

**Explícito:** *plan deep*, *hyper*, *pensá bien*.

**Automático (≥2 señales):**

- arquitectura / migración / trade-offs
- creative-brief-bar (landing, vibe, portfolio)
- PLAN-ONLY estratégico
- >3 archivos sin handoff
- ambigüedad alta

---

## Escalera EXECUTE (Claude Code)

```
TRIVIAL (directo)
    ↓ si mecánico con handoff
executor-mecanic (Haiku)
    ↓ si lógica / craft / assets
executor (Sonnet)
    ↓ si depende contexto de sesión
fork
```

Cursor: TRIVIAL → `executor-cursor` → (no fork nativo igual).

---

## Anti-patterns

- Opus como chat principal
- Parafrasear plan al executor (solo **ruta**)
- `fork` para PLAN (pierde Opus/Fable)
- `completed` solo por build en landings
- SDD Gentle-AI encima del starter (duplicación)

---

## Cierre — gates

| Gate | Cuándo |
|------|--------|
| `spec` | Criterios técnicos del handoff |
| `craft` | creative-brief-bar / CRAFT-BAR |
| `assets` | URLs externas 2xx |
| `verify` | Light stack — criterios vs diff |

`verify: fail` o `craft: fail` → **`status: partial`**
