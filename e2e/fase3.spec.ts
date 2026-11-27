import { expect, test, type Page } from '@playwright/test';
import { noHorizontalOverflow, shot, watchConsole } from './helpers';

async function openFilters(page: Page) {
  const d = page.getByTestId('map-filters');
  if ((await d.getAttribute('open')) === null) await d.locator('summary').click();
}

test.describe('Fase 3: mapa oficial v2, rutas, vehículos', () => {
  test('mapa: póster v2 en alta resolución, agrupación por zoom y lista sin ubicación', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mapa');
    const img = page.getByTestId('map-image');
    await expect(img).toHaveAttribute('data-poster', 'v2');
    await expect(img).toHaveAttribute('src', /mapa-oficial-leonida-v2-1200\.webp$/);
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1200);
    // con el mapa completo hay grupos; al tocar uno se acerca y se separan
    const clusters = page.getByTestId('map-cluster');
    const before = await clusters.count();
    expect(before).toBeGreaterThan(0);
    const vp = page.getByTestId('map-viewport');
    await clusters.first().click();
    await expect(vp).not.toHaveAttribute('data-scale', '1.00');
    await expect.poll(async () => (await page.getByTestId('map-pin').count()) + (await clusters.count())).toBeGreaterThan(before);
    // al acercar mucho se pide una resolución mayor (nunca la de 3840 en la vista general)
    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Acercar', exact: true }).click();
    await expect(page.getByTestId('map-image-hi')).toHaveAttribute('src', /v2-(2400|3840)\.webp$/);
    await expect(page.getByTestId('map-unknown')).toContainText('Sin ubicación documentada');
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await page.getByRole('button', { name: 'Restablecer vista' }).click();
    await shot(page, info, '30-mapa-v2');
  });

  test('mapa: capas, precisión, agrupación y póster persisten tras recargar', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto('/mapa');
    await openFilters(page);
    await noHorizontalOverflow(page);
    const total = Number((await page.getByTestId('map-count').innerText()).match(/de (\d+)/)![1]);
    await page.getByRole('group', { name: 'Capas temáticas' }).getByRole('button', { name: /Lugares/ }).click();
    await page.getByRole('group', { name: 'Precisión de la ubicación' }).getByRole('button', { name: 'Precisión: región' }).click();
    await page.getByTestId('map-cluster-toggle').uncheck();
    await page.getByTestId('map-poster').selectOption('v1');
    await expect(page.getByTestId('map-image')).toHaveAttribute('data-poster', 'v1');
    const visible = Number((await page.getByTestId('map-count').innerText()).match(/(\d+) puntos/)![1]);
    expect(visible).toBeLessThan(total);
    await expect(page.getByTestId('map-cluster')).toHaveCount(0);
    await page.reload();
    await openFilters(page);
    await expect(page.getByRole('group', { name: 'Capas temáticas' }).getByRole('button', { name: /Lugares/ })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('map-cluster-toggle')).not.toBeChecked();
    await expect(page.getByTestId('map-image')).toHaveAttribute('data-poster', 'v1');
    await expect(page.getByTestId('map-count')).toContainText(`${visible} puntos`);
    await page.getByRole('button', { name: 'Mostrar todo' }).click();
    await expect(page.getByTestId('map-count')).toContainText(`de ${total}`);
    expect(errors).toEqual([]);
  });

  test('mapa: si el póster v2 no carga, se usa el anterior', async ({ page }) => {
    // prueba de resiliencia: el fallo de red es intencional, por eso no se vigila la consola aquí
    await page.route(/mapa-oficial-leonida-v2-1200\.webp$/, (r) => r.abort());
    await page.goto('/mapa');
    await expect(page.getByRole('alert')).toContainText('se muestra el anterior');
    await expect(page.getByTestId('map-image')).toHaveAttribute('data-poster', 'v1');
    await expect.poll(() => page.getByTestId('map-image').evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  });

  test('rutas personales: crear, ordenar, visitar, ver en el mapa, editar y borrar', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mis-rutas');
    await page.getByTestId('route-new').click();
    await page.locator('#rt-name').fill('Revistas de Key Lento');
    await page.locator('#rt-obj').fill('Leer las lecturas de la casa de Jason');
    const q = page.locator('#rt-q');
    for (const t of ['Orca', 'Pêche', 'Trigger Happy']) {
      await q.fill(t);
      await page.getByRole('button', { name: new RegExp(`Añadir ${t}`) }).first().click();
    }
    await expect(page.getByTestId('stop')).toHaveCount(3);
    await page.getByRole('button', { name: 'Bajar parada 1' }).click();
    await expect(page.getByTestId('stop').first()).toContainText('Pêche');
    await page.getByTestId('stop').nth(1).getByLabel('Visitada').check();
    await page.getByTestId('route-save').click();
    const saved = page.getByTestId('saved-route');
    await expect(saved).toHaveCount(1);
    await expect(saved).toContainText('3 paradas · 1 visitadas (33 %)');
    await page.reload();
    await expect(page.getByTestId('saved-route')).toContainText('Revistas de Key Lento');
    await noHorizontalOverflow(page);
    // en el mapa: paradas numeradas y aviso de que las líneas no son caminos
    await page.getByRole('link', { name: 'Ver en el mapa' }).click();
    await expect(page).toHaveURL(/\/mapa\?ruta=ruta-/);
    await expect(page.getByTestId('route-banner')).toContainText('3 paradas, 1 visitadas');
    // las tres lecturas comparten el punto de zona «Key Lento»: un solo marcador con sus números
    await expect(page.getByTestId('map-stop')).toHaveCount(1);
    await expect(page.getByTestId('map-stop')).toHaveText('1·2·3');
    await expect(page.getByTestId('map-route')).toBeAttached();
    await expect(page.getByText(/No son caminos ni distancias reales/)).toBeVisible();
    expect(errors).toEqual([]);
    await shot(page, info, '31-ruta-en-mapa');
    // editar desde el mapa y borrar
    await page.getByRole('link', { name: 'Editar ruta' }).click();
    await expect(page.getByTestId('route-editor')).toContainText('Editar «Revistas de Key Lento»');
    await page.getByRole('button', { name: 'Quitar parada 3' }).click();
    await page.getByTestId('route-save').click();
    await expect(page.getByTestId('saved-route')).toContainText('2 paradas');
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Borrar Revistas de Key Lento' }).click();
    await expect(page.getByTestId('saved-route')).toHaveCount(0);
  });

  test('ficha: añadir a una ruta desde el punto del mapa', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto('/coleccionables/orca');
    await noHorizontalOverflow(page);
    await page.getByTestId('add-to-route').getByRole('button', { name: 'Añadir' }).click();
    await expect(page.getByText('Añadida a «Ruta 1».')).toBeVisible();
    await page.goto('/mi-espacio');
    await expect(page.getByTestId('my-routes')).toContainText('Ruta 1');
    await expect(page.getByTestId('my-routes')).toContainText('1 paradas');
    expect(errors).toEqual([]);
  });

  test('vehículos: comparar, resaltar, garaje y persistencia en Mi espacio', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/vehiculos');
    await page.getByRole('link', { name: 'Comparar vehículos y mi garaje' }).click();
    await expect(page).toHaveURL('/comparar-vehiculos');
    await expect(page.getByTestId('vehicle-row').first()).toContainText('Pegassi Infernus ’96');
    await page.getByRole('button', { name: 'Comparar Pegassi Infernus ’96' }).click();
    await page.getByRole('button', { name: 'Comparar Vapid Ganado' }).click();
    await page.getByRole('button', { name: 'Comparar Albany Hermes ’50' }).click();
    await expect.poll(() => decodeURIComponent(page.url())).toMatch(/v=veh-pegassi-infernus-96,veh-vapid-ganado,veh-albany-hermes-50/);
    const table = page.getByTestId('vehicle-compare');
    await expect(table).toContainText('$34,750');
    await expect(table).toContainText('No publicado');
    await expect(table.locator('td.is-best').first()).toContainText('$34,750');
    await expect(page.getByRole('button', { name: /^Comparar / }).first()).toBeDisabled();
    await table.getByRole('button', { name: 'Añadir Pegassi Infernus ’96 a mi garaje' }).click();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '32-comparar-vehiculos');
    await page.goto('/vehiculos/pegassi-infernus-96');
    await expect(page.getByTestId('btn-garage')).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/mi-espacio');
    await expect(page.getByTestId('my-garage')).toContainText('Pegassi Infernus ’96');
    await expect(page.getByTestId('my-garage')).toContainText('$17,160');
  });

  test('migración: un progreso v3 se convierte a la versión actual (v5) conservando todo', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded3')) return;
      sessionStorage.setItem('seeded3', '1');
      localStorage.setItem(
        'leonida-atlas:progress',
        JSON.stringify({
          schemaVersion: 3,
          favorites: ['arm-duke-556'],
          completed: ['col-orca'],
          notes: {},
          records: { 'col-orca': { date: '2026-11-21', rating: 5 } },
          counters: { 'col-tarjetas': 9 },
          today: ['col-peche'],
          loadouts: [{ id: 'eq-1', name: 'Asalto', sidearm: ['arm-klose-k17', null], longarm: [null, null], melee: [null], attachments: {}, updatedAt: '2026-11-22' }],
          profile: { name: 'Lu', avatar: 'ola', platform: 'ps5' },
          settings: { spoilerLevel: 1, hideFound: false },
          updatedAt: '2026-11-22T00:00:00Z',
        }),
      );
    });
    const errors = watchConsole(page);
    await page.goto('/mi-espacio');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio: Lu');
    await expect(page.getByTestId('col-stats')).toContainText('9/480');
    await expect(page.getByTestId('my-routes')).toContainText('Mis rutas (0)');
    await page.locator('#prof-name').fill('Lu2');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('leonida-atlas:progress')!));
    expect(saved.schemaVersion).toBe(5);
    expect(saved.loadouts[0].name).toBe('Asalto');
    expect(saved.records['col-orca'].rating).toBe(5);
    expect(saved.routes).toEqual([]);
    expect(saved.garage).toEqual([]);
    expect(errors).toEqual([]);
  });
});
