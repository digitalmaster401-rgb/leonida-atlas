import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import cheats from '../content/cheats.json';
import consoleData from '../content/console.json';
import loadout from '../content/loadout.json';
import sources from '../content/sources.json';
import entries from '../content/entries.json';
import { sourceSchema, type Entry } from '../src/data/schema';
import { cheatsFileSchema, validateFase2 } from '../src/data/schema-fase2';

const src = z.array(sourceSchema).parse(sources);

describe('datos de la fase 2', () => {
  it('trucos, consola y equipamiento cumplen esquema e integridad', () => {
    expect(validateFase2(cheats, consoleData, loadout, src)).toEqual([]);
  });

  it('una secuencia solo es «contrastada» con dos grupos editoriales distintos (VICE reutiliza GTA BASE)', () => {
    const bad = structuredClone(cheats) as z.infer<typeof cheatsFileSchema>;
    const c = bad.cheats.find((x) => x.sequenceStatus === 'contrastado')!;
    c.sequenceSources = ['gtabase-cheats', 'vice-cheats'];
    expect(validateFase2(bad, consoleData, loadout, src).join('\n')).toMatch(/contrastado con menos de dos fuentes independientes/);
  });

  it('no se inventan secuencias: las desconocidas no tienen pasos y las publicadas citan fuente', () => {
    const data = cheatsFileSchema.parse(cheats);
    for (const c of data.cheats) {
      if (c.sequenceStatus === 'desconocida') expect(c.sequence).toBeNull();
      else expect(c.sequenceSources.length).toBeGreaterThan(0);
    }
    const bad = structuredClone(cheats) as z.infer<typeof cheatsFileSchema>;
    bad.cheats[0].sequenceStatus = 'desconocida';
    expect(validateFase2(bad, consoleData, loadout, src).join('\n')).toMatch(/desconocida no lleva pasos/);
  });

  it('las reglas de consecuencias (guardado, trofeos, en línea) están presentes', () => {
    const labels = cheatsFileSchema.parse(cheats).rules.map((r) => r.label);
    expect(labels).toEqual(expect.arrayContaining(['Guardado', 'Trofeos y logros', 'Modo']));
  });

  it('cada coleccionable individual pertenece a una colección y las colecciones declaran su total', () => {
    const list = (entries as Entry[]).filter((e) => e.category === 'coleccionables');
    const cols = list.filter((e) => e.tracking);
    expect(cols.length).toBeGreaterThanOrEqual(5);
    for (const e of list.filter((x) => !x.tracking)) expect(cols.map((c) => c.id)).toContain(e.collection);
    for (const c of cols) if (c.tracking!.total === null) expect(c.tracking!.totalStatus).toBe('pendiente');
  });
});
