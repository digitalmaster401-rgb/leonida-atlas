// Persistencia local del progreso con versión de esquema, migración y validación manual
// (sin dependencias para que la app cargue rápido en móviles).

export const STORAGE_KEY = 'leonida-atlas:progress';
export const BACKUP_KEY = 'leonida-atlas:progress-backup';
export const SCHEMA_VERSION = 5;
/** Copia del valor que no se pudo leer (nunca se borra en silencio el progreso de una persona). */
export const CORRUPT_KEY = 'leonida-atlas:progress-unreadable';
const MAX_IDS = 2000;
const MAX_NOTE = 5000;
const MAX_LOADOUTS = 30;
export const MAX_ROUTES = 30;
export const MAX_STOPS = 40;
export const MAX_MARKERS = 200;
export const MAX_GOALS = 50;
export const MAX_ACTIVITY = 60;
export const ACCENTS = ['magenta', 'cian', 'lima', 'violeta'] as const;
export type Accent = (typeof ACCENTS)[number];
export const MARKER_ICONS = ['estrella', 'bandera', 'camara', 'dinero', 'alerta'] as const;
export type MarkerIcon = (typeof MARKER_ICONS)[number];
export const ACTIVITY_TYPES = ['encontrado', 'favorito', 'visitado', 'ruta', 'garaje', 'marcador', 'objetivo'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Marcador personal sobre el póster (v5): posición elegida por la persona, privada y nunca presentada como dato del juego. */
export interface CustomMarker {
  id: string;
  name: string;
  note: string;
  /** Coordenadas normalizadas 0–1 sobre el póster oficial. */
  x: number;
  y: number;
  icon: MarkerIcon;
  createdAt: string;
  updatedAt: string;
}
/** Objetivo personal escrito por la persona (v5). */
export interface Goal {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  doneAt: string | null;
}
/** Evento de actividad registrado en este dispositivo (v5). */
export interface ActivityEvent {
  type: ActivityType;
  ref: string;
  at: string;
}

export interface Note {
  text: string;
  updatedAt: string;
}
/** Estados de seguimiento además de «encontrado/completado» (que vive en `completed`). */
export const TRACK_STATES = ['pendiente', 'revisar', 'no_disponible'] as const;
export type TrackState = (typeof TRACK_STATES)[number];
export const PLATFORMS = ['ps5', 'ps5_pro', 'xbox_series_x', 'xbox_series_s'] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABEL: Record<Platform, string> = { ps5: 'PS5', ps5_pro: 'PS5 Pro', xbox_series_x: 'Xbox Series X', xbox_series_s: 'Xbox Series S' };

export interface EntryRecord {
  state?: TrackState;
  /** Fecha AAAA-MM-DD en que lo encontraste o completaste. */
  date?: string;
  platform?: Platform;
  rating?: 1 | 2 | 3 | 4 | 5;
}
export interface Loadout {
  id: string;
  name: string;
  sidearm: (string | null)[];
  longarm: (string | null)[];
  melee: (string | null)[];
  attachments: Record<string, string[]>;
  updatedAt: string;
}
export const AVATARS = ['flamenco', 'palmera', 'ola', 'sol', 'estrella', 'rayo'] as const;
export type Avatar = (typeof AVATARS)[number];
/** Parada de una ruta personal: siempre una ficha documentada (nunca coordenadas libres). */
export interface RouteStop {
  entryId: string;
  note: string;
  visited: boolean;
}
export interface PersonalRoute {
  id: string;
  name: string;
  objective: string;
  stops: RouteStop[];
  updatedAt: string;
}
export interface Progress {
  schemaVersion: 5;
  favorites: string[];
  completed: string[];
  notes: Record<string, Note>;
  records: Record<string, EntryRecord>;
  /** Contadores manuales por colección (p. ej. cuántas tarjetas llevas). */
  counters: Record<string, number>;
  /** Lista para hoy (ids de fichas). */
  today: string[];
  loadouts: Loadout[];
  /** Rutas personales sobre el mapa (v4). */
  routes: PersonalRoute[];
  /** Colección personal de vehículos: ids de fichas de vehículos (v4). */
  garage: string[];
  /** Lugares marcados como visitados (v5). */
  visited: string[];
  /** Marcadores personales del mapa (v5). */
  markers: CustomMarker[];
  /** Objetivos personales (v5). */
  goals: Goal[];
  /** Actividad reciente, del más nuevo al más antiguo (v5). */
  activity: ActivityEvent[];
  profile: { name: string; avatar: Avatar; platform: Platform | null; accent: Accent };
  settings: { spoilerLevel: 0 | 1 | 2; hideFound: boolean };
  updatedAt: string;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isId = (x: unknown): x is string => typeof x === 'string' && x.length > 0 && x.length <= 120;
const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.length <= MAX_IDS && v.every(isId);
const isLevel = (v: unknown): v is 0 | 1 | 2 => v === 0 || v === 1 || v === 2;
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isPlatform = (v: unknown): v is Platform => (PLATFORMS as readonly unknown[]).includes(v);

export function emptyProgress(): Progress {
  return {
    schemaVersion: SCHEMA_VERSION,
    favorites: [],
    completed: [],
    notes: {},
    records: {},
    counters: {},
    today: [],
    loadouts: [],
    routes: [],
    garage: [],
    visited: [],
    markers: [],
    goals: [],
    activity: [],
    profile: { name: '', avatar: 'flamenco', platform: null, accent: 'magenta' },
    settings: { spoilerLevel: 1, hideFound: false },
    updatedAt: new Date(0).toISOString(),
  };
}

function validNotes(v: unknown): v is Record<string, Note> {
  if (!isObj(v)) return false;
  const notes = Object.entries(v);
  if (notes.length > MAX_IDS) return false;
  return notes.every(([k, n]) => k.length <= 120 && isObj(n) && typeof n.text === 'string' && n.text.length <= MAX_NOTE && typeof n.updatedAt === 'string');
}

function validV2(v: unknown): v is { schemaVersion: 2; favorites: string[]; completed: string[]; notes: Record<string, Note>; settings: { spoilerLevel: 0 | 1 | 2 }; updatedAt: string } {
  if (!isObj(v) || v.schemaVersion !== 2) return false;
  if (!isIdList(v.favorites) || !isIdList(v.completed)) return false;
  if (!isObj(v.settings) || !isLevel(v.settings.spoilerLevel)) return false;
  if (typeof v.updatedAt !== 'string') return false;
  return validNotes(v.notes);
}

function cleanRecord(r: unknown): EntryRecord | null {
  if (!isObj(r)) return null;
  const out: EntryRecord = {};
  if (r.state !== undefined) {
    if (!(TRACK_STATES as readonly unknown[]).includes(r.state)) return null;
    out.state = r.state as TrackState;
  }
  if (r.date !== undefined) {
    if (!isDate(r.date)) return null;
    out.date = r.date;
  }
  if (r.platform !== undefined) {
    if (!isPlatform(r.platform)) return null;
    out.platform = r.platform;
  }
  if (r.rating !== undefined) {
    if (![1, 2, 3, 4, 5].includes(r.rating as number)) return null;
    out.rating = r.rating as EntryRecord['rating'];
  }
  return out;
}

function cleanLoadout(l: unknown): Loadout | null {
  if (!isObj(l) || !isId(l.id) || typeof l.name !== 'string' || l.name.length > 60 || typeof l.updatedAt !== 'string') return null;
  const slots = (v: unknown) => Array.isArray(v) && v.length <= 4 && v.every((x) => x === null || isId(x));
  if (!slots(l.sidearm) || !slots(l.longarm) || !slots(l.melee) || !isObj(l.attachments)) return null;
  const att = Object.entries(l.attachments);
  if (att.length > 20 || !att.every(([k, a]) => isId(k) && Array.isArray(a) && a.length <= 10 && a.every(isId))) return null;
  return {
    id: l.id,
    name: l.name,
    sidearm: l.sidearm as (string | null)[],
    longarm: l.longarm as (string | null)[],
    melee: l.melee as (string | null)[],
    attachments: Object.fromEntries(att) as Record<string, string[]>,
    updatedAt: l.updatedAt,
  };
}

function cleanRoute(r: unknown): PersonalRoute | null {
  if (!isObj(r) || !isId(r.id) || typeof r.name !== 'string' || r.name.length > 60 || typeof r.objective !== 'string' || r.objective.length > 300) return null;
  if (typeof r.updatedAt !== 'string' || !Array.isArray(r.stops) || r.stops.length > MAX_STOPS) return null;
  const stops: RouteStop[] = [];
  for (const st of r.stops) {
    if (!isObj(st) || !isId(st.entryId) || typeof st.note !== 'string' || st.note.length > 200 || typeof st.visited !== 'boolean') return null;
    stops.push({ entryId: st.entryId, note: st.note, visited: st.visited });
  }
  return { id: r.id, name: r.name, objective: r.objective, stops, updatedAt: r.updatedAt };
}

const isFiniteUnit = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;

function cleanMarker(m: unknown): CustomMarker | null {
  if (!isObj(m) || !isId(m.id) || typeof m.name !== 'string' || m.name.length > 60 || typeof m.note !== 'string' || m.note.length > 500) return null;
  if (!isFiniteUnit(m.x) || !isFiniteUnit(m.y) || !(MARKER_ICONS as readonly unknown[]).includes(m.icon)) return null;
  if (typeof m.createdAt !== 'string' || typeof m.updatedAt !== 'string') return null;
  return { id: m.id, name: m.name, note: m.note, x: m.x, y: m.y, icon: m.icon as MarkerIcon, createdAt: m.createdAt, updatedAt: m.updatedAt };
}
function cleanGoal(g: unknown): Goal | null {
  if (!isObj(g) || !isId(g.id) || typeof g.text !== 'string' || g.text.length > 120 || typeof g.done !== 'boolean' || typeof g.createdAt !== 'string') return null;
  if (!(g.doneAt === null || typeof g.doneAt === 'string')) return null;
  return { id: g.id, text: g.text, done: g.done, createdAt: g.createdAt, doneAt: g.doneAt as string | null };
}
function cleanActivity(a: unknown): ActivityEvent | null {
  if (!isObj(a) || !(ACTIVITY_TYPES as readonly unknown[]).includes(a.type) || !isId(a.ref) || typeof a.at !== 'string') return null;
  return { type: a.type as ActivityType, ref: a.ref, at: a.at };
}
function cleanList<T>(v: unknown, max: number, fn: (x: unknown) => T | null): T[] | null {
  if (!Array.isArray(v) || v.length > max) return null;
  const out: T[] = [];
  for (const x of v) {
    const c = fn(x);
    if (!c) return null;
    out.push(c);
  }
  return out;
}

/** v5 = v4 + lugares visitados, marcadores personales, objetivos, actividad y color de perfil. */
function cleanV5(v: unknown): Progress | null {
  if (!isObj(v) || v.schemaVersion !== 5 || !isObj(v.profile)) return null;
  const { accent, ...profile } = v.profile;
  const core = cleanV4({ ...v, schemaVersion: 4, profile });
  if (!core || !isIdList(v.visited) || !(ACCENTS as readonly unknown[]).includes(accent)) return null;
  const markers = cleanList(v.markers, MAX_MARKERS, cleanMarker);
  const goals = cleanList(v.goals, MAX_GOALS, cleanGoal);
  const activity = cleanList(v.activity, MAX_ACTIVITY, cleanActivity);
  if (!markers || !goals || !activity) return null;
  return { ...core, visited: [...new Set(v.visited)], markers, goals, activity, profile: { ...core.profile, accent: accent as Accent } };
}

/** v4 = v3 + rutas personales + colección de vehículos. */
function cleanV4(v: unknown): Progress | null {
  if (!isObj(v) || v.schemaVersion !== 4) return null;
  const core = cleanV3({ ...v, schemaVersion: 3 });
  if (!core || !Array.isArray(v.routes) || v.routes.length > MAX_ROUTES || !isIdList(v.garage)) return null;
  const routes: PersonalRoute[] = [];
  for (const r of v.routes) {
    const c = cleanRoute(r);
    if (!c) return null;
    routes.push(c);
  }
  return { ...core, routes, garage: [...new Set(v.garage)] };
}

function cleanV3(v: unknown): Progress | null {
  if (!isObj(v) || v.schemaVersion !== 3) return null;
  if (!isIdList(v.favorites) || !isIdList(v.completed) || !isIdList(v.today) || !validNotes(v.notes)) return null;
  if (!isObj(v.settings) || !isLevel(v.settings.spoilerLevel) || typeof v.settings.hideFound !== 'boolean') return null;
  if (!isObj(v.profile) || typeof v.profile.name !== 'string' || v.profile.name.length > 40) return null;
  if (!(AVATARS as readonly unknown[]).includes(v.profile.avatar) || !(v.profile.platform === null || isPlatform(v.profile.platform))) return null;
  if (typeof v.updatedAt !== 'string' || !isObj(v.records) || !isObj(v.counters) || !Array.isArray(v.loadouts) || v.loadouts.length > MAX_LOADOUTS) return null;
  const recEntries = Object.entries(v.records);
  if (recEntries.length > MAX_IDS) return null;
  const records: Record<string, EntryRecord> = {};
  for (const [k, r] of recEntries) {
    const c = cleanRecord(r);
    if (!isId(k) || !c) return null;
    records[k] = c;
  }
  const counters: Record<string, number> = {};
  for (const [k, n] of Object.entries(v.counters)) {
    if (!isId(k) || typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > 10000) return null;
    counters[k] = n;
  }
  const loadouts: Loadout[] = [];
  for (const l of v.loadouts) {
    const c = cleanLoadout(l);
    if (!c) return null;
    loadouts.push(c);
  }
  return {
    schemaVersion: 5,
    favorites: [...new Set(v.favorites)],
    completed: [...new Set(v.completed)],
    notes: Object.fromEntries(Object.entries(v.notes).map(([k, n]) => [k, { text: n.text, updatedAt: n.updatedAt }])),
    records,
    counters,
    today: [...new Set(v.today)],
    loadouts,
    routes: [],
    garage: [],
    visited: [],
    markers: [],
    goals: [],
    activity: [],
    profile: { name: v.profile.name, avatar: v.profile.avatar as Avatar, platform: v.profile.platform as Platform | null, accent: 'magenta' },
    settings: { spoilerLevel: v.settings.spoilerLevel, hideFound: v.settings.hideFound },
    updatedAt: v.updatedAt,
  };
}

/** v1 (prototipo previo): { version: 1, favorites, completed, notes: { id: "texto" } } */
function validV1(v: unknown): v is { version: 1; favorites?: string[]; completed?: string[]; notes?: Record<string, string> } {
  if (!isObj(v) || v.version !== 1) return false;
  if (v.favorites !== undefined && !isIdList(v.favorites)) return false;
  if (v.completed !== undefined && !isIdList(v.completed)) return false;
  if (v.notes !== undefined && !(isObj(v.notes) && Object.values(v.notes).every((t) => typeof t === 'string'))) return false;
  return true;
}

/** Acepta cualquier versión conocida (v1–v5) y devuelve el esquema actual (v5), o null si no es válido. */
export function migrate(input: unknown): Progress | null {
  const v5 = cleanV5(input);
  if (v5) return v5;
  const v4 = cleanV4(input);
  if (v4) return v4;
  const v3 = cleanV3(input);
  if (v3) return v3;
  if (validV2(input)) {
    return {
      ...emptyProgress(),
      favorites: [...new Set(input.favorites)],
      completed: [...new Set(input.completed)],
      notes: Object.fromEntries(Object.entries(input.notes).map(([k, n]) => [k, { text: n.text, updatedAt: n.updatedAt }])),
      settings: { spoilerLevel: input.settings.spoilerLevel, hideFound: false },
      updatedAt: input.updatedAt,
    };
  }
  if (validV1(input)) {
    const now = new Date().toISOString();
    return {
      ...emptyProgress(),
      favorites: [...new Set(input.favorites ?? [])],
      completed: [...new Set(input.completed ?? [])],
      notes: Object.fromEntries(
        Object.entries(input.notes ?? {})
          .filter(([, t]) => t.trim())
          .map(([k, t]) => [k, { text: t.slice(0, MAX_NOTE), updatedAt: now }]),
      ),
      updatedAt: now,
    };
  }
  return null;
}

function safeStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const k = '__la_test__';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

/**
 * Lee el progreso. Antes de migrar una versión anterior guarda el original en BACKUP_KEY; si el valor no se puede
 * leer, lo copia en CORRUPT_KEY para que el siguiente guardado no lo destruya sin rastro.
 */
export function loadProgress(): Progress {
  const s = safeStorage();
  const raw = s?.getItem(STORAGE_KEY);
  if (!raw) return emptyProgress();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const p = parsed === undefined ? null : migrate(parsed);
  try {
    if (!p) s?.setItem(CORRUPT_KEY, raw);
    else if (!(isObj(parsed) && parsed.schemaVersion === SCHEMA_VERSION)) s?.setItem(BACKUP_KEY, raw);
  } catch {
    /* sin espacio: no se bloquea la carga */
  }
  return p ?? emptyProgress();
}

export function saveProgress(p: Progress): boolean {
  const s = safeStorage();
  if (!s) return false;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

/** Foto exportada: imagen JPEG/PNG/WebP en data URL. */
export interface ExportedPhoto {
  id: string;
  entryId: string | null;
  caption: string;
  createdAt: string;
  dataUrl: string;
}
export interface ExportFile {
  app: 'leonida-atlas';
  kind: 'progress';
  exportedAt: string;
  data: Progress;
  photos?: ExportedPhoto[];
}

export function makeExport(p: Progress, photos?: ExportedPhoto[]): ExportFile {
  return { app: 'leonida-atlas', kind: 'progress', exportedAt: new Date().toISOString(), data: p, ...(photos?.length ? { photos } : {}) };
}

export type ImportResult = { ok: true; data: Progress; unknownIds: string[]; photos: ExportedPhoto[] } | { ok: false; error: string };
export const MAX_IMPORT_BYTES = 40_000_000;
export const MAX_PHOTOS = 60;

function validPhoto(p: unknown): p is ExportedPhoto {
  return (
    isObj(p) &&
    isId(p.id) &&
    (p.entryId === null || isId(p.entryId)) &&
    typeof p.caption === 'string' &&
    p.caption.length <= 200 &&
    typeof p.createdAt === 'string' &&
    typeof p.dataUrl === 'string' &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p.dataUrl) &&
    p.dataUrl.length <= 4_000_000
  );
}

/** Valida un archivo exportado (o un objeto de progreso suelto) antes de importarlo. */
export function parseImport(text: string, knownIds: Set<string>): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'El archivo es demasiado grande (máx. 40 MB).' };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es JSON válido.' };
  }
  const payload = isObj(json) && json.app === 'leonida-atlas' && json.kind === 'progress' ? json.data : json;
  const data = migrate(payload);
  if (!data) return { ok: false, error: 'El archivo no tiene el formato de progreso de LEONIDA ATLAS.' };
  const rawPhotos = isObj(json) && Array.isArray(json.photos) ? json.photos : [];
  if (rawPhotos.length > MAX_PHOTOS) return { ok: false, error: `El archivo trae demasiadas fotos (máx. ${MAX_PHOTOS}).` };
  if (!rawPhotos.every(validPhoto)) return { ok: false, error: 'Una de las fotos del archivo no es una imagen válida.' };
  const ids = new Set([
    ...data.favorites,
    ...data.completed,
    ...Object.keys(data.notes),
    ...Object.keys(data.records),
    ...data.today,
    ...data.garage,
    ...data.visited,
    ...data.routes.flatMap((r) => r.stops.map((st) => st.entryId)),
  ]);
  return { ok: true, data, unknownIds: [...ids].filter((id) => !knownIds.has(id)), photos: rawPhotos };
}

function mergeById<T extends { id: string; updatedAt: string }>(a: T[], b: T[]): T[] {
  const out = [...a];
  for (const x of b) {
    const i = out.findIndex((y) => y.id === x.id);
    if (i < 0) out.push(x);
    else if (out[i].updatedAt < x.updatedAt) out[i] = x;
  }
  return out;
}

function mergeGoals(a: Goal[], b: Goal[]): Goal[] {
  const out = [...a];
  for (const g of b) {
    const i = out.findIndex((x) => x.id === g.id);
    if (i < 0) out.push(g);
    else if ((out[i].doneAt ?? out[i].createdAt) < (g.doneAt ?? g.createdAt)) out[i] = g;
  }
  return out.slice(0, MAX_GOALS);
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const notes = { ...a.notes };
  for (const [k, v] of Object.entries(b.notes)) if (!notes[k] || notes[k].updatedAt < v.updatedAt) notes[k] = v;
  const counters = { ...a.counters };
  for (const [k, n] of Object.entries(b.counters)) counters[k] = Math.max(counters[k] ?? 0, n);
  const loadouts = [...a.loadouts];
  for (const l of b.loadouts) {
    const i = loadouts.findIndex((x) => x.id === l.id);
    if (i < 0) loadouts.push(l);
    else if (loadouts[i].updatedAt < l.updatedAt) loadouts[i] = l;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    favorites: [...new Set([...a.favorites, ...b.favorites])],
    completed: [...new Set([...a.completed, ...b.completed])],
    notes,
    records: { ...b.records, ...a.records },
    counters,
    today: [...new Set([...a.today, ...b.today])],
    loadouts: loadouts.slice(0, MAX_LOADOUTS),
    routes: mergeById(a.routes, b.routes).slice(0, MAX_ROUTES),
    garage: [...new Set([...a.garage, ...b.garage])],
    visited: [...new Set([...a.visited, ...b.visited])],
    markers: mergeById(a.markers, b.markers).slice(0, MAX_MARKERS),
    goals: mergeGoals(a.goals, b.goals),
    activity: [...a.activity, ...b.activity]
      .filter((x, i, arr) => arr.findIndex((y) => y.type === x.type && y.ref === x.ref && y.at === x.at) === i)
      .sort((x, y) => (x.at < y.at ? 1 : -1))
      .slice(0, MAX_ACTIVITY),
    profile: a.profile,
    settings: a.settings,
    updatedAt: new Date().toISOString(),
  };
}

export function backupCurrent(): void {
  const s = safeStorage();
  const raw = s?.getItem(STORAGE_KEY);
  if (s && raw) s.setItem(BACKUP_KEY, raw);
}

export function restoreBackup(): Progress | null {
  const s = safeStorage();
  const raw = s?.getItem(BACKUP_KEY);
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}
