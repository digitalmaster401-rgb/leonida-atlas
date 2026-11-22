// Orquestador de ATLAS INTELLIGENCE (sin E/S de archivos: el CLI scripts/intel/run.ts lo envuelve).
// discover → extract/classify → crosscheck → version-watch → evidencia → propuesta → reporte.
import type { Finding, IntelSource, Patch, RunReport, RunSourceResult, Submission } from './schema';
import { parseFeed, stripHtml, type FeedItem } from './feeds';
import { extract, type AiOptions } from './classify';
import { applyPatch, buildProposal, ingest, latestPatchAt, reconcileEvidence, type Change } from './engine';
import { isRelevant } from './heuristics';
import { Budget, DEFAULT_BUDGET, type BudgetConfig } from './budget';
import { robotsAllows, USER_AGENT } from './robots';
import { slugify, canonicalUrl } from './normalize';
import { redact } from './redact';

export type FetchLike = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}>;

export interface PipelineState {
  findings: Finding[];
  patches: Patch[];
  submissions: Submission[];
}

export interface PipelineOptions {
  sources: IntelSource[];
  state: PipelineState;
  fetchImpl: FetchLike;
  now?: () => Date;
  trigger: RunReport['trigger'];
  environment: string;
  ai?: Omit<AiOptions, 'budget'> | null;
  budget?: Partial<BudgetConfig>;
  signal?: AbortSignal;
  youtubeApiKey?: string;
  github?: { repo: string; token: string } | null;
  secrets?: string[];
  sleep?: (ms: number) => Promise<void>;
  retries?: number;
}

export interface PipelineResult {
  state: PipelineState;
  report: RunReport;
  changes: Change[];
  proposal: ReturnType<typeof buildProposal>;
}

class Cancelled extends Error {}

/** fetch con tiempo límite, reintentos con espera exponencial (429/5xx/red) y cancelación externa. */
export async function fetchWithRetry(
  fetchImpl: FetchLike,
  url: string,
  opts: { timeoutMs: number; retries: number; signal?: AbortSignal; sleep: (ms: number) => Promise<void> },
): Promise<{ status: number; body: string; attempts: number }> {
  let attempt = 0;
  let lastErr = '';
  while (attempt <= opts.retries) {
    if (opts.signal?.aborted) throw new Cancelled('Corrida cancelada');
    attempt++;
    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    opts.signal?.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, text/html;q=0.5' } });
      const body = await res.text();
      if (res.ok) return { status: res.status, body, attempts: attempt };
      lastErr = `HTTP ${res.status}`;
      if (res.status !== 429 && res.status < 500) return { status: res.status, body: '', attempts: attempt };
    } catch (e) {
      if (opts.signal?.aborted) throw new Cancelled('Corrida cancelada');
      lastErr = (e as Error).name === 'AbortError' ? `Tiempo agotado (${opts.timeoutMs} ms)` : (e as Error).message;
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
    }
    if (attempt <= opts.retries) await opts.sleep(500 * 2 ** (attempt - 1));
  }
  throw new Error(lastErr || 'Fallo de red');
}

const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';

/** Vigilancia de página oficial: extrae pares «titular + fecha» del contenido renderizado. */
export function extractPageNews(html: string, pageUrl: string, sourceId: string): FeedItem[] {
  const texts = [...html.replace(/\\"/g, '"').matchAll(/"children":"([^"$][^"]{3,200})"/g)].map((m) => stripHtml(m[1]));
  const out: FeedItem[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < texts.length - 1; i++) {
    const d = texts[i + 1].match(new RegExp(`^(${MONTHS}) (\\d{1,2}), (\\d{4})$`));
    if (!d || /^(${MONTHS})/.test(texts[i])) continue;
    const title = texts[i];
    if (seen.has(title)) continue;
    seen.add(title);
    const iso = new Date(`${d[1]} ${d[2]}, ${d[3]} 12:00:00 UTC`).toISOString();
    out.push({ title, link: pageUrl, publishedAt: iso, summary: `Publicado en la página oficial el ${d[1]} ${d[2]}, ${d[3]}.`, id: null, dedupHint: `page:${sourceId}:${slugify(title)}` });
  }
  return out;
}

const YT_QUERIES = ['GTA 6 glitch', 'GTA 6 money method', 'GTA 6 cheats', 'GTA 6 collectibles'];

async function discover(src: IntelSource, o: PipelineOptions, budget: Budget, sleep: (ms: number) => Promise<void>, robotsCache: Map<string, string | null>): Promise<{ items: FeedItem[]; status: number | null; attempts: number }> {
  const retries = o.retries ?? 2;
  const timeoutMs = budget.cfg.requestTimeoutMs;
  if (src.kind === 'api' && src.id === 'youtube-busqueda') {
    if (!o.youtubeApiKey) throw new Error('Requiere YOUTUBE_API_KEY (no configurada)');
    const items: FeedItem[] = [];
    let attempts = 0;
    const after = new Date((o.now?.() ?? new Date()).getTime() - 3 * 86400000).toISOString();
    for (const q of YT_QUERIES) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=8&publishedAfter=${encodeURIComponent(after)}&q=${encodeURIComponent(q)}&key=${o.youtubeApiKey}`;
      const r = await fetchWithRetry(o.fetchImpl, url, { timeoutMs, retries, signal: o.signal, sleep });
      attempts += r.attempts;
      if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
      const data = JSON.parse(r.body) as { items?: { id?: { videoId?: string }; snippet?: { title?: string; description?: string; publishedAt?: string; channelId?: string; channelTitle?: string } }[] };
      for (const it of data.items ?? []) {
        if (!it.id?.videoId || !it.snippet?.title) continue;
        items.push({
          title: stripHtml(it.snippet.title),
          link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
          publishedAt: it.snippet.publishedAt ?? null,
          summary: stripHtml(it.snippet.description ?? ''),
          id: it.id.videoId,
          groupHint: `yt:${it.snippet.channelId ?? 'desconocido'}`,
          publisherHint: it.snippet.channelTitle ? `Canal ${it.snippet.channelTitle}` : undefined,
        });
      }
    }
    return { items, status: 200, attempts };
  }
  const u = new URL(src.url);
  if (!robotsCache.has(u.host)) {
    try {
      const r = await fetchWithRetry(o.fetchImpl, `${u.protocol}//${u.host}/robots.txt`, { timeoutMs, retries: 1, signal: o.signal, sleep });
      robotsCache.set(u.host, r.status === 200 ? r.body : r.status === 404 ? '' : null);
    } catch (e) {
      if (e instanceof Cancelled) throw e;
      robotsCache.set(u.host, null);
    }
  }
  const robots = robotsCache.get(u.host);
  if (robots === null) throw new Error('No se pudo leer robots.txt; no se rastrea por prudencia');
  if (!robotsAllows(robots ?? '', u.pathname)) throw new Error('robots.txt no permite leer esta ruta');
  const r = await fetchWithRetry(o.fetchImpl, src.url, { timeoutMs, retries, signal: o.signal, sleep });
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
  const items = src.kind === 'page_watch' ? extractPageNews(r.body, src.homepage, src.id) : parseFeed(r.body, 60);
  return { items, status: r.status, attempts: r.attempts };
}

/** Lee aportes de la comunidad (issues con la etiqueta «hallazgo») y los deja en cola; nunca publica. */
export async function ingestSubmissions(o: PipelineOptions, existing: Submission[], nowIso: string, sleep: (ms: number) => Promise<void>): Promise<Submission[]> {
  if (!o.github) return [];
  const r = await fetchWithRetry(
    (url, init) => o.fetchImpl(url, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${o.github!.token}`, Accept: 'application/vnd.github+json' } }),
    `https://api.github.com/repos/${o.github.repo}/issues?labels=hallazgo&state=open&per_page=30`,
    { timeoutMs: 15000, retries: 1, signal: o.signal, sleep },
  );
  if (r.status !== 200) throw new Error(`GitHub issues HTTP ${r.status}`);
  const issues = JSON.parse(r.body) as { number: number; body: string | null; user?: { login?: string }; pull_request?: unknown }[];
  const out: Submission[] = [];
  const perAuthor = new Map<string, number>();
  for (const is of issues) {
    if (is.pull_request) continue;
    const ref = `#${is.number}`;
    if (existing.some((s) => s.reference === ref)) continue;
    out.push(parseSubmission(is.body ?? '', ref, is.user?.login ?? 'anonimo', nowIso, existing.concat(out), perAuthor));
  }
  return out;
}

const field = (body: string, label: string) => body.match(new RegExp(`###\\s*${label}[^\\n]*\\n+([\\s\\S]*?)(?=\\n###|$)`, 'i'))?.[1].trim() ?? '';

export function parseSubmission(body: string, reference: string, author: string, nowIso: string, existing: Submission[], perAuthor = new Map<string, number>()): Submission {
  const url = field(body, 'Enlace').split(/\s/)[0] ?? '';
  const categoryRaw = field(body, 'Categoría').toLowerCase();
  const map: Record<string, Submission['category']> = { glitch: 'glitch', dinero: 'dinero', truco: 'truco', arma: 'arma', vehículo: 'vehiculo', vehiculo: 'vehiculo', coleccionable: 'coleccionable', ropa: 'ropa_joyeria', joyería: 'ropa_joyeria', misión: 'mision', parche: 'parche' };
  const category = Object.entries(map).find(([k]) => categoryRaw.includes(k))?.[1] ?? 'otro';
  const description = field(body, 'Descripción').slice(0, 2000);
  const platform = field(body, 'Plataforma').slice(0, 60) || 'no indicada';
  const count = (perAuthor.get(author) ?? 0) + 1;
  perAuthor.set(author, count);
  let moderation: Submission['moderation'] = 'en_cola';
  let reason = 'Pendiente de revisión humana.';
  let valid = false;
  try {
    const u = new URL(url);
    valid = u.protocol === 'https:' && url.length < 500;
  } catch {
    valid = false;
  }
  const links = (body.match(/https?:\/\//g) ?? []).length;
  if (!valid) {
    moderation = 'rechazado';
    reason = 'Enlace ausente, no https o inválido.';
  } else if (links > 5 || count > 5 || /(casino|crypto|free v-?bucks|gift ?card|telegram\.me)/i.test(body)) {
    moderation = 'spam';
    reason = 'Marcado como posible spam (demasiados enlaces, demasiados envíos o palabras de spam).';
  } else if (existing.some((s) => s.url && canonicalUrl(s.url) === canonicalUrl(url))) {
    moderation = 'duplicado';
    reason = 'El enlace ya fue enviado.';
  }
  return { id: `sub-${reference.replace('#', '')}`, url: valid ? url : 'https://invalid.example/', platform, category, description, receivedAt: nowIso, channel: 'github_issue', reference, moderation, findingId: null, reason };
}

export async function runPipeline(o: PipelineOptions): Promise<PipelineResult> {
  const now = o.now ?? (() => new Date());
  const startedAt = now().toISOString();
  const runId = `run-${startedAt.replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-')}`;
  const sleep = o.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const budget = new Budget({ ...DEFAULT_BUDGET, ...o.budget });
  const errors: string[] = [];
  const results: RunSourceResult[] = [];
  const robotsCache = new Map<string, string | null>();
  let findings = o.state.findings.map((f) => ({ ...f }));
  let patches = [...o.state.patches];
  let submissions = [...o.state.submissions];
  const changes: Change[] = [];
  let cancelled = false;
  let itemsSeen = 0;
  let patchesDetected = 0;
  const runCtrl = new AbortController();
  const onExternal = () => runCtrl.abort();
  o.signal?.addEventListener('abort', onExternal, { once: true });
  const runTimer = setTimeout(() => runCtrl.abort(), budget.cfg.runTimeoutMs);
  const opts = { ...o, signal: runCtrl.signal };

  try {
    for (const src of o.sources) {
      if (!src.enabled) continue;
      if (runCtrl.signal.aborted) {
        cancelled = true;
        break;
      }
      const t0 = Date.now();
      const res: RunSourceResult = { sourceId: src.id, ok: false, httpStatus: null, items: 0, relevant: 0, newFindings: 0, updatedFindings: 0, skipped: 0, attempts: 0, durationMs: 0, error: null };
      try {
        const d = await discover(src, opts, budget, sleep, robotsCache);
        res.httpStatus = d.status;
        res.attempts = d.attempts;
        const items = d.items.slice(0, budget.cfg.maxItemsPerSource);
        res.items = items.length;
        itemsSeen += items.length;
        for (const item of items) {
          if (src.tier !== 'oficial' && !isRelevant(item.title, item.summary)) {
            res.skipped++;
            continue;
          }
          if (src.tier === 'oficial' && !/gta|grand theft auto|leonida|vice city|jason|lucia/i.test(`${item.title} ${item.summary}`)) {
            res.skipped++;
            continue;
          }
          res.relevant++;
          const ex = await extract(item.title, item.summary, item.link, src.aiProcessingAllowed && o.ai ? { ...o.ai, budget } : null, errors);
          if (!ex) {
            res.skipped++;
            continue;
          }
          const before = findings.length;
          const r = ingest(findings, item, src, ex, runId, now().toISOString());
          findings = r.findings;
          changes.push(...r.changes);
          if (findings.length > before) res.newFindings++;
          else if (r.changes.length) res.updatedFindings++;
          // Solo un parche anunciado por una fuente oficial activa la revalidación automática.
          if (ex.isPatch && src.tier === 'oficial') {
            const id = `patch-${slugify(ex.patchVersion ?? item.title, 40)}`;
            if (!patches.some((p) => p.id === id)) {
              const patch: Patch = { id, version: ex.patchVersion, title: item.title, platforms: ex.platforms, publishedAt: item.publishedAt ?? now().toISOString(), sourceUrl: item.link, official: true, affects: [], detectedAt: now().toISOString(), appliedToFindings: false };
              patches.push(patch);
              patchesDetected++;
            }
          }
        }
        res.ok = true;
      } catch (e) {
        if (e instanceof Cancelled) {
          cancelled = true;
          res.error = 'Cancelado';
        } else res.error = redact((e as Error).message, o.secrets ?? []).slice(0, 200); // ocultar ANTES de recortar
        errors.push(`${src.id}: ${res.error}`);
      }
      res.durationMs = Date.now() - t0;
      results.push(res);
      if (cancelled) break;
    }

    // Aportes de la comunidad → cola de revisión
    if (!cancelled && o.github) {
      try {
        const subs = await ingestSubmissions(opts, submissions, now().toISOString(), sleep);
        submissions = [...submissions, ...subs];
      } catch (e) {
        errors.push(`aportes: ${redact((e as Error).message, o.secrets ?? []).slice(0, 200)}`);
      }
    }

    // Version-watch: parches oficiales aún no aplicados (incluye los añadidos a mano en intel/patches.json)
    for (const p of patches.filter((x) => x.official && !x.appliedToFindings)) {
      const r = applyPatch(findings, p, runId, now().toISOString());
      findings = r.findings;
      changes.push(...r.changes);
      patches = patches.map((x) => (x.id === p.id ? { ...x, appliedToFindings: true } : x));
    }
    // Evidencias registradas por personas
    const lp = latestPatchAt(patches);
    findings = findings.map((f) => (f.evidence.length ? reconcileEvidence(f, lp, runId, now().toISOString()) : f));
  } finally {
    clearTimeout(runTimer);
    o.signal?.removeEventListener('abort', onExternal);
  }

  const finishedAt = now().toISOString();
  const proposal = buildProposal(runId, finishedAt, changes);
  const okSources = results.filter((r) => r.ok).length;
  const newCount = changes.filter((c) => c.kind === 'nuevo').length;
  const status: RunReport['status'] = cancelled
    ? 'cancelado'
    : okSources === 0 && results.length > 0
      ? 'error'
      : results.some((r) => !r.ok)
        ? 'parcial'
        : changes.length === 0
          ? 'sin_novedades'
          : 'ok';
  const secrets = o.secrets ?? [];
  const report: RunReport = {
    id: runId,
    startedAt,
    finishedAt,
    trigger: o.trigger,
    environment: o.environment,
    status,
    classifierMode: o.ai ? 'ia' : 'heuristico',
    sources: results.map((r) => ({ ...r, error: r.error ? redact(r.error, secrets) : null })),
    totals: {
      itemsSeen,
      relevant: results.reduce((a, r) => a + r.relevant, 0),
      newFindings: newCount,
      updatedFindings: changes.filter((c) => c.kind === 'fuente_agregada').length,
      statusChanges: changes.filter((c) => c.kind === 'estado' || c.kind === 'revalidacion').length,
      patchesDetected,
      submissionsIngested: submissions.length - o.state.submissions.length,
    },
    budget: budget.snapshot(),
    errors: errors.map((e) => redact(e, secrets)).slice(0, 50),
    proposalId: proposal?.id ?? null,
    nextScheduledHintUtc: ['11:17', '23:17'],
  };
  return { state: { findings, patches, submissions }, report, changes, proposal };
}
