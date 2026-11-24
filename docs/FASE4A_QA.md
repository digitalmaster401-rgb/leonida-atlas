# Fase 4A — QA (experiencia visual premium, etapa 1)

Fecha: 24-nov-2026 · Rama `claude/fase4a-visual`.

## Qué se probó (real, automatizado)
| Puerta | Resultado local |
|---|---|
| `npm run lint` | sin errores |
| `npm run typecheck` | sin errores |
| `npm run test` | 27 archivos, 171 pruebas (incluye `tests/nav.test.ts`) |
| `npm run build` | 138 páginas prerenderizadas (nueva: `/explorar`, sin indexar) |
| `npm run audit:legacy` | 0 coincidencias no permitidas (repo y `dist/`) |
| `npm run test:e2e` (Chromium 360/390/768/1280/1920, Pixel 7, iPhone 14 emulado, PWA sin conexión) | 242 pasan, 60 omitidas por diseño (pruebas de un solo ancho) |
| WebKit real (iPhone 14) | solo en CI (`PW_WEBKIT=1`); ver el PR |

`e2e/fase4a.spec.ts` cubre: las 5 pestañas (orden, toque real, ≥ 44 px, una sola `aria-current`, sin desbordamiento en cada pantalla), 19 URL anteriores con su pestaña activa (móvil y escritorio), Explorar (8 categorías con contador y evidencia, buscador, catálogo de secciones, navegación real), Novedades (estadísticas, aviso sin verificar, fuente original `https`, fecha `datetime`, filtros por estado y plataforma en la URL, acceso a la bitácora) y la compatibilidad de `/novedades?seccion=…`. Axe (WCAG 2 AA) se amplió a `/novedades` y `/novedades?estado=reportado`.

## Refinamiento con las referencias aprobadas (segunda entrega en el mismo PR)
Portada cinematográfica, tarjeta editorial, accesos con imagen, barra flotante iluminada y bloques de Novedades. Pruebas añadidas: carrusel (una diapositiva visible, puntos y flechas, CTA real), 4 accesos con imagen oficial y navegación, botón de búsqueda de la barra que enfoca el buscador, chip de versión, 4 canales de fuentes con estado real (sin «Monitoreo activo»), 3 pendientes de verificación, tarjetas del registro de cambios. Axe detectó que el chip de versión no incluía su texto visible en el nombre accesible; se corrigió.

## Capturas
`qa/screenshots/<proyecto>/4a-00-mapa-barra.png`, `4a-01-explorar.png`, `4a-02-explorar-categorias.png`, `4a-03-novedades.png`, `4a-04-novedades-fuentes.png`, `4a-05-explorar-accesos.png`, `4a-06-novedades-revision.png`. Son capturas de la aplicación funcionando (no maquetas), tomadas por las pruebas tras verificar la consola.

## Qué NO se probó
- Teléfonos físicos (Android e iPhone) ni Lighthouse en esta etapa.
- El paquete principal sigue por encima del objetivo de 300 kB del plan (≈ 397 kB sin comprimir; antes ≈ 390 kB): los datos de ATLAS se cargan aparte para no sumarlos.
