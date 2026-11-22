import { expect, test } from '@playwright/test';
import { noHorizontalOverflow, shot, watchConsole } from './helpers';

test.describe('ATLAS INTELLIGENCE', () => {
  test('panel: novedades, bitácora real y sin errores', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/intel');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/ATLAS INTELLIGENCE/);
    await expect(page.getByTestId('intel-summary')).toContainText('última investigación real');
    await expect(page.getByTestId('finding').first()).toBeVisible();
    await noHorizontalOverflow(page);
    await page.getByRole('tab', { name: 'Bitácora' }).click();
    await expect(page.getByTestId('last-run')).toContainText('Última investigación real');
    await expect(page.getByText('YouTube Data API (búsqueda de videos recientes)')).toBeVisible();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await page.getByRole('tab', { name: 'Novedades' }).click();
    await shot(page, info, '06-intel-novedades'); // después de verificar la consola (ver helpers.shot)
  });

  test('filtro por plataforma y categoría en observación (móvil)', async ({ page }, info) => {
    await page.goto('/intel?seccion=observacion');
    const count = page.getByTestId('intel-count');
    const total = Number((await count.textContent())?.match(/\d+/)?.[0]);
    expect(total).toBeGreaterThan(0);
    await page.getByRole('group', { name: 'Plataforma' }).getByRole('button', { name: 'Xbox Series S' }).click();
    await expect(page).toHaveURL(/plataforma=xbox_series_s/);
    await expect(count).toContainText('solo se muestran');
    await page.getByRole('group', { name: 'Plataforma' }).getByRole('button', { name: 'Xbox Series S' }).click();
    await page.getByLabel('Categoría').selectOption('mision');
    await expect(page.getByTestId('finding').first()).toHaveAttribute('data-category', 'mision');
    await noHorizontalOverflow(page);
    await shot(page, info, '07-intel-observacion');
  });

  test('Pregúntale a ATLAS no fabrica certezas', async ({ page }) => {
    await page.goto('/intel?seccion=preguntar');
    await page.getByLabel('Tu pregunta').fill('¿Qué glitch funciona hoy en Xbox?');
    await page.getByRole('button', { name: 'Preguntar' }).click();
    await expect(page.getByTestId('ask-answer')).toContainText('No puedo confirmarlo');
    await expect(page.getByTestId('ask-answer')).toContainText('Certeza: ninguna');
    await page.getByLabel('Tu pregunta').fill('¿Dónde está Stock 305?');
    await page.getByRole('button', { name: 'Preguntar' }).click();
    await expect(page.getByTestId('ask-answer').getByRole('link', { name: 'Ficha: Stock 305' })).toHaveAttribute('href', '/negocios/stock-305');
  });

  test('Enviar hallazgo valida y prepara un issue en cola de revisión', async ({ page }) => {
    await page.goto('/intel?seccion=enviar');
    await page.getByLabel('Enlace').fill('javascript:alert(1)');
    await page.getByLabel(/Descripción/).fill('Duplicar auto en capítulo 2');
    await page.getByRole('button', { name: 'Preparar envío' }).click();
    await expect(page.getByRole('alert')).toContainText('https');
    await page.getByLabel('Enlace').fill('https://www.youtube.com/watch?v=abc123');
    await page.getByRole('button', { name: 'Preparar envío' }).click();
    const link = page.getByTestId('submit-ready').getByRole('link', { name: /Abrir formulario en GitHub/ });
    const href = await link.getAttribute('href');
    expect(href).toContain('/issues/new?template=hallazgo.yml');
    expect(href).toContain('enlace=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc123');
  });

  test('enlace directo /novedades y desde Glitches', async ({ page, request }) => {
    expect((await request.get('/novedades')).status()).toBe(200);
    expect(await (await request.get('/intel')).text()).toContain('<title>ATLAS INTELLIGENCE · LEONIDA ATLAS</title>');
    await page.goto('/dinero?modo=glitches');
    await page.getByRole('link', { name: 'Ver glitches en observación en ATLAS INTELLIGENCE' }).click();
    await expect(page).toHaveURL(/categoria=glitch/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/ATLAS INTELLIGENCE/);
  });
});
