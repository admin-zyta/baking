# Baking — Claude Code (referencia completa)

Orquestador: **Sonnet**. Planner: **Opus** o **Hyper (Fable)**. Executor: **Sonnet** o **Mecanic (Haiku)**. Handoff: `.cursor/handoff/`.

Leé también: `~/.cursor/opus-sonnet/ROUTER.md`, `consumption.md`, `creative-brief-bar.md`.

---

## Bootstrap (handoff only)

Baking es **100% global**. Config en `~/.cursor/opus-sonnet/config.json` (perfil `claude` para Claude Code end-to-end).

Solo crear **`.cursor/handoff/`** en el workspace si falta. **No** `.claude/planner-executor.json`.

---

## Paso 0 — Clasificar

| Tipo | Señales |
|------|---------|
| **EXECUTE-MECANIC** | rename, typo, doc-only, un campo, wiring trivial, verify simple; handoff sin craft/visual/assets | → **`executor-mecanic`** (Haiku) |
| **EXECUTE** | lógica, multi-archivo, craft, assets, landing, schema | → **`executor`** (Sonnet) o **`fork`** |
| **PLAN** | arquitectura, multi-archivo, ambigüedad, landing/portfolio/vibe |
| **PLAN-ONLY** | "solo plan", "no ejecutes", "planear nomás", "preguntá antes" | → planner, **sin executor** |
| **PLAN-REVISE** | repregunta / "cambiá el plan" con handoff existente | → planner actualiza o Baking responde desde handoff |
| **TRIVIAL** | 2–3 comandos, una acción obvia | → **directo** (sin subagente — más barato que mecánico) |

Ante duda → **PLAN**. Si piden plan sin código → **PLAN-ONLY**.

### PLAN-DEEP → `planner-hyper` (Fable)

**Explícito (siempre gana):** *"plan deep"*, *"hyper"*, *"pensá bien"*, *"plan en profundidad"* → **`planner-hyper`**, `plan_mode: explicit-deep`.

**Explícito normal:** *"plan simple"*, *"plan rápido"* → **`planner`** (Opus), `plan_mode: explicit-normal`.

**Automático** → **`planner-hyper`** si **≥2 señales**:

- arquitectura, migración, comparar opciones / trade-offs
- creative-brief-bar (landing, portfolio, vibe, visual)
- PLAN-ONLY estratégico
- >3 archivos sin handoff previo
- ambigüedad alta

**Automático** → **`planner`** (Opus) si plan acotado, fix con plan, PLAN-REVISE menor.

**Nunca `fork`** para plan.

---

## Paso 1 — PLAN

| Routing | Subagente | Modelo |
|---------|-----------|--------|
| PLAN-DEEP | **`planner-hyper`** | Fable |
| PLAN normal | **`planner`** | Opus |

Prompt (ambos):

- Pedido **completo** del usuario (no acortar brief visual).
- Handoff con plantilla `~/.cursor/agents/planner.md`.
- Si brief creativo → **"incluí creative-brief-bar"** + **prod+spec+craft** (+ visual si starter v0.1.0+).
- Tabla Assets si hay URLs externas.

Esperar **ruta exacta** del `.md`. Preguntas bloqueantes → usuario antes de EXECUTE.

---

## Modo PLAN-ONLY (sin ejecutar)

**Señales:** "solo plan", "no ejecutes", "planear nomás", "preguntá y repreguntá".

1. Agent → **`planner`** o **`planner-hyper`** — **nunca `fork`**.
2. **No** llamar `executor` ni `fork` para implementar. **No** editar `src/`.
3. Presentar handoff + **Preguntas abiertas**. Esperar repreguntas o "ejecutá".

**Repreguntas:** aclaración menor → Baking responde desde handoff; cambio de plan → **`planner`** actualiza el mismo `.md`.

**EXECUTE** solo si el usuario lo pide explícitamente ("ejecutá", "implementá", "dale").

Cierre: `flow: PLAN-ONLY`, `exec_mode: skipped`, `status: plan-ready | blocked-on-questions`.

---

## Paso 2 — EXECUTE (solo si aplica)

**Escalera de costo:** TRIVIAL directo → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (sesión).

Antes de delegar, ¿la tarea depende de contexto **ya cargado en esta sesión**?

| Señal | Modo | Cómo |
|-------|------|------|
| 2–3 comandos, una acción obvia | **directo** | vos, sin subagente |
| Mecánica con handoff (sin craft/assets/visual) | **`executor-mecanic`** | Agent → **solo ruta** handoff |
| Login/puerto/token/proceso ya obtenido acá | **`fork`** | Agent → fork |
| Archivos ya leídos; debug iterativo | **`fork`** | idem |
| Lógica, craft, assets, landing, schema | **`executor`** | Agent → **solo ruta** handoff |
| Handoff autocontenido; aislar contexto | **`executor`** o **`executor-mecanic`** según tabla arriba | idem |

**Regla de oro:** handoff autocontenido → agente fresco OK. Si depende de contexto de sesión → **`fork`**. No uses **`executor-mecanic`** si el handoff pide creative-brief-bar, asset verify o VISUAL-BAR.

Prompt **`executor-mecanic`** (solo ruta):

```text
Implementá pasos mecánicos según: .cursor/handoff/YYYY-MM-DD-slug.md
Read primero. Si no es mecánico, pará y pedí executor Sonnet al padre.
Append ## Ejecución al mismo archivo.
```

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
  version: "1.1.1"   # config.bakingVersion
  handoff: .cursor/handoff/YYYY-MM-DD-slug.md
  flow: PLAN+EXECUTE | PLAN-ONLY | EXECUTE | TRIVIAL
  plan_agent: planner | hyper | skipped
  plan_mode: auto | explicit-deep | explicit-normal | explicit-only | skipped
  exec_agent: mecanic | executor | fork | direct
  scores:
    spec: pass | partial | fail
    craft: pass | partial | fail
    assets: pass | fail
  status: completed | partial | blocked
  models: { planner: opus|fable, exec: haiku|sonnet|fork-parent }
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

## Paso 4 — Métricas (obligatorio)

Leé **`~/.cursor/opus-sonnet/METRICS.md`**. Append **una línea JSON** a:

`<metrics.dir>/runs.jsonl` (default `.cursor/baking/metrics/runs.jsonl`)

Creá la carpeta si falta. Respetar `metrics.enabled` en config (default true).

Completá **`review`** honesto (ver METRICS.md). Si es **bench** (S0/S3, baseline vs Baking), agregá **`benchmark`** + **`usage.total_usd`** desde Usage.

Ejemplo (routing + costo bench):

```json
{"ts":"2026-09-14T16:00:00-03:00","bakingVersion":"1.4.0","runtime":"claude-code","profile":"claude","prompt":"…","handoff":".cursor/handoff/….md","classification":{"flow":"PLAN+EXECUTE","plan_agent":"planner","exec_agent":"mecanic","plan_mode":"auto","exec_mode":"auto"},"models":{"orchestrator":"sonnet","planner":"opus","executor":"haiku"},"signals":["mechanical"],"benchmark":{"scenario_id":"S3-plan-complex","arm":"baking","pair_id":"stream-plans-s3-badge"},"usage":{"total_usd":0.35,"total_tokens":95000,"source":"manual"},"outcome":{"status":"completed","scores":{"spec":"pass"}},"review":{"plan_fit":"good","exec_fit":"good","note":""}}
```

---

## Anti-patterns

- Parafrasear el plan al executor (solo ruta).
- Opus en el chat principal.
- `fork` para PLAN (pierde Opus).
- `executor` Sonnet para mecánica con handoff (usar **`executor-mecanic`**).
- `executor-mecanic` en landings / craft / assets (usar **`executor`**).
- Marcar completado solo por `build` en briefs creativos.

---

## Evidencia

- lore-forge 2026-09-11: executor fresco 38.6k tokens re-leyendo contexto → usar **fork** en EXECUTE iterativo.
- S5 yoga/studio: build OK, UI pobre → **creative-brief-bar** obligatorio.
- yoga bench v0.0.4: spec OK / craft weak / 404 URLs → scores + asset verify (`starter-base/docs/BAKING-IMPROVEMENTS.md`).
