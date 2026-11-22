import { expect, test } from '@playwright/test';
import { watchConsole } from './helpers';

// Diagnóstico de la CSP: identifica quién inserta hojas de estilo inline y comprueba que la CSP las bloquea.
// Corre en un Chromium y en el WebKit real de CI.
test.describe('CSP de estilos', () => {
  test.skip(() => !['chromium-1280', 'iphone-14-webkit'].includes(test.info().project.name), 'un Chromium y el WebKit real');

  test.beforeEach(async ({ page }) => {
    // Registra cada <style> que se añade al documento, con su contenido y el momento.
    await page.addInitScript(() => {
      const w = window as unknown as { __styles: { text: string; at: number }[] };
      w.__styles = [];
      new MutationObserver((muts) => {
        for (const m of muts)
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLStyleElement) w.__styles.push({ text: n.textContent ?? '', at: performance.now() });
          });
      }).observe(document, { childList: true, subtree: true });
    });
  });

  test('la app no inserta ninguna hoja de estilos inline al cargar ni al interactuar', async ({ page }) => {
    const errors = watchConsole(page);
    for (const path of ['/', '/mapa', '/intel?seccion=bitacora', '/armas/duke-556']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    await page.goto('/mapa');
    await page.getByRole('button', { name: 'Acercar' }).click();
    await page.getByRole('button', { name: /^Ambrosia\. Precisión/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('pin-panel')).toContainText('Ambrosia');
    expect(await page.evaluate(() => (window as unknown as { __styles: unknown[] }).__styles)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('la CSP bloquea estilos inline inyectados y lo reporta en consola', async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto('/');
    const outline = await page.evaluate(() => {
      const s = document.createElement('style');
      s.textContent = 'body { outline: 7px solid rgb(1, 2, 3); }';
      document.head.appendChild(s);
      return getComputedStyle(document.body).outlineWidth;
    });
    expect(outline).not.toBe('7px');
    await expect.poll(() => errors.some((e) => /Content Security Policy|style-src/i.test(e))).toBe(true);
  });

  test('en WebKit, la captura de pantalla de Playwright es la que inserta <style>body {}</style>', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'la inyección solo ocurre en WebKit (shouldToggleStyleSheetToSyncAnimations)');
    const errors = watchConsole(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => (window as unknown as { __styles: unknown[] }).__styles)).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ caret: 'initial' });
    const styles = await page.evaluate(() => (window as unknown as { __styles: { text: string }[] }).__styles.map((s) => s.text));
    expect(styles).toEqual(['body {}']);
    await expect.poll(() => errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => /Content Security Policy|style-src/i.test(e))).toBe(true);
  });
});
