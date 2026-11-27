import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { ENTIDADES } from '../src/data/catalog';
import manifest from '../public/media/media-manifest.json';

const media = new Set((manifest as { items: { id: string }[] }).items.map((m) => m.id));
const record = z.object({
  id: z.string().regex(/^[a-z]+:[a-z0-9-]+$/),
  entidad: z.enum(ENTIDADES),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string().min(1),
  resumen: z.string().min(5),
  hechos: z.array(z.object({ etiqueta: z.string(), valor: z.union([z.string(), z.number()]) })),
  estado: z.enum(['oficial', 'comprobado', 'contrastado', 'reportado']),
  grupos: z.array(z.string()),
  fuentes: z.array(z.string().url()).min(1),
  coords: z.object({ sistema: z.literal('gtadb6-world-m'), x: z.number(), y: z.number() }).nullable(),
  foto: z.string().nullable(),
  origen: z.object({ proveedor: z.literal('GTA Atlas'), licencia: z.literal('CC BY-SA 4.0'), url: z.string().url() }),
});
const NO_EDITORIAL = new Set(['video', 'gtadb', 'rockstar']);
const index = JSON.parse(readFileSync('content/catalog/index.json', 'utf8'));

describe('catálogo ampliado (GTA Atlas)', () => {
  for (const e of ENTIDADES) {
    it(`${e}: esquema, evidencia honesta, fotos solo oficiales y sin pines en el mapa`, () => {
      const rows = JSON.parse(readFileSync(`content/catalog/${e}.json`, 'utf8'));
      expect(rows.length).toBe(index.resumen[e].publicados);
      const ids = new Set<string>();
      for (const r of rows) {
        record.parse(r);
        expect(ids.has(r.id)).toBe(false);
        ids.add(r.id);
        if (r.estado === 'contrastado') expect(r.grupos.filter((g: string) => !NO_EDITORIAL.has(g)).length).toBeGreaterThanOrEqual(2);
        if (r.estado === 'oficial') expect(r.grupos).toContain('rockstar');
        if (r.foto) expect(media.has(r.foto)).toBe(true);
        expect(r).not.toHaveProperty('mapPosition');
        expect(JSON.stringify(r)).not.toMatch(/footage-still|\/media\/vehicles\/|in_game_photo|rating/);
      }
    });
  }
  it('el índice declara licencia y atribución obligatorias', () => {
    expect(index.licencia.nombre).toBe('CC BY-SA 4.0');
    expect(index.creditosRequeridos).toContain('GTA Atlas (https://atlasgta.com), CC BY-SA 4.0');
    expect(index.totales.publicados).toBe(ENTIDADES.reduce((s, e) => s + index.resumen[e].publicados, 0));
  });
});
