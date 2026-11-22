import { z } from 'zod';
import { factSchema, independentGroups, statusSchema, type Source } from './schema';

// Esquemas de los conjuntos de la fase 2: trucos, ajustes de consola y reglas de equipamiento.
// Solo se usan en pruebas y build (el navegador importa únicamente los tipos).

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export const CHEAT_CATEGORIES = ['jugador', 'combate', 'vehiculo', 'entorno', 'filtro'] as const;
export const CONSOLE_PLATFORMS = ['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'] as const;

const entryMethod = z.object({
  label: z.string(),
  hold: z.string().min(2),
  press: z.string().min(2),
  steps: z.array(z.string().min(3)).min(1),
  status: statusSchema,
  sources: z.array(z.string()).min(1),
  note: z.string(),
});

export const cheatSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(2),
    category: z.enum(CHEAT_CATEGORIES),
    effect: z.string().min(5),
    sequence: z.array(z.enum(DIRECTIONS)).min(4).max(16).nullable(),
    /** contrastado/reportado = la secuencia; desconocida = ninguna fuente la publica todavía. */
    sequenceStatus: z.enum(['contrastado', 'reportado', 'desconocida']),
    sequenceSources: z.array(z.string()),
    unlock: z.string().min(5),
    unlockStatus: statusSchema,
    unlockSources: z.array(z.string()).min(1),
    note: z.string(),
  })
  .superRefine((c, ctx) => {
    if (c.sequenceStatus === 'desconocida' && (c.sequence !== null || c.sequenceSources.length))
      ctx.addIssue({ code: 'custom', path: ['sequence'], message: 'Una secuencia desconocida no lleva pasos ni fuentes' });
    if (c.sequenceStatus !== 'desconocida' && (!c.sequence || !c.sequenceSources.length))
      ctx.addIssue({ code: 'custom', path: ['sequence'], message: 'Una secuencia publicada necesita pasos y al menos una fuente' });
  });

export const cheatsFileSchema = z.object({
  verifiedAt: isoDate,
  patch: z.string().min(3),
  entry: z.object({ ps5: entryMethod, xbox: entryMethod }),
  rules: z.array(factSchema).min(1),
  cheats: z.array(cheatSchema).min(1),
});

const consoleItem = z.object({
  label: z.string().min(2),
  value: z.string().min(5),
  platforms: z.array(z.enum(CONSOLE_PLATFORMS)).min(1),
  path: z.string().nullable(),
  status: statusSchema,
  sources: z.array(z.string()).min(1),
});
export const consoleFileSchema = z.object({
  verifiedAt: isoDate,
  patch: z.string().min(3),
  platforms: z.array(z.object({ id: z.enum(CONSOLE_PLATFORMS), name: z.string() })).length(4),
  sections: z.array(z.object({ id: z.string(), title: z.string(), scope: z.enum(['juego', 'consola']), items: z.array(consoleItem).min(1) })).min(1),
});

export const SLOT_KINDS = ['sidearm', 'longarm', 'melee'] as const;
export const loadoutFileSchema = z.object({
  verifiedAt: isoDate,
  patch: z.string().min(3),
  slots: z.object({ sidearm: z.number().int().positive(), longarm: z.number().int().positive(), melee: z.number().int().positive() }),
  rules: z.array(factSchema).min(1),
  attachments: z.array(z.object({ id: z.string(), label: z.string(), where: z.enum(['loadout', 'ammunation']), status: statusSchema, sources: z.array(z.string()).min(1) })),
  compatibilityNote: z.string(),
  classes: z.object({ sidearm: z.array(z.string()), longarm: z.array(z.string()), melee: z.array(z.string()), unclassified: z.array(z.string()) }),
  classNote: z.string(),
});

export type Cheat = z.infer<typeof cheatSchema>;
export type CheatsFile = z.infer<typeof cheatsFileSchema>;
export type ConsoleFile = z.infer<typeof consoleFileSchema>;
export type ConsolePlatform = (typeof CONSOLE_PLATFORMS)[number];
export type LoadoutFile = z.infer<typeof loadoutFileSchema>;
export type SlotKind = (typeof SLOT_KINDS)[number];
export type Direction = (typeof DIRECTIONS)[number];

/** Integridad: fuentes conocidas y «contrastado» con ≥2 grupos editoriales independientes. */
export function validateFase2(cheats: unknown, consoleData: unknown, loadout: unknown, sources: Source[]): string[] {
  const errors: string[] = [];
  const known = new Set(sources.map((s) => s.id));
  const check = (where: string, status: string, ids: string[]) => {
    for (const id of ids) if (!known.has(id)) errors.push(`${where}: fuente desconocida «${id}»`);
    if (status === 'contrastado' && independentGroups(ids, sources) < 2) errors.push(`${where}: contrastado con menos de dos fuentes independientes`);
    if (status === 'oficial' && !ids.some((id) => sources.find((s) => s.id === id)?.type === 'oficial')) errors.push(`${where}: oficial sin fuente oficial`);
  };
  const c = cheatsFileSchema.safeParse(cheats);
  if (!c.success) errors.push(...c.error.issues.slice(0, 20).map((i) => `trucos ${i.path.join('.')}: ${i.message}`));
  else {
    const ids = new Set<string>();
    for (const m of [c.data.entry.ps5, c.data.entry.xbox]) check(`trucos/entrada ${m.label}`, m.status, m.sources);
    for (const r of c.data.rules) check(`trucos/regla ${r.label}`, r.status, r.sources);
    for (const ch of c.data.cheats) {
      if (ids.has(ch.id)) errors.push(`truco ${ch.id}: id duplicado`);
      ids.add(ch.id);
      if (ch.sequenceStatus !== 'desconocida') check(`truco ${ch.id} (secuencia)`, ch.sequenceStatus, ch.sequenceSources);
      check(`truco ${ch.id} (desbloqueo)`, ch.unlockStatus, ch.unlockSources);
    }
  }
  const k = consoleFileSchema.safeParse(consoleData);
  if (!k.success) errors.push(...k.error.issues.slice(0, 20).map((i) => `consola ${i.path.join('.')}: ${i.message}`));
  else for (const s of k.data.sections) for (const it of s.items) check(`consola ${s.id}/${it.label}`, it.status, it.sources);
  const l = loadoutFileSchema.safeParse(loadout);
  if (!l.success) errors.push(...l.error.issues.slice(0, 20).map((i) => `equipamiento ${i.path.join('.')}: ${i.message}`));
  else {
    for (const r of l.data.rules) check(`equipamiento/regla ${r.label}`, r.status, r.sources);
    for (const a of l.data.attachments) check(`equipamiento/accesorio ${a.id}`, a.status, a.sources);
  }
  return errors;
}
