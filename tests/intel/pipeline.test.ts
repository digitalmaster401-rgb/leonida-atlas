import { describe, expect, it } from 'vitest';
import { runPipeline, fetchWithRetry, type FetchLike } from '../../src/intel/pipeline';
import { buildProposal, proposalMarkdown } from '../../src/intel/engine';
import { finding, patch, rss, source } from './fixtures';

type Route = (url: string, n: number) => { status: number; body: string } | Promise<{ status: number; body: string }>;
function mockFetch(routes: Record<string, Route>): FetchLike & { calls: string[] } {
  const counts = new Map<string, number>();
  const calls: string[] = [];
  const f = (async (url: string, init?: { signal?: AbortSignal }) => {
    calls.push(url);
    if (init?.signal?.aborted) throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    const key = Object.keys(routes).find((k) => url.startsWith(k));
    const n = (counts.get(key ?? url) ?? 0) + 1;
    counts.set(key ?? url, n);
    if (!key) return { ok: false, status: 404, text: async () => '' };
    const r = await routes[key](url, n);
    return { ok: r.status >= 200 && r.status < 300, status: r.status, text: async () => r.body };
  }) as FetchLike & { calls: string[] };
  f.calls = calls;
  return f;
}
const noSleep = async () => {};
const feedA = rss([
  { title: 'GTA 6 Moses guide: all five cars', link: 'https://a.example/moses', desc: 'Moses pays $1,000 per car in GTA 6.' },
  { title: 'Unrelated news about another game', link: 'https://a.example/other' },
]);
const baseOpts = { trigger: 'test' as const, environment: 'test', sleep: noSleep, now: () => new Date('2026-11-22T12:00:00Z') };

describe('pipeline', () => {
  it('reintenta ante 503 y registra los intentos', async () => {
    const fetch = mockFetch({ 'https://a.example/robots.txt': () => ({ status: 200, body: 'User-agent: *\nAllow: /' }), 'https://a.example/feed': (_u, n) => (n < 3 ? { status: 503, body: '' } : { status: 200, body: feedA }) });
    const r = await runPipeline({ ...baseOpts, sources: [source({ url: 'https://a.example/feed' })], state: { findings: [], patches: [], submissions: [] }, fetchImpl: fetch });
    expect(r.report.sources[0]).toMatchObject({ ok: true, attempts: 3, items: 2, relevant: 1, newFindings: 1, skipped: 1 });
    expect(r.report.status).toBe('ok');
    expect(r.proposal?.requiresHumanReview).toBe(true);
  });
  it('si una fuente falla, conserva los datos existentes y marca la corrida como parcial', async () => {
    const existing = finding({ id: 'fnd-previo' });
    const fetch = mockFetch({
      'https://a.example/robots.txt': () => ({ status: 200, body: '' }),
      'https://a.example/feed': () => ({ status: 200, body: feedA }),
      'https://b.example/robots.txt': () => ({ status: 200, body: '' }),
      'https://b.example/feed': () => ({ status: 500, body: '' }),
    });
    const r = await runPipeline({
      ...baseOpts,
      sources: [source({ url: 'https://a.example/feed' }), source({ id: 'b', url: 'https://b.example/feed', independenceGroup: 'b' })],
      state: { findings: [existing], patches: [], submissions: [] },
      fetchImpl: fetch,
    });
    expect(r.report.status).toBe('parcial');
    expect(r.report.errors[0]).toMatch(/^b: HTTP 500/);
    expect(r.state.findings.some((f) => f.id === 'fnd-previo')).toBe(true);
  });
  it('sin novedades: no hay propuesta y el estado lo dice', async () => {
    const fetch = mockFetch({ 'https://a.example/robots.txt': () => ({ status: 200, body: '' }), 'https://a.example/feed': () => ({ status: 200, body: feedA }) });
    const opts = { ...baseOpts, sources: [source({ url: 'https://a.example/feed' })], fetchImpl: fetch };
    const first = await runPipeline({ ...opts, state: { findings: [], patches: [], submissions: [] } });
    const second = await runPipeline({ ...opts, state: first.state });
    expect(second.report.status).toBe('sin_novedades');
    expect(second.proposal).toBeNull();
    expect(second.state.findings).toHaveLength(first.state.findings.length);
  });
  it('respeta robots.txt: no lee rutas prohibidas', async () => {
    const fetch = mockFetch({ 'https://a.example/robots.txt': () => ({ status: 200, body: 'User-agent: *\nDisallow: /feed' }), 'https://a.example/feed': () => ({ status: 200, body: feedA }) });
    const r = await runPipeline({ ...baseOpts, sources: [source({ url: 'https://a.example/feed' })], state: { findings: [], patches: [], submissions: [] }, fetchImpl: fetch });
    expect(r.report.sources[0].error).toMatch(/robots/);
    expect(fetch.calls).not.toContain('https://a.example/feed');
    expect(r.report.status).toBe('error');
  });
  it('cancelación: una corrida abortada termina como «cancelado» sin perder datos', async () => {
    const ctrl = new AbortController();
    const fetch = mockFetch({
      'https://a.example/robots.txt': () => ({ status: 200, body: '' }),
      'https://a.example/feed': () => {
        ctrl.abort();
        return { status: 503, body: '' };
      },
    });
    const existing = finding({ id: 'fnd-previo' });
    const r = await runPipeline({ ...baseOpts, sources: [source({ url: 'https://a.example/feed' }), source({ id: 'b', url: 'https://b.example/feed' })], state: { findings: [existing], patches: [], submissions: [] }, fetchImpl: fetch, signal: ctrl.signal });
    expect(r.report.status).toBe('cancelado');
    expect(r.state.findings).toHaveLength(1);
  });
  it('tiempo límite por petición con reintentos', async () => {
    const slow: FetchLike = (_u, init) =>
      new Promise((_res, rej) => init?.signal?.addEventListener('abort', () => rej(Object.assign(new Error('abort'), { name: 'AbortError' }))));
    await expect(fetchWithRetry(slow, 'https://x.example', { timeoutMs: 20, retries: 1, sleep: noSleep })).rejects.toThrow(/Tiempo agotado/);
  });
  it('un parche oficial registrado activa la revalidación en la corrida', async () => {
    const f = finding({ status: 'contrastado' });
    const r = await runPipeline({ ...baseOpts, sources: [], state: { findings: [f], patches: [patch()], submissions: [] }, fetchImpl: mockFetch({}) });
    expect(r.state.findings[0].status).toBe('pendiente_revalidacion');
    expect(r.state.patches[0].appliedToFindings).toBe(true);
    expect(r.report.totals.statusChanges).toBeGreaterThan(0);
  });
  it('un parche mencionado por un medio no oficial NO se aplica automáticamente', async () => {
    const feed = rss([{ title: 'GTA 6 patch notes: Title Update 1.02 fixes money glitch', link: 'https://a.example/patch' }]);
    const fetch = mockFetch({ 'https://a.example/robots.txt': () => ({ status: 200, body: '' }), 'https://a.example/feed': () => ({ status: 200, body: feed }) });
    const r = await runPipeline({ ...baseOpts, sources: [source({ url: 'https://a.example/feed', tier: 'medio' })], state: { findings: [finding()], patches: [], submissions: [] }, fetchImpl: fetch });
    expect(r.state.patches).toHaveLength(0);
    expect(r.state.findings.find((x) => x.id === 'fnd-prueba')?.status).toBe('reportado');
  });
  it('generador de PR: propuesta con diff, fuentes, riesgos y pruebas', () => {
    const p = buildProposal('run-1', '2026-11-22T12:00:00Z', [
      { findingId: 'fnd-prueba', kind: 'estado', before: 'reportado', after: 'contrastado', sensitive: true, reason: 'Dos fuentes | independientes', sources: ['https://a.example/1'] },
    ])!;
    const md = proposalMarkdown(p, [finding()]);
    expect(p.requiresHumanReview).toBe(true);
    expect(md).toContain('| GTA 6 car duplication glitch | estado | reportado → contrastado | ⚠️ sí | Dos fuentes \\| independientes | [1](https://a.example/1) |');
    expect(md).toMatch(/revisión humana/);
    expect(md).toContain('npm run build');
    expect(buildProposal('run-2', 'x', [])).toBeNull();
  });
});
