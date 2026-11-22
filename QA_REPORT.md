# QA REPORT — LEONIDA ATLAS v1.0.0

**Fecha:** 22 de noviembre de 2026 · **Entorno:** contenedor Linux, Node 22.23, Chromium 1243 (Playwright 1.63), servidor `scripts/serve-dist.mjs` que imita Netlify (archivos → carpeta/index.html → SPA, cabeceras de `public/_headers`, gzip).

## 1. Resumen

| Comprobación | Resultado |
|---|---|
| `npm ci` | ✅ sin errores |
| `npm run lint` (ESLint + typescript-eslint + react-hooks) | ✅ 0 problemas |
| `npm run typecheck` (tsc -b, modo estricto) | ✅ 0 errores |
| `npm run test` (Vitest) | ✅ 34/34 en 6 archivos |
| `npm run build` (valida datos → tsc → Vite → prerender) | ✅ 95 páginas prerenderizadas, SW con 23 recursos precacheados |
| `npm run test:e2e` (Playwright) | ✅ 86 pasaron, 0 fallaron, 0 inestables; 34 omitidos a propósito (pruebas que solo corren en un ancho) |
| Accesibilidad automática (axe, WCAG 2.0/2.1 A y AA) | ✅ 0 violaciones serias o críticas en 8 páginas × 2 anchos |
| Auditoría de material ajeno (`npm run audit:legacy`) | ✅ 0 coincidencias en 473 archivos, incluido `dist/` (ver `qa/audit-legacy.txt`) |
| Enlaces internos y imágenes | ✅ 0 enlaces rotos (más de 60 rutas internas rastreadas), 0 imágenes rotas, 0 errores de consola, 0 respuestas HTTP ≥ 400 |
| Publicación en hosting real | ⛔ **No realizada**: no hay cuenta de hosting autorizada en este entorno. Ver DEPLOY.md |

## 2. Matriz de Playwright

| Proyecto | Viewport / dispositivo | Pasaron | Omitidos |
|---|---|---|---|
| chromium-360 | 360×800, táctil | 11 | 6 |
| chromium-390 | 390×800, táctil | 12 | 5 |
| chromium-768 | 768×900, táctil | 11 | 6 |
| chromium-1280 | 1280×900 | 17 | 0 |
| chromium-1920 | 1920×900 | 12 | 5 |
| android-pixel-7 | Pixel 7 (Chrome Android) | 11 | 6 |
| iphone-14-emulado | iPhone 14 (UA, viewport, táctil) **sobre Chromium** | 11 | 6 |
| offline-pwa | Pixel 7 con service worker activo | 1 | 0 |

Pruebas en cada viewport: portada sin errores ni desbordamiento horizontal · navegación por las 12 secciones (barra inferior o menú en móvil, barra lateral en escritorio) · buscador con errores leves y sinónimos («moises» → Moses, «vehiculo grotti») y estado vacío · filtros combinables reflejados en la URL y orden por pago · enlace directo a ficha (200 + `<title>` y `og:image` prerenderizados) y 404 controlado · guardar, completar y notas que sobreviven a la recarga, exportar JSON, borrar, importar (reemplazo) y rechazo de archivo inválido · compartir con Web Share API (URL profunda correcta) y alternativa de copiar · visor de galería con zoom, siguiente y cierre con Escape · mapa: zoom con botones y teclado, selección de punto, panel con precisión, enlace mapa → ficha → mapa (`/mapa?id=`) · calculadora (bruto − costos = neto, etiqueta de estimación, fórmulas) y pestañas Online/Glitches con estados vacíos explicativos · protección de spoilers persistente.

Solo en 1280 px: las 80 fichas responden 200 con su título; rastreo de enlaces e imágenes; archivos PWA (manifest, sw, iconos, OG); cabeceras CSP y nosniff. Solo en 390 y 1280: axe. Solo en escritorio: enlace «Saltar al contenido» con foco visible.

**Sin conexión:** tras la primera visita, con la red cortada (`context.setOffline(true)`) se recarga la ficha, se mantiene el favorito, se navega a otra página y aparece el aviso «Sin conexión».

## 3. Lighthouse (móvil, medido)

Lighthouse 12, perfil móvil por defecto (Moto G simulado, 4G lenta con *throttling* simulado), Chromium sin interfaz, contra el servidor local tipo producción. Reportes JSON en `qa/lighthouse/`.

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | 94 | 99 | 100 | 100 | 1.7 s | 2.9 s | 60 ms | 0 |
| `/dinero` | 88 | 100 | 100 | 100 | 1.7 s | 3.7 s | 70 ms | 0 |
| `/mapa` | 91 | 96 | 100 | 100 | 1.7 s | 3.4 s | 20 ms | 0 |
| `/armas/duke-556` | 96 | 99 | 100 | 100 | 1.7 s | 2.5 s | 110 ms | 0 |
| `/mi-partida` | 97 | 100 | 100 | 100 | 1.7 s | 2.4 s | 30 ms | 0 |

Correcciones hechas a partir de las mediciones: CLS de 0.149 a **0** en la portada (precarga de fuentes y alto fijo del hero) · código del editor y Zod fuera del paquete principal (de 528 kB a 432 kB sin comprimir) · orden de encabezados. **Principal cuello de botella restante:** el contenido se dibuja en el cliente, así que el LCP de `/dinero` (texto) depende de ejecutar el JS (~116 kB gzip con las 80 fichas incluidas). Siguiente mejora posible: SSR/hidratación del HTML prerenderizado. Aviso menor en `/mapa`: con el mapa completo en pantalla, algunos pines quedan cerca entre sí (auditoría *target-size*); al acercar se separan.

## 4. Accesibilidad (manual y automática)

- Navegación por teclado: enlace para saltar al contenido, foco visible (contorno lima de 3 px), mapa operable con flechas, `+`, `−` y `0`, pines activables con Enter, visor con flechas y Escape.
- Etiquetas en todos los campos y filtros; botones de icono con nombre accesible; `aria-pressed` en favoritos, completado, chips y pines; `aria-live` en resultados y avisos.
- `alt` descriptivo en español en cada imagen (traducido del alt oficial de Rockstar o redactado tras ver la imagen); ilustraciones con `role="img"` y rótulo visible «Ilustración editorial».
- Objetivos táctiles de al menos 44 px (pines del mapa de al menos 26 px en la vista completa). Contraste AA verificado por axe. Se respeta `prefers-reduced-motion`.

## 5. Imágenes y derechos

- 55 archivos oficiales (54 capturas y el mapa), cada uno con URL de origen en `www.rockstargames.com`, página oficial, tamaño original, tratamiento (solo redimensionado WebP) y copyright en `public/media/media-manifest.json`. Una prueba verifica que todos los archivos existen y vienen de rockstargames.com.
- Revisión visual de las 55 en una hoja de contactos: ninguna tiene marca de agua, logotipo de creador ni *overlay*. Se corrigieron 6 pies de foto que no correspondían a lo que se ve.
- Ninguna imagen se presenta como prueba de una ubicación exacta: los pines usan el mapa oficial; las fotos de región son de las secciones de esa región en «Only in Leonida».
- Portada, logo, iconos, imagen OG e ilustraciones son obra propia (SVG generado).

## 6. Capturas de navegador (originales de las pruebas)

`qa/screenshots/<proyecto>/` → `01-inicio`, `02-busqueda`, `03-mapa`, `04-visor`, `05-mi-partida` (WebP) para los 7 proyectos con viewport, y `qa/screenshots/offline-pwa-sin-conexion.webp`. Playwright las genera en PNG; para ahorrar espacio se convirtieron a WebP sin cambiar su contenido.

## 7. Limitaciones reales (no marcadas como completadas)

1. **Sin URL pública**: falta conectar Netlify con la cuenta del propietario (DEPLOY.md, paso único). La vista previa en WhatsApp con el hosting real y la prueba en un teléfono físico **no se han hecho**. Sí se verificó que, con `SITE_URL`, cada página trae `og:image` absoluta, `og:url` y `canonical`.
2. **WebKit real no probado**: el entorno solo tiene Chromium y no se permite instalar otros navegadores. El «iPhone» es una emulación sobre Chromium (viewport, UA, táctil); el comportamiento de Safari no está verificado.
3. **Ningún dato está «comprobado» en una partida**: no hubo acceso al juego. Los datos son oficiales, contrastados (dos guías) o reportados (una guía), y así se etiquetan.
4. **Política de contenido de fans de Rockstar**: la página de soporte respondió HTTP 503 el 22-nov-2026; el resumen viene del índice público de esa URL. Conviene volver a revisarla.
5. **Reporte de errores**: el enlace a GitHub Issues solo sirve a terceros si el repositorio es público; si no, configura `VITE_REPORT_URL`. «Compartir reporte» funciona siempre.
6. **Prototipo anterior**: la carpeta con las 52 fichas, el video y los fotogramas no estaba en el repositorio; no se auditó lo que no existe (AUDITORIA_DATOS.md §1).
7. `npm audit`: 0 vulnerabilidades en dependencias de producción. Quedan avisos moderados en herramientas de build (`glob`/`minimatch` dentro de `workbox-build`) que no llegan al sitio publicado.
