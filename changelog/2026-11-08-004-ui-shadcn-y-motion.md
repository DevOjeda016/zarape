# UI con shadcn y Motion; isotipo en revisión

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** NF03, RF13, RF17

## Qué cambió

- Stack de UI: **shadcn/ui + Tailwind CSS v4 + Motion**. Como extras: Sonner, Drawer, shadcn Charts y Magic UI cuando sume.
- `branding/README.md`:
  - Tabla que conecta las variables de shadcn con los tokens de la marca.
  - Lista de componentes base y propios.
  - Nueva sección **Movimiento** con animaciones por momento y reglas de duración, rendimiento y movimiento reducido.
- El isotipo "sol sobre el zarape" queda **en revisión**. Se presentaron cuatro conceptos nuevos: A Z con flecos, B sol minimal, C jarro de café de olla y D zarape doblado.
- Se confirmó la regla de tarjetas con máxima seguridad: el número completo y el CVV no se guardan.
- Se actualizaron `docs/arquitectura.md` y `CLAUDE.md`.

## Por qué

- El equipo quiere una UI moderna, con movimiento, fresca y elegante, sobre un estándar actual.
- El isotipo anterior no convenció.
- El despliegue se define más adelante.

## Pendientes

- Elegir concepto de isotipo y reemplazar `branding/logos/`.
- Confirmar si también cambia el set de íconos de la UI (hoy Lucide).
- Rehacer los ejemplos del sistema de marca con componentes shadcn cuando exista `packages/ui`.

## Archivos

- `branding/README.md`
- `docs/arquitectura.md`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-08-004-ui-shadcn-y-motion.md`
