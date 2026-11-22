// Preferencias del mapa por dispositivo (capas, precisión, póster, agrupación). Validación manual.
import { CATEGORIES, PRECISIONS, type Category } from '../data/schema';
import type { PosterId } from './mapgeo';

export const MAP_PREFS_KEY = 'leonida-atlas:map-prefs';
export interface MapPrefs {
  /** null = todas las categorías con puntos */
  cats: Category[] | null;
  precisions: (typeof PRECISIONS)[number][] | null;
  poster: PosterId;
  cluster: boolean;
}
export const DEFAULT_MAP_PREFS: MapPrefs = { cats: null, precisions: null, poster: 'v2', cluster: true };

export function parseMapPrefs(raw: unknown): MapPrefs {
  const d = { ...DEFAULT_MAP_PREFS };
  if (typeof raw !== 'object' || raw === null) return d;
  const o = raw as Record<string, unknown>;
  const list = <T extends string>(v: unknown, allowed: readonly T[]): T[] | null =>
    Array.isArray(v) && v.every((x) => (allowed as readonly unknown[]).includes(x)) ? [...new Set(v as T[])] : null;
  return {
    cats: o.cats === null ? null : (list(o.cats, CATEGORIES) ?? d.cats),
    precisions: o.precisions === null ? null : (list(o.precisions, PRECISIONS) ?? d.precisions),
    poster: o.poster === 'v1' ? 'v1' : 'v2',
    cluster: typeof o.cluster === 'boolean' ? o.cluster : d.cluster,
  };
}

export function loadMapPrefs(): MapPrefs {
  try {
    const raw = localStorage.getItem(MAP_PREFS_KEY);
    return raw ? parseMapPrefs(JSON.parse(raw)) : { ...DEFAULT_MAP_PREFS };
  } catch {
    return { ...DEFAULT_MAP_PREFS };
  }
}

export function saveMapPrefs(p: MapPrefs): void {
  try {
    localStorage.setItem(MAP_PREFS_KEY, JSON.stringify(p));
  } catch {
    /* sin almacenamiento: las preferencias duran solo esta visita */
  }
}
