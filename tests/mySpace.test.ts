import { describe, expect, it } from 'vitest';
import { emptyProgress } from '../src/lib/storage';
import { atlasAchievements, mySpaceStats, timeAgo } from '../src/lib/mySpace';

const list = [
  { id: 'r1', category: 'lugares' },
  { id: 'r2', category: 'lugares' },
  { id: 'z1', category: 'lugares', subzone: true },
  { id: 'c1', category: 'coleccionables' },
  { id: 'c2', category: 'coleccionables' },
  { id: 'v1', category: 'vehiculos' },
  { id: 'a1', category: 'armas' },
];

describe('Mi espacio: métricas reales', () => {
  it('perfil vacío: todo en cero, sin logros cumplidos', () => {
    const s = mySpaceStats(emptyProgress(), list);
    expect(s).toMatchObject({ routes: 0, collectiblesFound: 0, collectiblesTotal: 2, regionsTotal: 2, placesTotal: 3, atlasPct: 0 });
    expect(atlasAchievements(s).every((a) => !a.done)).toBe(true);
  });
  it('calcula con datos reales e ignora ids desconocidos', () => {
    const p = emptyProgress();
    p.completed = ['c1', 'a1', 'fantasma'];
    p.visited = ['r1', 'r2', 'z1', 'v1'];
    p.garage = ['v1'];
    p.favorites = ['v1', 'otro'];
    p.routes = [{ id: 'x', name: 'X', objective: '', updatedAt: 't', stops: [{ entryId: 'r1', note: '', visited: true }] }];
    const s = mySpaceStats(p, list);
    expect(s).toMatchObject({ collectiblesFound: 1, regionsVisited: 2, placesVisited: 3, vehiclesFav: 1, routes: 1, routesDone: 1, atlasDone: 2, atlasTotal: 4, atlasPct: 50 });
    const a = Object.fromEntries(atlasAchievements(s).map((x) => [x.id, x]));
    expect(a.trotamundos.done).toBe(true);
    expect(a['ruta-completa'].done).toBe(true);
    expect(a.coleccionista).toMatchObject({ value: 1, goal: 2, done: false });
  });
  it('tiempo relativo en español', () => {
    const now = Date.parse('2026-11-27T12:00:00Z');
    expect(timeAgo('2026-11-27T10:00:00Z', now)).toBe('hace 2 horas');
  });
});
