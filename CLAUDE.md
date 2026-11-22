# CLAUDE.md — guía para agentes en este repositorio

LEONIDA ATLAS: guía de GTA VI (es-MX), Vite + React + TS, PWA, hosting estático (Netlify).

## Reglas de contenido (no negociables)
- Nunca publiques un dato sin fuente. Estado por ficha y por dato: oficial | comprobado | contrastado | reportado | pendiente | obsoleto.
- «Contrastado» = dos fuentes independientes (el validador lo exige). Una sola guía = «reportado».
- No inventes ubicaciones: `mapPosition` solo con base explícita (`basis`) y precisión `region|zona|barrio`. «exacta» solo con evidencia oficial/comprobada.
- Mapa: dos pósteres oficiales con el mismo encuadre (`mapa-oficial-leonida` y `mapa-oficial-leonida-v2`); la proporción se deriva del archivo (`src/lib/mapgeo.ts`). El v2 se registra también en `sources/local-media.json` para que `npm run images` no lo borre. Uso no comercial con atribución (ver `docs/MAPA_OFICIAL_V2.md`).
- Rutas personales: solo fichas con `mapPosition`; nunca coordenadas libres, caminos ni distancias.
- Vehículos: precios en `vehicle` con `priceStatus`/`priceSources`; «contrastado» exige dos grupos editoriales.
- Dinero separado por modo; no publicar glitches sin dos fuentes + pasos reproducibles; nada que vulnere servicios en línea.
- No usar material del video de terceros ni marcas de creadores. Ejecuta `npm run audit:legacy` (debe dar 0).
- Imágenes: solo oficiales de rockstargames.com/VI (registradas en `public/media/media-manifest.json` vía `npm run images`) o ilustraciones propias rotuladas «Ilustración editorial». No recortar/ocultar marcas.

## Flujo
- Contenido: `content/entries.json` (fuente de verdad), `content/sources.json`, `content/changelog.json`, y de la fase 2 `content/cheats.json`, `content/console.json`, `content/loadout.json` (esquemas en `src/data/schema-fase2.ts`). `scripts/seed_content.py` y `scripts/seed_fase2.py` fueron siembras; ya no son la fuente de verdad.
- Cada fuente puede llevar `group` (grupo editorial). «Contrastado» cuenta grupos, no URLs: un medio que reutiliza datos de otro no suma.
- Trucos: si ninguna fuente publica la secuencia, `sequenceStatus: desconocida` y `sequence: null`. Nunca trasladar códigos de GTA V.
- Validación: `npm run validate:data` (Vitest + Zod, integridad referencial). Corre dentro de `npm run build`.
- Tras cambiar fichas: `python3 scripts/gen_audit.py` para regenerar AUDITORIA_DATOS.md.
- Calidad: `npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e`.
- E2E usa `scripts/serve-dist.mjs` (imita Netlify: archivos → carpeta/index.html → SPA, cabeceras de `public/_headers`). Solo hay Chromium; el iPhone se emula en Chromium.
- No ejecutes `playwright install`.

## Código
- Componentes en `src/components`, páginas en `src/pages`, lógica pura testeable en `src/lib`.
- El navegador no carga Zod (excepto /editor, diferido). El progreso usa validación manual en `src/lib/storage.ts` con `schemaVersion` (v4: rutas y garaje) y migraciones v1/v2/v3→v4. Las preferencias del mapa van aparte (`leonida-atlas:map-prefs`). Las fotos personales viven en IndexedDB (`src/lib/photos.ts`), nunca en localStorage ni en un servidor.
- Accesibilidad: objetivos táctiles ≥ 44 px, foco visible, `prefers-reduced-motion`, sin errores serios de axe.

## ATLAS INTELLIGENCE
- Datos en `intel/` (sources, findings, patches, submissions, runs, proposals). Esquemas en `src/intel/schema.ts`.
- Ejecutar: `npm run intel:run` (escribe) o `npm run intel:dry` (no escribe). Corridas locales se registran como `manual_local`; nunca las presentes como programadas.
- Estados: nuevo_sin_verificar | reportado | contrastado | comprobado_en_version | pendiente_revalidacion | parcheado | refutado, por plataforma. Comprobado/parcheado solo con `evidence` (fecha, plataforma, versión) añadida por una persona.
- Solo parches de fuentes `oficial` (o añadidos a mano en `intel/patches.json` con `official: true`) disparan revalidación.
- Respeta robots.txt; fuentes con `aiProcessingAllowed: false` nunca se envían a la IA. Claves solo como secretos de Actions.
- El workflow abre PR; jamás escribe contenido en main. Módulos de servidor (pipeline, engine, classify, redact, budget, robots) no deben importarse desde el navegador.
- Matriz de requisitos: actualizar `docs/MATRIZ_FUNCIONAL.csv` y regenerar con `python3 scripts/gen_matrix.py`.
