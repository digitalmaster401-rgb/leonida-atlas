# Auditoría de la primera propuesta automática de ATLAS INTELLIGENCE (PR #3)

Corrida `run-20261122-115556`: ejecución programada del 22-nov-2026 a las 11:55 UTC, desde main en 8f13e84.
Revisión del 22-nov-2026. **Ningún hallazgo se probó en el juego.**

## 1. Estado de main tras fusionar el PR #2

CI del commit `49d5645`, run 45030088846:
- `quality` (lint, tipos, pruebas, build, auditoría) en verde.
- `e2e` (Chromium y WebKit real) en verde.

## 2. Compatibilidad del PR #3 con main

- El PR se creó sobre main en 8f13e84 (antes de la v1.2.0). Solo toca `intel/`, carpeta que el PR #2 no modificó, así que no hay conflictos.
- Se fusionó main en la rama del PR (merge, sin reescribir historia) para que las pruebas corran contra la v1.2.0.
- Los datos de la corrida respetan lo existente:
  - Ningún hallazgo existente se borró.
  - En los 86 previos solo cambia `lastSourceCheckedAt` (fecha de la última revisión de la fuente).
  - Se añaden 7 hallazgos nuevos.

## 3. Por qué GitHub pedía atención («action_required»)

- La PR la abrió el bot de GitHub Actions con `GITHUB_TOKEN`. Para esas PR, GitHub no ejecuta el CI sin que el propietario lo apruebe a mano. Por eso la comprobación quedó en «action_required» con 0 trabajos.
- No era un fallo de pruebas. El propio workflow de ATLAS sí ejecutó `validate:data`, las pruebas de `intel` y el build antes de abrir la PR.
- **Corrección permanente:**
  - `ci.yml` acepta `workflow_dispatch`.
  - `atlas-intelligence.yml` tiene permiso `actions: write` y, tras abrir la PR, ejecuta `gh workflow run ci.yml --ref <rama>`.
  - GitHub sí permite ese disparo, y el resultado aparece en las comprobaciones de la PR porque es el mismo commit.
  - Hay una prueba de guarda en `tests/intel/repo-guards.test.ts`.
- En esta PR concreta, el push de esta revisión dispara el CI normal.

## 4. Revisión individual de los 7 hallazgos

Se leyeron las 7 páginas originales: todas cargan (HTTP 200) y su fecha coincide con la del feed.

| # | Hallazgo | Tipo real | Clasificador (antes) | Corregido | Aprovechable |
|---|---|---|---|---|---|
| 1 | Vercetti Estate (GTA BOOM, 22-nov) | **Ubicación / descubrimiento** | noticia · nuevo_sin_verificar | ubicacion · **reportado** | Sí, como ficha «reportado». Starfish Island, Vice City; jardines visitables, casa cerrada; no es refugio ni propiedad. |
| 2 | Janelle James y la PS5 Pro personalizada (GTA BOOM, 22-nov) | **Noticia de celebridad / promoción** | configuracion · reportado (**error**) | noticia · nuevo_sin_verificar | No para la guía. Solo como novedad. No es un ajuste de consola. |
| 3 | Apartamento de Dexter (GTA BOOM, 22-nov) | **Ubicación / easter egg** | noticia · nuevo_sin_verificar | ubicacion · **reportado** | Sí, con cautela. Trinity Apartments, Vice Beach; la fuente también dice Washington Island, y la «zona de descarte» es especulación suya. |
| 4 | Todos los personajes (PowerPyx, 22-nov) | **Guía índice** | noticia · nuevo_sin_verificar | personaje · reportado | Bajo valor. Lista sin datos; el orden revela la trama (spoilers). |
| 5 | Ian (PowerPyx, 22-nov) | **Perfil de personaje** | noticia · nuevo_sin_verificar | personaje · reportado | Bajo. Personaje menor; spoiler del capítulo 2; la fuente se contradice sobre si es misión principal o secundaria. |
| 6 | Joey (PowerPyx, 22-nov) | **Perfil de personaje** | noticia · nuevo_sin_verificar | personaje · reportado | Útil. Taller en Key Lento y contacto telefónico; spoiler leve del capítulo 1. |
| 7 | Celine (PowerPyx, 21/22-nov) | **Perfil de personaje** | noticia · nuevo_sin_verificar | personaje · reportado | Muy bajo. Huésped del Y Hotel, sin misiones; spoiler leve del capítulo 4. |

**Separación por tipo:**
- Noticia: #2.
- Rumores o especulación: no hay hallazgos completos de este tipo. Sí hay una parte especulativa dentro del #3 (la zona de descarte), anotada como riesgo.
- Ubicaciones y descubrimientos: #1 y #3.
- Guías útiles de personajes: #6. Con menos valor: #4, #5 y #7.

**Nivel real de evidencia:**
- Los 7 tienen **una sola fuente**: GTA BOOM o PowerPyx, cada una su propio grupo editorial.
- Ninguno llega a «contrastado» ni a «comprobado».
- «Reportado» significa que una guía lo describe. No se convierte en dato confirmado.
- Las afirmaciones guardadas llevan cita literal de la fuente (campo `claims`).
- Los resúmenes están en español, son propios y no reproducen el texto de las páginas.

## 5. Problemas reales corregidos

1. **Clasificador** (`src/intel/heuristics.ts`):
   - «PS5 Pro» por sí solo ya no significa «configuración»; ahora hace falta una palabra de ajustes (settings, HDR, PSSR, ray tracing…).
   - Categorías nuevas `ubicacion` y `personaje`, con su etiqueta en el panel /intel.
   - Hay pruebas con los 7 títulos reales de esta corrida.
2. **Datos del PR #3:**
   - Se corrigieron categoría, estado, plataformas (la PS5 Pro de la noticia no es una plataforma del hallazgo) y resumen.
   - Se añadieron citas y riesgos (spoilers, contradicciones de la fuente).
   - El historial de cada hallazgo registra la revisión.
   - La propuesta (`.json` y `.md`) quedó alineada con estos cambios.
3. **CI de las PR automáticas:** ver la sección 3.

## 6. Pendiente

- Para pasar los #1, #3 y #6 a fichas de la guía hace falta una **segunda fuente independiente** o una prueba en partida. Sin eso, quedan como «reportado» y con un punto de mapa de precisión `zona` o `barrio` como máximo.
- Precisar el barrio del #3: Vice Beach o Washington Island.
- Es probable que algunos fragmentos de la página índice de personajes (#4) no se hayan leído completos (la página es muy larga). No se extrajeron datos de ella.
- La corrección del CI se verá en la siguiente corrida programada de ATLAS, cuando esté en main.
