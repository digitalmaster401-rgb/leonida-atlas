# DEPLOY — Publicar LEONIDA ATLAS

Hosting elegido: **Netlify** (gratis, HTTPS automático, se configura 100 % desde el navegador del celular). El repositorio ya trae `netlify.toml`, reglas SPA (`public/_redirects`), cabeceras de seguridad (`public/_headers`) y páginas prerenderizadas por ruta, así que cualquier enlace de ficha abre directo y sin 404.

> Estado: **no publicado todavía.** Este entorno no tiene una cuenta de hosting autorizada, así que no existe URL pública. No compartas ninguna URL hasta completar el paso 1.

## Paso único que requiere tu cuenta (desde Android)

1. Abre **https://app.netlify.com/signup** en Chrome del celular e inicia sesión con **GitHub**.
2. Toca **Add new site → Import an existing project → GitHub** y autoriza el acceso al repositorio `leonida-atlas`.
3. Elige la rama que contiene el código (`main` cuando se fusione el pull request; mientras tanto, la rama de trabajo `ccr-fb7ab394-lollmi`).
4. No cambies nada: Netlify lee `netlify.toml` (`npm ci && npm run build`, carpeta `dist`, Node 22). Toca **Deploy**.
5. Al terminar (2–3 min) te da una URL `https://<nombre>.netlify.app`. En **Site configuration → Change site name** puedes ponerle, por ejemplo, `leonida-atlas` (si está libre).

Netlify inyecta la variable `URL` durante el build; el script de prerender la usa para `og:url`, `canonical`, `sitemap.xml` y la imagen de vista previa absoluta (necesaria para WhatsApp). No hay que configurarla a mano.

### Comprobación después de publicar (2 minutos, desde el celular)

- Abre `https://<tu-sitio>/armas/duke-556` directamente: debe abrir la ficha, no un error.
- Pega el enlace en un chat de WhatsApp contigo mismo: debe salir la tarjeta con el logo de LEONIDA ATLAS y el título «Duke 556 · LEONIDA ATLAS».
- En Chrome: menú ⋮ → **Instalar app** / **Agregar a pantalla principal**.
- Activa modo avión después de abrirla una vez: la app sigue funcionando con lo ya visitado.

## Alternativas

**Cloudflare Pages** (también gratis): dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → repositorio → Framework preset *None*, Build command `npm run build`, Output `dist`, variable `NODE_VERSION=22`. `public/_redirects` y `public/_headers` funcionan igual. Cloudflare expone `CF_PAGES_URL`, que el prerender también usa.

**Netlify Drop (sin conectar GitHub):** descarga `leonida-atlas-v1.0.0-sitio.zip`, descomprímelo y arrastra la carpeta a https://app.netlify.com/drop (más cómodo desde una computadora). Ese ZIP se generó sin `SITE_URL`, así que la vista previa de WhatsApp funciona mejor con el método de GitHub; si usas Drop, reconstruye con `SITE_URL=https://tu-sitio.netlify.app npm run build`.

**Vercel:** `vercel.json` incluido (Framework *Other*, build `npm run build`, output `dist`).

## Comandos (computadora o CI)

```bash
npm ci
npm run lint && npm run typecheck && npm run test   # calidad
npm run build                                        # valida datos + compila + prerender (dist/)
npm run test:e2e                                     # Playwright contra dist/ servido como en producción
SITE_URL=https://tu-sitio.netlify.app npm run build  # build con URLs absolutas para OG y sitemap
npm run zip                                          # genera release/*.zip
```

Publicar desde la terminal con la CLI de Netlify (requiere tu token, no incluido): `npx netlify-cli deploy --prod --dir=dist`.

## Actualizar el contenido

1. Edita `content/entries.json` (o usa `/editor` para validar y previsualizar en tu teléfono, luego descarga el JSON).
2. Haz commit en GitHub (desde la app de GitHub o github.com también se puede editar el archivo).
3. Netlify vuelve a desplegar solo. Si el contenido no pasa la validación, el build falla y el sitio anterior sigue en línea.
4. Los usuarios ven el aviso «Hay una versión nueva» y tocan **Actualizar**.

## Reportes de errores

El botón «Reportar un error» abre un issue prellenado en `https://github.com/digitalmaster401-rgb/leonida-atlas/issues/new`. Funciona para cualquiera **solo si el repositorio es público** y tiene Issues activados. Si el repositorio es privado, define otra dirección con la variable de entorno `VITE_REPORT_URL` en Netlify (por ejemplo, un formulario propio) y vuelve a desplegar. El botón «Compartir reporte» funciona siempre (comparte el texto por WhatsApp u otra app).
