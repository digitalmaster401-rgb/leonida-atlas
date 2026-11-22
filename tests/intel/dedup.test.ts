import { describe, expect, it } from 'vitest';
import { canonicalUrl, contentHash, dedupKey, originId, titleSimilarity } from '../../src/intel/normalize';
import { ingest } from '../../src/intel/engine';
import { heuristicExtract } from '../../src/intel/classify';
import { item, NOW, source } from './fixtures';

describe('deduplicación', () => {
  it('normaliza URLs: https, sin www, sin rastreo, sin fragmento ni barra final', () => {
    expect(canonicalUrl('http://www.Example.com/a/?utm_source=x&b=2&fbclid=1#top')).toBe('https://example.com/a?b=2');
    expect(canonicalUrl('https://m.youtube.com/watch?v=abc123&feature=share&t=10')).toBe('https://youtube.com/watch?v=abc123');
  });
  it('reconoce el mismo video en distintos formatos de enlace', () => {
    expect(originId('https://youtu.be/AbC_12345')).toBe('youtube:AbC_12345');
    expect(originId('https://www.youtube.com/shorts/AbC_12345')).toBe('youtube:AbC_12345');
    expect(originId('https://www.tiktok.com/@alguien/video/7312345678901234567')).toBe('tiktok:7312345678901234567');
    expect(dedupKey('https://youtu.be/AbC_12345')).toBe(dedupKey('https://www.youtube.com/watch?v=AbC_12345'));
  });
  it('mismo texto → misma huella; títulos parecidos', () => {
    expect(contentHash('GTA 6 Glitch!', 'Texto')).toBe(contentHash('gta 6 glitch', 'texto'));
    expect(titleSimilarity('GTA 6 money glitch Chapter 2', 'GTA 6 Chapter 2 money glitch')).toBe(1);
  });
  it('el mismo elemento ingerido dos veces no crea duplicados ni fuentes repetidas', () => {
    const src = source();
    const it1 = item();
    const ex = heuristicExtract(it1.title, it1.summary, it1.link);
    const a = ingest([], it1, src, ex, 'r1', NOW);
    const b = ingest(a.findings, { ...it1, link: it1.link + '?utm_source=rss' }, src, ex, 'r2', NOW);
    expect(b.findings).toHaveLength(1);
    expect(b.findings[0].sources).toHaveLength(1);
    expect(b.changes).toHaveLength(0);
  });
});
