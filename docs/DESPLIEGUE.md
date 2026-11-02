# Despliegue

Guía para publicar Orientavoto en **Cloudflare Pages** desde un repositorio de **GitHub**. Los pasos son manuales y se hacen una sola vez. No hace falta saber nada del proyecto para seguirlos.

Resultado final:
- Cada push a `main` publica la web en producción.
- Cada push a otra rama genera una vista previa con su propia URL.
- GitHub Actions comprueba cada push y cada pull request (lint, tipos, validación de datos, tests y build).
- El build de producción **falla a propósito** mientras `data/meta.json` tenga `"ficticio": true`. Así no se pueden publicar datos de ejemplo por error.

## Requisitos

- Una cuenta de GitHub.
- Una cuenta de Cloudflare (el plan gratuito basta).
- Git instalado y el proyecto en tu ordenador.

## 1. Crear el repositorio en GitHub y subir el código

1. Entra en <https://github.com/new>.
2. Nombre: el que quieras (p. ej. `orientavoto`). Visibilidad: pública o privada.
3. **No** marques «Add a README», «.gitignore» ni licencia: el repositorio debe crearse vacío.
4. Pulsa **Create repository**.
5. En una terminal, desde la carpeta del proyecto, ejecuta (cambia `TU-USUARIO` y el nombre del repositorio):

   ```bash
   git remote add origin https://github.com/TU-USUARIO/orientavoto.git
   git push -u origin main
   ```

6. En GitHub, abre la pestaña **Actions** del repositorio. Debe aparecer el flujo **CI** en marcha y terminar en verde (✔) en unos minutos. Si sale en rojo, abre la ejecución para ver qué paso falló.

## 2. Conectar el repositorio a Cloudflare Pages

1. Entra en el panel de Cloudflare: <https://dash.cloudflare.com>.
2. En el menú lateral, ve a **Workers y Pages** → **Crear** → pestaña **Pages** → **Conectar con Git**.
   - Si Cloudflare te ofrece crear un *Worker* en lugar de una *Pages*, busca la opción de importar un proyecto de Pages; esta guía usa Pages.
3. Autoriza a Cloudflare a acceder a GitHub y elige el repositorio que acabas de crear.
4. Configuración del build:

   | Campo | Valor |
   |---|---|
   | Rama de producción | `main` |
   | Framework preset | `Astro` (o «Ninguno»: lo importante son los dos campos siguientes) |
   | Comando de build | `npm run build` |
   | Directorio de salida | `dist` |

5. Despliega **Variables de entorno (avanzado)** y añade, para que se use Node 24:

   | Nombre | Valor |
   |---|---|
   | `NODE_VERSION` | `24` |

   (Cloudflare también lee el fichero `.nvmrc` del repositorio, que ya dice `24`; la variable lo deja explícito.)

6. **No** añadas aquí `DEPLOY_ENV`: esta pantalla aplica las variables a todos los entornos. Se añade en el paso siguiente, solo para producción.
7. Pulsa **Guardar e implementar**. El primer despliegue debe terminar bien y la web mostrará el banner de **datos ficticios** (cuando exista; llega en la tarea 1.3).

## 3. Definir `DEPLOY_ENV=production` solo en producción

Esta variable activa la guardia que impide publicar datos ficticios. Debe existir **solo** en el entorno *Production*, nunca en *Preview*, para que las vistas previas de las ramas sigan funcionando con datos de ejemplo.

1. En el proyecto de Pages, ve a **Configuración** → **Variables y secretos** (o **Variables de entorno**).
2. Elige el entorno **Producción** y añade:

   | Nombre | Valor | Tipo |
   |---|---|---|
   | `DEPLOY_ENV` | `production` | Texto (no secreto) |
   | `NODE_VERSION` | `24` | Texto (si no estaba ya) |

3. Comprueba que el entorno **Vista previa** tiene `NODE_VERSION = 24` y **no** tiene `DEPLOY_ENV`.
4. Guarda.

> **Importante:** a partir de este momento, mientras `data/meta.json` tenga `"ficticio": true`, **los despliegues de producción fallarán** con el mensaje
> `data/meta.json › ficticio: los datos son FICTICIOS y no se pueden publicar en producción`.
> Es el comportamiento esperado. La web anterior sigue publicada; el despliegue fallido no la sustituye. Las vistas previas de otras ramas sí se publican.

Para comprobarlo en tu ordenador sin desplegar:

```bash
npm run build:prod
```

## 4. No activar la analítica

La herramienta promete no recoger ningún dato. Cloudflare ofrece analítica que añade un script a la página, y eso rompe esa promesa (y, más adelante, la CSP).

1. En el proyecto de Pages, ve a **Métricas** (o **Analytics**) y comprueba que **Web Analytics** está **desactivado**. Si aparece un botón «Habilitar», **no lo pulses**.
2. En el panel general de la cuenta, en **Analytics y registros** → **Web Analytics**, comprueba que no hay ningún sitio de este proyecto con la inyección automática activa.
3. Si más adelante conectas un dominio propio gestionado por Cloudflare, revisa en ese dominio que tampoco esté activa la inyección automática (*automatic setup*) de Web Analytics.

## 5. Comprobar las cabeceras

Tras el primer despliegue correcto, abre una terminal y ejecuta (con la URL que te dio Cloudflare, del tipo `https://orientavoto.pages.dev`):

```bash
curl -sI https://orientavoto.pages.dev | grep -iE 'content-security-policy|referrer-policy|x-content-type-options|x-frame-options|permissions-policy'
```

Deben aparecer las cinco cabeceras:

```
content-security-policy: connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
referrer-policy: no-referrer
x-content-type-options: nosniff
x-frame-options: DENY
permissions-policy: accelerometer=(), …
```

Salen del fichero `public/_headers`, que el build copia a `dist/_headers`. Además, cada página lleva en su HTML una etiqueta `<meta http-equiv="content-security-policy">` con el resto de la política (`default-src 'self'` y las huellas de sus scripts y estilos), que genera Astro.

## 6. Publicar con datos reales (tarea 4.2)

Solo cuando el responsable del proyecto dé el visto bueno:

1. Cambiar `"ficticio": false` en `data/meta.json`.
2. Comprobar en local que `npm run build:prod` termina bien.
3. Hacer commit y push a `main`. Cloudflare despliega producción.

El dominio propio y la prueba final en producción se describen en la tarea 4.2 de `PLAN.md`.

## Resolución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El despliegue de producción falla con «datos FICTICIOS» | `DEPLOY_ENV=production` y `ficticio: true` | Esperado hasta el lanzamiento. Usa las vistas previas. |
| Una vista previa falla con «datos FICTICIOS» | `DEPLOY_ENV` definida también en *Preview* | Bórrala del entorno *Vista previa* (paso 3). |
| Error de versión de Node o de sintaxis al instalar | Cloudflare usa un Node antiguo | Comprueba `NODE_VERSION = 24` en ambos entornos. |
| Faltan las cabeceras en `curl -I` | `_headers` no llegó a `dist/` | Ejecuta `npm run build` en local y comprueba que existe `dist/_headers`. |
| El CI de GitHub falla en `npm ci` | `package-lock.json` desactualizado | Ejecuta `npm install` en local y sube el `package-lock.json`. |
