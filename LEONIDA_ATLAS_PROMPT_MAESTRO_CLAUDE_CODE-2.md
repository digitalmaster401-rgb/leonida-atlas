# PROMPT MAESTRO PARA CLAUDE CODE
## LEONIDA ATLAS — Edición pública, original y verificable
**Encargo del propietario | 21 de noviembre de 2026**

> Copia TODO este documento en Claude Code y coloca en el directorio de trabajo la carpeta `LEONIDA_ATLAS_GTA6` de la entrega previa. Trátala únicamente como punto de partida técnico; NO es una versión publicable. Ejecuta el proyecto y edítalo, no me entregues solamente ideas, un plan, maquetas, pseudocódigo ni promesas. No solicites confirmación para decisiones técnicas corrientes; cuando una cuenta, licencia o permiso de publicación requiera mi intervención, déjame un único paso preciso y continúa con todo lo demás.

## 1. MISIÓN Y RESULTADO OBLIGATORIO

Actúa como un **equipo senior completo**: dirección creativa, frontend, UX/UI, datos, documentación, QA, accesibilidad, DevOps y verificación editorial. Convierte la carpeta existente en una **web app/PWA real y compartible** llamada **LEONIDA ATLAS**, guía interactiva de *Grand Theft Auto VI* en español de México. Debe verse como un producto terminado propio, ser excelente en teléfonos Android/iPhone y escritorio, y contar con información sustentada en fuentes actuales. No copies otros sitios ni te limites al video original. El video es referencia de investigación *privada*, no es un recurso de la app ni material promocional. Una persona que llegue por primera vez debe entender qué ofrece, navegar sin instrucciones, consultar información verificable y compartir una ficha con un amigo.

**Entrega final:** repositorio completo editable, aplicación compilada sin errores, pruebas automatizadas, inventario auditable de fuentes e imágenes, instrucciones de despliegue y, si tienes acceso autorizado a hosting, URL pública real probada desde móvil. Si no tienes autorización de despliegue, no inventes la URL: deja el build de producción y el comando exacto para publicar. No se aceptan secciones simuladas ni botones sin acción.

## 2. LIMPIEZA DE MATERIAL AJENO — BLOQUEANTE

Analiza primero la carpeta. El proyecto anterior contiene 52 registros de datos, 6 regiones, reproductor del video original de 17:44, 21 marcadores, 49 fotogramas y una portada basada en capturas. **ESOS RECURSOS NO SON PUBLICABLES EN LA NUEVA VERSIÓN**.

- **No incluir ni distribuir** `assets/video-guia.mp4`, `assets/frames/`, `assets/hd/`, la portada anterior `assets/portada-1920x1080.jpg` ni la copia original del MP4. Su contenido fue facilitado como referencia privada; no tenemos permiso de republicación ni de reutilización del creador original.
- Eliminar todas las referencias de `app.js`, `styles.css`, `index.html`, `data.js`, `datos-fuentes.json`, metadatos, manifest, precache, páginas de video, tarjeta de inicio, modal, thumbnails, CSS y documentación. No debe quedar un solo `video_stops`, `timg()`, enlace, `background-image`, o ruta que reutilice esos recursos. Inspecciona también las imágenes por si contienen logos, texto o firmas.
- **No recortes, difumines, tapes ni borres marcas de agua** para presentar imágenes ajenas como propias. Sustituye el material por recursos de procedencia legítima, nuevos y adecuados al tema.
- No mostrar TikTok, marcas de creadores, nombres de canales, identificadores, overlays de streamers, patrocinadores ni títulos derivados de esos videos. Las citas bibliográficas discretas **sí deben existir** cuando una fuente apoya un dato; referenciar investigación no es promocionar al creador.
- No usar automáticamente el logotipo oficial de Rockstar como logo de la app. Crear isotipo **original** de LEONIDA ATLAS (por ejemplo, monograma L / trazo de brújula), favicon, app icons y sistema de diseño propios.
- Elimina o reescribe la sección “Video analizado” del sitio público. Puede reemplazarse por “Rutas y tutoriales” con pasos, mapas, galerías y recursos elaborados para este proyecto, siempre que sean propios o autorizados.

**Auditoría obligatoria:** búsqueda recursiva de cadenas `tiktok`, `creator`, `watermark`, `video-guia`, `assets/frames`, `assets/hd`, `portada-1920x1080`, `video_stops`, nombres del creador y rutas obsoletas. Informe el número de coincidencias y por qué las restantes son aceptables (idealmente cero en el build público). No dejar vínculos rotos.

## 3. VERACIDAD: EL CONTENIDO MANDA

GTA VI salió el **19 de noviembre de 2026** para PS5 y Xbox Series X|S, según Rockstar/Take-Two; el contenido pos-lanzamiento se encuentra en rápida evolución. La guía debe mostrar **“Última revisión”** con fecha real por ficha y **“Actualizado para versión/parche”** cuando aplique. No digas “guía definitiva de todo” como prueba de exhaustividad: la marca puede ser ambiciosa, pero los datos deben estar auditados.

**Jerarquía de fuentes:** 1) Rockstar Games / Take-Two / documentación oficial y material descargable; 2) comprobación en una partida real y captura original autorizada; 3) guías reputadas con fecha y pruebas; 4) comunidad (etiquetada «reportado/no reproducido»). Corrobora con dos fuentes independientes cuando se trate de pagos, posiciones exactas o glitches. Una única fuente no oficial = «reportado» hasta verificar.

Recursos primarios para comenzar:
- Lanzamiento: https://www.rockstargames.com/mx/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available
- Juego oficial: https://www.rockstargames.com/VI
- **Galería oficial:** https://www.rockstargames.com/VI/launch-gallery
- **Descargas oficiales, mapas, capturas y arte:** https://www.rockstargames.com/VI/media
- Política de contenido fan: https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material
- Términos y pautas: https://www.rockstargames.com/mx/legal y https://www.rockstargames.com/mx/community-resources/mod-guidelines

Para cada ficha registrar: `id`, `slug`, `nombre_en_juego`, `categoría`, `región`, `subzona`, `descripción`, `cómo_obtener_o_realizar`, `requisitos`, `capítulo`, `plataforma`, `parche`, `coste_o_recompensa`, `tiempo_estimado_si_verificable`, `riesgos_y_limitaciones`, `fuentes[]` con URL/autor/fecha/acceso, `verifiedAt`, `estado` (oficial | comprobado | contrastado | reportado | pendiente | obsoleto), `image[]` con descripción, copyright, licencia/permiso y crédito discreto, `mapPosition` SOLO si está fundamentada, y `spoilerLevel`.

**Revisar una por una las 52 fichas existentes** y clasificarlas. NO mantener un dato solo para conservar la cantidad. Eliminar/archivar lo falso, duplicado, anterior al lanzamiento o tomado de GTA V/GTA Online como si fuera GTA VI. Entregar `AUDITORIA_DATOS.md` con decisión, enlaces y justificación por ficha. Si una ficha queda pendiente, que no aparezca como confirmada.

**Dinero y glitches:** separar modo historia y modo online (no mezclar). Para cada método incluir requisitos, paso a paso verificable, dinero **neto realmente recibido** frente a valor nominal del botín, duración reproducible, condiciones, parche/consola, prueba y riesgo de que deje de funcionar. No prometer «dinero infinito». No incluir scripts de trampas, bots ni vulneración de servicios en línea, ni mecanismos para evadir sanciones. No probar exploits en cuentas del usuario sin autorización. Identificar claramente «método legal dentro del juego», «glitch reportado» o «ya parcheado».

**Mapa:** es preferible no poner un pin que inventar una ubicación. Si la cartografía oficial descargable admite ese uso, crear visor de alta resolución con zoom/pan y puntos respaldados en evidencia visual/partida; en caso contrario, crear esquema original, rotulado claramente «mapa orientativo», con enlaces al mapa oficial. Nada de GPS ficticio presentado como precisión real. No asignar al azar una foto a un lugar.

## 4. IMÁGENES REALES, ORIGINALES Y LEGÍTIMAS

Usa imágenes **reales del videojuego** cuando exista autorización para ese uso: capturas personales del propietario, recursos oficiales de Rockstar ofrecidos para compartir y material de prensa/fans compatible con condiciones y uso no comercial. **Revisa permisos antes de alojar y redistribuir un archivo.** Conserva una atribución editorial discreta en la ficha o en la página legal cuando corresponda; esto NO significa poner logos o publicidad de otros creadores en las imágenes.

Si no hay una imagen real apropiada:
- Producir **ilustraciones editoriales originales** (vectorial, CSS, 3D/IA mediante un servicio autorizado y disponible) con estética similar a un thriller urbano costero, sin copiar poses, cuadros o arte promocional concretos.
- Toda imagen sintética debe indicar «Ilustración editorial» donde exista riesgo de confundirla con captura real o evidencia de ubicación.
- No generes una supuesta pantalla de gameplay, un arma exacta, un mapa, un icono de marca o un sitio de negocio ficticio y lo presentes como real.
- Claude Code **no puede asumir** acceso a un generador de imágenes: si no está conectado, utiliza composiciones originales CSS/SVG o solicita la conexión concreta. Nunca utilices enlaces de imagen ficticios.
- La imagen de cada ficha debe corresponder al objeto o zona mostrada. Evita repetir la misma captura para temas distintos. Si no hay imagen, usar una ilustración temática etiquetada.

Sistema visual de medios: miniatura ligera AVIF/WebP optimizada, `srcset` para pantallas retina, imagen original ampliable en lightbox, `alt` semántico, carga diferida, peso controlado, sin marcas de agua. No afirmar «Full HD nativo» si solamente es un reescalado. Mantener `assets/media-manifest.json` con fuente, derechos, tratamiento y archivo.

## 5. DISEÑO UX/UI: PRODUCTO PREMIUM PROPIO

Nombre de producto: **LEONIDA ATLAS**. No parece un blog, PDF ni un clon de GTA. Visual cinematic, elegante, legible y rápido: negro carbón/azul noche, magenta neón y cian de ciudad costera, lima únicamente para CTAs/estados importantes; tipografía deportiva/editorial con licencia de uso. Interfaz 100 % en español de México, nombres de armas/vehículos/lugares tal como aparecen en el juego y correcciones explicativas en español sin inventar traducciones.

- **Inicio:** portada cinematográfica original, navegación inmediata, buscador global, categorías clave, regiones, «Empieza aquí», novedades verificadas y «mejores métodos» basados en cálculos y evidencia.
- **Móvil (primero):** navegación inferior compacta, búsqueda superior, filtros en chips, fichas con grandes imágenes, sin horizontal overflow, zonas táctiles mínimas 44 px; escritorio con barra lateral y espacios bien aprovechados.
- Tarjetas visuales: imagen relevante; nombre original; tipo; zona; nivel de evidencia; acceso a ficha y favorito.
- Ficha: galería real, mapa/posición aproximada si hay evidencia, instrucciones paso a paso, requisitos, recompensa o características, alertas, fuente y fecha; botón «Guardar», «Marcar completado», «Compartir» que envíe URL profunda.
- Estados visuales para «Confirmado», «Reportado», «Obsoleto» SIN aparentar mayor certeza. Filtros por nivel de spoiler y por modo de juego.
- Animaciones discretas, skeletons solo cuando se requiere carga, accesibilidad WCAG AA, modo de movimiento reducido.
- Sin avisos invasivos, publicidad, botones falsos ni imágenes de stock genéricas.
- Branding: logotipo propio, íconos, tarjeta social Open Graph propia y colores coherentes. Incluir una nota legal pequeña: «Guía independiente de fans. Sin afiliación con Rockstar Games. GTA VI y sus contenidos son de sus respectivos titulares». No suplantar el logo oficial del videojuego.

## 6. FUNCIONES QUE DEBEN FUNCIONAR REALMENTE

1. Navegación entre Inicio, Mapa, Dinero y glitches, Armas, Vehículos, Negocios y propiedades, Rutas y tutoriales, Mi partida y Fuentes.
2. Buscador global tolerante a acentos, variaciones y errores leves; filtros combinables por región, categoría, capítulo, versión, certeza y spoiler; orden dinámico.
3. Vista mapa con zoom, pan, selección de puntos y leyenda (precisión declarada). Enlace con ficha, y no a la inversa solamente.
4. Fichas con URLs únicas tipo `/armas/nombre` o rutas equivalentes desplegables en host estático. Al compartir un enlace, abrir directamente la ficha sin error 404.
5. Favoritos, elementos completados, notas personales y progreso persistentes en el dispositivo con `localStorage` o IndexedDB, con manejo de versiones de esquema; exportar/importar JSON con validación y respaldo.
6. Botón «Compartir» (Web Share API cuando exista, fallback copiar enlace) y etiquetas OG para WhatsApp, Facebook y Discord; URL pública real en producción.
7. Calculadora de dinero con campos editables, unidades y fórmulas visibles, separación entre ingresos brutos/costos/ganancia neta y una etiqueta cuando hay estimaciones.
8. Galería fotográfica con lightbox, zoom, subtítulo y proveniencia. Videos solo si son **nuevos y con permiso**, nunca el video privado aportado como referencia.
9. Panel editorial de actualización local para el dueño (al menos import/export y validación de fichas). No poner un panel admin público inseguro. No inventar sincronización en la nube; si se configura con Supabase, crear auténtica autenticación, permisos RLS, migraciones y flujo completo de recuperación.
10. PWA instalable mediante manifest válido y service worker, cache controlada, página offline útil, actualización visible y botón de instalar cuando sea posible.
11. Protección de spoilers configurable con preferencia persistente.
12. Página «Fuentes y cambios», con enlaces activos y registros de actualizaciones/revisiones; botón para reportar errores mediante formulario de correo o enlace explícito que sí funcione (no almacenar supuestos reportes sin backend).

## 7. ARQUITECTURA Y CÓDIGO

Parte del directorio preexistente (`index.html`, `app.js`, `styles.css`, `data.js`, `datos-fuentes.json`, `build_data.py`, `CLAUDE.md`) pero estás autorizado a refactorizarlo completamente para calidad de producción. Recomiendo **Vite + React + TypeScript**, estilos Tailwind/CSS modular, React Router, Zod para validar contenido, Vitest y Playwright; modifica la selección si existe una razón técnica mejor y documéntala. Evita dependencias voluminosas innecesarias. Diseña componentes `AppShell`, `Search`, `FilterBar`, `CategoryGrid`, `ItemCard`, `DetailPage`, `EvidenceBadge`, `MapView`, `MoneyCalculator`, `Gallery`, `ProgressManager`, `SourcePanel` y `ShareAction`.

Datos desacoplados de componentes en JSON/TS validado; migrar con un script reproducible. No hardcodear números inventados. Estructura tipada, slugs estables, rutas válidas, estado sincronizado, inputs accesibles, manejo de errores y fallback offline. Para mapas con imágenes licenciadas usa un visor de imagen/Leaflet con overlay de coordenadas de imagen **solo verificadas**; jamás mapa geográfico ficticio.

**Seguridad:** sanitizar contenido externo, no interpolar HTML no confiable, no publicar claves/tokens, usar cabeceras apropiadas y políticas de dependencias. No solicitar usuario ni contraseña de Rockstar/PlayStation/Xbox. No usar tracking sin consentimiento. Poner copyright/autoría de las imágenes sin añadir publicidad externa.

## 8. INVESTIGACIÓN Y ENTREGA DE CONTENIDO

Investiga en web actual y fuentes oficiales: el mapa de Leonida, ciudades/regiones, tiendas Ammu-Nation y armas por tienda, armas gratis en mundo, vehículos y sitios de aparición/compraventa, negocios y propiedades realmente disponibles, misiones y desbloqueos, dinero y métodos repetibles, actividades, coleccionables y secretos. No inventes modelos, nombres, precios, cantidades ni mecánicas por analogía con GTA V. Separar información por `modo historia`, `modo online` o `sin confirmar`.

Por cada ficha de contenido: pasos claros, detalles del momento en que se desbloquea, una imagen pertinente/ilustración etiquetada, las fuentes exactas, la fecha, y una nota de diferencias por plataforma o parche. Empezar por los hallazgos mejor respaldados, no por inflar el catálogo. Preparar un inventario técnico de toda la investigación en `sources/` y un log de actualización.

**Mapa de fuentes oficial de imágenes:**
- https://www.rockstargames.com/VI/media
- https://www.rockstargames.com/VI/launch-gallery

**IMPORTANTE**: La existencia de imágenes oficiales descargables NO implica licencia irrestricta para redistribución, alterar logos, utilizarlo con fines comerciales o declararlo propiedad propia. Verificar términos vigentes y, si no permiten incorporarlo, enlazar la galería oficial y sustituir con ilustraciones propias claramente etiquetadas.

## 9. QA Y PRUEBAS DE ACEPTACIÓN — NO NEGOCIABLES

Implementa y ejecuta pruebas reales. Entrega reporte de resultados con capturas originales de las pruebas de navegador, no solo «todo funciona».

- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run test:e2e` pasan sin errores.
- Playwright en anchos 360, 390, 768, 1280 y 1920 px, y al menos un contexto móvil Android y WebKit de iPhone; navegación, búsquedas, filtros, tarjetas, galería, mapa, favoritos, notas, guardado, restauración, share y offline.
- Accesibilidad: navegación por teclado, foco visible, alt real, contraste WCAG AA, labels, modales cerrables con Escape, lectores de pantalla; `prefers-reduced-motion`.
- Lighthouse objetivo >= 90 rendimiento, accesibilidad y buenas prácticas en móvil **medidas**, no fingidas. Registrar condiciones, no obsesionarse con score si imágenes pesadas lo impiden; corregir el principal cuello de botella.
- Cero errores de consola, enlaces muertos, 404 locales, assets faltantes, imágenes rotas, controles inertes y componentes de ejemplo.
- Verificar imágenes contra manifiesto de derechos; buscar todas las rutas heredadas del video del tercero; registrar que no se distribuyen.
- Comprobar que cada URL compartida abre la ficha correcta en el hosting real y que el preview de WhatsApp tiene imagen propia y título.
- No declarar información como confirmada sin fuente o test. Generar reporte `QA_REPORT.md` y `AUDITORIA_DATOS.md`.
- Si un requisito depende de una cuenta externa, **no lo marques como completado** hasta ejecutarlo realmente; documenta exactamente el bloqueo.

## 10. PUBLICACIÓN Y ENTREGA

Preparar para Cloudflare Pages, Netlify o Vercel con rewrite SPA y compresión; elegir uno y dejar `DEPLOY.md` con paso a paso reproducible. Si el entorno tiene acceso autorizado, publicar y probar la URL real. Si no, completar todo salvo autenticación del servicio y explicitarlo; nunca usar una URL inventada. Crear `README.md`, `CLAUDE.md` actualizado, `LICENSE` solo para código propio, `ATTRIBUTIONS.md` solo con atribuciones legales reales y `CHANGELOG.md`. Prepara un ZIP de distribución **sin la carpeta del video ni fotogramas del tercero** y verifica su contenido.

**No se entrega una demo.** El sitio debe poder compartirse como proyecto original de mi autoría editorial y diseño de marca, con sus debidas declaraciones sobre derechos de GTA VI. Nunca atribuirme la titularidad de arte, fotos o personajes de Rockstar. No digas “publicado” ni “probado en móvil” sin haberlo comprobado.

## 11. ORDEN DE TRABAJO AUTÓNOMO

1. Audita el proyecto y crea lista de archivos a excluir; separa los assets prohibidos antes de ejecutar el build público.
2. Investiga documentación oficial y páginas actuales; clasifica 52 fichas, registra fuente/estado y descarta afirmaciones no fundamentadas.
3. Define diseño original, logo e iconografía, y sistema de imágenes legítimas.
4. Migra arquitectura/datos y construye interfaz completa, funcional y responsiva.
5. Implementa mapas sustentados, buscador, categorías, progreso, compartir, calculadora, fuentes y PWA.
6. Ejecuta pruebas de calidad y reparación hasta pasar. No omitas los estados vacíos ni la navegación directa a una ficha.
7. Prepara hosting, preview social, sitemap y configuración HTTPS. Publica **solo si** la cuenta de despliegue está autorizada.
8. Entrega exactamente: `URL pública` (si existe), `ZIP limpio`, código fuente, `AUDITORIA_DATOS.md`, `QA_REPORT.md`, `ATTRIBUTIONS.md`, `README.md` y resumen de pendientes reales.

### Definición estricta de TERMINADO

Un amigo recibe un enlace, abre LEONIDA ATLAS en su móvil, observa una portada original sin marcas de terceros, busca una localización, comprueba evidencia e imagen vinculada a esa ubicación, abre el mapa, marca su progreso, guarda la ficha, la comparte y vuelve otro día encontrando sus datos guardados. No hay links rotos, fotos ajenas recicladas, datos inventados ni logos de creadores. Si algo no es verificable, está claramente marcado y no se confunde con un hecho.

**EMPIEZA IMPLEMENTANDO: no me respondas solo con una propuesta de fases. Trabaja sobre archivos, ejecuta comandos, corrige fallos y enseña resultados comprobables.**
