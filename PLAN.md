# PLAN — Orientavoto (generales 29-N-2026)

Producción: **viernes 20 nov 2026**. Una tarea por sesión. Para empezar una sesión: «Haz la tarea X.Y de PLAN.md». Al terminar, cambia `[ ]` por `[x]` en el título de la tarea.

Modelo/esfuerzo: **Opus** = arquitectura o lógica compleja · **Sonnet** = implementación normal · **Haiku** = tareas mecánicas. Esfuerzo: bajo / medio / alto.

---

## Decisiones tomadas (no volver a discutir)

**Metodología de cálculo**
- **Puntuación 2/1/0** (como el Wahl-O-Mat): usuario u y partido p ∈ {−1 en contra, 0 neutral, +1 a favor}; puntos = peso × (2 − |u − p|); máximo = peso × 2; **afinidad = 100 × Σpuntos / Σmáximo**. Es fácil de explicar y distingue «neutral frente a posicionado» de «opuestos».
- **Peso**: 2 si la afirmación está marcada «importante para mí», 1 si no.
- **Afirmación saltada**: fuera del numerador y del denominador de todos los partidos. Responder «Neutral» sí cuenta.
- **Sin posición conocida**: fuera solo para ese partido. Así no se le atribuye una postura que no ha expresado. Se muestra «calculado sobre X de Y afirmaciones».
  - Aviso visible si la cobertura < 75 %.
  - Si la cobertura < 50 %, el partido sale del ranking y va a un bloque «No hay datos suficientes».
  - Los umbrales están en `data/meta.json`.
- **Empates**: se ordena por el porcentaje **redondeado que se muestra**. A igual porcentaje, orden aleatorio. Así ningún decimal oculto favorece a nadie.
- **Pocas respuestas**: si hay menos de `minimoRespuestas` (5), los resultados llevan un aviso de baja fiabilidad.

**Neutralidad**
- Sin recomendaciones, sin voto útil, sin encuestas ni escaños. No hay «ganador» destacado ni frases tipo «tu partido es…».
- Orden aleatorio (Fisher–Yates con `crypto.getRandomValues`) en el cliente, en cada visita, allí donde no hay orden por afinidad: listado de partidos, desglose y bloque de datos insuficientes. El HTML prerenderizado nunca lleva un orden fijo de partidos.
- **Interfaz monocroma**: grises y casi negro. En España casi cualquier color se asocia a algún partido. El color de un partido solo aparece como una marca pequeña junto a sus siglas, y nunca transmite información por sí solo.
- Mismo componente, tamaño y tipografía para todos los partidos. Sin logo, se usa una insignia con las siglas.
- **Coaliciones**: se muestra el nombre real de la papeleta en esa circunscripción y debajo «incluye a: …». Heredan las posiciones de `partidoReferencia` y pueden sobrescribir afirmaciones concretas con fuente propia (override de la coalición > partido de referencia). En el desglose se indica si una posición es propia o heredada.
- Sin provincia elegida → solo partidos con `ambito: "estatal"`.

**Privacidad (RGPD: opiniones políticas = datos de categoría especial)**
- Las respuestas solo viven **en memoria**: nada de cookies, localStorage, sessionStorage ni IndexedDB. Si la persona recarga, empieza de cero; se avisa con `beforeunload` si hay respuestas a medias.
- Las respuestas nunca van en la URL. El hash como mucho lleva el índice del paso (`#/afirmacion/7`).
- Cero analítica, cero recursos de terceros (fuentes del sistema) y cero peticiones de red tras la carga: los datos JSON se incrustan en el build. **CSP con `connect-src 'none'`**: garantía técnica verificable de que no se envía nada.
- Los enlaces a fuentes llevan `rel="noopener noreferrer"`.

**Técnica**
- **Astro 7 + islas de Preact 11 + TypeScript.** Las páginas informativas son HTML estático sin JS (rápidas en 3G); solo el cuestionario y los listados aleatorios son islas. Además, Astro trae i18n nativo.
- **TypeScript 6.0.x, no 7**: typescript-eslint y `@astrojs/check` aún no admiten TS 7.
- **Zod 4** como única fuente de verdad del esquema. Genera JSON Schema con `z.toJSONSchema` (nativo), que da autocompletado en VS Code.
- **CSS propio** con custom properties. Sin framework CSS.
- **ESLint 10** + typescript-eslint + eslint-plugin-astro. Sin `eslint-plugin-jsx-a11y`, que no es compatible con ESLint 10; la accesibilidad se cubre con axe en e2e.
- **Tests**: Vitest 5 (unitarios) y Playwright (e2e, visual, axe, privacidad). Reporters silenciosos por defecto: solo fallos y resumen.
- **Hosting en Cloudflare Pages**: permite cabeceras propias (`_headers`), tiene vistas previas por rama y CDN en España. GitHub Pages no permite cabeceras.
- **Analítica Web de Cloudflare desactivada.**
- **Guardia de producción**: si `meta.ficticio === true` y `DEPLOY_ENV=production`, la validación falla y el build no sale. Mientras haya datos ficticios, se muestra un banner fijo: «DATOS FICTICIOS — NO USAR PARA DECIDIR EL VOTO».
- **Claves de los JSON en castellano** (los edita una persona a mano). El código va en inglés.
- **i18n**: todo texto de contenido es un mapa `{ "es": "…" }`. Los textos de UI van en `src/i18n/<locale>.json`, con fallback a `es`. Por ahora solo `es`.
- Las versiones de `package.json` están fijadas. No se actualizan sin preguntar.

**Fuera de alcance**
- Otros idiomas (solo se deja la estructura preparada).
- Compartir o exportar resultados.
- Comparar o filtrar partidos.
- Filtrar por tema.
- PWA u offline.
- Modo oscuro.
- Analítica.

**Si vamos justos, se recorta en este orden**
1. Tarea 2.5 (botón «atrás» del navegador).
2. Logos (quedan las siglas).
3. Explicación desplegable de cada afirmación.
4. Capturas visuales exhaustivas (quedan las básicas + axe).

**Nunca se recorta:** neutralidad, privacidad, accesibilidad básica, desglose con fuentes, metodología, validación y tests del algoritmo.

**Pendiente legal (lo decide el responsable del proyecto):** ¿se mantiene activa en la jornada de reflexión (28-N) y el 29-N? Hay que consultarlo con asesoría legal o con la JEC.

---

## Modelo de datos (`data/`)

Los ficheros de datos:

| Fichero | Contenido |
|---|---|
| `meta.json` | `{ ficticio: bool, eleccion, version, actualizado: "AAAA-MM-DD", umbralAvisoCobertura: 0.75, umbralCoberturaMinima: 0.5, minimoRespuestas: 5, contactoCorrecciones }` |
| `circunscripciones.json` | `[{ codigo: "01".."52" (INE; 51 Ceuta, 52 Melilla), nombre: {es}, comunidad }]` |
| `afirmaciones.json` | `[{ id: "a01", texto: {es}, tema: {es}, explicacion?: {es} }]` |
| `partidos.json` | `[{ id: "partido-a" (kebab-case), nombre: {es}, siglas, ambito: "estatal"\|"autonomico", color?: "#RRGGBB", logo?: "logos/x.svg", web?: url }]` |
| `coaliciones.json` | `[{ id, nombre: {es}, siglas, partidoReferencia: idPartido, incluye: [idPartido…] }]` |
| `candidaturas.json` | `{ "<codigo>": [{ partido: id } \| { coalicion: id }] }`. Deben estar las 52 claves. |
| `posiciones/<idEntidad>.json` | `{ entidad, posiciones: [{ afirmacion, posicion, justificacion: {es}, fuentes: [{ url (https), tipo, titulo, fecha? }] }] }` |

Notas sobre las posiciones:
- `posicion` puede ser `a_favor`, `neutral`, `en_contra` o `sin_posicion`.
- `tipo` puede ser `programa_electoral`, `votacion_congreso`, `declaracion_publica` u `otro`.
- Los partidos deben cubrir **todas** las afirmaciones.
- Una coalición solo tiene fichero si sobrescribe alguna posición.
- `sin_posicion` también necesita fuente: el programa consultado donde el tema no aparece.

Decisiones de esquema (tarea 0.2):
- Objetos **estrictos**: una clave desconocida (p. ej. una errata) es un error. Por eso los JSON no llevan `$schema`; el autocompletado viene de `.vscode/settings.json`.
- `justificacion.es` puede ser `""` (la 0.4 lo trata como aviso). En el resto de textos `{ es }`, `es` no puede estar vacío.
- `comunidad` es un id kebab-case (`castilla-y-leon`), no un texto localizado. `fuentes[].titulo` es un texto plano (el título original del documento).
- Los ids de afirmación siguen el formato `a01`.
- `@types/node` 24.19.2 añadido como devDependency (aprobado) para los scripts.

Dataset ficticio (tarea 0.3), datos útiles para los tests de otras tareas:
- Partido E tiene **7/25** `sin_posicion` (28 %, cobertura 72 %), no un 20 %: con un 20 % la cobertura sería del 80 % y no provocaría el aviso (< 75 %). F tiene 15/25 (cobertura 40 %). C tiene 1 (a25).
- X va en coalición con A (`coalicion-a-x`) en Aragón (22, 44, 50); Y, con B (`coalicion-b-y`) en Extremadura (06, 10). Ni X ni Y se presentan solos.
- Overrides: `coalicion-a-x` en a03 y a10; `coalicion-b-y` en a05 y a18 (siempre distintos de la postura heredada).
- Siglas ficticias: PFA…PFF, PRFX, PRFY, CFAX, CFBY. Afirmaciones con explicación: a01, a03, a06, a08, a11, a13, a16, a18, a21, a23. Las más largas (~242 caracteres): a04, a10, a14, a20, a24.

Validación (tarea 0.4):
- `validateDataset` recibe los JSON en bruto (`RawDataset`) para poder informar también de los fallos de esquema; leer los ficheros es cosa del CLI. Si un fichero no pasa el esquema, se omiten las reglas cruzadas que dependen de él para no generar ruido.
- Errores añadidos al listado de la tarea: `entidad` distinta del nombre del fichero, fichero de posiciones de una entidad inexistente, posición sobre una afirmación inexistente (en cualquier fichero, no solo coaliciones), id compartido entre partido y coalición, afirmación repetida en un fichero, candidatura repetida en una circunscripción y falta de alguna de las 52 en `circunscripciones.json`.
- El aviso de cobertura solo se calcula para entidades que aparecen en `candidaturas.json` (las coaliciones, con sus overrides sobre el partido de referencia). Con el dataset ficticio avisa de E (72 %) y F (40 %).

Algoritmo de afinidad (tarea 1.1):
- La **cobertura se calcula sobre las afirmaciones respondidas** por la persona (no sobre las 25): `considered / answered`, que es el «calculado sobre X de Y». Por eso puede diferir de la cobertura del aviso de `npm run validate`, que es sobre el total.
- Interfaz: `Answers` = `{ [idAfirmacion]: { value: -1|0|1|null, important } }` (`null` o ausente = saltada; `null` conserva la marca de importante al volver atrás). Las posiciones son `{ [idAfirmacion]: { posicion } }`, así que las entidades de `getBallot` (1.2) encajan tal cual si `positions` es un mapa por id de afirmación.
- Si no se puede comparar ninguna afirmación (todas saltadas o sin posición), `percent` es `null` y la entidad va a `insufficient`. Con todo saltado, todas van ahí y `lowAnswerCount` es `true`; la pantalla de resultados (1.6) debe tratar ese caso.
- Ranking: primero se baraja con `rng` (`shuffle.ts`) y luego se ordena de forma estable por el porcentaje redondeado.

Candidaturas (tarea 1.2):
- `getBallot` devuelve las entidades **en el orden de los datos**; barajar o ordenar es cosa de quien lo llama (`shuffle` o `rankEntities`).
- La lógica es pura en `resolveBallot(dataset, codigo)`; `getBallot(codigo)` la aplica al dataset embebido de `data.ts` (cargado con imports JSON e `import.meta.glob`).
- Cada entidad lleva `incluye` (partidos de la coalición) y `referencia` (el partido del que hereda, para «heredada de …» en el desglose). Las posiciones se indexan por id de afirmación y cada una conserva justificación y fuentes además de `origen`.
- Una coalición usa como marca el **color de su partido de referencia** (no tiene color propio en el esquema).
- Sin provincia salen **todos** los partidos estatales de `partidos.json`, sin mirar dónde se presentan.
- El PRNG con semilla para tests está en `tests/unit/helpers/rng.ts`.

Base visual e i18n (tarea 1.3):
- `es.json` es **anidado** y las claves se usan con puntos (`t('nav.inicio')`). `MessageKey` se deriva del JSON, así que una clave inexistente es un error de tipos; en tiempo de ejecución lanza en dev y tests y en producción muestra la clave.
- `t` usa el idioma por defecto; en páginas con idioma, `createTranslator(Astro.currentLocale)`. Para añadir un idioma: su JSON en `src/i18n/` y registrarlo en `catalogs` y en `astro.config.mjs` (lo detalla la 2.6).
- El banner de datos ficticios va arriba en todas las páginas pero **no es `sticky`**: ocuparía altura en móvil y chocaría con el criterio de la 1.5 (responder sin scroll a 375×812). Va invertido (blanco sobre casi negro) para destacar sin color.
- Los enlaces del menú llevan barra final (`/partidos/`) porque Cloudflare Pages sirve los directorios así y se evita una redirección. La página actual se marca con `aria-current` (subrayado + negrita, no color).

Cuestionario (tarea 1.4):
- **Las islas reciben los datos como props**, ya parseados en el build (`cuestionario.astro` → `Quiz`). Así el JS del cliente no incluye Zod ni los JSON en bruto: hoy son ~12,6 KB gzip en total. Las tareas 1.5–2.1 deben seguir el mismo patrón (pasar afirmaciones y papeletas como props, no importar `data.ts` en un `.tsx`).
- El selector arranca en «Elige una opción» (deshabilitada). «Prefiero no indicarla» es una opción explícita justo debajo, para que nadie acabe sin provincia sin haberlo decidido. Si se pulsa «Continuar» sin elegir, aparece un error en texto (`role="alert"`, `aria-invalid`) y el foco vuelve al selector.
- Al cambiar de paso, el foco va al `<h1>` del paso nuevo (con `tabindex="-1"`); en la carga inicial no se mueve. Cada paso tiene su propio `<h1>`.
- Los estilos compartidos `.button`, `.button--secondary`, `.field`, `.field__hint`, `.field__error` y `.prose` están en `base.css`.
- El paso de afirmaciones es un marcador provisional (texto y botón «Anterior») que sustituye la 1.5.

---

## Fase 0 — Cimientos (2–3 nov)

### [x] 0.1 · Inicializar el proyecto
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** —
- **Ficheros:** `package.json` (ya existe: no cambiar versiones), `astro.config.mjs`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore`, `.nvmrc` (24), `src/pages/index.astro` (página provisional), carpetas vacías de la estructura de CLAUDE.md.
- **Qué hacer:**
  - `git init` y `npm install`.
  - Astro con `@astrojs/preact` y `output: 'static'`.
  - i18n: `defaultLocale 'es'`, `locales ['es']`, `prefixDefaultLocale: false`.
  - tsconfig estricto con `jsxImportSource: "preact"`.
  - ESLint en configuración plana (flat config) con typescript-eslint + eslint-plugin-astro.
  - Vitest con `include: ['tests/unit/**/*.test.ts']` y entorno `node`.
- **Aceptación:**
  - `npm run dev` sirve la página provisional en `localhost:4321`.
  - `npx astro build` genera `dist/`.
  - `npm run lint`, `npm run typecheck` y `npm test` (0 tests) pasan.
  - Primer commit hecho.

### [x] 0.2 · Esquemas de datos (Zod) y JSON Schema
- **Modelo:** Opus · **Esfuerzo:** medio · **Requiere:** 0.1
- **Ficheros:** `src/data/schema.ts`, `scripts/generate-schemas.ts`, `schemas/*.schema.json`, `.vscode/settings.json` (`json.schemas` → `data/**`), `tests/unit/schema.test.ts`.
- **Qué hacer:**
  - Esquemas exactamente según el «Modelo de datos», con tipos TS inferidos y exportados.
  - Mapa de texto localizado `{ es: string }` reutilizable, con `es` obligatorio.
  - `npm run schemas` genera los JSON Schema.
- **Aceptación:**
  - Los tests aceptan un ejemplo válido de cada fichero.
  - Los tests rechazan: id con mayúsculas, URL `http:`, `posicion` inválida, fuentes vacías y `es` ausente.
  - Ejecutar `npm run schemas` dos veces no produce diff.

### [x] 0.3 · Dataset ficticio
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** 0.2
- **Ficheros:** `data/*.json`, `data/posiciones/*.json`.
- **Qué hacer:**
  - `meta.ficticio: true`.
  - Las **52 circunscripciones reales** con código INE. Es un dato de referencia público, no contenido político.
  - Partidos estatales: «Partido A (ficticio)» … «Partido F (ficticio)».
  - 2 autonómicos: «Partido Regional X (ficticio)» en una comunidad e «Y» en otra.
  - 2 coaliciones ficticias: A + X en las provincias de X y B + Y en las de Y, cada una con 2 overrides.
  - 25 afirmaciones «Afirmación de ejemplo N (ficticia): …», con texto de relleno de longitud variable (hasta unos 250 caracteres), temas «Tema 1…5» y explicación en unas 10 de ellas.
  - Posiciones variadas. Partido E con un 20 % de `sin_posicion` (provoca el aviso) y F con un 60 % (provoca «datos insuficientes»).
  - Partido D no se presenta en Ceuta ni en Melilla.
  - Fuentes en `https://example.org/ficticio/...`.
- **Aceptación:**
  - Todo fichero pasa su esquema Zod (test rápido o script).
  - Ningún nombre de partido real ni texto político real.
  - Todos los nombres y textos llevan «ficticio/a» o «ejemplo».

### [x] 0.4 · Script de validación de datos
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 0.3
- **Ficheros:** `src/data/validate.ts` (función pura `validateDataset(dataset, { production }) → { errors, warnings }`), `scripts/validate.ts` (CLI), `tests/unit/validate.test.ts`.
- **Errores (bloquean):**
  - Fallo de esquema.
  - Ids duplicados.
  - Posición sin fuente.
  - Combinación partido × afirmación ausente, para partidos con candidatura o que sean `partidoReferencia`.
  - Override de coalición sobre una afirmación inexistente.
  - Id de partido o coalición inexistente en candidaturas o en coaliciones.
  - Falta alguna de las 52 circunscripciones o alguna lista está vacía.
  - `ficticio: true` con `production`.
- **Avisos (no bloquean):**
  - URL de fuente duplicada en una misma posición.
  - Justificación vacía o de más de 400 caracteres.
  - Cobertura menor del umbral de aviso.
- **Formato del CLI:**
  - Una línea por problema, con fichero y ruta (p. ej. `data/posiciones/partido-a.json › a07 › fuentes: vacío`).
  - Una línea final: `✔ Datos válidos (0 errores, N avisos)` o `✖ N errores, M avisos`.
  - Código de salida 1 si hay errores.
  - `production` se activa con `DEPLOY_ENV=production`.
- **Aceptación:**
  - Al menos un test por regla.
  - `npm run validate` pasa con el dataset ficticio.
  - `DEPLOY_ENV=production npm run validate` falla con el mensaje de datos ficticios.
  - `npm run build` funciona de punta a punta.

### [x] 0.5 · CI, cabeceras y guía de despliegue
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** 0.4
- **Ficheros:** `.github/workflows/ci.yml`, `public/_headers`, `docs/DESPLIEGUE.md`.
- **Qué hacer:**
  - CI en push y PR: `npm ci` → lint → typecheck → validate → test → build. El e2e se añade en la tarea 1.7.
  - `_headers`: `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy` restrictiva. La CSP llega en la tarea 2.4.
  - `DESPLIEGUE.md` explica los pasos manuales para el usuario:
    - Crear el repo en GitHub y conectarlo a Cloudflare Pages: build `npm run build`, salida `dist`, Node 24.
    - Definir `DEPLOY_ENV=production` **solo** en el entorno Production.
    - No activar Web Analytics.
- **Aceptación:**
  - Tras el build, `dist/_headers` existe.
  - El workflow es YAML válido y pasa en el primer push.
  - La guía se puede seguir sin contexto previo.

## Fase 1 — MVP funcional (4–9 nov) · Hito: flujo completo en móvil con datos ficticios

### [x] 1.1 · Algoritmo de afinidad
- **Modelo:** Opus · **Esfuerzo:** alto · **Requiere:** 0.2
- **Ficheros:** `src/lib/affinity.ts`, `tests/unit/affinity.test.ts`.
- **Qué hacer:**
  - Módulo puro, sin DOM, según «Metodología de cálculo».
  - `scoreEntity(answers, positions)` → `{ points, max, answered, considered, coverage, percent | null }`.
  - `rankEntities(entities, answers, config, rng)` → `{ ranked, insufficient, lowAnswerCount }`.
    - Cada elemento lleva `lowCoverage`.
    - `rng` se inyecta para que los tests sean deterministas.
    - `insufficient` va barajado.
- **Aceptación (tests):**
  - Coincidencia total → 100; oposición total → 0; neutral frente a posicionado → 50.
  - Una saltada no altera el resultado. Si se saltan todas → `percent: null`, nunca NaN.
  - Peso doble: un caso calculado a mano en el que «importante» invierte el orden de dos partidos.
  - `sin_posicion` queda fuera solo para ese partido y la cobertura se calcula bien. Por debajo del 50 % el partido va a `insufficient`; por debajo del 75 % se marca `lowCoverage`.
  - Empate en el porcentaje redondeado: el orden depende del rng, no del orden de entrada.
  - Propiedad: el resultado siempre está entre 0 y 100 y no depende del orden de las afirmaciones.

### [x] 1.2 · Barajado y resolución de candidaturas
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 0.3
- **Ficheros:** `src/lib/shuffle.ts`, `src/lib/ballot.ts`, `src/lib/data.ts`, `tests/unit/shuffle.test.ts`, `tests/unit/ballot.test.ts`.
- **Qué hacer:**
  - `shuffle(arr, rng = cryptoRng)` con Fisher–Yates, sin mutar el array.
  - `data.ts` importa y parsea los JSON con los esquemas.
  - `getBallot(codigo | null)` → entidades `{ id, tipo, nombre, siglas, color, incluye, positions }`.
    - Cada posición lleva `origen: 'propia' | 'heredada'`.
    - Si `codigo` es `null`, devuelve solo los partidos estatales.
- **Aceptación (tests):**
  - En la provincia de X aparece la coalición A + X y no A suelta.
  - El override gana a la herencia.
  - Sin provincia → solo estatales.
  - Ceuta no incluye a D.
  - El barajado es una permutación, no muta la entrada y con un rng con semilla da un resultado reproducible.

### [x] 1.3 · Base visual, i18n y layout
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 0.1
- **Ficheros:** `src/styles/tokens.css`, `src/styles/base.css`, `src/i18n/es.json`, `src/i18n/index.ts`, `src/layouts/Base.astro`, `src/components/FictitiousBanner.astro`, `tests/unit/i18n.test.ts`.
- **Qué hacer:**
  - Tokens monocromos con contraste ≥ 4.5:1.
  - Foco visible de 3 px.
  - Fuentes del sistema, tamaño base ≥ 16 px y objetivos táctiles ≥ 48 px.
  - `t(key, params?)` con fallback a `es`; error en tests si falta la clave.
  - `<html lang>` según el idioma activo.
  - Cabecera con navegación (Inicio, Partidos, Metodología, Privacidad), pie y banner de datos ficticios si `meta.ficticio`.
- **Aceptación:**
  - Tests de i18n en verde: clave, interpolación y fallback.
  - A 320 y 375 px no hay scroll horizontal.
  - Navegación con Tab en orden lógico y con foco visible.

### [x] 1.4 · Inicio, página del cuestionario y selector de circunscripción
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.2, 1.3
- **Ficheros:** `src/pages/index.astro`, `src/pages/cuestionario.astro`, `src/components/Quiz.tsx` (máquina de pasos: provincia → afirmaciones → resultados → desglose), `src/components/ProvinceStep.tsx`.
- **Qué hacer:**
  - **Inicio:** qué es la herramienta, unos 5 minutos, anónima y sin recomendaciones, y un botón «Empezar».
  - **Selector:** `<select>` nativo con etiqueta y las 52 circunscripciones en orden alfabético, más la opción «Prefiero no indicarla», que limita los resultados a los partidos estatales.
  - **Estado:** solo en memoria.
- **Aceptación:**
  - Se puede continuar con o sin provincia.
  - No se escribe nada en cookies ni en almacenamiento (comprobarlo en DevTools).
  - Inicio sin JS de isla.

### [ ] 1.5 · Paso de afirmaciones
- **Modelo:** Sonnet · **Esfuerzo:** alto · **Requiere:** 1.4
- **Ficheros:** `src/components/StatementStep.tsx`, `src/components/AnswerBar.tsx`, `src/components/ProgressBar.tsx`, `src/components/Quiz.tsx`.
- **Qué hacer:**
  - Botones «De acuerdo / Neutral / En desacuerdo» anclados abajo (zona del pulgar, ≥ 48 px).
  - Encima, «Saltar» y el interruptor «Importante para mí» (`aria-pressed`).
  - «Anterior» y barra de progreso.
  - Explicación opcional en `<details>`.
  - Al cambiar de afirmación, el foco va al enunciado y una región `aria-live` anuncia «Afirmación N de 25».
  - Se conservan la respuesta y la marca de importante al volver atrás.
  - Aviso `beforeunload` si hay respuestas sin terminar.
- **Aceptación:**
  - A 375×812 se responde una afirmación de 250 caracteres sin hacer scroll.
  - El flujo completo funciona solo con teclado.
  - Volver atrás y cambiar una respuesta actualiza el estado.
  - Comprobación visual a 375, 768 y 1280 px.

### [ ] 1.6 · Pantalla de resultados
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.1, 1.5
- **Ficheros:** `src/components/ResultsStep.tsx`, `src/components/PartyBadge.tsx`.
- **Qué hacer:**
  - Ranking con `rankEntities`. Cada fila lleva:
    - Insignia (siglas + marca de color pequeña).
    - Nombre; en coaliciones, «incluye a …».
    - Porcentaje entero y barra de color neutro.
    - «Calculado sobre X de Y afirmaciones».
    - Aviso de cobertura baja si procede.
  - Bloque «No hay datos suficientes» y aviso de pocas respuestas.
  - Descargo «Esto no es una recomendación de voto».
  - Enlaces a desglose y metodología, y botón «Volver a empezar».
  - Ningún estilo especial para el primer puesto.
- **Aceptación:**
  - Con un juego de respuestas fijo (documentado en un test), los porcentajes mostrados coinciden con el cálculo a mano.
  - Los empates cambian de orden entre recargas.
  - Comprobación visual en los 3 tamaños.

### [ ] 1.7 · E2E del flujo con Playwright
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.6
- **Ficheros:** `playwright.config.ts`, `tests/e2e/flow.spec.ts`, `.github/workflows/ci.yml`.
- **Qué hacer:**
  - `webServer` con build + preview.
  - Proyectos: `mobile` 375×812, `tablet` 768×1024 y `desktop` 1280×800.
  - Job de e2e en CI con instalación de Chromium.
- **Aceptación:** `npm run test:e2e` pasa en los 3 proyectos con:
  - Flujo con provincia.
  - Flujo sin provincia (solo estatales).
  - Flujo con saltadas e importantes.

## Fase 2 — Transparencia (10–12 nov) · Hito: todas las funciones completas

### [ ] 2.1 · Desglose por afirmación con fuentes
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.6
- **Ficheros:** `src/components/BreakdownStep.tsx`, `src/components/SourceList.tsx`.
- **Qué hacer:** por cada afirmación (plegable con `<details>`):
  - El texto, tu respuesta («saltada» si procede) y la marca de importante.
  - Cada partido, en un orden barajado **una vez por visita** e igual en todas las afirmaciones, con:
    - Su posición, con texto e icono (no solo color).
    - La justificación.
    - Las fuentes, con tipo y enlace `target="_blank" rel="noopener noreferrer"` y el aviso para lectores de pantalla «(se abre en otra pestaña)».
    - En coaliciones, la marca «posición propia» o «heredada de …».
- **Aceptación:**
  - Todos los enlaces usan `https` y llevan `rel`.
  - Sin scroll horizontal a 320 px.
  - El orden cambia entre visitas (e2e: en 5 cargas aparecen al menos 2 órdenes distintos).

### [ ] 2.2 · Listado de partidos
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** 1.2, 1.3
- **Ficheros:** `src/pages/partidos.astro`, `src/components/PartyList.tsx`.
- **Qué hacer:**
  - Isla que baraja en el cliente, con selector opcional de circunscripción.
  - Por cada partido: insignia, nombre, ámbito, coaliciones y dónde se presenta.
  - Sin orden prerenderizado y con mensaje en `<noscript>`.
- **Aceptación:**
  - El orden cambia entre recargas.
  - Todas las tarjetas son idénticas en estilo.

### [ ] 2.3 · Página de metodología
- **Modelo:** Opus · **Esfuerzo:** medio · **Requiere:** 1.1
- **Ficheros:** `src/pages/metodologia.astro`, `src/i18n/es.json` o `src/content/es/metodologia.md`.
- **Qué hacer:**
  - Fórmula y tabla 3×3 de puntos.
  - Peso doble, saltadas, sin posición, umbrales (leídos de `meta`), empates y orden aleatorio.
  - Cómo se determinan las posiciones y qué tipos de fuente hay.
  - «Qué no es esta herramienta».
  - «Quiénes somos y correcciones» (contacto tomado de `meta`).
  - **Ejemplo resuelto, calculado en el build con `affinity.ts`** para que no pueda desfasarse.
  - Las partes que debe redactar el responsable del proyecto se marcan `[PENDIENTE]`.
- **Aceptación:**
  - La página no envía JS.
  - Los encabezados siguen una jerarquía correcta.
  - El ejemplo coincide con `affinity.ts`.
  - La sesión termina con la lista de `[PENDIENTE]`.

### [ ] 2.4 · Privacidad, CSP y test de privacidad
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.6
- **Ficheros:** `src/pages/privacidad.astro`, `astro.config.mjs`, `public/_headers`, `tests/e2e/privacy.spec.ts`.
- **Qué hacer:**
  - Borrador de privacidad marcado `[REVISIÓN LEGAL PENDIENTE]`:
    - No se recoge nada.
    - Cloudflare solo ve las peticiones de carga de la página.
    - Sin cookies.
    - Cómo puede comprobarlo cualquiera.
  - CSP `default-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`.
  - Usar la CSP nativa de Astro con hashes si la versión la trae; si no, eliminar los scripts en línea.
- **Aceptación (e2e):**
  - Durante el flujo completo hay 0 peticiones de red tras la carga inicial.
  - `document.cookie` está vacío y `localStorage`/`sessionStorage` tienen longitud 0.
  - La consola no muestra violaciones de CSP.

### [ ] 2.5 · Botón «atrás» del navegador (recortable)
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 1.5
- **Ficheros:** `src/components/Quiz.tsx`, `tests/e2e/flow.spec.ts`.
- **Qué hacer:**
  - Hash `#/afirmacion/N`, `#/resultados` y `#/desglose`, sin respuestas en la URL.
  - Si se recarga con hash pero sin estado → vuelve al inicio.
- **Aceptación:**
  - El «atrás» del navegador retrocede de paso.
  - La URL nunca contiene respuestas.

### [ ] 2.6 · Preparación multiidioma
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** 1.3, 2.3
- **Ficheros:** `src/i18n/index.ts`, `tests/unit/i18n.test.ts`, `docs/IDIOMAS.md`.
- **Qué hacer:**
  - Test que detecte texto visible codificado directamente en `src/components` (fuera de `es.json`).
  - Test con un locale falso que cae a `es`.
  - Guía paso a paso para añadir `ca`, `eu` y `gl`.
- **Aceptación:** los tests pasan y la guía se puede seguir sin contexto previo.

## Fase 3 — Calidad (13–16 nov) · Hito: criterios de calidad cumplidos + congelación de contenido

### [ ] 3.1 · Pruebas visuales
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 2.4
- **Ficheros:** `tests/e2e/visual.spec.ts`, capturas de referencia.
- **Qué hacer:**
  - Capturas de inicio, primera afirmación, resultados, desglose, partidos, metodología y privacidad en los 3 proyectos.
  - Aleatoriedad determinista con `page.addInitScript` sustituyendo `crypto.getRandomValues`.
- **Aceptación:** las capturas de referencia se suben al repo y `npm run test:e2e` es estable en 3 ejecuciones seguidas.

### [ ] 3.2 · Accesibilidad automática
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 2.4
- **Ficheros:** `tests/e2e/a11y.spec.ts` y los componentes que haya que corregir.
- **Qué hacer:** axe con las etiquetas `wcag2a, wcag2aa, wcag21a, wcag21aa` en cada página y en cada paso del cuestionario.
- **Aceptación:** 0 violaciones.

### [ ] 3.3 · Revisión manual de accesibilidad
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 3.2
- **Ficheros:** `docs/ACCESIBILIDAD.md` y las correcciones necesarias.
- **Qué hacer:**
  - Checklist: teclado, zoom al 200 %, reflow a 320 px, `prefers-reduced-motion`, color nunca como único portador de información, VoiceOver en iOS y TalkBack en Android.
  - Claude hace en el navegador las comprobaciones de teclado y reflow.
  - Las de lector de pantalla las hace el usuario.
- **Aceptación:** checklist rellenada y cada problema corregido o listado.

### [ ] 3.4 · Presupuesto de rendimiento
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** 2.4
- **Ficheros:** `scripts/check-size.ts`, `package.json` (script `size`), `.github/workflows/ci.yml`.
- **Qué hacer:** un script que falla si el JS gzip de una página supera 50 KB o si CSS + HTML de una página supera 40 KB. Se ejecuta en CI.
- **Aceptación:**
  - `npm run size` pasa.
  - Lighthouse móvil sobre la URL de vista previa: ≥ 95 en rendimiento y accesibilidad.

### [ ] 3.5 · Auditoría de neutralidad
- **Modelo:** Opus · **Esfuerzo:** medio · **Requiere:** 2.1, 2.2
- **Ficheros:** `docs/NEUTRALIDAD.md` y las correcciones necesarias.
- **Qué hacer:** revisar textos, estilos y órdenes contra las «Decisiones tomadas». En concreto:
  - Que toda lista de partidos pase por `shuffle` o por el ranking.
  - Que no haya estilos específicos por partido aparte de la marca de color.
  - Que no haya lenguaje de recomendación.
- **Aceptación:** checklist completada con evidencia (fichero y línea) y los problemas corregidos.

## Fase 4 — Contenido real y lanzamiento (17–20 nov)

**Plazos de contenido (los cumple el responsable del proyecto):**
- Candidaturas oficiales (BOE): antes del 9 nov.
- Texto final de las afirmaciones: antes del 11 nov.
- Posiciones y fuentes: antes del 16 nov (congelación de contenido).

### [ ] 4.1 · Integrar el contenido real
- **Modelo:** Sonnet · **Esfuerzo:** medio · **Requiere:** contenido entregado, 3.x
- **Ficheros:** `data/` (solo cambios estructurales) y capturas de referencia.
- **Qué hacer:**
  - Ejecutar la validación y corregir solo errores de formato o estructura.
  - **Nunca reescribir textos ni posiciones**: los problemas de contenido se listan para el responsable del proyecto.
  - Revisar que los textos más largos caben a 375 px.
  - Actualizar las capturas de referencia.
- **Aceptación:**
  - `npm run validate` sin errores.
  - e2e en verde.
  - Lista de incidencias de contenido entregada.

### [ ] 4.2 · Lanzamiento
- **Modelo:** Sonnet · **Esfuerzo:** bajo · **Requiere:** 4.1 y el visto bueno explícito del responsable del proyecto
- **Ficheros:** `data/meta.json` (`ficticio: false`), `docs/CORRECCIONES.md`.
- **Qué hacer:**
  - `DEPLOY_ENV=production npm run build` pasa.
  - Configurar el dominio.
  - Prueba rápida en producción: flujo completo, cabeceras con `curl -I` y test de privacidad contra la URL de producción.
  - `CORRECCIONES.md`: proceso para corregir contenido tras el lanzamiento (editar el JSON → PR → validación → despliegue).
- **Aceptación:** producción servida con las cabeceras correctas y sin banner de datos ficticios. Colchón: 19 nov. Lanzamiento: 20 nov.
