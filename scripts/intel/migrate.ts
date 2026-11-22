// Migración: crea hallazgos (Finding) a partir de las fichas de dinero existentes, preservando sus IDs
// en entryIds. Idempotente: no duplica hallazgos ya migrados. Ejecutar: npx tsx scripts/intel/migrate.ts
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { z } from 'zod';
import { findingSchema, type Finding, type SourceRef } from '../../src/intel/schema';
import { canonicalUrl, dedupKey, fnv64 } from '../../src/intel/normalize';

const entries = JSON.parse(readFileSync('content/entries.json', 'utf8')) as {
  id: string; slug: string; name: string; category: string; summary: string; description: string; status: string; chapter: string | null;
  sources: string[]; verifiedAt: string; howTo: string[]; requirements: string[]; risks: string[]; mode: string;
}[];
const sources = JSON.parse(readFileSync('content/sources.json', 'utf8')) as { id: string; title: string; url: string; publisher: string; publishedAt: string | null; accessedAt: string; type: string }[];
const path = 'intel/findings.json';
const current: Finding[] = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : [];
const migratedAt = '2026-11-22T00:00:00.000Z';

const out = [...current];
for (const e of entries.filter((x) => x.category === 'dinero')) {
  const id = `fnd-${e.slug}`;
  if (out.some((f) => f.id === id)) continue;
  const refs: SourceRef[] = e.sources.map((sid) => {
    const s = sources.find((x) => x.id === sid)!;
    return {
      url: s.url, canonicalUrl: canonicalUrl(s.url), sourceId: sid, publisher: s.publisher, title: s.title,
      publishedAt: s.publishedAt ? `${s.publishedAt}T00:00:00.000Z` : null, accessedAt: `${s.accessedAt}T00:00:00.000Z`,
      tier: s.type === 'oficial' ? 'oficial' : 'guia_tercero', independenceGroup: s.publisher.toLowerCase().replace(/\s+/g, '-'), originId: null, contentHash: fnv64(s.title),
    };
  });
  const status = e.status === 'contrastado' ? 'contrastado' : e.status === 'reportado' ? 'reportado' : 'nuevo_sin_verificar';
  out.push({
    id, dedupKey: `entry:${e.id}`, title: e.name, summary: e.summary, category: 'dinero', tags: [], mode: 'historia', platforms: [], gameVersion: null,
    status, platformStatus: {}, firstDiscoveredAt: migratedAt, sourcePublishedAt: refs[0]?.publishedAt ?? null, lastSourceCheckedAt: `${e.verifiedAt}T00:00:00.000Z`,
    lastInGameTestAt: null, lastValidatedAt: null, nextCheckAt: null, claims: [], requirements: e.requirements, steps: e.howTo, entryIds: [e.id], risks: e.risks,
    sources: refs, evidence: [],
    history: [{ at: migratedAt, type: 'migrado', from: e.status, to: status, platform: null, reason: `Migrado desde la ficha ${e.id} (estado editorial «${e.status}»). Las fuentes no indican plataforma ni versión.`, runId: null }],
    classifier: 'migracion', flags: e.chapter ? [`capitulo:${e.chapter}`] : [], rights: 'Datos atribuidos a las fuentes citadas en la ficha.',
  });
  void dedupKey;
}
z.array(findingSchema).parse(out);
writeFileSync(path, JSON.stringify(out, null, 1) + '\n');
console.log(`hallazgos: ${out.length} (${out.length - current.length} migrados)`);
