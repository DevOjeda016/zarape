import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const root = resolve(import.meta.dirname, '../..');

/** En desarrollo y preview, /api y /photos van a la API local (mismo origen, sin CORS). */
const apiProxy = {
  '/api': 'http://localhost:3000',
  '/photos': 'http://localhost:3000',
};

// https://vite.dev/config/
export default defineConfig({
  // Los logos se sirven directo de branding/logos (una sola fuente): /jarro.svg, /isotipo.svg…
  publicDir: resolve(root, 'branding/logos'),
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
    // Usa el código fuente de @zarape/shared sin tener que compilarlo antes
    conditions: ['@zarape/source', ...defaultClientConditions],
  },
  server: { port: 5174, strictPort: true, proxy: apiProxy },
  preview: { port: 4174, strictPort: true, proxy: apiProxy },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": la versión nueva espera a que el usuario acepte el aviso
      registerType: 'prompt',
      // Los íconos ya entran al precache por globPatterns (svg, png)
      includeManifestIcons: false,
      manifest: {
        name: 'El Zarape En sitio',
        short_name: 'En sitio',
        description: 'El Zarape en el restaurante: kiosko, cocina y turnos.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#12402E',
        background_color: '#12402E',
        // PNG para instalar (Chrome los pide en 192 y 512); el SVG queda para pantallas grandes
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/isotipo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Shell de la app y fuentes autoalojadas (subconjuntos latinos) para abrir sin conexión
        globPatterns: ['**/*.{js,css,html,svg,png}', '**/*latin*.woff2'],
        navigateFallbackDenylist: [/^\/api\//, /^\/photos\//],
        runtimeCaching: [
          {
            // Menú y sucursales: se ven sin conexión y se actualizan en segundo plano
            urlPattern: ({ url }) => url.pathname.startsWith('/api/menu'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'menu' },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/photos/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'photos', expiration: { maxEntries: 120 } },
          },
          {
            // Comandas y pagos: siempre de la red; sin red falla y la pantalla avisa (nunca datos viejos)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
