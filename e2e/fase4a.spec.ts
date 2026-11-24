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
  test('buscador principal, categorías visuales y catálogo de secciones', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/');
    await expect(page.getByText(/Explorar · Guía independiente/)).toBeVisible();
    const cats = page.locator('.cat-grid-visual .cat-tile');
    await expect(cats).toHaveCount(8);
    await expect(cats.first()).toContainText(/\d+ fichas/);
    await expect(cats.first()).toContainText(/Evidencia: \d+ /);
    const all = page.getByRole('navigation', { name: 'Todas las secciones' });
    await expect(all.getByRole('link', { name: 'Galería', exact: true })).toBeVisible();
    await noHorizontalOverflow(page);
    expect(errors).toEqual([]);
    await shot(page, info, '4a-01-explorar');
    await page.locator('.cat-grid-visual').scrollIntoViewIfNeeded();
    await shot(page, info, '4a-02-explorar-categorias');
    await page.getByRole('searchbox', { name: 'Buscar', exact: true }).fill('stockyard');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page).toHaveURL(/\/buscar\?q=stockyard/);
    await page.goto('/');
    await cats.filter({ hasText: 'Vehículos' }).click();
    await expect(page).toHaveURL('/vehiculos');
    await page.goBack();
    await all.getByRole('link', { name: 'Comparar vehículos', exact: true }).click();
    await expect(page).toHaveURL('/comparar-vehiculos');
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
