# CHANGELOG

## 1.4.0 — 2026-11-24 — Fase 4A: experiencia visual premium (primera etapa)

- **Navegación de 5 pestañas** (`src/lib/nav.ts`): Mapa · Explorar · Dinero · Mi espacio · Novedades en la barra inferior, con indicador de sección activa (`aria-current`) y objetivos táctiles ≥ 44 px. En escritorio, el menú lateral se agrupa por pestaña. Se retira el botón «Menú»: todas sus secciones están en «Todas las secciones» de Explorar.
- **Explorar** (`/` y alias nuevo `/explorar`, sin indexar): buscador principal, categorías visuales con contador y barra de evidencia (calculada de `content/*.json`), herramientas, catálogo de secciones, regiones y últimas novedades (los datos de ATLAS se cargan aparte para no engordar el paquete principal).
- **Novedades** (`/novedades`, página nueva y diferida): línea de tiempo por día con insignia de estado, fuente original enlazada con su fecha, plataformas, fecha de detección y prueba en juego; filtros por estado y plataforma en la URL; aviso de hallazgos sin verificar; accesos al panel de ATLAS INTELLIGENCE y cambios de la guía. `/novedades?seccion=…` sigue abriendo el panel anterior.
- **Diseño:** fondo con brillo sutil magenta/cian, tarjetas «vidrio» con acento por categoría y brillo cian al enfocar, encabezado de sección con línea lima, transición de entrada solo con opacidad (se apaga con `prefers-reduced-motion`).
- **Dirección visual aprobada (referencias del propietario):** portada panorámica con imagen oficial nocturna y crédito, barra «ATLAS EXPLORER», tarjeta editorial de tres destacados, cuatro accesos con imagen oficial, barra inferior flotante con pestaña iluminada, chip de versión. Novedades con bloques «Fuentes consultadas» (estado real), «ATLAS Intelligence», «Por verificar» y «Novedades de LEONIDA ATLAS». Plan de Mapa y Mi espacio en `docs/DISENO_PREMIUM.md`.
- **4A.2 (alta fidelidad):** logotipo horizontal original, cabecera con menú lateral accesible, notificaciones y perfil, buscador integrado; banner cinematográfico «EXPLORA LEONIDA» con ciudad y protagonistas (imágenes oficiales); carrusel de regiones; tarjetas fotográficas con conteos reales; novedades con foto de la ficha relacionada; progreso calculado del almacenamiento local; barra inferior flotante. `ASSETS_REQUIRED.json` lista los recursos que faltan; capturas y comparativas en `qa/visual/`.
- Sin cambios en datos, esquemas, progreso local (v4), CSP ni controles de calidad. QA: `docs/FASE4A_QA.md`.

## 1.3.2 — 2026-11-24 — Paso 21D: auditoría de material ajeno sin falsos positivos

- `npm run audit:legacy` fallaba en el PR #10 (ejecución 45443731080) porque un titular real de GTA BOOM sobre reclamaciones de copyright en YouTube contiene la palabra inglesa equivalente a «creadores», que es uno de los términos vigilados.
- La lógica pasa a `scripts/audit-legacy-lib.mjs`. Las tres palabras comunes de la lista (`WORD_TERMS`) solo se aceptan dentro del **titular exacto** de una noticia externa (o de su id `fnd-…`) cuya URL pertenece a una fuente registrada en `intel/sources.json`, y solo en datos de ATLAS INTELLIGENCE o en el build que los incluye. Cada aceptación se informa con su motivo.
- Siguen bloqueados: esas palabras fuera de un titular registrado, los dominios no registrados, cualquier titular con rutas del prototipo anterior, y los archivos y rutas prohibidos (video, fotogramas, portada).
- Pruebas: `tests/audit-legacy.test.ts`; reproducción del fallo sobre la rama del PR #10 (antes 7 coincidencias, ahora 0).

## 1.3.1 — 2026-11-24 — Paso 21A: estabilización de ATLAS INTELLIGENCE y entorno

- **Propuestas repetidas:** cada corrida partía de main sin las propuestas abiertas y volvía a proponer lo mismo (PR #5–#8: 199 propuestas para 115 hallazgos distintos). Ahora hay una sola PR acumulada (`atlas-intelligence/propuestas`) que se actualiza y arrastra las propuestas abiertas (`carryPending`, `--pending`).
- **Deduplicación por tema:** la misma noticia de varios medios se fusiona; los números distintos («capítulo 3» y «capítulo 4») nunca se fusionan (antes sí); hace falta coincidir en ≥2 palabras de tema.
- **Clasificación:** «How to complete <misión>» y «walkthrough» se clasifican como misión; los titulares que desmienten quedan marcados y no como «reportado».
- **Estados:** nuevo `anuncio_oficial`; «contrastado» exige dos fuentes independientes (8 anuncios de Rockstar corregidos, con historial); el esquema rechaza «comprobado» o «parcheado» sin evidencia humana.
- **Entorno:** CLAUDE.md más corto y 4 skills del proyecto (`investigacion`, `desarrollo`, `diseno-visual`, `auditoria-calidad`); plan de diseño premium en `docs/DISENO_PREMIUM.md`.

## 1.3.0 — 2026-11-22 — Fase 3: ATLAS EXPLORER + mapa oficial v2

- Póster oficial v2 (5775×7900, «print-ready» de rockstargames.com/VI/media) en WebP 1200/2400/3840 con nombres `-v2-`; encuadre idéntico verificado (desplazamiento 0 px, escala 1.000); proporción derivada del archivo; carga por niveles y respaldo al póster anterior (`docs/MAPA_OFICIAL_V2.md`).
- Mapa: capas temáticas y por precisión, agrupación por zoom (`src/lib/mapgeo.ts`), preferencias persistentes (`src/lib/mapprefs.ts`), lista «Sin ubicación documentada», panel de filtros plegable.
- `/mis-rutas`: rutas personales con paradas documentadas, orden, objetivos, visitados; capa de ruta en `/mapa?ruta=` con encuadre automático; «Añadir a una ruta» en las fichas.
- Vehículos: campo `vehicle` en el esquema (clase, registro, venta, rastreador, evidencia del precio); 9 vehículos nuevos (reportados, una sola fuente de origen); `/comparar-vehiculos` con selección en la URL y garaje personal.
- Progreso local v4 (rutas y garaje) con migración v1/v2/v3→v4 y exportación/importación.
- Correcciones: grupos del mapa táctiles, desbordamiento a 360 px en mapa y fichas, `npm run images` conserva el póster v2.
- Investigación: `sources/INVESTIGACION_FASE3.md`; QA: `docs/FASE3_QA.md`.

## 1.2.0 — 2026-11-22 — Fase 2: trucos, coleccionables, consola, equipamiento y Mi espacio

- `/trucos`: 61 trucos (`content/cheats.json`) con método PS5/Xbox, secuencia visual y texto accesible, copiar, requisitos y consecuencias; 42 «Secuencia desconocida» sin pasos inventados.
- `/coleccionables`: categoría nueva con 6 colecciones y 18 objetos con ubicación; estados, contadores, filtros, ocultar encontrados (también en el mapa).
- `/consola`: ajustes por PS5, PS5 Pro, Series X y S (`content/console.json`), juego vs. consola.
- `/equipamiento`: constructor con reglas de `content/loadout.json` (`src/lib/loadout.ts`), guardar, comparar y compartir por enlace.
- `/mi-espacio` (alias `/mi-partida`): perfil, avatar, listas Encontrados/Pendientes/Revisar/No disponible, lista para hoy, fotos en IndexedDB (`src/lib/photos.ts`); «Mi registro» en cada ficha.
- Progreso local v3 (registros, contadores, equipamientos, perfil) con migración desde v1 y v2; exportar/importar con fotos opcionales.
- Validación: `group` editorial en fuentes; «contrastado» exige ≥2 grupos; esquemas Zod de la fase 2 (`src/data/schema-fase2.ts`) dentro de `npm run validate:data`.
- Las páginas nuevas se cargan bajo demanda; el paquete principal bajó de 560 kB a 278 kB.
- Investigación: `sources/INVESTIGACION_FASE2.md`.

## 1.1.0 — 2026-11-22 — ATLAS INTELLIGENCE (infraestructura)

- Auditoría acumulativa: `docs/REQUISITOS_ACUMULATIVOS.md` y `docs/MATRIZ_FUNCIONAL.csv` (63 requisitos con estado real).
- `src/intel/`: esquemas Zod, lector RSS/Atom, normalización y deduplicación, robots.txt, clasificador heurístico y con IA opcional (Claude, citas literales obligatorias), crosscheck, version-watch, propuestas de revisión, topes de costo y ocultación de secretos.
- `scripts/intel/run.ts` y `migrate.ts`; datos en `intel/` (fuentes, hallazgos, parches, aportes, bitácora, propuestas).
- Workflows `atlas-intelligence.yml` (2×/día + manual, abre PR) y `ci.yml` (incluye e2e con WebKit real); formulario de issues «hallazgo».
- Panel `/intel` y ruta `/novedades`; enlace desde Glitches e Inicio.
- Corrección: filtros que «revivían» al cambiar opciones rápido (React Router 7) en catálogo, mapa y panel.
- Pruebas: 97 unitarias y 121 e2e en verde. Informe: `docs/ATLAS_INTELLIGENCE_QA.md`.

## 1.0.0 — 2026-11-22

Primera edición pública de LEONIDA ATLAS, reconstruida desde cero.

- App web/PWA en Vite + React + TypeScript, rutas profundas prerenderizadas (95 páginas) y Open Graph propio.
- 80 fichas auditadas (48 oficiales, 8 contrastadas, 24 reportadas) con fuente y fecha por dato.
- Visor del mapa oficial de Leonida con zoom/arrastre/pellizco/teclado y 29 fichas ubicadas con precisión declarada.
- 55 imágenes oficiales de Rockstar Games con manifiesto de derechos; ilustraciones propias rotuladas cuando no hay imagen.
- Buscador tolerante a acentos, sinónimos y errores leves; filtros por región, categoría, capítulo, edición, evidencia y spoiler.
- Favoritos, completados, notas y progreso locales con esquema versionado, migración v1→v2, exportar/importar y respaldo.
- Calculadora de dinero con fórmulas visibles y etiqueta de estimación.
- Protección de spoilers persistente; dinero separado por modo; sin glitches publicados (ninguno verificado).
- Panel editorial local (/editor) con validación Zod.
- Sin material del video de terceros: auditoría con 0 coincidencias.
