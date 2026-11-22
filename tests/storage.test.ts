import { beforeEach, describe, expect, it } from 'vitest';
import { BACKUP_KEY, backupCurrent, emptyProgress, loadProgress, makeExport, mergeProgress, migrate, parseImport, restoreBackup, saveProgress, STORAGE_KEY } from '../src/lib/storage';

const known = new Set(['din-moses', 'arm-duke-556']);

describe('almacenamiento del progreso', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve progreso vacío sin datos o con datos corruptos', () => {
    expect(loadProgress().favorites).toEqual([]);
    localStorage.setItem(STORAGE_KEY, '{no json');
    expect(loadProgress().schemaVersion).toBe(4);
  });

  it('guarda y restaura', () => {
    const p = { ...emptyProgress(), favorites: ['din-moses'] };
    expect(saveProgress(p)).toBe(true);
    expect(loadProgress().favorites).toEqual(['din-moses']);
  });

  it('migra el esquema v1 a v4', () => {
    const m = migrate({ version: 1, favorites: ['a', 'a'], completed: [], notes: { a: 'hola', b: '  ' } });
    expect(m?.schemaVersion).toBe(4);
    expect(m?.favorites).toEqual(['a']);
    expect(m?.notes.a.text).toBe('hola');
    expect(m?.notes.b).toBeUndefined();
  });

  it('rechaza estructuras inválidas', () => {
    expect(migrate({ schemaVersion: 2, favorites: 'x' })).toBeNull();
    expect(migrate(null)).toBeNull();
    expect(migrate({ schemaVersion: 2, favorites: [], completed: [], notes: {}, settings: { spoilerLevel: 7 }, updatedAt: '' })).toBeNull();
  });

  it('exporta e importa con validación', () => {
    const p = { ...emptyProgress(), favorites: ['din-moses', 'desconocida'], notes: { 'din-moses': { text: 'nota', updatedAt: '2026-11-22T00:00:00Z' } } };
    const res = parseImport(JSON.stringify(makeExport(p)), known);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.notes['din-moses'].text).toBe('nota');
      expect(res.unknownIds).toEqual(['desconocida']);
    }
    expect(parseImport('hola', known).ok).toBe(false);
    expect(parseImport('{"app":"otra"}', known).ok).toBe(false);
  });

  it('combina progresos conservando la nota más reciente', () => {
    const a = { ...emptyProgress(), favorites: ['x'], notes: { n: { text: 'vieja', updatedAt: '2026-01-01' } } };
    const b = { ...emptyProgress(), favorites: ['y'], notes: { n: { text: 'nueva', updatedAt: '2026-11-01' } } };
    const m = mergeProgress(a, b);
    expect(m.favorites.sort()).toEqual(['x', 'y']);
    expect(m.notes.n.text).toBe('nueva');
  });

  it('crea y restaura respaldo', () => {
    saveProgress({ ...emptyProgress(), completed: ['arm-duke-556'] });
    backupCurrent();
    expect(localStorage.getItem(BACKUP_KEY)).not.toBeNull();
    saveProgress(emptyProgress());
    expect(restoreBackup()?.completed).toEqual(['arm-duke-556']);
  });

  it('migra el esquema v2 a v4 sin perder datos', () => {
    const v2 = { schemaVersion: 2, favorites: ['a'], completed: ['b', 'b'], notes: { a: { text: 'x', updatedAt: '2026-11-20' } }, settings: { spoilerLevel: 2 }, updatedAt: '2026-11-20' };
    const m = migrate(v2)!;
    expect(m.schemaVersion).toBe(4);
    expect(m.completed).toEqual(['b']);
    expect(m.notes.a.text).toBe('x');
    expect(m.settings).toEqual({ spoilerLevel: 2, hideFound: false });
    expect(m.records).toEqual({});
    expect(m.loadouts).toEqual([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v2));
    expect(loadProgress().favorites).toEqual(['a']);
  });

  it('valida registros, contadores y equipamientos de v3', () => {
    const ok = {
      ...emptyProgress(),
      records: { 'col-orca': { state: 'revisar', date: '2026-11-21', platform: 'ps5_pro', rating: 4 } },
      counters: { 'col-tarjetas': 37 },
      loadouts: [{ id: 'l1', name: 'Sigilo', sidearm: ['arm-klose-k17', null], longarm: [null, null], melee: [null], attachments: { 'arm-klose-k17': ['suppressor'] }, updatedAt: '2026-11-22' }],
    };
    expect(migrate(ok)?.records['col-orca'].platform).toBe('ps5_pro');
    expect(migrate({ ...ok, records: { x: { state: 'robado' } } })).toBeNull();
    expect(migrate({ ...ok, records: { x: { rating: 9 } } })).toBeNull();
    expect(migrate({ ...ok, counters: { x: -1 } })).toBeNull();
    expect(migrate({ ...ok, loadouts: [{ id: 'l', name: 'x', sidearm: 'no' }] })).toBeNull();
    expect(migrate({ ...ok, profile: { name: 'Yo', avatar: 'desconocido', platform: null } })).toBeNull();
  });

  it('importa fotos opcionales solo si son imágenes válidas', () => {
    const photo = { id: 'p1', entryId: 'din-moses', caption: 'Aquí', createdAt: '2026-11-22', dataUrl: 'data:image/jpeg;base64,AAAA' };
    const good = parseImport(JSON.stringify(makeExport(emptyProgress(), [photo])), known);
    expect(good.ok && good.photos.length).toBe(1);
    const bad = parseImport(JSON.stringify(makeExport(emptyProgress(), [{ ...photo, dataUrl: 'data:text/html;base64,AAAA' }])), known);
    expect(bad.ok).toBe(false);
    const none = parseImport(JSON.stringify(makeExport(emptyProgress())), known);
    expect(none.ok && none.photos).toEqual([]);
  });

  it('al combinar conserva el contador mayor y el equipamiento más reciente', () => {
    const l = { id: 'l1', name: 'A', sidearm: [null, null], longarm: [null, null], melee: [null], attachments: {}, updatedAt: '2026-11-01' };
    const a = { ...emptyProgress(), counters: { c: 3 }, loadouts: [l] };
    const b = { ...emptyProgress(), counters: { c: 9 }, loadouts: [{ ...l, name: 'B', updatedAt: '2026-11-20' }] };
    const m = mergeProgress(a, b);
    expect(m.counters.c).toBe(9);
    expect(m.loadouts[0].name).toBe('B');
  });

  it('migra v3 a v4 conservando fotos-ref, registros, contadores y equipamientos', () => {
    const v3 = {
      ...emptyProgress(),
      schemaVersion: 3,
      records: { 'col-orca': { state: 'revisar', rating: 4 } },
      counters: { 'col-tarjetas': 12 },
      loadouts: [{ id: 'l1', name: 'A', sidearm: [null, null], longarm: [null, null], melee: [null], attachments: {}, updatedAt: '2026-11-22' }],
    } as Record<string, unknown>;
    delete v3.routes;
    delete v3.garage;
    const m = migrate(v3)!;
    expect(m.schemaVersion).toBe(4);
    expect(m.records['col-orca'].rating).toBe(4);
    expect(m.counters['col-tarjetas']).toBe(12);
    expect(m.loadouts).toHaveLength(1);
    expect(m.routes).toEqual([]);
    expect(m.garage).toEqual([]);
  });

  it('valida rutas personales y colección de vehículos (v4)', () => {
    const route = { id: 'ruta-1', name: 'Keys', objective: 'Lecturas', stops: [{ entryId: 'col-orca', note: '', visited: true }], updatedAt: '2026-11-22' };
    const ok = { ...emptyProgress(), routes: [route], garage: ['veh-shitzu-squalo', 'veh-shitzu-squalo'] };
    const m = migrate(ok)!;
    expect(m.routes[0].stops[0].visited).toBe(true);
    expect(m.garage).toEqual(['veh-shitzu-squalo']);
    expect(migrate({ ...ok, routes: [{ ...route, stops: [{ entryId: 'x', note: '', visited: 'si' }] }] })).toBeNull();
    expect(migrate({ ...ok, routes: [{ ...route, stops: [{ x: 0.5, y: 0.5 }] }] })).toBeNull(); // nunca coordenadas libres
    expect(migrate({ ...ok, routes: [{ ...route, stops: Array(41).fill(route.stops[0]) }] })).toBeNull();
    expect(migrate({ ...ok, garage: 'veh' })).toBeNull();
    const res = parseImport(JSON.stringify(makeExport(ok)), new Set(['col-orca']));
    expect(res.ok && res.unknownIds).toEqual(['veh-shitzu-squalo']);
  });

  it('al combinar une garajes y conserva la ruta editada más recientemente', () => {
    const r = { id: 'r', name: 'vieja', objective: '', stops: [], updatedAt: '2026-11-01' };
    const m = mergeProgress({ ...emptyProgress(), routes: [r], garage: ['a'] }, { ...emptyProgress(), routes: [{ ...r, name: 'nueva', updatedAt: '2026-11-20' }], garage: ['b'] });
    expect(m.routes[0].name).toBe('nueva');
    expect(m.garage.sort()).toEqual(['a', 'b']);
  });
});
