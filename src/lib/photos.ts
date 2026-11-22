// Fotos personales en IndexedDB (solo en este dispositivo). Se reducen antes de guardarse
// para no llenar el almacenamiento del teléfono. Nada se sube a ningún servidor.
import type { ExportedPhoto } from './storage';

export interface Photo {
  id: string;
  entryId: string | null;
  caption: string;
  createdAt: string;
  blob: Blob;
}

const DB = 'leonida-atlas-photos';
const STORE = 'photos';
export const MAX_SIDE = 1600;
export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_INPUT_BYTES = 25_000_000;

export function photosAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('entryId', 'entryId');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error('Transacción cancelada'));
    });
  } finally {
    db.close();
  }
}

const newId = () => `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Reduce la imagen a MAX_SIDE px (JPEG). Si el navegador no puede decodificarla, guarda el original. */
export async function shrink(file: Blob): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) {
      bmp.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return out ?? file;
  } catch {
    return file;
  }
}

export async function addPhoto(file: Blob, entryId: string | null, caption = ''): Promise<Photo> {
  if (!ACCEPTED.includes(file.type)) throw new Error('Formato no admitido. Usa JPG, PNG o WebP.');
  if (file.size > MAX_INPUT_BYTES) throw new Error('La imagen es demasiado grande (máx. 25 MB).');
  const photo: Photo = { id: newId(), entryId, caption: caption.slice(0, 200), createdAt: new Date().toISOString(), blob: await shrink(file) };
  await tx('readwrite', (s) => s.put(photo));
  return photo;
}

export async function listPhotos(entryId?: string): Promise<Photo[]> {
  const all = (await tx<Photo[]>('readonly', (s) => (entryId ? s.index('entryId').getAll(entryId) : s.getAll()))) ?? [];
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateCaption(id: string, caption: string): Promise<void> {
  const db = await tx<Photo>('readonly', (s) => s.get(id));
  if (db) await tx('readwrite', (s) => s.put({ ...db, caption: caption.slice(0, 200) }));
}

export async function deletePhoto(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

export async function clearPhotos(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
}

async function blobToDataUrl(b: Blob): Promise<string> {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${b.type || 'image/jpeg'};base64,${btoa(bin)}`;
}

function dataUrlToBlob(url: string): Blob {
  const [head, b64] = url.split(',');
  const type = /^data:([^;]+);/.exec(head)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportPhotos(): Promise<ExportedPhoto[]> {
  const all = await listPhotos();
  return Promise.all(all.map(async (p) => ({ id: p.id, entryId: p.entryId, caption: p.caption, createdAt: p.createdAt, dataUrl: await blobToDataUrl(p.blob) })));
}

/** Añade las fotos importadas (ya validadas por parseImport); las de id existente se omiten. */
export async function importPhotos(list: ExportedPhoto[]): Promise<number> {
  const existing = new Set((await listPhotos()).map((p) => p.id));
  let n = 0;
  for (const p of list) {
    if (existing.has(p.id)) continue;
    await tx('readwrite', (s) => s.put({ id: p.id, entryId: p.entryId, caption: p.caption, createdAt: p.createdAt, blob: dataUrlToBlob(p.dataUrl) }));
    n++;
  }
  return n;
}
