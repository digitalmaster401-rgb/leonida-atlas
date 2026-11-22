# LEONIDA ATLAS

Guía interactiva **independiente** de *Grand Theft Auto VI* en español de México: mapa oficial de Leonida, dinero, armas, vehículos, negocios, rutas y personajes. Cada dato indica su fuente, su fecha y su nivel de evidencia (oficial, comprobado, contrastado, reportado, pendiente u obsoleto).

> Guía independiente de fans. Sin afiliación con Rockstar Games. GTA VI y sus contenidos son de sus respectivos titulares.

## Qué incluye

- **Inicio** con portada original, buscador global, categorías, regiones, «Empieza aquí», novedades y mejores métodos contrastados.
- **Mapa**: visor del póster oficial con zoom, arrastre, pellizco y teclado; puntos con precisión declarada enlazados a las fichas (y de la ficha al mapa).
- **Dinero y glitches**: modo historia, modo online y glitches separados; calculadora con bruto, costos, neto y fórmulas visibles.
- **Armas, Vehículos, Negocios y propiedades, Rutas y tutoriales, Lugares, Personajes, Galería**.
- **Mi partida**: guardados, completados, notas y progreso en el dispositivo; exportar/importar JSON con validación y respaldo; preferencia de spoilers.
- **Fuentes y cambios**: fuentes con fecha, criterios y registro de cambios; botón para reportar errores.
- **ATLAS INTELLIGENCE** (`/intel`): investigación automatizada de fuentes autorizadas con cruce de evidencias, revalidación por parches, bitácora real, «Pregúntale a ATLAS» y envío de hallazgos a revisión. Ver [docs/ATLAS_INTELLIGENCE_QA.md](docs/ATLAS_INTELLIGENCE_QA.md).
- **PWA instalable**, funciona sin conexión, aviso de actualización.
- Cada ficha tiene URL propia (`/armas/duke-556`, `/dinero/vender-autos-a-moses`, …) con vista previa para WhatsApp, Discord y Facebook.

## Estructura

```
content/            entries.json (fichas), sources.json (fuentes), changelog.json
public/media/       imágenes oficiales optimizadas + media-manifest.json (derechos)
public/icons, og/   iconos PWA e imagen Open Graph propios
src/data/           esquema Zod, metadatos, carga de datos
src/lib/            búsqueda, filtros, almacenamiento, calculadora, compartir
src/components/     AppShell, ItemCard, EvidenceBadge, FilterBar, MapView, Gallery, MoneyCalculator, ProgressManager, SourcePanel, ShareAction…
src/pages/          Inicio, Mapa, Dinero, Categoría, Ficha, Buscar, Mi partida, Fuentes, Galería, Editor, Legal
scripts/            imágenes oficiales, iconos, prerender, servidor de prueba, auditorías, ZIP
tests/  e2e/        Vitest (unidad) y Playwright (navegador)
sources/            investigación: textos oficiales extraídos, lista de imágenes, bitácora
```

## Desarrollo

```bash
npm ci
npm run dev          # http://localhost:5173
npm run lint
npm run typecheck
npm run test         # Vitest
npm run build        # valida datos, compila y prerenderiza en dist/
npm run test:e2e     # Playwright contra dist/ (360, 390, 768, 1280, 1920 px, Pixel 7, iPhone emulado, offline)
npm run audit:legacy # busca material ajeno (video de terceros, fotogramas, marcas)
npm run zip          # ZIPs de distribución en release/
npm run intel:run    # corrida de ATLAS INTELLIGENCE (intel:dry no escribe)
```

Requisitos: Node 22. Decisiones técnicas: Vite + React 18 + TypeScript, React Router 7 (modo librería), CSS propio con variables (sin framework para mantener el peso bajo), Zod solo en pruebas/build y en el editor (carga diferida), visor de mapa propio sin Leaflet (una sola imagen, menos dependencias), vite-plugin-pwa (Workbox).

## Publicar

Ver **[DEPLOY.md](DEPLOY.md)** (Netlify desde el celular, en un solo paso con tu cuenta). Todavía no hay URL pública.

## Documentos

- [docs/REQUISITOS_ACUMULATIVOS.md](docs/REQUISITOS_ACUMULATIVOS.md) — matriz de requisitos acumulados (fuente: `docs/MATRIZ_FUNCIONAL.csv`).
- [docs/ATLAS_INTELLIGENCE_QA.md](docs/ATLAS_INTELLIGENCE_QA.md) — estado real de la investigación automatizada y activación desde Android.
- [AUDITORIA_DATOS.md](AUDITORIA_DATOS.md) — decisión y fuentes de cada ficha.
- [QA_REPORT.md](QA_REPORT.md) — resultados de pruebas, Lighthouse y capturas.
- [ATTRIBUTIONS.md](ATTRIBUTIONS.md) — derechos de imágenes, guías citadas y licencias.
- [CHANGELOG.md](CHANGELOG.md) · [LICENSE](LICENSE) (MIT solo para el código propio).
