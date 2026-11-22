// Clasificador heurístico (sin IA): relevancia, categoría, plataformas, modo, cifras y parches.
// Solo extrae lo que aparece literalmente en el texto de la fuente.
import type { Claim, FindingCategory, Platform } from './schema';
import { normText } from './normalize';

const GTA6 = /\b(gta ?(6|vi)|grand theft auto (6|vi)|leonida)\b/i;
const OTHER_GAMES = /\b(gta ?(v|5|iv|4)|grand theft auto (v|iv)|red dead|gta online(?! 6))\b/i;

export function isRelevant(title: string, summary: string): boolean {
  const t = `${title} ${summary}`;
  if (!GTA6.test(t)) return false;
  // Si el titular habla de otro GTA y GTA 6 solo aparece de pasada en el resumen, se descarta.
  if (OTHER_GAMES.test(title) && !GTA6.test(title)) return false;
  return true;
}

const CATS: [FindingCategory, RegExp][] = [
  ['parche', /\b(patch|title update|hotfix|update \d|actualizaci[oó]n|parche|notas del parche|patch notes|version \d+\.\d+)\b/i],
  ['glitch', /\b(glitch|exploit|bug|duplicat|dupe|clipping|out of bounds|fallo)\b/i],
  ['truco', /\b(cheat|cheats|truco|trucos|c[oó]digo|button combo|cheat code)\b/i],
  ['dinero', /\b(money|cash|make \$|earn|dinero|robbery|heist|atraco|vault|b[oó]veda|safe|payout|jewel(ry|lery) store)\b/i],
  ['coleccionable', /\b(collectible|collectibles|coleccionable|trading card|cards?|magazine|comic|book|revista|tarjeta|easter egg|100%|treasure)\b/i],
  ['arma', /\b(weapon|weapons|gun|rifle|pistol|shotgun|ammu-?nation|arma|armas)\b/i],
  ['vehiculo', /\b(car|cars|vehicle|vehicles|bike|boat|plane|helicopter|garage|veh[ií]culo|auto|coche|moses)\b/i],
  ['ropa_joyeria', /\b(outfit|clothing|clothes|jewel|watch|tattoo|haircut|ropa|joya|reloj|tatuaje)\b/i],
  // «PS5 Pro» por sí solo no es un ajuste (p. ej. «le regalaron una PS5 Pro»): hace falta una palabra de configuración.
  ['configuracion', /\b(settings|hdr|fps|performance mode|quality mode|resolution|graphics|pssr|ray tracing|configuraci[oó]n|ajustes)\b/i],
  ['mision', /\b(mission|walkthrough|quest|side quest|chapter|misi[oó]n|cap[ií]tulo)\b/i],
  ['personaje', /\(character\)|\b(all characters|characters? guide|character profile|personajes?)\b/i],
  ['ubicacion', /\b(how to find|where to find|where is|locations?|apartment|estate|mansion|safehouse|hideout|ubicaci[oó]n|d[oó]nde (est[aá]|encontrar))\b/i],
];

/** Quita el nombre del juego para que «Grand Theft Auto» no active la categoría de vehículos. */
function stripGameName(s: string): string {
  return s.replace(/grand theft auto( (vi|6|v|iv))?/gi, ' ').replace(/\bgta ?(vi|6|v|5)?\b/gi, ' ');
}

/** Señales de noticia de industria (ventas, ejecutivos, prensa): no son guías del juego. */
const NEWS = /\b(copies sold|sales|revenue|billion|ceo|minister|records?|review|reacts?|reacted|interview|lawsuit|leak|hacker|banned|ban|stock|circana|black friday|discount|cameo|cast)\b/i;

export function classifyCategory(title: string, summary: string): FindingCategory {
  const t = stripGameName(title);
  const sm = stripGameName(summary);
  if (NEWS.test(t) && !/\b(guide|walkthrough|location|how to|where to)\b/i.test(t)) return 'noticia';
  for (const [c, re] of CATS) if (re.test(t)) return c;
  if (/\b(guide|walkthrough|location|how to|where to)\b/i.test(t)) for (const [c, re] of CATS) if (re.test(sm)) return c;
  return 'noticia';
}

export function detectPlatforms(text: string): Platform[] {
  const out = new Set<Platform>();
  if (/series x\s?[|/]\s?s\b|series x and s\b|series x y s\b/i.test(text)) {
    out.add('xbox_series_x');
    out.add('xbox_series_s');
    text = text.replace(/series x\s?[|/]\s?s\b|series x (and|y) s\b/gi, ' ');
  }
  if (/ps5 pro|playstation 5 pro/i.test(text)) out.add('ps5_pro');
  if (/\bps5\b|playstation 5|playstation(?! 4)/i.test(text.replace(/ps5 pro|playstation 5 pro/gi, ''))) out.add('ps5');
  if (/series x(?!\|)|xbox series x\b/i.test(text)) out.add('xbox_series_x');
  if (/series s\b/i.test(text)) out.add('xbox_series_s');
  if (/series x\|s|series x\/s|xbox series(?! [xs]\b)|\bxbox\b(?! one)/i.test(text) && !out.has('xbox_series_x')) {
    out.add('xbox_series_x');
    out.add('xbox_series_s');
  }
  return [...out];
}

export function detectMode(text: string): 'historia' | 'online' | 'sin_confirmar' {
  if (/\bgta (6|vi) online\b|\bonline mode\b|\bmodo online\b/i.test(text)) return 'online';
  if (/\b(story|chapter|mission|walkthrough|cap[ií]tulo|historia|jason|lucia)\b/i.test(text)) return 'historia';
  return 'sin_confirmar';
}

/** Promesas extraordinarias: nunca suben de «reportado» sin prueba. */
export function extraordinaryClaim(text: string): boolean {
  return /\b(infinite|unlimited|endless|infinito|ilimitado|millions? per (hour|minute)|\$\d[\d,.]*\s*(m|million)?\s*(per|an|a|\/)\s*(hour|minute|min|hr))\b/i.test(text);
}

/** Extrae cifras de dinero con su cita literal (fragmento del texto original). */
export function extractMoneyClaims(text: string, sourceUrl: string): Claim[] {
  const out: Claim[] = [];
  const re = /\$\s?(\d{1,3}(?:[,.]\d{3})+|\d+(?:\.\d+)?)\s?(billion|bn|million|mil|k|m)?\b/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(text)) && out.length < 5) {
    const raw = m[1].replace(/[,.](?=\d{3}\b)/g, '');
    let amount = Number(raw);
    const suf = (m[2] ?? '').toLowerCase();
    if (suf === 'k' || suf === 'mil') amount *= 1000;
    if (suf === 'm' || suf === 'million') amount *= 1_000_000;
    if (suf === 'billion' || suf === 'bn') continue; // cifras de ventas/industria, no dinero del juego
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const start = Math.max(0, text.lastIndexOf('.', m.index) + 1);
    const endDot = text.indexOf('.', m.index + m[0].length);
    const end = endDot === -1 ? Math.min(text.length, m.index + 160) : Math.min(endDot + 1, m.index + 200);
    const quote = text.slice(start, end).trim();
    if (seen.has(quote)) continue;
    seen.add(quote);
    out.push({ text: `La fuente menciona ${m[0].trim()}`, quote, sourceUrl, amount, unit: 'USD (dinero del juego)' });
  }
  return out;
}

export interface PatchSignal {
  isPatch: boolean;
  version: string | null;
}
export function detectPatch(title: string, summary: string): PatchSignal {
  const t = `${title} ${summary}`;
  const isPatch = /\b(patch notes|title update|hotfix|notas del parche|actualizaci[oó]n \d|update \d+\.\d+|version \d+\.\d+(\.\d+)?|patch \d+\.\d+)\b/i.test(t) && GTA6.test(t);
  const v = t.match(/\b(?:version|update|patch|v)\s?(\d+\.\d+(?:\.\d+)?)\b/i)?.[1] ?? null;
  return { isPatch, version: v };
}

export function tagsFor(title: string): string[] {
  const words = normText(title).split(' ');
  const keep = ['moses', 'randy', 'yasmani', 'vault', 'jewelry', 'safehouse', 'cheat', 'glitch', 'heist', 'robbery', 'ammu', 'nation', 'collectible', 'chapter', 'ps5', 'xbox', 'patch'];
  return [...new Set(words.filter((w) => keep.includes(w)))];
}

/** Texto relevante limitado (protección de costo y contra inyección: el contenido se trata como datos). */
export function boundedText(title: string, summary: string, max = 1200): string {
  return `${title}\n${summary}`.slice(0, max);
}
