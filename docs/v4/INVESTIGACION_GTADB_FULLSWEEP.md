# Investigación GTADB, FullSweep y GTABase (27-nov-2026)

Prueba real desde este entorno con el importador de `research/gtadb/`. **Nada se importó a producción** (`content/` intacto) ni se proyectó sobre el póster.

## GTADB (api.gtadb.org)
**Comando ejecutado:** `python3 importar_gtadb.py --fetch --out <scratch>/gtadb6-staging.json` (salida fuera del repositorio; las salidas `*staging*.json` están en `.gitignore`).

| Dato | Resultado real |
|---|---|
| Endpoint | `GET https://api.gtadb.org/landmarks?gta=6` (sin clave; la documentación muestra `key=API_KEY` pero declara «Authentication: currently none», «Rate limits: currently none», estado «experimental») |
| Registros recibidos | **4380** |
| Aceptados a staging | **4286** |
| Rechazados | **94** (todos por `ig_coordinates: null`) |
| Campos del listado | solo `id` (L1…), `ig_coordinates` [x, y] y `types` — **sin nombres** |
| Registros sin tipo | 3066 de 4380 (`types: []`) |
| Rango de coordenadas aceptadas | x -9832.1 … 3147.4 · y -8000.0 … 8929.4 |
| Detalle por id | `/landmarks?gta=6&id=L25` añade `ig_address`, `ig_photo`, `rl_address`, `rl_coordinates` (lugar real que inspira) y `rl_photo` |
| Otros endpoints documentados | `/geocode` (dirección ↔ punto), `/elevation`, `/staticmap` (imagen con escala px/m); «Maps JavaScript» y «Routes»: *coming soon* |
| Licencia | `LICENSE-DATA` del repositorio rolux/gtadb.org: **CC BY 4.0** para datos e imágenes «salvo indicación»; atribución preferida «GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org». No concede derechos sobre material de terceros (capturas del juego, fotos reales). |

**Tipos (categorías) en el listado:**

| Tipo | Registros |
|---|---|
| residential | 351 |
| retail | 178 |
| transportation | 158 |
| natural | 100 |
| demolished | 99 |
| industrial | 94 |
| hotel | 75 |
| leisure | 73 |
| government | 56 |
| closed | 47 |
| utilities | 46 |
| landmark | 35 |
| public | 34 |
| restaurant | 29 |
| construction | 20 |
| office | 10 |
| agriculture | 2 |

**Sistema de coordenadas:** `ig_coordinates` son coordenadas del mundo del juego en metros estimadas por la comunidad (el `staticmap` usa «scale = píxeles por metro»), con origen y orientación propios de GTADB. **No son píxeles del póster oficial** ni hay una transformación publicada hacia él. Rockstar no ha publicado un sistema de coordenadas.

**Conclusión:** fuente útil y con licencia clara para investigación, pero (1) los registros no traen nombre en el listado, (2) el 70 % no tiene tipo, (3) las coordenadas requieren una calibración propia con puntos de control documentados y error medido antes de mostrarse en el mapa, y (4) las fotos del juego en `ig_photo` son capturas cuyo derecho no concede GTADB. **Estado: bloqueado para producción** hasta calibrar; nada se muestra en la app.

## FullSweep (fullsweepmap.com/developers)
| Dato | Resultado real |
|---|---|
| `GET /api/v1/stats` | 75 ubicaciones, 1534 landmarks (de GTADB), 9 categorías, 8 regiones; actualizado 2026-11-23 |
| `GET /api/v1/locations` | 75 registros: activity 20, wildlife 15, store 12, side 7, collectible 7, mission 6, safehouse 4, egg 4. Fuente declarada por registro: official 43 · community 18 · unverified 14 |
| Coordenadas | `x, y` en **píxeles de su propio mapa base (3344 × 4820)**, no del póster oficial ni del juego |
| Licencia | Datos **CC BY 4.0** («FullSweep, fullsweepmap.com»); **el mapa base no se licencia** (obra de la comunidad «YANIS V15»); landmarks con crédito a GTADB |
| Límites | 120 peticiones/min (stats, locations), 60/min (landmarks); CORS abierto; sin clave |

**Conclusión:** complementaria y con licencia clara. Sus campos `source` y `sourceUrl` ayudan a filtrar solo «official». Requiere la misma calibración (su mapa → póster oficial). No se importa nada todavía.

## GTABase (gtabase.com/es/gta-6/mapa)
- El sitio responde (HTTP 200) y su `robots.txt` no bloquea las páginas públicas, pero **no publica una API ni una licencia de reutilización** de sus datos, fotos o mosaicos.
- No se extrajo nada. Para usarlo como fuente de datos hay que **pedir permiso** (https://www.gtabase.com/es/contacto/). Mientras tanto, solo referencia editorial (enlaces).

## Siguiente paso propuesto (fase 4C)
1. Elegir 8–12 puntos de control visibles a la vez en el póster oficial y en GTADB (rótulos de regiones y monumentos con evidencia), ajustar una transformación afín y medir el error con puntos independientes.
2. Si el error es menor que la precisión «zona», usar la transformación solo para proponer candidatos a revisión humana (nunca publicación automática), guardando la coordenada original y la versión de la transformación.
3. Añadir pruebas de contrato con la respuesta real (campos y tipos) antes de automatizar cualquier lectura.
