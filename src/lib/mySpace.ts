// Mi espacio (Fase 4B): métricas y logros calculados SOLO del progreso guardado en este dispositivo.
// No hay niveles, experiencia ni distancias: esos datos no existen. Los logros son metas internas de LEONIDA ATLAS,
// no trofeos oficiales de PlayStation o Xbox.
import type { Progress } from './storage';

interface EntryLike {
  id: string;
  category: string;
  subzone?: unknown;
  tracking?: unknown;
}

export interface MySpaceStats {
  routes: number;
  routesDone: number;
  collectiblesFound: number;
  collectiblesTotal: number;
  vehiclesFav: number;
  regionsVisited: number;
  regionsTotal: number;
  placesVisited: number;
  placesTotal: number;
  markers: number;
  goalsDone: number;
  goalsTotal: number;
  /** Fichas seguibles marcadas en Atlas / total seguible (no es el porcentaje oficial del juego). */
  atlasDone: number;
  atlasTotal: number;
  atlasPct: number;
}

export function mySpaceStats(p: Progress, list: EntryLike[]): MySpaceStats {
  const known = new Map(list.map((e) => [e.id, e]));
  const done = new Set(p.completed.filter((id) => known.has(id)));
  const visited = new Set(p.visited.filter((id) => known.get(id)?.category === 'lugares'));
  const collectibles = list.filter((e) => e.category === 'coleccionables');
  const places = list.filter((e) => e.category === 'lugares');
  const regions = places.filter((e) => !e.subzone);
  const tracked = list.filter((e) => e.category !== 'personajes' && e.category !== 'lugares' && !e.tracking);
  const vehicles = new Set([...p.favorites, ...p.garage].filter((id) => known.get(id)?.category === 'vehiculos'));
  const atlasDone = tracked.filter((e) => done.has(e.id)).length;
  return {
    routes: p.routes.length,
    routesDone: p.routes.filter((r) => r.stops.length > 0 && r.stops.every((s) => s.visited)).length,
    collectiblesFound: collectibles.filter((e) => done.has(e.id)).length,
    collectiblesTotal: collectibles.length,
    vehiclesFav: vehicles.size,
    regionsVisited: regions.filter((e) => visited.has(e.id)).length,
    regionsTotal: regions.length,
    placesVisited: visited.size,
    placesTotal: places.length,
    markers: p.markers.length,
    goalsDone: p.goals.filter((g) => g.done).length,
    goalsTotal: p.goals.length,
    atlasDone,
    atlasTotal: tracked.length,
    atlasPct: tracked.length ? Math.round((atlasDone / tracked.length) * 100) : 0,
  };
}

export interface AtlasAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: number;
  goal: number;
  done: boolean;
}

/** Metas internas de Atlas. El objetivo de cada una se limita a lo que existe en los datos (p. ej. regiones reales). */
export function atlasAchievements(s: MySpaceStats): AtlasAchievement[] {
  const defs: Omit<AtlasAchievement, 'done'>[] = [
    { id: 'primer-hallazgo', title: 'Primer hallazgo', description: 'Marca tu primera ficha como encontrada o completada.', icon: 'check', value: s.atlasDone + s.collectiblesFound, goal: 1 },
    { id: 'coleccionista', title: 'Coleccionista', description: 'Encuentra 10 coleccionables registrados en Atlas.', icon: 'grid', value: s.collectiblesFound, goal: Math.min(10, s.collectiblesTotal) },
    { id: 'trotamundos', title: 'Trotamundos', description: 'Visita todas las regiones oficiales de Leonida.', icon: 'pin', value: s.regionsVisited, goal: s.regionsTotal },
    { id: 'cartografo', title: 'Cartógrafo', description: 'Guarda tu primera ruta personal.', icon: 'route', value: s.routes, goal: 1 },
    { id: 'ruta-completa', title: 'Ruta completa', description: 'Visita todas las paradas de una ruta.', icon: 'flag', value: s.routesDone, goal: 1 },
    { id: 'garaje', title: 'Garaje en marcha', description: 'Guarda 3 vehículos en favoritos o en tu garaje.', icon: 'car', value: s.vehiclesFav, goal: 3 },
    { id: 'explorador', title: 'Explorador personal', description: 'Crea 3 marcadores personales en el mapa.', icon: 'star', value: s.markers, goal: 3 },
    { id: 'constancia', title: 'Constancia', description: 'Completa 5 objetivos personales.', icon: 'target', value: s.goalsDone, goal: 5 },
  ];
  return defs.filter((d) => d.goal > 0).map((d) => ({ ...d, value: Math.min(d.value, d.goal), done: d.value >= d.goal }));
}

/** «hace 5 min», «hace 2 h», «ayer»… en español de México. */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = (Date.parse(iso) - now) / 1000;
  if (!Number.isFinite(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
}
