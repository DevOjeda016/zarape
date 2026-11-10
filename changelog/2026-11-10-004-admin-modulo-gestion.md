# Intranet del Módulo I: login, menú de gestión y catálogos

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** I Gestión
- **Requerimientos:** RF01, RDF0101, RF02, RF03, RF04, RF05, RF06, NF01, NF03

## Qué cambió

- **Login (RF01)** con la marca (jarro, slogan y franjas del zarape), mostrar/ocultar contraseña y el mensaje "Usuario o contraseña incorrectos.". Sesión en `sessionStorage` (cerrar la pestaña cierra la sesión); un 401 de la API la cierra sola.
- **Rutas protegidas por rol** con React Router: sin sesión manda a `/entrar`; el rol cocina ve "Esta sección es solo para administración".
- **Menú de gestión (RDF0101)**: barra lateral (barro) colapsable con Sucursales, Usuarios, Alimentos, Bebidas y Combos, más Categorías como apoyo. Inicio con saludo por horario y tarjetas por catálogo.
- **Una pantalla por catálogo** con tabla, búsqueda por los campos de cada RF, alta y modificación en diálogo (el ID no se edita; el estatus sí, para reactivar), eliminar con confirmación y aviso de si se borró o quedó en baja.
  - Sucursales: botón "Usar mi ubicación" (Geolocation) para el GPS.
  - Usuarios: la contraseña de 12 caracteres se muestra una sola vez, con botón copiar; llave para generar otra. No te puedes eliminar ni cambiar tu rol.
  - Alimentos y bebidas: búsqueda por nombre, categoría y rango de precio.
  - Combos: arma el combo con alimentos y bebidas (cantidades +/−) y ve en vivo el precio por separado y el ahorro.
  - Fotos: subir JPG, PNG o WebP o pegar una URL https.
- **Impresión de resultados**: "Imprimir resultados" usa la hoja de impresión (carta horizontal) con encabezado de marca, filtros aplicados, total de registros, fecha y quién imprimió; sin menú, filtros ni botones.
- shadcn/ui en `packages/ui`: input, label, table, dialog, alert-dialog, select, badge, card, sonner (sin `next-themes`), skeleton, textarea, field, separator, dropdown-menu, sidebar, tooltip, empty, spinner, input-group, toggle-group, alert y el hook `use-mobile`.
- Motion: transición entre pantallas, filas que aparecen y líneas del combo con animación de layout, con `reducedMotion="user"`.
- Vite: proxy de `/api` y `/fotos` a la API en desarrollo y preview; el service worker no responde `index.html` por esas rutas. Cada catálogo se carga al abrirlo (`lazy`).
- La API traduce el error de campos no permitidos: mandar `id` al modificar responde "El ID no se puede modificar.".
- `pnpm-workspace.yaml`: `esbuild: false` en `allowBuilds` (lo trae `tsx` para el seed); sin esto `pnpm install` fallaba.

## Por qué

Primer avance (25 nov): Módulo I completo con login, menú de gestión, alta, baja, modificación, búsqueda e impresión en los cinco catálogos.

## Archivos

- `apps/admin/src/` (App, main, impresion.css, auth/, components/, lib/, paginas/)
- `apps/admin/vite.config.ts`, `apps/admin/package.json`
- `packages/ui/src/components/*`, `packages/ui/src/hooks/use-mobile.ts`, `packages/ui/package.json`
- `apps/api/src/configurar-app.ts`, `apps/api/test/modulo-gestion.e2e.spec.ts`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `CLAUDE.md`
