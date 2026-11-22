// Catálogo comparable de vehículos: solo usa datos publicados (registro, venta, rastreador) con su evidencia.
import type { Entry, VehicleData } from '../data/schema';

export type VehicleEntry = Entry & { vehicle: VehicleData };
export const MAX_COMPARE = 3;
export const TRACKER_LABEL: Record<NonNullable<VehicleData['tracker']>, string> = {
  ninguno: 'Ninguno',
  estandar: 'Estándar',
  avanzado: 'Avanzado',
  militar: 'Militar',
};

export function vehicleEntries(list: Entry[]): VehicleEntry[] {
  return list.filter((e): e is VehicleEntry => e.category === 'vehiculos' && !!e.vehicle);
}

export type SortKey = 'nombre' | 'registro' | 'venta';
/** Ordena; los valores no publicados van al final (nunca se tratan como 0). */
export function sortVehicles(list: VehicleEntry[], key: SortKey): VehicleEntry[] {
  const val = (v: VehicleEntry) => (key === 'registro' ? v.vehicle.registration : key === 'venta' ? v.vehicle.sellValue : null);
  return [...list].sort((a, b) => {
    if (key === 'nombre') return a.name.localeCompare(b.name, 'es');
    const x = val(a);
    const y = val(b);
    if (x === null && y === null) return a.name.localeCompare(b.name, 'es');
    if (x === null) return 1;
    if (y === null) return -1;
    return y - x;
  });
}

/** Lee la selección del comparador desde la URL (?v=a,b,c): ids válidos, sin repetir, máximo 3. */
export function parseCompare(param: string | null, valid: Set<string>): string[] {
  if (!param) return [];
  return [...new Set(param.split(',').map((s) => s.trim()))].filter((id) => valid.has(id)).slice(0, MAX_COMPARE);
}

/** Índice del valor más alto entre los comparados (para resaltarlo); null si hay menos de dos valores publicados. */
export function bestIndex(values: (number | null)[]): number | null {
  const known = values.map((v, i) => [v, i] as const).filter(([v]) => v !== null) as [number, number][];
  if (known.length < 2) return null;
  return known.reduce((a, b) => (b[0] > a[0] ? b : a))[1];
}
