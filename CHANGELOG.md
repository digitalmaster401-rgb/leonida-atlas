# CHANGELOG

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
