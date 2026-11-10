# Código, base de datos y rutas en inglés

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** RF01–RF06 (sin cambio de comportamiento)

## Qué cambió

- **Convención:** código, base de datos, rutas REST y git en inglés; textos de la UI y documentación siguen en español. Rama `feat/admin-catalogs`.
- **Esquema (`schema.prisma`):** Sucursal → `Branch`, Usuario → `Employee`, Categoria → `Category`, Alimento → `Food`, Bebida → `Drink`, Cliente → `Customer`, MedioPago → `PaymentMethod`, Comanda → `Order`, DetalleComanda → `OrderItem`, Pago → `Payment`, GastoMarketing → `MarketingExpense`, Calificacion → `Rating`, turno → `ticketNumber`, token_qr → `qrToken`. Enums: `ACTIVE`/`INACTIVE`, `ADMIN`/`KITCHEN`, `KIOSK`/`DRIVE_THRU`, `PENDING`…`CANCELLED`.
- **Migraciones:** como no hay BD desplegada, las dos anteriores se juntaron en una inicial nueva (`20261110000000_init`) con las mismas reglas `CHECK`.
- **`packages/shared`:** `status.ts` (`Status`, `Role`, `OrderStatus`, `canChangeStatus`…) y `order.ts` (`splitTax`, `calculateOrder`, `TAX_RATE`).
- **API:** módulos `branches`, `employees`, `categories`, `foods`, `drinks`, `combos`, `files`, `customers`, `orders`, `payments`, `realtime`; `@Public()`; rutas `/api/branches`, `/api/employees/:id/password`, `/api/files/photos`, `/api/health`, `/api/auth/me`; fotos en `/photos/…`. Eliminar responde `{ action: 'DELETED' | 'DEACTIVATED', message }`.
- **Variables de entorno:** `JWT_SECRET`, `CORS_ORIGINS`, `TEST_DATABASE_URL`, `SEED_ADMIN_PASSWORD`, `SEED_KITCHEN_PASSWORD`, `PHOTOS_DIR`. `DATABASE_URL` ahora respeta `?schema=` también en la app y el seed.
- **Admin:** carpetas `pages/` y `components/catalog/`, rutas `/login`, `/branches`, `/employees`, `/categories`, `/foods`, `/drinks`, `/combos`.
- **Docs:** `docs/modelo-de-datos.md` (diagrama, enums y tabla de equivalencias) y `docs/arquitectura.md` con los nombres nuevos.

## Por qué

Decisión del equipo: código y git en inglés para seguir convenciones estándar; la interfaz se queda en español para los usuarios del restaurante.

## Archivos

- `apps/api/prisma/`, `apps/api/src/`, `apps/api/test/admin-catalogs.e2e.spec.ts`, `apps/api/public/photos/samples/`, `apps/api/.env.example`
- `packages/shared/src/`
- `apps/admin/src/`, `apps/*/vite.config.ts`
- `docs/arquitectura.md`, `docs/modelo-de-datos.md`, `CLAUDE.md` (líneas de comandos)
