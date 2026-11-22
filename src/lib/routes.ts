// Lógica pura de las rutas personales: solo ordena fichas documentadas; no calcula distancias ni caminos.
import { MAX_STOPS, type PersonalRoute } from './storage';

export function newRoute(name = ''): PersonalRoute {
  return { id: `ruta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name, objective: '', stops: [], updatedAt: new Date().toISOString() };
}

export function addStop(r: PersonalRoute, entryId: string): PersonalRoute {
  if (r.stops.length >= MAX_STOPS) return r;
  return { ...r, stops: [...r.stops, { entryId, note: '', visited: false }] };
}

export function removeStop(r: PersonalRoute, i: number): PersonalRoute {
  return { ...r, stops: r.stops.filter((_, j) => j !== i) };
}

export function moveStop(r: PersonalRoute, i: number, delta: -1 | 1): PersonalRoute {
  const j = i + delta;
  if (j < 0 || j >= r.stops.length) return r;
  const stops = [...r.stops];
  [stops[i], stops[j]] = [stops[j], stops[i]];
  return { ...r, stops };
}

export function routeProgress(r: PersonalRoute): { visited: number; pct: number } {
  const visited = r.stops.filter((s) => s.visited).length;
  return { visited, pct: r.stops.length ? Math.round((visited / r.stops.length) * 100) : 0 };
}
