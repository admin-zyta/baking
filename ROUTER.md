# Opus → Sonnet Router (modo automático)

Orquestador de costo: **Opus planifica**, **Sonnet ejecuta**. Cada corrida deja un **diary** persistente.

## Configuración activa

1. Leé **`~/.cursor/opus-sonnet/config.json`** (global — única fuente).
2. **No** existe `.cursor/opus-sonnet.json` por proyecto; no mezclar overrides locales.
3. Resolvé el **perfil** activo desde `profile` global (default `cursor`).
4. Cargá `planner`, `plannerHyper`, `executor` y `orchestrator` desde `profiles[<profile>]`.
5. Usá `handoffDir`, subagentes y flags de `consumption` del config global.

Si `enabled` no es `true`, **no aplicar** este router (invocar `/baking` manualmente).

**Auto-route (opcional, v1.6+):** si `autoRoute.enabled` es `true`, aplicar este router en pedidos de implementación **sin** que el usuario diga `/baking` cada vez. Toggle: `baking auto-route on|off`. Ver **`INIT-MEMORY.md`**.

**Init memoria de proyecto:** `baking init-memory` + `/init-memory` (estilo Claude `/init`).

## Light stack (v1.5+)

Una config (`lightStack` en `config.json`) para **Cursor y Claude Code**. Detalle: **`LIGHT-STACK.md`**.

- **Engram** — amnesia (MCP en Cursor o Claude)
- **Verify** — handoff criterios vs diff al cierre EXECUTE
- **Witch** — orientación Boogiepop (MCP starter)
- **Skill registry** — `baking skill-registry` → índice global

## Perfiles de modelo

| Perfil | Planner normal | Planner deep (Hyper) | Executor | Pool de billing |
|--------|----------------|----------------------|----------|-----------------|
| `claude` | Opus 5 (`planner`) | Fable (`planner-hyper`) | Sonnet (`executor`) | Other Models (Claude) |
| `cursor` | Opus 5 (`planner`) | Fable (`planner-hyper-cursor`) | Composer 2.5 (`executor-cursor`) | Mixto — **default** |
| `hybrid` | Grok 4.6 (`planner-cursor`) | Fable (`planner-hyper-cursor`) | Composer 2.5 (`executor-cursor`) | Cursor Models (sin Opus plan normal) |

**Perfil global** — editar en `~/.cursor/opus-sonnet/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor"
}
```

**Opus 5 planifica + Composer ejecuta:** `"profile": "cursor"` (default global).

**Todo pool Cursor, sin Opus (Grok + Composer):** `"profile": "hybrid"`.

**Todo Claude:** `"profile": "claude"`.

## Modelo del chat principal (orquestador)

- Usá **Composer o Sonnet**, nunca Opus como padre (salvo pedido explícito del usuario).
- Modelos sugeridos: ver `orchestrator.recommendedModels` en config.

## Diary (handoff persistente)

| Campo | Valor |
|-------|--------|
| Carpeta | `handoffDir` del config (default `.cursor/handoff/`) |
| Nombre | `YYYY-MM-DD-<slug>.md` |
| Colisión mismo día | `-HHmm` o `-2`, `-3` |
| Contenido | Plan (planner) + `## Ejecución` (executor) en el **mismo** archivo |

Creá la carpeta si no existe. **No borrar** entradas viejas.

## Paso 0 — Clasificar

**PLAN** → investigar, diseñar, comparar, arquitectura, tarea grande/ambigua, multi-archivo sin handoff previo.

**EXECUTE** → cambio acotado, fix puntual, plan/handoff ya existente **y el usuario pidió implementar**.

**PLAN-DEEP** → explícito (*hyper*, *plan deep*) o ≥2 señales (arquitectura, creative-brief, ambigüedad) → subagente `plannerHyper` del perfil.

**PLAN-ONLY** → "solo plan", "no ejecutes", "planear nomás", "preguntá antes" → planner o hyper, **sin executor**.

**PLAN-REVISE** → repregunta o "cambiá el plan" → planner actualiza handoff o orquestador responde desde el `.md`.

Reglas de config:

- `routing.defaultOnAmbiguity` → default si dudás (`PLAN` recomendado).
- Si `consumption.skipPlannerForTrivialTasks` y el pedido tiene ≤ `trivialTaskMaxWords` palabras y es una sola acción obvia → **EXECUTE** directo.
- Si `routing.forcePlanIfNoHandoffExists` y la tarea es no trivial y no hay handoff del día relacionado → **PLAN**.

## Paso 1 — PLAN (si aplica)

Delegá al subagente del perfil (`planner`, `planner-cursor` o `plannerHyper` según routing PLAN-DEEP):

- Pedido completo del usuario.
- Handoff en `handoffDir` con plantilla completa (ver agente planner correspondiente).
- Esperá la **ruta exacta** del archivo.

Preguntas abiertas **bloqueantes** → consultar al usuario. Si el pedido era **PLAN-ONLY** → **detener acá**; no pasar a EXECUTE hasta pedido explícito.

## Paso 2 — EXECUTE (si aplica — no en PLAN-ONLY)

**Omitir** si clasificaste PLAN-ONLY o el usuario no pidió implementar.

Delegá al subagente del perfil (`executor` o `executor-cursor`, según config):

**Con plan:**

```text
Implementá según: <ruta exacta del handoff>
Primer paso: leer ese archivo. Al terminar: append sección Ejecución en el mismo archivo.
```

**Ejecución directa:**

```text
Ejecución directa. Handoff mínimo en <handoffDir>, implementá, append Ejecución.
Pedido: [copiar pedido]
```

Respetá `consumption.maxParallelSubagents` (default 2).

## Paso 3 — Cierre

1. Ruta del diary
2. PLAN + EXECUTE o solo EXECUTE
3. **[Light]** Verify + YAML `verify:` si hubo código (ver `LIGHT-STACK.md`)
4. Estado: completado | parcial | bloqueado
5. Resumen breve
6. **[Light]** Engram `mem_session_summary` si `lightStack.enabled`

## Reglas duras

- **Nunca** parafrasear el plan al executor: solo la **ruta del archivo**.
- Subagentes con `force-default-model: true` en `~/.cursor/agents/`.
- Aplicar también `~/.cursor/opus-sonnet/consumption.md`.
