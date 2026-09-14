# Publicar `@boogiepop/baking`

Paquete npm que instala Baking global en Cursor + Claude Code (skills, agentes, rules, config).

## Instalar (otra máquina)

```bash
npx @boogiepop/baking install
```

Global:

```bash
npm i -g @boogiepop/baking
baking install
```

Si ya tenés `config.json` custom y no querés backup automático, el install respeta el existente (copia a `config.json.bak` solo al sobrescribir docs; config se backup si existe).

Forzar reemplazo de config:

```bash
baking install --force-config
```

## Publicar (maintainers)

1. Bump `VERSION`, `package.json` → `version`, `config.json` → `bakingVersion`, `CHANGELOG.md`
2. Login npm con acceso al scope `@boogiepop`
3. Desde la raíz del repo:

```bash
npm publish
```

Scope **restricted** por defecto (`publishConfig.access`). Para público: `"access": "public"` en `package.json`.

## Dry-run local

```bash
node bin/baking.js install
node bin/baking.js version
```

Equivalente a `sync-global.ps1` en Windows; el bin es cross-platform (Node 18+).

## Qué no incluye npm

- Métricas por workspace (`.cursor/baking/metrics/` en cada proyecto — se crea al correr)
- Handoff diary (`.cursor/handoff/` por proyecto)
- Accept de Fable / modelos disponibles en la cuenta Cursor
