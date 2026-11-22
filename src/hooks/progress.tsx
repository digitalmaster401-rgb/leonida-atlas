import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadProgress, saveProgress, STORAGE_KEY, type Progress, migrate } from '../lib/storage';

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
      toggleCompleted: (id) => update((p) => ({ ...p, completed: toggle(p.completed, id) })),
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
