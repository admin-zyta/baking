# Baking init-memory

Bootstrap de memoria de proyecto (estilo Claude `/init`).

## Comandos

```bash
baking init-memory              # scan + borradores en .cursor/baking/init/
baking init-memory --dry-run    # preview sin escribir
baking init-memory --force      # regenera .cursor/rules/baking-project.mdc
```

Luego: **`/init-memory`** o *usemos baking PLAN-ONLY para completar init-memory*.

## Qué genera

| Archivo | Rol |
|---------|-----|
| `.cursor/baking/init/scan.json` | Señales detectadas (stack, CI, mode create/audit) |
| `.cursor/baking/init/AGENTS.draft.md` | Borrador — base para el agente |
| `.cursor/baking/init/engram-topics.json` | Temas sugeridos para `mem_save` |
| `.cursor/baking/init/NEXT.md` | Instrucciones PLAN-ONLY |
| `AGENTS.md` | Escrito solo en mode **create** (repo sin AGENTS/CLAUDE) |
| `.cursor/rules/baking-project.mdc` | Regla Cursor alwaysApply (concisa) |

## Auto-route (Baking por default)

Opcional — toggle global:

```bash
baking auto-route status
baking auto-route on    # pedidos de código → Baking sin "/baking" cada vez
baking auto-route off
```

Config: `autoRoute.enabled` en `~/.cursor/opus-sonnet/config.json`.

Con `autoRoute.on`: la rule `opus-sonnet-router.mdc` aplica ROUTER en implementación.  
Con `off`: hace falta `/baking` o *usemos baking* (comportamiento anterior).
