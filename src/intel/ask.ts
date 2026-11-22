// «Pregúntale a ATLAS»: responde solo con fichas y hallazgos registrados, citando fuente, fecha,
// versión y certeza. Se ejecuta en el navegador sin IA ni claves.
import type { Entry } from '../data/schema';
import type { Finding, Platform, RunReport } from './schema';
import { STATUS_LABEL } from './status';
import { search, tokenize } from '../lib/search';

export interface AskCitation {
  label: string;
  url: string;
  internal: boolean;
  status: string;
  date: string | null;
}
export interface AskAnswer {
  answer: string;
  certainty: 'alta' | 'media' | 'baja' | 'ninguna';
  citations: AskCitation[];
  lastRun: string;
}

const PLATFORM_WORDS: [Platform[], RegExp][] = [
  [['ps5_pro'], /ps5 pro|playstation 5 pro/i],
  [['ps5'], /\bps5\b|playstation/i],
  [['xbox_series_x', 'xbox_series_s'], /xbox|series x|series s/i],
];
export const PLATFORM_LABEL: Record<Platform, string> = { ps5: 'PS5', ps5_pro: 'PS5 Pro', xbox_series_x: 'Xbox Series X', xbox_series_s: 'Xbox Series S' };

export function detectAskPlatforms(q: string): Platform[] {
  for (const [p, re] of PLATFORM_WORDS) if (re.test(q)) return p;
  return [];
}

const STOP = new Set(['donde', 'esta', 'estan', 'que', 'cual', 'cuales', 'como', 'cuanto', 'cuanta', 'el', 'la', 'los', 'las', 'de', 'del', 'en', 'un', 'una', 'hay', 'es', 'se', 'por', 'para', 'con', 'mi', 'y', 'o', 'a', 'al', 'puedo', 'paga', 'consigo', 'encuentro']);
const VALIDITY = /\b(funciona|sirve|todav[ií]a|sigue|hoy|vigente|parchead[oa]|works?|still)\b/i;

function scoreFinding(f: Finding, tokens: string[]): number {
  const hay = tokenize(`${f.title} ${f.summary} ${f.tags.join(' ')} ${f.category}`);
  let s = 0;
  for (const t of tokens) if (t.length > 2 && hay.some((h) => h.startsWith(t) || t.startsWith(h))) s++;
  return s;
}

function lastRunText(runs: RunReport[]): string {
  const r = [...runs].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  if (!r) return 'ATLAS INTELLIGENCE todavía no registra ninguna investigación ejecutada.';
  const how = r.trigger === 'schedule' ? 'programada (GitHub Actions)' : r.trigger === 'workflow_dispatch' ? 'manual (GitHub Actions)' : r.trigger === 'manual_local' ? 'manual local' : r.trigger;
  return `Última investigación real: ${r.finishedAt.slice(0, 16).replace('T', ' ')} UTC (${how}).`;
}

export function ask(question: string, entries: Entry[], findings: Finding[], runs: RunReport[], entryPath: (e: Entry) => string): AskAnswer {
  const q = question.trim().slice(0, 300);
  const lastRun = lastRunText(runs);
  if (q.length < 3) return { answer: 'Escribe una pregunta sobre GTA VI.', certainty: 'ninguna', citations: [], lastRun };
  const tokens = tokenize(q);
  const plats = detectAskPlatforms(q);
  const isValidity = VALIDITY.test(q) && /\b(glitch|truco|m[eé]todo|dinero|bug|exploit|duplica)/i.test(q);
  const relevantFindings = findings
    .filter((f) => !plats.length || !f.platforms.length || f.platforms.some((p) => plats.includes(p)))
    .map((f) => ({ f, s: scoreFinding(f, tokens) + (isValidity && (f.category === 'glitch' || f.category === 'dinero') ? 1 : 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.f);

  if (isValidity) {
    const proven = relevantFindings.filter((f) =>
      (plats.length ? plats : (Object.keys(f.platformStatus) as Platform[])).some((p) => f.platformStatus[p] === 'comprobado_en_version'),
    );
    const platText = plats.length ? plats.map((p) => PLATFORM_LABEL[p]).join(' / ') : 'ninguna plataforma';
    if (!proven.length) {
      const reported = relevantFindings.slice(0, 3);
      return {
        answer:
          `No puedo confirmarlo: no hay ninguna prueba en juego registrada en ${platText} para la versión actual. ` +
          (reported.length
            ? `Esto es lo que está reportado (sin confirmar): ${reported.map((f) => `«${f.title}» (${STATUS_LABEL[f.status]})`).join('; ')}.`
            : 'Tampoco hay métodos reportados que coincidan con tu pregunta.'),
        certainty: 'ninguna',
        citations: reported.flatMap((f) => f.sources.slice(0, 2).map((s) => ({ label: `${s.publisher}: ${s.title}`, url: s.url, internal: false, status: STATUS_LABEL[f.status], date: s.publishedAt }))),
        lastRun,
      };
    }
    const f = proven[0];
    const ev = f.evidence.filter((e) => e.result === 'funciona' && e.testedAt).sort((a, b) => b.testedAt!.localeCompare(a.testedAt!))[0];
    return {
      answer: `«${f.title}» se comprobó el ${ev?.testedAt?.slice(0, 10)} en ${ev?.platform ? PLATFORM_LABEL[ev.platform] : '—'} (versión ${ev?.gameVersion ?? '—'}). Eso no garantiza que funcione hoy si hubo un parche después.`,
      certainty: 'media',
      citations: f.evidence.filter((e) => e.url).map((e) => ({ label: `Evidencia (${e.type})`, url: e.url!, internal: false, status: STATUS_LABEL[f.status], date: e.testedAt })),
      lastRun,
    };
  }

  const cleaned = tokens.filter((t) => !STOP.has(t)).join(' ');
  const hits = (cleaned ? search(entries, cleaned) : []).slice(0, 3).map((h) => h.entry);
  if (!hits.length && !relevantFindings.length) {
    return { answer: 'No tengo datos respaldados sobre eso todavía. Si conoces una fuente, envíala en «Enviar hallazgo» para que entre a revisión.', certainty: 'ninguna', citations: [], lastRun };
  }
  const parts: string[] = [];
  const citations: AskCitation[] = [];
  for (const e of hits) {
    parts.push(`${e.name}: ${e.summary} (${e.status}, revisado el ${e.verifiedAt}).`);
    citations.push({ label: `Ficha: ${e.name}`, url: entryPath(e), internal: true, status: e.status, date: e.verifiedAt });
  }
  for (const f of relevantFindings.slice(0, hits.length ? 2 : 4)) {
    const s = f.sources[0];
    parts.push(`Hallazgo ${STATUS_LABEL[f.status].toLowerCase()}: «${f.title}» (${s.publisher}${s.publishedAt ? `, ${s.publishedAt.slice(0, 10)}` : ''}).`);
    citations.push({ label: `${s.publisher}: ${s.title}`, url: s.url, internal: false, status: STATUS_LABEL[f.status], date: s.publishedAt });
  }
  const top = hits[0];
  const certainty = top && (top.status === 'oficial' || top.status === 'comprobado') ? 'alta' : top && top.status === 'contrastado' ? 'media' : 'baja';
  return { answer: parts.join(' '), certainty, citations, lastRun };
}
