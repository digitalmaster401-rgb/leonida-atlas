// Lector RSS 2.0 / Atom mínimo y sin dependencias. Trata todo el contenido como texto (nunca HTML).

export interface FeedItem {
  title: string;
  link: string;
  publishedAt: string | null;
  summary: string;
  id: string | null;
  /** Clave de deduplicación explícita (p. ej. noticias de una página oficial sin URL propia). */
  dedupHint?: string;
  /** Grupo de independencia propio del elemento (p. ej. canal de YouTube) cuando la fuente agrega varios autores. */
  groupHint?: string;
  publisherHint?: string;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeCode(Number(d)))
    .replace(/&([a-z#0-9]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
function safeCode(n: number): string {
  return n > 0 && n < 0x110000 && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : '';
}

/** Quita etiquetas, scripts y espacios: el resultado es texto plano seguro. */
export function stripHtml(s: string): string {
  return decodeEntities(
    s
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/<[^>]+>/g, ' ') // etiquetas que venían escapadas dentro del CDATA
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : null;
}
function attr(block: string, name: string, a: string): string | null {
  const m = block.match(new RegExp(`<${name}\\b[^>]*\\b${a}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1]) : null;
}
function toIso(s: string | null): string | null {
  if (!s) return null;
  const t = Date.parse(stripHtml(s));
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export function parseFeed(xml: string, maxItems = 50): FeedItem[] {
  if (xml.length > 5_000_000) throw new Error('Feed demasiado grande');
  const items: FeedItem[] = [];
  const rss = xml.match(/<item\b[\s\S]*?<\/item>/gi);
  if (rss) {
    for (const b of rss.slice(0, maxItems)) {
      const link = stripHtml(tag(b, 'link') ?? '') || attr(b, 'link', 'href') || '';
      items.push({
        title: stripHtml(tag(b, 'title') ?? ''),
        link,
        publishedAt: toIso(tag(b, 'pubDate') ?? tag(b, 'dc:date')),
        summary: stripHtml(tag(b, 'description') ?? tag(b, 'content:encoded') ?? '').slice(0, 1500),
        id: stripHtml(tag(b, 'guid') ?? '') || null,
      });
    }
    return items.filter((i) => i.title && /^https?:\/\//.test(i.link));
  }
  const entries = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  for (const b of entries.slice(0, maxItems)) {
    const link = attr(b, 'link', 'href') ?? stripHtml(tag(b, 'link') ?? '');
    items.push({
      title: stripHtml(tag(b, 'title') ?? ''),
      link,
      publishedAt: toIso(tag(b, 'published') ?? tag(b, 'updated')),
      summary: stripHtml(tag(b, 'media:description') ?? tag(b, 'summary') ?? tag(b, 'content') ?? '').slice(0, 1500),
      id: stripHtml(tag(b, 'yt:videoId') ?? tag(b, 'id') ?? '') || null,
    });
  }
  return items.filter((i) => i.title && /^https?:\/\//.test(i.link));
}
