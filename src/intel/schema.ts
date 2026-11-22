// Modelo de datos de ATLAS INTELLIGENCE (validado con Zod en el pipeline y en las pruebas;
// el navegador solo importa los tipos).
import { z } from 'zod';

export const PLATFORMS = ['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'] as const;
export const FINDING_STATUSES = [
  'nuevo_sin_verificar',
  'reportado',
  'contrastado',
  'comprobado_en_version',
  'pendiente_revalidacion',
  'parcheado',
  'refutado',
] as const;
export const FINDING_CATEGORIES = [
  'glitch',
  'dinero',
  'truco',
  'arma',
  'vehiculo',
  'coleccionable',
  'ropa_joyeria',
  'mision',
  'parche',
  'noticia',
  'configuracion',
  'ubicacion',
  'personaje',
  'otro',
] as const;
export const SOURCE_KINDS = ['rss', 'atom', 'youtube_rss', 'page_watch', 'api', 'manual'] as const;
export const SOURCE_TIERS = ['oficial', 'guia_tercero', 'medio', 'comunidad', 'creador_video'] as const;

const isoDateTime = z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Fecha ISO inválida');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/);

export const intelSourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  url: z.string().url().refine((u) => u.startsWith('https://'), 'https requerido'),
  homepage: z.string().url(),
  kind: z.enum(SOURCE_KINDS),
  tier: z.enum(SOURCE_TIERS),
  language: z.string().min(2),
  categories: z.array(z.enum(FINDING_CATEGORIES)).min(1),
  /** Fuentes que comparten dueño/redacción se agrupan: cuentan como una sola para «contrastado». */
  independenceGroup: z.string().min(2),
  frequencyHours: z.number().int().min(6).max(168),
  reliability: z.number().min(0).max(1),
  enabled: z.boolean(),
  /** Falso si el robots.txt del sitio prohíbe agentes de IA: solo se leen metadatos del feed. */
  aiProcessingAllowed: z.boolean(),
  rights: z.string().min(5),
  disabledReason: z.string().optional(),
  checkedRobotsAt: isoDate.optional(),
});

export const sourceRefSchema = z.object({
  url: z.string().url(),
  canonicalUrl: z.string().url(),
  sourceId: z.string(),
  publisher: z.string(),
  title: z.string(),
  publishedAt: isoDateTime.nullable(),
  accessedAt: isoDateTime,
  tier: z.enum(SOURCE_TIERS),
  independenceGroup: z.string(),
  /** ID de contenido original (p. ej. video de YouTube/TikTok) para no contar republicaciones dos veces. */
  originId: z.string().nullable(),
  contentHash: z.string(),
});

export const evidenceSchema = z.object({
  id: z.string(),
  type: z.enum(['prueba_en_juego', 'nota_oficial', 'video_tercero', 'articulo', 'captura_propia', 'refutacion']),
  url: z.string().url().nullable(),
  platform: z.enum(PLATFORMS).nullable(),
  gameVersion: z.string().nullable(),
  /** Fecha real de la prueba (no la de publicación del artículo/video). */
  testedAt: isoDateTime.nullable(),
  result: z.enum(['funciona', 'no_funciona', 'parcial', 'no_aplica']),
  recordedBy: z.string(),
  recordedAt: isoDateTime,
  notes: z.string(),
});

export const claimSchema = z.object({
  text: z.string().min(3),
  /** Cita literal del texto de la fuente que respalda la afirmación (obligatoria). */
  quote: z.string().min(3),
  sourceUrl: z.string().url(),
  amount: z.number().nullable(),
  unit: z.string().nullable(),
});

export const historyEventSchema = z.object({
  at: isoDateTime,
  type: z.enum(['creado', 'fuente_agregada', 'estado', 'evidencia', 'revalidacion', 'migrado', 'nota']),
  from: z.string().nullable(),
  to: z.string().nullable(),
  platform: z.enum(PLATFORMS).nullable(),
  reason: z.string(),
  runId: z.string().nullable(),
});

export const platformStatusSchema = z.partialRecord(z.enum(PLATFORMS), z.enum(FINDING_STATUSES));

export const findingSchema = z.object({
  id: z.string().regex(/^fnd-[a-z0-9-]+$/),
  dedupKey: z.string(),
  title: z.string().min(3),
  summary: z.string(),
  category: z.enum(FINDING_CATEGORIES),
  tags: z.array(z.string()),
  mode: z.enum(['historia', 'online', 'sin_confirmar']),
  platforms: z.array(z.enum(PLATFORMS)),
  gameVersion: z.string().nullable(),
  /** Estado global = el más conservador de los estados por plataforma. */
  status: z.enum(FINDING_STATUSES),
  platformStatus: platformStatusSchema,
  firstDiscoveredAt: isoDateTime,
  sourcePublishedAt: isoDateTime.nullable(),
  lastSourceCheckedAt: isoDateTime,
  lastInGameTestAt: isoDateTime.nullable(),
  lastValidatedAt: isoDateTime.nullable(),
  nextCheckAt: isoDateTime.nullable(),
  claims: z.array(claimSchema),
  requirements: z.array(z.string()),
  steps: z.array(z.string()),
  entryIds: z.array(z.string()),
  risks: z.array(z.string()),
  sources: z.array(sourceRefSchema).min(1),
  evidence: z.array(evidenceSchema),
  history: z.array(historyEventSchema).min(1),
  classifier: z.enum(['heuristico', 'ia', 'humano', 'migracion']),
  flags: z.array(z.string()),
  rights: z.string(),
});

export const patchSchema = z.object({
  id: z.string(),
  version: z.string().nullable(),
  title: z.string(),
  platforms: z.array(z.enum(PLATFORMS)),
  publishedAt: isoDateTime,
  sourceUrl: z.string().url(),
  official: z.boolean(),
  /** Categorías/etiquetas posiblemente afectadas; vacío = afecta a todo lo «revalidable». */
  affects: z.array(z.string()),
  detectedAt: isoDateTime,
  appliedToFindings: z.boolean(),
});

export const runSourceResultSchema = z.object({
  sourceId: z.string(),
  ok: z.boolean(),
  httpStatus: z.number().nullable(),
  items: z.number(),
  relevant: z.number(),
  newFindings: z.number(),
  updatedFindings: z.number(),
  skipped: z.number(),
  attempts: z.number(),
  durationMs: z.number(),
  error: z.string().nullable(),
});

export const runReportSchema = z.object({
  id: z.string(),
  startedAt: isoDateTime,
  finishedAt: isoDateTime,
  trigger: z.enum(['schedule', 'workflow_dispatch', 'manual_local', 'test']),
  environment: z.string(),
  status: z.enum(['ok', 'parcial', 'error', 'cancelado', 'sin_novedades']),
  classifierMode: z.enum(['heuristico', 'ia']),
  sources: z.array(runSourceResultSchema),
  totals: z.object({
    itemsSeen: z.number(),
    relevant: z.number(),
    newFindings: z.number(),
    updatedFindings: z.number(),
    statusChanges: z.number(),
    patchesDetected: z.number(),
    submissionsIngested: z.number(),
  }),
  budget: z.object({
    aiCalls: z.number(),
    aiCallsLimit: z.number(),
    inputTokens: z.number(),
    outputTokens: z.number(),
    estimatedCostUsd: z.number(),
    costLimitUsd: z.number(),
    stoppedByBudget: z.boolean(),
  }),
  errors: z.array(z.string()),
  proposalId: z.string().nullable(),
  nextScheduledHintUtc: z.array(z.string()),
});

export const reviewProposalSchema = z.object({
  id: z.string(),
  runId: z.string(),
  createdAt: isoDateTime,
  title: z.string(),
  requiresHumanReview: z.boolean(),
  changes: z.array(
    z.object({
      findingId: z.string(),
      kind: z.enum(['nuevo', 'fuente_agregada', 'estado', 'revalidacion']),
      before: z.string().nullable(),
      after: z.string().nullable(),
      sensitive: z.boolean(),
      reason: z.string(),
      sources: z.array(z.string()),
    }),
  ),
  risks: z.array(z.string()),
  tests: z.array(z.string()),
});

export const submissionSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  platform: z.string(),
  category: z.enum(FINDING_CATEGORIES),
  description: z.string().max(2000),
  receivedAt: isoDateTime,
  channel: z.enum(['github_issue', 'manual']),
  reference: z.string().nullable(),
  moderation: z.enum(['en_cola', 'aceptado', 'rechazado', 'duplicado', 'spam']),
  findingId: z.string().nullable(),
  reason: z.string(),
});

export type Platform = (typeof PLATFORMS)[number];
export type FindingStatus = (typeof FINDING_STATUSES)[number];
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];
export type IntelSource = z.infer<typeof intelSourceSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type HistoryEvent = z.infer<typeof historyEventSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Patch = z.infer<typeof patchSchema>;
export type RunReport = z.infer<typeof runReportSchema>;
export type RunSourceResult = z.infer<typeof runSourceResultSchema>;
export type ReviewProposal = z.infer<typeof reviewProposalSchema>;
export type Submission = z.infer<typeof submissionSchema>;
