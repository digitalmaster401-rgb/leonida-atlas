import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * Mensaje exacto de WebKit cuando la CSP bloquea una hoja de estilos inline. Playwright 1.63 inserta
 * `<style>body {}</style>` en cada captura de pantalla en WebKit (screenshotter.ts →
 * inPagePrepareForScreenshots, porque shouldToggleStyleSheetToSyncAnimations() es true en WebKit).
 * Esa hoja la añade la herramienta de pruebas, no la app, y la CSP estricta (style-src 'self') la
 * bloquea como debe. Solo se descarta ese mensaje y solo mientras dura una captura en WebKit.
 */
const WEBKIT_SCREENSHOT_CSP = "Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear in the style-src directive of the Content Security Policy.";

const capturing = new WeakMap<Page, boolean>();

export function watchConsole(page: Page) {
  const errors: string[] = [];
  const isWebKit = page.context().browser()?.browserType().name() === 'webkit';
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    if (isWebKit && capturing.get(page) && m.text() === WEBKIT_SCREENSHOT_CSP) return;
    errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return errors;
}

export async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'desbordamiento horizontal en px').toBeLessThanOrEqual(1);
}

export async function shot(page: Page, info: TestInfo, name: string) {
  const dir = `qa/screenshots/${info.project.name}`;
  mkdirSync(dir, { recursive: true });
  capturing.set(page, true);
  try {
    await page.screenshot({ path: `${dir}/${name}.png`, caret: 'initial', animations: 'allow' });
    // los mensajes de consola llegan de forma asíncrona: margen breve antes de cerrar la ventana
    await page.waitForTimeout(50);
  } finally {
    capturing.set(page, false);
  }
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

export async function goSection(page: Page, label: string) {
  if (isMobile(page)) {
    const bottom = page.getByRole('navigation', { name: 'Navegación principal' });
    const direct = bottom.getByRole('link', { name: label, exact: true });
    if (await direct.count()) await direct.click();
    else {
      await bottom.getByRole('button', { name: 'Menú' }).click();
      await page.getByRole('navigation', { name: 'Todas las secciones' }).getByRole('link', { name: label }).click();
    }
  } else {
    await page.getByRole('navigation', { name: 'Secciones' }).getByRole('link', { name: label }).click();
  }
}
