# Baking — Claude Code (referencia completa)

Orquestador: **Sonnet**. Planner: **Opus**. Executor: **Sonnet**. Handoff: `.cursor/handoff/`.

Leé también: `~/.cursor/opus-sonnet/ROUTER.md`, `consumption.md`, `creative-brief-bar.md`.

---

## Bootstrap (handoff only)

Baking es **100% global**. Config en `~/.cursor/opus-sonnet/config.json` (perfil `claude` para Claude Code end-to-end).

Solo crear **`.cursor/handoff/`** en el workspace si falta. **No** `.claude/planner-executor.json`.

---

## Paso 0 — Clasificar

| Tipo | Señales |
|------|---------|
| **EXECUTE** | typo, color, rename, un archivo, stack trace obvio, handoff ya existe |
| **PLAN** | arquitectura, multi-archivo, ambigüedad, landing/portfolio/vibe |
| **PLAN-ONLY** | "solo plan", "no ejecutes", "planear nomás", "preguntá antes" | → planner, **sin executor** |
| **PLAN-REVISE** | repregunta / "cambiá el plan" con handoff existente | → planner actualiza o Baking responde desde handoff |
| **TRIVIAL** | 2–3 comandos, status check | → **resolver vos**, sin subagentes ni handoff |

Ante duda → **PLAN**. Si piden plan sin código → **PLAN-ONLY**.

---

## Paso 1 — PLAN (Opus)

**Siempre** subagente fresco **`planner`** (Opus). **Nunca `fork`** para plan — fork hereda modelo del padre, no sube a Opus.

Prompt al planner:

- Pedido **completo** del usuario (no acortar brief visual).
- Escribir handoff en `handoffDir` con plantilla `~/.cursor/agents/planner.md`.
- Si brief creativo → **"incluí creative-brief-bar"** + modo **prod+spec+craft** (`creative-brief-bar.md`).
- Tabla Assets si hay URLs externas.

Esperar **ruta exacta** del `.md`. Preguntas bloqueantes → usuario antes de EXECUTE.

---

## Modo PLAN-ONLY (sin ejecutar)

**Señales:** "solo plan", "no ejecutes", "planear nomás", "preguntá y repreguntá".

1. Agent → **`planner`** — **nunca `fork`**.
2. **No** llamar `executor` ni `fork` para implementar. **No** editar `src/`.
3. Presentar handoff + **Preguntas abiertas**. Esperar repreguntas o "ejecutá".

**Repreguntas:** aclaración menor → Baking responde desde handoff; cambio de plan → **`planner`** actualiza el mismo `.md`.

**EXECUTE** solo si el usuario lo pide explícitamente ("ejecutá", "implementá", "dale").

Cierre: `flow: PLAN-ONLY`, `exec_mode: skipped`, `status: plan-ready | blocked-on-questions`.

---

## Paso 2 — EXECUTE (solo si aplica)

Antes de delegar, ¿la tarea depende de contexto **ya cargado en esta sesión**?

| Señal | Modo | Cómo |
|-------|------|------|
| Login/puerto/token/proceso ya obtenido acá | **`fork`** | Agent → fork con prompt de ejecución |
| Archivos ya leídos en esta sesión; debug iterativo | **`fork`** | idem |
| Handoff autocontenido; corrida larga; aislar contexto | **`executor`** fresco | Agent → `executor` + **solo ruta** handoff |
| Plan pide Sonnet y tenés todo en el `.md` | **`executor`** fresco | preferido |
| Trivial post-plan (un comando) | **directo** | vos, sin subagente |

**Regla de oro:** handoff autocontenido → `executor` fresco OK. Si el executor tendría que **re-descubrir** lo que ya sabés → **`fork`**.

**Modelo del executor — no siempre Sonnet.** Si la tarea es mecánica (rename, un campo suelto,
doc-only, wiring sin decisión de diseño, una verificación de ida y vuelta) pasá `model: "haiku"` en
el Agent call en vez del Sonnet default del perfil. Reservá Sonnet para lo que toca lógica real
(schema, prompt, migraciones, varios archivos con decisiones). Evidencia: reporte de uso 24h del
usuario — *"84% subagent-heavy... consider configuring a cheaper model for simpler subagents"*.

Prompt **`executor`** (solo ruta):

```text
Implementá según: .cursor/handoff/YYYY-MM-DD-slug.md
Primer paso: Read ese archivo. Append ## Ejecución al mismo archivo.
Verificá: checklist técnico, creative-brief-bar, CRAFT-BAR si existe, asset verification (2xx).
Anti-fork: no copiar src/ de apps previas.
```

Prompt **`fork`:**

```text
[Contexto mínimo si hace falta: qué ya descubrimos]
Implementá según el handoff: <ruta> (Read primero).
O: [tarea concreta usando contexto de sesión]
Append ## Ejecución en el handoff si aplica.
```

---

## Brief creativo (creative-brief-bar)

Señales: landing, portfolio, vibe, paleta, tipografía, motion, "feels like", copy editorial.

Modo default: **prod + spec + craft**.

1. PLAN + planner con creative-brief-bar.
2. Executor: asset verification (2xx) + craft bar + anti-fork (no copiar `src/` previo).
3. Post-exec: build OK **≠** completado si fallan craft o assets.

---

## Paso 3 — Cierre (gates obligatorios)

`npm run build` **≠** completed en tareas creativas.

```yaml
baking:
  version: "1.0.0"   # config.bakingVersion
  handoff: .cursor/handoff/YYYY-MM-DD-slug.md
  flow: PLAN+EXECUTE | EXECUTE | TRIVIAL
  plan_mode: planner | skipped
  exec_mode: executor | fork | direct
  scores:
    spec: pass | partial | fail
    craft: pass | partial | fail
    assets: pass | fail
  status: completed | partial | blocked
  models: { planner: opus?, executor: sonnet|fork-parent }
```

**Reglas:** partial si craft/assets fallan; nunca completed con `assets: fail`.

**Nota fork:** `fork` (Agent tool) reutiliza contexto de sesión — OK para debug. **Prohibido** usar fork/copy para pegar `src/` de otra app (bench inválido).

**Sugerir `/compact` al cerrar** (`status: completed`), sobre todo si ya es la 2da+ tarea cerrada en
la sesión — el handoff en disco ya preserva plan + ejecución, compactar no pierde nada durable.
Si el usuario arranca un tema no relacionado, sugerir `/clear` en vez de `/compact`. Evidencia:
reporte de uso 24h del usuario — *"74% of your usage was at >150k context... /compact mid-task,
/clear when switching to new tasks"*.

Mensaje breve al usuario + ruta handoff.

---

## Anti-patterns

- Parafrasear el plan al executor (solo ruta).
- Opus en el chat principal.
- `fork` para PLAN (pierde Opus).
- `executor` fresco para debug de algo que ya investigaste en sesión (quema tokens).
- Marcar completado solo por `build` en briefs creativos.

---

## Evidencia

- lore-forge 2026-09-11: executor fresco 38.6k tokens re-leyendo contexto → usar **fork** en EXECUTE iterativo.
- S5 yoga/studio: build OK, UI pobre → **creative-brief-bar** obligatorio.
- yoga bench v0.0.4: spec OK / craft weak / 404 URLs → scores + asset verify (`starter-base/docs/BAKING-IMPROVEMENTS.md`).
