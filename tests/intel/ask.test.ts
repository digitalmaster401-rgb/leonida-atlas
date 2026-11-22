import { describe, expect, it } from 'vitest';
import entries from '../../content/entries.json';
import type { Entry } from '../../src/data/schema';
import { ask } from '../../src/intel/ask';
import { reconcileEvidence } from '../../src/intel/engine';
import { evidence, finding, NOW } from './fixtures';

const E = entries as Entry[];
const path = (e: Entry) => `/${e.category}/${e.slug}`;

describe('Pregúntale a ATLAS', () => {
  it('sin prueba registrada responde «No puedo confirmarlo»', () => {
    const r = ask('¿Qué glitch funciona hoy en Xbox?', E, [finding()], [], path);
    expect(r.answer).toMatch(/^No puedo confirmarlo/);
    expect(r.certainty).toBe('ninguna');
    expect(r.lastRun).toMatch(/todavía no registra/);
  });
  it('con prueba registrada cita fecha y versión, sin prometer que funcione hoy', () => {
    const f = reconcileEvidence(finding({ evidence: [evidence()] }), null, null, NOW);
    const r = ask('¿el glitch de duplicar auto funciona en PS5?', E, [f], [], path);
    expect(r.answer).toMatch(/2026-11-21/);
    expect(r.answer).toMatch(/1\.01/);
    expect(r.answer).toMatch(/no garantiza/);
  });
  it('preguntas generales responden con fichas y citas internas', () => {
    const r = ask('¿Dónde está Stock 305?', E, [], [], path);
    expect(r.citations[0]).toMatchObject({ internal: true, url: '/negocios/stock-305' });
    expect(r.certainty).toBe('alta');
  });
  it('sin datos lo dice y sugiere enviar un hallazgo', () => {
    expect(ask('xyzzy qwerty', E, [], [], path).answer).toMatch(/No tengo datos respaldados/);
  });
});
