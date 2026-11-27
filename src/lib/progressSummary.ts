// Resumen de progreso para la portada (Fase 4A.2). Solo cuenta datos guardados de verdad en el progreso local;
// no calcula niveles, experiencia ni distancias porque esos datos no existen.
import type { Progress } from './storage';

interface EntryLike {
  id: string;
  category: string;
}

export interface ProgressSummary {
  collectiblesFound: number;
  collectiblesTotal: number;
  collectiblesPct: number;
  completed: number;
  routes: number;
  stopsVisited: number;
  stopsTotal: number;
  garage: number;
  favorites: number;
  hasAny: boolean;
}

export function progressSummary(p: Progress, list: EntryLike[]): ProgressSummary {
  const known = new Set(list.map((e) => e.id));
  const collectibles = list.filter((e) => e.category === 'coleccionables');
  const done = new Set(p.completed.filter((id) => known.has(id)));
  const collectiblesFound = collectibles.filter((e) => done.has(e.id)).length;
  const stops = p.routes.flatMap((r) => r.stops);
  const garage = p.garage.filter((id) => known.has(id)).length;
  const favorites = p.favorites.filter((id) => known.has(id)).length;
  const s = {
    collectiblesFound,
    collectiblesTotal: collectibles.length,
    collectiblesPct: collectibles.length ? Math.round((collectiblesFound / collectibles.length) * 100) : 0,
    completed: done.size,
    routes: p.routes.length,
    stopsVisited: stops.filter((x) => x.visited).length,
    stopsTotal: stops.length,
    garage,
    favorites,
  };
  return { ...s, hasAny: s.completed + s.routes + s.garage + s.favorites > 0 };
}
