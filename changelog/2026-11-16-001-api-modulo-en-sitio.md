# API del Módulo II: comandas, pago simulado, cocina y turnos

- **Fecha:** 2026-11-16
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** II POS sitio
- **Requerimientos:** RF07, RF08, RF09, RF10, RDF1002, RF11, RDF1102, RF12, RF13, RDF130102, RF14, RF15

## Qué cambió

- **Menú público (RF07, RF08):** `GET /api/menu` (alimentos, bebidas y combos activos, con lo que incluye cada combo) y `GET /api/menu/branches` (sucursales activas). Sin sesión.
- **Comanda y pago (RF09, RF12, RF13):** `POST /api/orders` recibe solo producto y cantidad; la API pone nombre y precio de la BD, recalcula subtotal, IVA y total con `packages/shared`, crea la comanda `PENDING` y corre el simulador. Aprobado: pasa a `PAID` con su turno (consecutivo diario por sucursal). Rechazado: sigue `PENDING` y se reintenta con `POST /api/orders/by-token/:qrToken/payments`.
- **Tarjeta:** `cardError`, Luhn, marca y `TEST_CARDS` en `packages/shared`. Del pago solo se guardan titular, marca, últimos 4, vencimiento, monto, estatus y referencia.
- **Consultas (RDF1002, RDF1102, RDF130102):** `GET /api/orders` por rango de días o de total, `GET /api/orders/:id` con el detalle y `GET /api/payments` por rango de fechas o de cantidad.
- **Cocina y turnos (RF14, RF15):** `PATCH /api/orders/:id/status` respeta el flujo de estatus y guarda la hora de lista y de entrega. `GET /api/orders/tickets` da los turnos en preparación y listos.
- **Tiempo real:** el gateway acepta `join` a las salas de cocina (con JWT de empleado), turnos y comanda, y emite `order:changed` al pagar o cambiar el estatus.
- **Pruebas:** unitarias de la tarjeta y del simulador, y e2e del flujo completo. Vitest de la API corre un archivo a la vez porque las e2e comparten la BD.

## Por qué

Segundo avance (2 dic): Módulo II completo. Primero la API, para que el kiosko, la cocina y la pantalla de turnos ya tengan contra qué trabajar.

## Archivos

- `packages/shared/src/card.ts`, `packages/shared/src/card.test.ts`, `packages/shared/src/index.ts`
- `apps/api/src/menu/`, `apps/api/src/orders/`, `apps/api/src/payments/`
- `apps/api/src/realtime/realtime.gateway.ts`, `apps/api/src/common/local-day.ts`, `apps/api/src/app.module.ts`
- `apps/api/test/orders.e2e.spec.ts`, `apps/api/vitest.config.ts`
- `docs/arquitectura.md`, `CLAUDE.md`
