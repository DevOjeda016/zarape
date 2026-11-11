# Herramientas de IA del proyecto (Claude Code)

Skills y servidores MCP **oficiales** de las herramientas del stack, instalados a nivel de proyecto para que los use todo el equipo. Solo se usaron fuentes del propio proyecto o de su empresa.

## Primera vez (cada integrante)

1. `pnpm install`: los MCP de shadcn y Prisma usan los paquetes de `node_modules`.
2. Tener Google Chrome instalado (para el MCP de Chrome DevTools).
3. Abrir Claude Code en la raíz del repo y **aprobar** los 4 servidores de `.mcp.json` cuando lo pida (o en `/mcp`). Para revisar: `claude mcp list`.

## Skills (`.claude/skills/`)

| Skill | Fuente (commit fijado) | Licencia |
|---|---|---|
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/2c5958ecac7cee2b583967a2c4981d0f4a75c579/skills/frontend-design) `skills/frontend-design` @ `2c5958e` | Apache-2.0 |
| `shadcn` | [shadcn-ui/ui](https://github.com/shadcn-ui/ui/tree/8ab27715521cbd4f87ae6886cd989cbb678f6de7/skills/shadcn) `skills/shadcn` @ `8ab2771` | MIT |
| `prisma-cli`, `prisma-client-api`, `prisma-orm-setup` | [prisma/skills](https://github.com/prisma/skills/tree/8ea289b730c2e89f7ff1f518af128b113d842a92) @ `8ea289b` | MIT |
| `motion` | [motiondivision/ai-kit](https://github.com/motiondivision/ai-kit/tree/1e424943582cbbdb6e3f410687e39f96451447bb/plugins/motion/skills/motion) `plugins/motion/skills/motion` @ `1e42494` | MIT (según su `package.json`) |
| `chrome-devtools`, `a11y-debugging`, `debug-optimize-lcp`, `troubleshooting` | [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/0b37364dc0a88a804c6d73d3335e776adc7f33c4/skills) `skills/` @ `0b37364` (v1.12.0) | Apache-2.0 |

Cambios respecto al original:

- `shadcn/SKILL.md`: el comando que inyecta el contexto (`!`…``) y `allowed-tools` usan `pnpm --filter @zarape/ui exec shadcn` (versión 4.23.0 del repo, donde está `components.json`) en lugar de `npx shadcn@latest`. Se agregó una nota al inicio. Se quitaron `evals/` y `agents/openai.yml` (son de Codex).
- No se copiaron las skills que no aplican: `migrate-radix-to-base` (shadcn); `prisma-compute`, `prisma-postgres-setup`, `prisma-upgrade-v7`, `prisma-mongodb-upgrade`, `prisma-driver-adapter-implementation` y alias deprecados (Prisma); `chrome-devtools-cli`, `cookie-debugging` y `memory-leak-debugging` (Chrome DevTools); el agente `motion-reviewer` (requiere Motion+, de pago).

## Servidores MCP (`.mcp.json`)

| Servidor | Qué es | Notas |
|---|---|---|
| `shadcn` | `shadcn mcp` del repo (4.23.0) | Busca, muestra y da el comando para instalar componentes del registro. Corre con `--cwd packages/ui`. |
| `chrome-devtools` | `chrome-devtools-mcp@1.12.0` (Google) vía `npx` | Abre Chrome: Lighthouse (`lighthouse_audit`), accesibilidad, trazas de rendimiento, red y consola. Telemetría de Google y CrUX apagadas (`--no-usage-statistics`, `--no-performance-crux`). |
| `motion` | `https://mcp.motion.dev` (alojado por Motion) | Gratis y sin cuenta: búsqueda de docs y ejemplos, springs CSS, panel de inserción. Las consultas van a motion.dev. Sin el servidor Motion+ (de pago). |
| `prisma` | `prisma mcp` del repo (7.10.1) | `migrate-status`, `migrate-dev` y Prisma Studio. No tiene `migrate-reset`. Sin el servidor remoto de Prisma (pide cuenta de Prisma Postgres). |

## Actualizar

Al subir la versión de una herramienta, actualizar su skill desde el mismo repo oficial (nuevo commit), repetir los cambios de arriba, ajustar la versión en `.mcp.json` y registrar el cambio en `changelog/`. Las skills de Chrome DevTools deben coincidir con la versión del MCP.
