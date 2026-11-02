# Auditoría de neutralidad

Revisión del código, los textos y los estilos frente a las «Decisiones tomadas» de `PLAN.md` (neutralidad). Estado a 2 de noviembre de 2026, con los datos ficticios. Las comprobaciones que se pueden automatizar están en `tests/e2e/neutrality.spec.ts` y se ejecutan en CI.

## Resumen

| # | Comprobación | Estado |
|---|---|---|
| 1 | Toda lista de partidos pasa por `shuffle` o por el ranking | ✔ |
| 2 | El HTML prerenderizado no lleva un orden fijo de partidos | ✔ |
| 3 | Empates por porcentaje redondeado, en orden aleatorio | ✔ |
| 4 | Sin estilos por partido salvo la marca de color | ✔ |
| 5 | El primer puesto no se destaca | ✔ |
| 6 | Mismo componente, tamaño y tipografía para todos | ✔ |
| 7 | Interfaz monocroma; el color de partido nunca informa por sí solo | ✔ |
| 8 | Sin lenguaje de recomendación, voto útil, encuestas ni escaños | ✔ (corregido un texto) |
| 9 | Coaliciones: nombre real, «incluye a» y posición propia o heredada | ✔ |
| 10 | Sin provincia, solo partidos estatales | ✔ |

## 1. Listas de partidos: barajadas o por coincidencia

Cada sitio donde se muestra más de un partido:

| Lista | Orden | Evidencia |
|---|---|---|
| Ranking de resultados | Barajado y luego ordenado por porcentaje redondeado (ordenación estable) | `src/lib/affinity.ts:133` (`shuffle(entities, rng)`) y `:146` (`ranked.sort`) |
| «No hay datos suficientes» | Barajado (conserva el orden de `shuffle`) | `src/lib/affinity.ts:133` |
| Desglose (cada afirmación) | Barajado una vez por visita, igual en todas las afirmaciones | `src/components/Quiz.tsx:81` (`shuffle(ballot)`) |
| Listado de partidos | Barajado al cargar; el filtro conserva ese orden | `src/components/PartyList.tsx:38` y `:57` |

El barajado usa `crypto.getRandomValues` (`src/lib/shuffle.ts`). Lo comprueban los e2e «order changes between visits» (partidos), «party order is shuffled per visit» (desglose) y el unitario de empates (`tests/unit/affinity.test.ts`).

**Excepciones conscientes** (no son listas de candidaturas que se comparen entre sí):

- «Incluye a: Partido A y Partido Regional X» describe la composición de **una** candidatura en el orden de `data/coaliciones.json`, que debe ser el de su denominación oficial en la papeleta (`src/components/ResultsStep.tsx:59`). El responsable del proyecto debe mantener ese orden al cargar los datos reales.
- Las coaliciones de un partido en su tarjeta del listado (`src/components/PartyList.tsx:90`): normalmente una sola.
- Las dos «Candidaturas de ejemplo» de la metodología son genéricas, no partidos reales.

## 2. HTML prerenderizado

- `/partidos/` usa una isla `client:only` (`src/pages/partidos.astro:49`): el HTML no contiene tarjetas.
- `/cuestionario/` prerenderiza solo el paso de provincia; resultados y desglose se generan en el navegador.
- Los datos de partidos viajan en las props de la isla (un atributo con JSON) en el orden de `data/`, pero **no se renderizan** en ese orden: toda lista visible pasa por el punto 1.
- Comprobado por el e2e «no party is rendered in the prerendered HTML of any page».

## 3. Empates

- Se ordena por `Math.round(percent)`, el número que se ve (`src/lib/affinity.ts:141`), y los empates conservan el orden aleatorio previo.
- El ranking se calcula una vez por conjunto de respuestas (`src/components/Quiz.tsx:76`): un empate no cambia de orden al ir y volver del desglose, pero sí en cada visita.
- La metodología lo explica («Empates y orden aleatorio»).

## 4–6. Mismo tratamiento visual

- No hay ningún identificador, sigla ni color de partido en el código, los estilos ni los componentes (búsqueda de `partido-`, `coalicion-`, siglas y `#RRGGBB` en `src/`: solo aparece en comentarios de ejemplo de `src/data/validate.ts`).
- El único estilo que depende del partido es el fondo de la marca de color de la insignia (`src/components/PartyBadge.tsx:11`).
- Las filas de resultados usan el mismo componente y las mismas clases; no hay reglas `:first-child` ni clases para el primer puesto. La barra es del mismo gris para todos (`src/styles/quiz.css:240`).
- El e2e «the first place has exactly the same styles as the others» compara tipografía, colores, bordes y márgenes de insignia, nombre, porcentaje y barra de todas las filas: solo cambia la longitud de la barra.
- Las tarjetas del listado de partidos son idénticas (e2e «every card has the same structure and style»).

## 7. Monocromo

- Los tokens de color son grises y casi negro (`src/styles/tokens.css`).
- El e2e «the party colour appears only as the small mark next to the acronym» recorre todos los elementos de la pantalla de resultados y comprueba que el único con fondo de color (no gris) es `.party-badge__mark`.
- La marca de color siempre va junto a las siglas y el nombre; no transmite información por sí sola (ver `docs/ACCESIBILIDAD.md`).

## 8. Lenguaje

Revisados todos los textos de `src/i18n/es.json`. Búsqueda de «recomend», «deberías», «tu partido», «mejor», «ganador», «voto útil», «estratégico», «ideal», «te conviene», «te representa», «más afín», «elige a», «vota a»: solo aparecen en frases que **niegan** la recomendación («Esto no es una recomendación de voto», «No tiene en cuenta el voto útil ni el estratégico»).

- Los resultados se llaman «coincidencia», no «afinidad con tu partido» ni «tu candidatura».
- No se muestran encuestas, escaños, intención de voto ni probabilidades en ninguna parte.

**Corregido:** el pie de todas las páginas decía «Herramienta independiente de orientación». La independencia es una afirmación que aún no está respaldada (la sección «Quiénes somos» de la metodología está `[PENDIENTE]`), así que se ha quitado: ahora dice «Herramienta de orientación». El responsable del proyecto puede volver a ponerla cuando se publique quién está detrás y cómo se financia.

## 9. Coaliciones

- Nombre de la coalición tal como aparece en la papeleta y debajo «Incluye a: …» (`src/components/ResultsStep.tsx:59`).
- En el desglose, cada posición de una coalición indica «Posición propia de la coalición» o «Posición heredada de …» (`src/components/BreakdownStep.tsx:82`).
- La resolución (override de la coalición > partido de referencia) está en `src/lib/ballot.ts` y cubierta por `tests/unit/ballot.test.ts`.

## 10. Sin provincia

`getBallot(null)` devuelve solo los partidos con `ambito: "estatal"` (`src/lib/ballot.ts:89`), y los resultados lo dicen («Partidos que se presentan en toda España (no indicaste circunscripción)»).

## Puntos para el responsable del proyecto

1. **Orden de `incluye` en `data/coaliciones.json`:** debe seguir la denominación oficial de cada coalición.
2. **«Independiente»:** volver a usar la palabra solo cuando «Quiénes somos» esté publicado y lo respalde.
3. **Colores de los partidos reales:** solo se usan en la marca de 0,75 rem; conviene usar colores reconocibles, ya que no hay otro elemento cromático.
4. **Orden de las afirmaciones y de los botones de respuesta:** es fijo e igual para todo el mundo («De acuerdo / Neutral / En desacuerdo», a01 → a25). No favorece a ningún partido, pero el orden de las afirmaciones lo decide quien redacta el cuestionario.
