# Nombres de las apps en inglés estándar

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** N/A

## Qué cambió

- Se renombraron dos apps del monorepo:
  - `apps/gestion` (`@zarape/gestion`) → `apps/admin` (`@zarape/admin`): Módulo I, Gestión.
  - `apps/en-sitio` (`@zarape/en-sitio`) → `apps/pos` (`@zarape/pos`): Módulo II, punto de venta en sitio.
  - Sin cambio: `apps/api`, `apps/drive-thru`, `packages/shared`, `packages/ui`.
- Scripts de la raíz: `pnpm dev:admin` y `pnpm dev:pos`, que reemplazan a `dev:gestion` y `dev:en-sitio`.
- Se actualizaron `CLAUDE.md` (arquitectura, comandos y puertos), `docs/arquitectura.md`, el comentario de puertos en `apps/api/src/main.ts` y `pnpm-lock.yaml` (con `pnpm install`).
- Regla nueva: carpetas y paquetes en inglés estándar; documentación y textos de la UI en español.

## Por qué

Los nombres mezclaban inglés y español (`api`, `gestion`, `en-sitio`, `drive-thru`, `shared`, `ui`). El equipo eligió inglés estándar, que es la costumbre en código.

## Verificación

`pnpm install`, `pnpm typecheck`, `pnpm test` (18 pruebas), `pnpm lint` (sin errores; queda una advertencia previa en `packages/ui/src/components/button.tsx`) y `pnpm build` pasan con los nombres nuevos.

## Archivos

- `apps/admin/` (antes `apps/gestion/`)
- `apps/pos/` (antes `apps/en-sitio/`)
- `apps/admin/package.json`
- `apps/pos/package.json`
- `package.json`
- `pnpm-lock.yaml`
- `apps/api/src/main.ts`
- `CLAUDE.md`
- `docs/arquitectura.md`
- `changelog/README.md`
- `changelog/2026-11-08-011-nombres-de-apps.md`
