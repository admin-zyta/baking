# Use Cases — Baking-AI

← [Volver al README](./README.md)

Casos reales. Cada uno: pedido → clasificación → qué corre → qué queda en disco.

---

## 1. Fix trivial — color / typo / rename

**Pedido:** *"Cambiá el botón primary a `#c9a227` en PlanCard."*

| | |
|---|---|
| **Clasificación** | TRIVIAL o EXECUTE directo |
| **Subagentes** | Ninguno (orquestador resuelve) o executor si hay handoff |
| **Light stack** | Skip Engram search · skip verify si un solo criterio obvio |
| **Handoff** | Opcional mínimo o ninguno |
| **Ahorro** | No pagar Opus planificando un color |

**Cuándo NO usar Baking:** si ya estás en medio de un plan grande — seguí el handoff existente.

---

## 2. Landing Boogiepop — craft + starter

**Pedido:** *"usemos baking — landing editorial para estudio de yoga, mood landing, visual editorial, VISUAL-SCORE ≥27."*

| | |
|---|---|
| **Clasificación** | PLAN (+ creative-brief-bar) |
| **Planner** | Opus o **Hyper** si brief ambicioso / multi-sección |
| **Handoff** | Spec template + layout recipes + motion + copy |
| **Executor** | Composer/Sonnet · starter-base bars · asset verify 2xx |
| **Verify** | Criterios done vs diff + VISUAL-SCORE honesto |
| **Witch** | `starter_witch_plan` al explorar kit/flavors |
| **Output** | App en `starter-base/apps/` + handoff con `## Ejecución` |

**Por qué Baking y no SDD:** el starter **ya es** spec en disco (CRAFT-BAR, VISUAL-BAR) — no 10 fases extra.

---

## 3. Feature Zyta — badge solo en Plan Pro

**Pedido:** *"Agregá badge Más popular solo en Plan Pro, no en Enterprise."*

| | |
|---|---|
| **Clasificación** | PLAN (regla de negocio) + EXECUTE |
| **Planner** | Handoff con **Criterios de done** explícitos |
| **Executor** | Implementa |
| **Verify** | Tabla: "badge solo Pro" → pass/fail vs diff |
| **Engram** | `mem_save` si es convención producto recurrente |
| **Métricas** | `verify: fail` si copió componente a todos los planes |

**Problema que resuelve:** build OK pero regla violada — Verify atrapa interpretación.

---

## 4. Solo plan — arquitectura sin codear

**Pedido:** *"Solo plan — compará JWT vs sessions para auth en el monorepo, no ejecutes."*

| | |
|---|---|
| **Clasificación** | PLAN-ONLY |
| **Planner** | Opus o Hyper (≥2 señales arquitectura) |
| **Executor** | **Skipped** |
| **Cierre** | `flow: PLAN-ONLY`, `status: plan-ready` |
| **Siguiente turno** | *"ejecutá el handoff"* → EXECUTE |

**Regla:** Baking **no** infiere EXECUTE hasta pedido explícito.

---

## 5. Plan deep — migración multi-servicio

**Pedido:** *"hyper — diseñá migración auth refresh tokens en todos los servicios Boogiepop."*

| | |
|---|---|
| **Clasificación** | PLAN-DEEP |
| **Planner** | **planner-hyper** (Fable) |
| **Handoff** | Decisiones, trade-offs, archivos, criterios medibles |
| **Cuándo Hyper** | Explícito "hyper" o ≥2 señales (arquitectura, >3 archivos, ambigüedad) |
| **Execute** | Después, con executor — no Fable codeando todo |

**~10% de proyectos** — el resto alcanza con planner Opus normal.

---

## 6. Mecánico — rename campo (Claude Code)

**Pedido:** *"Renombrá `userId` → `accountId` en el handoff de ayer."*

| | |
|---|---|
| **Clasificación** | EXECUTE |
| **Agent** | **executor-mecanic** (Haiku) |
| **Perfil** | `claude` |
| **Prompt** | Solo ruta del handoff |
| **Ahorro** | Haiku vs Sonnet para wiring trivial |

**Cursor:** no hay mecanic — `executor-cursor` o directo.

---

## 7. Sesión larga — fork vs executor fresco (Claude Code)

**Pedido:** *"Seguí debuggeando el encoding — ya tenemos el token del API en esta sesión."*

| | |
|---|---|
| **Clasificación** | EXECUTE |
| **Modo** | **fork** (hereda contexto sesión) |
| **Por qué** | Re-leer 38k tokens de contexto ya obtenido cuesta caro |
| **Handoff** | Append `## Ejecución` al mismo diary |

Ver [consumption.md](../../consumption.md) § fork vs fresco.

---

## 8. Amnesia — decisión Comms entre repos

**Pedido (jueves, repo distinto):** *"Armá email transaccional para reset password."*

| | |
|---|---|
| **Light stack** | Inicio: `mem_search "comms template transaccional"` |
| **Engram** | Recupera: "martes decidimos siempre template X, nunca HTML ad hoc" |
| **Baking** | PLAN corto o EXECUTE con handoff mínimo |
| **Cierre** | `mem_session_summary` 5 bullets |

**Witch no alcanza:** mapa de código ≠ acta de decisiones.

---

## 9. Deploy Vercel con skill correcta

**Pedido:** *"Deployá preview a Vercel el dashboard."*

| | |
|---|---|
| **Registry** | Matchea `deploy-vercel` en skill-registry |
| **Acción** | Read `~/.cursor/skills/deploy-vercel/SKILL.md` |
| **Baking** | EXECUTE siguiendo skill + handoff si multi-paso |
| **Refresh** | `baking skill-registry --force` al instalar skill nueva |

---

## 10. Benchmark — justificar ahorro

**Pedido:** *"Mismo badge Plan Pro — corrida baseline sin baking vs con baking."*

| | |
|---|---|
| **Brazo A** | Opus/Composer todo el chat · `benchmark.arm: baseline` |
| **Brazo B** | `/baking` · `benchmark.arm: baking` |
| **Mismo** | `benchmark.pair_id` |
| **Post** | `usage.total_usd` manual · `baking metrics-summary` |

Ver [METRICS.md](../../METRICS.md).

---

## Matriz rápida — qué activar

| Caso | PLAN | Hyper | Verify | Engram | Witch |
|------|------|-------|--------|--------|-------|
| Color / typo | — | — | skip | opcional | — |
| Landing craft | ✓ | a veces | ✓ | ✓ | ✓ |
| Regla negocio | ✓ | — | ✓ | ✓ | — |
| Solo plan | ✓ | a veces | skip | ✓ | — |
| Migración grande | ✓ | ✓ | ✓ | ✓ | a veces |
| Mecánico CC | — | — | ligero | — | — |
| Cross-repo context | — | — | — | **✓** | — |
