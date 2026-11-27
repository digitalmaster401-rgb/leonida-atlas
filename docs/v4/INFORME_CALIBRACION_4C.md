# Informe de calibración cartográfica y fuentes (Fase 4C, 2026-11-27)

**Nada se publicó en el mapa.** Todo lo de este informe vive en `research/` y en la herramienta interna `/editor/calibracion` (sin indexar).

## 1. Calibración GTADB → póster oficial v2

### Puntos de control (sin inventar)
- **Póster:** solo rótulos ya documentados en `content/*.json` (`mapPosition` con «rótulo» en `basis`, precisión barrio/zona).
- **GTADB:** `/geocode?address=<nombre>` (una petición por rótulo, con caché): centroide de los landmarks cuyo barrio o lugar coincide exactamente con el nombre; se guarda el número de landmarks (n) y su dispersión.
- Un rótulo no es un punto exacto: la dispersión (hasta 566 m) limita la precisión alcanzable.

| Rótulo | Precisión | Póster (0–1) | GTADB (m) |
|---|---|---|---|
| Ocean Beach | barrio | (0.862, 0.522) | (1961, 1090) · n=10 · disp. 148 m |
| Little Cuba | barrio | (0.661, 0.533) | (-1157, 52) · n=10 · disp. 203 m |
| Stockyard | barrio | (0.724, 0.450) | (-371, 1746) · n=10 · disp. 97 m |
| Washington Beach | barrio | (0.865, 0.445) | (1685, 2335) · n=10 · disp. 285 m |
| Watson Bay | barrio | (0.432, 0.703) | (-5117, -3356) · n=10 · disp. 125 m |
| Lake Leonida | zona | (0.608, 0.314) | (-1975, 4732) · n=1 · disp. 0 m |
| Southside | barrio | (0.623, 0.650) | (-1686, -2078) · n=10 · disp. 206 m |
| Riquezas Keys | zona | (0.218, 0.829) | sin equivalente |
| Permit Keys | zona | (0.370, 0.844) | sin equivalente |
| Saint Attaway Islands | zona | (0.530, 0.131) | sin equivalente |
| Pelican Valley | zona | (0.522, 0.733) | sin equivalente |
| Key Lento | zona | (0.568, 0.833) | (-2742, -6036) · n=10 · disp. 566 m |
| Port Gellhorn | zona | (0.305, 0.358) | (-6441, 2844) · n=10 · disp. 258 m |
| Bayside | barrio | (0.724, 0.472) | (-376, 1099) · n=10 · disp. 186 m |
| Crosstown | barrio | (0.698, 0.496) | (-665, 1250) · n=10 · disp. 82 m |
| Oldby Island | barrio | (0.837, 0.458) | sin equivalente |
| Moreau | zona | (0.516, 0.165) | sin equivalente |

**11 pares utilizables** de 17 rótulos; 6 sin equivalente en GTADB (Riquezas Keys, Permit Keys, Saint Attaway Islands, Pelican Valley, Oldby Island, Moreau).
División reproducible: entrenamiento 8 · validación reservada 3 (Key Lento, Ocean Beach, Stockyard) · además validación «dejando uno fuera» con los 11.

### Modelos comparados (error en píxeles del póster v2, 5775 × 7900)
| Modelo | Entrenamiento media / máx | Validación reservada media / máx | Dejando uno fuera media / p90 / máx |
|---|---|---|---|
| Similaridad (escala única + giro) | 216 / 353.3 | 273 / 499.4 | 262.6 / 552 / 594.4 |
| **Afín (6 parámetros)** | 108.2 / 170.5 | 113.2 / 143.4 | 150.2 / 247.9 / 261.8 |

La similaridad no basta: el póster no conserva una escala única (ilustración). La afín corrige escalas distintas por eje.

**Residuos de la afín dejando uno fuera (px):**

| Rótulo | dx | dy | error |
|---|---|---|---|
| Ocean Beach | 82.8 | -141.5 | 163.9 |
| Little Cuba | 45.2 | 76.4 | 88.8 |
| Stockyard | -43.4 | 105.1 | 113.7 |
| Washington Beach | -100.3 | 5 | 100.4 |
| Watson Bay | -184.3 | -185.9 | 261.8 |
| Lake Leonida | -8.8 | -161.9 | 162.2 |
| Southside | 91.6 | -38.5 | 99.4 |
| Key Lento | 57.2 | 96.5 | 112.2 |
| Port Gellhorn | 161.4 | 188.2 | 247.9 |
| Bayside | -36.8 | 196.1 | 199.6 |
| Crosstown | 4.6 | -102 | 102.1 |

### Decisión (versión guardada `research/calibracion/transformacion-v1.json`)
- Umbrales: barrio ≤ 150 px · zona ≤ 400 px. Se exige que **los reservados y los «dejando uno fuera»** queden por debajo.
- Resultado: **Peor error independiente 261.8 px (reservados y dejando uno fuera): válida como mucho para precisión «zona» (≤ 400 px). No sirve para precisión de barrio.**
- Consecuencia: la transformación **solo puede proponer candidatos con precisión «zona»**, siempre a revisión humana. **No sirve para barrio ni para «exacta».** Posiciones fuera del póster se rechazan.
- Limitación real: con rótulos como únicos puntos documentados del póster no se alcanza precisión de barrio. Mejorarla exige puntos puntuales verificables en ambos sistemas (monumentos, muelles, aeropuertos dibujados en el póster con su landmark de GTADB) o una cartografía alternativa autorizada con coordenadas del juego. Rockstar no ha publicado un sistema de coordenadas.

## 2. GTADB ↔ FullSweep (independencia de fuentes)
- 1532 correspondencias exactas por id original (FullSweep cita «GTADB.ORG L…» en cada landmark); 9 incoherentes (> 50 px) excluidas.
- Validación con 304 puntos: mediana **0.2 px**, p90 1.72 px, máx 48.47 px.
- **Conclusión:** los landmarks de FullSweep son una copia de GTADB; **no cuentan como segunda fuente** para «contrastado». No se importan (serían duplicados).

## 3. Lote piloto de GTADB (endpoint de detalle)
- Muestra reproducible de 25 ids (mitad con tipo y mitad sin tipo), **una petición cada 1,2 s**, caché en disco (`research/.cache/`, fuera de git), reintentos limitados solo ante 429/5xx, tope de peticiones por ejecución. Red: 25 peticiones.
- Campos devueltos: `ig_address` (dirección en el juego), `ig_coordinates`, `ig_photo` (captura del juego), `rl_address`/`rl_coordinates`/`rl_photo` (lugar real que lo inspira), `types`.

| Dato | En la muestra |
|---|---|
| Con nombre dentro del juego | **4 de 25** (Vice Regal, Albany Hotel, Y Vice City, Seahorse) |
| Con dirección dentro del juego (barrio, zona, condado) | 25 de 25 |
| Con categoría | 13 de 25 |
| Con referencia a foto | 25 de 25 |
| Estado | pendiente_revision: 3, pendiente_clasificacion: 22 |

- **Imágenes:** no se descargan ni se usan. Las capturas del juego son de Rockstar y las fotos reales de terceros; la licencia CC BY 4.0 de GTADB no concede derechos sobre ellas.
- Registros sin nombre o sin categoría: **pendiente_clasificacion**. Se conserva id original, atribución, fecha y procedencia; `publishable: false`.
- Extrapolación: si la proporción se mantiene, ~16 % de los 4380 registros tendría nombre. Recorrer todos llevaría ~1,5 h a 1 petición/1,2 s; no se hizo (fuera del alcance de un piloto).

## 4. FullSweep (adaptador independiente)
- `research/fullsweep/importar_fullsweep.py`: 75 ubicaciones aceptadas, 0 rechazadas. Categorías: safehouse 4, store 12, mission 6, side 7, activity 20, collectible 7, wildlife 15, egg 4.
- Etiqueta de fuente del proveedor: official 43, community 18, unverified 14.
- **Verificación de fuentes originales:** dominios citados — rockstargames.com 13, youtube.com 13, keengamer.com 20, null 13, gtabase.com 8, gameinformer.com 4, gta6intel.com 1, gamesradar.com 2, videogameschronicle.com 1. Solo 13 apuntan a rockstargames.com aunque 43 se etiquetan «official»: **la etiqueta del proveedor no basta**; todo queda `pendiente_verificacion_fuente` salvo «official» con enlace (a revisión humana igualmente).
- Coordenadas en píxeles de su mapa base (3344 × 4820). **El dibujo del mapa de FullSweep no se usa** (no está licenciado). Para proyectarlas al póster harían falta la transformación FullSweep → GTADB (medida arriba, mediana 0,2 px) y la calibración GTADB → póster (solo «zona»).

## Atribución
GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org · FullSweep data CC BY 4.0, https://fullsweepmap.com
