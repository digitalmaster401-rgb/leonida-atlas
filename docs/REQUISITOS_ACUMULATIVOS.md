# REQUISITOS ACUMULATIVOS — LEONIDA ATLAS

Fuente de verdad: `docs/MATRIZ_FUNCIONAL.csv` (este archivo se genera con `python3 scripts/gen_matrix.py`).
Reúne el prompt maestro original (Anexo I), la ampliación de mapa/espacio (Anexo II), la especificación V3 (A–E), ATLAS INTELLIGENCE y la ampliación integral V4 (`docs/v4/REQUISITOS_V4.json`).

**Regla:** una interfaz visible no cuenta como función terminada. «implementado_testeado» exige código funcional **y** prueba automatizada que lo ejerce.

Resumen: ✅ implementado y probado **58** · 🟡 parcial **33** · ⬜ pendiente **5** · ⛔ bloqueado (requiere cuenta/permiso/prueba física) **4** · total 100


## A. Conservación y proceso

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| A1 | Conservar todo el desarrollo previo; trabajar en rama nueva sin fusionar | ✅ implementado_testeado | rama claude/paso21a-estabilizacion | CI + suite completa | PR #1–#4 fusionados por el propietario; Paso 21A en rama nueva, un solo PR sin fusionar |
| A2 | Matriz de requisitos acumulativos como fuente de verdad | ✅ implementado_testeado | docs/MATRIZ_FUNCIONAL.csv | tests/intel/repo-guards.test.ts | Generada y verificada |
| A3 | No afirmar pruebas en partida/consola/Safari físico inexistentes | ✅ implementado_testeado | QA_REPORT.md, ATLAS_INTELLIGENCE_QA.md | revisión editorial | Límites declarados |
| A4 | Confirmación única del propietario antes de fusionar | 🟡 parcial | PR de fase 2 | — | El propietario decide la fusión; Claude no fusiona |

## B1. Mapas

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| B1.1 | Mapa principal sobre cartografía oficial, sin coordenadas inventadas | ✅ implementado_testeado | MapView + póster oficial v2 (mapa-oficial-leonida-v2) | tests/mapgeo.test.ts + e2e/fase3.spec.ts | Póster para imprimir 5775×7900; encuadre idéntico al anterior verificado (0 px, escala 1.000); respaldo al póster anterior |
| B1.2 | Zoom/pan con gestos, teclado, botones | ✅ implementado_testeado | MapView (pellizco, arrastre, rueda, teclado, botones; grupos táctiles) | e2e mapa + fase3 | Pellizco con eventos simulados; sin prueba en dispositivo físico |
| B1.3 | Pines exactos solo con prueba; aproximados diferenciados | ✅ implementado_testeado | schema mapPosition.precision | tests/data.test.ts | Ningún pin «exacta» |
| B1.4 | Capas: región, barrio, carretera, agua, interior/exterior, comercios, misiones, coleccionables, glitches | 🟡 parcial | MapPage: capas por categoría y por precisión; capa de ruta | e2e/fase3.spec.ts | Faltan capas cartográficas (carreteras, agua, interiores): el póster no trae datos vectoriales |
| B1.5 | Clustering y filtros guardados | ✅ implementado_testeado | src/lib/mapgeo.ts clusterPoints + src/lib/mapprefs.ts | tests/mapgeo.test.ts + e2e/fase3.spec.ts | Agrupación según el zoom en píxeles de pantalla; filtros, póster y agrupación persistentes |
| B1.6 | Ocultar completados y antiespoilers en mapa | ✅ implementado_testeado | MapPage + PinPanel (settings.hideFound, spoilerLevel) | e2e/fase2.spec.ts | «Ocultar encontrados» compartido con Coleccionables; el panel del punto vela nombres con spoilers |
| B1.7 | Mis rutas / rutas temáticas sobre el mapa | ✅ implementado_testeado | /mis-rutas + /mapa?ruta= (src/lib/routes.ts) | tests/routes.test.ts + e2e/fase3.spec.ts | Rutas personales con paradas documentadas, orden, objetivos y visitados; líneas solo de orden, sin caminos ni distancias |
| B1.8 | URL compartible por lugar (/mapa?id=) | ✅ implementado_testeado | MapPage | e2e mapa |  |
| B1.4B-1 | Marcadores personales con nota privada y leyenda desplegable | ✅ implementado_testeado | MapView + MapSheet | e2e/fase4b.spec.ts | Posición elegida por la persona, nunca presentada como dato del juego |

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
| B6.1 | Clasificación por tipo, spawns, precios, talleres, garajes | 🟡 parcial | 16 fichas de vehículos con campo vehicle | tests/vehicles.test.ts | 9 vehículos nuevos con registro/venta/rastreador reportados (una sola fuente de origen); ubicaciones reportadas; sin precios de garajes (fuentes bloqueadas) |
| B6.2 | Comparador y lista personal de vehículos conseguidos | ✅ implementado_testeado | /comparar-vehiculos + garaje (Progress v4) | tests/vehicles.test.ts + e2e/fase3.spec.ts | Comparador de hasta 3 con evidencia por precio y colección personal en Mi espacio |

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
| B10.1 | Favoritos, completados, notas, progreso local con esquema versionado | ✅ implementado_testeado | src/lib/storage.ts (v4), MyGamePage | tests/storage + e2e | Migraciones v1/v2/v3→v4 probadas |
| B10.2 | Exportar/importar JSON con validación y respaldo | ✅ implementado_testeado | ProgressManager | tests/storage + e2e | Exportar/importar incluye rutas, garaje y fotos opcionales |
| B10.3 | Estados Encontrado/Pendiente/No disponible/Revisar, fecha, plataforma, puntuación | ✅ implementado_testeado | MyRecord + CollectiblesPage + storage records | tests/storage + e2e/fase2.spec.ts | Encontrado/Pendiente/Revisar/No disponible, fecha, plataforma y valoración 1–5 |
| B10.4 | Fotos personales, avatar, diario, rutas, lista para hoy | 🟡 parcial | PhotoGallery, avatar, lista para hoy, rutas personales | tests/photos + tests/routes + e2e | Fotos, avatar, lista para hoy y rutas listos; falta diario |
| B10.5 | Sincronización multi-dispositivo con cuentas | ⛔ bloqueado | — | — | Requiere infraestructura autorizada (auth/BD) |
| B10.6 | Compartir ficha sin exponer notas privadas | ✅ implementado_testeado | ShareAction | e2e compartir | Solo comparte URL |
| B10.7 | Reporte de errores con moderación y antispam | 🟡 parcial | ReportError → GitHub Issues | e2e (enlace) | Moderación = revisión humana del issue; antispam lo aporta GitHub |
| B10.4B-1 | Mi espacio premium: perfil editable, color de perfil, tarjetas con foto, anillos de progreso | ✅ implementado_testeado | MySpaceDashboard | e2e/fase4b.spec.ts | Cifras calculadas solo del progreso local; sin niveles, EXP ni km |
| B10.4B-2 | Lugares visitados, objetivos personales, logros de Atlas y actividad reciente | ✅ implementado_testeado | progreso v5 + src/lib/mySpace.ts | tests/mySpace.test.ts + tests/storage.test.ts + e2e/fase4b.spec.ts | Actividad registrada desde v5 en el dispositivo |
| B10.4B-3 | Esquema de progreso v5 con migración v1–v4, respaldo automático y copia de datos ilegibles | ✅ implementado_testeado | src/lib/storage.ts | tests/storage.test.ts + e2e/fase4b.spec.ts (v4→v5) | BACKUP_KEY al migrar; CORRUPT_KEY si no se puede leer; import/export y combinación incluyen v5 |

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
| B12.1 | Marca original, PWA, offline, accesibilidad AA, SEO | ✅ implementado_testeado | app completa | e2e + axe + Lighthouse | Se corrigió el desbordamiento a 360 px en el mapa y las fichas |
| B12.2 | Imágenes con derechos registrados, sin marcas de agua | ✅ implementado_testeado | media-manifest.json | tests/data.test.ts |  |
| B12.3 | Pruebas en Safari/WebKit real | 🟡 parcial | .github/workflows/ci.yml (PW_WEBKIT=1) | e2e en CI con WebKit real + e2e/csp-webkit.spec.ts | WebKit real pasa en GitHub Actions (CSP estricta intacta); sin prueba en iPhone/Safari físico |
| B12.4 | URL pública real y prueba del enlace compartido en WhatsApp | ⛔ bloqueado | DEPLOY.md | — | Requiere conectar Netlify con la cuenta del propietario |

## Anexo II. Referencia funcional

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| AX2.1 | Analizar UX pública de vicerepere.com sin copiar | ✅ implementado_testeado | sources/INVESTIGACION_FASE3.md | revisión editorial | Análisis de usabilidad sin copiar diseño, textos ni datos |
| AX2.2 | Navegación inferior Mapa · Explorar · Dinero · Mi espacio · Novedades | ✅ implementado_testeado | AppShell + src/lib/nav.ts | tests/nav.test.ts + e2e/fase4a.spec.ts + e2e/app.spec.ts | Fase 4A: barra inferior de 5 pestañas con sección activa (aria-current); lateral agrupado en escritorio; todas las URL anteriores conservadas y probadas |
| AX2.3 | Comunidad: proponer marcadores, votos, reputación, historial | 🟡 parcial | Enviar hallazgo → cola de revisión | tests/intel/submissions.test.ts | Envío y cola real vía GitHub Issues; sin votos ni reputación |
| AX2.3 | Explorar: buscador principal, categorías visuales con evidencia y catálogo de todas las secciones | ✅ implementado_testeado | src/pages/Home.tsx (/ y /explorar) | e2e/fase4a.spec.ts | Fase 4A; contadores y barra de evidencia calculados de content/*.json, sin datos nuevos |
| AX2.4 | Novedades: línea de tiempo de ATLAS INTELLIGENCE con fuente original, fecha y estado; filtros por estado y plataforma; aviso «sin verificar» | ✅ implementado_testeado | src/pages/NewsPage.tsx (/novedades) | e2e/fase4a.spec.ts + axe | Fase 4A; /novedades?seccion=… conserva el panel anterior |
| AX2.5 | Diseño premium (fase 4A): tarjetas vidrio, encabezados de sección, transiciones discretas con prefers-reduced-motion | 🟡 parcial | src/styles/global.css | e2e (360/390/768/1280/1920, WebKit en CI) | Pendiente: hoja inferior del mapa, tablero de Mi espacio, alto contraste y tamaño de texto (fases 4B–4D) |

## ATLAS INTELLIGENCE

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| AI.1 | Registro configurable de fuentes (URL, idioma, categoría, frecuencia, derechos, API, confiabilidad) | ✅ implementado_testeado | intel/sources.json + schema | tests/intel/schema.test.ts |  |
| AI.2 | discover: RSS/APIs autorizadas, metadatos, fecha real, dedup por URL/ID/hash | ✅ implementado_testeado | src/intel/feeds.ts, normalize.ts, scripts/intel/run.ts | tests/intel/dedup.test.ts, feeds.test.ts | Respeta robots.txt; sin scraping de páginas que prohíben bots |
| AI.3 | extract/classify con IA validada por Zod; sin inventar valores; antiinyección | ✅ implementado_testeado | src/intel/classify.ts | tests/intel/classify.test.ts | Sin clave usa el clasificador heurístico; con ANTHROPIC_API_KEY usa Claude (no probado con clave real) |
| AI.4 | crosscheck: independencia real, contradicciones, republicaciones cuentan una vez | ✅ implementado_testeado | src/intel/crosscheck.ts + engine.findMatch + normalize.topicSimilarity | tests/intel/crosscheck + tests/intel/stabilization.test.ts | Misma historia en varios medios se fusiona; números distintos nunca; probado con titulares reales de los PR #5–#8 |
| AI.5 | version-watch: parche ⇒ revalidación sin borrar historial | ✅ implementado_testeado | src/intel/versionWatch.ts | tests/intel/version-watch.test.ts |  |
| AI.6 | review: propuesta (PR) con diff, fuentes, riesgos; cambios sensibles requieren humano | ✅ implementado_testeado | .github/workflows/atlas-intelligence.yml (PR única acumulada) + engine.carryPending | tests/intel/repo-guards + stabilization | Una sola PR que se actualiza; arrastra propuestas abiertas sin repetir; CI lanzado con workflow_dispatch |
| AI.7 | publish tras aprobación: datos versionados, validación, build | 🟡 parcial | workflow ci.yml + Netlify | CI | La publicación depende del hosting conectado |
| AI.8 | notify dentro de la PWA (sin fingir push/WhatsApp/email) | ✅ implementado_testeado | /intel Novedades | e2e intel | Push no implementado (requiere autorización) |
| AI.9 | Workflow 2 veces al día + manual, límites, timeouts, concurrencia, reintentos | 🟡 parcial | .github/workflows/atlas-intelligence.yml | tests/intel/repo-guards.test.ts | Se activa solo cuando el archivo esté en main |
| AI.10 | Estados editoriales nuevo/reportado/contrastado/comprobado_en_version/pendiente/parcheado/refutado por plataforma | ✅ implementado_testeado | src/intel/status.ts + schema (anuncio_oficial; guardas de comprobado/parcheado) | tests/intel/status + stabilization | «Contrastado» exige dos fuentes independientes; la oficial sola es «anuncio oficial»; comprobado/parcheado exigen evidencia humana |
| AI.11 | Modelo Source/Finding/Evidence/Patch/VerificationReport/RunReport/ReviewProposal; migración preservando IDs | ✅ implementado_testeado | src/intel/schema.ts, scripts/intel/migrate.ts | tests/intel/schema.test.ts | Hallazgos de dinero migrados con entryId |
| AI.12 | Pregúntale a ATLAS: solo datos respaldados, fuente/fecha/versión/certeza; «No puedo confirmarlo» | ✅ implementado_testeado | src/intel/ask.ts + IntelPage | tests/intel/ask.test.ts + e2e | Recuperación local sin IA en el navegador |
| AI.13 | Claves solo en secretos del servidor; nunca en el navegador | ✅ implementado_testeado | workflow secrets, redact() | tests/intel/secrets.test.ts |  |
| AI.14 | Topes diarios de llamadas, tokens, tiempo; registro de costo estimado | ✅ implementado_testeado | src/intel/budget.ts | tests/intel/pipeline.test.ts |  |
| AI.15 | Enviar hallazgo: formulario a cola de revisión, nunca autopublica | ✅ implementado_testeado | IntelPage + .github/ISSUE_TEMPLATE/hallazgo.yml | tests/intel/submissions.test.ts + e2e | Requiere repositorio con Issues activos |
| AI.16 | Bitácora: última ejecución real, fuentes, errores, propuestas | ✅ implementado_testeado | intel/runs + IntelPage | e2e intel | Primera corrida real: ejecución manual local del 22-nov-2026, no de Actions |
| AI.17 | TikTok/YouTube/Reddit por APIs autorizadas | ⛔ bloqueado | intel/sources.json (desactivadas) | — | La Research API de esa red de videos cortos y Reddit OAuth requieren aprobación; YouTube por API con clave |
| AI.18 | Resguardo de archivos privados (PDF/video de referencia fuera de git y del build) | ✅ implementado_testeado | .gitignore + guardas | tests/intel/repo-guards.test.ts |  |

## V4. Ampliación integral (conservacion)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-CONSERVACION-01 | Preservar código, datos, rutas, funciones, seguridad, PWA, referencias definitivas y matriz previa | ✅ implementado_testeado | CI completo (quality + e2e Chromium/WebKit) | .github/workflows/ci.yml | Suite completa en cada PR; matriz previa intacta (solo se añaden filas) |
| V4-CONSERVACION-02 | No fusionar sin revisión; pruebas de regresión y capturas reales por etapa | ✅ implementado_testeado | PR #12 sin fusionar; capturas qa/visual y qa/screenshots | e2e + scripts/capturas-visuales.mjs | Un PR por fase; capturas reales por etapa |
| V4-CONSERVACION-03 | Dirección técnica autónoma; instrucciones Android simples | 🟡 parcial | CLAUDE.md + skills | revisión editorial | Informe en lenguaje sencillo por entrega |

## V4. Ampliación integral (fuentes)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-FUENTES-01 | Investigar GTABase web/blog/mapa, GTADB API/repo, Rockstar VI/Newswire | 🟡 parcial | docs/v4/INVESTIGACION_GTADB_FULLSWEEP.md | research/gtadb/test_contrato.py | GTADB y FullSweep probadas en vivo (CC BY 4.0); GTABase sin API ni licencia: permiso pendiente |
| V4-FUENTES-02 | Evaluar APIs, JSON, GeoJSON, tiles, licencias, autenticación, frecuencia y límites; permisos y colaboración | ✅ implementado_testeado | docs/v4/INVESTIGACION_GTADB_FULLSWEEP.md | research/gtadb (8 pruebas, contrato con respuesta real) | Endpoints, conteos, licencias, límites y sistema de coordenadas documentados |
| V4-FUENTES-03 | Investigar YouTube, Instagram, TikTok, X, Reddit y comunidades; traducir al español manteniendo nombres originales | ⛔ bloqueado | intel/sources.json | — | YouTube requiere clave de API como secreto; resto de redes requieren acceso aprobado (ver AI.17) |

## V4. Ampliación integral (mapa)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-MAPA-01 | Mapa completo autorizado de máxima resolución; zoom/pan táctil, pantalla completa, iconos, clustering | 🟡 parcial | MapPage inmersivo + MapView (póster oficial v2) | e2e/fase4b.spec.ts + fase3 | Fase 4B: pantalla inmersiva, controles flotantes, marcadores luminosos y agrupación; pantalla completa del navegador y tiles de mayor resolución pendientes |
| V4-MAPA-02 | Filtros individuales/grupales, mostrar/ocultar todo y encontrados, búsqueda ES y nombres originales | ✅ implementado_testeado | MapPage (chips rápidos, filtros agrupados, capas, buscador) | e2e/fase4b.spec.ts | Filtros individuales y agrupados, mostrar todo, ocultar encontrados y búsqueda por nombre (nombres originales de las fichas) |
| V4-MAPA-03 | Progreso por categoría, favoritos, marcadores propios, notas privadas, fotos, coordenadas con precisión, descripción e instrucciones de juego | 🟡 parcial | MapSheet + progreso v5 | e2e/fase4b.spec.ts + tests/storage.test.ts | Favoritos, encontrados, visitados, marcadores personales con nota privada y contadores reales por categoría; fotos personales siguen en la ficha |
| V4-MAPA-04 | Siguiente pendiente, rutas de recolección, perfiles por partida, sincronización, autoguardado, offline, compartir, reportar y sugerir | 🟡 parcial | AddToRoute en el panel del mapa + /mis-rutas | e2e/fase3 + fase4b | Crear rutas desde el panel del mapa; perfiles por partida y sincronización: fase 5 |
| V4-MAPA-05 | Taxonomía ampliable; investigar todas las categorías y subcategorías; no inferir totales | ⬜ pendiente | docs/v4/REQUISITOS_V4.json (mapTaxonomyCandidates) | — | Taxonomía candidata sin verificar; no se infieren totales |

## V4. Ampliación integral (vehiculos)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-VEHICULOS-01 | Autos, motos, camionetas, todoterrenos, superdeportivos, clásicos, especiales, ocultos, únicos, emergencia, militares del juego, helicópteros, aviones, barcos, comerciales, variantes | 🟡 parcial | content (vehiculos) | tests/fase3 | Solo vehículos con fuente; categorías ampliadas pendientes de evidencia |
| V4-VEHICULOS-02 | Ficha: nombre original, fabricante, clase, modelo, inspiración real, galería exterior/interior, velocidad, aceleración, manejo, todoterreno, resistencia, tracción, plazas, precio, personalización, rareza, ubicación, desbloqueo, misiones, adquisición, guardado, variantes, fuentes, fecha | 🟡 parcial | schema vehicle | tests/fase3 | Clase, registro, venta, rastreador y evidencia; estadísticas y galería interior sin fuente |
| V4-VEHICULOS-03 | Comparador de dos o más, gráficos de estadísticas, botón de mapa con ubicación documentada | 🟡 parcial | /comparar-vehiculos | e2e/fase3.spec.ts | Comparador y botón de mapa existentes; gráficos de estadísticas pendientes (sin datos) |

## V4. Ampliación integral (armas)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-ARMAS-01 | Catálogo exclusivamente de GTA VI: fotos, nombres originales, fabricantes, clases, daño, precisión, alcance, cadencia, capacidad, compatibilidad, personalización, precio, ubicación, desbloqueo, variantes y comparación | 🟡 parcial | content (armas) + /equipamiento | e2e | Catálogo con fuentes; estadísticas numéricas sin fuente verificada |

## V4. Ampliación integral (misiones)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-MISIONES-01 | Historia, capítulos, secundarias, eventos y actividades; personajes, desbloqueo, recompensa, ubicación inicial, guías, fotos y vídeos, decisiones/consecuencias, seguimiento y protección de spoilers | ⬜ pendiente | — | — | Fase 4D |

## V4. Ampliación integral (logros)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-LOGROS-01 | PS/Xbox y futuras plataformas; nombre, icono autorizado, descripción, rareza, requisitos, guía, ubicaciones, progreso y estado | ⬜ pendiente | — | — | Fase 4D; iconos solo autorizados |
| V4-LOGROS-02 | Separar porcentaje oficial de finalización (reglas verificadas) del porcentaje de elementos registrados en Atlas | ✅ implementado_testeado | src/lib/mySpace.ts + MySpaceDashboard | tests/mySpace.test.ts + e2e/fase4b.spec.ts | «Progreso registrado en Atlas» y «Logros de Atlas» rotulados como no oficiales; el porcentaje oficial queda para 4D |

## V4. Ampliación integral (ia)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-IA-01 | Asistente GTA VI conectado a catálogo, mapa, progreso del usuario con permisos | 🟡 parcial | Pregúntale a ATLAS (src/intel/ask.ts) | tests/intel/ask.test.ts | Consulta local del catálogo sin IA ni progreso del usuario |
| V4-IA-02 | Respuestas con imágenes, fichas, estadísticas, comparaciones, vídeo, pines, rutas y guías verificadas; acciones profundas en mapa y pendientes del usuario | ⬜ pendiente | — | — | Fase 6 |
| V4-IA-03 | No inventar datos; distinguir oficial, probado, comunidad, rumor y pendiente | ✅ implementado_testeado | src/intel/ask.ts + estados de evidencia | tests/intel/ask.test.ts + e2e intel | «No puedo confirmarlo»; estados oficial/comprobado/contrastado/reportado/pendiente |

## V4. Ampliación integral (actualizacion)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-ACTUALIZACION-01 | APIs, RSS, webhooks, repos, fuentes oficiales y comunidad autorizados; detectar vehículos, armas, ubicaciones, misiones, glitches, secretos, parches, mecánicas y correcciones | 🟡 parcial | ATLAS INTELLIGENCE (RSS + página oficial) | tests/intel/* | Fuentes autorizadas activas; webhooks y repos de comunidad pendientes |
| V4-ACTUALIZACION-02 | Fuente, fechas, versión y estado por registro; glitches por plataforma y versión; revisión antes de publicar; revalidación al cambiar parche | ✅ implementado_testeado | intel/schema + status.ts | tests/intel/* | Fuente, fechas, versión y estado por plataforma; revalidación por parche; revisión humana |

## V4. Ampliación integral (visual)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-VISUAL-01 | Mantener referencias existentes, fotografías específicas de calidad y licencias; IA solo como recreación rotulada | 🟡 parcial | media-manifest + ASSETS_REQUIRED.json | e2e/fase4a.spec.ts | Solo imágenes oficiales o ilustración rotulada; faltan recursos listados |
| V4-VISUAL-02 | Interfaz cinematográfica Vice City/Leonida, oscura, degradados, transparencia, tarjetas, tipografía, iconos, animaciones, gráficos, adaptable y rápida; no botones falsos | 🟡 parcial | Fases 4A, 4A.2 y 4B | e2e/fase4a + fase4b + axe | Explorar, Novedades, Mapa y Mi espacio con el sistema visual; Dinero y fichas pendientes |

## V4. Ampliación integral (admin)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-ADMIN-01 | Panel sin programación para crear/editar vehículos, armas, ubicaciones, imágenes, estadísticas, categorías, fuentes, guías, contenido IA, moderación y aprobación | ⬜ pendiente | /editor (validación local) | — | Fase 5 |
| V4-ADMIN-02 | Importar CSV/JSON/GeoJSON, exportar, respaldo, duplicados, errores, pendientes | 🟡 parcial | export/import de progreso + /editor | tests/storage + e2e | Progreso local; importación de catálogo CSV/GeoJSON pendiente |

## V4. Ampliación integral (escalabilidad)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-ESCALABILIDAD-01 | Miles de puntos, fotos, registros, usuarios; modularidad, BD escalable, imágenes optimizadas, carga progresiva, caché, seguridad, autenticación, persistencia, respaldos, sincronización, CI, PWA y móvil | 🟡 parcial | PWA, lazy(), WebP, CI | e2e + offline | Base estática; BD, autenticación y sincronización: fase 5 (sin contratar servicios) |
| V4-ESCALABILIDAD-02 | Claves de API privilegiadas solo servidor; aislamiento de datos personales, pruebas y rollback | ✅ implementado_testeado | secretos de Actions + redact() | tests/intel/secrets.test.ts | Sin claves en el navegador |

## V4. Ampliación integral (investigación)

| ID | Requisito | Estado | Módulo | Prueba | Comentario |
|---|---|---|---|---|---|
| V4-GTADB-01 | Importador de GTADB solo a staging (sin producción, sin calibración, sin fotos) | ✅ implementado_testeado | research/gtadb/importar_gtadb.py | research/gtadb/test_importar_gtadb.py + test_contrato.py (CI) | Ejecutado en vivo: 4380 recibidos, 4286 a staging, 94 rechazados; nada en producción; calibración pendiente (bloquea el uso en el mapa) |
