import { defineConfig, devices } from '@playwright/test';

const widths = [360, 390, 768, 1280, 1920];

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e-results.json' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    locale: 'es-MX',
    serviceWorkers: 'block',
  },
  projects: [
    ...widths.map((w) => ({
      name: `chromium-${w}`,
      testIgnore: /offline\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: w, height: w < 768 ? 800 : 900 }, isMobile: w < 768, hasTouch: w < 768 },
    })),
    { name: 'android-pixel-7', testIgnore: /offline\.spec\.ts/, use: { ...devices['Pixel 7'] } },
    // WebKit no está instalado en este entorno: se emula el iPhone (viewport, UA, táctil) sobre Chromium.
    { name: 'iphone-14-emulado', testIgnore: /offline\.spec\.ts/, use: { ...devices['iPhone 14'], browserName: 'chromium', defaultBrowserType: 'chromium' } },
    // Solo en CI (PW_WEBKIT=1, con `playwright install webkit`): Safari/WebKit real con perfil de iPhone.
    ...(process.env.PW_WEBKIT ? [{ name: 'iphone-14-webkit', testIgnore: /offline\.spec\.ts/, use: { ...devices['iPhone 14'] } }] : []),
    { name: 'offline-pwa', testMatch: /offline\.spec\.ts/, use: { ...devices['Pixel 7'], serviceWorkers: 'allow' } },
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
