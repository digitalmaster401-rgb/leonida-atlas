import { describe, expect, it } from 'vitest';
import { applyPatch, reconcileEvidence } from '../../src/intel/engine';
import { evidence, finding, NOW, patch } from './fixtures';

describe('version-watch', () => {
  it('un parche nuevo pasa los hallazgos afectados a pendiente_revalidacion por plataforma, sin borrar historial', () => {
    const f = reconcileEvidence(finding({ evidence: [evidence()], status: 'contrastado' }), null, null, '2026-11-21T10:00:00.000Z');
    const before = f.history.length;
    const { findings, changes } = applyPatch([f], patch(), 'r1', NOW);
    const g = findings[0];
    expect(g.platformStatus.ps5).toBe('pendiente_revalidacion');
    expect(g.platformStatus.xbox_series_x).toBe('pendiente_revalidacion');
    expect(g.status).toBe('pendiente_revalidacion');
    expect(g.history.length).toBeGreaterThan(before);
    expect(g.evidence).toHaveLength(1);
    expect(changes[0].kind).toBe('revalidacion');
  });
  it('nunca marca «parcheado» por la sola llegada del parche', () => {
    const { findings } = applyPatch([finding({ status: 'reportado', platforms: [] })], patch(), 'r1', NOW);
    expect(findings[0].status).toBe('pendiente_revalidacion');
    expect(JSON.stringify(findings)).not.toContain('"parcheado"');
  });
  it('no toca noticias, refutados ni hallazgos descubiertos después del parche', () => {
    const list = [
      finding({ id: 'fnd-n', category: 'noticia' }),
      finding({ id: 'fnd-r', status: 'refutado', platforms: [] }),
      finding({ id: 'fnd-d', firstDiscoveredAt: '2026-11-22T10:00:00.000Z' }),
    ];
    const { findings, changes } = applyPatch(list, patch(), 'r1', NOW);
    expect(changes).toHaveLength(0);
    expect(findings.map((f) => f.status)).toEqual(['reportado', 'refutado', 'reportado']);
  });
  it('tras el parche, una prueba anterior al parche no devuelve el estado «comprobado»', () => {
    const f = reconcileEvidence(finding({ evidence: [evidence({ testedAt: '2026-11-21T09:00:00.000Z' })] }), '2026-11-22T08:00:00.000Z', null, NOW);
    expect(f.platformStatus.ps5).toBe('pendiente_revalidacion');
  });
});
