import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { z } from 'zod';
import { findingSchema, intelSourceSchema, patchSchema, runReportSchema, submissionSchema } from '../../src/intel/schema';

const tracked = execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' }).split('\n').filter(Boolean);

describe('resguardos del repositorio', () => {
  it('no hay PDFs, videos ni referencias privadas en el repositorio ni en public/', () => {
    const bad = tracked.filter((f) => /\.(pdf|mp4|mov)$/i.test(f) || /privad/i.test(f));
    expect(bad).toEqual([]);
  });
  it('.gitignore bloquea las referencias privadas del propietario', () => {
    const gi = readFileSync('.gitignore', 'utf8');
    for (const p of ['*PRIVADA*', '*.mp4', 'referencias-privadas/']) expect(gi).toContain(p);
  });
  it('el workflow corre dos veces al día, manual, con límite de tiempo y concurrencia', () => {
    const wf = readFileSync('.github/workflows/atlas-intelligence.yml', 'utf8');
    expect(wf.match(/- cron: /g)?.length).toBe(2);
    expect(wf).toContain('workflow_dispatch');
    // la PR automática necesita que el workflow lance el CI (si no, GitHub lo deja en «action_required»)
    expect(wf).toMatch(/gh workflow run ci\.yml --ref "\$BRANCH"/);
    // una sola PR acumulada que arrastra las propuestas abiertas (sin duplicar entre corridas)
    expect(wf).toContain('BRANCH="atlas-intelligence/propuestas"');
    expect(wf).toMatch(/gh pr edit "\$NUM"/);
    expect(wf).toMatch(/--pending=\$PENDING/);
    expect(wf).toMatch(/--label atlas-intelligence --json headRefName/);
    expect(wf).toMatch(/actions: write/);
    expect(readFileSync('.github/workflows/ci.yml', 'utf8')).toMatch(/^\s+workflow_dispatch:/m);
    expect(wf).toMatch(/timeout-minutes: \d+/);
    expect(wf).toMatch(/concurrency:/);
    expect(wf).toMatch(/gh pr create/);
    expect(wf).not.toMatch(/git push origin (main|HEAD:main)/);
  });
  it('los datos de ATLAS INTELLIGENCE cumplen su esquema', () => {
    z.array(intelSourceSchema).parse(JSON.parse(readFileSync('intel/sources.json', 'utf8')));
    const f = z.array(findingSchema).parse(JSON.parse(readFileSync('intel/findings.json', 'utf8')));
    z.array(patchSchema).parse(JSON.parse(readFileSync('intel/patches.json', 'utf8')));
    z.array(submissionSchema).parse(JSON.parse(readFileSync('intel/submissions.json', 'utf8')));
    z.array(runReportSchema).parse(JSON.parse(readFileSync('intel/runs/index.json', 'utf8')));
    expect(new Set(f.map((x) => x.id)).size).toBe(f.length);
    expect(new Set(f.map((x) => x.dedupKey)).size).toBe(f.length);
  });
  it('la migración preserva los IDs de las fichas existentes', () => {
    const entries = JSON.parse(readFileSync('content/entries.json', 'utf8')) as { id: string; category: string }[];
    const f = JSON.parse(readFileSync('intel/findings.json', 'utf8')) as { entryIds: string[]; classifier: string }[];
    const migrated = f.filter((x) => x.classifier === 'migracion');
    expect(migrated.length).toBe(entries.filter((e) => e.category === 'dinero').length);
    for (const m of migrated) for (const id of m.entryIds) expect(entries.some((e) => e.id === id)).toBe(true);
  });
  it('ningún hallazgo automático aparece como comprobado o parcheado sin evidencia', () => {
    const f = JSON.parse(readFileSync('intel/findings.json', 'utf8')) as { status: string; evidence: unknown[] }[];
    for (const x of f) if (['comprobado_en_version', 'parcheado', 'refutado'].includes(x.status)) expect(x.evidence.length).toBeGreaterThan(0);
  });
  it('fuentes desactivadas explican por qué', () => {
    const s = JSON.parse(readFileSync('intel/sources.json', 'utf8')) as { enabled: boolean; disabledReason?: string }[];
    for (const x of s.filter((y) => !y.enabled)) expect(x.disabledReason?.length).toBeGreaterThan(20);
  });
  it('matriz funcional: cada requisito «implementado_testeado» apunta a pruebas que existen', () => {
    const csv = readFileSync('docs/MATRIZ_FUNCIONAL.csv', 'utf8').trim().split('\n').slice(1);
    for (const line of csv) {
      if (!line.includes('implementado_testeado')) continue;
      const refs = line.match(/tests\/[\w/.-]+\.(?:test\.tsx?|ts)/g) ?? [];
      for (const r of refs) expect(existsSync(r), `${r} (${line.slice(0, 40)})`).toBe(true);
    }
  });
});
