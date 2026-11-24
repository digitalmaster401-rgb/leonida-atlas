---
name: desarrollo
description: Añadir o cambiar funciones de LEONIDA ATLAS sin romper lo existente (datos, progreso local, mapa, rutas, vehículos, PWA). Usar al implementar una fase o corregir un error de código.
---

# Desarrollo seguro

1. **Rama:** `git checkout main && git pull --ff-only && git checkout -b claude/<fase>`.
2. **Datos nuevos:** amplía el esquema Zod (`src/data/schema*.ts`) con validación referencial y prueba en `tests/`. El navegador no importa Zod: usa tipos (`import type`) y JSON validado en `npm run validate:data`.
3. **Progreso local:** si cambias su forma, sube `SCHEMA_VERSION` en `src/lib/storage.ts`, añade `cleanVN` + migración desde todas las versiones previas, actualiza `mergeProgress`, `parseImport` (ids desconocidos) y prueba v(N-1)→vN en unidad y E2E. Nunca borres datos del usuario.
4. **Páginas pesadas:** `lazy()` en `src/App.tsx`; añade la ruta a `scripts/prerender.mjs` y al menú (`src/components/AppShell.tsx`).
5. **Mapa:** usa `posterOf()` / `src/lib/mapgeo.ts`; nada de proporciones fijas. Los elementos táctiles nuevos dentro del visor deben excluirse del gesto (`isPin`).
6. **Pruebas reales:** lógica pura en `tests/*.test.ts`; flujo en `e2e/*.spec.ts` con `watchConsole` (sin filtros), `noHorizontalOverflow` y `shot()` **después** de verificar la consola.
7. **Al terminar:** puerta de calidad completa (skill `auditoria-calidad`), matriz, CHANGELOG y un único PR sin fusionar.
