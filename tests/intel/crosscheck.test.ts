import { describe, expect, it } from 'vitest';
import { independentCount, statusFromSources } from '../../src/intel/status';
import { ingest } from '../../src/intel/engine';
import { heuristicExtract } from '../../src/intel/classify';
import { item, NOW, ref, source } from './fixtures';

describe('crosscheck de fuentes', () => {
  it('dos fuentes del mismo grupo editorial cuentan como una', () => {
    const s = [ref({ independenceGroup: 'red-x', canonicalUrl: 'https://a.example/1' }), ref({ independenceGroup: 'red-x', canonicalUrl: 'https://b.example/2' })];
    expect(independentCount(s)).toBe(1);
    expect(statusFromSources(s, true)).toBe('reportado');
  });
  it('dos republicaciones del mismo video cuentan una sola vez', () => {
    const s = [ref({ independenceGroup: 'yt:canal1', originId: 'youtube:vid1' }), ref({ independenceGroup: 'yt:canal2', originId: 'youtube:vid1' })];
    expect(independentCount(s)).toBe(1);
  });
  it('dos fuentes realmente independientes ⇒ contrastado (nunca comprobado)', () => {
    const src1 = source({ id: 'a', independenceGroup: 'a' });
    const src2 = source({ id: 'b', name: 'Guía B', independenceGroup: 'b' });
    const i1 = item();
    const i2 = item({ link: 'https://guia-b.example/otro-articulo', summary: 'Otro texto distinto sobre el mismo glitch de GTA 6 money glitch gives $50,000 in Chapter 2' });
    const a = ingest([], i1, src1, heuristicExtract(i1.title, i1.summary, i1.link), 'r1', NOW);
    const b = ingest(a.findings, i2, src2, heuristicExtract(i2.title, i2.summary, i2.link), 'r2', NOW);
    expect(b.findings).toHaveLength(1);
    expect(b.findings[0].status).toBe('contrastado');
    expect(b.findings[0].history.map((h) => h.type)).toEqual(['creado', 'fuente_agregada', 'estado']);
  });
  it('videos con promesas extraordinarias («dinero infinito») no pasan de reportado', () => {
    const i1 = item({ title: 'GTA 6 INFINITE money glitch unlimited cash', link: 'https://youtube.com/watch?v=fake1', summary: 'Infinite money in GTA 6' });
    const i2 = item({ title: 'GTA 6 INFINITE money glitch unlimited cash (working)', link: 'https://youtube.com/watch?v=fake2', summary: 'Unlimited money glitch GTA 6' });
    const a = ingest([], i1, source({ id: 'c1', independenceGroup: 'yt:c1' }), heuristicExtract(i1.title, i1.summary, i1.link), 'r1', NOW);
    const b = ingest(a.findings, i2, source({ id: 'c2', independenceGroup: 'yt:c2' }), heuristicExtract(i2.title, i2.summary, i2.link), 'r2', NOW);
    expect(b.findings).toHaveLength(1);
    expect(b.findings[0].flags).toContain('promesa_extraordinaria');
    expect(b.findings[0].status).toBe('reportado');
  });
});
