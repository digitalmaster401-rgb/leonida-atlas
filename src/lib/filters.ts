import type { Entry } from '../data/schema';
import { STATUS_META } from '../data/meta';

export interface Filters {
  region: string;
  category: string;
  chapter: string;
  edition: string;
  status: string;
  spoiler: string; // '' = según preferencia, '0' | '1' | '2'
  sort: string; // 'relevancia' | 'nombre' | 'evidencia' | 'pago' | 'reciente'
}

export const FILTER_KEYS: (keyof Filters)[] = ['region', 'category', 'chapter', 'edition', 'status', 'spoiler', 'sort'];

export function readFilters(params: URLSearchParams): Filters {
  const f = {} as Filters;
  for (const k of FILTER_KEYS) f[k] = params.get(k) ?? '';
  return f;
}

export function applyFilters(list: Entry[], f: Filters): Entry[] {
  // Por defecto se muestran todas; las que superan la preferencia de spoilers salen veladas en la tarjeta.
  const maxSpoiler = f.spoiler === '' ? 2 : Number(f.spoiler);
  const out = list.filter(
    (e) =>
      (!f.region || e.region === f.region) &&
      (!f.category || e.category === f.category) &&
      (!f.chapter || e.chapter === f.chapter) &&
      (!f.edition || e.edition === f.edition) &&
      (!f.status || e.status === f.status) &&
      e.spoilerLevel <= maxSpoiler,
  );
  return sortEntries(out, f.sort);
}

export function sortEntries(list: Entry[], sort: string): Entry[] {
  const arr = [...list];
  switch (sort) {
    case 'nombre':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    case 'evidencia':
      return arr.sort((a, b) => STATUS_META[b.status].rank - STATUS_META[a.status].rank || a.name.localeCompare(b.name, 'es'));
    case 'pago':
      return arr.sort((a, b) => (b.reward?.amount?.max ?? -1) - (a.reward?.amount?.max ?? -1));
    case 'reciente':
      return arr.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt));
    default:
      return arr;
  }
}
