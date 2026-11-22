# Investigación de la fase 2: trucos, coleccionables, consola y equipamiento

Fecha de consulta: 22-nov-2026 (el juego salió el 19-nov-2026). Ninguna fuente indica número de parche: todo se marca «Lanzamiento».
**No hubo pruebas en consola física.** Todo lo de esta fase viene de una fuente oficial o de guías publicadas; nada está «comprobado».

## Reglas aplicadas

- «Contrastado» exige **dos grupos editoriales independientes**. Cada fuente lleva un `group` en `content/sources.json`, y el validador (`independentGroups` en `src/data/schema.ts`) cuenta grupos, no URLs.
  - VICE declara que compiló su lista «con ayuda de GTA Base», así que comparte el grupo `gtabase` y no cuenta como segunda fuente.
  - Output Lag y 6cheats citan el mismo análisis técnico (Digital Foundry) para resolución y estabilidad, así que esos dos datos quedan en «reportado».
- Si ninguna fuente publica la secuencia de un truco, se muestra **«Secuencia desconocida»**. El esquema impide publicar pasos sin fuente, y no se trasladan códigos de GTA V.
- Las ubicaciones de coleccionables con dirección textual llevan un punto en el **rótulo** de la zona o barrio del mapa oficial, con precisión `zona` o `barrio` y `basis` explícito. Las que no tienen rótulo claro (Mount Kalaga, Gullet Marsh) no tienen punto.
- No se publican precios ni compatibilidades de accesorios que ninguna fuente documente.

## Fuentes

| id | Medio | Grupo | Tipo | Uso |
|---|---|---|---|---|
| rs-preload | Rockstar Games Newswire, «Pre-load Grand Theft Auto VI now» | — | oficial | 30 fps; PSSR y sombras con trazado de rayos solo en PS5 Pro; hápticos; Tempest 3D; Xbox Cloud Gaming; Remote Play |
| gtabase-cheats | GTA BASE | gtabase | guía | 61 trucos con requisitos; secuencias publicadas |
| vice-cheats | VICE | gtabase | guía | Mismo grupo que GTA BASE; consecuencias de guardado; el dinero no se conserva |
| beebom-cheats | Beebom (act. 20-nov) | beebom | guía | Secuencias, método Xbox (LB+RB), desactivar repitiendo el código |
| gamertweak-cheats | Gamer Tweak (act. 21-nov) | gamertweak | guía | Secuencias, avisos de discrepancias (Max Ammo, Raise Wanted Level) |
| pushsquare-mags | Push Square | pushsquare | guía | 16 de 27 lecturas con ubicación (guía en progreso) |
| gta6cm-mags | GTA6 Collectibles Map | gta6collectiblesmap | guía | Totales: 27 lecturas + 7 intercambios; 30 para el 100 % |
| playguide-collectibles | GTA 6 Play Guide | gta6playguide | guía | 18 sets / ≈480 tarjetas, trofeos, 2 tarjetas con ubicación |
| outputlag-settings | Output Lag | outputlag | guía | Menús de ajustes con nombres en inglés, valores predeterminados |
| sixcheats-performance | 6cheats (act. 21-nov) | 6cheats | guía | Modos gráficos inexistentes, VRR, HDR de consola |
| gtabase-loadout | GTA BASE | gtabase | guía | Carga 2+2, almacenamiento, accesorios en rueda vs. Ammu-Nation |
| progamer-weapons | Pro-Gamer.gg | progamer | guía | Publicada un día antes del lanzamiento general y sin citar fuentes; solo sirve para contrastar |

URLs completas en `content/sources.json` y visibles en cada dato de la app.

## Resultados

### Trucos (`content/cheats.json`)

- **61 trucos.** 19 tienen secuencia publicada: 18 contrastadas (GTA BASE + Beebom y/o Gamer Tweak) y 1 reportada («Drunk», que solo publica GTA BASE; VICE la marca como no confirmada y Beebom como TBA). Los otros 42 se muestran como «Secuencia desconocida».
- Método contrastado: ↑ en la cruceta para abrir el teléfono; mantener L1+R1 (PS5) o LB+RB (Xbox); introducir la secuencia con la cruceta.
  - Ninguna fuente distingue la PS5 Pro (usa el mismo DualSense). Se indica así en la app.
- Consecuencias contrastadas:
  - Hace falta terminar la historia.
  - Se desactiva el guardado y se bloquean los trofeos y logros durante la sesión.
  - Solo funcionan en un jugador.
- Consecuencias reportadas por una sola fuente:
  - El dinero del truco no se conserva.
  - Repetir el código lo desactiva.

### Coleccionables (24 fichas en `content/entries.json`, categoría `coleccionables`)

- **Colecciones:**
  - Tarjetas: 18 sets, ≈480; Vice City Flamingos = 24 y desbloquea el filtro Bubblegum.
  - Revistas, libros y cómics: 27.
  - Relojes: 10/20 desbloquean trucos de tiempo; total no publicado.
  - Flamencos de cocaína: 50 desbloquean un truco.
  - Vehículos Girlypop: 16.
  - Saltos acrobáticos: 50 desbloquean un truco.
  - El total se marca «pendiente» cuando no está publicado.
- **Objetos individuales:**
  - 16 lecturas de Push Square. 2 están confirmadas por una segunda guía: «Remote Strike» (GTA6 Collectibles Map) y «Pêche» (GTA 6 Play Guide). Las otras 14 quedan «reportado».
  - 2 tarjetas de GTA 6 Play Guide, reportadas.

### Ajustes de consola (`content/console.json`)

- Las 4 plataformas se tratan por separado, con secciones de juego y de consola.
- Oficial:
  - 30 fps en todas.
  - Mejoras PSSR y RT solo en PS5 Pro, sin menú extra.
  - Hápticos, Tempest 3D, nube y Remote Play.
- Contrastado:
  - No hay modo rendimiento ni de 60 fps.
  - Desenfoque de movimiento con valor predeterminado 3.
  - Opciones de contraste.
- Reportado:
  - Rutas exactas de los menús.
  - Valores de sensibilidad y apuntado.
  - Resolución interna y estabilidad (ambas de un mismo análisis técnico).
  - Calibración de HDR en la consola.

### Equipamiento (`content/loadout.json`)

- Contrastado:
  - A pie caben 2 armas cortas y 2 largas.
  - El resto se guarda en la cajuela o en un casillero de Ammu-Nation.
  - Lo comprado sirve para Jason y Lucia.
  - Las armas únicas no se modifican.
- Reportado: 1 arma cuerpo a cuerpo, explosivos y equipo aparte; las armas recogidas del suelo se pierden al morir.
- Accesorios contrastados:
  - Silenciador y linterna se cambian en la rueda de armas.
  - Empuñadura, cargador y mira se compran en Ammu-Nation.
- **No publicado por ninguna fuente:** compatibilidad por arma y precio de cada accesorio. El constructor lo dice en pantalla.
- Las clases (corta, larga, cuerpo a cuerpo) se deducen del dato «Clase» de cada ficha de arma. El subfusil Crabshack VF5 queda «sin clasificar» porque la guía no dice dónde va.

## Pendiente de verificación

- Las 11 lecturas restantes sin ubicación publicada.
- Las ubicaciones de las ≈478 tarjetas restantes.
- Los totales de relojes, flamencos y saltos.
- Las secuencias desconocidas.
- Pruebas en consola física (PS5, PS5 Pro, Series X y S).
- ATLAS INTELLIGENCE vigila las fuentes; cualquier parche oficial pasa los datos a revalidación.
