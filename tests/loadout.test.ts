import { describe, expect, it } from 'vitest';
import entries from '../content/entries.json';
import loadout from '../content/loadout.json';
import type { Entry } from '../src/data/schema';
import type { LoadoutFile } from '../src/data/schema-fase2';
import { buildWeapons, checkLoadout, decodeLoadout, emptyLoadout, encodeLoadout, loadoutCost } from '../src/lib/loadout';

const data = loadout as LoadoutFile;
const weapons = buildWeapons(entries as Entry[], data.classes);
const W = (id: string) => weapons.find((w) => w.id === id)!;

describe('constructor de equipamiento', () => {
  it('clasifica las armas de la guía sin inventar clases', () => {
    expect(W('arm-klose-k17').cls).toBe('sidearm');
    expect(W('arm-honky-tonk-mustang-357').cls).toBe('sidearm');
    expect(W('arm-fortune-son-moreland-850').cls).toBe('longarm');
    expect(W('arm-fortune-son-laird-350').cls).toBe('longarm');
    expect(W('arm-shark-knife').cls).toBe('melee');
    expect(W('arm-crabshack-vf5').cls).toBe('unclassified');
    expect(weapons.some((w) => w.id === 'arm-patron-tropical')).toBe(false);
    expect(W('arm-vice-city-heathen').unique).toBe(true);
    expect(W('arm-duke-556').unique).toBe(false);
  });

  it('respeta los espacios: 2 cortas, 2 largas y 1 cuerpo a cuerpo', () => {
    const l = emptyLoadout(data.slots);
    expect(l.sidearm).toHaveLength(2);
    expect(l.longarm).toHaveLength(2);
    expect(l.melee).toHaveLength(1);
    l.sidearm = ['arm-klose-k17', 'arm-scorpio-nipper-38', 'arm-girardi-es9'];
    expect(checkLoadout(l, weapons, data).some((w) => w.level === 'error' && /Solo caben 2/.test(w.text))).toBe(true);
  });

  it('detecta clase incorrecta, repetidas y accesorios en armas únicas', () => {
    const l = emptyLoadout(data.slots);
    l.sidearm = ['arm-duke-556', null];
    l.longarm = ['arm-vice-city-heathen', 'arm-vice-city-heathen'];
    l.attachments = { 'arm-vice-city-heathen': ['suppressor'] };
    const t = checkLoadout(l, weapons, data).map((w) => w.text).join('\n');
    expect(t).toMatch(/Duke 556 es arma larga, no arma corta/);
    expect(t).toMatch(/repetida/);
    expect(t).toMatch(/únicas no se pueden modificar/);
  });

  it('un equipamiento válido no tiene errores y suma solo precios publicados', () => {
    const l = emptyLoadout(data.slots);
    l.sidearm = ['arm-klose-k17', 'arm-scorpio-nipper-38'];
    l.longarm = ['arm-duke-556', null];
    l.melee = ['arm-shark-knife'];
    l.attachments = { 'arm-duke-556': ['optic'] };
    expect(checkLoadout(l, weapons, data).filter((w) => w.level === 'error')).toEqual([]);
    const c = loadoutCost(l, weapons);
    expect(c.total).toBe(975 + 550 + 1450);
    expect(c.unknown).toEqual(['Shark Knife']);
  });

  it('codifica y decodifica el enlace para compartir, y rechaza basura', () => {
    const l = { ...emptyLoadout(data.slots, 'Sigilo ñ'), sidearm: ['arm-klose-k17', null] };
    const back = decodeLoadout(encodeLoadout(l), data.slots)!;
    expect(back.name).toBe('Sigilo ñ');
    expect(back.sidearm).toEqual(['arm-klose-k17', null]);
    expect(decodeLoadout('%%%', data.slots)).toBeNull();
    expect(decodeLoadout(btoa('{"n":1}'), data.slots)).toBeNull();
  });
});
