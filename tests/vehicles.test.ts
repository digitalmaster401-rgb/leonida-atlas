import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import entries from '../content/entries.json';
import sources from '../content/sources.json';
import manifest from '../public/media/media-manifest.json';
import { sourceSchema, validateDataset, type Entry } from '../src/data/schema';
import { bestIndex, parseCompare, sortVehicles, vehicleEntries } from '../src/lib/vehicles';

const src = z.array(sourceSchema).parse(sources);
const media = new Set(manifest.items.map((m) => m.id));
const list = vehicleEntries(entries as Entry[]);

describe('catálogo de vehículos', () => {
  it('todos los vehículos tienen datos comparables y los precios llevan evidencia', () => {
    expect(list.length).toBe((entries as Entry[]).filter((e) => e.category === 'vehiculos').length);
    for (const v of list) if (v.vehicle.registration !== null || v.vehicle.sellValue !== null) expect(v.vehicle.priceSources.length).toBeGreaterThan(0);
  });
  it('dos medios con el mismo origen de datos no convierten un precio en «contrastado»', () => {
    const bad = structuredClone(entries) as Entry[];
    const v = bad.find((e) => e.id === 'veh-pegassi-infernus-96')!;
    v.vehicle!.priceStatus = 'contrastado';
    const res = validateDataset(bad, src, media);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join('\n')).toMatch(/precio marcado como contrastado con menos de dos fuentes independientes/);
  });
  it('un precio sin fuente es inválido', () => {
    const bad = structuredClone(entries) as Entry[];
    const v = bad.find((e) => e.id === 'veh-pfister-comet-88')!;
    v.vehicle!.priceSources = [];
    expect(validateDataset(bad, src, media).ok).toBe(false);
  });
  it('ordena por registro sin tratar lo no publicado como cero', () => {
    const s = sortVehicles(list, 'registro');
    expect(s[0].id).toBe('veh-pegassi-infernus-96');
    const firstNull = s.findIndex((v) => v.vehicle.registration === null);
    expect(s.slice(firstNull).every((v) => v.vehicle.registration === null)).toBe(true);
  });
  it('lee la selección del comparador desde la URL', () => {
    const valid = new Set(list.map((v) => v.id));
    expect(parseCompare('veh-pegassi-infernus-96,inventado,veh-pegassi-infernus-96,veh-pfister-comet-88,veh-vapid-ganado,veh-crest-kayak', valid)).toEqual([
      'veh-pegassi-infernus-96',
      'veh-pfister-comet-88',
      'veh-vapid-ganado',
    ]);
    expect(parseCompare(null, valid)).toEqual([]);
  });
  it('resalta el mayor solo si hay al menos dos valores publicados', () => {
    expect(bestIndex([100, null, 300])).toBe(2);
    expect(bestIndex([100, null, null])).toBeNull();
  });
});
