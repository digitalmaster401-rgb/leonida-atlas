---
name: diseno-visual
description: Mantener la identidad premium de LEONIDA ATLAS (negro, magenta, cian, lima) con accesibilidad AA y diseño móvil primero. Usar al crear o rediseñar pantallas, componentes o estilos.
---

# Diseño visual

- **Tokens** (`src/styles/global.css :root`): `--bg #0b0d14`, superficies `--surface*`, `--magenta #ff3ea5` (acción y selección), `--cyan #22d3ee` (enlaces y foco suave), `--lime #c6ff3d` (CTA y éxito), `--amber` (avisos), `--violet` (personajes y coleccionables). Tipografías: Barlow Condensed (títulos) e Inter (texto).
- **Evidencia visible:** cada dato muestra su insignia (`EvidenceBadge`) y sus fuentes (`SourceLinks`); el color nunca es la única señal.
- **Móvil primero:** probar a 360, 390, 768, 1280 y 1920; sin desbordamiento horizontal; objetivos táctiles ≥ 44 px; navegación inferior.
  - Las tablas van dentro de `.table-wrap`, que es `position: relative` y contiene a los `.sr-only`.
  - Elementos de grid o flex con contenido ancho: `min-width: 0`.
- **CSP:** sin `style` en línea en el HTML ni `<style>` inyectados; los estilos dinámicos solo por CSSOM (`style={{…}}` de React).
- **Movimiento:** respeta `prefers-reduced-motion`.
- **Plan de la siguiente etapa:** `docs/DISENO_PREMIUM.md` (navegación Mapa · Explorar · Dinero · Mi espacio · Novedades).
