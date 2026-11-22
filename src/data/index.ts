import rawEntries from '../../content/entries.json';
import rawSources from '../../content/sources.json';
import rawChangelog from '../../content/changelog.json';
import rawManifest from '../../public/media/media-manifest.json';
import type { Category, Changelog, Entry, MediaItem, Source } from './schema';
import { CATEGORY_META } from './meta';

export const OVERRIDE_KEY = 'leonida-atlas:content-override';

// El contenido publicado se valida con Zod en las pruebas y antes de cada build
// (npm run validate:data). En el navegador se usa tal cual para no cargar el validador.
export const sources = rawSources as Source[];
export const changelog = rawChangelog as Changelog;
export const media = (rawManifest as unknown as { items: MediaItem[] }).items;
export const mediaById = new Map(media.map((m) => [m.id, m]));
export const sourceById = new Map(sources.map((s) => [s.id, s]));
export const MAP_MEDIA_ID = 'mapa-oficial-leonida';

function loadEntries(): { entries: Entry[]; override: boolean } {
  const base = rawEntries as Entry[];
  try {
    // La vista previa del editor solo se guarda tras validarse por completo en /editor.
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(OVERRIDE_KEY) : null;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length && parsed.every((e) => e && typeof e.id === 'string' && typeof e.slug === 'string' && typeof e.category === 'string'))
        return { entries: parsed as Entry[], override: true };
    }
  } catch {
    /* almacenamiento no disponible o JSON corrupto: se usa el contenido publicado */
  }
  return { entries: base, override: false };
}

const loaded = loadEntries();
export const entries: Entry[] = loaded.entries;
export const usingOverride = loaded.override;
export const baseEntries = rawEntries as unknown;

export const entryById = new Map(entries.map((e) => [e.id, e]));
const byRoute = new Map(entries.map((e) => [`${e.category}/${e.slug}`, e]));

export function getEntry(category: string, slug: string): Entry | undefined {
  return byRoute.get(`${category}/${slug}`);
}
export function entryPath(e: Pick<Entry, 'category' | 'slug'>): string {
  return `${CATEGORY_META[e.category].path}/${e.slug}`;
}
export function entriesBy(category: Category): Entry[] {
  return entries.filter((e) => e.category === category);
}
export function imageOf(id: string | undefined): MediaItem | undefined {
  return id ? mediaById.get(id) : undefined;
}
export function chaptersOf(list: Entry[]): string[] {
  return [...new Set(list.map((e) => e.chapter).filter((c): c is string => !!c))].sort();
}
