# Baking — Cursor (referencia completa)

Orquestador: **Composer 2.5**. Planner: **Opus 5**. Executor: **Composer 2.5** (`executor-cursor`). Handoff: `.cursor/handoff/`.

Leé también: `ROUTER.md`, `consumption.md`, `creative-brief-bar.md`.

---

## Bootstrap (handoff only)

Baking es **100% global**. Config en `~/.cursor/opus-sonnet/config.json`.

En cada workspace, solo asegurar que exista **`.cursor/handoff/`** (diary). **No** crear `.cursor/opus-sonnet.json` ni copiar agentes al repo.

Subagentes globales: `~/.cursor/agents/` (planner, executor-cursor, baking).

---

## Paso 0 — Clasificar

| Tipo | Señales |
|------|---------|
| **EXECUTE** | typo, color, rename, un archivo, stack trace obvio, handoff ya existe |
| **PLAN** | arquitectura, multi-archivo, ambigüedad, landing/portfolio/vibe |
| **PLAN-ONLY** | "solo plan", "no ejecutes", "planear nomás", "preguntá antes", "solo investigar/diseñar" | → planner, **sin executor** |
| **PLAN-REVISE** | repregunta sobre handoff existente, "cambiá el plan", "agregá al plan" | → planner actualiza el mismo `.md` o Baking responde desde el handoff |
| **TRIVIAL** | 2–3 comandos, status check | → **resolver vos**, sin subagentes ni handoff |

Ante duda → **PLAN**. Si piden plan sin código → **PLAN-ONLY** (no inferir EXECUTE después).

---

## Paso 1 — PLAN (Opus)

Task → subagente **`planner`** (Opus 5, fresco).

**Fallback Cursor:** si Task no expone `planner`, el padre (Baking) escribe el handoff usando plantilla `~/.cursor/agents/planner.md` + **creative-brief-bar** completa. **Nunca** omitir secciones creativas por falta de subagente.

Prompt al planner:

- Pedido **completo** del usuario (no acortar brief visual).
- Handoff en `handoffDir` con plantilla `~/.cursor/agents/planner.md`.
- Si brief creativo → **"incluí creative-brief-bar"** + modo **prod+spec+craft**.
- Assets table si hay URLs externas; `verify before ship`.

Esperar **ruta exacta** del `.md`. Preguntas bloqueantes → usuario antes de EXECUTE.

---

## Modo PLAN-ONLY (sin ejecutar)

**Señales:** "solo plan", "no ejecutes", "planear nomás", "preguntá y repreguntá", "solo diseño/arquitectura".

1. Task → **`planner`** (igual que PLAN).
2. **No** llamar a `executor-cursor`. **No** editar `src/`.
3. Presentar al usuario: ruta handoff, resumen, **Preguntas abiertas** del plan.
4. Cierre:

```yaml
baking:
  flow: PLAN-ONLY
  exec_mode: skipped
  status: plan-ready | blocked-on-questions
```

**Repreguntas del usuario:**

| Tipo | Acción |
|------|--------|
| Aclaración menor (lee el handoff y alcanza) | Baking responde vos — **sin** subagentes |
| Cambio de alcance, opciones, secciones creativas | Task → **`planner`**: "Actualizá `<ruta>` — …" |
| "Ejecutá", "implementá", "dale" | Pasar a **EXECUTE** con handoff existente |

Hasta que el usuario pida ejecutar explícitamente → **nunca** delegar executor.

---

## Paso 2 — EXECUTE

Task → subagente **`executor-cursor`** (Composer 2.5).

Al executor: **solo la ruta** del handoff — nunca parafrasear el plan.

```text
Implementá según: .cursor/handoff/YYYY-MM-DD-slug.md
Primer paso: Read ese archivo. Append ## Ejecución al mismo archivo.
Verificá: checklist técnico, creative-brief-bar, CRAFT-BAR si existe, asset verification (2xx).
Anti-fork: no copiar src/ de apps previas.
```

Trivial post-plan → resolver directo, sin subagente.

**Nota Cursor:** no hay `fork` como en Claude Code. Si el executor necesita contexto de sesión, incluí en el handoff o delegá con prompt mínimo de contexto — no re-resumir todo el plan.

---

## Brief creativo (creative-brief-bar)

Señales: landing, portfolio, vibe, paleta, tipografía, motion, copy editorial.

Modo default: **prod + spec + craft**. Build OK **≠** completado.

Antes de cerrar, evaluar scores en el handoff (executor debe haber corrido asset verify).

---

## Paso 3 — Cierre (gates obligatorios)

`npm run build` **≠** completed en tareas creativas.

```yaml
baking:
  handoff: .cursor/handoff/YYYY-MM-DD-slug.md
  flow: PLAN+EXECUTE | PLAN-ONLY | PLAN-REVISE | EXECUTE | TRIVIAL
  plan_mode: planner | parent-fallback | skipped
  exec_mode: executor-cursor | direct
  scores:
    spec: pass | partial | fail
    craft: pass | partial | fail
    assets: pass | fail
  status: completed | partial | blocked
  models: { planner: opus-5, executor: composer-2.5 }
```

**Reglas de cierre:**

- **partial** si build OK pero `craft: partial|fail` o `assets: fail`
- **nunca completed** con `assets: fail`
- **nunca completed** en landing creativa sin revisar craft bar (handoff o `docs/CRAFT-BAR.md`)

Mensaje breve al usuario + ruta handoff.

---

## Bench / controles inválidos

Corridas que copian `src/` de apps previas o usan fork para pegar código **no son controles válidos** — excluir de comparación o marcar en handoff.

Evidencia: `starter-base/docs/BAKING-IMPROVEMENTS.md` (yoga bench v0.0.4, runs 5–6).

---

## Anti-patterns

- Parafrasear el plan al executor (solo ruta).
- Opus en el chat principal (solo subagente planner).
- Marcar completado solo por `build` en briefs creativos.
- Copiar subagentes al repo (ya están globales).
- Crear `.cursor/opus-sonnet.json` por proyecto (config es global).
