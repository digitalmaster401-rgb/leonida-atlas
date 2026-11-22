// CLI de ATLAS INTELLIGENCE. Uso: npx tsx scripts/intel/run.ts [--trigger=schedule|workflow_dispatch|manual_local] [--dry-run]
// Variables opcionales (solo como secretos de GitHub Actions, nunca VITE_*): ANTHROPIC_API_KEY, YOUTUBE_API_KEY,
// GITHUB_TOKEN + GITHUB_REPOSITORY (para leer aportes «hallazgo»), ATLAS_AI_MODEL, ATLAS_MAX_AI_CALLS, ATLAS_MAX_COST_USD.
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { z } from 'zod';
import { findingSchema, intelSourceSchema, patchSchema, runReportSchema, submissionSchema, reviewProposalSchema, type RunReport } from '../../src/intel/schema';
import { runPipeline, type FetchLike } from '../../src/intel/pipeline';
import { aiExtractionSchema } from '../../src/intel/classify';
import { proposalMarkdown } from '../../src/intel/engine';
import { redact, secretValuesFromEnv } from '../../src/intel/redact';

const args = new Map(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=') as [string, string]));
const trigger = (args.get('trigger') ?? 'manual_local') as RunReport['trigger'];
const dryRun = args.has('dry-run');
const env = process.env;
const secrets = secretValuesFromEnv(env);

const read = <T>(p: string, schema: z.ZodType<T>, fallback: T): T => (existsSync(p) ? schema.parse(JSON.parse(readFileSync(p, 'utf8'))) : fallback);
const sources = read('intel/sources.json', z.array(intelSourceSchema), []);
const state = {
  findings: read('intel/findings.json', z.array(findingSchema), []),
  patches: read('intel/patches.json', z.array(patchSchema), []),
  submissions: read('intel/submissions.json', z.array(submissionSchema), []),
};
// YouTube API solo si hay clave
for (const s of sources) if (s.id === 'youtube-busqueda' && env.YOUTUBE_API_KEY) s.enabled = true;

async function makeAi() {
  if (!env.ANTHROPIC_API_KEY) return null;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const { zodOutputFormat } = await import('@anthropic-ai/sdk/helpers/zod');
  const client = new Anthropic({ maxRetries: 2, timeout: 30_000 });
  return {
    // Modelo económico para clasificación incremental (configurable). Revisa precios antes de cambiarlo.
    model: env.ATLAS_AI_MODEL || 'claude-haiku-5-5',
    client: client as unknown as import('../../src/intel/classify').ParseClient,
    outputFormat: zodOutputFormat(aiExtractionSchema),
  };
}

const ctrl = new AbortController();
process.on('SIGINT', () => ctrl.abort());
process.on('SIGTERM', () => ctrl.abort());

const ai = await makeAi();
const result = await runPipeline({
  sources,
  state,
  fetchImpl: fetch as unknown as FetchLike,
  trigger,
  environment: env.GITHUB_ACTIONS ? `github-actions (${env.GITHUB_REPOSITORY ?? 'repo'})` : 'local',
  ai,
  budget: {
    maxAiCalls: Number(env.ATLAS_MAX_AI_CALLS ?? 40),
    maxCostUsd: Number(env.ATLAS_MAX_COST_USD ?? 0.25),
  },
  signal: ctrl.signal,
  youtubeApiKey: env.YOUTUBE_API_KEY,
  github: env.GITHUB_TOKEN && env.GITHUB_REPOSITORY ? { repo: env.GITHUB_REPOSITORY, token: env.GITHUB_TOKEN } : null,
  secrets,
});

// Validación estricta antes de escribir nada
z.array(findingSchema).parse(result.state.findings);
runReportSchema.parse(result.report);
if (result.proposal) reviewProposalSchema.parse(result.proposal);

const summaryLine = `${result.report.id} · ${result.report.status} · ${result.report.totals.newFindings} nuevos · ${result.report.totals.statusChanges} cambios de estado · ${result.report.errors.length} errores`;
console.log(redact(summaryLine, secrets));
for (const s of result.report.sources) console.log(`  ${s.ok ? '✓' : '✗'} ${s.sourceId}: ${s.items} elementos, ${s.relevant} relevantes, ${s.newFindings} nuevos${s.error ? ` — ${s.error}` : ''}`);

if (!dryRun) {
  const w = (p: string, data: unknown) => writeFileSync(p, redact(JSON.stringify(data, null, 1), secrets) + '\n');
  mkdirSync('intel/runs', { recursive: true });
  mkdirSync('intel/proposals', { recursive: true });
  w('intel/findings.json', result.state.findings);
  w('intel/patches.json', result.state.patches);
  w('intel/submissions.json', result.state.submissions);
  w(`intel/runs/${result.report.id}.json`, result.report);
  const index = existsSync('intel/runs/index.json') ? (JSON.parse(readFileSync('intel/runs/index.json', 'utf8')) as RunReport[]) : [];
  w('intel/runs/index.json', [result.report, ...index.filter((r) => r.id !== result.report.id)].slice(0, 60));
  if (result.proposal) {
    w(`intel/proposals/${result.proposal.id}.json`, result.proposal);
    writeFileSync(`intel/proposals/${result.proposal.id}.md`, redact(proposalMarkdown(result.proposal, result.state.findings), secrets));
    writeFileSync('intel/proposals/LATEST.md', redact(proposalMarkdown(result.proposal, result.state.findings), secrets));
  }
}
if (env.GITHUB_STEP_SUMMARY) {
  appendFileSync(env.GITHUB_STEP_SUMMARY, redact(`## ATLAS INTELLIGENCE\n\n${summaryLine}\n\n` + result.report.sources.map((s) => `- ${s.ok ? '✅' : '❌'} **${s.sourceId}**: ${s.items} elementos, ${s.relevant} relevantes, ${s.newFindings} nuevos${s.error ? ` — ${s.error}` : ''}`).join('\n') + '\n', secrets));
}
if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `changes=${result.changes.length}\nrun_id=${result.report.id}\nstatus=${result.report.status}\n`);
process.exitCode = result.report.status === 'error' ? 1 : 0;
