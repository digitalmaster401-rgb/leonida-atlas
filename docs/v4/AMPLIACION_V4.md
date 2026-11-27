# Ampliación integral V4 (paquete del 26-nov-2026)

Paquete preparado por ChatGPT tras revisar el repositorio. **No sustituye nada**: sus 29 requisitos se añadieron a `docs/MATRIZ_FUNCIONAL.csv` (área «V4. Ampliación integral») con el estado real de cada uno; ningún requisito previo se eliminó. Fuente original: `docs/v4/REQUISITOS_V4.json`.

## Orden de desarrollo
1. 4A.2 identidad visual y Explorar
2. 4B mapa y Mi espacio conservando datos
3. 4C datos y catálogos visuales
4. 4D misiones, logros y progreso
5. 5 cuentas, sincronización, panel administrativo
6. 6 Atlas Intelligence/Watch con permisos y revisión
7. 7 QA, despliegue y mantenimiento

Estado: 4A.2 en curso en el PR #12 (sin fusionar).

## Reglas que añade
- Acumulativo: no reemplazar la matriz ni asumir que existen categorías; no inventar datos ni totales.
- Separar el porcentaje oficial de finalización (con reglas verificadas) del porcentaje de elementos registrados en Atlas.
- IA solo como recreación rotulada; fotografías con licencia.
- Registros de comunidad siempre a revisión; un cambio de versión del juego activa revalidación, nunca confirmación automática.

## Decisiones técnicas (sin cambios de arquitectura todavía)
- Se mantiene React + TypeScript + Vite + PWA y el visor de mapa propio. Leaflet `CRS.Simple` o MapLibre solo si una comparación con el mapa plano autorizado demuestra ventajas (rendimiento móvil, tiles autorizados).
- Sin geolocalización terrestre, rutas por carretera ni escala en km sin un grafo y una escala calibrados.
- Supabase (Postgres, Auth, Storage, RLS) es candidato para la fase 5; **no se contrata ni se activa** hasta que esa fase lo requiera. Se conserva la exportación/importación local.
- IA de la fase 6: backend con herramientas limitadas a la base de datos y a los permisos del usuario; ninguna clave privilegiada en el navegador.

## Fuentes documentadas (no comprobadas en vivo desde este entorno)
| Fuente | Qué ofrece | Estado / condición |
|---|---|---|
| GTABase (gtabase.com/es/gta-6/mapa) | Referencia funcional y editorial del mapa | Sin API pública autorizada; pedir permiso antes de reutilizar datos, fotos o mosaicos |
| GTADB (api.gtadb.org) | Landmarks, geocode, elevation, staticmap (experimental) | Licencia declarada CC BY 4.0 con excepciones; sin claves; importador de staging en `research/gtadb/` |
| FullSweep (fullsweepmap.com/developers) | API JSON en píxeles de su propio mapa | CC BY 4.0 declarada, arte excluido; coordenadas no compatibles sin calibración |
| Open GTA 6 Map (github.com/fbritoferreira/gta6) | Datos de comunidad | Verificar derechos por archivo y procedencia |
| Rockstar (rockstargames.com/VI, Newswire) | Fuentes primarias | Ver no implica permiso de redistribución comercial |
| YouTube (canal de Rockstar y otros) | Candidatos de ATLAS WATCH | YouTube Data API con clave como secreto y cuota; otras redes con acceso aprobado o aportación manual |

## Taxonomía candidata del mapa (sin verificar)
Observada en fuentes de terceros; **no se publica** ni se usa para totales hasta tener evidencia por categoría.

- **Personal:** Garajes, Pisos francos, Casas, Propiedades, Refugios
- **Actividades del juego:** Bancos, Cajas fuertes, Cajeros remolcables, Operaciones ilegales, Peristas, Préstamos rápidos, Establecimientos y actividades especiales
- **Entretenimiento:** Gimnasios, Golf, Minigolf, Pesca, Paracaidismo, Máquinas recreativas, Quedadas de coches, Carreras, Eventos aleatorios, Desafíos
- **Coleccionables:** Ahol Street Art, Bajo el puente, Cocaine Flamingos, Cómics, Easter Eggs, Intercambios de libros, Listas de reproducción únicas, Luxury Watches, Meditations, Mensajes en una botella, Meteoritos, Murales 1010, Paquetes ocultos, Revistas y libros, Saltos acrobáticos, Saltos BASE, SCOOP Containers, Style Magazines, Tesoros, Vuelos de cuchilla, Waink: Curiosidades, Waink: Esculturas, Waink: Lugares emblemáticos, Yellow Loot Boxes, Cartas coleccionables, Waink: Peewees Billboards, Waink: No Flusher Tags
- **Otras:** Vehículos especiales y ocultos, Armas, Munición, Equipamiento, Ropa, Accesorios, Restaurantes, Tiendas, Servicios, Animales, Misiones, Lugares secretos, Puntos de interés

## Investigación cartográfica
`research/gtadb/` contiene el importador y sus 6 pruebas sintéticas (`npm run test:research`, también en CI). No se ha ejecutado contra la API ni se ha importado nada a `content/`. Requisitos previos: licencia y esquema reales verificados, calibración con puntos de control y error medido, revisión humana por registro.
