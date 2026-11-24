// Reglas de estado editorial. Ninguna transición «sube» a comprobado o parcheado sin evidencia.
import type { Evidence, Finding, FindingStatus, HistoryEvent, Platform, SourceRef } from './schema';

/** Orden de certeza para elegir el estado global más conservador. */
export const STATUS_RANK: Record<FindingStatus, number> = {
  refutado: 0,
  nuevo_sin_verificar: 1,
  pendiente_revalidacion: 2,
  reportado: 3,
  anuncio_oficial: 4,
  contrastado: 4,
  parcheado: 5,
  comprobado_en_version: 6,
};

export const STATUS_LABEL: Record<FindingStatus, string> = {
  nuevo_sin_verificar: 'Nuevo sin verificar',
  reportado: 'Reportado',
  anuncio_oficial: 'Anuncio oficial',
  contrastado: 'Contrastado',
  comprobado_en_version: 'Comprobado en versión',
  pendiente_revalidacion: 'Pendiente de revalidación',
  parcheado: 'Parcheado (con prueba)',
  refutado: 'Refutado',
};

export const STATUS_HELP: Record<FindingStatus, string> = {
  nuevo_sin_verificar: 'Hallazgo inicial sin ejecución demostrada ni fuente que lo describa con detalle.',
  reportado: 'Una fuente (video, artículo o tutorial) lo describe; falta prueba reproducible.',
  anuncio_oficial: 'Lo publicó Rockstar Games o Take-Two. Es el anuncio oficial, no una prueba en el juego ni dos fuentes independientes.',
  contrastado: 'Dos o más fuentes independientes coinciden; nadie lo ha comprobado aquí.',
  comprobado_en_version: 'Prueba documentada con fecha, plataforma y versión del juego.',
  pendiente_revalidacion: 'Salió un parche posterior o hay dudas: hay que volver a probarlo.',
  parcheado: 'Una prueba posterior o una nota oficial muestran que ya no funciona en esa versión.',
  refutado: 'Hay evidencia de que es falso o nunca funcionó.',
};

/** Categorías cuyo funcionamiento puede cambiar con un parche. */
export const REVALIDATABLE = new Set(['glitch', 'dinero', 'truco', 'arma', 'vehiculo', 'coleccionable', 'mision', 'ropa_joyeria']);

/** Cuenta fuentes independientes: mismo grupo de independencia o mismo contenido de origen cuentan una vez. */
export function independentCount(sources: SourceRef[]): number {
  const groups = new Set<string>();
  const origins = new Set<string>();
  let count = 0;
  for (const s of sources) {
    if (s.tier === 'oficial') continue;
    if (groups.has(s.independenceGroup)) continue;
    if (s.originId && origins.has(s.originId)) continue;
    groups.add(s.independenceGroup);
    if (s.originId) origins.add(s.originId);
    count++;
  }
  return count;
}

/** Estado derivado solo de fuentes (sin pruebas en juego). Nunca devuelve comprobado/parcheado. */
export function statusFromSources(sources: SourceRef[], hasConcreteClaim: boolean): FindingStatus {
  const n = independentCount(sources);
  const official = sources.some((s) => s.tier === 'oficial');
  // «Contrastado» = dos fuentes realmente independientes. La oficial cuenta como una, nunca como dos.
  if (n >= 2 || (official && n >= 1)) return 'contrastado';
  if (official) return 'anuncio_oficial';
  if (n === 1 && hasConcreteClaim) return 'reportado';
  return 'nuevo_sin_verificar';
}

/**
 * Corrige estados que violan la regla de independencia (p. ej. «contrastado» con una sola fuente).
 * Solo baja estados; nunca sube a comprobado/parcheado. Devuelve el estado correcto o null si no cambia.
 */
export function enforceIndependence(f: Pick<Finding, 'status' | 'sources'>, hasConcreteClaim: boolean): FindingStatus | null {
  if (f.status !== 'contrastado') return null;
  const st = statusFromSources(f.sources, hasConcreteClaim);
  return st === 'contrastado' ? null : st;
}

/** Estado por evidencia para una plataforma concreta; null si no hay evidencia aplicable. */
export function statusFromEvidence(evidence: Evidence[], platform: Platform, latestPatchAt: string | null): FindingStatus | null {
  const relevant = evidence
    .filter((e) => e.platform === platform || e.type === 'nota_oficial' || e.type === 'refutacion')
    .filter((e) => e.testedAt || e.type === 'nota_oficial' || e.type === 'refutacion')
    .sort((a, b) => (b.testedAt ?? b.recordedAt).localeCompare(a.testedAt ?? a.recordedAt));
  const last = relevant[0];
  if (!last) return null;
  if (last.type === 'refutacion') return 'refutado';
  const when = last.testedAt ?? last.recordedAt;
  // Prueba anterior al último parche ⇒ revalidar (aunque el artículo que la cita sea nuevo).
  if (latestPatchAt && when < latestPatchAt) return 'pendiente_revalidacion';
  if (last.result === 'funciona' && last.type === 'prueba_en_juego' && last.gameVersion && last.testedAt) return 'comprobado_en_version';
  if (last.result === 'no_funciona' && (last.type === 'nota_oficial' || (last.type === 'prueba_en_juego' && last.gameVersion))) return 'parcheado';
  return null;
}

export function overallStatus(platformStatus: Partial<Record<Platform, FindingStatus>>, fallback: FindingStatus): FindingStatus {
  const vals = Object.values(platformStatus) as FindingStatus[];
  if (!vals.length) return fallback;
  return vals.reduce((a, b) => (STATUS_RANK[b] < STATUS_RANK[a] ? b : a));
}

export function addHistory(f: Finding, ev: Omit<HistoryEvent, 'at'> & { at?: string }): Finding {
  return { ...f, history: [...f.history, { ...ev, at: ev.at ?? new Date().toISOString() }] };
}

/** Cambia el estado de una plataforma registrando historial (nunca sobrescribe en silencio). */
export function setPlatformStatus(f: Finding, platform: Platform, to: FindingStatus, reason: string, runId: string | null, at?: string): Finding {
  const from = f.platformStatus[platform] ?? null;
  if (from === to) return f;
  const ps = { ...f.platformStatus, [platform]: to };
  const next = { ...f, platformStatus: ps, status: overallStatus(ps, f.status) };
  return addHistory(next, { type: 'estado', from, to, platform, reason, runId, at });
}

/** Etiqueta pública prudente: nunca «funciona hoy» sin prueba de hoy en la versión exacta. */
export function worksTodayLabel(f: Finding, platform: Platform, today: string, currentVersion: string | null): string {
  const st = f.platformStatus[platform];
  const ev = f.evidence
    .filter((e) => e.platform === platform && e.type === 'prueba_en_juego' && e.result === 'funciona' && e.testedAt)
    .sort((a, b) => b.testedAt!.localeCompare(a.testedAt!))[0];
  if (st === 'comprobado_en_version' && ev && ev.testedAt!.slice(0, 10) === today && currentVersion && ev.gameVersion === currentVersion)
    return 'Funciona hoy (prueba de hoy en la versión actual)';
  if (st === 'comprobado_en_version' && ev) return `Comprobado el ${ev.testedAt!.slice(0, 10)} en la versión ${ev.gameVersion}; no confirmado hoy`;
  return 'No confirmado';
}
