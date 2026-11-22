import type { Entry } from '../data/schema';
import { REGION_LABEL, CATEGORY_META, STATUS_META } from '../data/meta';

/** Normaliza: minúsculas, sin acentos, sin apóstrofos ni puntuación. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`´]/g, '')
    .replace(/[^a-z0-9$.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(s: string): string[] {
  return normalize(s)
    .split(' ')
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t.length > 0);
}

/** Distancia de Levenshtein con corte temprano. */
export function levenshtein(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const SYNONYMS: Record<string, string[]> = {
  carro: ['auto', 'vehiculo'],
  coche: ['auto', 'vehiculo'],
  auto: ['vehiculo', 'carro'],
  vehiculo: ['auto'],
  moto: ['motocicleta'],
  lancha: ['barco', 'bote'],
  barco: ['lancha'],
  pistola: ['arma'],
  rifle: ['arma'],
  arma: ['armas'],
  dinero: ['pago', 'botin', '$'],
  lana: ['dinero'],
  feria: ['dinero'],
  varo: ['dinero'],
  tienda: ['negocio'],
  taller: ['mod', 'customs'],
  mapa: ['ubicacion'],
  gratis: ['gratuita', 'gratuito'],
};

interface Doc {
  entry: Entry;
  fields: { tokens: string[]; weight: number }[];
}

let cache: { list: Entry[]; docs: Doc[] } | null = null;

function buildDocs(list: Entry[]): Doc[] {
  return list.map((entry) => ({
    entry,
    fields: [
      { tokens: tokenize(entry.name), weight: 6 },
      { tokens: tokenize(entry.tags.join(' ') + ' ' + (entry.subzone ?? '')), weight: 3 },
      { tokens: tokenize(REGION_LABEL[entry.region] + ' ' + CATEGORY_META[entry.category].label), weight: 2 },
      { tokens: tokenize(entry.summary), weight: 2 },
      { tokens: tokenize(entry.description + ' ' + entry.howTo.join(' ')), weight: 1 },
      { tokens: tokenize(entry.facts.map((f) => `${f.label} ${f.value}`).join(' ')), weight: 1 },
    ],
  }));
}

function tokenScore(q: string, tokens: string[]): number {
  let best = 0;
  for (const t of tokens) {
    if (t === q) return 1;
    if (t.startsWith(q) && q.length >= 2) best = Math.max(best, 0.85);
    else if (q.length >= 4 && t.includes(q)) best = Math.max(best, 0.6);
    else if (q.length >= 4 && t.length >= 3) {
      const max = q.length >= 7 ? 2 : 1;
      const d = levenshtein(q, t.slice(0, Math.max(q.length, t.length)), max);
      if (d <= max) best = Math.max(best, d === 1 ? 0.55 : 0.4);
    }
  }
  return best;
}

export interface SearchHit {
  entry: Entry;
  score: number;
}

/** Búsqueda tolerante a acentos, variaciones (sinónimos) y errores leves. Todos los términos deben coincidir. */
export function search(list: Entry[], query: string): SearchHit[] {
  const qTokens = tokenize(query).filter((t) => t.length > 1 || /\d/.test(t));
  if (!qTokens.length) return [];
  if (!cache || cache.list !== list) cache = { list, docs: buildDocs(list) };
  const hits: SearchHit[] = [];
  for (const doc of cache.docs) {
    let total = 0;
    let all = true;
    for (const q of qTokens) {
      const variants = [q, ...(SYNONYMS[q] ?? [])];
      let best = 0;
      for (const v of variants) {
        const factor = v === q ? 1 : 0.8;
        for (const f of doc.fields) {
          const s = tokenScore(v, f.tokens) * f.weight * factor;
          if (s > best) best = s;
        }
      }
      if (best === 0) {
        all = false;
        break;
      }
      total += best;
    }
    if (all) hits.push({ entry: doc.entry, score: total + STATUS_META[doc.entry.status].rank * 0.01 });
  }
  return hits.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name, 'es'));
}
