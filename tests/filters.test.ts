import { describe, expect, it } from 'vitest';
import entries from '../content/entries.json';
import type { Entry } from '../src/data/schema';
import { applyFilters, readFilters } from '../src/lib/filters';

const list = entries as Entry[];

describe('filtros combinables', () => {
  it('combina región, categoría y evidencia', () => {
    const f = readFilters(new URLSearchParams('region=vice-city&category=negocios&status=oficial'));
    const out = applyFilters(list, f);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((e) => e.region === 'vice-city' && e.category === 'negocios' && e.status === 'oficial')).toBe(true);
  });
  it('filtra por capítulo y spoiler', () => {
    const out = applyFilters(list, readFilters(new URLSearchParams('chapter=Capítulo 3&spoiler=1')));
    expect(out.every((e) => e.chapter === 'Capítulo 3' && e.spoilerLevel <= 1)).toBe(true);
    expect(applyFilters(list, readFilters(new URLSearchParams('spoiler=0'))).some((e) => e.spoilerLevel > 0)).toBe(false);
  });
  it('ordena por pago descendente', () => {
    const out = applyFilters(list.filter((e) => e.category === 'dinero'), readFilters(new URLSearchParams('sort=pago')));
    const vals = out.map((e) => e.reward?.amount?.max ?? -1);
    expect([...vals].sort((a, b) => b - a)).toEqual(vals);
  });
});
