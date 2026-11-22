import { beforeEach, describe, expect, it } from 'vitest';
import { BACKUP_KEY, backupCurrent, emptyProgress, loadProgress, makeExport, mergeProgress, migrate, parseImport, restoreBackup, saveProgress, STORAGE_KEY } from '../src/lib/storage';

const known = new Set(['din-moses', 'arm-duke-556']);

describe('almacenamiento del progreso', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve progreso vacío sin datos o con datos corruptos', () => {
    expect(loadProgress().favorites).toEqual([]);
    localStorage.setItem(STORAGE_KEY, '{no json');
    expect(loadProgress().schemaVersion).toBe(2);
  });

  it('guarda y restaura', () => {
    const p = { ...emptyProgress(), favorites: ['din-moses'] };
    expect(saveProgress(p)).toBe(true);
    expect(loadProgress().favorites).toEqual(['din-moses']);
  });

  it('migra el esquema v1 a v2', () => {
    const m = migrate({ version: 1, favorites: ['a', 'a'], completed: [], notes: { a: 'hola', b: '  ' } });
    expect(m?.schemaVersion).toBe(2);
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
});
