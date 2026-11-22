import { beforeEach, describe, expect, it } from 'vitest';
import manifest from '../public/media/media-manifest.json';
import localMedia from '../sources/local-media.json';
import entries from '../content/entries.json';
import { clusterPoints, pickFile, POSTER_MEDIA, posterFiles, posterRatio } from '../src/lib/mapgeo';
import { DEFAULT_MAP_PREFS, loadMapPrefs, MAP_PREFS_KEY, parseMapPrefs, saveMapPrefs } from '../src/lib/mapprefs';

type Item = { id: string; originalSize: string; files: Record<string, { src: string; width: number; height: number; bytes: number }> };
const item = (id: string) => (manifest.items as unknown as Item[]).find((i) => i.id === id)!;

describe('póster oficial', () => {
  it('existen las dos versiones y la v2 se conserva aunque se regenere el manifiesto', () => {
    expect(item(POSTER_MEDIA.v1)).toBeTruthy();
    expect(item(POSTER_MEDIA.v2)).toBeTruthy();
    expect(localMedia.map((i) => i.id)).toContain(POSTER_MEDIA.v2);
    expect(item(POSTER_MEDIA.v2).originalSize).toBe('5775x7900');
  });
  it('las dos versiones tienen la misma proporción (mismo encuadre) dentro de 0.1 %', () => {
    const r1 = posterRatio(posterFiles(item(POSTER_MEDIA.v1)));
    const r2 = posterRatio(posterFiles(item(POSTER_MEDIA.v2)));
    expect(Math.abs(r1 - r2) / r1).toBeLessThan(0.001);
    expect(Math.abs(r2 - 5775 / 7900) / r2).toBeLessThan(0.001);
  });
  it('elige el archivo más ligero que cubre la pantalla', () => {
    const f = posterFiles(item(POSTER_MEDIA.v2));
    expect(f.map((x) => x.width)).toEqual([1200, 2400, 3840]);
    expect(pickFile(f, 800).width).toBe(1200);
    expect(pickFile(f, 1300).width).toBe(2400);
    expect(pickFile(f, 3000).width).toBe(3840);
    expect(pickFile(f, 9000).width).toBe(3840);
  });
  it('ningún punto del mapa sale del póster', () => {
    for (const e of entries as { mapPosition: { x: number; y: number } | null }[])
      if (e.mapPosition) {
        expect(e.mapPosition.x).toBeGreaterThan(0);
        expect(e.mapPosition.x).toBeLessThan(1);
        expect(e.mapPosition.y).toBeGreaterThan(0);
        expect(e.mapPosition.y).toBeLessThan(1);
      }
  });
});

describe('agrupación por zoom', () => {
  const pts = [
    { key: 'a', x: 0.5, y: 0.5 },
    { key: 'b', x: 0.51, y: 0.5 },
    { key: 'c', x: 0.9, y: 0.9 },
  ];
  it('agrupa puntos cercanos con el mapa pequeño y los separa al acercar', () => {
    expect(clusterPoints(pts, 400, 550, 40).map((c) => c.items.length)).toEqual([2, 1]);
    expect(clusterPoints(pts, 4000, 5500, 40).map((c) => c.items.length)).toEqual([1, 1, 1]);
  });
  it('nunca agrupa el punto seleccionado', () => {
    const c = clusterPoints(pts, 400, 550, 40, new Set(['a']));
    expect(c.find((x) => x.items.some((i) => i.key === 'a'))!.items).toHaveLength(1);
  });
  it('el centro del grupo es el promedio de sus puntos', () => {
    const c = clusterPoints(pts, 400, 550, 40)[0];
    expect(c.x).toBeCloseTo(0.505);
    expect(c.key).toBe('a|b');
  });
});

describe('preferencias del mapa', () => {
  beforeEach(() => localStorage.clear());
  it('usa valores por defecto y descarta basura', () => {
    expect(loadMapPrefs()).toEqual(DEFAULT_MAP_PREFS);
    localStorage.setItem(MAP_PREFS_KEY, '{mal');
    expect(loadMapPrefs()).toEqual(DEFAULT_MAP_PREFS);
    expect(parseMapPrefs({ cats: ['inventada'], poster: 'v9', cluster: 'si' })).toEqual(DEFAULT_MAP_PREFS);
  });
  it('guarda y restaura capas, precisión, póster y agrupación', () => {
    saveMapPrefs({ cats: ['armas', 'coleccionables'], precisions: ['barrio'], poster: 'v1', cluster: false });
    expect(loadMapPrefs()).toEqual({ cats: ['armas', 'coleccionables'], precisions: ['barrio'], poster: 'v1', cluster: false });
  });
});
