# QA de la fase 2 (22-nov-2026)

Rama: `claude/fase2-trucos-coleccionables-espacio`. Base: `main` en 8f13e84 (v1.1 con ATLAS INTELLIGENCE).

## Resultado local

| Paso | Resultado |
|---|---|
| `npm run lint` | sin errores |
| `npm run typecheck` | sin errores |
| `npm run test` | 21 archivos, **114 pruebas** en verde (incluye `tests/fase2.test.ts`, `tests/loadout.test.ts`, `tests/photos.test.ts` y migración v2→v3 en `tests/storage.test.ts`) |
| `npm run build` | valida datos (incluye la fase 2), 126 páginas prerenderizadas; paquete principal 278 kB (antes 560 kB) |
| `npm run test:e2e` | **165 pasan**, 0 fallan, 53 omitidas por diseño (pruebas de un solo ancho); 7 proyectos Chromium (360–1920, Pixel 7, iPhone emulado) + PWA offline |
| `npm run audit:legacy` | 0 coincidencias no permitidas; 0 en `dist/` |

WebKit real solo corre en CI (`PW_WEBKIT=1`). En este entorno el iPhone se emula sobre Chromium.

## Qué cubre `e2e/fase2.spec.ts` (en cada proyecto)

- **Trucos:**
  - Las consecuencias (guardado, trofeos, en línea) están visibles.
  - La etiqueta accesible de la secuencia cambia de L1+R1 a LB+RB al elegir Xbox.
  - «Secuencia desconocida» aparece donde corresponde.
  - El filtro «Solo con secuencia» deja 19 trucos.
- **Coleccionables:**
  - Marcar como encontrado actualiza el contador (1 de 18).
  - El estado «Revisar» y el contador manual funcionan.
  - «Ocultar encontrados» persiste tras recargar y lo comparte el mapa.
- **Ficha:**
  - Mi registro guarda estado, fecha, plataforma y valoración, y añade a la lista para hoy.
  - Una foto PNG real se guarda en IndexedDB y se muestra como `blob:` con ancho natural 1.
  - Un SVG se rechaza.
  - Todo persiste tras recargar.
- **Mi espacio:**
  - Muestra las listas y la foto; el perfil (nombre, consola, avatar) funciona.
  - La exportación con fotos (v3) incluye `data:image/png`.
  - Borrar las fotos y reimportar el archivo las restaura.
- **Migración:** un progreso v2 sembrado antes de cargar la página se lee y se guarda como v3 sin perder guardados, notas ni la preferencia de spoilers.
- **Consola:** el cambio de plataforma funciona; PSSR aparece en PS5 Pro y ≈720p en Series S; los hápticos del DualSense no aparecen en Xbox.
- **Equipamiento:**
  - Detecta un arma larga puesta en un espacio de arma corta.
  - Un arma única no ofrece accesorios.
  - El costo suma solo precios publicados ($6,675).
  - Guardar 2 equipamientos y compararlos funciona.
  - Un enlace compartido se carga una sola vez y luego se limpia la URL.
- **Axe (WCAG 2 AA):** sin errores serios en `/trucos`, `/coleccionables`, `/coleccionables/orca`, `/consola`, `/equipamiento` y `/mi-espacio`.

## Errores encontrados y corregidos durante el QA

1. **Comparar equipamientos.** El selector guardaba el estado inicial vacío si el segundo equipamiento se guardaba después, y la tabla no aparecía. Ahora usa los dos primeros cuando la selección no existe.
2. **Enlace compartido.** El aviso aparecía 3 veces porque el efecto se repetía durante la transición de React Router 7. Se añadió una guarda.
3. **Minimapa (axe `label-content-name-mismatch`).** El nombre accesible no contenía el texto visible. Ahora empieza con «Precisión: … · Ver en el mapa».
5. **Fotos en WebKit real (CI).** La subida quedaba en «Guardando…» porque WebKit, en contextos efímeros y en navegación privada de Safari, no guarda bien `Blob` en IndexedDB. Ahora se guardan los bytes (`ArrayBuffer`) con su tipo, la reducción de tamaño tiene un límite de 8 s y cada transacción de 15 s; si se agota, la app muestra un error en vez de quedarse esperando.
4. **Evidencia de consola.** Resolución y estabilidad venían de un mismo análisis técnico citado por dos guías. Se bajaron de «contrastado» a «reportado».

## Límites (no probado)

- No hubo pruebas en consola física (PS5, PS5 Pro, Series X o S) ni dentro del juego: ningún dato es «comprobado».
- Las fotos no se probaron con la cámara real de Android: se probaron con archivos PNG inyectados. La reducción a 1600 px depende de `createImageBitmap` del navegador.
- WebKit real queda para CI.
