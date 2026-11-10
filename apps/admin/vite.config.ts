import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const raiz = resolve(import.meta.dirname, '../..');

/** En desarrollo y preview, /api y /fotos van a la API local (mismo origen, sin CORS). */
const proxyApi = {
  '/api': 'http://localhost:3000',
  '/fotos': 'http://localhost:3000',
};

// https://vite.dev/config/
export default defineConfig({
  // Los logos se sirven directo de branding/logos (una sola fuente): /jarro.svg, /isotipo.svg…
  publicDir: resolve(raiz, 'branding/logos'),
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
    // Usa el código fuente de @zarape/shared sin tener que compilarlo antes
    conditions: ['@zarape/source', ...defaultClientConditions],
  },
  server: { port: 5173, strictPort: true, proxy: proxyApi },
  preview: { port: 4173, strictPort: true, proxy: proxyApi },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt": la versión nueva espera a que el usuario acepte el aviso
      registerType: 'prompt',
      // Los íconos ya entran al precache por globPatterns (svg)
      includeManifestIcons: false,
      manifest: {
        name: 'El Zarape Gestión',
        short_name: 'Gestión',
        description: 'Intranet de El Zarape: catálogos y dashboard.',
        lang: 'es-MX',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#B3261E',
        background_color: '#FFF8EF',
        icons: [
          { src: '/isotipo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/isotipo-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Shell de la app y fuentes autoalojadas (subconjuntos latinos) para abrir sin conexión
        globPatterns: ['**/*.{js,css,html,svg}', '**/*latin*.woff2'],
        // La API y las fotos no son rutas de la app: el SW no responde index.html por ellas
        navigateFallbackDenylist: [/^\/api\//, /^\/fotos\//],
      },
    }),
  ],
});
