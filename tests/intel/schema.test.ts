import { describe, expect, it } from 'vitest';
import { findingSchema, intelSourceSchema } from '../../src/intel/schema';
import { finding, source } from './fixtures';

describe('esquemas de ATLAS INTELLIGENCE', () => {
  it('acepta un hallazgo y una fuente válidos', () => {
    expect(findingSchema.safeParse(finding()).success).toBe(true);
    expect(intelSourceSchema.safeParse(source()).success).toBe(true);
  });
  it('rechaza hallazgos sin fuentes, sin historial, con estado o plataforma inventados', () => {
    expect(findingSchema.safeParse(finding({ sources: [] })).success).toBe(false);
    expect(findingSchema.safeParse(finding({ history: [] })).success).toBe(false);
    expect(findingSchema.safeParse({ ...finding(), status: 'funciona_hoy' }).success).toBe(false);
    expect(findingSchema.safeParse({ ...finding(), platforms: ['pc'] }).success).toBe(false);
  });
  it('las afirmaciones exigen cita literal', () => {
    expect(findingSchema.safeParse(finding({ claims: [{ text: 'x paga', quote: '', sourceUrl: 'https://a.example', amount: 1, unit: null }] })).success).toBe(false);
  });
  it('las fuentes deben usar https y declarar si permiten IA', () => {
    expect(intelSourceSchema.safeParse(source({ url: 'http://a.example/feed' })).success).toBe(false);
    const { aiProcessingAllowed: _omit, ...rest } = source();
    void _omit;
    expect(intelSourceSchema.safeParse(rest).success).toBe(false);
  });
});
