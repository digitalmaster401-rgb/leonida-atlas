import { expect, test } from '@playwright/test';
import { noHorizontalOverflow, shot, watchConsole } from './helpers';

test.describe('Fase 4C · calibración (herramienta interna)', () => {
  test('modelos, errores independientes, roles de puntos, rechazo fuera del póster y exportación', async ({ page }, info) => {
    test.skip(!['chromium-390', 'chromium-1280', 'iphone-14-emulado', 'iphone-14-webkit'].includes(test.info().project.name), 'herramienta interna: un móvil, un escritorio y iPhone');
    const errors = watchConsole(page);
    await page.goto('/editor/calibracion');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calibración cartográfica');
    const decision = page.getByTestId('calib-decision');
    await expect(decision).toContainText('«zona»');
    await page.getByRole('group', { name: 'Modelo de transformación' }).getByRole('button', { name: /Similaridad/ }).click();
    await expect(decision).toContainText('Insuficiente');
    await page.getByRole('group', { name: 'Modelo de transformación' }).getByRole('button', { name: /Afín/ }).click();
    // Con menos de 8 puntos de entrenamiento no se acepta.
    for (const name of ['Bayside', 'Crosstown', 'Key Lento', 'Little Cuba']) await page.getByLabel(`Uso de ${name}`).selectOption('excluido');
    await expect(decision).toContainText('se necesitan al menos 8');
    await page.getByRole('button', { name: /Volver a la versión guardada/ }).click();
    await expect(decision).toContainText('«zona»');
    // Una coordenada fuera del póster se rechaza.
    await page.getByLabel('x (m)').fill('90000');
    await page.getByLabel('y (m)').fill('0');
    await expect(page.getByTestId('calib-probe')).toContainText('RECHAZADA: fuera del póster');
    await page.getByLabel('x (m)').fill('-1156.82');
    await page.getByLabel('y (m)').fill('52.35');
    await expect(page.getByTestId('calib-probe')).toContainText('pendiente de revisión');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Exportar transformación/ }).click();
    expect((await download).suggestedFilename()).toMatch(/^transformacion-v2-afin\.json$/);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4c-01-calibracion');
  });
});

test.describe('Fase 4C · catálogos visuales', () => {
  test('vehículos: portada fotográfica, filtros por tipo, ficha con valores y evidencia, comparador y mapa', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/vehiculos');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Vehículos/);
    await expect(page.getByTestId('catalog-hero').locator('img')).toHaveAttribute('src', /^\/media\/official\//);
    await expect(page.getByTestId('catalog-hero')).toContainText(/\d+ oficial/);
    const cards = page.getByTestId('item-card');
    const total = await cards.count();
    await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: /^Muscle \d/ }).click();
    await expect(page).toHaveURL(/tipo=Muscle/);
    await expect.poll(() => cards.count()).toBeLessThan(total);
    for (const c of await cards.all()) await expect(c.locator('.card-spec')).toContainText('Muscle');
    await page.getByRole('group', { name: 'Tipo' }).getByRole('button', { name: /^Todos/ }).click();
    await expect(cards).toHaveCount(total);
    await expect(page.getByTestId('catalog-hero').getByRole('link', { name: /Comparar vehículos/ })).toHaveAttribute('href', '/comparar-vehiculos');
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4c-02-vehiculos');
    await page.goto('/vehiculos/grotti-cheetah-95');
    const stats = page.getByTestId('stat-panel');
    await expect(stats).toContainText('Venta');
    await expect(stats).toContainText('no se muestran');
    await stats.scrollIntoViewIfNeeded();
    await shot(page, info, '4c-03-vehiculo-ficha');
  });

  test('armas y dinero: portada, estadísticas sin inventar y accesos reales', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/armas');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Armas/);
    await expect(page.getByTestId('catalog-hero').getByRole('link', { name: /Constructor de equipamiento/ })).toHaveAttribute('href', '/equipamiento');
    await page.getByTestId('item-card').first().getByRole('link').first().click();
    await expect(page.getByTestId('stat-panel')).toContainText('no las ha publicado');
    await page.goto('/dinero');
    await expect(page.getByTestId('catalog-hero')).toContainText(/contrastado/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Dinero y glitches/);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4c-04-dinero');
    await page.goto('/armas');
    await shot(page, info, '4c-05-armas');
  });
});
