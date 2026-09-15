# Quickstart — Baking-AI

← [Volver al README](./README.md)

---

## Requisitos

- **Cursor** y/o **Claude Code**
- **Node 18+** (para CLI install)
- Opcional: **Engram** (light stack memoria)

---

## 1. Instalar (una vez por máquina)

```bash
# Desde npm (cuando esté publicado)
npx @boogiepop/baking install

# O desde clone
git clone https://github.com/admin-zyta/baking ~/.cursor/opus-sonnet
node ~/.cursor/opus-sonnet/bin/baking.js install
```

Windows alternativo:

```powershell
& "$env:USERPROFILE\.cursor\opus-sonnet\sync-global.ps1"
```

---

## 2. Verificar

```bash
baking doctor
baking skill-registry
```

Esperado:

- Agentes Cursor 7/7 · Claude 5/5  
- Light stack: enabled  
- skill-registry: OK  

---

## 3. Elegir perfil

Editar `~/.cursor/opus-sonnet/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor",
  "lightStack": { "enabled": true }
}
```

| Perfil | Uso |
|--------|-----|
| `cursor` | Cursor — Opus plan + Composer exec |
| `hybrid` | Cursor — Grok + Composer (sin Opus) |
| `claude` | Claude Code — Opus + Sonnet + Haiku mecanic |

---

## 4. Bootstrap proyecto

En la raíz del repo (una vez):

```bash
mkdir -p .cursor/handoff
mkdir -p .cursor/baking/metrics
```

O pedí cualquier corrida Baking — crea carpetas si faltan.

---

## 5. Primera corrida

**Cursor:**

```
/baking

usemos baking para agregar tooltip al botón Guardar en Settings.tsx
```

**Claude Code:** igual con `/baking` o lenguaje natural.

Recibirás:

1. Clasificación (PLAN o EXECUTE)  
2. Handoff path (si hubo plan)  
3. YAML de cierre  
4. Línea en `runs.jsonl`  

---

## 6. Light stack — Engram (opcional)

```bash
# Instalar Engram desde releases GitHub
engram setup cursor      # Cursor
# Claude: ver docs Engram
# Reiniciar IDE
baking doctor              # Engram MCP: OK
```

---

## 7. Comandos útiles

```bash
baking version
baking doctor
baking skill-registry [--force]
baking init-memory [--force]       # bootstrap AGENTS + Engram (ver INIT-MEMORY.md)
baking auto-route on|off|status    # Baking por default sin /baking cada vez
baking metrics-summary
baking metrics-review --status
```

---

## 8. Init memoria de proyecto (legacy / nuevo repo)

```bash
baking init-memory
# luego en chat: /init-memory  (PLAN-ONLY + mem_save)
```

Ver [../../INIT-MEMORY.md](../../INIT-MEMORY.md).

---

## 9. Auto-route (opcional)

```bash
baking auto-route on     # implementación → Baking automático
baking auto-route status
```

---

## 10. Documentación siguiente

- [intended-usage.md](./intended-usage.md) — modelo mental  
- [use-cases.md](./use-cases.md) — escenarios  
- [components.md](./components.md) — piezas  
- [routing.md](./routing.md) — PLAN / EXECUTE  

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Agente planner-hyper no existe" | `baking install` + reiniciar Cursor |
| No se crea runs.jsonl | Releer skill baking · ver METRICS.md |
| Fable bloqueado | Aceptar data retention en Cursor Dashboard |
| Engram MISSING | `engram setup cursor` · reiniciar |
