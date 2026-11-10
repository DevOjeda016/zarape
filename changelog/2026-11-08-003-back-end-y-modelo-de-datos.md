# Back end, monorepo y modelo de datos

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** docs
- **Módulo:** Transversal
- **Requerimientos:** RF01–RF20, NF01, NF02

## Qué cambió

- Se decidió el stack del back end: **NestJS + PostgreSQL (Prisma) + Socket.IO**, con JWT por roles y Swagger.
- Se decidió un **monorepo** con pnpm workspaces: `apps/api`, `apps/gestion`, `apps/en-sitio`, `apps/drive-thru`, `packages/ui` y `packages/shared`.
- La lectura del QR del drive thru en ventanilla va en la app **En sitio**.
- Nuevo `docs/arquitectura.md`:
  - Decisiones y estructura del repo.
  - Módulos de la API y roles.
  - Flujo de la comanda con diagrama de secuencia.
  - Tiempo real, pagos, despliegue propuesto y pruebas.
- Nuevo `docs/modelo-de-datos.md`:
  - Diagrama entidad-relación con 15 tablas, enums y reglas del modelo.
  - Origen de cada indicador del dashboard.
- Se actualizó `CLAUDE.md`: la sección de arquitectura y la regla de datos de tarjeta.

## Por qué

- Faltaba definir el back end, y eso bloqueaba el inicio del desarrollo y la arquitectura que vence el 10 de noviembre.
- El modelo de datos y los dos diagramas sirven de base para la entrega 14.

## Decisión a revisar con el equipo

RF13 y RF17 piden registrar el número de tarjeta y el CVV. Por seguridad se validan pero no se guardan: solo se guardan los últimos 4 dígitos, la marca y el vencimiento. Si el profesor exige guardarlos tal cual, hay que cambiarlo.

## Pendientes

- Elegir proveedores de despliegue (BD, API, fronts) y de fotos.
- Decidir si se agrega Turborepo al monorepo.
- Crear el esqueleto del monorepo y el `schema.prisma`.

## Archivos

- `docs/arquitectura.md`
- `docs/modelo-de-datos.md`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-08-003-back-end-y-modelo-de-datos.md`
