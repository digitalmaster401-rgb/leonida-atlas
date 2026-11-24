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

## Fase 4A.2 — reconstrucción visual de alta fidelidad (Explorar e identidad global)

**Implementado (real, funcional):**
- Logotipo horizontal original (`src/components/BrandLogo.tsx`, `public/brand/leonida-atlas-logo.svg`): palmera neón, «LEONIDA» cromado en cursiva, «ATLAS» magenta con brillo. No reproduce el numeral «VI» ni logotipos de Rockstar/GTA VI que aparecen en las maquetas.
- Cabecera premium: menú lateral accesible (diálogo, foco, Escape), logotipo grande, Novedades (campana, sin contador inventado), perfil → Mi espacio, buscador integrado (franja propia en móvil).
- Banner cinematográfico: ciudad nocturna oficial + fotogramas oficiales de Lucia y Jason en paneles inclinados, «EXPLORA LEONIDA», botón «Comenzar exploración» (→ /mapa).
- Carrusel fotográfico de las 6 regiones, tarjetas fotográficas (Vehículos, Armas, Secretos y coleccionables, Dinero) con número real de fichas, últimas novedades con la imagen oficial de la ficha relacionada o ilustración rotulada, progreso personal calculado del progreso local (`src/lib/progressSummary.ts`, sin cambio de esquema).
- Barra inferior flotante e iluminada; títulos condensados e inclinados reutilizables (`.neo-title`, `.section-title`).

**Capturas reales:** `qa/visual/{360,390,430,1440}/explorar.png` y `novedades.png`; antes (commit 200873c) en `qa/visual/antes/`; comparativas en `qa/visual/comparacion-antes-despues-*.jpg`. Script: `node scripts/capturas-visuales.mjs [url] [carpeta] [--completa]`.

**Diferencias que siguen respecto a las referencias:**
1. Personajes: la maqueta usa un arte de Lucia y Jason recortado y posado; aquí son fotogramas oficiales en paneles. En móvil se ve sobre todo a Lucia. Requiere arte oficial recortado (ver `ASSETS_REQUIRED.json`); no se generan personajes con IA.
2. Logotipo: sin el «VI» de la maqueta (marca de terceros) y sin el lema en inglés.
3. La cabecera de la maqueta lleva una panorámica detrás del logotipo; aquí es sólida para no cargar una foto en todas las pantallas.
4. La maqueta no tiene franja de buscador; aquí se mantiene porque el buscador es una función principal.
5. Novedades y el resto de pantallas aún no usan la composición 4A.2 completa (solo la cabecera, la barra y los títulos).
6. Tarjetas de la maqueta incluyen un acceso «Mi espacio» con un edificio con «VI»: se sustituye por tarjetas reales de Vehículos, Armas, Secretos y Dinero.
