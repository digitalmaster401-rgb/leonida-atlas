// Motor: integra elementos descubiertos en hallazgos (crosscheck), aplica parches (version-watch)
// y registra cada cambio para la propuesta de revisión.
import type { Finding, FindingStatus, IntelSource, Patch, Platform, ReviewProposal, SourceRef } from './schema';
import { PLATFORMS } from './schema';
import type { FeedItem } from './feeds';
import type { Extraction } from './classify';
import { canonicalUrl, contentHash, dedupKey, numbersConflict, originId, slugify, titleSimilarity, topicSimilarity } from './normalize';
import { REVALIDATABLE, STATUS_RANK, addHistory, enforceIndependence, independentCount, overallStatus, setPlatformStatus, statusFromEvidence, statusFromSources } from './status';
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
  // Un titular que desmiente («No, el glitch… no funciona») no es un reporte de que funcione.
  if (f.flags.includes('desmentido_en_titular') && STATUS_RANK[st] > STATUS_RANK.nuevo_sin_verificar && st !== 'anuncio_oficial') st = 'nuevo_sin_verificar';
  // Promesas extraordinarias (p. ej. «dinero infinito») nunca pasan de «reportado» sin prueba.
  if (f.flags.includes('promesa_extraordinaria') && STATUS_RANK[st] > STATUS_RANK.reportado) st = 'reportado';
  return st;
}

/** Umbrales de fusión por tema (ver tests/intel/dedup.test.ts con titulares reales). */
export const TOPIC_MATCH = { guide: 0.6, news: 0.5, newsWindowDays: 4 };

const daysApart = (a: string | null | undefined, b: string | null | undefined) =>
  a && b ? Math.abs(Date.parse(a) - Date.parse(b)) / 86400000 : Infinity;

/** Busca un hallazgo existente que represente lo mismo (misma URL/contenido, o el mismo tema en otra fuente). */
export function findMatch(findings: Finding[], ref: SourceRef, title: string, category: string, hint?: string, publishedAt?: string | null): Finding | undefined {
  const key = hint ?? dedupKey(ref.url);
  return (
    findings.find((f) => f.dedupKey === key) ??
    (hint ? undefined : findings.find((f) => f.sources.some((s) => s.canonicalUrl === ref.canonicalUrl || (ref.originId && s.originId === ref.originId) || s.contentHash === ref.contentHash))) ??
    findings.find(
      (f) =>
        f.category === category &&
        category !== 'noticia' &&
        !numbersConflict(f.title, title) &&
        // la similitud de palabras sola contaba «how», «complete»…; ahora siempre se exigen ≥2 palabras de tema en común
        topicSimilarity(f.title, title) > 0 &&
        (titleSimilarity(f.title, title) >= 0.75 || topicSimilarity(f.title, title) >= TOPIC_MATCH.guide),
    ) ??
    // Noticias: la misma historia contada por otro medio en pocos días (p. ej. tres medios sobre la misma broma de un director).
    (hint
      ? undefined
      : findings.find(
          (f) =>
            f.category === 'noticia' &&
            category === 'noticia' &&
            !f.sources.some((s) => s.independenceGroup === ref.independenceGroup) &&
            daysApart(f.sourcePublishedAt, publishedAt ?? ref.publishedAt) <= TOPIC_MATCH.newsWindowDays &&
            topicSimilarity(f.title, title) >= TOPIC_MATCH.news,
        ))
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
  const existing = findMatch(findings, ref, item.title, ex.category, item.dedupHint, item.publishedAt);
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

/**
 * Aplica la regla de independencia a hallazgos ya guardados (incluidos los arrastrados de propuestas abiertas):
 * un «contrastado» sin dos fuentes independientes baja a su estado correcto y queda en el historial.
 */
export function enforceIndependenceAll(findings: Finding[], runId: string, now: string): { findings: Finding[]; changes: Change[] } {
  const changes: Change[] = [];
  const out = findings.map((f) => {
    const concrete = f.claims.length > 0 || !['noticia', 'otro', 'parche'].includes(f.category);
    const next = enforceIndependence(f, concrete);
    if (!next) return f;
    changes.push({ findingId: f.id, kind: 'estado', before: f.status, after: next, sensitive: false, reason: 'Corrección: «contrastado» exige dos fuentes independientes', sources: f.sources.map((s) => s.url) });
    return addHistory({ ...f, status: next }, { type: 'estado', from: f.status, to: next, platform: null, reason: `Regla de independencia: ${independentCount(f.sources)} fuente(s) independiente(s) no oficiales`, runId, at: now });
  });
  return { findings: out, changes };
}

/**
 * Arrastra hallazgos de propuestas abiertas (aún no fusionadas en main) para que una corrida nueva no los
 * vuelva a proponer como «nuevos». Deduplica con las mismas reglas que la ingesta, reclasifica los heurísticos
 * con el clasificador actual y conserva fuentes e historial. main manda: nunca pisa un hallazgo que ya está ahí.
 */
export function carryPending(
  base: Finding[],
  pendingLists: Finding[][],
  reclassify: (title: string) => { category: Finding['category']; flags: string[] },
  runId: string,
  now: string,
): { findings: Finding[]; changes: Change[]; carried: number; merged: number } {
  let findings = [...base];
  const changes: Change[] = [];
  let carried = 0;
  let merged = 0;
  const seen = new Set(base.map((f) => f.id));
  for (const list of pendingLists)
    for (const p0 of list) {
      if (seen.has(p0.id)) continue;
      seen.add(p0.id);
      let p = p0;
      if (p.classifier === 'heuristico') {
        const rc = reclassify(p.title);
        const flags = [...new Set([...p.flags, ...rc.flags])];
        if (rc.category !== p.category) {
          p = addHistory({ ...p, category: rc.category, flags }, { type: 'nota', from: p.category, to: rc.category, platform: null, reason: 'Reclasificado con el clasificador actual', runId, at: now });
        } else p = { ...p, flags };
      }
      const first = p.sources[0];
      const match = findMatch(findings, first, p.title, p.category, p.dedupKey.startsWith('page:') ? p.dedupKey : undefined, p.sourcePublishedAt) ?? findings.find((f) => f.dedupKey === p.dedupKey);
      if (match) {
        const extra = p.sources.filter((s) => !match.sources.some((m) => m.canonicalUrl === s.canonicalUrl));
        if (!extra.length) {
          merged++;
          continue;
        }
        let f: Finding = { ...match, sources: [...match.sources, ...extra] };
        f = addHistory(f, { type: 'fuente_agregada', from: null, to: extra.map((s) => s.canonicalUrl).join(' '), platform: null, reason: `Consolidado desde una propuesta abierta (${p.id})`, runId, at: now });
        if (!LOCKED.includes(f.status)) {
          const next = sourceStatus(f);
          if (next !== f.status) f = addHistory({ ...f, status: next }, { type: 'estado', from: f.status, to: next, platform: null, reason: `Fuentes independientes: ${independentCount(f.sources)}`, runId, at: now });
        }
        changes.push({ findingId: f.id, kind: 'fuente_agregada', before: null, after: extra[0].canonicalUrl, sensitive: false, reason: 'Misma historia en otra fuente (consolidación)', sources: extra.map((s) => s.url) });
        findings = findings.map((x) => (x.id === match.id ? f : x));
        merged++;
        continue;
      }
      // recalcula el estado con las reglas actuales (independencia, desmentidos); nunca toca estados con evidencia
      if (!LOCKED.includes(p.status)) {
        const st = sourceStatus(p);
        if (st !== p.status) p = addHistory({ ...p, status: st }, { type: 'estado', from: p.status, to: st, platform: null, reason: 'Estado recalculado con las reglas actuales', runId, at: now });
      }
      findings.push(p);
      carried++;
    }
  return { findings, changes, carried, merged };
}

/** Cuerpo acumulado de la propuesta: todo lo que aún no está en main, agrupado y sin repetir. */
export function pendingMarkdown(base: Finding[], final: Finding[], runId: string, now: string): string {
  const inBase = new Map(base.map((f) => [f.id, f]));
  const fresh = final.filter((f) => !inBase.has(f.id));
  const changed = final.filter((f) => inBase.has(f.id) && (inBase.get(f.id)!.status !== f.status || inBase.get(f.id)!.sources.length !== f.sources.length));
  const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const byCat = new Map<string, Finding[]>();
  for (const f of fresh) byCat.set(f.category, [...(byCat.get(f.category) ?? []), f]);
  const lines = [
    `# ATLAS INTELLIGENCE: propuesta acumulada (${fresh.length} nuevos, ${changed.length} actualizados)`,
    '',
    `Última corrida \`${runId}\` · ${now}. Esta PR se actualiza en cada corrida: reúne todo lo pendiente de revisar, sin repetir hallazgos.`,
    '',
    '> Revisión humana obligatoria. Nada pasa a «comprobado» o «parcheado» sin evidencia con fecha, plataforma y versión registrada por una persona. «Contrastado» exige dos fuentes independientes; un anuncio de Rockstar solo es «anuncio oficial».',
    '',
  ];
  for (const [cat, list] of [...byCat.entries()].sort()) {
    lines.push(`## ${cat} (${list.length})`, '', '| Hallazgo | Estado | Fuentes |', '|---|---|---|');
    for (const f of list) lines.push(`| ${esc(f.title)}${f.flags.includes('desmentido_en_titular') ? ' (desmentido)' : ''} | ${f.status} | ${f.sources.map((s, i) => `[${i + 1}](${s.url})`).join(' ')} |`);
    lines.push('');
  }
  if (changed.length) {
    lines.push('## Hallazgos ya publicados que cambian', '', '| Hallazgo | Antes → después | Fuentes |', '|---|---|---|');
    for (const f of changed) lines.push(`| ${esc(f.title)} | ${inBase.get(f.id)!.status} → ${f.status} | ${f.sources.length} |`);
    lines.push('');
  }
  lines.push('## Pruebas ejecutadas por el workflow', '- `npx vitest run tests/intel tests/data.test.ts`', '- `npm run build`', '');
  return lines.join('\n');
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
