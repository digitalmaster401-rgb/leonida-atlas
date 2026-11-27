import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../src/lib/storage';
import { progressSummary } from '../src/lib/progressSummary';

const list = [
  { id: 'c1', category: 'coleccionables' },
  { id: 'c2', category: 'coleccionables' },
  { id: 'c3', category: 'coleccionables' },
  { id: 'c4', category: 'coleccionables' },
  { id: 'v1', category: 'vehiculos' },
];

describe('resumen de progreso de la portada', () => {
  it('progreso vacío: todo en cero y sin actividad', () => {
    const s = progressSummary(emptyProgress(), list);
    expect(s).toMatchObject({ collectiblesFound: 0, collectiblesTotal: 4, collectiblesPct: 0, routes: 0, garage: 0, hasAny: false });
  });
  it('cuenta solo datos reales y descarta ids desconocidos', () => {
    const p = emptyProgress();
    p.completed = ['c1', 'c2', 'v1', 'fantasma'];
    p.garage = ['v1', 'otro'];
    p.favorites = ['c3'];
    p.routes = [{ id: 'r', name: 'R', objective: '', updatedAt: '2026-11-24', stops: [{ entryId: 'c1', note: '', visited: true }, { entryId: 'c2', note: '', visited: false }] }];
    const s = progressSummary(p, list);
    expect(s).toMatchObject({ collectiblesFound: 2, collectiblesPct: 50, completed: 3, routes: 1, stopsVisited: 1, stopsTotal: 2, garage: 1, favorites: 1, hasAny: true });
  });
});
