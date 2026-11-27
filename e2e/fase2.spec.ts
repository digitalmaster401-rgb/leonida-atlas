import { expect, test, type Page } from '@playwright/test';
import { noHorizontalOverflow, shot, watchConsole } from './helpers';

// PNG real de 1×1 px para probar las fotos personales (IndexedDB)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const encode = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');

async function clean(page: Page, path: string) {
  const errors = watchConsole(page);
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  return errors;
}

test.describe('Fase 2: trucos, coleccionables, consola, equipamiento y Mi espacio', () => {
  test('trucos: consecuencias, secuencias por consola y secuencias desconocidas', async ({ page }, info) => {
    const errors = await clean(page, '/trucos');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trucos y códigos');
    const rules = page.getByTestId('cheat-rules');
    await expect(rules).toContainText('Guardado');
    await expect(rules).toContainText('Trofeos y logros');
    await expect(rules).toContainText('no funcionan en línea');
    const money = page.getByTestId('cheat').filter({ hasText: '$250,000 Money' });
    await expect(money.getByRole('img')).toHaveAttribute('aria-label', /Mantén L1 \+ R1: ↑ → ↓ ←|Mantén L1 \+ R1: ↑ ↓|Mantén L1 \+ R1/);
    await expect(money.getByRole('img')).toHaveAttribute('aria-label', /Arriba, Derecha, Abajo, Izquierda, Arriba, Izquierda, Abajo, Derecha/);
    await page.getByRole('button', { name: 'Xbox Series X|S' }).click();
    await expect(money.getByRole('img')).toHaveAttribute('aria-label', /Mantén LB \+ RB/);
    await expect(page).toHaveURL(/consola=xbox/);
    const unknown = page.getByTestId('cheat').filter({ hasText: 'No Fall Damage' });
    await expect(unknown.getByTestId('seq-unknown')).toBeVisible();
    await page.getByRole('button', { name: 'Solo con secuencia' }).click();
    await expect(page.getByTestId('cheat')).toHaveCount(19);
    await expect(page.getByTestId('seq-unknown')).toHaveCount(0);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '20-trucos');
  });

  test('coleccionables: seguimiento individual, contador, ocultar encontrados y persistencia', async ({ page }, info) => {
    const errors = await clean(page, '/coleccionables');
    await expect(page.getByTestId('collection')).toHaveCount(6);
    const orca = page.getByTestId('col-item').filter({ hasText: 'Orca: A Whole Different Animal' });
    await orca.getByRole('button', { name: /Marcar Orca/ }).click();
    await expect(page.getByTestId('col-summary')).toContainText('1 de 18');
    const peche = page.getByTestId('col-item').filter({ hasText: 'Pêche Magazine' });
    await peche.getByRole('combobox').selectOption('revisar');
    await page.getByRole('button', { name: 'Sumar 1 a Tarjetas coleccionables' }).click();
    await page.getByRole('button', { name: 'Sumar 1 a Tarjetas coleccionables' }).click();
    await expect(page.locator('#cnt-col-tarjetas')).toHaveValue('2');
    await page.getByRole('button', { name: 'Revisar' }).click();
    await expect(page.getByTestId('col-item')).toHaveCount(1);
    await page.getByRole('button', { name: 'Todos' }).click();
    await page.getByTestId('hide-found').check();
    await expect(orca).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId('hide-found')).toBeChecked();
    await expect(page.locator('#cnt-col-tarjetas')).toHaveValue('2');
    await page.getByTestId('hide-found').uncheck();
    await expect(orca.getByRole('button', { name: /Desmarcar Orca/ })).toHaveAttribute('aria-pressed', 'true');
    await noHorizontalOverflow(page);
    // el mapa comparte la preferencia
    await page.getByTestId('hide-found').check();
    await page.goto('/mapa');
    await expect(page.getByTestId('map-hide-found')).toBeChecked();
    expect(errors).toEqual([]);
    await page.goto('/coleccionables');
    await shot(page, info, '21-coleccionables');
  });

  test('ficha: Mi registro, lista para hoy y fotos personales en IndexedDB', async ({ page }, info) => {
    const errors = await clean(page, '/coleccionables/peche');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pêche Magazine');
    await page.getByTestId('rec-state').selectOption('encontrado');
    await expect(page.getByTestId('btn-done')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#rec-date')).not.toHaveValue('');
    await page.locator('#rec-date').fill('2026-11-21');
    await page.locator('#rec-platform').selectOption('ps5_pro');
    await page.getByRole('button', { name: '4 de 5' }).click();
    await page.getByTestId('btn-today').click();
    const gallery = page.getByTestId('photo-gallery');
    await gallery.getByTestId('photo-input').setInputFiles({ name: 'peche.png', mimeType: 'image/png', buffer: PNG });
    await expect(gallery.getByTestId('photo-item')).toHaveCount(1);
    await expect(gallery.locator('img')).toHaveAttribute('src', /^blob:/);
    await expect.poll(() => gallery.locator('img').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1);
    await gallery.getByRole('textbox', { name: 'Descripción de la foto' }).fill('Sobre la cama');
    await gallery.getByRole('textbox', { name: 'Descripción de la foto' }).blur();
    // La descripción se guarda en IndexedDB de forma asíncrona: se espera la confirmación antes de recargar.
    await expect(gallery.getByTestId('caption-status')).toHaveText('Descripción guardada');
    // formatos no admitidos se rechazan
    await gallery.getByTestId('photo-input').setInputFiles({ name: 'x.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await expect(gallery.getByRole('alert')).toContainText('Formato no admitido');
    await page.reload();
    await expect(page.getByTestId('photo-gallery').getByTestId('photo-item')).toHaveCount(1);
    await expect(page.locator('#rec-platform')).toHaveValue('ps5_pro');
    await expect(page.getByRole('button', { name: '4 de 5' })).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/mi-espacio');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio');
    await expect(page.getByRole('heading', { name: 'Lista para hoy (1)' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Encontrados \(1\)/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel').getByText('Pêche Magazine')).toBeVisible();
    await expect(page.getByRole('tabpanel')).toContainText('PS5 Pro');
    await page.getByRole('tab', { name: /Pendientes/ }).click();
    await expect(page.getByRole('tabpanel').getByTestId('entry-row').first()).toBeVisible();
    await expect(page.getByTestId('photo-gallery').getByTestId('photo-item')).toHaveCount(1);
    await expect(page.getByTestId('photo-gallery').getByRole('textbox', { name: 'Descripción de la foto' })).toHaveValue('Sobre la cama');
    await page.locator('#prof-name').fill('Lu');
    await page.getByTestId('prof-platform').selectOption('xbox_series_s');
    await page.getByText('Ola', { exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio: Lu');

    // exportar con fotos e importar en un dispositivo «nuevo»
    await page.getByTestId('export-photos').check();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-btn').click()]);
    const fs = await import('node:fs');
    const text = fs.readFileSync((await download.path())!, 'utf8');
    const exported = JSON.parse(text);
    expect(exported.data.schemaVersion).toBe(5);
    expect(exported.data.records['col-peche']).toMatchObject({ date: '2026-11-21', platform: 'ps5_pro', rating: 4 });
    expect(exported.photos).toHaveLength(1);
    expect(exported.photos[0].dataUrl).toMatch(/^data:image\/png;base64,/);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Borrar mis fotos' }).click();
    await expect(page.getByTestId('photo-gallery').getByTestId('photo-item')).toHaveCount(0);
    await page.getByTestId('import-input').setInputFiles({ name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    await expect(page.getByRole('dialog', { name: 'Confirmar importación' })).toContainText('1 fotos');
    await page.getByRole('button', { name: 'Combinar con lo actual' }).click();
    await expect(page.getByTestId('photo-gallery').getByTestId('photo-item')).toHaveCount(1);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '22-mi-espacio');
  });

  test('migración: un progreso v2 guardado se convierte a v4 sin perder datos', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem(
        'leonida-atlas:progress',
        JSON.stringify({ schemaVersion: 2, favorites: ['arm-duke-556'], completed: ['arm-duke-556'], notes: { 'arm-duke-556': { text: 'nota v2', updatedAt: '2026-11-20T00:00:00Z' } }, settings: { spoilerLevel: 2 }, updatedAt: '2026-11-20T00:00:00Z' }),
      );
    });
    const errors = await clean(page, '/mi-espacio');
    await expect(page.getByRole('heading', { name: 'Guardadas (1)' })).toBeVisible();
    await expect(page.getByText('nota v2')).toBeVisible();
    await expect(page.getByLabel(/Todos \(incluye etapas avanzadas\)/)).toBeChecked();
    await page.locator('#prof-name').fill('X');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('leonida-atlas:progress')!));
    expect(saved.schemaVersion).toBe(5);
    expect(saved.favorites).toEqual(['arm-duke-556']);
    expect(saved.settings).toEqual({ spoilerLevel: 2, hideFound: false });
    expect(errors).toEqual([]);
  });

  test('consola: ajustes por plataforma, separando juego y consola', async ({ page }, info) => {
    const errors = await clean(page, '/consola');
    await expect(page.getByTestId('console-title')).toHaveText('PS5');
    await expect(page.getByText(/apunta a 30 fps/)).toBeVisible();
    await page.getByRole('button', { name: 'PS5 Pro' }).click();
    await expect(page.getByTestId('console-title')).toHaveText('PS5 Pro');
    await expect(page.getByText(/PSSR/).first()).toBeVisible();
    await page.getByRole('button', { name: 'Xbox Series S' }).click();
    await expect(page.getByText(/≈720p en Series S/)).toBeVisible();
    await expect(page.getByText('Hápticos del DualSense')).toHaveCount(0);
    await expect(page.getByText('Menú de la consola')).toBeVisible();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '23-consola');
  });

  test('equipamiento: reglas, armas únicas, guardar, comparar y compartir', async ({ page }, info) => {
    const errors = await clean(page, '/equipamiento');
    await page.getByTestId('slot-sidearm-0').selectOption('arm-klose-k17');
    await page.getByTestId('slot-sidearm-1').selectOption('arm-duke-556');
    await expect(page.getByTestId('lo-warnings')).toContainText('Duke 556 es arma larga, no arma corta');
    await page.getByTestId('slot-sidearm-1').selectOption('arm-scorpio-nipper-38');
    await page.getByTestId('slot-longarm-0').selectOption('arm-vice-city-heathen');
    await expect(page.getByText('Arma única: no se puede modificar.')).toBeVisible();
    await page.getByRole('group', { name: 'Klose K17' }).getByRole('button', { name: /Silenciador/ }).click();
    await expect(page.getByTestId('lo-cost')).toContainText('$6,675');
    await expect(page.getByTestId('lo-warnings')).not.toContainText('Error');
    await page.locator('#lo-name').fill('Asalto');
    await page.getByTestId('lo-save').click();
    await page.getByRole('button', { name: 'Nuevo' }).click();
    await page.locator('#lo-name').fill('Sigilo');
    await page.getByTestId('slot-melee-0').selectOption('arm-shark-knife');
    await page.getByTestId('lo-save').click();
    await expect(page.getByTestId('saved-loadout')).toHaveCount(2);
    await expect(page.getByTestId('compare-table')).toContainText('Vice City Heathen');
    await page.reload();
    await expect(page.getByTestId('saved-loadout')).toHaveCount(2);
    await noHorizontalOverflow(page);
    // enlace compartido
    await page.goto(`/equipamiento?c=${encode({ n: 'De un amigo', s: ['arm-girardi-es9', null], l: ['arm-fortune-son-moreland-850', null], m: [null], a: {} })}`);
    await expect(page.locator('#lo-name')).toHaveValue('De un amigo');
    await expect(page.getByTestId('slot-longarm-0')).toHaveValue('arm-fortune-son-moreland-850');
    await expect(page).toHaveURL(/\/equipamiento$/);
    await expect(page.getByText('Equipamiento compartido cargado. Guárdalo si quieres conservarlo.')).toHaveCount(1);
    expect(errors).toEqual([]);
    await shot(page, info, '24-equipamiento');
  });
});
