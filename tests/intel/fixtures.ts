import type { Evidence, Finding, IntelSource, Patch, SourceRef } from '../../src/intel/schema';
import type { FeedItem } from '../../src/intel/feeds';

export const NOW = '2026-11-22T12:00:00.000Z';

export function source(over: Partial<IntelSource> = {}): IntelSource {
  return {
    id: 'guia-a', name: 'Guía A', url: 'https://guia-a.example/feed', homepage: 'https://guia-a.example', kind: 'rss', tier: 'guia_tercero', language: 'en',
    categories: ['glitch', 'dinero'], independenceGroup: 'guia-a', frequencyHours: 12, reliability: 0.7, enabled: true, aiProcessingAllowed: true, rights: 'Feed RSS público.', ...over,
  };
}

export function item(over: Partial<FeedItem> = {}): FeedItem {
  return { title: 'GTA 6 money glitch gives $50,000 in Chapter 2', link: 'https://guia-a.example/gta-6-money-glitch', publishedAt: '2026-11-21T10:00:00.000Z', summary: 'A glitch in GTA 6 lets you duplicate a car and sell it for $50,000 on PS5.', id: null, ...over };
}

export function ref(over: Partial<SourceRef> = {}): SourceRef {
  return { url: 'https://a.example/x', canonicalUrl: 'https://a.example/x', sourceId: 'a', publisher: 'A', title: 't', publishedAt: null, accessedAt: NOW, tier: 'guia_tercero', independenceGroup: 'a', originId: null, contentHash: 'h1', ...over };
}

export function finding(over: Partial<Finding> = {}): Finding {
  return {
    id: 'fnd-prueba', dedupKey: 'url:https://a.example/x', title: 'GTA 6 car duplication glitch', summary: '', category: 'glitch', tags: ['glitch'], mode: 'historia', platforms: ['ps5', 'xbox_series_x'],
    gameVersion: null, status: 'reportado', platformStatus: {}, firstDiscoveredAt: '2026-11-20T00:00:00.000Z', sourcePublishedAt: '2026-11-20T00:00:00.000Z', lastSourceCheckedAt: NOW,
    lastInGameTestAt: null, lastValidatedAt: null, nextCheckAt: null, claims: [], requirements: [], steps: [], entryIds: [], risks: [], sources: [ref()], evidence: [],
    history: [{ at: '2026-11-20T00:00:00.000Z', type: 'creado', from: null, to: null, platform: null, reason: 'prueba', runId: null }], classifier: 'heuristico', flags: [], rights: 'r', ...over,
  };
}

export function evidence(over: Partial<Evidence> = {}): Evidence {
  return { id: 'ev1', type: 'prueba_en_juego', url: 'https://youtu.be/abc', platform: 'ps5', gameVersion: '1.01', testedAt: '2026-11-21T09:00:00.000Z', result: 'funciona', recordedBy: 'editor', recordedAt: NOW, notes: '', ...over };
}

export function patch(over: Partial<Patch> = {}): Patch {
  return { id: 'patch-1-02', version: '1.02', title: 'GTA VI Title Update 1.02', platforms: ['ps5', 'xbox_series_x', 'xbox_series_s', 'ps5_pro'], publishedAt: '2026-11-22T08:00:00.000Z', sourceUrl: 'https://www.rockstargames.com/newswire', official: true, affects: [], detectedAt: NOW, appliedToFindings: false, ...over };
}

export function rss(items: { title: string; link: string; date?: string; desc?: string }[]): string {
  return `<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>${items
    .map((i) => `<item><title><![CDATA[${i.title}]]></title><link>${i.link}</link><pubDate>${i.date ?? 'Sat, 21 Nov 2026 10:00:00 GMT'}</pubDate><description><![CDATA[${i.desc ?? ''}]]></description></item>`)
    .join('')}</channel></rss>`;
}
