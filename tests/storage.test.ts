import { beforeEach, describe, expect, it } from 'vitest';
import { BACKUP_KEY, backupCurrent, CORRUPT_KEY, emptyProgress, loadProgress, makeExport, mergeProgress, migrate, parseImport, restoreBackup, saveProgress, STORAGE_KEY } from '../src/lib/storage';

const known = new Set(['din-moses', 'arm-duke-556']);

describe('almacenamiento del progreso', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve progreso vacío sin datos o con datos corruptos', () => {
    expect(loadProgress().favorites).toEqual([]);
    localStorage.setItem(STORAGE_KEY, '{no json');
    expect(loadProgress().schemaVersion).toBe(5);
  });

  it('guarda y restaura', () => {
    const p = { ...emptyProgress(), favorites: ['din-moses'] };
    expect(saveProgress(p)).toBe(true);
    expect(loadProgress().favorites).toEqual(['din-moses']);
  });

  it('migra el esquema v1 a la versión actual (v5)', () => {
    const m = migrate({ version: 1, favorites: ['a', 'a'], completed: [], notes: { a: 'hola', b: '  ' } });
    expect(m?.schemaVersion).toBe(5);
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

  it('migra el esquema v2 a la versión actual sin perder datos', () => {
    const v2 = { schemaVersion: 2, favorites: ['a'], completed: ['b', 'b'], notes: { a: { text: 'x', updatedAt: '2026-11-20' } }, settings: { spoilerLevel: 2 }, updatedAt: '2026-11-20' };
    const m = migrate(v2)!;
    expect(m.schemaVersion).toBe(5);
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

  it('migra v3 a la versión actual conservando fotos-ref, registros, contadores y equipamientos', () => {
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
    expect(m.schemaVersion).toBe(5);
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

  it('v4 → v5: conserva todo y añade visitados, marcadores, objetivos, actividad y color de perfil', () => {
    const v4 = { ...emptyProgress(), schemaVersion: 4, favorites: ['a'], routes: [{ id: 'r1', name: 'R', objective: '', stops: [{ entryId: 'a', note: '', visited: true }], updatedAt: '2026-11-20' }], garage: ['v'], profile: { name: 'Lu', avatar: 'ola', platform: 'ps5' } } as Record<string, unknown>;
    delete v4.visited;
    delete v4.markers;
    delete v4.goals;
    delete v4.activity;
    const m = migrate(v4)!;
    expect(m.schemaVersion).toBe(5);
    expect(m.favorites).toEqual(['a']);
    expect(m.routes[0].stops[0].visited).toBe(true);
    expect(m.garage).toEqual(['v']);
    expect(m.profile).toEqual({ name: 'Lu', avatar: 'ola', platform: 'ps5', accent: 'magenta' });
    expect([m.visited, m.markers, m.goals, m.activity]).toEqual([[], [], [], []]);
  });

  it('v5: valida marcadores (coordenadas 0–1), objetivos y actividad; rechaza valores inventados', () => {
    const ok = { ...emptyProgress(), visited: ['lug-vice-city'], markers: [{ id: 'mk-1', name: 'Mi spot', note: 'nota', x: 0.5, y: 0.25, icon: 'estrella', createdAt: 't', updatedAt: 't' }], goals: [{ id: 'g1', text: 'Ver todo', done: true, createdAt: 't', doneAt: 't' }], activity: [{ type: 'visitado', ref: 'lug-vice-city', at: 't' }] };
    expect(migrate(ok)?.markers[0].x).toBe(0.5);
    expect(migrate({ ...ok, markers: [{ ...ok.markers[0], x: 1.5 }] })).toBeNull();
    expect(migrate({ ...ok, markers: [{ ...ok.markers[0], icon: 'nivel' }] })).toBeNull();
    expect(migrate({ ...ok, activity: [{ type: 'experiencia', ref: 'x', at: 't' }] })).toBeNull();
    expect(migrate({ ...ok, profile: { ...ok.profile, accent: 'oro' } })).toBeNull();
    const res = parseImport(JSON.stringify(makeExport(ok as unknown as Parameters<typeof makeExport>[0])), new Set());
    expect(res.ok && res.unknownIds).toEqual(['lug-vice-city']);
  });

  it('al cargar una versión anterior guarda un respaldo; si no se puede leer, conserva una copia', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, favorites: ['a'] }));
    expect(loadProgress().favorites).toEqual(['a']);
    expect(JSON.parse(localStorage.getItem(BACKUP_KEY)!).version).toBe(1);
    localStorage.setItem(STORAGE_KEY, '{roto');
    expect(loadProgress().favorites).toEqual([]);
    expect(localStorage.getItem(CORRUPT_KEY)).toBe('{roto');
  });

  it('al combinar v5 une visitados y marcadores y ordena la actividad', () => {
    const a = { ...emptyProgress(), visited: ['x'], activity: [{ type: 'visitado' as const, ref: 'x', at: '2026-11-20' }] };
    const b = { ...emptyProgress(), visited: ['y'], markers: [{ id: 'm', name: 'M', note: '', x: 0.1, y: 0.1, icon: 'bandera' as const, createdAt: 't', updatedAt: 't' }], activity: [{ type: 'marcador' as const, ref: 'm', at: '2026-11-21' }] };
    const m = mergeProgress(a, b);
    expect(m.visited.sort()).toEqual(['x', 'y']);
    expect(m.markers).toHaveLength(1);
    expect(m.activity.map((e) => e.ref)).toEqual(['m', 'x']);
  });
});
