// Motor: integra elementos descubiertos en hallazgos (crosscheck), aplica parches (version-watch)
// y registra cada cambio para la propuesta de revisión.
import type { Finding, FindingStatus, IntelSource, Patch, Platform, ReviewProposal, SourceRef } from './schema';
import { PLATFORMS } from './schema';
import type { FeedItem } from './feeds';
import type { Extraction } from './classify';
import { canonicalUrl, contentHash, dedupKey, originId, slugify, titleSimilarity } from './normalize';
import { REVALIDATABLE, STATUS_RANK, addHistory, independentCount, overallStatus, setPlatformStatus, statusFromEvidence, statusFromSources } from './status';
import { tagsFor } from './heuristics';

export interface Change {
  findingId: string;
  kind: 'nuevo' | 'fuente_agregada' | 'estado' | 'revalidacion';
  before: string | null;
  after: string | null;
  sensitive: boolean;
  reason: string;
  sources: string[];
}

const LOCKED: FindingStatus[] = ['comprobado_en_version', 'parcheado', 'refutado', 'pendiente_revalidacion'];

export function buildSourceRef(item: FeedItem, src: IntelSource, accessedAt: string): SourceRef {
  return {
    url: item.link,
    canonicalUrl: canonicalUrl(item.link),
    sourceId: src.id,
    publisher: item.publisherHint ? `${item.publisherHint} (vía ${src.name})` : src.name,
    title: item.title.slice(0, 300),
    publishedAt: item.publishedAt,
    accessedAt,
    tier: src.tier,
    independenceGroup: item.groupHint ?? src.independenceGroup,
    originId: originId(item.link),
    contentHash: contentHash(item.title, item.summary),
  };
}

function sourceStatus(f: Pick<Finding, 'sources' | 'claims' | 'category' | 'flags'>): FindingStatus {
  const concrete = f.claims.length > 0 || !['noticia', 'otro', 'parche'].includes(f.category);
  let st = statusFromSources(f.sources, concrete);
  // Promesas extraordinarias (p. ej. «dinero infinito») nunca pasan de «reportado» sin prueba.
  if (f.flags.includes('promesa_extraordinaria') && STATUS_RANK[st] > STATUS_RANK.reportado) st = 'reportado';
  return st;
}

/** Busca un hallazgo existente que represente lo mismo. */
export function findMatch(findings: Finding[], ref: SourceRef, title: string, category: string, hint?: string): Finding | undefined {
  const key = hint ?? dedupKey(ref.url);
  return (
    findings.find((f) => f.dedupKey === key) ??
    (hint ? undefined : findings.find((f) => f.sources.some((s) => s.canonicalUrl === ref.canonicalUrl || (ref.originId && s.originId === ref.originId) || s.contentHash === ref.contentHash))) ??
    findings.find((f) => f.category === category && category !== 'noticia' && titleSimilarity(f.title, title) >= 0.75)
  );
}

export function ingest(
  findings: Finding[],
  item: FeedItem,
  src: IntelSource,
  ex: Extraction,
  runId: string,
  now: string,
): { findings: Finding[]; changes: Change[] } {
  const ref = buildSourceRef(item, src, now);
  const existing = findMatch(findings, ref, item.title, ex.category, item.dedupHint);
  const changes: Change[] = [];
  if (existing) {
    const already = existing.sources.some((s) => s.canonicalUrl === ref.canonicalUrl && (!item.dedupHint || s.contentHash === ref.contentHash || s.title === ref.title));
    let f: Finding = { ...existing, lastSourceCheckedAt: now };
    if (!already) {
      f = { ...f, sources: [...f.sources, ref], claims: [...f.claims, ...ex.claims.filter((c) => !f.claims.some((x) => x.quote === c.quote))] };
      f = addHistory(f, { type: 'fuente_agregada', from: null, to: ref.canonicalUrl, platform: null, reason: `Nueva fuente: ${src.name}`, runId, at: now });
      changes.push({ findingId: f.id, kind: 'fuente_agregada', before: null, after: ref.canonicalUrl, sensitive: false, reason: `${src.name} también lo describe`, sources: [ref.url] });
      if (!LOCKED.includes(f.status)) {
        const next = sourceStatus(f);
        if (next !== f.status) {
          const before = f.status;
          f = { ...f, status: next };
          f = addHistory(f, { type: 'estado', from: before, to: next, platform: null, reason: `Fuentes independientes: ${independentCount(f.sources)}`, runId, at: now });
          changes.push({ findingId: f.id, kind: 'estado', before, after: next, sensitive: next === 'contrastado' && ['glitch', 'dinero', 'truco'].includes(f.category), reason: 'Recuento de fuentes independientes', sources: f.sources.map((s) => s.url) });
        }
      }
    }
    return { findings: findings.map((x) => (x.id === existing.id ? f : x)), changes };
  }
  const idBase = `fnd-${slugify(item.title, 48)}`;
  let id = idBase;
  for (let i = 2; findings.some((f) => f.id === id); i++) id = `${idBase}-${i}`;
  const draft: Finding = {
    id,
    dedupKey: item.dedupHint ?? dedupKey(item.link),
    title: item.title.slice(0, 200),
    summary: ex.summaryEs || '',
    category: ex.category,
    tags: tagsFor(item.title),
    mode: ex.mode,
    platforms: ex.platforms,
    gameVersion: ex.gameVersion,
    status: 'nuevo_sin_verificar',
    platformStatus: {},
    firstDiscoveredAt: now,
    sourcePublishedAt: item.publishedAt,
    lastSourceCheckedAt: now,
    lastInGameTestAt: null,
    lastValidatedAt: null,
    nextCheckAt: null,
    claims: ex.claims,
    requirements: ex.requirements,
    steps: ex.steps,
    entryIds: [],
    risks: ex.flags.includes('promesa_extraordinaria') ? ['Promete ganancias extraordinarias: tratar como afirmación sin prueba.'] : [],
    sources: [ref],
    evidence: [],
    history: [{ at: now, type: 'creado', from: null, to: null, platform: null, reason: `Descubierto en ${src.name}`, runId }],
    classifier: ex.classifier,
    flags: src.tier === 'oficial' ? [...ex.flags, 'fuente_oficial'] : ex.flags,
    rights: 'Solo titular, enlace y resumen propio; el contenido pertenece a la fuente.',
  };
  const st = sourceStatus(draft);
  const f: Finding = { ...draft, status: st, nextCheckAt: REVALIDATABLE.has(draft.category) ? addDays(now, 7) : null };
  changes.push({ findingId: id, kind: 'nuevo', before: null, after: st, sensitive: ['glitch', 'truco'].includes(f.category) || f.claims.some((c) => c.amount !== null), reason: `Nuevo hallazgo de ${src.name}`, sources: [ref.url] });
  return { findings: [...findings, f], changes };
}

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * 86400000).toISOString();
}

/**
 * Version-watch: un parche NO prueba que algo esté parcheado. Los hallazgos revalidables afectados pasan a
 * «pendiente_revalidacion» (por plataforma), sin borrar historial ni evidencias.
 */
export function applyPatch(findings: Finding[], patch: Patch, runId: string, now: string): { findings: Finding[]; changes: Change[] } {
  const changes: Change[] = [];
  const affectsAll = patch.affects.length === 0;
  const out = findings.map((f) => {
    if (!REVALIDATABLE.has(f.category)) return f;
    if (Date.parse(f.firstDiscoveredAt) > Date.parse(patch.publishedAt) && !f.evidence.length) return f; // descubierto después del parche
    if (!affectsAll && !patch.affects.some((a) => a === f.category || f.tags.includes(a))) return f;
    if (['refutado', 'parcheado', 'nuevo_sin_verificar'].includes(f.status) && !Object.keys(f.platformStatus).length) return f;
    let g = f;
    const plats: Platform[] = f.platforms.length ? f.platforms.filter((p) => patch.platforms.length === 0 || patch.platforms.includes(p)) : [];
    const reason = `Parche ${patch.version ?? patch.title} (${patch.publishedAt.slice(0, 10)}): requiere nueva prueba`;
    if (plats.length) {
      const baseline = sourceStatus(f); // estado por fuentes para plataformas sin evidencia propia
      for (const p of plats) {
        const cur = f.platformStatus[p] ?? baseline;
        if (['comprobado_en_version', 'contrastado', 'reportado'].includes(cur)) g = setPlatformStatus(g, p, 'pendiente_revalidacion', reason, runId, now);
      }
    } else if (['comprobado_en_version', 'contrastado', 'reportado'].includes(g.status)) {
      const before = g.status;
      g = addHistory({ ...g, status: 'pendiente_revalidacion' }, { type: 'revalidacion', from: before, to: 'pendiente_revalidacion', platform: null, reason, runId, at: now });
    }
    if (g !== f) {
      g = { ...g, nextCheckAt: now };
      changes.push({ findingId: f.id, kind: 'revalidacion', before: f.status, after: g.status, sensitive: false, reason, sources: [patch.sourceUrl] });
    }
    return g;
  });
  return { findings: out, changes };
}

/** Recalcula estados por plataforma a partir de evidencias registradas por personas (pruebas, notas oficiales). */
export function reconcileEvidence(f: Finding, latestPatchAt: string | null, runId: string | null, now: string): Finding {
  let g = f;
  const plats = new Set<Platform>([...f.platforms, ...(f.evidence.map((e) => e.platform).filter(Boolean) as Platform[])]);
  for (const p of PLATFORMS) {
    if (!plats.has(p)) continue;
    const st = statusFromEvidence(f.evidence, p, latestPatchAt);
    if (st) g = setPlatformStatus(g, p, st, 'Evidencia registrada', runId, now);
  }
  const tested = f.evidence.filter((e) => e.testedAt).map((e) => e.testedAt!).sort().pop() ?? null;
  return { ...g, lastInGameTestAt: tested, status: overallStatus(g.platformStatus, g.status) };
}

export function latestPatchAt(patches: Patch[]): string | null {
  return patches.map((p) => p.publishedAt).sort().pop() ?? null;
}

export function buildProposal(runId: string, now: string, changes: Change[]): ReviewProposal | null {
  if (!changes.length) return null;
  const sensitive = changes.some((c) => c.sensitive || c.kind === 'estado' || c.kind === 'revalidacion');
  return {
    id: `prop-${runId}`,
    runId,
    createdAt: now,
    title: `ATLAS INTELLIGENCE: ${changes.filter((c) => c.kind === 'nuevo').length} nuevos, ${changes.filter((c) => c.kind !== 'nuevo').length} actualizaciones`,
    requiresHumanReview: true,
    changes,
    risks: [
      'Los hallazgos provienen de titulares y resúmenes de feeds: verifica la fuente antes de convertirlos en fichas públicas.',
      ...(sensitive ? ['Incluye cambios de estado, cifras o glitches/trucos: requieren revisión humana o prueba documentada.'] : []),
    ],
    tests: ['npm run validate:data', 'npx vitest run tests/intel', 'npm run build'],
  };
}

export function proposalMarkdown(p: ReviewProposal, findings: Finding[]): string {
  const byId = new Map(findings.map((f) => [f.id, f]));
  const lines = [
    `# ${p.title}`,
    '',
    `Corrida \`${p.runId}\` · ${p.createdAt}`,
    '',
    '> Propuesta automática para **revisión humana**. Nada de esto se publica como confirmado sin aprobar este PR; los cambios a «comprobado» o «parcheado» exigen evidencia con fecha, plataforma y versión.',
    '',
    '| Hallazgo | Cambio | Antes → después | Sensible | Motivo | Fuentes |',
    '|---|---|---|---|---|---|',
  ];
  for (const c of p.changes) {
    const f = byId.get(c.findingId);
    const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    lines.push(
      `| ${esc(f?.title ?? c.findingId)} | ${c.kind} | ${c.before ?? '—'} → ${c.after ?? '—'} | ${c.sensitive ? '⚠️ sí' : 'no'} | ${esc(c.reason)} | ${c.sources.map((s, i) => `[${i + 1}](${s})`).join(' ')} |`,
    );
  }
  lines.push('', '## Riesgos', ...p.risks.map((r) => `- ${r}`), '', '## Pruebas ejecutadas por el workflow', ...p.tests.map((t) => `- \`${t}\``), '');
  return lines.join('\n');
}
