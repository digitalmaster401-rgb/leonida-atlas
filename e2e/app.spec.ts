import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { goSection, noHorizontalOverflow, shot, watchConsole, isMobile } from './helpers';

test.describe('LEONIDA ATLAS', () => {
  test('inicio: portada original, sin errores ni desbordamiento', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Leonida');
    await expect(page.getByText('Guía independiente de fans. Sin afiliación con Rockstar Games.')).toBeVisible();
    await expect(page.locator('.hero img')).toHaveCount(0); // la portada es una composición SVG propia
    await noHorizontalOverflow(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, info, '01-inicio'); // después de verificar la consola (ver helpers.shot)
  });

  test('navegación entre todas las secciones', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto('/');
    const sections: [string, RegExp][] = [
      ['Mapa', /Mapa de Leonida/i],
      ['Dinero y glitches', /Dinero y glitches/i],
      ['Armas', /Armas/i],
      ['Vehículos', /Vehículos/i],
      ['Negocios y propiedades', /Negocios y propiedades/i],
      ['Rutas y tutoriales', /Rutas y tutoriales/i],
      ['Lugares', /Lugares/i],
      ['Personajes', /Personajes/i],
      ['Galería', /Galería/i],
      ['Mi espacio', /Mi espacio/i],
      ['Trucos y códigos', /Trucos y códigos/i],
      ['Coleccionables', /Coleccionables/i],
      ['Fuentes y cambios', /Fuentes y cambios/i],
      ['Inicio', /Leonida/i],
    ];
    for (const [label, h1] of sections) {
      const target = isMobile(page) && label === 'Dinero y glitches' ? 'Dinero' : label;
      await goSection(page, target);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1);
      await noHorizontalOverflow(page);
    }
    expect(errors).toEqual([]);
  });

  test('buscador tolerante a acentos y errores, y apertura de ficha', async ({ page }, info) => {
    await page.goto('/');
    const input = page.getByRole('searchbox', { name: 'Buscar en LEONIDA ATLAS' });
    await input.fill('moises');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/buscar\?q=moises/);
    const card = page.getByTestId('item-card').filter({ hasText: 'Vender autos a Moses' });
    await expect(card).toBeVisible();
    await shot(page, info, '02-busqueda');
    await card.getByRole('link', { name: 'Vender autos a Moses' }).click();
    await expect(page).toHaveURL('/dinero/vender-autos-a-moses');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vender autos a Moses');
    await expect(page.getByText('CONTRASTADO').first()).toBeVisible();
    await page.goto('/buscar?q=vehiculo%20grotti');
    await expect(page.getByTestId('item-card').filter({ hasText: '’95 Grotti Cheetah' }).first()).toBeVisible();
    await page.goto('/buscar?q=xyzzyqqq');
    await expect(page.getByText('Sin coincidencias')).toBeVisible();
  });

  test('filtros combinables reflejados en la URL', async ({ page }) => {
    await page.goto('/armas');
    const total = await page.getByTestId('item-card').count();
    await page.getByRole('group', { name: 'Filtrar por región' }).getByRole('button', { name: 'Vice City' }).click();
    await expect(page).toHaveURL(/region=vice-city/);
    await expect.poll(() => page.getByTestId('item-card').count()).toBeLessThan(total);
    await page.getByText('Más filtros').click();
    await page.getByLabel('Evidencia').selectOption('reportado');
    await expect(page).toHaveURL(/status=reportado/);
    await page.getByLabel('Ordenar por').selectOption('pago');
    const prices = await page.locator('[data-testid=item-card] .chip-money').allTextContents();
    const nums = prices.map((p) => Number(p.replace(/[^0-9]/g, '')));
    expect([...nums].sort((a, b) => b - a)).toEqual(nums);
    await page.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expect(page.getByTestId('item-card')).toHaveCount(total);
  });

  test('enlace directo a una ficha y 404 controlado', async ({ page, request }) => {
    const res = await request.get('/armas/duke-556');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('<title>Duke 556 · LEONIDA ATLAS</title>');
    expect(html).toContain('property="og:image"');
    await page.goto('/armas/duke-556');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Duke 556');
    await expect(page.getByRole('cell', { name: '$1,450' })).toBeVisible();
    await page.goto('/armas/no-existe');
    await expect(page.getByText('No encontramos esta página')).toBeVisible();
  });

  test('guardar, completar, notas y restauración tras recargar', async ({ page }, info) => {
    await page.goto('/vehiculos/shitzu-squalo');
    await page.getByTestId('btn-fav').click();
    await page.getByTestId('btn-done').click();
    await page.getByTestId('notes').fill('Probar en Washington Beach de noche');
    await expect(page.getByText('Guardado en este dispositivo.')).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('btn-fav')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('btn-done')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('notes')).toHaveValue('Probar en Washington Beach de noche');
    await page.goto('/mi-partida');
    await expect(page.getByRole('heading', { name: 'Guardadas (1)' })).toBeVisible();
    await expect(page.getByText('Probar en Washington Beach de noche')).toBeVisible();
    await expect(page.getByTestId('progress-summary')).toContainText('1 de');
    await shot(page, info, '05-mi-partida');

    // exportar
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar JSON' }).click()]);
    const path = await download.path();
    const fs = await import('node:fs');
    const exported = JSON.parse(fs.readFileSync(path!, 'utf8'));
    expect(exported.app).toBe('leonida-atlas');
    expect(exported.data.favorites).toContain('veh-shitzu-squalo');

    // borrar y volver a importar
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Borrar mis datos' }).click();
    await expect(page.getByRole('heading', { name: 'Guardadas (0)' })).toBeVisible();
    await page.getByTestId('import-input').setInputFiles(path!);
    await page.getByRole('button', { name: 'Reemplazar todo' }).click();
    await expect(page.getByRole('heading', { name: 'Guardadas (1)' })).toBeVisible();

    // archivo inválido
    await page.getByTestId('import-input').setInputFiles({ name: 'malo.json', mimeType: 'application/json', buffer: Buffer.from('{"hola":1}') });
    await expect(page.getByRole('alert')).toContainText('no tiene el formato');
  });

  test('compartir: Web Share API y alternativa de copiar enlace', async ({ page, context, browserName }) => {
    await page.addInitScript(() => {
      (window as unknown as { __shared: unknown[] }).__shared = [];
      Object.defineProperty(navigator, 'share', { value: (d: unknown) => ((window as unknown as { __shared: unknown[] }).__shared.push(d), Promise.resolve()), configurable: true });
    });
    await page.goto('/negocios/stock-305');
    await page.getByRole('button', { name: 'Compartir' }).click();
    const shared = await page.evaluate(() => (window as unknown as { __shared: { url: string; title: string }[] }).__shared);
    expect(shared[0].url).toBe('http://localhost:4173/negocios/stock-305');
    expect(shared[0].title).toContain('Stock 305');

    const p2 = await context.newPage();
    // Solo Chromium reconoce los permisos de portapapeles; WebKit permite escribir con el gesto del usuario.
    if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await p2.addInitScript(() => Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }));
    await p2.goto('/negocios/stock-305');
    await p2.getByRole('button', { name: 'Compartir' }).click();
    await expect(p2.getByText('Enlace copiado')).toBeVisible();
    if (browserName === 'chromium') expect(await p2.evaluate(() => navigator.clipboard.readText())).toBe('http://localhost:4173/negocios/stock-305');
  });

  test('galería con visor: zoom, navegación y cierre con Escape', async ({ page }, info) => {
    await page.goto('/lugares/vice-city');
    await page.getByRole('button', { name: /Ampliar imagen/ }).first().click();
    const dlg = page.getByRole('dialog', { name: 'Visor de imagen' });
    await expect(dlg).toBeVisible();
    await expect(dlg.getByText('© Rockstar Games / Take-Two Interactive')).toBeVisible();
    const first = await dlg.locator('img').getAttribute('src');
    await dlg.getByRole('button', { name: 'Imagen siguiente' }).click();
    expect(await dlg.locator('img').getAttribute('src')).not.toBe(first);
    await dlg.getByRole('button', { name: 'Acercar imagen' }).click();
    await expect(dlg.getByRole('button', { name: 'Alejar imagen' })).toHaveAttribute('aria-pressed', 'true');
    await shot(page, info, '04-visor');
    await page.keyboard.press('Escape');
    await expect(dlg).toBeHidden();
  });

  test('mapa: zoom, selección de punto y enlace a ficha (y de ficha a mapa)', async ({ page }, info) => {
    const errors = watchConsole(page);
    await page.goto('/mapa');
    const vp = page.getByTestId('map-viewport');
    await expect(vp).toHaveAttribute('data-scale', '1.00');
    await page.getByRole('button', { name: 'Acercar' }).click();
    await expect(vp).not.toHaveAttribute('data-scale', '1.00');
    await page.getByRole('button', { name: 'Restablecer vista' }).click();
    await expect(vp).toHaveAttribute('data-scale', '1.00');
    // activación por teclado (accesible y sin depender de la densidad de pines en pantalla)
    await page.getByRole('button', { name: /^Ambrosia\. Precisión/ }).focus();
    await page.keyboard.press('Enter');
    const panel = page.getByTestId('pin-panel');
    await expect(panel).toContainText('Ambrosia');
    await expect(panel).toContainText('Precisión: región');
    await panel.getByRole('link', { name: /Ambrosia/ }).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ambrosia');
    await page.getByRole('link', { name: /Ver en el mapa: Ambrosia/ }).click();
    await expect(page).toHaveURL(/\/mapa\?id=lug-ambrosia/);
    await expect(page.getByTestId('pin-panel')).toContainText('Ambrosia');
    await expect(vp).not.toHaveAttribute('data-scale', '1.00');
    // teclado
    await vp.focus();
    await page.keyboard.press('0');
    await expect(vp).toHaveAttribute('data-scale', '1.00');
    await page.keyboard.press('+');
    await expect(vp).not.toHaveAttribute('data-scale', '1.00');
    expect(errors).toEqual([]);
    await shot(page, info, '03-mapa'); // después de verificar la consola (ver helpers.shot)
  });

  test('calculadora de dinero con fórmulas y estimación', async ({ page }) => {
    await page.goto('/dinero');
    await page.getByLabel('Método (opcional)').selectOption('din-moses');
    await expect(page.getByText('Estimación: no comprobado')).toBeVisible();
    await expect(page.getByTestId('calc-net')).toHaveText('$1,000');
    await page.getByLabel(/Costos por ejecución/).fill('250');
    await expect(page.getByTestId('calc-net')).toHaveText('$750');
    await page.getByText('Ver fórmulas').click();
    await expect(page.getByText('Neto por ejecución = bruto − costos')).toBeVisible();
    await page.getByRole('tab', { name: 'Glitches' }).click();
    await expect(page.getByText('Ningún glitch publicado')).toBeVisible();
    await page.getByRole('tab', { name: 'Modo online' }).click();
    await expect(page.getByText('Modo online: sin información verificada')).toBeVisible();
  });

  test('protección de spoilers configurable y persistente', async ({ page }) => {
    await page.goto('/dinero/bovedas-bancarias');
    await expect(page.getByText(/Esta ficha contiene spoilers/)).toBeVisible();
    await page.goto('/mi-partida');
    await page.getByLabel(/Todos \(incluye etapas avanzadas\)/).check();
    await page.reload();
    await expect(page.getByLabel(/Todos \(incluye etapas avanzadas\)/)).toBeChecked();
    await page.goto('/dinero/bovedas-bancarias');
    await expect(page.getByRole('heading', { name: 'Datos y evidencia' })).toBeVisible();
  });

  test('accesibilidad automática (axe, WCAG 2 AA) en páginas clave', async ({ page }) => {
    test.skip(!['chromium-390', 'chromium-1280'].includes(test.info().project.name), 'se ejecuta en dos anchos representativos');
    for (const path of ['/', '/mapa', '/dinero', '/armas', '/armas/duke-556', '/mi-partida', '/fuentes', '/galeria', '/intel', '/intel?seccion=bitacora', '/trucos', '/coleccionables', '/coleccionables/orca', '/consola', '/equipamiento', '/mi-espacio']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${path}: ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target}`)).toEqual([]);
    }
  });

  test('teclado: enlace para saltar al contenido y foco visible', async ({ page }) => {
    test.skip(isMobile(page), 'teclado físico en escritorio');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    const outline = await skip.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});
