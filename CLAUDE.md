# CLAUDE.md — LEONIDA ATLAS

Guía de GTA VI (es-MX) · Vite + React + TS · PWA estática (Netlify). Propietario sin conocimientos de programación, trabaja desde Android: explica solo las acciones que deba hacer él.

## Reglas que nunca se rompen
- **Datos:** ningún dato sin fuente. Estados de fichas: oficial | comprobado | contrastado | reportado | pendiente | obsoleto. «Contrastado» = dos **grupos editoriales** independientes (`group` en `content/sources.json`); un medio que copia a otro no suma.
- **Mapa:** nada de ubicaciones inventadas. `mapPosition` lleva `basis` y precisión `region|zona|barrio`; «exacta» solo con evidencia oficial o comprobada. Rutas: solo fichas con punto, sin caminos ni distancias.
- **Imágenes:** solo oficiales de rockstargames.com/VI (`public/media/media-manifest.json`) o «Ilustración editorial» propia. No recortar marcas. Mapa oficial: uso no comercial con atribución (`docs/MAPA_OFICIAL_V2.md`).
- **Material ajeno:** nada del video de terceros ni marcas de creadores (`npm run audit:legacy` = 0).
- **Glitches y dinero:** separados por modo; ningún glitch sin dos fuentes y pasos reproducibles; nada que dañe servicios en línea.
- **Seguridad:** CSP estricta (`public/_headers`, sin `unsafe-inline`). Nunca la relajes ni ocultes errores de consola para pasar pruebas. Sin claves en el código (solo secretos de Actions).
- **Git:** nunca trabajes en `main`; rama nueva por fase; un PR por entrega; no fusiones ni publiques sin autorización.

## Dónde está cada cosa
- Contenido: `content/*.json` (fuente de verdad; esquemas en `src/data/schema.ts` y `schema-fase2.ts`).
- Lógica pura: `src/lib`. Componentes: `src/components`. Páginas: `src/pages` (las pesadas, con `lazy`).
- Progreso local: `src/lib/storage.ts` (schemaVersion 4, migraciones v1→v4; sin Zod en el navegador). Fotos en IndexedDB (`src/lib/photos.ts`). Preferencias del mapa en `leonida-atlas:map-prefs`.
- ATLAS INTELLIGENCE: `intel/` (datos) y `src/intel/` (motor). Ver la skill `investigacion` y `docs/ATLAS_INTELLIGENCE_QA.md`.
- Requisitos: `docs/MATRIZ_FUNCIONAL.csv` → `python3 scripts/gen_matrix.py` (incluye la ampliación V4: `docs/v4/`).
- Investigación cartográfica aislada: `research/gtadb/` (`npm run test:research`); nunca escribe en `content/` ni proyecta coordenadas sin calibración.
- Diseño: referencias aprobadas descritas en `docs/DISENO_PREMIUM.md`; recursos pendientes en `ASSETS_REQUIRED.json`; capturas con `node scripts/capturas-visuales.mjs`. Tras cambiar fichas: `python3 scripts/gen_audit.py`.

## Skills del proyecto (`.claude/skills/`)
- `investigacion`: buscar y clasificar datos de GTA VI con evidencia; ATLAS INTELLIGENCE.
- `desarrollo`: cómo añadir funciones sin romper nada (datos, almacenamiento, rutas, pruebas).
- `diseno-visual`: identidad (negro, magenta, cian, lima), accesibilidad y móvil.
- `auditoria-calidad`: puerta de calidad, WebKit/CSP, desbordamiento, matriz y PR.

## Comandos
`npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e` · `npm run audit:legacy`. No ejecutes `playwright install` (solo hay Chromium local; WebKit real corre en CI).
