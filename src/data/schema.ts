import { z } from 'zod';

export const STATUSES = ['oficial', 'comprobado', 'contrastado', 'reportado', 'pendiente', 'obsoleto'] as const;
export const CATEGORIES = ['lugares', 'personajes', 'dinero', 'armas', 'vehiculos', 'negocios', 'rutas', 'coleccionables'] as const;
export const REGIONS = ['leonida', 'vice-city', 'leonida-keys', 'grassrivers', 'port-gellhorn', 'ambrosia', 'mount-kalaga'] as const;
export const MODES = ['historia', 'online', 'sin-confirmar'] as const;
export const EDITIONS = ['base', 'ultimate', 'vintage'] as const;
export const PRECISIONS = ['region', 'zona', 'barrio', 'exacta'] as const;

export const statusSchema = z.enum(STATUSES);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha en formato AAAA-MM-DD');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug en minúsculas con guiones');

export const sourceSchema = z.object({
  id: z.string().min(2),
  title: z.string().min(3),
  url: z.string().url().refine((u) => u.startsWith('https://'), 'La URL debe usar https'),
  publisher: z.string().min(2),
  author: z.string().nullable(),
  publishedAt: isoDate.nullable(),
  accessedAt: isoDate,
  type: z.enum(['oficial', 'guia', 'comunidad', 'partida']),
  note: z.string(),
  /** Grupo editorial: fuentes del mismo grupo (p. ej. un medio que reutiliza datos de otro) cuentan como una sola. */
  group: z.string().optional(),
});

export const factSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  status: statusSchema,
  sources: z.array(z.string()).min(1, 'Cada dato necesita al menos una fuente'),
});

export const mapPositionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  precision: z.enum(PRECISIONS),
  basis: z.string().min(10, 'Explica en qué se basa la posición'),
});

export const moneySchema = z.object({
  grossMin: z.number().nonnegative(),
  grossMax: z.number().nonnegative(),
  costs: z.number().nonnegative(),
  minutesPerRun: z.number().positive().nullable(),
  cooldownMinutes: z.number().nonnegative().nullable(),
  estimate: z.boolean(),
  note: z.string(),
});

export const TRACKERS = ['ninguno', 'estandar', 'avanzado', 'militar'] as const;
/** Datos comparables de un vehículo. Los precios son del juego (registro y venta) y llevan su propia evidencia. */
export const vehicleSchema = z.object({
  class: z.string().min(2),
  manufacturer: z.string().nullable(),
  registration: z.number().int().positive().nullable(),
  sellValue: z.number().int().positive().nullable(),
  tracker: z.enum(TRACKERS).nullable(),
  priceStatus: statusSchema.nullable(),
  priceSources: z.array(z.string()),
  acquisition: z.string().min(3),
});

export const entrySchema = z
  .object({
    id: z.string().regex(/^[a-z]{2,3}-[a-z0-9-]+$/),
    slug,
    name: z.string().min(2),
    category: z.enum(CATEGORIES),
    region: z.enum(REGIONS),
    subzone: z.string().nullable(),
    summary: z.string().min(10).max(220),
    description: z.string().min(20),
    howTo: z.array(z.string().min(3)),
    requirements: z.array(z.string()),
    chapter: z.string().nullable(),
    mode: z.enum(MODES),
    platform: z.array(z.string()).min(1),
    patch: z.string().min(3),
    reward: z
      .object({
        label: z.string(),
        amount: z.object({ min: z.number(), max: z.number() }).nullable().optional(),
        note: z.string(),
      })
      .nullable(),
    time: z.string().nullable(),
    risks: z.array(z.string()),
    sources: z.array(z.string()).min(1, 'Cada ficha necesita al menos una fuente'),
    verifiedAt: isoDate,
    status: statusSchema,
    images: z.array(z.string()),
    mapPosition: mapPositionSchema.nullable(),
    spoilerLevel: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    edition: z.enum(EDITIONS),
    tags: z.array(z.string()),
    related: z.array(z.string()),
    money: moneySchema.nullable(),
    facts: z.array(factSchema),
    /** Colección a la que pertenece un coleccionable (id de otra ficha de la categoría «coleccionables»). */
    collection: z.string().optional(),
    /** Seguimiento de una colección: total conocido (o null si no está publicado) y su evidencia. */
    tracking: z
      .object({ total: z.number().int().positive().nullable(), totalStatus: statusSchema, unit: z.string().min(2) })
      .optional(),
    vehicle: vehicleSchema.optional(),
  })
  .superRefine((e, ctx) => {
    if (e.money && e.money.grossMax < e.money.grossMin) {
      ctx.addIssue({ code: 'custom', path: ['money', 'grossMax'], message: 'grossMax no puede ser menor que grossMin' });
    }
    if (e.tracking && e.category !== 'coleccionables') {
      ctx.addIssue({ code: 'custom', path: ['tracking'], message: 'Solo las colecciones llevan seguimiento' });
    }
    if (e.vehicle && e.category !== 'vehiculos') {
      ctx.addIssue({ code: 'custom', path: ['vehicle'], message: 'Solo los vehículos llevan datos de vehículo' });
    }
    if (e.vehicle && (e.vehicle.registration !== null || e.vehicle.sellValue !== null) && (!e.vehicle.priceStatus || !e.vehicle.priceSources.length)) {
      ctx.addIssue({ code: 'custom', path: ['vehicle', 'priceStatus'], message: 'Un precio publicado necesita estado y fuentes' });
    }
    if (e.tracking && e.tracking.total === null && e.tracking.totalStatus !== 'pendiente') {
      ctx.addIssue({ code: 'custom', path: ['tracking', 'totalStatus'], message: 'Un total desconocido debe marcarse como pendiente' });
    }
    if (e.mapPosition?.precision === 'exacta' && !['oficial', 'comprobado'].includes(e.status)) {
      ctx.addIssue({
        code: 'custom',
        path: ['mapPosition', 'precision'],
        message: 'Una posición «exacta» solo se permite con evidencia oficial o comprobada',
      });
    }
  });

export const changelogSchema = z.array(
  z.object({ date: isoDate, version: z.string(), title: z.string(), items: z.array(z.string()).min(1) }),
);

export const mediaItemSchema = z.object({
  id: z.string(),
  files: z.record(z.string(), z.object({ src: z.string(), width: z.number(), height: z.number(), bytes: z.number() })),
  captionEs: z.string(),
  officialAltEn: z.string().nullable(),
  sourceUrl: z.string().url(),
  sourcePage: z.string().url(),
  originalSize: z.string(),
  copyright: z.string(),
  license: z.string(),
  treatment: z.string(),
  kind: z.enum(['official-screenshot', 'official-map']),
  sinMarcaDeAgua: z.literal(true),
});
export const mediaManifestSchema = z.object({ generated: z.string(), items: z.array(mediaItemSchema) });

export type Status = z.infer<typeof statusSchema>;
export type Category = (typeof CATEGORIES)[number];
export type RegionId = (typeof REGIONS)[number];
export type Edition = (typeof EDITIONS)[number];
export type Source = z.infer<typeof sourceSchema>;
export type Fact = z.infer<typeof factSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type VehicleData = z.infer<typeof vehicleSchema>;
export type MediaItem = z.infer<typeof mediaItemSchema>;
export type Changelog = z.infer<typeof changelogSchema>;

/** Número de grupos editoriales independientes entre las fuentes citadas. */
export function independentGroups(ids: string[], sources: Pick<Source, 'id' | 'group'>[]): number {
  return new Set(ids.map((id) => sources.find((s) => s.id === id)?.group ?? id)).size;
}

/** Valida el conjunto completo: esquema + integridad referencial (fuentes, imágenes, relacionados, slugs únicos). */
export function validateDataset(
  rawEntries: unknown,
  sources: Source[],
  mediaIds: Set<string>,
): { ok: true; entries: Entry[] } | { ok: false; errors: string[] } {
  const parsed = z.array(entrySchema).safeParse(rawEntries);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.slice(0, 50).map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`),
    };
  }
  const entries = parsed.data;
  const errors: string[] = [];
  const srcIds = new Set(sources.map((s) => s.id));
  const ids = new Set<string>();
  const routes = new Set<string>();
  for (const e of entries) {
    if (ids.has(e.id)) errors.push(`${e.id}: id duplicado`);
    ids.add(e.id);
    const r = `${e.category}/${e.slug}`;
    if (routes.has(r)) errors.push(`${e.id}: ruta duplicada ${r}`);
    routes.add(r);
  }
  for (const e of entries) {
    for (const s of e.sources) if (!srcIds.has(s)) errors.push(`${e.id}: fuente desconocida «${s}»`);
    for (const f of e.facts) for (const s of f.sources) if (!srcIds.has(s)) errors.push(`${e.id}: dato «${f.label}» cita fuente desconocida «${s}»`);
    for (const f of e.facts) {
      if (f.status === 'contrastado' && independentGroups(f.sources, sources) < 2)
        errors.push(`${e.id}: dato «${f.label}» marcado como contrastado con menos de dos fuentes independientes`);
    }
    for (const img of e.images) if (!mediaIds.has(img)) errors.push(`${e.id}: imagen desconocida «${img}»`);
    for (const rel of e.related) if (!ids.has(rel)) errors.push(`${e.id}: relacionado desconocido «${rel}»`);
    if (e.vehicle) {
      for (const s of e.vehicle.priceSources) if (!srcIds.has(s)) errors.push(`${e.id}: precio cita fuente desconocida «${s}»`);
      if (e.vehicle.priceStatus === 'contrastado' && independentGroups(e.vehicle.priceSources, sources) < 2)
        errors.push(`${e.id}: precio marcado como contrastado con menos de dos fuentes independientes`);
    }
    if (e.collection && !entries.some((x) => x.id === e.collection && x.category === 'coleccionables'))
      errors.push(`${e.id}: colección desconocida «${e.collection}»`);
    if (e.status === 'oficial' && !e.sources.some((s) => sources.find((x) => x.id === s)?.type === 'oficial'))
      errors.push(`${e.id}: marcada como oficial sin fuente oficial`);
  }
  return errors.length ? { ok: false, errors } : { ok: true, entries };
}
