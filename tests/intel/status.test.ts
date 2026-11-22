import { describe, expect, it } from 'vitest';
import { overallStatus, setPlatformStatus, statusFromEvidence, worksTodayLabel } from '../../src/intel/status';
import { reconcileEvidence } from '../../src/intel/engine';
import { evidence, finding, NOW } from './fixtures';

describe('estados editoriales', () => {
  it('comprobado_en_version exige prueba en juego con fecha, plataforma y versión', () => {
    expect(statusFromEvidence([evidence()], 'ps5', null)).toBe('comprobado_en_version');
    expect(statusFromEvidence([evidence({ gameVersion: null })], 'ps5', null)).toBeNull();
    expect(statusFromEvidence([evidence({ type: 'video_tercero' })], 'ps5', null)).toBeNull();
  });
  it('artículo nuevo sobre una prueba vieja: cuenta la fecha de la prueba, no la de publicación', () => {
    const ev = evidence({ testedAt: '2026-11-20T00:00:00.000Z', recordedAt: '2026-11-23T00:00:00.000Z' });
    expect(statusFromEvidence([ev], 'ps5', '2026-11-22T08:00:00.000Z')).toBe('pendiente_revalidacion');
  });
  it('estado por plataforma: una prueba en PS5 no confirma Xbox', () => {
    const f = reconcileEvidence(finding({ evidence: [evidence()] }), null, null, NOW);
    expect(f.platformStatus.ps5).toBe('comprobado_en_version');
    expect(f.platformStatus.xbox_series_x).toBeUndefined();
    expect(f.status).toBe('comprobado_en_version');
  });
  it('el estado global es el más conservador entre plataformas', () => {
    expect(overallStatus({ ps5: 'comprobado_en_version', xbox_series_x: 'pendiente_revalidacion' }, 'reportado')).toBe('pendiente_revalidacion');
  });
  it('parcheado solo con prueba posterior o nota oficial; refutado con refutación', () => {
    expect(statusFromEvidence([evidence({ result: 'no_funciona' })], 'ps5', null)).toBe('parcheado');
    expect(statusFromEvidence([evidence({ type: 'refutacion', result: 'no_funciona' })], 'ps5', null)).toBe('refutado');
  });
  it('los cambios de estado quedan en el historial', () => {
    const f = setPlatformStatus(finding(), 'ps5', 'pendiente_revalidacion', 'motivo', 'r1', NOW);
    expect(f.history.at(-1)).toMatchObject({ type: 'estado', to: 'pendiente_revalidacion', platform: 'ps5', reason: 'motivo' });
  });
  it('nunca muestra «funciona hoy» sin prueba de hoy en la versión actual', () => {
    const f = reconcileEvidence(finding({ evidence: [evidence()] }), null, null, NOW);
    expect(worksTodayLabel(f, 'ps5', '2026-11-22', '1.01')).toMatch(/no confirmado hoy/);
    expect(worksTodayLabel(f, 'ps5', '2026-11-21', '1.01')).toMatch(/^Funciona hoy/);
    expect(worksTodayLabel(f, 'ps5', '2026-11-21', '1.02')).toMatch(/no confirmado hoy/);
    expect(worksTodayLabel(f, 'xbox_series_x', '2026-11-21', '1.01')).toBe('No confirmado');
  });
});
