// Persistencia local del progreso con versión de esquema, migración y validación manual
// (sin dependencias para que la app cargue rápido en móviles).

export const STORAGE_KEY = 'leonida-atlas:progress';
export const BACKUP_KEY = 'leonida-atlas:progress-backup';
export const SCHEMA_VERSION = 2;
const MAX_IDS = 2000;
const MAX_NOTE = 5000;

export interface Note {
  text: string;
  updatedAt: string;
}
export interface Progress {
  schemaVersion: 2;
  favorites: string[];
  completed: string[];
  notes: Record<string, Note>;
  settings: { spoilerLevel: 0 | 1 | 2 };
  updatedAt: string;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.length <= MAX_IDS && v.every((x) => typeof x === 'string' && x.length > 0 && x.length <= 120);
const isLevel = (v: unknown): v is 0 | 1 | 2 => v === 0 || v === 1 || v === 2;

export function emptyProgress(): Progress {
  return { schemaVersion: SCHEMA_VERSION, favorites: [], completed: [], notes: {}, settings: { spoilerLevel: 1 }, updatedAt: new Date(0).toISOString() };
}

function validV2(v: unknown): v is Progress {
  if (!isObj(v) || v.schemaVersion !== 2) return false;
  if (!isIdList(v.favorites) || !isIdList(v.completed)) return false;
  if (!isObj(v.settings) || !isLevel(v.settings.spoilerLevel)) return false;
  if (typeof v.updatedAt !== 'string') return false;
  if (!isObj(v.notes)) return false;
  const notes = Object.entries(v.notes);
  if (notes.length > MAX_IDS) return false;
  return notes.every(([k, n]) => k.length <= 120 && isObj(n) && typeof n.text === 'string' && n.text.length <= MAX_NOTE && typeof n.updatedAt === 'string');
}

/** v1 (prototipo previo): { version: 1, favorites, completed, notes: { id: "texto" } } */
function validV1(v: unknown): v is { version: 1; favorites?: string[]; completed?: string[]; notes?: Record<string, string> } {
  if (!isObj(v) || v.version !== 1) return false;
  if (v.favorites !== undefined && !isIdList(v.favorites)) return false;
  if (v.completed !== undefined && !isIdList(v.completed)) return false;
  if (v.notes !== undefined && !(isObj(v.notes) && Object.values(v.notes).every((t) => typeof t === 'string'))) return false;
  return true;
}

/** Acepta cualquier versión conocida y devuelve el esquema actual, o null si no es válido. */
export function migrate(input: unknown): Progress | null {
  if (validV2(input)) {
    return {
      schemaVersion: 2,
      favorites: [...new Set(input.favorites)],
      completed: [...new Set(input.completed)],
      notes: Object.fromEntries(Object.entries(input.notes).map(([k, n]) => [k, { text: n.text, updatedAt: n.updatedAt }])),
      settings: { spoilerLevel: input.settings.spoilerLevel },
      updatedAt: input.updatedAt,
    };
  }
  if (validV1(input)) {
    const now = new Date().toISOString();
    return {
      schemaVersion: 2,
      favorites: [...new Set(input.favorites ?? [])],
      completed: [...new Set(input.completed ?? [])],
      notes: Object.fromEntries(
        Object.entries(input.notes ?? {})
          .filter(([, t]) => t.trim())
          .map(([k, t]) => [k, { text: t.slice(0, MAX_NOTE), updatedAt: now }]),
      ),
      settings: { spoilerLevel: 1 },
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

export function loadProgress(): Progress {
  const s = safeStorage();
  const raw = s?.getItem(STORAGE_KEY);
  if (!raw) return emptyProgress();
  try {
    return migrate(JSON.parse(raw)) ?? emptyProgress();
  } catch {
    return emptyProgress();
  }
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

export interface ExportFile {
  app: 'leonida-atlas';
  kind: 'progress';
  exportedAt: string;
  data: Progress;
}

export function makeExport(p: Progress): ExportFile {
  return { app: 'leonida-atlas', kind: 'progress', exportedAt: new Date().toISOString(), data: p };
}

export type ImportResult = { ok: true; data: Progress; unknownIds: string[] } | { ok: false; error: string };

/** Valida un archivo exportado (o un objeto de progreso suelto) antes de importarlo. */
export function parseImport(text: string, knownIds: Set<string>): ImportResult {
  if (text.length > 2_000_000) return { ok: false, error: 'El archivo es demasiado grande (máx. 2 MB).' };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es JSON válido.' };
  }
  const payload = isObj(json) && json.app === 'leonida-atlas' && json.kind === 'progress' ? json.data : json;
  const data = migrate(payload);
  if (!data) return { ok: false, error: 'El archivo no tiene el formato de progreso de LEONIDA ATLAS.' };
  const ids = new Set([...data.favorites, ...data.completed, ...Object.keys(data.notes)]);
  return { ok: true, data, unknownIds: [...ids].filter((id) => !knownIds.has(id)) };
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const notes = { ...a.notes };
  for (const [k, v] of Object.entries(b.notes)) if (!notes[k] || notes[k].updatedAt < v.updatedAt) notes[k] = v;
  return {
    schemaVersion: SCHEMA_VERSION,
    favorites: [...new Set([...a.favorites, ...b.favorites])],
    completed: [...new Set([...a.completed, ...b.completed])],
    notes,
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
