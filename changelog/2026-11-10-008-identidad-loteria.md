# Identidad nueva: Lotería

- **Fecha:** 2026-11-10
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** NF03

## Qué cambió

Se reemplazó el sistema de diseño completo por la dirección **Lotería**, elegida entre tres propuestas (rótulo de fonda, sol de zarape y lotería):

- **Idea:** cada platillo es una carta de lotería sobre una mesa verde y el pedido listo se canta ("¡Lotería! La 042 ya está lista").
- **Logo:** la carta número 1, con el jarrito de barro frente a un zarape colgado y el título "EL ZARAPE" en Ultra convertido a curvas. Archivos nuevos: `carta.svg`; rehechos: `jarro.svg`, `isotipo.svg`, `isotipo-maskable.svg`, `jarro-mono.svg`; se quitó `isotipo-oscuro.svg` (el isotipo ya va sobre verde mesa). Los colores del logo son fijos, ya no hay variables `--logo-*`.
- **Color:** paleta de baraja de lotería (`mesa`, `carta`, `papel`, `tinta`, `chile`, `maiz`, `jarra`, `nopal`, `rosa`) y tokens semánticos por tema (`fondo`, `texto`, `accion`, `foco`…). Dos temas: **papel** (claro, predeterminado) y **mesa** (`data-theme="mesa"`, verde oscuro); dentro de mesa, una carta vuelve a papel con `data-theme="papel"`. Contraste AA revisado en los dos temas.
- **Tipografía:** Ultra (display) y Libre Franklin (interfaz) en lugar de Bricolage Grotesque e Inter; `font-synthesis-weight: none` para que Ultra no se engruese de mentira.
- **shadcn:** variables conectadas a los tokens semánticos; la variante `dark:` es el tema mesa y no aplica dentro de una sección papel; barra lateral siempre mesa; utilidades `rounded-carta` y `shadow-carta`.
- **Íconos:** Phosphor `bold` en kiosko, drive thru y cocina (combina con el trazo de las cartas); `regular` en gestión; `fill` para lo activo. Se quitó `duotone`.
- **Apps:** kiosko/cocina (`pos`) y drive thru usan el tema mesa; `theme_color` `#12402E` en los tres manifest; la pantalla de inicio muestra la carta.
- **Generador de logos:** reescrito; convierte el texto a curvas con `opentype.js` (nueva dependencia de desarrollo en la raíz) y la fuente Ultra de `packages/ui`. Con eso se cierra el pendiente del logotipo con texto en curvas.
- Guía `branding/README.md` y `CLAUDE.md` actualizados.

## Por qué

El sistema anterior (fondo crema, acento terracota, Inter, tarjetas redondeadas con sombra suave) se veía genérico y aburrido. Lotería sale de la cultura visual mexicana, conserva lo que pide NF03 (logo con el nombre, imagen mexicana y zarape de colores) y le da a la app un momento propio: cantar el pedido listo.

## Archivos

- `branding/README.md`
- `branding/tokens.css`
- `branding/scripts/generar-logos.js`
- `branding/logos/carta.svg` (nuevo)
- `branding/logos/jarro.svg`, `isotipo.svg`, `isotipo-maskable.svg`, `jarro-mono.svg`
- `branding/logos/isotipo-oscuro.svg` (eliminado)
- `packages/ui/src/styles/globals.css`, `packages/ui/package.json`
- `package.json`, `pnpm-lock.yaml`
- `apps/admin/index.html`, `apps/admin/vite.config.ts`, `apps/admin/src/App.tsx`
- `apps/pos/index.html`, `apps/pos/vite.config.ts`, `apps/pos/src/App.tsx`
- `apps/drive-thru/index.html`, `apps/drive-thru/vite.config.ts`, `apps/drive-thru/src/App.tsx`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-10-004-identidad-loteria.md`
