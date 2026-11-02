# Revisión de accesibilidad

Objetivo: WCAG 2.1 nivel AA. Esta revisión completa las comprobaciones automáticas (axe en `tests/e2e/a11y.spec.ts`, 0 violaciones) con las que una herramienta no puede hacer sola.

Estado a 2 de noviembre de 2026, con los datos ficticios.

| Comprobación | Quién | Estado |
|---|---|---|
| Teclado | Claude (automatizado) | ✔ Correcto |
| Zoom al 200 % | Claude | ✔ Corregido un problema |
| Reflow a 320 px | Claude (automatizado) | ✔ Correcto |
| `prefers-reduced-motion` | Claude | ✔ Correcto |
| El color nunca es el único portador de información | Claude | ✔ Correcto |
| VoiceOver en iOS | Responsable del proyecto | ☐ **Pendiente** |
| TalkBack en Android | Responsable del proyecto | ☐ **Pendiente** |

## Teclado

Cubierto por el test e2e «keyboard only» en los tres tamaños, que recorre el cuestionario completo **solo con el teclado** y comprueba en cada control que el foco se ve (contorno de 3 px):

- Enlace «Saltar al contenido»: es lo primero al pulsar Tab, se ve al recibir el foco y lleva el foco a `<main>`.
- Selector de circunscripción (se elige escribiendo el nombre o con las flechas), «Continuar».
- En cada afirmación: «Más información» (Intro), «Importante para mí» (Espacio), «Saltar» y las tres respuestas (Intro). Al cambiar de afirmación el foco va al enunciado.
- Resultados: «Ver el desglose», «Cómo se calcula», «Volver a empezar».
- Desglose: cada afirmación se abre con Intro y los enlaces de las fuentes reciben el foco.
- El orden de tabulación sigue el orden visual: cabecera → contenido → barra de respuestas → pie.
- No hay trampas de foco ni atajos de teclado que interfieran con los del lector de pantalla.

**Corregido:** `<main>` no podía recibir el foco, así que en Safari (y con VoiceOver) el enlace «Saltar al contenido» desplazaba la vista pero no el foco. Ahora `<main>` tiene `tabindex="-1"` (sin contorno, porque no es un control).

## Zoom al 200 %

Un portátil de 1280 × 800 con zoom al 200 % equivale a una ventana de 640 × 400 px.

**Problema encontrado y corregido:** la barra de respuestas, fija abajo, ocupaba un tercio de la pantalla (129 de 400 px) y tapaba el final de las afirmaciones largas. Ahora, con menos de 500 px de alto (zoom alto o móvil en horizontal), la barra pasa al flujo normal justo debajo del enunciado. El test «200 % zoom (640×400)» lo comprueba con la afirmación más larga.

El resto de páginas se adaptan sin pérdida de contenido ni scroll horizontal.

## Reflow a 320 px

Equivale a 1280 px con zoom al 400 %. El test «reflow at 320 px» comprueba que ninguna página tiene scroll horizontal; el desglose se comprueba además con todas las afirmaciones abiertas. Las dos tablas del ejemplo de la metodología pueden desplazarse dentro de su propio recuadro a 320 px, algo que WCAG permite para tablas de datos; la página en sí no se desplaza en horizontal.

## Movimiento reducido

La interfaz no tiene animaciones ni transiciones. `base.css` incluye igualmente una regla `prefers-reduced-motion: reduce` que las anula, por si se añaden en el futuro.

## El color nunca es el único portador de información

- La marca de color de cada partido es decorativa: siempre va junto a sus siglas y su nombre.
- Las barras de coincidencia son del mismo gris para todos; el dato está en el porcentaje escrito.
- La respuesta elegida se marca con relleno, ✓ y `aria-pressed`; «Importante para mí», con ★ y `aria-pressed`.
- Las posiciones del desglose llevan icono (✓ = ✗ ?) y texto.
- Los avisos y errores llevan texto y una barra lateral gruesa.
- Los enlaces van subrayados y la página actual del menú, subrayada y en negrita.
- Contraste: texto ≥ 6,3:1 y bordes de controles 4,5:1 (`src/styles/tokens.css`).

## Lectores de pantalla (pendiente)

Lo hace el responsable del proyecto en dispositivos reales, con la URL de vista previa de Cloudflare (o `npm run build && npm run preview -- --host` y la IP del ordenador en la misma red Wi-Fi). Cada comprobación lleva lo que debería oírse; si algo no coincide, anótalo debajo con el dispositivo y la versión del sistema.

### VoiceOver (iPhone)

Activar: Ajustes → Accesibilidad → VoiceOver. Deslizar a la derecha = siguiente elemento; doble toque = activar; rotor (girar dos dedos) → «Encabezados» para saltar entre encabezados.

- [ ] Portada: se anuncia el banner «Datos ficticios…», el menú «Principal» y el encabezado «Compara tus opiniones con las candidaturas».
- [ ] Cuestionario: el selector se anuncia como «Circunscripción (provincia)» con su ayuda; elegir «Continuar» sin opción anuncia el error.
- [ ] Al continuar, VoiceOver lee el enunciado de la afirmación 1 y anuncia «Afirmación 1 de 25».
- [ ] «Importante para mí» se anuncia como botón y su estado («seleccionado» / «no seleccionado») cambia al activarlo.
- [ ] Las tres respuestas se encuentran rápido desde el enunciado; al volver con «Anterior», la elegida se anuncia como seleccionada.
- [ ] Resultados: con el rotor de encabezados se recorren las candidaturas; cada una se lee con su porcentaje «de coincidencia» y «Calculado sobre X de Y afirmaciones».
- [ ] Desglose: cada afirmación se anuncia como contraída/expandida; dentro, cada partido con su posición y los enlaces de fuentes «se abre en otra pestaña».
- [ ] Partidos: tras cambiar el filtro se anuncia el número de partidos.

Notas:

### TalkBack (Android)

Activar: Ajustes → Accesibilidad → TalkBack. Deslizar a la derecha = siguiente; doble toque = activar; deslizar arriba y abajo cambia la navegación a «Encabezados».

- [ ] Las mismas comprobaciones de la lista de VoiceOver.
- [ ] El selector nativo de circunscripción se abre y se puede elegir provincia con TalkBack.
- [ ] La barra de respuestas fija no tapa el elemento que TalkBack está leyendo (si lo tapa, anotar en qué pantalla).

Notas:
