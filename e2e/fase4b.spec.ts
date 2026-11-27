import { expect, test } from '@playwright/test';
import { isMobile, noHorizontalOverflow, shot, watchConsole } from './helpers';

test.describe('Fase 4B · Mapa inmersivo', () => {
  test('buscador, filtros rápidos con contadores, leyenda, capas y panel inferior con acciones reales', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mapa');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mapa de Leonida/);
    // Contadores reales por categoría (encontrados o visitados / total ubicado).
    const chips = page.getByTestId('map-chip');
    await expect(chips.first()).toContainText(/\d+\/\d+/);
    // Filtro individual desde los chips rápidos y vuelta a «Todo».
    const total = Number((await page.getByTestId('map-count').innerText()).match(/de (\d+)/)![1]);
    await page.getByRole('group', { name: 'Filtro rápido por categoría' }).getByRole('button', { name: /^Lugares/ }).click();
    const only = Number((await page.getByTestId('map-count').innerText()).match(/(\d+) puntos/)![1]);
    expect(only).toBeLessThan(total);
    await page.getByRole('group', { name: 'Filtro rápido por categoría' }).getByRole('button', { name: /^Todo/ }).click();
    await expect(page.getByTestId('map-count')).toContainText(`${total} puntos visibles`);
    // Filtros agrupados en el panel de capas.
    await page.getByTestId('map-filters').locator('summary').click();
    await page.getByRole('group', { name: 'Filtros agrupados' }).getByRole('button').first().click();
    await expect(page.getByTestId('map-count')).not.toContainText(`${total} puntos visibles`);
    await page.getByRole('button', { name: 'Mostrar todo' }).click();
    await page.getByTestId('map-filters').locator('summary').click();
    // Leyenda desplegable.
    await page.getByRole('button', { name: 'Leyenda' }).click();
    await expect(page.getByTestId('map-legend')).toContainText('Marcador personal');
    await page.getByRole('button', { name: 'Leyenda' }).click();
    // Búsqueda: abre el panel inferior con foto, evidencia y precisión.
    await page.getByRole('searchbox', { name: 'Buscar en el mapa' }).fill('ambro');
    await page.getByTestId('map-hits').getByRole('button', { name: /Ambrosia/ }).click();
    await expect(page).toHaveURL(/id=lug-ambrosia/);
    const sheet = page.getByTestId('pin-panel');
    await expect(sheet).toContainText('Ambrosia');
    await expect(sheet).toContainText('Precisión: región');
    await expect(sheet.locator('img, .illustration').first()).toBeVisible();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4b-01-mapa-panel');
    // Acciones: favorito y visitado se guardan y llegan a Mi espacio.
    await sheet.getByRole('button', { name: 'Añadir a favoritos' }).click();
    await sheet.getByTestId('sheet-visited').click();
    await expect(sheet.getByTestId('sheet-visited')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('group', { name: 'Filtro rápido por categoría' }).getByRole('button', { name: /^Lugares/ }).click();
    await expect(page.getByRole('group', { name: 'Filtro rápido por categoría' }).getByRole('button', { name: /^Lugares/ })).toContainText(/1\/\d+/);
    await page.goto('/mi-espacio');
    await expect(page.getByTestId('ms-cards')).toContainText(/1 \/ \d+/);
    await expect(page.getByTestId('ms-activity')).toContainText('Lugar visitado');
    await expect(page.getByTestId('ms-activity')).toContainText('Ambrosia');
  });

  test('marcador personal con nota privada: crear, persistir, editar y borrar', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mapa');
    await page.getByTestId('map-add-marker').click();
    await expect(page.getByRole('status').filter({ hasText: 'Toca el mapa' })).toBeVisible();
    const vp = page.getByTestId('map-viewport');
    const box = (await vp.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.62);
    const form = page.getByTestId('marker-sheet');
    await expect(form).toBeVisible();
    await form.getByLabel('Nombre').fill('Mirador secreto');
    await form.getByLabel('Nota privada').fill('Ir al atardecer');
    await form.getByText('Foto', { exact: true }).click();
    await form.getByRole('button', { name: 'Guardar marcador' }).click();
    await expect(page.getByTestId('map-marker')).toHaveCount(1);
    await expect(page.getByTestId('map-count')).toContainText('1 marcadores personales');
    await page.reload();
    await expect(page.getByTestId('map-marker')).toHaveCount(1);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('leonida-atlas:progress')!).markers[0]);
    expect(saved).toMatchObject({ name: 'Mirador secreto', note: 'Ir al atardecer', icon: 'camara' });
    expect(saved.x).toBeGreaterThan(0);
    expect(saved.x).toBeLessThan(1);
    await page.getByRole('button', { name: 'Marcador personal: Mirador secreto' }).click();
    await expect(page.getByTestId('marker-sheet').getByLabel('Nota privada')).toHaveValue('Ir al atardecer');
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4b-02-mapa-marcador');
    await page.getByTestId('marker-sheet').getByRole('button', { name: 'Borrar' }).click();
    await expect(page.getByTestId('map-marker')).toHaveCount(0);
  });

  test('panel inferior: se amplía y se reduce con el asa (teclado)', async ({ page }) => {
    await page.goto('/mapa?id=lug-ambrosia');
    const handle = page.getByRole('button', { name: 'Ampliar panel' });
    await handle.click();
    await expect(page.getByTestId('pin-panel')).toHaveClass(/is-full/);
    await page.getByRole('button', { name: 'Reducir panel' }).click();
    await expect(page.getByTestId('pin-panel')).not.toHaveClass(/is-full/);
    await page.getByTestId('pin-panel').getByRole('button', { name: 'Cerrar panel' }).click();
    await expect(page.getByTestId('pin-panel')).toHaveCount(0);
  });
});

test.describe('Fase 4B · Mi espacio', () => {
  test('perfil, color, objetivos, logros de Atlas, actividad y acceso a ATLAS Intelligence con datos reales', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mi-espacio');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio');
    await expect(page.getByTestId('ms-atlas-progress')).toContainText('No es el porcentaje oficial del juego');
    await expect(page.getByTestId('ms-achievements')).toContainText('No son trofeos oficiales');
    await expect(page.getByText(/\bNivel \d|\d+ EXP\b|km recorridos/)).toHaveCount(0);
    await page.locator('#prof-name').fill('Lu');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio: Lu');
    await page.getByRole('button', { name: 'Color Cian' }).click();
    await expect(page.locator('.ms')).toHaveClass(/accent-cian/);
    const goals = page.getByTestId('ms-goals');
    await goals.getByLabel('Nuevo objetivo').fill('Encontrar todas las revistas');
    await goals.getByRole('button', { name: 'Añadir' }).click();
    await goals.getByRole('checkbox', { name: 'Encontrar todas las revistas' }).check();
    await expect(page.getByTestId('ms-activity')).toContainText('Objetivo cumplido');
    await page.reload();
    await expect(page.getByTestId('ms-goals').getByRole('checkbox', { name: 'Encontrar todas las revistas' })).toBeChecked();
    await expect(page.locator('.ms')).toHaveClass(/accent-cian/);
    await expect(page.getByTestId('ms-intel')).toHaveAttribute('href', '/novedades');
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4b-03-mi-espacio');
    await page.getByTestId('ms-achievements').scrollIntoViewIfNeeded();
    await shot(page, info, '4b-04-mi-espacio-logros');
  });

  test('migración: un progreso v4 pasa a v5 con respaldo y sin perder nada', async ({ page }) => {
    test.skip(isMobile(page) && test.info().project.name !== 'chromium-390', 'un ancho móvil basta');
    await page.goto('/');
    await page.evaluate(() => {
      const v4 = {
        schemaVersion: 4,
        favorites: ['veh-shitzu-squalo'],
        completed: ['col-orca'],
        notes: { 'col-orca': { text: 'nota', updatedAt: '2026-11-20T00:00:00Z' } },
        records: {},
        counters: {},
        today: [],
        loadouts: [],
        routes: [{ id: 'r1', name: 'Mi ruta', objective: '', stops: [{ entryId: 'lug-ambrosia', note: '', visited: true }], updatedAt: '2026-11-20T00:00:00Z' }],
        garage: ['veh-shitzu-squalo'],
        profile: { name: 'Lu', avatar: 'ola', platform: 'ps5' },
        settings: { spoilerLevel: 1, hideFound: false },
        updatedAt: '2026-11-20T00:00:00Z',
      };
      localStorage.setItem('leonida-atlas:progress', JSON.stringify(v4));
    });
    await page.goto('/mi-espacio');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mi espacio: Lu');
    await expect(page.getByTestId('ms-cards')).toContainText('Rutas guardadas');
    const backup = await page.evaluate(() => JSON.parse(localStorage.getItem('leonida-atlas:progress-backup')!));
    expect(backup.schemaVersion).toBe(4);
    await page.locator('#prof-name').fill('Lu2');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('leonida-atlas:progress')!));
    expect(saved.schemaVersion).toBe(5);
    expect(saved.routes[0].name).toBe('Mi ruta');
    expect(saved.garage).toEqual(['veh-shitzu-squalo']);
    expect(saved.notes['col-orca'].text).toBe('nota');
    expect(saved.profile).toMatchObject({ platform: 'ps5', accent: 'magenta' });
    expect(saved.visited).toEqual([]);
  });
});
