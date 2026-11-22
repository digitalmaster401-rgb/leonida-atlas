import { describe, expect, it } from 'vitest';
import { parseSubmission } from '../../src/intel/pipeline';

const body = (url: string, extra = '') => `### Enlace\n\n${url}\n\n### Categoría\n\nGlitch\n\n### Plataforma\n\nPS5\n\n### Descripción\n\nDuplica un auto en el Capítulo 2.${extra}\n\n### Confirmaciones\n\n- [X] Entiendo`;
const NOW = '2026-11-22T12:00:00.000Z';

describe('aportes de la comunidad', () => {
  it('un aporte válido entra a la cola de revisión, nunca se publica', () => {
    const s = parseSubmission(body('https://www.tiktok.com/@x/video/7312345678901234567'), '#12', 'ana', NOW, []);
    expect(s).toMatchObject({ moderation: 'en_cola', category: 'glitch', platform: 'PS5', findingId: null, channel: 'github_issue' });
  });
  it('rechaza enlaces inválidos o no https', () => {
    expect(parseSubmission(body('javascript:alert(1)'), '#13', 'ana', NOW, []).moderation).toBe('rechazado');
    expect(parseSubmission(body('http://inseguro.example/x'), '#14', 'ana', NOW, []).moderation).toBe('rechazado');
  });
  it('detecta spam y duplicados', () => {
    expect(parseSubmission(body('https://a.example/x', ' crypto https://1 https://2 https://3 https://4 https://5'), '#15', 'bot', NOW, []).moderation).toBe('spam');
    const first = parseSubmission(body('https://a.example/v'), '#16', 'ana', NOW, []);
    expect(parseSubmission(body('https://www.a.example/v?utm_source=x'), '#17', 'luis', NOW, [first]).moderation).toBe('duplicado');
  });
  it('limita envíos por autor', () => {
    const per = new Map<string, number>();
    const res = Array.from({ length: 7 }, (_, i) => parseSubmission(body(`https://a.example/${i}`), `#${20 + i}`, 'mismo', NOW, [], per));
    expect(res.at(-1)?.moderation).toBe('spam');
  });
});
