# Añadir un idioma (catalán, euskera, gallego)

Guía para añadir `ca`, `eu` o `gl` a Orientavoto. Hoy solo existe el castellano (`es`), pero el proyecto ya está preparado: los textos de la interfaz están en un catálogo JSON, los textos de contenido son mapas `{ "es": "…" }` y todo lo que falte en un idioma se muestra en castellano.

Los ejemplos usan el catalán (`ca`). Para euskera y gallego es igual cambiando el código.

## Antes de empezar

- Haz cada idioma en una rama y un pull request propios.
- Necesitas Node 24 y el proyecto instalado (`npm install`).
- Al final de cada paso puedes comprobar que nada se ha roto con `npm run check` y `npm run test:e2e`.

## 1. Traducir los textos de la interfaz

1. Copia `src/i18n/es.json` a `src/i18n/ca.json`.
2. Traduce **solo los valores**. Las claves (lo que va antes de los dos puntos) no se tocan.
   ```json
   "nav": {
     "inicio": "Inici",
     "partidos": "Partits"
   }
   ```
3. Respeta los marcadores entre llaves, como `{numero}` o `{provincia}`: se sustituyen por valores al mostrarse. Puedes moverlos de sitio dentro de la frase, pero no cambiarles el nombre.
4. Respeta el espacio no separable antes de `%` (`75 %`): evita que el número y el símbolo queden en líneas distintas.
5. Si dejas una clave sin traducir (o la borras), se mostrará en castellano. Así puedes publicar una traducción parcial.

## 2. Registrar el catálogo

En `src/i18n/index.ts`, importa el fichero y añádelo a `catalogs`:

```ts
import es from './es.json';
import ca from './ca.json';

export const catalogs: Readonly<Record<string, Catalog>> = { es, ca };
```

El test `catalogs › ca only has keys that exist in es` falla si el catálogo tiene alguna clave que no existe en `es.json` (por ejemplo, una errata en una clave).

## 3. Activar el idioma en Astro

En `astro.config.mjs`, añade el código a `i18n.locales`:

```js
i18n: {
  defaultLocale: 'es',
  locales: ['es', 'ca'],
  routing: { prefixDefaultLocale: false },
},
```

El castellano sigue en la raíz (`/metodologia/`) y el catalán va bajo `/ca/` (`/ca/metodologia/`). El test `every locale in the catalogs is in astro.config.mjs` comprueba que no se te olvide este paso.

## 4. Crear las rutas del idioma

Astro necesita un fichero por página y por idioma. No hace falta duplicar las páginas: basta un envoltorio que importe la página en castellano. La página detecta el idioma por la URL (`Astro.currentLocale`), así que pone `<html lang="ca">` y usa el catálogo catalán.

Crea `src/pages/ca/` con estos cinco ficheros:

`src/pages/ca/index.astro`
```astro
---
import Page from '../index.astro';
---

<Page />
```

Y lo mismo para `cuestionario.astro`, `partidos.astro`, `metodologia.astro` y `privacidad.astro`, cambiando el `import` (`'../cuestionario.astro'`, etc.).

## 5. Enlaces del menú y selector de idioma

Los enlaces del menú (`src/layouts/Base.astro`) apuntan hoy a rutas sin idioma (`/partidos/`). Con más de un idioma hay que generarlos con el idioma actual, usando la función de Astro:

```ts
import { getRelativeLocaleUrl } from 'astro:i18n';

const href = getRelativeLocaleUrl(locale, 'partidos/');   // → /ca/partidos/
```

Haz lo mismo con los enlaces internos de las páginas («Empezar» en la portada y «Cómo se calcula» en los resultados).

Añade también un selector de idioma en la cabecera: una lista de enlaces a la misma página en cada idioma (`getRelativeLocaleUrl(otroIdioma, rutaActual)`), con el nombre de cada idioma escrito en ese idioma («Català», «Euskara», «Galego») y el atributo `lang` correspondiente en cada enlace. Sus textos van en los catálogos, como todo lo demás.

## 6. Traducir el contenido (afirmaciones, partidos, posiciones)

El contenido de `data/` usa mapas `{ "es": "…" }`. Para traducirlo:

1. En `src/data/schema.ts`, añade el idioma como opcional al mapa de texto localizado:
   ```ts
   export const localizedTextSchema = z.strictObject({
     es: nonEmptyString,
     ca: nonEmptyString.optional(),
   });
   ```
   Haz lo mismo en `localizedOptionalTextSchema` (justificaciones) y ejecuta `npm run schemas` para regenerar el autocompletado.
2. En las páginas, sustituye las lecturas directas de `.es` por `localize(texto, locale)` (en `src/i18n/index.ts`), que usa el idioma si existe y el castellano si no:
   ```ts
   nombre: localize(p.nombre, locale),   // antes: p.nombre.es
   ```
   Para encontrar todos los sitios: `grep -rn "\.es\b" src/pages src/layouts src/components`.
3. Añade las traducciones en los JSON de `data/`, al lado del castellano:
   ```json
   "texto": { "es": "Afirmación…", "ca": "Afirmació…" }
   ```

**Importante:** las traducciones del contenido político las revisa el responsable del proyecto igual que el texto original. Una afirmación mal traducida cambia lo que se pregunta.

## 7. Comprobar

1. `npm run check`: lint, tipos, validación de datos y tests unitarios. El test «no hard-coded visible text» falla si algún componente tiene texto escrito directamente en vez de usar el catálogo.
2. `npm run test:e2e`.
3. `npm run dev` y abre `http://localhost:4321/ca/`. Recorre el cuestionario entero y comprueba:
   - El navegador muestra `lang="ca"` en `<html>` (herramientas de desarrollo → Elementos).
   - No queda texto en castellano salvo lo que hayas dejado sin traducir a propósito.
   - Los textos más largos caben a 320 y 375 px de ancho sin scroll horizontal (el catalán, el euskera y el gallego pueden ser más largos que el castellano).
4. Abre un pull request. El CI ejecuta todas las comprobaciones.
