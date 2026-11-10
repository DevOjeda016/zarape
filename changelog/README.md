# Changelog de El Zarape

Historial de todo lo que se hace y se modifica en el proyecto. Un archivo por cambio.

## Convención de nombre

```
AAAA-MM-DD-NNN-slug.md
```

- `AAAA-MM-DD`: fecha del cambio.
- `NNN`: consecutivo del día (`001`, `002`, ...). Evita choques si varios hacen cambios el mismo día.
- `slug`: descripción corta en minúsculas con guiones (`login-gestion`, `catalogo-sucursales`).

Ejemplo: `2026-11-08-001-inicializacion.md`

## Plantilla

```markdown
# <Título del cambio>

- **Fecha:** AAAA-MM-DD
- **Autor:** <nombre>
- **Tipo:** added | changed | fixed | removed | docs | chore
- **Módulo:** I Gestión | II POS sitio | III Drive thru | Dashboard | PWA | Transversal | Docs
- **Requerimientos:** RFxx, NFxx (si aplica)

## Qué cambió

<Descripción breve.>

## Por qué

<Motivo o requerimiento que lo pide.>

## Archivos

- `ruta/al/archivo`
```

## Reglas

- Un cambio nuevo = archivo nuevo. No reescribir entradas viejas (solo corregir redacción).
- Siempre agregar la línea al índice de abajo, la más nueva arriba.

## Índice

| Fecha | Entrada | Resumen |
|---|---|---|
| 2026-11-10 | [003-api-modulo-gestion](2026-11-10-003-api-modulo-gestion.md) | API del Módulo I: login de empleado con JWT y roles, CRUD y búsqueda de los catálogos con regla de baja, fotos, seed y pruebas e2e. |
| 2026-11-10 | [002-script-logos-esm](2026-11-10-002-script-logos-esm.md) | El script de logos vuelve a correr como módulo ES (`import` en vez de `require`). |
| 2026-11-10 | [001-herramientas-de-ia](2026-11-10-001-herramientas-de-ia.md) | Skills y MCP oficiales para Claude Code (shadcn, Prisma, Motion, Chrome DevTools), fijados por versión. |
| 2026-11-08 | [011-nombres-de-apps](2026-11-08-011-nombres-de-apps.md) | Apps renombradas a inglés estándar: `gestion` → `admin`, `en-sitio` → `pos`. |
| 2026-11-08 | [010-esqueleto-monorepo](2026-11-08-010-esqueleto-monorepo.md) | Monorepo con pnpm: API NestJS + Prisma + Socket.IO, tres apps React + Vite + PWA, tema shadcn de la marca y cálculo de la comanda con pruebas. |
| 2026-11-08 | [009-iconos-phosphor](2026-11-08-009-iconos-phosphor.md) | Íconos de la UI con Phosphor (pesos regular, fill, duotone y bold); sin GSAP. |
| 2026-11-08 | [008-asa-encimada-en-mono](2026-11-08-008-asa-encimada-en-mono.md) | Jarro mono: el asa se oculta dentro del cuerpo y ya no se ve encima de las franjas. |
| 2026-11-08 | [007-asa-del-jarro](2026-11-08-007-asa-del-jarro.md) | El asa del jarro ya no asoma del cuerpo en ninguna variante. |
| 2026-11-08 | [006-jarro-envuelto-en-zarape](2026-11-08-006-jarro-envuelto-en-zarape.md) | Isotipo final: jarrito de barro envuelto en zarape, con variantes claro, oscuro, maskable y mono. |
| 2026-11-08 | [005-isotipo-jarro](2026-11-08-005-isotipo-jarro.md) | Isotipo nuevo: jarro de café de olla con franja de zarape. |
| 2026-11-08 | [004-ui-shadcn-y-motion](2026-11-08-004-ui-shadcn-y-motion.md) | UI con shadcn + Tailwind v4 + Motion; isotipo en revisión; seguridad de tarjetas confirmada. |
| 2026-11-08 | [003-back-end-y-modelo-de-datos](2026-11-08-003-back-end-y-modelo-de-datos.md) | NestJS + PostgreSQL + Socket.IO en monorepo; arquitectura y modelo de datos en `docs/`. |
| 2026-11-08 | [002-branding-y-decisiones](2026-11-08-002-branding-y-decisiones.md) | Identidad de marca nueva en `branding/`, tres apps separadas y CLAUDE.md con el detalle de RF. |
| 2026-11-08 | [001-inicializacion](2026-11-08-001-inicializacion.md) | Se crea CLAUDE.md con el contexto de `requirements/` y la carpeta `changelog/`. |
