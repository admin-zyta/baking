# Baking-AI

**Orquestador liviano para Cursor y Claude Code.**

Opus (o Fable) planifica. Composer o Sonnet ejecuta. El plan queda en disco. Pagás menos tokens. Sabés qué pasó.

**Repo:** [github.com/admin-zyta/baking](https://github.com/admin-zyta/baking) · **Versión:** `1.6.0` (ver `VERSION` y `config.json` → `bakingVersion`)

---

Tu agente codea con el modelo caro todo el chat, el plan vive en la conversación y se pierde, y “build OK” no significa que cumplió lo pedido. **Baking** pone un router delante: clasifica, delega planner/executor baratos, deja un **diary en disco** y cierra con métricas.

No es Gentle-AI completo (sin SDD de 10 fases ni 16 IDEs). Es **router + handoff + gates creativos + light stack opcional**, optimizado para Boogiepop / Zyta / Cursor day-to-day.

**Documentación extendida:** [BAKING-AI.md](./BAKING-AI.md) → [docs/baking-ai/](./docs/baking-ai/README.md)

---

## Funciona con

| Entorno | Invocación | Perfil típico en config |
|---------|------------|-------------------------|
| **Cursor** | `/baking` · skill baking · *usemos baking para…* | `"profile": "cursor"` |
| **Claude Code** | `/baking` · skill baking · lenguaje natural | `"profile": "claude"` |

Una sola config global: `~/.cursor/opus-sonnet/config.json`. **No** hace falta instalar Baking por repo.

---

## Features

### Handoff diary — El plan no se pierde en el chat

Cada corrida seria deja un archivo en `.cursor/handoff/YYYY-MM-DD-slug.md`: contexto, criterios de done, ejecución y verify. El executor recibe **la ruta**, no un resumen. La próxima sesión retoma desde ahí.

**[Modelo mental →](docs/baking-ai/intended-usage.md)** · **[Referencia Cursor →](BAKING-CURSOR.md)** · **[Claude Code →](claude-code/BAKING.md)**

---

### Routing — Opus planifica, executor barato implementa

Baking clasifica **PLAN / EXECUTE / TRIVIAL / PLAN-ONLY**, elige `planner` vs `planner-hyper` (Fable) vs executor directo, y evita Opus como chat principal.

**[Routing completo →](docs/baking-ai/routing.md)** · **[Casos reales →](docs/baking-ai/use-cases.md)**

---

### Light stack — Memoria, verify, skills (opcional)

Cuatro piezas en `lightStack` (default on en v1.5+):

| Pieza | Para qué |
|-------|----------|
| **Engram** | Decisiones entre sesiones/repos (`mem_save`, `mem_context`) |
| **Verify** | Criterios del handoff vs `git diff` al cierre |
| **Skill registry** | `baking skill-registry` → invocar la skill correcta |
| **Witch** | Solo Boogiepop/starter (off por default) |

**[LIGHT-STACK.md →](LIGHT-STACK.md)**

---

### Init-memory — Bootstrap estilo Claude `/init`

Escanea el repo, genera borrador de `AGENTS.md`, temas Engram y regla Cursor. Luego una corrida **PLAN-ONLY** completa la memoria persistente.

```bash
baking init-memory          # scan → .cursor/baking/init/
# en el chat:
/init-memory                # PLAN-ONLY + mem_save
```

**[INIT-MEMORY.md →](INIT-MEMORY.md)**

---

### Auto-route — Baking por default (toggle)

Opcional. Sin repetir `/baking` en cada prompt de implementación:

```bash
baking auto-route on    # pedidos de código → ROUTER automático
baking auto-route off   # volver a invocar /baking explícito
baking auto-route status
```

Config: `autoRoute.enabled` en `~/.cursor/opus-sonnet/config.json`.

---

### Métricas — ¿El routing y el ahorro son ciertos?

Append JSONL por corrida (`.cursor/baking/metrics/runs.jsonl`). Revisión cada **7 días o 50 runs**:

```bash
baking metrics-summary
baking metrics-review --status
baking metrics-review              # conclusión routing/ahorro
```

**[METRICS.md →](METRICS.md)**

---

### creative-brief-bar — Landings que no parecen template

Gate de calidad perceptual para pedidos visuales (craft, assets, prod+spec). Ver `creative-brief-bar.md`.

---

## Get started

> **Clonar GitHub ≠ instalar.** Después del clone hay que correr `install`.

### macOS / Linux

```bash
git clone https://github.com/admin-zyta/baking.git ~/.cursor/opus-sonnet
cd ~/.cursor/opus-sonnet && node bin/baking.js install
baking doctor
```

### Windows (PowerShell)

```powershell
git clone https://github.com/admin-zyta/baking.git $env:USERPROFILE\.cursor\opus-sonnet
cd $env:USERPROFILE\.cursor\opus-sonnet
node bin/baking.js install
node bin/baking.js doctor
```

### Sin clonar

```bash
npx github:admin-zyta/baking install
# repo privado: GH_TOKEN=ghp_... npx github:admin-zyta/baking install
```

### Engram (memoria cross-sesión, recomendado)

```bash
go install github.com/Gentleman-Programming/engram/cmd/engram@latest
engram setup cursor
# reiniciar Cursor → baking doctor → Engram MCP: OK
```

Guía paso a paso: **[docs/baking-ai/quickstart.md](docs/baking-ai/quickstart.md)**

---

## Uso diario

### Primera corrida en un proyecto

```bash
mkdir -p .cursor/handoff .cursor/baking/metrics   # o dejar que Baking lo cree
```

**Cursor / Claude Code:**

```
/baking

Agregá validación de email en el formulario de signup
```

Recibís: clasificación · path del handoff (si hubo plan) · YAML de cierre · línea en `runs.jsonl`.

### Modos que importan

| Modo | Cuándo |
|------|--------|
| **PLAN+EXECUTE** | Feature, multi-archivo, ambigüedad |
| **PLAN-ONLY** | *"solo plan"* / *"planifiquemos"* — sin código hasta *"ejecutá"* |
| **EXECUTE** | Handoff ya existe, fix obvio, typo |
| **TRIVIAL** | 2–3 comandos, status check |

### Perfil de modelos

Editar `~/.cursor/opus-sonnet/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor",
  "autoRoute": { "enabled": false },
  "lightStack": { "enabled": true }
}
```

| Perfil | Planner | Executor | Pool |
|--------|---------|----------|------|
| `cursor` | Opus / Fable | Composer | Mixto (default) |
| `hybrid` | Grok | Composer | 100% Cursor Models |
| `claude` | Opus / Fable | Sonnet + Haiku mecanic | Claude Code |

---

## CLI

```bash
baking install [--force-config]   # deploy global Cursor + Claude
baking doctor                     # agentes + light stack + auto-route
baking skill-registry [--force]   # índice de skills (~/.cursor/baking/)
baking init-memory [--force]      # bootstrap AGENTS + Engram topics
baking auto-route on|off|status   # toggle Baking por default
baking metrics-summary [path]     # resumen JSONL
baking metrics-review [--status]  # conclusión 7d / 50 runs
baking version
```

Publicar npm: **[NPM.md](NPM.md)**

---

## Documentación

| Dónde | Qué encontrás |
|-------|----------------|
| **[Intended usage](docs/baking-ai/intended-usage.md)** | Modelo mental — **si leés una, que sea esta** |
| **[Quickstart](docs/baking-ai/quickstart.md)** | Instalar, perfiles, primera corrida, troubleshooting |
| **[Use cases](docs/baking-ai/use-cases.md)** | Zyta, Boogiepop, deploy, fixes… |
| **[Components](docs/baking-ai/components.md)** | Cada pieza, agentes, perfiles |
| **[Routing](docs/baking-ai/routing.md)** | PLAN / EXECUTE / Hyper / mecanic / fork |
| **[LIGHT-STACK.md](LIGHT-STACK.md)** | Engram, Verify, Witch, registry |
| **[INIT-MEMORY.md](INIT-MEMORY.md)** | Bootstrap memoria de proyecto |
| **[METRICS.md](METRICS.md)** | JSONL, bench S0 vs S3, `metrics-review` |
| **[ROUTER.md](ROUTER.md)** · **[consumption.md](consumption.md)** | Reglas del orquestador |
| **[AGENTS.md](AGENTS.md)** | Nombres exactos Task / Agent en Cursor |

---

## Flujo (30 segundos)

```
Usuario → Baking (orquestador barato)
           ├─ [opcional] mem_context / mem_search (Engram)
           ├─ PLAN → planner | planner-hyper
           └─ EXECUTE → executor | executor-mecanic | directo
           → .cursor/handoff/YYYY-MM-DD-slug.md
           → Verify (handoff vs diff)
           → YAML + runs.jsonl + mem_session_summary
```

---

## Repo (maintainers)

```
~/.cursor/opus-sonnet/          ← clone de admin-zyta/baking
  global/cursor/                → deploy a ~/.cursor/
  global/claude/                → deploy a ~/.claude/
  bin/baking.js                 → CLI
  config.json                   → defaults (install no pisa el tuyo)
```

Después de editar:

```powershell
# bump VERSION, CHANGELOG, bakingVersion
node bin/baking.js install
git commit && git tag vX.Y.Z && git push && git push origin vX.Y.Z
```

---

## Baking vs Gentle-AI

| | **Gentle-AI** | **Baking-AI** |
|---|---------------|---------------|
| Alcance | SDD, ODD, RDD, 16 agentes, binary `gentle-ai` | Router + handoff + gates |
| Memoria | Engram (ecosistema) | Engram (light stack, MCP) |
| Instalación | Por componente / agente | Global, una vez |
| Ideal para | Workflow determinístico multi-IDE | Cursor + Claude Code, costo Opus/Composer |

Comparativa ampliada: guía HTML en Desktop (`gentle-ai-baking-guia.html`) si la tenés local.

---

## Deprecado

`/init-baking` por repo, `enable-project.ps1`, `.cursor/opus-sonnet.json` local — ver skill `init-baking` (alias de **`init-memory`**).

---

## Changelog

Ver **[CHANGELOG.md](CHANGELOG.md)** (Keep a Changelog).
