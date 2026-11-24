// Normalización y deduplicación (URL canónica, ID de contenido de origen, huella del texto).

const TRACKING = /^(utm_|fbclid$|gclid$|igshid$|mc_|ref$|ref_src$|si$|feature$|s$|t$)/i;

/** URL canónica: https, host en minúsculas sin www/m, sin fragmento ni parámetros de rastreo, sin barra final. */
export function canonicalUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return raw.trim();
  }
  u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
  u.hash = '';
  u.pathname = u.pathname.replace(/\/+$/, '') || '/';
  const keep = [...u.searchParams.entries()].filter(([k]) => !TRACKING.test(k));
  // YouTube: solo importa v=
  if (u.hostname === 'youtube.com' && u.pathname === '/watch') {
    const v = u.searchParams.get('v');
    u.search = v ? `?v=${v}` : '';
  } else {
    u.search = '';
    keep.sort(([a], [b]) => a.localeCompare(b)).forEach(([k, v]) => u.searchParams.append(k, v));
  }
  let s = u.toString();
  if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1);
  return s;
}

/** Identificador del contenido original (video) para detectar republicaciones del mismo clip. */
export function originId(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m)\./, '');
  if (host === 'youtube.com') {
    const v = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    return v ? `youtube:${v}` : null;
  }
  if (host === 'youtu.be') {
    const v = u.pathname.slice(1).split('/')[0];
    return v ? `youtube:${v}` : null;
  }
  if (host.endsWith('tiktok.com')) {
    const v = u.pathname.match(/\/video\/(\d{8,})/)?.[1];
    return v ? `tiktok:${v}` : null;
  }
  if (host === 'reddit.com' || host === 'old.reddit.com') {
    const v = u.pathname.match(/\/comments\/([a-z0-9]+)/i)?.[1];
    return v ? `reddit:${v}` : null;
  }
  return null;
}

/** FNV-1a de 64 bits en hex (determinista, sin dependencias, válido en Node y navegador). */
export function fnv64(text: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < text.length; i++) {
    h ^= BigInt(text.charCodeAt(i));
    h = (h * prime) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}

export function normText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9$]+/g, ' ')
    .trim();
}

/** Huella del contenido: detecta el mismo texto republicado en URLs distintas. */
export function contentHash(title: string, summary: string): string {
  return fnv64(normText(`${title} ${summary}`).slice(0, 600));
}

/** Clave de deduplicación de un hallazgo: origen del contenido > URL canónica. */
export function dedupKey(url: string): string {
  return originId(url) ?? `url:${canonicalUrl(url)}`;
}

/** Similitud de títulos (Jaccard de palabras ≥ 3 letras). */
export function titleSimilarity(a: string, b: string): number {
  const wa = new Set(normText(a).split(' ').filter((w) => w.length >= 3));
  const wb = new Set(normText(b).split(' ').filter((w) => w.length >= 3));
  if (!wa.size || !wb.size) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / (wa.size + wb.size - inter);
}

const STOP = new Set(
  'the a an and or of in on to for with how find where get all guide walkthrough complete completing location locations what you your is are it its this that here new just has have after from about why who will can does not no be game games his her he she they their at by as now every should best way ways tips which there'.split(' '),
);
/** Palabras «de tema» de un titular: sin nombre del juego, sin palabras genéricas de guía y con raíz corta. */
export function topicTokens(title: string): string[] {
  const t = normText(title.replace(/grand theft auto (vi|6)|\bgta ?(vi|6)\b/gi, ' '));
  const out = new Set<string>();
  for (const w of t.split(' ')) {
    if (!w || STOP.has(w)) continue;
    if (/^\d+$/.test(w)) out.add(w);
    else if (w.length >= 3) out.add(w.slice(0, 4));
  }
  return [...out];
}
/**
 * Similitud de tema entre dos titulares (0–1). Si ambos citan números distintos (capítulo 3 vs 4,
 * versión 1.002 vs 1.003) devuelve 0: nunca se fusionan.
 */
export function topicSimilarity(a: string, b: string): number {
  const ta = topicTokens(a);
  const tb = topicTokens(b);
  if (!ta.length || !tb.length) return 0;
  const na = ta.filter((w) => /^\d+$/.test(w)).sort().join(',');
  const nb = tb.filter((w) => /^\d+$/.test(w)).sort().join(',');
  if (na && nb && na !== nb) return 0;
  const sb = new Set(tb);
  const inter = ta.filter((w) => sb.has(w)).length;
  // Con una sola palabra en común no basta («New Look» ≠ «How Do I Look?», «Checking Out» ≠ «Out Now»).
  if (inter < 2) return 0;
  return inter / (ta.length + tb.length - inter);
}

/** true si ambos titulares citan números y no son los mismos (capítulo 3 ≠ capítulo 4). */
export function numbersConflict(a: string, b: string): boolean {
  const nums = (s: string) => (normText(s.replace(/grand theft auto (vi|6)|\bgta ?(vi|6)\b/gi, ' ')).match(/\d+/g) ?? []).sort().join(',');
  const na = nums(a);
  const nb = nums(b);
  return !!na && !!nb && na !== nb;
}

export function slugify(s: string, max = 60): string {
  return normText(s).replace(/\s+/g, '-').replace(/\$/g, '').slice(0, max).replace(/-+$/g, '') || 'hallazgo';
}
