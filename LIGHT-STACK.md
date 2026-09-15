# Baking Light Stack

Cuatro piezas **opcionales** en `config.json` → `lightStack`. Sin Gentle-AI full. Uso mínimo de tokens.

Activar: `"lightStack": { "enabled": true, ... }` (default en config global v1.5+).

**Cursor y Claude Code** comparten la misma config y handoff (`.cursor/handoff/`). Métricas: `runtime: "cursor" | "claude-code"`.

| Entorno | Referencia Baking | Orquestador | Engram setup |
|---------|-------------------|-------------|--------------|
| **Cursor** | `BAKING-CURSOR.md` | Composer / skill `/baking` | `engram setup cursor` |
| **Claude Code** | `claude-code/BAKING.md` | Sonnet + Agent tool | `engram setup` (plugin) o MCP en Claude |

Perfil `claude` en config → Claude Code end-to-end. Perfil `cursor` / `hybrid` → Cursor.

---

## 1. Amnesia — Engram

**Problema:** re-explicar decisiones entre repos/sesiones.

**Setup (una vez):**

```powershell
# Windows — ver https://github.com/Gentleman-Programming/engram/releases
engram setup cursor    # Cursor → ~/.cursor/mcp.json
engram setup           # Claude Code — ver docs Engram
# Reiniciar IDE
```

Verificar: `baking doctor` → línea Engram MCP.

**Uso ligero (orquestador Baking):**

| Cuándo | Tool | Máximo |
|--------|------|--------|
| Inicio corrida no trivial | `mem_context` + `mem_search` (términos del pedido) | 2 calls |
| Decisión/convention/bug cerrado | `mem_save` (estructurado, no transcript) | 1 por hallazgo relevante |
| Cierre Baking (cualquier flow) | `mem_session_summary` | 1 — 5 bullets |

**No hacer:** `mem_save` cada turno; volcar handoff entero a Engram (ya está en `.cursor/handoff/`).

---

## 2. Verify — handoff vs diff

**Problema:** build OK pero no cumple criterios del handoff.

**Sin subagente SDD.** El orquestador o executor al cierre:

1. Leer handoff → sección **Criterios / Checklist / Acceptance** (planner debe incluirla).
2. `git diff` (o diff del scope del handoff).
3. Append al handoff:

```markdown
## Verify
| Criterio | pass/fail | nota |
|----------|-----------|------|
| … | pass | … |
```

4. YAML `verify: pass | partial | fail | skipped`

**Skip:** `TRIVIAL`, `PLAN-ONLY`, EXECUTE sin cambios de código.

**Regla:** `verify: fail` → `status: partial`, nunca `completed`.

---

## 3. Witch — orientación en código Boogiepop (opcional, off por default)

**Problema:** Grep masivo en starter/apps.

**Default en config v1.5.2+:** `"witch": { "enabled": false }` — no es parte del npm `@boogiepop/baking`; vive en starter-base + MCP Boogiepop.

**Cuándo activarlo:** solo repos Boogiepop con `witch.json` o MCP starter y exploración ≥ `minFilesBeforeExplore` (default 4).

**Uso ligero:**

1. `starter_witch_plan` con el brief completo — **antes** de Grep/read masivo.
2. Leer solo archivos que devuelve el plan.
3. `starter_witch_query` solo si falta un símbolo concreto.
4. **No** `starter_witch_build` salvo que el grafo esté roto.

Witch **no** reemplaza Engram (mapa ≠ acta de decisiones).

---

## 4. Skill registry — catálogo liviano

**Problema:** no invocar la skill correcta (`deploy-vercel`, `send-email`, …).

**Refresh (manual o semanal):**

```bash
baking skill-registry
# o --force si agregaste skills nuevas
```

Escribe: `~/.cursor/baking/skill-registry.md` (global, no por repo).

**Uso ligero:** al clasificar PLAN/EXECUTE, si el pedido matchea una fila del registry → leer **solo** ese `SKILL.md` (Read tool). No re-escanear disco cada turno.

---

## Orden en una corrida Baking

```
[opcional] mem_context / mem_search
→ clasificar → PLAN / EXECUTE
→ [boogiepop] starter_witch_plan si explore
→ [opcional] leer skill del registry
→ executor
→ Verify (handoff vs diff)
→ YAML + metrics JSONL
→ mem_session_summary
```

---

## Doctor

```bash
baking doctor
```

Reporta: agentes Baking, Engram MCP (opcional), skill-registry (edad), lightStack.enabled.
