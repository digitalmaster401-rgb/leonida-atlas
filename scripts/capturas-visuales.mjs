// Capturas reales para la revisión visual (Fase 4A.2): 360, 390, 430 y 1440 px.
// Uso: node scripts/capturas-visuales.mjs [url-base] [carpeta-salida] [--completa]  (--completa añade la página entera)
// Requiere el sitio servido (npm run serve:dist). Las capturas se hacen tras cargar la red y terminar las animaciones.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const full = process.argv.includes('--completa');
const base = args[0] ?? 'http://localhost:4173';
const out = args[1] ?? 'qa/visual';
const widths = [360, 390, 430, 1440];
const pages = [
  ['/', 'explorar'],
  ['/novedades', 'novedades'],
  ['/mapa', 'mapa'],
  ['/mapa?id=lug-ambrosia', 'mapa-panel'],
  ['/mi-espacio', 'mi-espacio'],
  ['/vehiculos', 'vehiculos'],
  ['/vehiculos/grotti-cheetah-95', 'vehiculo-ficha'],
  ['/armas', 'armas'],
  ['/dinero', 'dinero'],
  ['/editor/calibracion', 'calibracion'],
];

const browser = await chromium.launch();
for (const w of widths) {
  const mobile = w < 1024;
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 900 : 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'es-MX', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  mkdirSync(`${out}/${w}`, { recursive: true });
  for (const [path, name] of pages) {
    await page.goto(base + path);
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
    await page.screenshot({ path: `${out}/${w}/${name}.png` });
    if (full) await page.screenshot({ path: `${out}/${w}/${name}-completa.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(`capturas en ${out}/{${widths.join(',')}}`);
