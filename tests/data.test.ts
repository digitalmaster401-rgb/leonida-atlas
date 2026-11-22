import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import entries from '../content/entries.json';
import sources from '../content/sources.json';
import changelog from '../content/changelog.json';
import manifest from '../public/media/media-manifest.json';
import { changelogSchema, mediaManifestSchema, sourceSchema, validateDataset, type Entry } from '../src/data/schema';

const root = join(__dirname, '..');
const parsedSources = z.array(sourceSchema).parse(sources);
const parsedManifest = mediaManifestSchema.parse(manifest);
const mediaIds = new Set(parsedManifest.items.map((m) => m.id));

describe('contenido publicado', () => {
  it('cumple el esquema y la integridad referencial', () => {
    const res = validateDataset(entries, parsedSources, mediaIds);
    if (!res.ok) throw new Error(res.errors.join('\n'));
    expect(res.entries.length).toBeGreaterThan(40);
  });

  it('el registro de cambios es válido', () => {
    expect(() => changelogSchema.parse(changelog)).not.toThrow();
  });

  it('ninguna ficha no oficial aparece como confirmada sin fuente', () => {
    for (const e of entries as Entry[]) {
      if (e.status === 'oficial') expect(e.sources.some((s) => parsedSources.find((x) => x.id === s)?.type === 'oficial')).toBe(true);
      if (e.status === 'contrastado') expect(new Set(e.sources.filter((s) => parsedSources.find((x) => x.id === s)?.type !== 'oficial')).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('los métodos de dinero son del modo historia o declaran su modo', () => {
    for (const e of (entries as Entry[]).filter((x) => x.category === 'dinero')) expect(['historia', 'online', 'sin-confirmar']).toContain(e.mode);
  });

  it('las posiciones del mapa declaran precisión y base, y ninguna es «exacta» sin evidencia oficial', () => {
    for (const e of entries as Entry[]) {
      if (!e.mapPosition) continue;
      expect(e.mapPosition.basis.length).toBeGreaterThan(10);
      expect(e.mapPosition.precision).not.toBe('exacta');
    }
  });
});

describe('manifiesto de medios', () => {
  it('cada archivo existe en public/ y está verificado sin marca de agua', () => {
    for (const m of parsedManifest.items) {
      expect(m.sinMarcaDeAgua).toBe(true);
      expect(m.copyright).toMatch(/Rockstar/);
      for (const f of Object.values(m.files)) expect(existsSync(join(root, 'public', f.src))).toBe(true);
    }
  });
  it('todas las imágenes provienen de rockstargames.com', () => {
    for (const m of parsedManifest.items) {
      expect(new URL(m.sourceUrl).hostname).toBe('www.rockstargames.com');
      expect(m.sourcePage.startsWith('https://www.rockstargames.com/VI')).toBe(true);
    }
  });
  it('no se repite la misma imagen como portada de temas distintos más de lo necesario', () => {
    const covers = new Map<string, string[]>();
    for (const e of entries as Entry[]) if (e.images[0]) covers.set(e.images[0], [...(covers.get(e.images[0]) ?? []), e.id]);
    for (const [img, ids] of covers) expect(ids.length, `${img} usada en ${ids.join(', ')}`).toBeLessThanOrEqual(3);
  });
});

describe('material ajeno (auditoría)', () => {
  it('no hay referencias al video de terceros ni a sus recursos', () => {
    const banned = /tiktok|video-guia|assets\/frames|assets\/hd|portada-1920x1080|video_stops|timg\(/i;
    for (const f of ['content/entries.json', 'content/sources.json', 'public/media/media-manifest.json', 'index.html']) {
      expect(banned.test(readFileSync(join(root, f), 'utf8')), f).toBe(false);
    }
  });
});
