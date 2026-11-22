# ATLAS INTELLIGENCE — Informe de QA y estado real

**Fecha:** 22 de noviembre de 2026 · **Rama:** `ccr-fb7ab394-lollmi` (PR #1, sin fusionar) · **Entorno de prueba:** contenedor Linux, Node 22, Chromium 1243.

## 1. Qué es y qué no es

ATLAS INTELLIGENCE es un pipeline que **lee fuentes autorizadas**, detecta hallazgos sobre GTA VI, los cruza entre fuentes independientes, revalida cuando sale un parche y **propone cambios mediante un Pull Request para revisión humana**. No es un chat que invente datos. Nada pasa a «comprobado» ni a «parcheado» sin una evidencia con fecha, plataforma y versión registrada por una persona.

| Componente | Archivo | Estado |
|---|---|---|
| Esquemas (Source, Finding, Evidence, Patch, RunReport, ReviewProposal, Submission) | `src/intel/schema.ts` | ✅ probado |
| Lector RSS/Atom y vigilancia de página oficial | `src/intel/feeds.ts`, `pipeline.ts` | ✅ probado y ejecutado con red real |
| Normalización y deduplicación (URL canónica, ID de video, huella del texto) | `src/intel/normalize.ts` | ✅ probado y verificado en real (2.ª corrida: 0 duplicados) |
| robots.txt, tiempo límite, reintentos, cancelación | `src/intel/robots.ts`, `pipeline.ts` | ✅ probado |
| Clasificador heurístico (sin IA) | `src/intel/heuristics.ts` | ✅ probado y en uso |
| Clasificador con IA (Claude, salida validada con Zod, citas literales obligatorias) | `src/intel/classify.ts` | ✅ probado con un cliente simulado · ⚠️ **no probado con una clave real** |
| Crosscheck de independencia | `src/intel/status.ts`, `engine.ts` | ✅ probado |
| Version-watch (parche ⇒ pendiente de revalidación) | `src/intel/engine.ts` | ✅ probado |
| Propuesta de revisión (Markdown + JSON) | `src/intel/engine.ts` | ✅ probado y generada en real (`intel/proposals/`) |
| Topes de costo | `src/intel/budget.ts` | ✅ probado |
| Protección de secretos | `src/intel/redact.ts` | ✅ probado (se detectó y corrigió una fuga parcial al recortar errores) |
| Aportes de la comunidad (issues «hallazgo» ⇒ cola) | `pipeline.ts`, `.github/ISSUE_TEMPLATE/hallazgo.yml` | ✅ análisis probado · ⚠️ lectura de issues no ejecutada (requiere Actions) |
| Workflow programado 2×/día + manual | `.github/workflows/atlas-intelligence.yml` | ⛔ **no ejecutado todavía** (ver §4) |
| CI (lint, tipos, pruebas, build, e2e con WebKit real) | `.github/workflows/ci.yml` | ⛔ no ejecutado todavía (requiere Actions) |
| Panel en la PWA `/intel` (Novedades 24 h/7 d/30 d, En observación, Parches, Pregúntale a ATLAS, Enviar hallazgo, Bitácora) | `src/pages/IntelPage.tsx` | ✅ probado en 7 viewports |
| Pregúntale a ATLAS (recuperación local, sin IA en el navegador) | `src/intel/ask.ts` | ✅ probado |
| Migración de las fichas de dinero a hallazgos (IDs preservados) | `scripts/intel/migrate.ts` | ✅ ejecutada (14) e idempotente |

## 2. Ejecuciones reales realizadas

| Corrida | Origen | Resultado |
|---|---|---|
| `run-20261122-040859` (04:09 UTC) | **manual local** desde esta sesión, con red real | `ok`: 78 elementos, 72 relevantes, 72 hallazgos nuevos, 0 errores. Guardada en `intel/runs/` y en la propuesta `intel/proposals/LATEST.md` |
| `run-20261122-040905` | manual local, `--dry-run` | `sin_novedades`: 0 nuevos. Confirma la deduplicación con datos reales. No se guardó |

La bitácora de la app muestra esa corrida como «ejecución manual local (no programada)». **Ninguna corrida de GitHub Actions ha ocurrido todavía**, y la app no dice lo contrario.

### Fuentes (verificadas el 22-nov-2026)

| Fuente | Estado | Motivo |
|---|---|---|
| Página oficial de GTA VI (Rockstar) | ✅ activa, solo titulares y fechas | El robots.txt de Rockstar bloquea a los bots de IA: no se envía contenido a ningún modelo |
| GTA BOOM (RSS) | ✅ activa, con IA permitida | robots.txt lo permite |
| PowerPyx (RSS) | ✅ activa, con IA permitida | robots.txt lo permite |
| Video Games Chronicle (RSS) | ✅ activa, con IA permitida | robots.txt lo permite |
| GameSpot (RSS) | ✅ activa, sin IA | Su robots.txt bloquea a ClaudeBot |
| YouTube oficial de Rockstar (RSS) | ⛔ desactivada | El robots.txt de YouTube prohíbe `/feeds/videos.xml` a agentes automáticos |
| Eurogamer, IGN (RSS) | ⛔ desactivadas | Responden HTTP 403 a clientes automatizados; no se evade el bloqueo |
| YouTube Data API | ⏸️ se activa sola con la clave | Requiere el secreto `YOUTUBE_API_KEY` |
| Reddit r/GTA6 | ⛔ desactivada | HTTP 429/403 sin OAuth; requiere app registrada en Reddit |
| Red de videos cortos (TikTok) | ⛔ sin API, fuera del registro | La Research API requiere aprobación. Los enlaces entran solo por «Enviar hallazgo» y nunca se muestra su marca en el sitio |

## 3. Pruebas

| Suite | Resultado |
|---|---|
| `npm run lint` | ✅ 0 problemas |
| `npm run typecheck` | ✅ 0 errores |
| `npm run test` (Vitest) | ✅ **97/97** en 18 archivos (34 previas + 63 nuevas de ATLAS INTELLIGENCE) |
| `npm run build` | ✅ 97 páginas prerenderizadas (se añadieron `/intel` y `/novedades`); el panel se carga aparte (21 kB gzip) |
| `npm run test:e2e` (Playwright) | ✅ **121 pasaron**, 0 fallaron (34 omitidos a propósito); 360, 390, 768, 1280, 1920 px, Pixel 7, iPhone emulado y modo sin conexión |
| axe WCAG 2 AA (incluye `/intel` y su bitácora) | ✅ 0 violaciones serias |

Pruebas de aceptación del §9 y dónde están:

| Requisito §9 | Prueba |
|---|---|
| Deduplicación | `tests/intel/dedup.test.ts` |
| Fuentes no independientes (mismo grupo editorial, mismo video republicado) | `tests/intel/crosscheck.test.ts` |
| Artículo nuevo sobre una prueba vieja | `tests/intel/status.test.ts` |
| Parche nuevo ⇒ revalidación; nunca «parcheado» sin prueba; parche no oficial no se aplica | `tests/intel/version-watch.test.ts`, `pipeline.test.ts` |
| Videos falsos o promesas de «dinero infinito» (máximo «reportado») | `tests/intel/crosscheck.test.ts` |
| Fallos de API (IA y fuentes) | `tests/intel/classify.test.ts`, `pipeline.test.ts` |
| Cancelación, tiempo límite y reintentos | `tests/intel/pipeline.test.ts` |
| Protección de secretos | `tests/intel/secrets.test.ts` |
| Validez de citas | `tests/intel/classify.test.ts` |
| Estado por plataforma y «funciona hoy» | `tests/intel/status.test.ts`, `ask.test.ts` |
| Generador de PR | `tests/intel/pipeline.test.ts` |
| Ausencia de novedades | `tests/intel/pipeline.test.ts` + corrida real en dry-run |
| Filtro móvil | `e2e/intel.spec.ts` (7 viewports) |
| Resguardo de archivos privados | `tests/intel/repo-guards.test.ts` + `.gitignore` |

### Errores encontrados y corregidos durante el QA
1. Una clave podía filtrarse **en parte** si el mensaje de error se recortaba antes de ocultarla. Ahora se oculta antes de recortar (`pipeline.ts`).
2. «Grand Theft **Auto**» activaba la categoría vehículo, y cifras de ventas («$4 Billion») se tomaban por dinero del juego (`heuristics.ts`).
3. «Xbox Series X|S» no se reconocía como Xbox Series S (`heuristics.ts`).
4. «¿Dónde está…?» no encontraba fichas porque «dónde» y «está» se exigían como términos de búsqueda (`ask.ts`).
5. Filtros que «revivían» al cambiar dos opciones muy rápido. La causa era la transición de React Router 7; se corrigió en los filtros del panel, del catálogo y del mapa (`src/lib/query.ts`).
6. La revalidación por parche se saltaba la segunda plataforma (`engine.ts`).

## 4. Qué funciona hoy, qué necesita claves y qué necesita revisión humana

**Funciona hoy, sin claves ni cuentas:** descubrimiento por RSS y página oficial, deduplicación, clasificación heurística, cruce de fuentes, revalidación por parches registrados, propuestas en Markdown/JSON, bitácora, panel `/intel`, Pregúntale a ATLAS y validación de aportes. Se ejecuta con `npm run intel:run`.

**Necesita autorización o credenciales:**
- **Ejecución automática dos veces al día:** GitHub solo ejecuta los horarios desde la rama por defecto. Mientras el PR #1 no se fusione a `main`, el workflow **no puede correr** (tampoco aparece el botón manual). Además requiere los permisos de Actions del §5.
- **Clasificación con IA:** opcional; requiere el secreto `ANTHROPIC_API_KEY`. Modelo por defecto `claude-haiku-5-5` (USD 0.10 por millón de tokens de entrada y USD 0.50 de salida). Estimación: unas 40 llamadas por corrida, alrededor de USD 0.01, menos de USD 1 al mes con dos corridas diarias. Tope duro por corrida: USD 0.25 (variable `ATLAS_MAX_COST_USD`). La suscripción a Claude no incluye uso de la API: se paga aparte en console.anthropic.com.
- **YouTube:** requiere el secreto `YOUTUBE_API_KEY`. La cuota gratuita de Google es de 10 000 unidades al día; el pipeline usa unas 800.
- **Reddit y TikTok:** requieren aprobación de sus programas de API; no están implementados como fuente automática.

**Requiere revisión humana antes de publicar (siempre):** todo PR de ATLAS INTELLIGENCE, y en particular cambios de estado, cifras, glitches, trucos, ubicaciones y cualquier paso a «comprobado» o «parcheado». El workflow **nunca** escribe en `main` (lo vigila `tests/intel/repo-guards.test.ts`); la única excepción opcional es la bitácora sin novedades, si activas `ATLAS_COMMIT_LOGS_TO_MAIN`.

## 5. Cómo activarlo desde Android (cuando decidas fusionar)

> Usa Chrome. Si en github.com no ves la pestaña **Settings**, abre el menú ⋮ y marca **Sitio de escritorio**.

1. **Fusionar PR #1** (solo cuando lo apruebes): github.com/digitalmaster401-rgb/leonida-atlas/pull/1 → **Merge pull request** → **Confirm merge**.
2. **Permisos de Actions:** repositorio → **Settings** → **Actions** → **General**:
   - en *Actions permissions*, marca **Allow all actions and reusable workflows**;
   - en *Workflow permissions*, marca **Read and write permissions** y la casilla **Allow GitHub Actions to create and approve pull requests**;
   - toca **Save**.
3. **Issues para los aportes:** **Settings** → **General** → *Features* → marca **Issues**. Luego **Issues** → **Labels** → **New label** → nombre `hallazgo` → **Create label**.
4. **Probarlo una vez:** pestaña **Actions** → **ATLAS INTELLIGENCE** → **Run workflow** → **Run workflow**. Al terminar aparecerá un PR «ATLAS INTELLIGENCE: revisión de la corrida…» para que lo revises.
5. **(Opcional) IA:** en console.anthropic.com → **API Keys** → **Create Key**, y define un límite de gasto en **Billing**. Después, en GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret** → Name `ANTHROPIC_API_KEY` → pega la clave → **Add secret**. Nunca la pegues en el chat ni en un archivo.
6. **(Opcional) YouTube:** en console.cloud.google.com → **APIs y servicios** → **Biblioteca** → «YouTube Data API v3» → **Habilitar** → **Credenciales** → **Crear credenciales** → **Clave de API**, y restríngela a YouTube Data API v3. Guárdala como secreto `YOUTUBE_API_KEY` (igual que en el paso 5).
7. **(Opcional) Ajustes:** en **Settings** → **Secrets and variables** → **Actions** → pestaña **Variables** puedes crear `ATLAS_MAX_COST_USD`, `ATLAS_MAX_AI_CALLS`, `ATLAS_AI_MODEL` y `ATLAS_COMMIT_LOGS_TO_MAIN` (`true` para guardar la bitácora sin novedades en main).

Notas de GitHub:
- Los PR creados por el workflow con `GITHUB_TOKEN` **no disparan** otros workflows (por eso el propio workflow ejecuta las pruebas antes de abrir el PR).
- Los horarios programados pueden retrasarse en momentos de carga; la app muestra siempre la hora real de cada corrida.

## 6. Límites reales

- No se probó nada dentro de una partida ni en una consola. Ningún hallazgo está «comprobado».
- Los titulares de las fuentes se muestran en su idioma original; con IA se generará un resumen propio en español.
- La clasificación heurística es por palabras clave y puede equivocarse de categoría. Por eso todo pasa por revisión.
- La vigilancia de la página oficial depende de su estructura actual; si cambia, la fuente fallará y la corrida quedará como «parcial», sin perder datos.
- La Research API de TikTok, la API de Reddit y las notificaciones push no están implementadas: requieren aprobación o autorización explícita.
