import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { collectHeadlines, PROHIBITED_FILES, scanText } from '../scripts/audit-legacy-lib.mjs';

// Titular real del PR #10 (GTA BOOM, 22-nov-2026) que hizo fallar la auditoría anterior.
const REAL = 'Creators Report YouTube Copyright Claims With GTA 6’s Music Mute On';
const URL_OK = 'https://www.gtaboom.com/the-mute-licensed-music-setting-in-gta-6-does-not-prevent-copyright-claims-2319';
const sources = JSON.parse(readFileSync('intel/sources.json', 'utf8')) as { url: string; homepage?: string }[];
const news = { id: 'fnd-creators-report-youtube-copyright-claims-with-gt', title: REAL, sources: [{ url: URL_OK, title: REAL }] };
const headlines = collectHeadlines([news], sources);
const scan = (rel: string, text: string) => scanText(rel, text.toLowerCase(), headlines);

describe('auditoría de material ajeno', () => {
  it('acepta «creator» dentro del titular exacto de una noticia externa registrada (datos, propuesta y build)', () => {
    const json = JSON.stringify({ id: news.id, title: REAL, sources: [{ url: URL_OK, title: REAL }] });
    for (const [rel, text] of [
      ['intel/findings.json', json],
      ['intel/proposals/PENDIENTES.md', `| ${REAL} | nuevo_sin_verificar | [1](${URL_OK}) |`],
      ['dist/assets/IntelPage-abc.js', `const f=${json};`],
    ] as const) {
      const r = scan(rel, text);
      expect(r.hits, rel).toEqual([]);
      expect(r.accepted.length, rel).toBeGreaterThan(0);
      expect(r.accepted[0].reason).toMatch(/titular de noticia externa/);
    }
  });

  it('el mismo titular escapado en JSON (comillas, apóstrofo tipográfico) también se reconoce', () => {
    const r = scan('dist/assets/x.js', `"title":${JSON.stringify(REAL)}`);
    expect(r.hits).toEqual([]);
  });

  it('bloquea «creator» fuera de un titular registrado: contenido editorial, código, créditos o marcas', () => {
    expect(scan('content/entries.json', '"credit": "Video by creator @somebody"').hits).toHaveLength(1);
    expect(scan('src/pages/Home.tsx', '<p>Créditos: creator del video original</p>').hits).toHaveLength(1);
    // en un archivo de datos de noticias, pero fuera del titular aceptado
    expect(scan('intel/findings.json', '"note": "watermark del creator original"').hits).toHaveLength(2);
    expect(scan('dist/assets/index.js', 'creatorWatermark=true').hits.length).toBeGreaterThan(0);
  });

  it('no acepta titulares de dominios que no son fuentes registradas', () => {
    const fake = { id: 'fnd-x', title: 'Creator pack for GTA 6', sources: [{ url: 'https://random-video-site.example/creator', title: 'Creator pack for GTA 6' }] };
    const h = collectHeadlines([fake], sources);
    expect(h.size).toBe(0);
    expect(scanText('intel/findings.json', '"title":"creator pack for gta 6"', h).hits).toHaveLength(1);
  });

  it('las rutas y archivos del prototipo anterior nunca se aceptan, ni dentro de un titular', () => {
    const sneaky = { id: 'fnd-y', title: 'Creator shares assets/frames and video-guia', sources: [{ url: URL_OK, title: 'Creator shares assets/frames and video-guia' }] };
    const h = collectHeadlines([sneaky], sources);
    expect(h.size).toBe(0); // un titular con rutas prohibidas no se registra como legítimo
    const r = scanText('dist/assets/x.js', 'creator shares assets/frames and video-guia', h);
    expect(r.hits.map((x) => x.term).sort()).toEqual(['assets/frames', 'creator', 'video-guia']);
    for (const t of ['portada-1920x1080', 'video_stops', 'timg(', 'leonida_atlas_gta6', 'watermark', 'tiktok'])
      expect(scanText('src/x.ts', `const a = "${t}"`, headlines).hits.length, t).toBeGreaterThan(0);
    expect(PROHIBITED_FILES.test('/public/media/video-guia.mp4')).toBe(true);
    expect(PROHIBITED_FILES.test('/public/assets/frames/f01.jpg')).toBe(true);
    expect(PROHIBITED_FILES.test('/public/portada-1920x1080.webp')).toBe(true);
  });

  it('el id «fnd-…» se acepta solo si su titular es legítimo', () => {
    expect(scan('intel/findings.json', `"id": "${news.id}"`).hits).toEqual([]);
    expect(scan('intel/findings.json', '"id": "fnd-creator-leak-video"').hits).toHaveLength(1);
  });
});
