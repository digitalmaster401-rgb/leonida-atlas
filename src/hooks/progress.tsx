import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadProgress, MAX_ROUTES, saveProgress, STORAGE_KEY, type EntryRecord, type Loadout, type PersonalRoute, type Progress, migrate } from '../lib/storage';

interface ProgressApi {
  progress: Progress;
  persisted: boolean;
  isFavorite: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  toggleCompleted: (id: string) => void;
  setNote: (id: string, text: string) => void;
  setSpoilerLevel: (lvl: 0 | 1 | 2) => void;
  replace: (p: Progress) => void;
  /** Marca como encontrado/completado (o lo desmarca) y registra la fecha. */
  setFound: (id: string, found: boolean) => void;
  setRecord: (id: string, patch: Partial<EntryRecord>) => void;
  setCounter: (id: string, n: number) => void;
  toggleToday: (id: string) => void;
  saveLoadout: (l: Loadout) => void;
  deleteLoadout: (id: string) => void;
  setProfile: (patch: Partial<Progress['profile']>) => void;
  setHideFound: (v: boolean) => void;
  saveRoute: (r: PersonalRoute) => void;
  deleteRoute: (id: string) => void;
  toggleGarage: (id: string) => void;
  inGarage: (id: string) => boolean;
}

const today = () => new Date().toISOString().slice(0, 10);
function withRecord(p: Progress, id: string, patch: Partial<EntryRecord>): Progress {
  const rec: EntryRecord = { ...p.records[id], ...patch };
  for (const k of Object.keys(rec) as (keyof EntryRecord)[]) if (rec[k] === undefined) delete rec[k];
  const records = { ...p.records };
  if (Object.keys(rec).length) records[id] = rec;
  else delete records[id];
  return { ...p, records };
}
function withFound(p: Progress, id: string, found: boolean): Progress {
  const completed = found ? [...new Set([...p.completed, id])] : p.completed.filter((x) => x !== id);
  const rec = p.records[id] ?? {};
  return withRecord({ ...p, completed }, id, found ? { state: undefined, date: rec.date ?? today(), platform: rec.platform ?? p.profile.platform ?? undefined } : { date: undefined });
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [persisted, setPersisted] = useState(true);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = { ...fn(prev), updatedAt: new Date().toISOString() };
      setPersisted(saveProgress(next));
      return next;
    });
  }, []);

  // Sincroniza entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const p = migrate(JSON.parse(e.newValue));
        if (p) setProgress(p);
      } catch {
        /* ignora valores corruptos */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const api = useMemo<ProgressApi>(() => {
    const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
    return {
      progress,
      persisted,
      isFavorite: (id) => progress.favorites.includes(id),
      isCompleted: (id) => progress.completed.includes(id),
      toggleFavorite: (id) => update((p) => ({ ...p, favorites: toggle(p.favorites, id) })),
      toggleCompleted: (id) => update((p) => withFound(p, id, !p.completed.includes(id))),
      setFound: (id, found) => update((p) => withFound(p, id, found)),
      setRecord: (id, patch) => update((p) => withRecord(p, id, patch)),
      setCounter: (id, n) => update((p) => ({ ...p, counters: { ...p.counters, [id]: Math.max(0, Math.min(10000, Math.round(n) || 0)) } })),
      toggleToday: (id) => update((p) => ({ ...p, today: toggle(p.today, id) })),
      saveLoadout: (l) =>
        update((p) => {
          const next = { ...l, updatedAt: new Date().toISOString() };
          const i = p.loadouts.findIndex((x) => x.id === l.id);
          const loadouts = i < 0 ? [...p.loadouts, next].slice(-30) : p.loadouts.map((x, j) => (j === i ? next : x));
          return { ...p, loadouts };
        }),
      deleteLoadout: (id) => update((p) => ({ ...p, loadouts: p.loadouts.filter((x) => x.id !== id) })),
      setProfile: (patch) => update((p) => ({ ...p, profile: { ...p.profile, ...patch, name: (patch.name ?? p.profile.name).slice(0, 40) } })),
      setHideFound: (v) => update((p) => ({ ...p, settings: { ...p.settings, hideFound: v } })),
      saveRoute: (r) =>
        update((p) => {
          const next = { ...r, name: r.name.slice(0, 60), objective: r.objective.slice(0, 300), stops: r.stops.slice(0, 40), updatedAt: new Date().toISOString() };
          const i = p.routes.findIndex((x) => x.id === r.id);
          return { ...p, routes: i < 0 ? [...p.routes, next].slice(-MAX_ROUTES) : p.routes.map((x, j) => (j === i ? next : x)) };
        }),
      deleteRoute: (id) => update((p) => ({ ...p, routes: p.routes.filter((x) => x.id !== id) })),
      toggleGarage: (id) => update((p) => ({ ...p, garage: toggle(p.garage, id) })),
      inGarage: (id) => progress.garage.includes(id),
      setNote: (id, text) =>
        update((p) => {
          const notes = { ...p.notes };
          if (text.trim()) notes[id] = { text: text.slice(0, 5000), updatedAt: new Date().toISOString() };
          else delete notes[id];
          return { ...p, notes };
        }),
      setSpoilerLevel: (lvl) => update((p) => ({ ...p, settings: { ...p.settings, spoilerLevel: lvl } })),
      replace: (p) => update(() => p),
    };
  }, [progress, persisted, update]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress fuera de ProgressProvider');
  return v;
}
