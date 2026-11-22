/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'LEONIDA ATLAS — Guía de GTA VI',
        short_name: 'LEONIDA ATLAS',
        description:
          'Guía independiente de fans de Grand Theft Auto VI en español de México: mapa, dinero, armas, vehículos y negocios con fuentes verificables.',
        lang: 'es-MX',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0b0d14',
        theme_color: '#0b0d14',
        categories: ['games', 'entertainment', 'reference'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Mapa', url: '/mapa', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Dinero', url: '/dinero', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Mi partida', url: '/mi-partida', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,webmanifest,json}'],
        globIgnores: ['**/og/**', 'media/media-manifest.json'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/media\//, /^\/og\//],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/media/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'leonida-media',
              expiration: { maxEntries: 160, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    css: false,
  },
});
