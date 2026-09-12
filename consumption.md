# Consumo — reglas globales planner/executor

Aplicar cuando el router está activo (`enabled: true` en **`~/.cursor/opus-sonnet/config.json`** — global, sin overrides por repo). Respetar `profile` del config.

## Pools de Cursor

| Pool | Modelos típicos | Cuándo usar |
|------|-----------------|-------------|
| **Cursor Models** | Composer 2.5, Grok 4.6 | Día a día, mucho Agent; más incluido en Pro |
| **Other Models** | Claude Opus/Sonnet, GPT, Gemini | Planes difíciles o perfil `claude` |

## Por perfil

### `cursor` (default — Opus + Composer)

- Orquestador: **Composer 2.5**
- Planner: **Opus 5** (solo PLAN, una vez)
- Executor: **Composer 2.5**
- Mejor plan; ejecución barata en pool Cursor Models

### `hybrid` (100% pool Cursor)

- Orquestador: **Composer 2.5**
- Planner: **Grok 4.6** (no Fast salvo urgencia)
- Executor: **Composer 2.5**
- Cero Opus; máximo ahorro Other Models

### `claude`

- Orquestador: **Composer 2.5** o Sonnet (no Opus)
- Planner: Opus | Executor: Sonnet
- Mejor calidad end-to-end Claude; más caro en ejecución

## Subagentes

- **Planner:** solo PLAN; no editar producto salvo `handoffDir`.
- **Executor:** toda la edición de producto.
- Máximo `maxParallelSubagents` en paralelo (default 2).
- En perfil `cursor`, no usar Grok Fast ni Composer Fast salvo pedido explícito.

## Handoff = ahorro

- El diary evita re-explicar contexto en el chat.
- Pasar **ruta de archivo**, no el contenido del plan, al executor.
- Pedidos triviales (≤12 palabras, una acción): EXECUTE directo con handoff mínimo.

## Cuándo NO usar planner fuerte (Opus/Grok plan)

- Typos, renombres, cambio de color, imports, format.
- Usuario dice “seguí el plan en `.cursor/handoff/...`”.
- Bug con stack trace y archivo obvio.

## Cuándo SÍ usar planner fuerte

- Arquitectura, migraciones, “cómo conviene”, comparar enfoques.
- >3 archivos sin plan previo.
- En perfil `hybrid`, Grok alcanza para muchos planes; subí a `cursor` si falla calidad.

## Claude Code — `fork` vs agente fresco (`executor`/`planner`)

Workflow completo Baking (Claude Code): **`~/.cursor/opus-sonnet/claude-code/BAKING.md`**.

Sólo aplica en Claude Code: `fork` (subagent_type del Agent tool) hereda el contexto completo de
la conversación actual — comparte prompt cache, no relee nada. `executor`/`planner` frescos
arrancan en frío: si necesitan algo que el orquestador ya estableció en esta sesión (login hecho,
puertos/tokens ya descubiertos, archivos ya leídos), lo vuelven a pagar en tokens.

**Evidencia real** (sesión lore-forge, 2026-09-11): un `executor` fresco para "diagnosticar un bug
de encoding" gastó 38.6k tokens — gran parte relevantando un proceso y releyendo código que el
orquestador ya tenía a mano. Con `fork` ese costo habría sido ~0 en esa parte.

**Regla:** en el Paso 2 (EXECUTE), antes de delegar preguntate si la tarea depende de estado que
*esta* conversación ya tiene:

| Señal | Delegar a |
|---|---|
| Necesita un proceso/login/puerto/token que el orquestador ya obtuvo en esta sesión | **`fork`** |
| Necesita archivos que el orquestador ya leyó en esta sesión | **`fork`** |
| El perfil pide un modelo distinto al del orquestador actual (ej. planner en Opus, orquestador en Sonnet) | `planner`/`executor` fresco — `fork` siempre corre en el modelo del padre, no puede subir a Opus |
| Handoff autocontenido, no depende de nada de esta sesión (plan ya escrito con todo adentro, corrida larga/desatendida que conviene aislar del contexto propio) | `executor`/`planner` fresco — la re-derivación es baja o el aislamiento es la meta |
| Pedido trivial (2-3 comandos, un status check) | Ninguno — resolverlo directo, sin handoff |

`fork` **no** sirve para el paso PLAN cuando el perfil pide Opus y el orquestador corre en otro
modelo (`fork` siempre hereda el modelo del padre, el override se ignora) — ahí sí conviene el
`planner` fresco pese al costo de re-lectura, porque la calidad del plan lo justifica.

## Subagente caído por infraestructura — reintentar solo, no escalar al usuario

Un subagente puede fallar con un mensaje de infraestructura, no de contenido — ej. `"Agent stalled:
no progress for 600s (stream watchdog did not recover)"`. Se distingue de una falla real porque el
resultado no dice nada del handoff/tarea en sí, sólo del runtime que lo ejecutaba.

**Evidencia real** (sesión lore-forge, 2026-09-12): un `planner` se colgó así habiendo sólo leído el
handoff (sin escribir nada todavía). Se relanzó el mismo pedido sobre el mismo handoff intacto y
terminó bien en el segundo intento.

**Regla:** ante una falla con ese perfil (mensaje de infra, cero o poco progreso, handoff sin tocar
o intacto):

1. Confirmar que no se perdió trabajo (leer el handoff / mirar el archivo que se supone que iba a
   tocar).
2. Relanzar el **mismo** pedido sobre el **mismo** handoff, sin pedirle permiso al usuario primero
   — es un reintento mecánico, no una decisión de diseño.
3. Avisar recién si vuelve a fallar una segunda vez, o si esta vez sí hay señal de que se perdió
   algo.

No hace falta que el usuario note el stall para que se reintente — la única razón para escalarlo es
que el reintento también falle.

## Revisión de gasto

- Cursor → Settings → Usage: filtrar por pool (Cursor Models vs Other Models).
- Proyectos con mucho Agent: `profile: "cursor"` (Opus plan + Composer exec).
- Sin Opus en absoluto: `profile: "hybrid"` (Grok + Composer).
- Proyectos críticos end-to-end Claude: `profile: "claude"`.
