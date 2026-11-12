# Login de marca, componentes de Lotería e íconos PNG de la PWA

- **Fecha:** 2026-11-11
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** I Gestión | PWA | Transversal
- **Requerimientos:** RF01, RF16, NF03

## Qué cambió

- Login de gestión rediseñado: mesa con abanico de cartas, frijoles, orilla de zarape y saludo por horario.
- Componentes nuevos en `packages/ui`: `LoteriaCard`, `Frijol`, `ZarapeEdge`, `BoardField`, `CardFan`, `TableBeans`, arte de lotería y avisos PWA (`pwa-notices`, `useInstallPrompt`).
- Campos y botones de shadcn con la forma de Lotería (marco de 2 px, ficha con relieve, tamaños `lg`/`xl`).
- `greeting()` en `packages/shared` con prueba.
- Íconos PNG (192, 512, maskable y apple-touch) generados con `@resvg/resvg-js` y agregados a los manifests y al precache.
- Voz de marca para login, versión nueva e instalación en `branding/README.md`.

## Por qué

Pantalla de marca para el primer avance (NF03), instalación de la PWA en Android e iOS y saludo por horario compartido con el drive thru (RF16).

## Archivos

- `apps/admin`, `apps/pos`, `apps/drive-thru` (manifest, `main.tsx`, `index.html`)
- `apps/admin/src/pages/Login.tsx`
- `packages/ui/src/components/*`, `packages/ui/src/hooks/use-install-prompt.ts`
- `packages/shared/src/greeting.ts`, `greeting.test.ts`
- `branding/README.md`, `branding/tokens.css`, `branding/scripts/generar-logos.js`, `branding/logos/*.png`
