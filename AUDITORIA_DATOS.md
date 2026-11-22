# AUDITORÍA DE DATOS — LEONIDA ATLAS

**Fecha de auditoría:** 22 de noviembre de 2026 · **Juego:** Grand Theft Auto VI (lanzamiento 19-nov-2026, PS5 y Xbox Series X|S) · Generado con `python3 scripts/gen_audit.py`.

## 1. Sobre las 52 fichas del prototipo anterior

El encargo pedía revisar una por una las 52 fichas de la carpeta `LEONIDA_ATLAS_GTA6` (con `data.js`, `datos-fuentes.json`, `build_data.py`, etc.). **Esa carpeta no está en este repositorio**: al iniciar el trabajo el repositorio solo contenía `README.md` y el documento del encargo (`LEONIDA_ATLAS_PROMPT_MAESTRO_CLAUDE_CODE-2.md`). Tampoco existe el video de referencia, sus 49 fotogramas ni la portada anterior.

Consecuencias y decisión:

- No se puede emitir una decisión ficha por ficha sobre datos que no se han visto. **No se inventa** una auditoría de esas 52 fichas.
- Ningún dato, imagen o texto del prototipo anterior se ha reutilizado: el contenido se reconstruyó desde cero a partir de fuentes verificables (sección 3).
- Si el propietario sube la carpeta, el procedimiento es: copiar cada ficha a `content/entries.json` con el esquema actual, ejecutar `npm run validate:data` y clasificarla con las mismas reglas de la sección 2. Lo que no tenga fuente se archiva, no se publica.

## 2. Reglas de clasificación

| Estado | Regla aplicada |
|---|---|
| Oficial | Publicado por Rockstar Games / Take-Two (sitio /VI, Only in Leonida, Media, Launch Gallery, Newswire, mapa oficial). |
| Comprobado | Reproducido en una partida documentada con captura propia. **Ninguna ficha tiene este estado**: no hubo acceso a una partida. |
| Contrastado | Dos fuentes independientes no oficiales coinciden en el dato. El validador rechaza un dato «contrastado» con menos de dos fuentes. |
| Reportado | Una sola fuente no oficial. Se muestra con alerta y borde punteado. |
| Pendiente / Obsoleto | Sin uso por ahora. Lo pendiente no se muestra como confirmado. |

Además: dinero y glitches separados por modo; **no se publica ningún glitch** (ninguno cumple dos fuentes + pasos reproducibles); el modo online se marca como «sin información verificada»; los puntos del mapa declaran precisión (región, zona o barrio) y la base de la posición; no se asigna una foto al azar a un lugar.

## 3. Resultado: 80 fichas publicadas

Oficial: **48** · Contrastado: **8** · Reportado: **24** · Comprobado: 0 · Pendiente: 0 · Obsoleto: 0

### Datos descartados o no publicados (y por qué)

- **Precios de las ediciones** (Standard $79.99 / Ultimate $99.99 en un resultado de búsqueda): la página oficial revisada no muestra precio → se marca «pendiente», no se publica cifra.
- **Disponibilidad en PC**: un resultado de búsqueda la menciona; Rockstar solo lista PS5 y Xbox Series X|S → descartado.
- **«Vice City es el doble de Los Santos», «80 horas de campaña», sistema de 6 estrellas, «Heat»**: provienen de artículos especulativos previos al lanzamiento → no publicados.
- **Ubicaciones exactas de autos clásicos (Classic Car Collection)**: Rockstar no las publica → ficha sin puntos, dato «pendiente».
- **Ubicación de la casa de Jason, Only Raw Records, refinería Allied Crystal**: sin evidencia de posición → sin punto en el mapa.
- **Ubicaciones exactas de las 24 Ammu-Nation**: fuente única → se listan por barrio, sin pines.
- **Bóvedas bancarias ($205,000) y recompensa del Capítulo 3 ($120,000)**: fuente única (PowerPyx); GTA BOOM indica que los mayores robos se retienen → «reportado» + spoiler avanzado.
- **Guías fechadas antes del lanzamiento con cifras exactas** (p. ej. un resultado «de hace 64 días»): descartadas por ser anteriores al 19-nov-2026.

### Detalle por ficha

#### Lugares (12)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Vice City | `/lugares/vice-city` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media), [rs-gallery](https://www.rockstargames.com/VI/launch-gallery) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Leonida Keys | `/lugares/leonida-keys` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Grassrivers | `/lugares/grassrivers` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media), [rs-gallery](https://www.rockstargames.com/VI/launch-gallery) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Port Gellhorn | `/lugares/port-gellhorn` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Ambrosia | `/lugares/ambrosia` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Mount Kalaga National Park | `/lugares/mount-kalaga` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | region | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Ocean Beach | `/lugares/ocean-beach` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Little Cuba | `/lugares/little-cuba` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Stockyard | `/lugares/stockyard` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Washington Beach | `/lugares/washington-beach` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Watson Bay | `/lugares/watson-bay` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Lake Leonida | `/lugares/lake-leonida` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como OFICIAL: confirmado por Rockstar Games. |

#### Personajes (8)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Jason Duval | `/personajes/jason-duval` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Lucia Caminos | `/personajes/lucia-caminos` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Cal Hampton | `/personajes/cal-hampton` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Boobie Ike | `/personajes/boobie-ike` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Dre'Quan Priest | `/personajes/drequan-priest` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Real Dimez | `/personajes/real-dimez` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Raul Bautista | `/personajes/raul-bautista` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Brian Heder | `/personajes/brian-heder` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |

#### Dinero (14)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Regla clave: el efectivo del Capítulo 1 se pierde | `/dinero/no-farmees-en-el-capitulo-1` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Vender autos a Moses | `/dinero/vender-autos-a-moses` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | region | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Robos a joyerías (Yasmani) | `/dinero/robos-a-joyerias-yasmani` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Lista de deseos de Randy (superdeportivos) | `/dinero/lista-de-deseos-de-randy` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Autos con rastreador estándar en Pay 'n' Spray | `/dinero/autos-rastreados-pay-n-spray` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Operaciones ilegales (escondites de pandillas) | `/dinero/operaciones-ilegales` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c), [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GAMES.GG, GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Asaltos a tiendas | `/dinero/asaltos-a-tiendas` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Carreras callejeras | `/dinero/carreras` | reportado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/) | — | Publicar como REPORTADO: fuente única (PowerPyx). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Paquetes de droga para Donnie | `/dinero/paquetes-de-donnie` | reportado | [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como REPORTADO: fuente única (GTA BOOM). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Inmersiones de tesoro (Kenton) | `/dinero/tesoros-de-kenton` | reportado | [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como REPORTADO: fuente única (GTA BOOM). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Casas de empeño | `/dinero/casas-de-empeno` | reportado | [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como REPORTADO: fuente única (GTA BOOM). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Bancos pequeños y préstamos (Payday Loans) | `/dinero/bancos-pequenos` | reportado | [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c), [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/) | — | Publicar como REPORTADO: fuente única (GTA BOOM, PowerPyx). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Bóvedas de bancos grandes | `/dinero/bovedas-bancarias` | reportado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/) | — | Publicar como REPORTADO: fuente única (PowerPyx). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Recompensa de historia del Capítulo 3 | `/dinero/recompensa-capitulo-3` | reportado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/) | — | Publicar como REPORTADO: fuente única (PowerPyx). Visible con alerta; pendiente de segunda fuente o comprobación. |

#### Armas (20)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Girardi ES9 | `/armas/girardi-es9` | oficial | [rs-vi](https://www.rockstargames.com/VI), [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | — | Publicar como OFICIAL: confirmado por Rockstar Games. Datos secundarios de terceros marcados por separado (reportado). |
| Klose K17 | `/armas/klose-k17` | oficial | [rs-vi](https://www.rockstargames.com/VI), [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/), [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | — | Publicar como OFICIAL: confirmado por Rockstar Games. Datos secundarios de terceros marcados por separado (reportado). |
| Hawk & Little Morgan Revolvers | `/armas/hawk-little-morgan` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Patrón de armas tropical | `/armas/patron-tropical-vintage` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Scorpio Nipper .38 | `/armas/scorpio-nipper-38` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Fortune & Son Moreland 850 | `/armas/fortune-son-moreland-850` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Fortune & Son Gorse 425 | `/armas/fortune-son-gorse-425` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Fortune & Son Laird 350 | `/armas/fortune-son-laird-350` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Shrewsbury Drifter | `/armas/shrewsbury-drifter` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Shrewsbury Hobo | `/armas/shrewsbury-hobo` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Wortham W-14 | `/armas/wortham-w-14` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Duke 556 | `/armas/duke-556` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Star Spangled 556 | `/armas/star-spangled-556` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | barrio | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Honky Tonk Mustang .357 | `/armas/honky-tonk-mustang-357` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | barrio | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Vice City Heathen | `/armas/vice-city-heathen` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | barrio | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Little Cuba Hind | `/armas/little-cuba-hind` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) | barrio | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Drug Mule KZ-59 | `/armas/drug-mule-kz-59` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Assassin Nipper .38 | `/armas/assassin-nipper-38` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Shark Knife | `/armas/shark-knife` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |
| Crabshack VF5 | `/armas/crabshack-vf5` | reportado | [gamesgg-unique](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |

#### Vehículos (7)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| ’95 Grotti Cheetah | `/vehiculos/grotti-cheetah-95` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| ’67 Vapid Dominator Buggy | `/vehiculos/vapid-dominator-buggy-67` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| ’55 Vapid Stanier | `/vehiculos/vapid-stanier-55` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Vapid Ganado | `/vehiculos/vapid-ganado` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Dinka Enduro | `/vehiculos/dinka-enduro` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Crest Kayak | `/vehiculos/crest-kayak` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Shitzu Squalo | `/vehiculos/shitzu-squalo` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |

#### Negocios y propiedades (13)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Rideout Customs | `/negocios/rideout-customs` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Sara's Unisex Salon | `/negocios/saras-unisex-salon` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Stock 305 | `/negocios/stock-305` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Electric Fang Tattoo | `/negocios/electric-fang` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| One-Eyed Willie's | `/negocios/one-eyed-willies` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | zona | Publicar como OFICIAL: confirmado por Rockstar Games. |
| PTT Youngin$ Illegal Goods Store | `/negocios/ptt-youngins` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Paradise Garage | `/negocios/paradise-garage` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Garaje Shore Court | `/negocios/shore-court` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media), [rs-map](https://www.rockstargames.com/VI/media) | barrio | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Casa de Jason | `/negocios/casa-jason` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Only Raw Records | `/negocios/only-raw-records` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Refinería Allied Crystal | `/negocios/allied-crystal` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Goodtime Gear | `/negocios/goodtime-gear` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Red de tiendas Ammu-Nation | `/negocios/ammu-nation` | reportado | [gamesgg-ammu](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) | — | Publicar como REPORTADO: fuente única (GAMES.GG). Visible con alerta; pendiente de segunda fuente o comprobación. |

#### Rutas y tutoriales (6)

| Ficha | Ruta | Estado | Fuentes | Mapa | Decisión |
|---|---|---|---|---|---|
| Empieza aquí: cómo leer LEONIDA ATLAS | `/rutas/empieza-aqui` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Ruta de dinero por capítulo (modo historia) | `/rutas/ruta-de-dinero-por-capitulo` | contrastado | [powerpyx-money](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/), [gtaboom-money](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) | — | Publicar como CONTRASTADO: dos fuentes independientes coinciden (GTA BOOM, PowerPyx). No comprobado en partida propia. |
| Por la 1A hasta Mile Zero (ruta orientativa) | `/rutas/por-la-1a-hasta-mile-zero` | oficial | [rs-map](https://www.rockstargames.com/VI/media), [rs-oil](https://www.rockstargames.com/VI/only-in-leonida) | zona | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Tour por las 6 regiones de Leonida | `/rutas/tour-por-las-6-regiones` | oficial | [rs-oil](https://www.rockstargames.com/VI/only-in-leonida), [rs-map](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Encargo especial: Classic Car Collection | `/rutas/classic-car-collection-wyman` | oficial | [rs-vi](https://www.rockstargames.com/VI) | — | Publicar como OFICIAL: confirmado por Rockstar Games. |
| Ediciones y complementos de GTA VI | `/rutas/ediciones-y-complementos` | oficial | [rs-vi](https://www.rockstargames.com/VI), [rs-news-launch](https://www.rockstargames.com/mx/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available), [rs-media](https://www.rockstargames.com/VI/media) | — | Publicar como OFICIAL: confirmado por Rockstar Games, Rockstar Games Newswire. |

## 4. Fuentes consultadas

- **rs-vi** — [Grand Theft Auto VI — sitio oficial](https://www.rockstargames.com/VI) · Rockstar Games · publicado: s/f · consultado: 2026-11-22 · oficial. Textos de ediciones, beneficios de Ultimate Edition, Vintage Vice City Pack, plataformas y clasificación ESRB.
- **rs-news-launch** — [Grand Theft Auto VI ya está disponible](https://www.rockstargames.com/mx/newswire/article/39akk424a9oo53/grand-theft-auto-vi-now-available) · Rockstar Games Newswire · publicado: 2026-11-19 · consultado: 2026-11-22 · oficial. Anuncio de lanzamiento. Fecha confirmada también en la portada oficial de /VI.
- **rs-oil** — [Only in Leonida — personajes y lugares](https://www.rockstargames.com/VI/only-in-leonida) · Rockstar Games · publicado: s/f · consultado: 2026-11-22 · oficial. Descripciones oficiales de las seis regiones y de los personajes principales.
- **rs-media** — [Media & Artwork (descargas oficiales)](https://www.rockstargames.com/VI/media) · Rockstar Games · publicado: s/f · consultado: 2026-11-22 · oficial. La página invita a «descargar y compartir» videos, capturas, arte y el póster del mapa de Leonida.
- **rs-gallery** — [The Launch Gallery](https://www.rockstargames.com/VI/launch-gallery) · Rockstar Games · publicado: 2026-11-05 · consultado: 2026-11-22 · oficial. Capturas oficiales con descripciones (alt) publicadas por Rockstar.
- **rs-map** — [Leonida Map & Cover Art Poster](https://www.rockstargames.com/VI/media) · Rockstar Games · publicado: s/f · consultado: 2026-11-22 · oficial. Póster oficial del mapa de Leonida con cuadrícula A–M / 1–9. Base del visor de mapa.
- **rs-policy** — [Policy on posting copyrighted Rockstar Games material](https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material) · Rockstar Games Support · publicado: s/f · consultado: 2026-11-22 · oficial. Política de uso de material por fans (uso no comercial y sin spoilers intencionales). La página respondió HTTP 503 al consultarla el 22-nov-2026; el resumen se tomó del índice público de la misma URL. Revisar de nuevo.
- **powerpyx-money** — [GTA 6 Money Guide - How to Get Money Fast](https://www.powerpyx.com/gta-6-money-guide-how-to-get-money-fast/) · PowerPyx · publicado: 2026-11-18 · consultado: 2026-11-22 · guia. Guía con nombres de misiones y ubicaciones. Fechada un día antes del lanzamiento general; no indica parche.
- **gtaboom-money** — [10 Early GTA 6 Money Making Methods Compared by Payout and Chapter](https://www.gtaboom.com/how-to-make-money-fast-and-early-in-gta-6-725c) · GTA BOOM · Ray Ampoloquio · publicado: 2026-11-19 · consultado: 2026-11-22 · guia. Afirma basarse en su propia partida; algunas cifras se presentan como «reportadas».
- **gamesgg-ammu** — [Grand Theft Auto 6: All 24 Ammu-Nation Locations and Stock](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-24-ammu-nation-locations-and-stock/) · GAMES.GG · Abdalla · publicado: 2026-11-21 · consultado: 2026-11-22 · guia. Lista de tiendas y precios con capturas del menú. Sin número de parche.
- **gamesgg-unique** — [Grand Theft Auto 6 Guide: All Unique Weapons and Where to Get Them](https://games.gg/grand-theft-auto-vi/guides/grand-theft-auto-6-all-unique-weapons-where-to-get-them/) · GAMES.GG · Abdalla · publicado: 2026-11-21 · consultado: 2026-11-22 · guia. Armas únicas en tiendas y ubicaciones gratuitas. Fuente única: todo se marca como «reportado».
