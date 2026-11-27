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

/** Lo que se guarda en IndexedDB: bytes (ArrayBuffer) y tipo, no un Blob. WebKit/Safari no siempre
 * permite guardar Blobs en IndexedDB (navegación privada y contextos efímeros), pero sí ArrayBuffers. */
interface StoredPhoto {
  id: string;
  entryId: string | null;
  caption: string;
  createdAt: string;
  type: string;
  data: ArrayBuffer;
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
      // si el navegador no responde, se informa en lugar de quedar «Guardando…» para siempre
      const timer = setTimeout(() => reject(new Error('El almacenamiento del navegador no respondió. Intenta de nuevo.')), 15000);
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => {
        clearTimeout(timer);
        resolve(req ? req.result : undefined);
      };
      t.onerror = () => {
        clearTimeout(timer);
        reject(t.error ?? new Error('No se pudo guardar la foto en este navegador.'));
      };
      t.onabort = () => {
        clearTimeout(timer);
        reject(t.error ?? new Error('Transacción cancelada'));
      };
    });
  } finally {
    db.close();
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(fallback);
      },
    );
  });
}

function toPhoto(r: StoredPhoto | (Omit<StoredPhoto, 'data' | 'type'> & { blob: Blob })): Photo {
  const blob = 'blob' in r ? r.blob : new Blob([r.data], { type: r.type });
  return { id: r.id, entryId: r.entryId, caption: r.caption, createdAt: r.createdAt, blob };
}

async function bytes(b: Blob): Promise<ArrayBuffer> {
  if (typeof b.arrayBuffer === 'function') return b.arrayBuffer();
  return new Response(b).arrayBuffer();
}

async function putPhoto(p: Photo): Promise<void> {
  const rec: StoredPhoto = { id: p.id, entryId: p.entryId, caption: p.caption, createdAt: p.createdAt, type: p.blob.type || 'image/jpeg', data: await bytes(p.blob) };
  await tx('readwrite', (s) => s.put(rec));
}

const newId = () => `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Reduce la imagen a MAX_SIDE px (JPEG). Si el navegador no puede decodificarla (o tarda más de 8 s), guarda el original. */
export function shrink(file: Blob): Promise<Blob> {
  return withTimeout(shrinkInner(file), 8000, file);
}

async function shrinkInner(file: Blob): Promise<Blob> {
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
  await putPhoto(photo);
  return photo;
}

export async function listPhotos(entryId?: string): Promise<Photo[]> {
  const all = (await tx<StoredPhoto[]>('readonly', (s) => (entryId ? s.index('entryId').getAll(entryId) : s.getAll()))) ?? [];
  return all.map(toPhoto).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Lee y escribe en UNA sola transacción: antes eran dos y una recarga entre ambas perdía la descripción. */
export async function updateCaption(id: string, caption: string): Promise<void> {
  await tx<StoredPhoto>('readwrite', (s) => {
    const req = s.get(id) as IDBRequest<StoredPhoto>;
    req.onsuccess = () => {
      if (req.result) s.put({ ...req.result, caption: caption.slice(0, 200) });
    };
    return req;
  });
}

export async function deletePhoto(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

export async function clearPhotos(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
}

async function blobToDataUrl(b: Blob): Promise<string> {
  const u8 = new Uint8Array(await bytes(b));
  let bin = '';
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
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
    await putPhoto({ id: p.id, entryId: p.entryId, caption: p.caption, createdAt: p.createdAt, blob: dataUrlToBlob(p.dataUrl) });
    n++;
  }
  return n;
}
