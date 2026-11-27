# Fase 4B — QA (Mapa inmersivo y Mi espacio)

Fecha: 27-nov-2026 · Rama `claude/fase4a-visual` (PR #12).

## Probado (automatizado)
- `e2e/fase4b.spec.ts` (todos los perfiles): buscador del mapa, chips rápidos con contadores, filtros agrupados, leyenda, panel inferior (foto, evidencia, precisión, favoritos, visitado, ampliar/reducir/cerrar), marcador personal (crear tocando el mapa, nota privada, icono, persistencia tras recargar, editar y borrar), Mi espacio (nombre, color, objetivos, actividad, logros rotulados como no oficiales, ausencia de niveles/EXP/km, acceso a ATLAS Intelligence) y migración v4→v5 en el navegador con respaldo.
- Unitarias: `tests/storage.test.ts` (v1–v4→v5, validación de marcadores/objetivos/actividad, respaldo y copia de ilegibles, combinación), `tests/mySpace.test.ts`.
- Investigación: `npm run test:research` (6 sintéticas + 2 de contrato con extracto real de GTADB).
- Suites previas sin cambios de criterio (solo se actualizó la versión esperada del esquema de 4 a 5).

## Resultados
lint ✔ · typecheck ✔ · 180 unitarias ✔ · 8 de investigación ✔ · build ✔ (paquete principal 289 kB) · audit:legacy 0 ✔ · E2E Chromium (360/390/768/1280/1920, Pixel 7, iPhone emulado, PWA sin conexión) ✔. WebKit real en CI.

## Capturas reales
`qa/visual/{360,390,430,1440}/mapa.png`, `mapa-panel.png`, `mi-espacio.png`; `qa/screenshots/<proyecto>/4b-*.png`.

## No probado / pendiente
- Teléfonos físicos.
- Calibración GTADB/FullSweep → póster oficial (bloquea mostrar sus ubicaciones).
- Fotos personales como avatar (se mantienen los avatares predefinidos + color).
