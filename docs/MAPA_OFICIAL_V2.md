# Mapa oficial v2: integración, calibración y derechos

Fecha: 22-nov-2026. Rama: `claude/fase3-explorer-mapa`.

## Qué es
- Es el **«Leonida Map & Cover Art Poster»** de Rockstar Games, en su versión para imprimir. El propietario lo aportó en un ZIP con un JPEG CMYK de 5775×7900 px a 300 ppp.
- La página oficial https://www.rockstargames.com/VI/media lista ese póster con el texto «Get print-ready formats of the official game map and cover art poster».
- **No es un mapa creado por IA ni una reconstrucción de la comunidad.**
- Archivos integrados (nombres nuevos; el póster anterior se conserva intacto):

| Archivo | Tamaño | Peso |
|---|---|---|
| `public/media/official/mapa-oficial-leonida-v2-1200.webp` | 1200×1642 | 304 KB |
| `public/media/official/mapa-oficial-leonida-v2-2400.webp` | 2400×3283 | 1.0 MB |
| `public/media/official/mapa-oficial-leonida-v2-3840.webp` | 3840×5253 | 2.2 MB |

- El ZIP traía archivos con **los mismos nombres** que el póster anterior. Se renombraron a `-v2-` para no sobrescribirlo.
- Registro: `public/media/media-manifest.json` (id `mapa-oficial-leonida-v2`) y `sources/local-media.json`. Este segundo archivo hace que `npm run images` no lo borre.

## Calibración comprobada
- Se compararon el póster anterior (2805×3840) y el nuevo, ambos reducidos a 600 px de ancho:
  - Desplazamiento por correlación de fase: **0 px**.
  - Mejor escala: **1.000**.
  - Correlación: **0.96**. La diferencia restante es la corrección de color de CMYK a sRGB.
  - Proporción: 0.7305 contra 0.7310 (0.07 %).
- Conclusión: **mismo encuadre**. Las coordenadas normalizadas existentes señalan el mismo rótulo en los dos pósteres.
- Se revisó a ojo con el zoom en Ambrosia, Port Gellhorn, Grassrivers, Bayside, Crosstown, Key Lento y Vice City. Los pines quedan sobre sus rótulos.
- Hay una prueba automática (`tests/mapgeo.test.ts`) que exige que las dos versiones mantengan la misma proporción y que ningún punto salga del póster.
- No se añadió ninguna coordenada inventada. Los puntos nuevos de esta fase (Pegassi Infernus en Crosstown y Sirius Transgressor en Port Gellhorn) van sobre el **rótulo** de la zona, con precisión `barrio` o `zona` y su base explicada.

## Carga en móviles
- Siempre se carga primero la versión de 1200 px (≈300 KB).
- Encima solo se pide la resolución que la pantalla necesita: 2400 px o 3840 px, según el zoom y la densidad de píxeles, con un límite de densidad de 2×. Aparece cuando termina de cargar, sin parpadeo.
- Si el póster v2 no carga, el visor pasa al anterior y lo avisa. Hay una prueba E2E que simula el fallo.
- El selector «Póster» en «Capas y filtros» permite comparar los dos durante la revisión. La elección se recuerda.
- El *service worker* guarda las imágenes `/media/` a medida que se ven (CacheFirst). No precarga los 3.5 MB del póster.

## Derechos y límites
- © Rockstar Games / Take-Two Interactive. Se mantiene la atribución en el visor, en `ATTRIBUTIONS.md` y en el manifiesto. No se recortan ni ocultan marcas, leyenda ni textos.
- **La descarga pública no es una licencia.** Solo está permitido el uso no comercial de fans con atribución:
  - sin venta;
  - sin cobrar por acceder;
  - sin redistribuir el archivo con fines comerciales.
- La página de la política de Rockstar sobre material con derechos de autor respondió **HTTP 503 y 502** el 22-nov-2026 (a través del lector y con un navegador real). Su texto no se pudo verificar hoy.
- **Antes de cualquier uso comercial** (anuncios, suscripciones o venta) hay que revisar esa política y, en su caso, pedir licencia. **No publiques la app con monetización sin esa revisión.**
