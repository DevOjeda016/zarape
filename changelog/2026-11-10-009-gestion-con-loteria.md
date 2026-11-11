# Gestión con la identidad Lotería

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** I Gestión
- **Requerimientos:** NF01, NF03

## Qué cambió

Al juntar la rama de Gestión con la de identidad, las pantallas del Módulo I todavía usaban clases del sistema anterior que ya no existen (`bg-chile-tinte`, `bg-nopal-tinte`, `shadow-tarjeta`, `bg-masa`, `bg-cempasuchil`, `bg-talavera`) y se veían sin color. Se pasaron a los tokens de Lotería:

- **Login:** la carta de la casa y el formulario en papel sobre la mesa verde; franjas del zarape en el orden nuevo.
- **Barra lateral:** isotipo nuevo; el elemento activo va en `maiz` con texto `tinta`; el subtítulo "Gestión" usa el color de la barra (antes quedaba gris oscuro sobre verde).
- **Inicio y catálogos:** íconos en un recuadro con marco `tinta` (como el número de una carta); al pasar el mouse, la tarjeta se marca con borde `tinta` en vez de sombra.
- **Estados:** "Activo" en relleno `nopal` con texto `carta`; ahorro de combos en `rosa` con texto `tinta`; el ícono del diálogo de borrar usa `destructive`.
- **Impresión:** el encabezado lleva la doble línea en `tinta`.
- Íconos de Phosphor en `regular` (se quitó `duotone`) y títulos en Ultra sin pesos falsos.
- `branding/README.md`: se documentan el activo del menú y el login sobre la mesa.

## Por qué

Sin el cambio, Gestión quedaba sin colores en insignias e íconos tras el merge, y la guía de marca pide un solo sistema en las tres apps.

## Archivos

- `apps/admin/src/components/AppShell.tsx`
- `apps/admin/src/components/StatusBadge.tsx`
- `apps/admin/src/components/catalog/CatalogPage.tsx`, `CatalogTable.tsx`, `RowActions.tsx`, `fields.tsx`
- `apps/admin/src/pages/Login.tsx`, `Home.tsx`, `Combos.tsx`, `NotFound.tsx`, `Forbidden.tsx`
- `branding/README.md`
- `changelog/README.md`
- `changelog/2026-11-10-009-gestion-con-loteria.md`
