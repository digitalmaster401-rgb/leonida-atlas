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

export async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'desbordamiento horizontal en px').toBeLessThanOrEqual(1);
}

export async function shot(page: Page, info: TestInfo, name: string) {
  const dir = `qa/screenshots/${info.project.name}`;
  mkdirSync(dir, { recursive: true });
  // caret: 'initial' evita que Playwright inyecte una <style> para ocultar el cursor de texto.
  // En WebKit esa hoja inyectada pasa por la CSP real del sitio (style-src 'self') y se bloquea,
  // lo que generaba un error de consola ajeno a la app. Así la CSP se mantiene estricta.
  await page.screenshot({ path: `${dir}/${name}.png`, caret: 'initial', animations: 'allow' });
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
