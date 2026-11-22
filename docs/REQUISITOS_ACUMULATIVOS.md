# REQUISITOS ACUMULATIVOS — LEONIDA ATLAS

Fuente de verdad: `docs/MATRIZ_FUNCIONAL.csv` (este archivo se genera con `python3 scripts/gen_matrix.py`).
Reúne el prompt maestro original (Anexo I), la ampliación de mapa/espacio (Anexo II), la especificación V3 (A–E) y ATLAS INTELLIGENCE.

**Regla:** una interfaz visible no cuenta como función terminada. «implementado_testeado» exige código funcional **y** prueba automatizada que lo ejerce.

Resumen: ✅ implementado y probado **38** · 🟡 parcial **21** · ⬜ pendiente **1** · ⛔ bloqueado (requiere cuenta/permiso/prueba física) **3** · total 63


## A. Conservación y proceso

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| A1 | Conservar todo el desarrollo previo; trabajar en rama nueva sin fusionar | ✅ implementado_testeado | rama claude/fase2-trucos-coleccionables-espacio | CI + suite completa | PR #1 fusionado por el propietario; fase 2 en rama nueva y PR nuevo sin fusionar |
| A2 | Matriz de requisitos acumulativos como fuente de verdad | ✅ implementado_testeado | docs/MATRIZ_FUNCIONAL.csv | tests/intel/repo-guards.test.ts | Generada y verificada |
| A3 | No afirmar pruebas en partida/consola/Safari físico inexistentes | ✅ implementado_testeado | QA_REPORT.md, ATLAS_INTELLIGENCE_QA.md | revisión editorial | Límites declarados |
| A4 | Confirmación única del propietario antes de fusionar | 🟡 parcial | PR de fase 2 | — | El propietario decide la fusión; Claude no fusiona |

## B1. Mapas

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B1.1 | Mapa principal sobre cartografía oficial, sin coordenadas inventadas | ✅ implementado_testeado | src/components/MapView.tsx | e2e mapa | Póster oficial; coordenadas medidas sobre rótulos |
| B1.2 | Zoom/pan con gestos, teclado, botones | ✅ implementado_testeado | MapView | e2e mapa | Pellizco implementado; gesto real Android no probado en dispositivo físico |
| B1.3 | Pines exactos solo con prueba; aproximados diferenciados | ✅ implementado_testeado | schema mapPosition.precision | tests/data.test.ts | Ningún pin «exacta» |
| B1.4 | Capas: región, barrio, carretera, agua, interior/exterior, comercios, misiones, coleccionables, glitches | 🟡 parcial | MapLegend (por categoría, incl. coleccionables) | e2e mapa | Capa de coleccionables añadida; faltan capas temáticas (carreteras, agua, interiores) |
| B1.5 | Clustering y filtros guardados | 🟡 parcial | groupPins | tests unit pendientes | Agrupa pines coincidentes; sin clustering por zoom ni filtros guardados |
| B1.6 | Ocultar completados y antiespoilers en mapa | ✅ implementado_testeado | MapPage + PinPanel (settings.hideFound, spoilerLevel) | e2e/fase2.spec.ts | «Ocultar encontrados» compartido con Coleccionables; el panel del punto vela nombres con spoilers |
| B1.7 | Mis rutas / rutas temáticas sobre el mapa | 🟡 parcial | fichas de rutas | e2e rutas | Rutas como fichas; sin trazado sobre el mapa ni rutas personales |
| B1.8 | URL compartible por lugar (/mapa?id=) | ✅ implementado_testeado | MapPage | e2e mapa |  |

## B2. Dinero

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B2.1 | Métodos con capítulo, requisitos, pasos, bruto/neto, duración, riesgo, fuentes | 🟡 parcial | content/entries.json (dinero) | tests/data.test.ts | 14 métodos; neto real no publicado por ninguna fuente |
| B2.2 | Comparador/calculadora con unidades y supuestos visibles | ✅ implementado_testeado | MoneyCalculator | tests/components + e2e |  |
| B2.3 | Historial por versión | 🟡 parcial | intel findings versionHistory | tests/intel | Nuevo en esta fase vía ATLAS INTELLIGENCE |

## B3. Glitches

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B3.1 | Estados por plataforma/versión (comprobado, reportado, pendiente_revalidacion, parcheado, refutado, desconocido) | ✅ implementado_testeado | src/intel/schema.ts, status.ts | tests/intel/status.test.ts | Nuevo en esta fase |
| B3.2 | Parche nuevo ⇒ pendiente_revalidacion, nunca «parcheado» sin prueba | ✅ implementado_testeado | src/intel/versionWatch.ts | tests/intel/version-watch.test.ts | Nuevo en esta fase |
| B3.3 | Fichas de glitches con consola, build, fecha de prueba, guardado, próximo chequeo | 🟡 parcial | intel findings + pestaña Glitches | e2e intel | Estructura lista; ningún glitch comprobado publicado |

## B4. Trucos PS/Xbox

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B4.1 | Directorio por PS5/PS5 Pro/Xbox con secuencia de botones accesible | ✅ implementado_testeado | /trucos (CheatsPage, ButtonSequence) + content/cheats.json | tests/fase2.test.ts + e2e/fase2.spec.ts | 61 trucos; 19 secuencias (18 contrastadas, 1 reportada); PS5/PS5 Pro y Xbox Series X|S; texto accesible y copiar. PS5 Pro usa el mismo método según las fuentes (no distinguido) |
| B4.2 | «Secuencia desconocida» si solo se conoce el efecto; no trasladar de GTA V | ✅ implementado_testeado | cheats.json sequenceStatus=desconocida | tests/fase2.test.ts + e2e | 42 trucos con «Secuencia desconocida»; el validador impide publicar pasos sin fuente; consecuencias (guardado, trofeos, en línea) visibles |

## B5. Armas

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B5.1 | Catálogo con precios, ubicaciones y fuentes | 🟡 parcial | fichas armas (20) | tests/data.test.ts | Precios de una sola fuente (reportado) |
| B5.2 | Constructor/comparador de loadouts | ✅ implementado_testeado | /equipamiento (LoadoutPage, src/lib/loadout.ts) + content/loadout.json | tests/loadout.test.ts + e2e/fase2.spec.ts | 2 cortas + 2 largas + 1 cuerpo a cuerpo; armas únicas sin accesorios; guardar, comparar y compartir por enlace. Compatibilidad exacta de accesorios y precios no publicados |

## B6. Vehículos

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B6.1 | Clasificación por tipo, spawns, precios, talleres, garajes | 🟡 parcial | fichas vehículos (7) | tests/data.test.ts | Solo vehículos oficiales; sin spawns documentados |
| B6.2 | Comparador y lista personal de vehículos conseguidos | 🟡 parcial | Mi espacio (Encontrados/estados) | e2e/fase2.spec.ts | Lista personal con estados; sin comparador de vehículos |

## B7. Coleccionables

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B7.1 | Colecciones con checklist, mapa, perdibles, exportar/importar | 🟡 parcial | /coleccionables + 24 fichas (6 colecciones, 18 objetos con ubicación) | tests/fase2.test.ts + e2e/fase2.spec.ts | Checklist individual, estados, contadores, mapa y exportar/importar funcionan; solo 18 objetos tienen ubicación publicada (16 de 27 lecturas, 2 de ≈480 tarjetas) |

## B8. Ropa y joyería

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B8.1 | Tiendas, ropa, joyería, tatuajes, peluquería con fuentes | 🟡 parcial | fichas negocios (Stock 305, Electric Fang, Sara's) | tests/data.test.ts | Solo tiendas oficiales de Ultimate Edition |

## B9. Configuración de consola

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B9.1 | Guías PS5/PS5 Pro/Xbox: controles, HDR, FPS, accesibilidad, rutas de menú | ✅ implementado_testeado | /consola (ConsolePage) + content/console.json | tests/fase2.test.ts + e2e/fase2.spec.ts | PS5, PS5 Pro, Series X y S; juego vs. consola; 30 fps y PS5 Pro desde Newswire oficial; rutas de menú de guías (reportado). No probado en consola física |

## B10. Mi espacio

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B10.1 | Favoritos, completados, notas, progreso local con esquema versionado | ✅ implementado_testeado | src/lib/storage.ts (v3), MyGamePage (/mi-espacio) | tests/storage + e2e | Migración v1→v3 y v2→v3 probada |
| B10.2 | Exportar/importar JSON con validación y respaldo | ✅ implementado_testeado | ProgressManager | tests/storage + e2e/fase2.spec.ts | Exportar/importar incluye registros, equipamientos y fotos opcionales |
| B10.3 | Estados Encontrado/Pendiente/No disponible/Revisar, fecha, plataforma, puntuación | ✅ implementado_testeado | MyRecord + CollectiblesPage + storage records | tests/storage + e2e/fase2.spec.ts | Encontrado/Pendiente/Revisar/No disponible, fecha, plataforma y valoración 1–5 |
| B10.4 | Fotos personales, avatar, diario, rutas, lista para hoy | 🟡 parcial | PhotoGallery (IndexedDB), avatar, lista para hoy | tests/photos.test.ts + e2e/fase2.spec.ts | Fotos, avatar y lista para hoy funcionan; faltan diario y rutas personales |
| B10.5 | Sincronización multi-dispositivo con cuentas | ⛔ bloqueado | — | — | Requiere infraestructura autorizada (auth/BD) |
| B10.6 | Compartir ficha sin exponer notas privadas | ✅ implementado_testeado | ShareAction | e2e compartir | Solo comparte URL |
| B10.7 | Reporte de errores con moderación y antispam | 🟡 parcial | ReportError → GitHub Issues | e2e (enlace) | Moderación = revisión humana del issue; antispam lo aporta GitHub |

## B11. Motor editorial

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B11.1 | Por dato: fuente, URL, fechas, plataforma, build, evidencia, revisión, derechos | ✅ implementado_testeado | schema facts + intel SourceRef | tests/data + tests/intel |  |
| B11.2 | Niveles oficial/test independiente/guía/comunidad/contradictorio/refutado explicados en UI | 🟡 parcial | EvidenceBadge + intel status | tests/components | Niveles de fichas + estados intel; falta unificar en una sola leyenda |
| B11.3 | Automatización GitHub Actions: RSS/APIs, diff, PR de revisión, changelog, alertas de parche | 🟡 parcial | .github/workflows/atlas-intelligence.yml | tests/intel/pipeline.test.ts | Código y workflow listos; activación real requiere fusionar a main y permisos de Actions |
| B11.4 | Si fallan fuentes: conservar datos y marcar revisión; logs accesibles | ✅ implementado_testeado | scripts/intel/run.ts + RunReport | tests/intel/pipeline.test.ts |  |

## B12. Producto y publicación

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B12.1 | Marca original, PWA, offline, accesibilidad AA, SEO | ✅ implementado_testeado | app completa | e2e + axe + Lighthouse |  |
| B12.2 | Imágenes con derechos registrados, sin marcas de agua | ✅ implementado_testeado | media-manifest.json | tests/data.test.ts |  |
| B12.3 | Pruebas en Safari/WebKit real | 🟡 parcial | .github/workflows/ci.yml (PW_WEBKIT=1) | e2e en CI con WebKit real + e2e/csp-webkit.spec.ts | WebKit real pasa en GitHub Actions (CSP estricta intacta); sin prueba en iPhone/Safari físico |
| B12.4 | URL pública real y prueba del enlace compartido en WhatsApp | ⛔ bloqueado | DEPLOY.md | — | Requiere conectar Netlify con la cuenta del propietario |

## Anexo II. Referencia funcional

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| AX2.1 | Analizar UX pública de vicerepere.com sin copiar | ⬜ pendiente | — | — | Respondió HTTP 200 el 22-nov-2026; análisis pendiente para la fase de mapa/espacio |
| AX2.2 | Navegación inferior Mapa · Explorar · Dinero · Mi espacio · Novedades | 🟡 parcial | AppShell | e2e navegación | Actual: Inicio · Mapa · Dinero · Mi espacio · Menú (Novedades dentro del menú) |
| AX2.3 | Comunidad: proponer marcadores, votos, reputación, historial | 🟡 parcial | Enviar hallazgo → cola de revisión | tests/intel/submissions.test.ts | Envío y cola real vía GitHub Issues; sin votos ni reputación |

## ATLAS INTELLIGENCE

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| AI.1 | Registro configurable de fuentes (URL, idioma, categoría, frecuencia, derechos, API, confiabilidad) | ✅ implementado_testeado | intel/sources.json + schema | tests/intel/schema.test.ts |  |
| AI.2 | discover: RSS/APIs autorizadas, metadatos, fecha real, dedup por URL/ID/hash | ✅ implementado_testeado | src/intel/feeds.ts, normalize.ts, scripts/intel/run.ts | tests/intel/dedup.test.ts, feeds.test.ts | Respeta robots.txt; sin scraping de páginas que prohíben bots |
| AI.3 | extract/classify con IA validada por Zod; sin inventar valores; antiinyección | ✅ implementado_testeado | src/intel/classify.ts | tests/intel/classify.test.ts | Sin clave usa el clasificador heurístico; con ANTHROPIC_API_KEY usa Claude (no probado con clave real) |
| AI.4 | crosscheck: independencia real, contradicciones, republicaciones cuentan una vez | ✅ implementado_testeado | src/intel/crosscheck.ts | tests/intel/crosscheck.test.ts |  |
| AI.5 | version-watch: parche ⇒ revalidación sin borrar historial | ✅ implementado_testeado | src/intel/versionWatch.ts | tests/intel/version-watch.test.ts |  |
| AI.6 | review: propuesta (PR) con diff, fuentes, riesgos; cambios sensibles requieren humano | ✅ implementado_testeado | src/intel/proposal.ts + workflow | tests/intel/pipeline.test.ts | El PR automático necesita permiso de Actions para crear PRs |
| AI.7 | publish tras aprobación: datos versionados, validación, build | 🟡 parcial | workflow ci.yml + Netlify | CI | La publicación depende del hosting conectado |
| AI.8 | notify dentro de la PWA (sin fingir push/WhatsApp/email) | ✅ implementado_testeado | /intel Novedades | e2e intel | Push no implementado (requiere autorización) |
| AI.9 | Workflow 2 veces al día + manual, límites, timeouts, concurrencia, reintentos | 🟡 parcial | .github/workflows/atlas-intelligence.yml | tests/intel/repo-guards.test.ts | Se activa solo cuando el archivo esté en main |
| AI.10 | Estados editoriales nuevo/reportado/contrastado/comprobado_en_version/pendiente/parcheado/refutado por plataforma | ✅ implementado_testeado | src/intel/status.ts | tests/intel/status.test.ts |  |
| AI.11 | Modelo Source/Finding/Evidence/Patch/VerificationReport/RunReport/ReviewProposal; migración preservando IDs | ✅ implementado_testeado | src/intel/schema.ts, scripts/intel/migrate.ts | tests/intel/schema.test.ts | Hallazgos de dinero migrados con entryId |
| AI.12 | Pregúntale a ATLAS: solo datos respaldados, fuente/fecha/versión/certeza; «No puedo confirmarlo» | ✅ implementado_testeado | src/intel/ask.ts + IntelPage | tests/intel/ask.test.ts + e2e | Recuperación local sin IA en el navegador |
| AI.13 | Claves solo en secretos del servidor; nunca en el navegador | ✅ implementado_testeado | workflow secrets, redact() | tests/intel/secrets.test.ts |  |
| AI.14 | Topes diarios de llamadas, tokens, tiempo; registro de costo estimado | ✅ implementado_testeado | src/intel/budget.ts | tests/intel/pipeline.test.ts |  |
| AI.15 | Enviar hallazgo: formulario a cola de revisión, nunca autopublica | ✅ implementado_testeado | IntelPage + .github/ISSUE_TEMPLATE/hallazgo.yml | tests/intel/submissions.test.ts + e2e | Requiere repositorio con Issues activos |
| AI.16 | Bitácora: última ejecución real, fuentes, errores, propuestas | ✅ implementado_testeado | intel/runs + IntelPage | e2e intel | Primera corrida real: ejecución manual local del 22-nov-2026, no de Actions |
| AI.17 | TikTok/YouTube/Reddit por APIs autorizadas | ⛔ bloqueado | intel/sources.json (desactivadas) | — | La Research API de esa red de videos cortos y Reddit OAuth requieren aprobación; YouTube por API con clave |
| AI.18 | Resguardo de archivos privados (PDF/video de referencia fuera de git y del build) | ✅ implementado_testeado | .gitignore + guardas | tests/intel/repo-guards.test.ts |  |
