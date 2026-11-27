import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';

export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()}`));
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return errors;
}

/**
 * Compara contra el ancho configurado del viewport, no contra window.innerWidth: con isMobile, Chromium
 * agranda el viewport de diseño para que quepa el contenido (innerWidth crece) y ocultaba desbordamientos
 * que Safari/WebKit sí muestra. Si falla, el mensaje nombra los elementos que sobresalen.
 */
export async function noHorizontalOverflow(page: Page) {
  const width = page.viewportSize()?.width ?? (await page.evaluate(() => window.innerWidth));
  const res = await page.evaluate((w) => {
    const over = [...document.querySelectorAll('body *')]
      .map((el) => ({ el, r: el.getBoundingClientRect().right + window.scrollX }))
      .filter(({ el, r }) => r > w + 1 && !el.closest('.table-wrap, .map-viewport, .minimap-frame, .photo-grid, .region-strip'))
      .slice(0, 5)
      .map(({ el, r }) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} → ${Math.round(r)}px`);
    return { overflow: document.documentElement.scrollWidth - w, over };
  }, width);
  expect(res.overflow, `desbordamiento horizontal en px (${res.over.join(', ') || 'sin elemento identificado'})`).toBeLessThanOrEqual(1);
}

/**
 * Captura para el reporte de QA. Úsala DESPUÉS de verificar los errores de consola: en WebKit,
 * Playwright 1.63 inserta `<style>body {}</style>` en cada captura (screenshotter.ts →
 * inPagePrepareForScreenshots, porque shouldToggleStyleSheetToSyncAnimations() es true) y la CSP
 * estricta del sitio la bloquea, como debe. Ver e2e/csp-webkit.spec.ts. No se filtra ningún mensaje.
 */
export async function shot(page: Page, info: TestInfo, name: string) {
  const dir = `qa/screenshots/${info.project.name}`;
  mkdirSync(dir, { recursive: true });
  // Espera a que termine la transición de entrada (solo opacidad) para no capturar la pantalla a medio aparecer.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await page.screenshot({ path: `${dir}/${name}.png`, caret: 'initial', animations: 'allow' });
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

export async function goSection(page: Page, label: string) {
  if (isMobile(page)) {
    const bottom = page.getByRole('navigation', { name: 'Navegación principal' });
    const direct = bottom.getByRole('link', { name: label, exact: true });
    if (await direct.count()) await direct.click();
    else {
      // Fase 4A: las secciones que no son pestaña se abren desde el catálogo «Todas las secciones» de Explorar.
      await bottom.getByRole('link', { name: 'Explorar', exact: true }).click();
      await page.getByRole('navigation', { name: 'Todas las secciones' }).getByRole('link', { name: label, exact: true }).click();
    }
  } else {
    await page.getByRole('navigation', { name: 'Secciones', exact: true }).getByRole('link', { name: label, exact: true }).click();
  }
}
