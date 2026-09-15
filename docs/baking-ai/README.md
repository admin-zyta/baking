# Baking-AI

**El orquestador liviano para Cursor y Claude Code.**

Opus (o Fable) planifica. Composer o Sonnet ejecuta. El plan queda en disco. Pagás menos tokens. Sabés qué pasó.

---

## Qué problema resuelve

| Problema | Sin Baking | Con Baking |
|----------|------------|------------|
| Opus codeando todo el chat | Caro, lento | Opus **solo planifica** (1 subagente) |
| Plan en el chat, se pierde | Re-explicar cada sesión | **Handoff** persistente en `.cursor/handoff/` |
| "Build OK" pero mal hecho | Confianza ciega | **Verify** — criterios vs diff |
| Olvidás decisiones entre repos | Fricción manual | **Engram** (light stack, opcional) |
| Landings genéricas | Template limpio | **creative-brief-bar** + starter Boogiepop |

Baking **no** es Gentle-AI: no SDD de 10 fases, no ecosistema de 16 IDEs. Es **router + diary + gates** optimizado para tu flujo.

---

## Funciona con

| Entorno | Invocación | Perfil típico |
|---------|------------|---------------|
| **Cursor** | `/baking` · *usemos baking* | `cursor` (Opus plan + Composer exec) |
| **Claude Code** | `/baking` · *usemos baking* | `claude` (Opus plan + Sonnet exec) |

Una config global: `~/.cursor/opus-sonnet/config.json`. **No** instalar por repo.

---

## Componentes

| Componente | Qué hace |
|------------|----------|
| **Orquestador** | Clasifica PLAN / EXECUTE / TRIVIAL · delega subagentes |
| **Planner** | Investiga · escribe handoff · no toca `src/` |
| **Planner Hyper** | Plan deep (Fable) — arquitectura, landings complejas |
| **Executor** | Implementa según handoff · append `## Ejecución` |
| **Handoff diary** | Plan + ejecución en un `.md` por tarea |
| **Light stack** | Engram · Verify · Witch · Skill registry |
| **Métricas** | `runs.jsonl` — routing, costo, `metrics-review` |
| **Init-memory** | Bootstrap AGENTS + Engram (`baking init-memory`) |
| **Auto-route** | Toggle: Baking por default (`baking auto-route on`) |
| **creative-brief-bar** | Calidad perceptual en landings (craft, visual) |

Detalle: [components.md](./components.md)

---

## Flujo en 30 segundos

```
Usuario → Baking (orquestador barato)
           ├─ PLAN → planner | planner-hyper
           └─ EXECUTE → executor | executor-mecanic | directo
           → .cursor/handoff/YYYY-MM-DD-slug.md
           → verify + YAML + metrics JSONL
```

Mental model: [intended-usage.md](./intended-usage.md)  
Casos concretos: [use-cases.md](./use-cases.md)

---

## Get started

```bash
npx @boogiepop/baking install
baking doctor
baking skill-registry
```

Cursor o Claude Code → `/baking` + tu pedido.

Guía completa: [quickstart.md](./quickstart.md)

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [intended-usage.md](./intended-usage.md) | Cómo pensarlo — si leés una, que sea esta |
| [use-cases.md](./use-cases.md) | Escenarios reales (Zyta, Boogiepop, fixes…) |
| [components.md](./components.md) | Cada pieza, agentes, perfiles |
| [routing.md](./routing.md) | PLAN / EXECUTE / Hyper / mecanic / fork |
| [quickstart.md](./quickstart.md) | Instalar, perfiles, primer corrida |
| [../../INIT-MEMORY.md](../../INIT-MEMORY.md) | Bootstrap memoria de proyecto |
| [../../LIGHT-STACK.md](../../LIGHT-STACK.md) | Engram, Verify, Witch, registry |
| [../../METRICS.md](../../METRICS.md) | JSONL, benchmark S0 vs S3, costo |
| [../../AGENTS.md](../../AGENTS.md) | Nombres exactos Task / Agent |

Referencias técnicas: `BAKING-CURSOR.md` · `claude-code/BAKING.md`

---

## Baking-AI vs Gentle-AI (una línea)

**Gentle-AI** = ecosistema completo (SDD, RDD, 16 agentes).  
**Baking-AI** = orquestador de costo + handoff + gates creativos — **liviano por diseño**.

---

## Versión

`bakingVersion` en `config.json` · paquete `@boogiepop/baking` · repo [admin-zyta/baking](https://github.com/admin-zyta/baking)
