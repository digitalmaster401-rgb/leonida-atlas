import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const entries = JSON.parse(readFileSync('content/entries.json', 'utf8'));

const CAT: Record<string, string> = { lugares: '/lugares', personajes: '/personajes', dinero: '/dinero', armas: '/armas', vehiculos: '/vehiculos', negocios: '/negocios', rutas: '/rutas' };

test.describe('integridad del sitio publicado', () => {
  test.skip(() => test.info().project.name !== 'chromium-1280', 'una sola pasada basta');

  test('todas las rutas de fichas responden 200 con su título prerenderizado', async ({ request }) => {
    for (const e of entries as { category: string; slug: string; name: string }[]) {
      const res = await request.get(`${CAT[e.category]}/${e.slug}`);
      expect(res.status(), e.slug).toBe(200);
      expect(await res.text()).toContain(`<title>${e.name.replace(/&/g, '&amp;')} · LEONIDA ATLAS</title>`);
    }
  });

  test('sin enlaces internos rotos ni imágenes rotas', async ({ page, request }) => {
    const seen = new Set<string>();
    const queue = ['/', '/mapa', '/dinero', '/armas', '/vehiculos', '/negocios', '/rutas', '/lugares', '/personajes', '/galeria', '/fuentes', '/legal', '/mi-partida'];
    const broken: string[] = [];
    for (const path of queue) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // fuerza la carga de imágenes diferidas
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      await page.waitForLoadState('networkidle');
      const imgs = await page.$$eval('img', (els) => els.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('loading') !== 'lazy').map((i) => i.src));
      broken.push(...imgs.map((s) => `${path}: imagen rota ${s}`));
      const hrefs = await page.$$eval('a[href^="/"]', (els) => els.map((a) => a.getAttribute('href')!));
      for (const h of hrefs) {
        const clean = h.split('#')[0];
        if (seen.has(clean)) continue;
        seen.add(clean);
        const res = await request.get(clean);
        if (res.status() !== 200) broken.push(`${path} → ${clean}: ${res.status()}`);
      }
    }
    expect(broken).toEqual([]);
    expect(seen.size).toBeGreaterThan(60);
  });

  test('archivos PWA y recursos de marca disponibles', async ({ request }) => {
    for (const p of ['/manifest.webmanifest', '/sw.js', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/og/leonida-atlas-og.png', '/robots.txt', '/media/media-manifest.json']) {
      expect((await request.get(p)).status(), p).toBe(200);
    }
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    expect(manifest.lang).toBe('es-MX');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
    const home = await (await request.get('/')).text();
    expect(home).not.toMatch(/tiktok|video-guia|assets\/frames|portada-1920x1080/i);
  });

  test('cabeceras de seguridad aplicadas', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });
});
