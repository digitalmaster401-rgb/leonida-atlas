import { expect, test } from '@playwright/test';
import { isMobile, noHorizontalOverflow, shot, watchConsole } from './helpers';

const TABS = ['Mapa', 'Explorar', 'Dinero', 'Mi espacio', 'Novedades'];

// Rutas existentes → pestaña que debe marcarse como activa.
const LEGACY: [string, string][] = [
  ['/', 'Explorar'],
  ['/explorar', 'Explorar'],
  ['/buscar?q=duke', 'Explorar'],
  ['/armas', 'Explorar'],
  ['/armas/duke-556', 'Explorar'],
  ['/trucos', 'Explorar'],
  ['/coleccionables', 'Explorar'],
  ['/comparar-vehiculos', 'Explorar'],
  ['/galeria', 'Explorar'],
  ['/fuentes', 'Explorar'],
  ['/mapa', 'Mapa'],
  ['/mis-rutas', 'Mapa'],
  ['/dinero', 'Dinero'],
  ['/dinero/vender-autos-a-moses', 'Dinero'],
  ['/mi-espacio', 'Mi espacio'],
  ['/mi-partida', 'Mi espacio'],
  ['/novedades', 'Novedades'],
  ['/intel', 'Novedades'],
  ['/intel?seccion=bitacora', 'Novedades'],
];

test.describe('Fase 4A · navegación de 5 pestañas', () => {
  test('barra inferior: cinco pestañas táctiles, sección activa y sin desbordamiento', async ({ page }, info) => {
    test.skip(!isMobile(page), 'la barra inferior es de móvil y tableta');
    const errors = watchConsole(page);
    await page.goto('/');
    const bar = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(bar.getByRole('link')).toHaveText(TABS);
    await expect(bar.getByRole('button')).toHaveCount(0);
    for (const label of TABS) {
      const tab = bar.getByRole('link', { name: label, exact: true });
      const box = await tab.boundingBox();
      expect(box!.height, `${label}: altura táctil`).toBeGreaterThanOrEqual(44);
      expect(box!.width, `${label}: ancho táctil`).toBeGreaterThanOrEqual(44);
      // Toque real donde el perfil tiene pantalla táctil (360, 390, Pixel 7, iPhone); clic en tableta sin táctil.
      if (test.info().project.use.hasTouch) await tab.tap();
      else await tab.click();
      await expect(tab).toHaveAttribute('aria-current', 'page');
      await expect(bar.locator('[aria-current]')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await noHorizontalOverflow(page);
    }
    expect(errors).toEqual([]);
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Mapa', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mapa de Leonida/i);
    await shot(page, info, '4a-00-mapa-barra'); // después de verificar la consola (ver helpers.shot)
  });

  test('todas las URL anteriores siguen funcionando y marcan su pestaña', async ({ page }) => {
    test.skip(!['chromium-390', 'chromium-1280'].includes(test.info().project.name), 'un ancho móvil y uno de escritorio');
    const errors = watchConsole(page);
    for (const [path, tab] of LEGACY) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 }), path).toBeVisible();
      if (isMobile(page)) {
        await expect(page.getByRole('navigation', { name: 'Navegación principal' }).locator('[aria-current]'), path).toHaveText(tab);
      } else {
        await expect(page.locator('.side-group.is-current .side-title'), path).toHaveText(tab);
      }
    }
    expect(errors).toEqual([]);
  });
});

test.describe('Fase 4A · Explorar', () => {
  test('portada: cabecera, menú lateral, banner, regiones, tarjetas, novedades, progreso y catálogo', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Explora\s*Leonida/i);
    await expect(page.getByRole('link', { name: /LEONIDA ATLAS/ }).first()).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'Novedades', exact: true }).first()).toBeVisible();
    // Regiones: las 6 regiones oficiales con foto.
    const regions = page.locator('.neo-regions li');
    await expect(regions).toHaveCount(6);
    // Tarjetas con foto oficial y número real de fichas.
    const cards = page.getByTestId('visual-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.first()).toContainText(/\d+ fichas/);
    for (const img of await cards.locator('img').all()) await expect(img).toHaveAttribute('src', /^\/media\/official\//);
    // Novedades con fuente original; la imagen se rotula (ficha relacionada o ilustración).
    await expect(page.getByTestId('news-photo')).toHaveCount(3);
    await expect(page.getByTestId('news-photo').first().locator('.neo-news-tag')).toHaveText(/Imagen de la ficha|Ilustración/);
    // Progreso calculado del almacenamiento local (vacío en un perfil nuevo).
    await expect(page.getByTestId('progress-panel')).toContainText(/0 \/ \d+/);
    await expect(page.getByTestId('progress-panel')).toContainText('Aún no marcas nada');
    const cats = page.locator('.cat-grid-visual .cat-tile');
    await expect(cats).toHaveCount(8);
    await expect(cats.first()).toContainText(/Evidencia: \d+ /);
    const all = page.getByRole('navigation', { name: 'Todas las secciones' });
    await expect(all.getByRole('link', { name: 'Galería', exact: true })).toBeVisible();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4a-01-explorar');
    await cards.first().scrollIntoViewIfNeeded();
    await shot(page, info, '4a-05-explorar-tarjetas');
    await page.getByRole('heading', { name: /Explora la guía/i }).scrollIntoViewIfNeeded();
    await shot(page, info, '4a-02-explorar-categorias');

    // Navegación real desde cada bloque.
    await page.getByRole('link', { name: /Comenzar exploración/ }).click();
    await expect(page).toHaveURL('/mapa');
    await page.goBack();
    await regions.first().getByRole('link').click();
    await expect(page).toHaveURL(/\/lugares\//);
    await page.goBack();
    await cards.filter({ hasText: 'Armas' }).click();
    await expect(page).toHaveURL('/armas');
    await page.goBack();
    await page.getByRole('searchbox', { name: 'Buscar', exact: true }).fill('stockyard');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page).toHaveURL(/\/buscar\?q=stockyard/);
    await page.goto('/');
    await all.getByRole('link', { name: 'Comparar vehículos', exact: true }).click();
    await expect(page).toHaveURL('/comparar-vehiculos');
  });

  test('progreso real: refleja lo marcado en el dispositivo', async ({ page }) => {
    await page.goto('/coleccionables');
    const first = page.getByRole('button', { name: /^Marcar / }).first();
    await first.click();
    await page.goto('/');
    await expect(page.getByTestId('progress-panel')).toContainText(/1 \/ \d+/);
    await expect(page.getByTestId('progress-panel')).not.toContainText('Aún no marcas nada');
  });

  test('menú lateral accesible: abre, navega y se cierra con Escape', async ({ page }) => {
    test.skip(!isMobile(page), 'en escritorio el menú es la barra lateral fija');
    await page.goto('/');
    const open = page.getByRole('button', { name: 'Abrir menú' });
    await open.click();
    const dialog = page.getByRole('dialog', { name: 'Menú' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await open.click();
    await dialog.getByRole('link', { name: 'Trucos y códigos' }).click();
    await expect(page).toHaveURL('/trucos');
    await expect(dialog).toBeHidden();
  });
});

test.describe('Fase 4A · Novedades', () => {
  test('línea de tiempo con fuente original, fecha y estado; filtros y aviso de verificación', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/novedades');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Novedades');
    await expect(page.getByTestId('news-stats')).toContainText('Última investigación real');
    await expect(page.getByRole('note').filter({ hasText: 'aún no están verificados' })).toBeVisible();
    const items = page.getByTestId('news-item');
    await expect(items.first()).toBeVisible();
    await expect(items.first().locator('.badge')).toBeVisible();
    await expect(items.first().getByRole('link').first()).toHaveAttribute('href', /^https:\/\//);
    await expect(items.first()).toContainText('Fuente original:');
    await expect(page.locator('.tl-date time').first()).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4a-03-novedades');
    // Fuentes consultadas: estado real (sin «monitoreo activo» ni canales inventados).
    const channels = page.getByTestId('watch-channel');
    await expect(channels).toHaveCount(4);
    await expect(channels.filter({ hasText: 'Video' })).toContainText('Desactivado');
    await expect(channels.filter({ hasText: 'Web y medios' })).toContainText(/\d+ de \d+ consultadas/);
    await expect(page.getByText('Monitoreo activo')).toHaveCount(0);
    await expect(page.getByTestId('review-item')).toHaveCount(3);
    await expect(page.locator('.release-card').first()).toHaveAttribute('href', '/fuentes');
    await page.locator('.watch').scrollIntoViewIfNeeded();
    await shot(page, info, '4a-04-novedades-fuentes');
    await page.locator('.review').scrollIntoViewIfNeeded();
    await shot(page, info, '4a-06-novedades-revision');

    const total = await page.getByTestId('news-count').textContent();
    const group = page.getByRole('group', { name: 'Estado de verificación' });
    await group.getByRole('button', { name: /^Reportado/ }).click();
    await expect(page).toHaveURL(/estado=reportado/);
    await expect(page.getByTestId('news-count')).not.toHaveText(total!);
    for (const b of await items.locator('.badge').first().all()) await expect(b).toContainText('Reportado');
    await group.getByRole('button', { name: /^Todos/ }).click();
    await page.getByRole('group', { name: 'Plataforma' }).getByRole('button', { name: 'PS5', exact: true }).click();
    await expect(page).toHaveURL(/plataforma=ps5/);
    await noHorizontalOverflow(page);
    await page.getByRole('link', { name: /Bitácora/ }).click();
    await expect(page).toHaveURL(/\/intel\?seccion=bitacora/);
    await expect(page.getByTestId('last-run')).toBeVisible();
  });

  test('enlaces antiguos /novedades?seccion=… abren el panel de ATLAS INTELLIGENCE', async ({ page }) => {
    await page.goto('/novedades?seccion=observacion');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/ATLAS INTELLIGENCE/);
    await expect(page.getByTestId('intel-count')).toBeVisible();
  });
});
