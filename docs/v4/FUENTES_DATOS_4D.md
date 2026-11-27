# Fuentes de datos descargables (investigación del 27-nov-2026)

## GTA Atlas — integrado
- Manifiesto `https://atlasgta.com/data/index.json`: 12 archivos, 1964 filas, licencia declarada **CC BY-SA 4.0** en el manifiesto y en cada archivo; `robots.txt` permite el acceso.
- **Procedencia declarada por la propia fuente:** vehículos y armas (nombres, clases, fabricantes, precios) cruzados entre GTABase, GTA Scoop e IGN; trofeos reescritos a partir de PowerPyx; lista del 100 % de IGN y PowerPyx; trucos de GamesRadar; lugares en su mayoría de GTADB (CC BY 4.0); interiores de grabaciones públicas.
- **Qué se tomó:** solo hechos y fuentes por fila (`content/catalog/`), con resúmenes propios en español. **Qué no:** la prosa original, las calificaciones sobre 10 (son valoraciones editoriales de GTABase y otros medios, no de GTA Atlas), las imágenes (fotogramas de videos de YouTube de terceros y capturas de GTADB) y cualquier posición en el mapa.
- Obligaciones: atribución visible en cada página de la Enciclopedia y licencia compartida CC BY-SA 4.0 para el catálogo derivado (ver `ATTRIBUTIONS.md`).
- Importador: `research/atlasgta/importar_atlasgta.py` (validación de contrato y licencia, evidencia, duplicados, rechazos, pendientes, revisión incremental). Cobertura: `docs/v4/COBERTURA.md`.

## GTA Town — NO integrado
- Página de descargas: 560 vehículos, 202 armas, 61 trucos, 55 trofeos, 195 misiones, 80 desafíos, 4021 coleccionables con coordenadas, 2889 lugares. Su FAQ dice CC BY 4.0 con «Source: gtatown.com».
- **Conflicto:** la «Licencia de datos de GTA Town, versión 1» (vigente desde el 25-nov-2026) concede un derecho revocable ligado a una clave por sitio, exige enlace «Data: GTA Town» por registro y resincronizar cada 30 días, y **prohíbe incorporar los datos a otros conjuntos de datos o publicarlos como archivo independiente**. Ambas condiciones no son compatibles con integrarlos en `content/`.
- Decisión: no se descargaron ni se integraron sus archivos. Solo se citan sus totales como referencia de cobertura. Para usarlos hay que pedir a GTA Town una aclaración por escrito del alcance de la licencia CC BY 4.0.

## GTADB — continuación
- El README del repositorio `rolux/gtadb.org` pide **no consultar datos ni medios en vivo de gtadb.org** y usar `git pull` (o sparse-checkout de `map/data/6`, `map/photos/6`, `maps/tiles/6`). Desde ahora la investigación usará el repositorio y no la API en vivo (las consultas previas de la fase 4B/4C fueron puntuales y con caché).
- **Mosaicos con el mismo sistema de coordenadas:** `maps/tiles/6/<capa>/<z>/<z,x,y>.jpg`, mosaicos de 256 px centrados en (0, 0); nivel 5 = 1 px/m (nivel 6 en las capas «oficial» y «gtadb»). Capas para GTA VI: `day` (marcada «--official» en `maps/tiles.py`, 24000 px a 2 px/m), mapas de la comunidad (`dupzor`, `yanis`, `cyber`) y superposiciones. Licencia del repositorio: CC BY 4.0 (datos) / MIT (código).
- **Por qué no se integran todavía:** los mosaicos derivan de mapas de terceros (incluido el póster de Rockstar y mapas de la comunidad cuyo autor no los licencia, p. ej. «YANIS V15», que FullSweep excluye) y de capturas del juego. Nuestra regla de imágenes solo admite material oficial de rockstargames.com/VI o ilustración propia. **Decisión del propietario:** si se acepta la capa `day` (derivada del mapa oficial, con atribución a GTADB), las coordenadas de GTADB y de GTA Atlas se podrían mostrar sin calibrar el póster, con precisión real de metros.
