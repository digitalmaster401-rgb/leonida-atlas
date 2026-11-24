---
name: investigacion
description: Investigar y clasificar datos de GTA VI para LEONIDA ATLAS con fuentes verificables, y mantener ATLAS INTELLIGENCE (hallazgos, estados, propuestas automáticas). Usar al añadir o revisar fichas, trucos, ubicaciones, precios, noticias o propuestas del bot.
---

# Investigación con evidencia

## Antes de publicar un dato
1. Lee la página original (no el resumen de un buscador). Anota medio, autor, fecha y URL.
2. Asigna `group`: si un medio dice usar datos de otro («con ayuda de GTA Base», «según escaneos de…»), es el **mismo grupo**.
3. Estado: una guía = `reportado`; dos grupos distintos = `contrastado`; Rockstar/Take-Two = `oficial`; nunca `comprobado` sin prueba propia documentada.
4. Si no hay dato, escribe «No publicado» o `pendiente`. Nunca lo rellenes con estimaciones. Trucos sin secuencia publicada: `sequenceStatus: desconocida`, `sequence: null`; nunca códigos de GTA V.
5. Ubicaciones: punto sobre el **rótulo** del póster oficial con `basis`; si no hay rótulo claro, sin punto.
6. Resúmenes propios en español, citas literales cortas en `claims`, sin copiar textos completos.

## ATLAS INTELLIGENCE
- Estados por hallazgo: nuevo_sin_verificar | reportado | anuncio_oficial | contrastado | comprobado_en_version | pendiente_revalidacion | parcheado | refutado.
  - `anuncio_oficial` = solo fuente de Rockstar; no es «contrastado».
  - `contrastado` = ≥2 fuentes independientes (la oficial cuenta como una).
  - `comprobado_en_version`/`parcheado` exigen `evidence` humana (fecha, plataforma, versión); el esquema lo rechaza si falta o si `recordedBy` es automático.
- Deduplicación (`src/intel/engine.ts` `findMatch`, `src/intel/normalize.ts` `topicSimilarity`): misma URL/contenido, o mismo tema con ≥2 palabras en común; números distintos nunca se fusionan; noticias solo con otras noticias, otro medio y ≤4 días.
- El workflow mantiene **una sola PR** (`atlas-intelligence/propuestas`) y arrastra las propuestas abiertas (`--pending`). No subas código a esa rama; corregir datos en `intel/` sí.
- Correr: `npm run intel:dry` (no escribe) / `npm run intel:run`. Las corridas locales son `manual_local`.
- Revisar una propuesta: abre cada fuente, separa noticia / guía / ubicación / rumor, corrige categoría y estado con una entrada en `history`.
