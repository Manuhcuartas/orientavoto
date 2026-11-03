# Orientavoto (nombre provisional)

Webapp estática y neutral de orientación de voto (estilo Wahl-O-Mat) para las elecciones generales españolas del 29-N-2026. La persona elige circunscripción (opcional), responde unas 25 afirmaciones y ve su afinidad con cada candidatura, con el desglose y las fuentes. Todo se calcula en el navegador. Producción: **20 nov 2026**.

**El plan, las decisiones tomadas, el modelo de datos y las tareas están en `PLAN.md`.** No se repiten aquí.

## Stack

- Astro 7 (salida estática) + islas de Preact 11 + TypeScript 6.0 (no 7: herramientas incompatibles).
- Zod 4 para los esquemas de datos (fuente única de verdad, genera JSON Schema).
- CSS propio con custom properties. Sin framework CSS ni fuentes externas.
- Vitest 5 (unitarios) y Playwright + axe (e2e, visual, accesibilidad, privacidad).
- ESLint 10 + typescript-eslint + eslint-plugin-astro.
- Cloudflare Pages (hosting estático) y GitHub Actions (CI).
- Node ≥ 22.23 (se usa 24). Versiones fijadas en `package.json`: no actualizarlas sin preguntar.

## Estructura

```
data/                    contenido editable a mano (JSON); hoy, solo datos FICTICIOS
  posiciones/<id>.json   posiciones de cada partido o coalición
schemas/                 JSON Schema generados (no editar a mano)
scripts/                 validate.ts, generate-schemas.ts, check-size.ts
src/data/                schema.ts (Zod) y validate.ts (validación pura)
src/lib/                 lógica pura: affinity.ts, ballot.ts, shuffle.ts, data.ts
src/i18n/                es.json (textos de UI) + index.ts (t() con fallback a es)
src/components/          componentes Preact (.tsx) y Astro
src/layouts/, src/pages/ páginas: index, cuestionario, partidos, metodologia, privacidad
src/styles/              tokens.css y base.css
tests/unit/              Vitest
tests/e2e/               Playwright (flujo, visual, a11y, privacidad)
public/_headers          CSP y cabeceras de seguridad
docs/                    guías: despliegue, idiomas, accesibilidad, neutralidad, correcciones
```

## Comandos

```bash
npm install                 # instalar
npm run dev                 # servidor local en http://localhost:4321
npm test                    # unitarios (solo muestra fallos + resumen)
npm run test:verbose        # unitarios con salida completa (para depurar)
npm run test:e2e            # Playwright (solo fallos + resumen)
npm run validate            # valida data/ (DEPLOY_ENV=production además bloquea datos ficticios)
npm run lint                # ESLint (solo errores)
npm run typecheck           # astro check
npm run check               # lint + typecheck + validate + test
npm run build               # validate + build en dist/
npm run build:prod          # igual, pero con la guardia de producción
npm run preview             # sirve dist/
```

Para verificar, usa el subagente **test-runner** (`.claude/agents/test-runner.md`) en lugar de leer la salida completa de los tests en la sesión principal.

## Reglas no negociables

**Contenido**
- El contenido real (afirmaciones y posiciones) se elabora **solo con el protocolo de `docs/PROTOCOLO.md`**, aprobado por el responsable del proyecto (3-nov-2026). Las reglas deciden, no el criterio de nadie.
- **Nunca una posición sin cita literal, enlace y fecha de una fuente real.** Si no se encuentra fuente, la posición es `sin_posicion` con el documento consultado como fuente. Nunca se deduce una posición de la ideología general de un partido.
- Si una cita es dudosa o el protocolo no resuelve un caso, se marca para revisión del responsable; no se improvisa.
- Las afirmaciones siguen los criterios de selección y redacción de `docs/PROTOCOLO.md` y el responsable aprueba la lista final.
- Código, tests y ejemplos siguen usando solo datos ficticios: los nombres de partidos reales solo aparecen en `data/` y en los documentos de trabajo del contenido.

**Neutralidad**
- La app no recomienda voto, no sugiere voto útil ni estratégico y no muestra encuestas ni escaños.
- Toda lista de partidos que no esté ordenada por afinidad se baraja en el cliente en cada visita (`src/lib/shuffle.ts`).
- Los empates se resuelven al azar.
- Interfaz monocroma. El color de un partido solo aparece como marca pequeña junto a sus siglas y nunca transmite información por sí solo.
- Todos los partidos reciben el mismo tratamiento visual y el primer puesto no se destaca.

**Privacidad**
- Las respuestas del usuario **nunca** se envían, se guardan ni se ponen en la URL. Viven solo en memoria.
- Nada de cookies, localStorage, sessionStorage, IndexedDB, analítica ni recursos de terceros.
- Cero peticiones de red tras la carga; la CSP lleva `connect-src 'none'`.

**Calidad y accesibilidad**
- Mobile-first y usable con una mano: acciones principales en la zona del pulgar y objetivos táctiles ≥ 48 px. Debe funcionar de 320 px a escritorio.
- Accesibilidad WCAG 2.1 AA:
  - Contraste ≥ 4.5:1 y foco visible.
  - Todo usable con teclado.
  - Elementos HTML nativos y etiquetas para lectores de pantalla.
  - `aria-live` para cambios de paso.
- Todo texto visible sale de `src/i18n/es.json` o de los mapas `{ es }` de `data/`. No se escribe texto directamente en los componentes.
- La lógica de `src/lib/` es pura y sin DOM, y se prueba con tests unitarios.

## Flujo de trabajo

1. Al inicio de cada sesión, lee `PLAN.md` y localiza la tarea indicada (p. ej. «Haz la tarea 1.1»).
2. Trabaja **solo** en esa tarea y en los ficheros que indica. Cualquier cambio fuera de su alcance (otras tareas, refactors, dependencias nuevas, cambios de versión o de decisiones) se pregunta antes.
3. Escribe o actualiza los tests **antes** de dar la tarea por terminada, y comprueba los criterios de aceptación (con `test-runner`; la parte visual, en el navegador a 375, 768 y 1280 px cuando la tarea lo pida).
4. Al acabar, marca la tarea en `PLAN.md` (`### [x] …`) y resume en 3–5 líneas qué cambió, qué quedó pendiente y cualquier `[PENDIENTE]` para el responsable del proyecto.
5. Si durante la tarea se toma una decisión nueva que afecta a otras tareas, añádela a «Decisiones tomadas» en `PLAN.md`.

## Compact instructions

Al compactar, conserva:
- Los cambios de código hechos en la sesión (ficheros y qué cambió en cada uno).
- Los resultados de los últimos tests, lint y validación (qué pasa, qué falla, con fichero y línea).
- Las decisiones tomadas en la sesión y su motivo.
- La tarea de `PLAN.md` en curso y qué criterios de aceptación quedan por cumplir.

Descarta la salida completa de comandos, el contenido de ficheros ya leídos y las exploraciones que no llevaron a nada.
