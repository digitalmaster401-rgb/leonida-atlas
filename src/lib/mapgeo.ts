// Geometría del mapa: póster activo, resolución adecuada y agrupación de marcadores por zoom.
// Todo trabaja en coordenadas normalizadas (0–1) del póster oficial; nunca inventa posiciones.
import type { MediaItem } from '../data/schema';

export type PosterId = 'v2' | 'v1';
export const POSTER_MEDIA: Record<PosterId, string> = { v2: 'mapa-oficial-leonida-v2', v1: 'mapa-oficial-leonida' };
export const POSTER_LABEL: Record<PosterId, string> = { v2: 'Póster para imprimir (alta resolución)', v1: 'Póster anterior' };

export interface PosterFile {
  src: string;
  width: number;
  height: number;
}

export function posterFiles(item: Pick<MediaItem, 'files'>): PosterFile[] {
  return Object.values(item.files)
    .map((f) => ({ src: f.src, width: f.width, height: f.height }))
    .sort((a, b) => a.width - b.width);
}

/** Relación ancho/alto tomada del archivo más grande (el más fiel al original). */
export function posterRatio(files: PosterFile[]): number {
  const big = files[files.length - 1];
  return big.width / big.height;
}

/** El archivo más pequeño que cubre los píxeles físicos necesarios; si ninguno alcanza, el mayor. */
export function pickFile(files: PosterFile[], neededPx: number): PosterFile {
  return files.find((f) => f.width >= neededPx) ?? files[files.length - 1];
}

export interface Point {
  key: string;
  x: number;
  y: number;
}
export interface Cluster<T extends Point> {
  key: string;
  x: number;
  y: number;
  items: T[];
}

/**
 * Agrupa puntos que en pantalla quedarían a menos de `radius` píxeles (con el póster dibujado a w×h px).
 * Voraz y estable (mismo orden de entrada ⇒ mismo resultado). Los puntos de `keep` nunca se agrupan.
 */
export function clusterPoints<T extends Point>(points: T[], w: number, h: number, radius: number, keep: Set<string> = new Set()): Cluster<T>[] {
  const out: Cluster<T>[] = [];
  const r2 = radius * radius;
  for (const p of points) {
    if (keep.has(p.key)) {
      out.push({ key: p.key, x: p.x, y: p.y, items: [p] });
      continue;
    }
    const near = out.find((c) => !c.items.some((i) => keep.has(i.key)) && ((c.x - p.x) * w) ** 2 + ((c.y - p.y) * h) ** 2 < r2);
    if (near) {
      near.items.push(p);
      near.x = near.items.reduce((s, i) => s + i.x, 0) / near.items.length;
      near.y = near.items.reduce((s, i) => s + i.y, 0) / near.items.length;
      near.key = near.items.map((i) => i.key).join('|');
    } else out.push({ key: p.key, x: p.x, y: p.y, items: [p] });
  }
  return out;
}
