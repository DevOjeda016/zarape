# Skills y MCP oficiales para Claude Code

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** chore
- **Módulo:** Transversal
- **Requerimientos:** N/A

## Qué cambió

- Se revisó, una por una, cada herramienta del stack en sus fuentes oficiales (documentación y organización de GitHub) buscando skills, agentes, plugins, MCP y `llms.txt`.
- Skills instaladas en `.claude/skills/` (copias fijadas por commit, con su licencia):
  - shadcn: `shadcn` (adaptada para usar el shadcn 4.23.0 de `packages/ui`).
  - Prisma: `prisma-cli`, `prisma-client-api` y `prisma-orm-setup`.
  - Motion: `motion`.
  - Chrome DevTools: `chrome-devtools`, `a11y-debugging`, `debug-optimize-lcp` y `troubleshooting`.
- Servidores MCP en `.mcp.json`: `shadcn` (local, del repo), `chrome-devtools` (`chrome-devtools-mcp@1.12.0`, sin telemetría ni CrUX), `motion` (alojado, gratis) y `prisma` (local, del repo).
- `.claude/README.md`: fuentes, commits, cambios respecto al original, primeros pasos y cómo actualizar.
- `CLAUDE.md`: sección "Herramientas de IA del proyecto".
- `.oxlintrc.json`: ignora `.claude/**` (los ejemplos `.tsx` de la skill de shadcn no son código del proyecto).
- No se instalaron: `modern-web-guidance` de Google Chrome (corre `npx @latest` en cada tarea de UI y alarga cada respuesta), axe MCP de Deque (pide clave de cuenta), Motion+ y el MCP remoto de Prisma (piden cuenta). Tailwind CSS, Socket.IO, Phosphor, pnpm, NestJS, React, Vite, vite-plugin-pwa, Vitest y oxlint no publican nada oficial para Claude más allá de `llms.txt` o skills para quien contribuye a esos proyectos.

## Por qué

Que Claude use bien cada herramienta del proyecto (versiones actuales, reglas de shadcn, Prisma 7, Motion, auditorías Lighthouse y de accesibilidad) y que todo el equipo comparta la misma configuración.

## Verificación

`claude mcp list` muestra los 4 servidores como conectados. Las 9 skills aparecen en Claude Code. `pnpm --filter @zarape/ui exec shadcn info --json` (el contexto que inyecta la skill de shadcn) funciona desde la raíz.

## Archivos

- `.claude/skills/` (9 skills)
- `.claude/README.md`
- `.mcp.json`
- `.oxlintrc.json`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-10-001-herramientas-de-ia.md`
