import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { redact } from '../../src/intel/redact';
import { runPipeline, type FetchLike } from '../../src/intel/pipeline';
import { source } from './fixtures';

function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

describe('protección de secretos', () => {
  it('oculta claves conocidas y valores de secretos', () => {
    const t = redact('key sk-ant-api03-abcdefghijklmnop y ghp_abcdefghijklmnopqrstuvwxyz1234 y AIzaSyA1234567890abcdefghijklmnopqrstu y mi-secreto-largo', ['mi-secreto-largo']);
    expect(t).not.toMatch(/sk-ant-api03|ghp_abc|AIzaSy|mi-secreto-largo/);
    expect(t.match(/SECRETO-OCULTO/g)?.length).toBe(4);
  });
  it('un error que contiene la clave no la filtra al reporte', async () => {
    const secret = 'AIzaSyFAKEFAKEFAKEFAKEFAKEFAKEFAKE12345';
    const fetchImpl: FetchLike = async (url) => {
      throw new Error(`fallo en ${url}`);
    };
    const r = await runPipeline({
      sources: [source({ id: 'youtube-busqueda', kind: 'api', url: 'https://www.googleapis.com/youtube/v3/search' })],
      state: { findings: [], patches: [], submissions: [] }, fetchImpl, trigger: 'test', environment: 'test', youtubeApiKey: secret, secrets: [secret], sleep: async () => {}, retries: 0,
    });
    expect(JSON.stringify(r.report)).not.toContain(secret);
    expect(JSON.stringify(r.report)).toContain('SECRETO-OCULTO');
  });
  it('el código del navegador no importa el SDK de IA ni lee claves', () => {
    // Módulos que solo usa el pipeline del servidor (GitHub Actions); el navegador no los importa.
    const SERVER = ['src/intel/pipeline.ts', 'src/intel/engine.ts', 'src/intel/classify.ts', 'src/intel/redact.ts', 'src/intel/budget.ts', 'src/intel/robots.ts'];
    const browserFiles = walk('src').filter((f) => /\.(tsx?)$/.test(f) && !SERVER.includes(f));
    for (const f of browserFiles) {
      const t = readFileSync(f, 'utf8');
      expect(t, f).not.toMatch(/from '\.{1,2}\/(intel\/)?(pipeline|classify|redact|budget|robots)'/);
    }
    for (const f of browserFiles) {
      const t = readFileSync(f, 'utf8');
      expect(t, f).not.toMatch(/@anthropic-ai\/sdk|ANTHROPIC_API_KEY|YOUTUBE_API_KEY|import\.meta\.env\.VITE_[A-Z_]*(KEY|TOKEN|SECRET)/);
    }
  });
  it('el build publicado no contiene nombres ni valores de secretos', () => {
    if (!existsSync('dist')) return;
    for (const f of walk('dist').filter((x) => /\.(js|html|json)$/.test(x))) {
      expect(readFileSync(f, 'utf8'), f).not.toMatch(/sk-ant-|ANTHROPIC_API_KEY|YOUTUBE_API_KEY|ghp_[A-Za-z0-9]{20}/);
    }
  });
  it('los secretos solo se leen desde «secrets.*» en los workflows', () => {
    const wf = readFileSync('.github/workflows/atlas-intelligence.yml', 'utf8');
    expect(wf).toMatch(/ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}/);
    expect(wf).not.toMatch(/sk-ant-|AIza/);
  });
});
