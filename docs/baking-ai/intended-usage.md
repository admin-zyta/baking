# Intended Usage — Baking-AI

← [Volver al README](./README.md)

---

Esta página explica **cómo se supone que uses Baking**. No los flags ni el schema — el modelo mental. Si leés una sola página además del README, que sea esta.

---

## Después de instalar — ya estás listo

Corré `baking install` una vez. En cada proyecto solo necesitás **`.cursor/handoff/`** (Baking la crea si falta).

No memorices subagentes ni modelos. Decí:

> *"usemos baking para …"*  
> o **`/baking`** + tu pedido.

Baking clasifica solo y delega.

---

## La regla de oro

**Baking no codea producto.** Orquesta.

| Rol | Quién | Modelo típico |
|-----|-------|---------------|
| Hablar con vos, clasificar, cerrar | **Orquestador** (chat principal) | Composer / Sonnet |
| Pensar y escribir el plan | **Planner** | Opus o Fable (Hyper) |
| Implementar | **Executor** | Composer / Sonnet / Haiku (mecanic) |

Nunca Opus como chat principal salvo que lo pidas explícito.

---

## El handoff es la fuente de verdad

Todo plan serio vive en:

```
.cursor/handoff/YYYY-MM-DD-mi-tarea.md
```

- El **planner** lo escribe.
- El **executor** lo lee (solo recibe la **ruta**, no un resumen).
- Al terminar, append **`## Ejecución`** (y **`## Verify`** si aplica).
- **No borrar** — es historial y ahorro de tokens en la próxima sesión.

Si pediste *"solo plan"* → **PLAN-ONLY**: handoff listo, **sin** tocar código hasta que digas *"ejecutá"*.

---

## Clasificación orgánica

No elegís "modo PLAN". Baking infiere:

| Pedido | Qué pasa |
|--------|----------|
| "Cambiá el color del botón a navy" | **TRIVIAL** o EXECUTE directo |
| "Armá landing editorial para yoga studio" | **PLAN** (+ creative-brief-bar) |
| "Solo plan, no ejecutes" | **PLAN-ONLY** |
| "Plan deep / hyper" | **PLAN-DEEP** → Fable |
| "Seguí el handoff de ayer e implementá" | **EXECUTE** con handoff existente |

Ante duda → **PLAN**. Mejor un handoff de más que Opus codeando a ciegas.

---

## Perfiles (una sola config)

Editás `"profile"` en `~/.cursor/opus-sonnet/config.json`:

| Perfil | Planner | Executor | Cuándo |
|--------|---------|----------|--------|
| `cursor` | Opus | Composer 2.5 | Default Cursor — mejor plan, exec barato |
| `hybrid` | Grok 4.6 | Composer 2.5 | Cero Opus — todo pool Cursor |
| `claude` | Opus | Sonnet (+ Haiku mecanic) | Claude Code end-to-end |

---

## Light stack — opcional pero recomendado

Cuatro hooks **livianos** (no Gentle-AI):

1. **Engram** — memoria entre sesiones/repos  
2. **Verify** — handoff vs diff al cierre  
3. **Witch** — orientación en código Boogiepop  
4. **Skill registry** — encontrar la skill correcta  

Activos si `lightStack.enabled: true`. Ver [LIGHT-STACK.md](../../LIGHT-STACK.md).

---

## Cierre de cada corrida

Siempre recibís un **YAML** breve + métrica en `.cursor/baking/metrics/runs.jsonl`:

```yaml
baking:
  handoff: .cursor/handoff/2026-09-15-landing-yoga.md
  flow: PLAN+EXECUTE
  verify: pass
  status: completed
```

Eso calibra routing y (opcional) justifica ahorro vs baseline.

---

## Quick reference

| Hacé | No hagas |
|------|----------|
| `/baking` o *usemos baking* | Opus codeando todo el chat |
| Dejar el plan en handoff | Plan solo en el chat |
| `baking doctor` tras install | Clonar repo sin `baking install` |
| PLAN-ONLY hasta que digas ejecutar | Inferir EXECUTE después de solo plan |
| Verify al cerrar features con criterios | Marcar completed solo por build |
