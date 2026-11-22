import { expect, test } from '@playwright/test';

test('funciona sin conexión tras la primera visita (service worker)', async ({ page, context }, info) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  });
  // segunda carga para que el SW controle la página y precachee
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.goto('/armas/duke-556');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duke 556');
  await page.getByTestId('btn-fav').click();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duke 556');
  await expect(page.getByTestId('btn-fav')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/rutas/empieza-aqui');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Empieza aquí');
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByTestId('offline-banner')).toBeVisible();
  await page.screenshot({ path: `qa/screenshots/${info.project.name}-sin-conexion.png` });
  await context.setOffline(false);
});
