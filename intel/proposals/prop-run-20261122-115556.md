# ATLAS INTELLIGENCE: 7 nuevos, 0 actualizaciones

Corrida `run-20261122-115556` · 2026-11-22T11:55:57.965Z

> Propuesta automática para **revisión humana**. Nada de esto se publica como confirmado sin aprobar este PR; los cambios a «comprobado» o «parcheado» exigen evidencia con fecha, plataforma y versión.

| Hallazgo | Cambio | Antes → después | Sensible | Motivo | Fuentes |
|---|---|---|---|---|---|
| How to Find the Vercetti Estate in GTA 6 | nuevo | — → reportado (ubicación) | no | Nuevo hallazgo de GTA BOOM | [1](https://www.gtaboom.com/how-to-find-the-vercetti-estate-in-gta-6-a2d6) |
| Janelle James Bullied Her Way Into GTA 6, Then Rockstar Sent Her a Custom PS5 Pro | nuevo | — → nuevo_sin_verificar (noticia) | no | Nuevo hallazgo de GTA BOOM | [1](https://www.gtaboom.com/janelle-james-bullied-her-way-into-gta-6-then-rockstar-sent-her-a-custom-ps5-pro-ad55) |
| How to Find Dexter's Apartment in GTA 6 | nuevo | — → reportado (ubicación) | no | Nuevo hallazgo de GTA BOOM | [1](https://www.gtaboom.com/how-to-find-dexters-apartment-in-gta-6-23b7) |
| GTA 6 All Characters | nuevo | — → reportado (personaje) | no | Nuevo hallazgo de PowerPyx | [1](https://www.powerpyx.com/gta-6-all-characters/) |
| GTA 6 Ian (Character) | nuevo | — → reportado (personaje) | no | Nuevo hallazgo de PowerPyx | [1](https://www.powerpyx.com/gta-6-ian-character/) |
| GTA 6 Joey (Character) | nuevo | — → reportado (personaje) | no | Nuevo hallazgo de PowerPyx | [1](https://www.powerpyx.com/gta-6-joey-character/) |
| GTA 6 Celine (Character) | nuevo | — → reportado (personaje) | no | Nuevo hallazgo de PowerPyx | [1](https://www.powerpyx.com/gta-6-celine-character/) |

## Revisión humana asistida (22-nov-2026)
- Se leyeron las 7 fuentes originales (cargan y la fecha coincide). Se corrigieron categoría y estado: el clasificador había marcado una noticia de celebridad como «configuración/reportado» por mencionar «PS5 Pro», y las guías de ubicación y de personajes como «noticia». Detalle: `docs/AUDITORIA_PR3.md`.
- Ningún hallazgo pasa a dato confirmado: todos son de una sola fuente y sin prueba en juego.

## Riesgos
- Los hallazgos provienen de titulares y resúmenes de feeds: verifica la fuente antes de convertirlos en fichas públicas.

## Pruebas ejecutadas por el workflow
- `npm run validate:data`
- `npx vitest run tests/intel`
- `npm run build`
