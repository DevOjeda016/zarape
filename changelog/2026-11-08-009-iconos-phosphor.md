# Íconos de la interfaz: Phosphor

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** NF03

## Qué cambió

- La librería de íconos de la UI es **Phosphor** (`@phosphor-icons/react`), configurada como `iconLibrary` de shadcn. Antes era Lucide.
- `branding/README.md`: la sección Iconografía ahora explica los pesos (regular para la interfaz, fill para lo activo, duotone para el kiosko, bold para cocina y turnos) y la lista de íconos clave con sus nombres de Phosphor.
- `CLAUDE.md` y `docs/arquitectura.md` registran la decisión. También se dejó escrito que no se usa GSAP: Motion cubre las animaciones.
- En el sistema de marca publicado se actualizaron la guía y EstadoComanda.

## Por qué

Phosphor tiene seis pesos para marcar estados activos con elegancia, un estilo redondeado que combina con el jarro y Bricolage Grotesque, y buen set de íconos de comida. shadcn lo soporta al crear el proyecto.

## Archivos

- `branding/README.md`
- `CLAUDE.md`
- `docs/arquitectura.md`
- `changelog/README.md`
- `changelog/2026-11-08-009-iconos-phosphor.md`
