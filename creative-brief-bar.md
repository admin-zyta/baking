# Barra de calidad — briefs creativos / UI

Aplicar cuando el pedido incluye diseño visual, landing, portfolio, marca, “feel”, vibe, o copy editorial.
**No copiar referencias concretas** — traducir el brief a criterios medibles en el handoff.

## Por qué existe

El pipeline planner→executor puede producir código impecable (`build` OK) y aun así entregar una UI “template limpio” si el plan optimiza stack y archivos pero **no la ambición visual**.

Esta barra equilibra: **misma rigurosidad de paths/build, más especificación de calidad perceptual**.

**Starter Boogiepop:** commits al starter siguen `docs/GENERAL-ONLY.md` — solo reglas generales, nunca artefactos de sesión ni nombres de apps pasadas.

---

## Modo de build por defecto (landings creativas)

Composite default: **`prod + spec + craft`** (no prod + spec solo).

| Capa | Qué cubre |
|------|-----------|
| **prod** | build, lint, componentes, paths |
| **spec** | tabla de timings de interacciones |
| **craft** | checklist perceptual — `creative-brief-bar` (global) o `docs/CRAFT-BAR.md` + `docs/ORIGINALITY.md` (starter v0.0.5+) |

El planner debe declarar qué capas aplican. El executor verifica **las tres** en landings creativas.

---

## Clasificación (Baking)

| Señales en el pedido | Acción |
|---------------------|--------|
| paleta, tipografía, vibe, landing, portfolio, “feels like”, interacciones | **PLAN** + secciones creativas obligatorias |
| fix color, rename, un componente | EXECUTE (sin barra creativa) |
| diseño + >3 archivos | PLAN + barra creativa |

---

## Secciones extra obligatorias en el handoff

Además del template estándar del planner, incluir:

### 1. Ambición visual (3–5 bullets)

Qué debe sentir el usuario en los primeros 5 segundos. Una frase antítesis si el brief la trae (“antídoto a gym culture”, “monografía impresa”, etc.).

### 2. Jerarquía tipográfica

| Nivel | Fuente | Peso | Uso |
|-------|--------|------|-----|
| Display | … | … | hero, títulos de sección |
| Body | … | … | párrafos |
| Label | … | … | caps, folios, meta |

Incluir: tracking, line-height body (≥1.75 para “airy”), max-width de copy (`~60ch`).

### 3. Sistema de motion

| Interacción (del brief) | Duración | Easing | Reduced motion |
|-------------------------|----------|--------|------------------|
| … | … | … | … |

No solo listar — especificar **curva** (`cubic-bezier`) y si pausa off-screen.

### 4. Copy y tono

- Longitud mínima por sección (ej. practices: 2–3 oraciones + meta).
- Tono: literario / directo / técnico — explícito.
- Nombre ficticio + tagline + 1 línea antídoto si aplica.
- **Prohibido:** lorem, “compelling”, “seamless”, placeholders genéricos.

### 5. Imágenes y assets

- Fuente (Unsplash con IDs verificados, no Picsum genérico para producto visual).
- Tratamiento: filtros, overlay, aspect ratios.
- Qué debe verse en cada imagen (luz, composición).
- **Tabla de assets** (obligatoria si hay URLs externas):

```markdown
## Assets (verify before ship)

| URL / ID | Uso | Verificar |
|----------|-----|-----------|
| https://… | hero | HEAD/GET 2xx antes de cerrar |
```

- **No** pegar IDs de Unsplash sin marcar `verify before ship`.
- Executor debe correr verificación HTTP y append `### Asset verification` en `## Ejecución`.

Si el repo usa **starter Boogiepop v0.0.5+**, el executor también lee `docs/CRAFT-BAR.md` y `docs/ORIGINALITY.md`.

### 6. Anti-patterns (mínimo 3)

Qué evitar para no caer en “AI slop” / template:

- Hero genérico centrado + gradiente plano sin capas
- Secciones idénticas (mismo padding/título/copy corto repetido)
- Nav escondido hasta scroll sin razón de diseño
- Formulario mínimo sin contexto de confianza
- Solo checklist técnico en done criteria sin criterio visual

### 7. Done criteria — capa creativa (checklist)

Además de `npm run build` (**build ≠ completado**):

- [ ] Cada sección del brief tiene identidad propia (no clones)
- [ ] Copy cumple tono y longitud del plan
- [ ] Interacciones del brief implementadas con timing del plan
- [ ] Jerarquía tipográfica visible sin inspeccionar código
- [ ] Imágenes alineadas al brief (tema, no random)
- [ ] Assets externos verificados (2xx) — ver tabla Assets
- [ ] Craft bar revisada en UI corriendo (starter: `docs/CRAFT-BAR.md`)

### 8. Referencia externa (opcional)

```markdown
## External reference (read-only)
- URL o demo de terceros
- Use: comparar barra de craft — **no copiar source**
```

Planner compara ambición; executor implementa **desde cero**. No archivar comparativas de sesión en el starter.

---

## Rol del executor

1. Leer ambas capas: pasos técnicos **y** secciones creativas.
2. Si un paso técnico contradice la barra creativa → documentar desvío; preferir barra salvo bloqueo.
3. En `## Ejecución`, marcar checklist creativo igual que el técnico.

---

## Rol de Baking (orquestador)

- Detectar brief creativo → avisar al planner: “incluí creative-brief-bar” + modo **prod+spec+craft**.
- No acortar el pedido visual al delegar al planner.
- Post-exec: evaluar scores antes de cerrar (ver `BAKING-CURSOR.md` / `claude-code/BAKING.md`):
  - **partial** si build OK pero `craft: partial|fail` o `assets: fail`
  - **nunca completed** con `assets: fail`

Ver `starter-base/docs/BAKING-IMPROVEMENTS.md` para gates de cierre y `docs/GENERAL-ONLY.md` para ediciones al starter.
