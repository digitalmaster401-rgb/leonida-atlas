# Siguiente etapa: diseño premium de LEONIDA ATLAS (plan)

Estado: **etapa 1 (Fase 4A) implementada** — barra de 5 pestañas, Explorar y Novedades (Paso 22, 24-nov-2026). Plan original del Paso 21A. Se conserva la identidad actual y todas las funciones.

## Identidad que se mantiene
- Fondo negro azulado `#0b0d14`, superficies `#121624 / #1a1f31 / #232a41`.
- Acentos: **magenta** `#ff3ea5` (marca, selección), **cian** `#22d3ee` (enlaces, información), **lima** `#c6ff3d` (acción principal, logros), ámbar para avisos.
- Tipografía: Barlow Condensed en mayúsculas para títulos e Inter para el texto. Logotipo y wordmark actuales.
- Evidencia siempre visible (insignias oficial / contrastado / reportado…), con el color como apoyo y nunca como única señal.

## Navegación prevista (barra inferior en móvil, lateral en escritorio)

| Pestaña | Contenido | Hoy está en |
|---|---|---|
| **Mapa** | Mapa oficial, capas, rutas personales | `/mapa`, `/mis-rutas` |
| **Explorar** | Buscador + categorías: lugares, armas, vehículos (comparador), negocios, coleccionables, trucos, consola, equipamiento, personajes, rutas | Menú y páginas sueltas |
| **Dinero** | Métodos, calculadora, glitches (con estado por plataforma) | `/dinero` |
| **Mi espacio** | Perfil, progreso, listas, fotos, rutas, garaje, equipamientos, respaldo | `/mi-espacio` |
| **Novedades** | ATLAS INTELLIGENCE: novedades, hallazgos en observación, bitácora, enviar hallazgo | `/intel`, `/novedades` |

- «Inicio» pasa a ser la portada de **Explorar** (buscador grande + accesos). La URL `/` se conserva.
- Las URL actuales no cambian. Cada pestaña agrupa rutas que ya existen; nada se elimina.

## Mejoras visuales propuestas
1. **Encabezados de sección** con degradado sutil magenta → cian sobre el negro y una línea lima de 2 px. Sin imágenes de terceros.
2. **Tarjetas «vidrio»:** borde de 1 px con brillo cian al enfocar y sombra suave; esquinas de 14 px; ritmo de 8 px.
3. **Mapa a pantalla completa en móvil:** el panel de filtros y la ficha del punto pasan a una hoja inferior deslizable (bottom sheet) de 3 alturas, con el cierre accesible por teclado.
4. **Explorar:** rejilla de categorías con contador y estado de evidencia; búsqueda persistente arriba.
5. **Mi espacio:** tablero con anillos de progreso (coleccionables, rutas, garaje) hechos en SVG/CSS, sin librerías ni estilos en línea.
6. **Novedades:** línea de tiempo con insignias de estado y filtro por plataforma, más un aviso claro de «sin verificar».
7. **Microinteracciones:** transiciones de 150–250 ms solo con `transform` y `opacity`; todas se apagan con `prefers-reduced-motion`.
8. **Modo alto contraste** opcional y tamaño de texto ajustable, guardados en las preferencias locales.

## Reglas técnicas para la implementación
- CSS propio con tokens en `:root`, sin `unsafe-inline` (CSP intacta) y sin frameworks de UI pesados.
- Accesibilidad AA (axe sin errores serios), objetivos de 44 px y foco visible.
- Probar 360 / 390 / 768 / 1280 / 1920 y WebKit real en CI.
- Carga: las páginas nuevas con `lazy()`. Presupuesto: paquete principal ≤ 300 kB sin comprimir y LCP móvil < 2.5 s en la prueba Lighthouse.
- Migración de navegación con pruebas E2E que recorran las 5 pestañas y todas las URL antiguas.
- Nada de Discord, cuentas ni monetización en esta etapa.

## Orden sugerido (Fase 4 — ATLAS COMPLETE)
1. Barra de 5 pestañas y páginas «hub» (Explorar, Novedades), manteniendo las URL.
2. Hoja inferior del mapa en móvil.
3. Tablero de Mi espacio.
4. Pulido visual (tokens, tarjetas, encabezados) y modo alto contraste.
5. Auditoría completa (Lighthouse, axe, WebKit) y actualización de la matriz.

---

## Referencias visuales aprobadas (24-nov-2026)

El propietario aprobó cuatro maquetas como dirección estética definitiva (`LEONIDA_ATLAS_BRIEF_VISUAL_OFICIAL.zip`, con `BRIEF_DISENO_REFERENCIA.md`). **Son maquetas, no capturas de la app** ni recursos para publicar: no se incluyen en el repositorio ni en el build. Sus datos (perfiles, niveles, EXP, km, «Monitoreo activo», canales conectados, marcadores del mapa) son ficticios y no se reproducen.

Lenguaje común: noche tropical cinematográfica, degradados magenta → azul, bordes neón dosificados (magenta para la selección, cian para la información), tarjetas con imagen y degradado oscuro para la legibilidad, títulos en cursiva y mayúsculas, una sola barra inferior **Mapa · Explorar · Dinero · Mi espacio · Novedades**. Se conserva el logotipo L/brújula del proyecto (las maquetas usan logotipos distintos y no se copian).

### Ya implementado en la Fase 4A (PR #12)
| Referencia | Implementación real |
|---|---|
| 01 Explorar | Portada panorámica con imagen oficial nocturna (`vc-skyline-noche`, con crédito), palmeras en silueta propias, barra «ATLAS EXPLORER» con buscador real, tarjeta editorial de 3 destacados (puntos, flechas y deslizamiento; sin reproducción automática), 4 accesos con imagen oficial (Mapa, Vehículos, Mis rutas, Mi espacio) y chip de versión enlazado al registro de cambios. |
| 04 Novedades | Bloques «Fuentes consultadas» (estado real de cada canal según `intel/sources.json` y la última corrida), «ATLAS Intelligence» (los 4 pasos reales del proceso), «Por verificar», «Novedades de LEONIDA ATLAS» (registro de cambios con imagen oficial) y línea de tiempo con miniaturas ilustradas. ATLAS WATCH se describe como propuesta, sin «Monitoreo activo». |
| Navegación | Barra inferior flotante con pestaña activa iluminada (borde y halo magenta), iconos brújula, monedas, persona y periódico. |

### Fase 4B — Mapa (referencia 03): implementado en el PR #12 (ver docs/FASE4B_QA.md)
- **Pantalla inmersiva en móvil:** el visor ocupa el alto disponible entre la cabecera y la barra inferior; buscador «Buscar en Leonida» arriba (filtra fichas con punto, `src/lib/search.ts`).
- **Chips de capa** desplazables (Todo · Vehículos · Coleccionables · Rutas · Lugares…) conectados a las capas existentes de `mapprefs` (persisten).
- **Botones flotantes** de 48 px a la derecha: capas, centrar, ruta activa, acercar y alejar (los controles actuales, restilizados).
- **Marcadores categorizados** con forma + icono + color (el color nunca es la única señal) y un anillo según la precisión (`region` / `zona` / `barrio` / `exacta`). Solo fichas con `mapPosition`; sin nombres de lugares, vías, escala en km ni pins que no estén en los datos.
- **Hoja inferior** de 3 alturas con la ficha del punto: imagen oficial o ilustración rotulada, categoría, estado de evidencia, precisión declarada y acciones reales (abrir ficha, añadir a ruta, marcar encontrado). Arrastrable, con cierre por teclado y foco gestionado; varias fichas se recorren con puntos como en la referencia.
- Base cartográfica: únicamente el póster oficial v2 ya incluido (`docs/MAPA_OFICIAL_V2.md`).

### Fase 4B — Mi espacio (referencia 02): implementado en el PR #12 (progreso v5 aprobado por el propietario)
- **Cabecera personal** con panorámica oficial nocturna y avatar opcional elegido por la persona (foto local en IndexedDB, nunca subida). Nombre editable guardado en el progreso local **solo si se acepta ampliar el esquema** (subir `SCHEMA_VERSION` con migración); si no, se omite.
- **Tarjetas con imagen** y cifras calculadas de datos reales: rutas guardadas, coleccionables encontrados / total (`content/collectibles`), vehículos en el garaje, fotos. **Progreso general** en anillo SVG = proporción real de encontrados.
- **Sin** niveles, EXP, km recorridos, zonas visitadas, eventos, desafíos ni amigos: no existen datos para calcularlos. Si se muestran, como «Próximamente» y sin cifras.
- **Actividad reciente** solo si se registran fechas reales en el progreso (requiere cambio de esquema aprobado); mientras tanto, accesos directos a cada lista.
- Se conservan respaldo, importación/exportación, migraciones v1→v4 y fotos.

### Fase 4C — ATLAS WATCH, plan
Canales de video y redes sociales solo con APIs autorizadas y gratuitas aprobadas por el propietario; estado mostrado = estado real de la última corrida; revisión humana obligatoria antes de publicar.
