# Fase 4C — QA

- Unitarias: `tests/calibration.test.ts` (recupera una transformación exacta, similaridad vs afín, validación, decisión y rechazo).
- Investigación (`npm run test:research`, en CI): 13 pruebas GTADB (importador, contrato real, piloto, cliente con caché/límite/reintentos) + 5 FullSweep.
- E2E `e2e/fase4c.spec.ts`: herramienta de calibración (modelos, roles, umbral de 8 puntos, rechazo fuera del póster, exportación) y catálogos (portada, filtros por tipo, ficha con valores, armas sin estadísticas inventadas, dinero).
- Suite completa: lint, tipos, 184 unitarias, build (paquete principal 241 kB), auditoría 0 y 302 E2E en Chromium; WebKit real en CI.
- No probado: teléfonos físicos; calibración con puntos puntuales (no existen todavía en el póster documentado).
