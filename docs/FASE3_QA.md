# QA de la fase 3: ATLAS EXPLORER y mapa oficial v2 (22-nov-2026)

- Rama: `claude/fase3-explorer-mapa`.
- Base: `main` en 3378833 (v1.2.0 con el PR #3 incluido).

## Resultados locales

| Paso | Resultado |
|---|---|
| `npm run lint` | sin errores |
| `npm run typecheck` | sin errores |
| `npm run test` | 24 archivos, **136 pruebas** en verde (nuevas: `tests/mapgeo.test.ts`, `tests/routes.test.ts`, `tests/vehicles.test.ts`, y migración v3→v4 en `tests/storage.test.ts`) |
| `npm run build` | 137 páginas prerenderizadas |
| `npm run test:e2e` | **214 pasan**, 0 fallan, 53 omitidas por diseño; 7 proyectos Chromium (360, 390, 768, 1280, 1920, Pixel 7, iPhone emulado) y la prueba offline |
| `npm run audit:legacy` | 0 coincidencias no permitidas |

WebKit real se prueba en CI.

## Qué cubre `e2e/fase3.spec.ts`
- **Mapa:**
  - El póster v2 carga (1200 px reales).
  - Hay grupos con el mapa completo. Al tocar uno, el mapa se acerca y aparecen más puntos.
  - Al acercar se pide la resolución 2400 o 3840.
  - Existe la lista «Sin ubicación documentada».
  - No hay desbordamiento horizontal.
- **Persistencia:** las capas, la precisión, la agrupación y el póster se conservan tras recargar. «Mostrar todo» restablece los filtros.
- **Respaldo del póster:** si el v2 falla (fallo simulado), se usa el anterior y aparece un aviso.
- **Rutas:**
  - Crear una ruta con 3 paradas buscadas, reordenarlas y marcar una como visitada.
  - Guardarla y comprobar que persiste.
  - Verla en el mapa: el mapa la encuadra y aparece el aviso «no son caminos ni distancias».
  - Editarla desde el mapa, quitar una parada y borrar la ruta.
- **Ficha:** «Añadir a una ruta» desde el punto del mapa; la ruta aparece en Mi espacio.
- **Vehículos:**
  - Comparar 3 vehículos (la selección queda en la URL).
  - El valor más alto se resalta; lo que no está publicado aparece como «No publicado».
  - El botón se desactiva al llegar a 3.
  - Añadir al garaje, ver el botón activo en la ficha y el vehículo en Mi espacio.
- **Migración:** un progreso v3 se convierte a v4 conservando registros, contadores, equipamientos y perfil.
- **Accesibilidad:** axe sin errores serios en `/mis-rutas`, `/comparar-vehiculos` y en la ficha de un vehículo nuevo, además de las páginas de antes.

## Errores encontrados y corregidos durante el QA
1. **Los grupos del mapa no respondían al toque.** El gesto de arrastre capturaba el puntero. Ahora los grupos quedan fuera del gesto, igual que los pines.
2. **Desbordamiento horizontal a 360–390 px.**
   - El panel de filtros del mapa (por el selector de póster) se salía de la pantalla.
   - La columna principal de las fichas (por la ilustración) también.
   - En móviles esto alejaba la página y desalineaba los toques. Se corrigió y ahora lo comprueban las pruebas.
3. **Ruta fuera de pantalla.** Al abrir una ruta en el mapa, el mapa se quedaba en la vista general. Ahora encuadra las paradas.
4. **Paradas en el mismo punto.** Las paradas de una misma zona se encimaban. Ahora se muestran en un solo marcador «1·2·3»: no se desplazan, para no inventar posiciones.
6. **Prueba de teclado inestable con mucha carga.** Pulsaba Tab antes de que la app terminara de montarse. Ahora espera el montaje; pasó 30 de 30 veces repetida y luego en toda la suite.
5. **Riesgo de pérdida del póster.** `npm run images` habría borrado el póster v2 del manifiesto. Ahora lo conserva desde `sources/local-media.json`.

## Límites (no probado)
- No hay pruebas en el juego ni en dispositivos físicos. El gesto de pellizco se probó con eventos simulados.
- La política de Rockstar no respondió (503/502); ver `docs/MAPA_OFICIAL_V2.md`.
- No se publican precios de garajes porque las fuentes que los publican estaban bloqueadas.
