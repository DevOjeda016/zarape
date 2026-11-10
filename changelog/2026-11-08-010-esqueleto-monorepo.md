# Esqueleto del monorepo

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** Transversal
- **Requerimientos:** NF01, NF02, NF03, RF09, RF10, RF14, RF15

## Qué cambió

- `git init` con `.gitignore`, `.gitattributes` (LF), `.editorconfig` y `.nvmrc` (Node 24).
- Monorepo con **pnpm 12** workspaces (`apps/*`, `packages/*`). Scripts de la raíz: `dev`, `build`, `test`, `lint` (oxlint) y `typecheck`. Solo Prisma puede correr scripts de instalación.
- `apps/api`: **NestJS 12** (ESM) + **Prisma 7** (PostgreSQL, adaptador `pg`) + gateway **Socket.IO** + **Swagger** en `/api/docs`.
  - `prisma/schema.prisma` con las 15 tablas y 7 enums de `docs/modelo-de-datos.md`: dinero en `decimal(10,2)`, `token_qr` UUID, turno único por sucursal y día, `onDelete: Restrict` hacia catálogos.
  - Migración inicial con tres `CHECK`: un solo producto por línea, cliente según canal y turno junto con su fecha.
  - Los 13 módulos de la tabla de arquitectura, vacíos. `tiempo-real` trae el gateway y un adaptador con el mismo CORS que REST. Ruta `GET /api/salud`.
- `apps/gestion`, `apps/en-sitio`, `apps/drive-thru`: React 19 + Vite 8 + vite-plugin-pwa + Tailwind v4 + Motion (`MotionConfig reducedMotion="user"`). Cada una tiene una pantalla inicial con `branding/logos/jarro.svg`, su manifest (`theme_color` `#B3261E`) y un service worker con aviso de versión nueva (`prompt`). Drive thru sigue el tema claro u oscuro del sistema.
- `packages/ui`: tema de **shadcn 4** (`radix-nova`, íconos Phosphor) conectado a `branding/tokens.css` según la tabla de `branding/README.md`. Incluye utilidades de marca (`bg-masa`, `text-chile`…), `font-heading` (Bricolage), modo oscuro con `data-theme="dark"`, fuentes autoalojadas y el componente Button.
- `packages/shared`: enums de estatus, flujo de la comanda y cálculo del ticket con IVA incluido (`subtotal = total / 1.16`, en centavos enteros), con 17 pruebas.
- `docs/modelo-de-datos.md`: nueva columna `fecha_turno`, fechas en `timestamptz` y dónde viven los `CHECK`.
- `docs/arquitectura.md`: pruebas con Vitest y tabla de versiones.
- `CLAUDE.md`: sección Comandos con los scripts reales.

## Por qué

Faltaba el código base para empezar los sprints. El primer avance (25 nov) pide el Módulo I completo y la PWA base.

## Decisiones

- **TypeScript 6.0**, no 7: el CLI de NestJS y Swagger aún no soportan la 7. Se usa la misma versión en todo el repo.
- **Vitest también en la API**: NestJS 12 ya lo trae por defecto. Así hay una sola herramienta de pruebas.
- **oxlint** como linter: lo traen las plantillas actuales de Vite y de NestJS.
- **Turborepo** sigue sin decidirse; por ahora solo pnpm.
- Las apps sirven los logos directo de `branding/logos` (`publicDir`), sin copias.

## Verificado

- `pnpm install` limpio. Queda un aviso de `glob@11` obsoleto que viene de `workbox-build`, no de nuestro código.
- `pnpm test`: 17 pruebas en `shared` y 1 en la API. `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan sin errores.
- `prisma validate` pasa. La migración se aplicó en un PostgreSQL local (`prisma dev`): los tres `CHECK` y el turno único rechazan datos inválidos, y no hay diferencias entre el esquema y la BD.
- `pnpm dev` levanta la API (salud, Swagger, Socket.IO y CORS responden) y las tres apps. Se revisaron los colores y fuentes de la marca y el modo oscuro del drive thru.

## Pendientes

- Íconos PNG de la PWA (iOS no acepta SVG en `apple-touch-icon`) y el aviso de instalación y de versión nueva.
- Caché de ejecución del service worker (stale-while-revalidate para el menú, network-first para comandas y pagos) cuando existan las rutas de la API.
- `packages/shared`: reglas de contraseña del cliente (RF17).
- Auth (JWT + bcrypt), rutas protegidas por rol y seed de datos.

## Archivos

- `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`, `.oxlintrc.json`
- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- `apps/api/` (`package.json`, `nest-cli.json`, `tsconfig*.json`, `vitest.config.ts`, `prisma.config.ts`, `.env.example`, `prisma/schema.prisma`, `prisma/migrations/`, `src/`)
- `apps/gestion/`, `apps/en-sitio/`, `apps/drive-thru/` (`package.json`, `vite.config.ts`, `index.html`, `components.json`, `tsconfig*.json`, `src/`)
- `packages/ui/` (`package.json`, `components.json`, `tsconfig.json`, `src/styles/globals.css`, `src/lib/utils.ts`, `src/components/button.tsx`)
- `packages/shared/` (`package.json`, `tsconfig*.json`, `src/`)
- `docs/modelo-de-datos.md`, `docs/arquitectura.md`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-08-010-esqueleto-monorepo.md`
