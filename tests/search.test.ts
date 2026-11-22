import { describe, expect, it } from 'vitest';
import entries from '../content/entries.json';
import type { Entry } from '../src/data/schema';
import { levenshtein, normalize, search } from '../src/lib/search';

const list = entries as Entry[];
const ids = (q: string) => search(list, q).map((h) => h.entry.id);

describe('búsqueda', () => {
  it('normaliza acentos y apóstrofos', () => {
    expect(normalize('Vehículos ’95 Grotti')).toBe('vehiculos 95 grotti');
  });
  it('distancia de Levenshtein', () => {
    expect(levenshtein('moses', 'moises')).toBe(1);
    expect(levenshtein('abc', 'xyz', 1)).toBeGreaterThan(1);
  });
  it('encuentra por nombre exacto', () => {
    expect(ids('Duke 556')[0]).toBe('arm-duke-556');
  });
  it('tolera acentos y errores leves', () => {
    expect(ids('moises')).toContain('din-moses');
    expect(ids('grasrivers')).toContain('lug-grassrivers');
    expect(ids('joyerias')).toContain('din-joyerias-yasmani');
  });
  it('usa sinónimos (carro → auto)', () => {
    expect(ids('carro moses')).toContain('din-moses');
  });
  it('exige todos los términos', () => {
    expect(ids('stockyard tatuajes')).toContain('neg-electric-fang');
    expect(ids('stockyard zzzzqqq')).toHaveLength(0);
  });
  it('consulta vacía no devuelve nada', () => {
    expect(search(list, '   ')).toHaveLength(0);
  });
});
