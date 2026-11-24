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
