# API del Módulo I: login de empleado y catálogos

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** I Gestión
- **Requerimientos:** RF01, RDF0101, RF02, RF03, RF04, RF05, RF06, NF01

## Qué cambió

- **Auth (RF01):** `POST /api/auth/login` y `GET /api/auth/yo`. JWT de 10 h con `JWT_SECRETO`, contraseñas con bcrypt (`bcryptjs`). Guards globales: toda ruta pide sesión salvo `@Publico()`, y `@Roles('ADMIN')` cierra los catálogos al rol de cocina. El mismo mensaje "Usuario o contraseña incorrectos." para usuario inexistente, en baja o contraseña mal.
- **Catálogos (RF02–RF06):** `sucursales`, `usuarios`, `categorias`, `alimentos`, `bebidas` y `combos` con alta (todo obligatorio y validado), consulta por ID, modificación de todo excepto el ID (incluido el estatus para reactivar) y búsqueda con los filtros de cada RF:
  - Sucursal: nombre o ubicación (texto de la dirección).
  - Usuario: nombre de usuario.
  - Alimento y bebida: nombre, rango de precio o categoría. La categoría debe ser del tipo correcto y estar activa.
  - Combo: nombre, alimento o bebida que incluya. Responde también `precioPorSeparado` y `ahorro`.
  - Todos aceptan `estatus` (ACTIVO o BAJA).
- **Regla de eliminar:** `DELETE` borra si no hay relacionados y, si los hay, pasa a `BAJA`. Responde `{ accion: 'ELIMINADO' | 'BAJA', mensaje }`.
- **Usuarios (RF03):** contraseña aleatoria de 12 caracteres con `crypto` (empieza con letra; mayúscula, minúscula, número y `* $ _`), se muestra una sola vez al crear o con `POST /api/usuarios/:id/contrasena`. Nadie puede borrarse, darse de baja ni cambiarse el rol a sí mismo.
- **Fotos:** `POST /api/archivos/fotos` (JPG, PNG o WebP por sus bytes, máx. 2 MB) guarda en `apps/api/uploads/fotos` y se sirven en `/fotos/…`. Fotos de muestra en `apps/api/public/fotos/muestra`.
- **Esquema:** `Categoria` ahora tiene `estatus` (migración `20261110000000_categoria_estatus`) para aplicar la regla de eliminar.
- **Seed** (`pnpm --filter @zarape/api db:seed`): categorías, los 13 productos de la tabla 13 y los 4 combos de la tabla 14 del plan de mercadeo, 3 sucursales de muestra en León y los usuarios `admin` y `cocina`. Se puede correr varias veces.
- Errores de Prisma traducidos (409 repetido, 404 no existe), `forbidNonWhitelisted` en la validación y Swagger con todos los DTOs.
- **Pruebas:** unitarias (contraseña, regla de eliminar, guards, login, tipos de foto) y e2e con Supertest de los seis catálogos. Las e2e corren si existe `DATABASE_URL_PRUEBAS`.

## Por qué

Primer avance (25 nov): Módulo I completo. RF01–RF06 piden login de empleado, alta, modificación excepto ID, búsqueda por campos y la baja lógica cuando hay registros relacionados.

## Archivos

- `apps/api/src/auth/`, `apps/api/src/comun/`, `apps/api/src/archivos/`
- `apps/api/src/{sucursales,usuarios,categorias,alimentos,bebidas,combos}/`
- `apps/api/src/configurar-app.ts`, `apps/api/src/main.ts`, `apps/api/src/salud.controller.ts`
- `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20261110000000_categoria_estatus/`, `apps/api/prisma/seed.ts`, `apps/api/prisma.config.ts`
- `apps/api/public/fotos/muestra/`, `apps/api/test/modulo-gestion.e2e.spec.ts`
- `apps/api/package.json`, `apps/api/.env.example`, `apps/api/tsconfig.json`, `.gitignore`, `docs/modelo-de-datos.md`
