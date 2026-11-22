# Investigación de la fase 3: vehículos, mapa y referencia de usabilidad

Consulta: 22-nov-2026. **No hubo pruebas en el juego.**

## Vehículos
- Páginas leídas:
  - GuruGamer, «Top 10 Highest Value Cars in GTA 6…» (21-nov).
  - GTA 6 Supercars, «Most Expensive Cars In GTA 6: Top 10» (21-nov).
  - GTA BASE, «GTA 6 Car Stealing Guide» (21-nov).
- No se pudieron leer (HTTP 403): GameSpot (garajes y precios), MetaForge (cómo conseguir autos) y Sportskeeda (autos más caros). **Por eso no se publican precios de garajes.**
- **Independencia de las fuentes:**
  - GuruGamer y GTA 6 Supercars publican los mismos 10 vehículos con los mismos valores.
  - GTA 6 Supercars declara que sus datos vienen de los escaneos WAINK de GTABase.
  - Se cuentan como **un solo grupo editorial** (`gtabase`). Todos los precios quedan como «reportado».
  - El validador impide marcarlos «contrastado» (hay una prueba en `tests/vehicles.test.ts`).
- **Datos incorporados:**
  - 9 vehículos nuevos con clase, valor de registro, valor de venta y rastreador. El Mammoth Patriot no tiene valor de registro publicado.
  - Al Grotti Cheetah ’95, que ya era oficial, se le añadieron sus valores reportados.
- **Ubicaciones:**
  - Son de una sola fuente (GTA 6 Supercars), así que quedan como «reportado».
  - Solo dos tienen punto en el mapa: Crosstown (barrio) y Port Gellhorn (zona), ambos sobre el rótulo.
  - Las demás figuran en la lista «Sin ubicación documentada» del mapa.
- **Mecánica (reportado):**
  - El registro cuesta de 2 a 3 veces el valor de venta, y el daño reduce el valor (GuruGamer y GTA 6 Supercars).
  - Un auto con rastreador no se modifica hasta registrarlo; el registro y la venta se hacen en un Pay 'n' Spray (GTA BASE).
  - Las fuentes no coinciden sobre dónde se venden los autos: GuruGamer dice que a través de la app WAINK, GTA 6 Supercars que en un Pay 'n' Spray, y GTA BASE menciona Pay 'n' Spray y también traficantes. No se afirma ninguna de las versiones como única.
- **Imágenes:** solo las oficiales que ya tenía la guía. Los vehículos sin imagen oficial usan la «Ilustración editorial» rotulada como tal.

## Mapa oficial v2
Ver `docs/MAPA_OFICIAL_V2.md`.

## Referencia de usabilidad: vicerepere.com (análisis, sin copiar)
Se leyeron 4 páginas públicas (inicio/mapa, catálogo, ayuda y noticias). El mapa no se mostró en la lectura automática, así que su comportamiento en vivo no se observó.

**Ideas de usabilidad que adoptamos de forma propia:**
- Filtros del mapa en un panel plegable.
- «Ocultar visitados».
- Distinguir las posiciones verificadas de las estimadas.
- Agrupar marcadores cercanos.
- Un espacio personal sin cuenta, guardado en el navegador, que se puede exportar.
- Enlace que conserva el lugar seleccionado.

**Lo que evitamos:**
- Pantalla vacía cuando el mapa falla. Aquí la lista de puntos y el póster anterior sirven de respaldo.
- Navegación duplicada.
- Categorías vacías.
- Avisos de precisión repetidos en bloques largos. Aquí la precisión va en cada punto y en un filtro.
- Anuncios y banners de consentimiento.

**Diferencia de datos:**
- Ese sitio usa un fondo reconstruido por la comunidad (GTADB) con posiciones estimadas.
- LEONIDA ATLAS usa el **póster oficial** de Rockstar y marca cada punto con su precisión, sin inventar coordenadas.

No se copió ningún diseño, texto, ícono ni dato.
