# Branding nuevo y decisiones de arquitectura

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** added
- **Módulo:** Transversal
- **Requerimientos:** NF03, NF01, NF02, RF01–RF20

## Qué cambió

- Se leyó `requirements/El Zarape_8910.pdf`, el documento de requerimientos original con los RF/RDF/NF.
- Se creó la identidad de marca en `branding/`:
  - Guía de marca: idea, logo, color, tipografía, voz, fotografía, iconografía, forma, estilo por app y accesibilidad.
  - Isotipo "sol sobre el zarape" en versiones color, maskable (PWA) y mono.
  - `tokens.css` con tema claro y oscuro. Todos los pares texto/fondo pasan WCAG AA.
- Se publicó el sistema de marca interactivo con 6 componentes de ejemplo: https://claude.ai/artifact/MBmLHKVu9Q878MttpVD6VQ
- Se actualizó `CLAUDE.md`:
  - Nuevas fuentes de verdad.
  - Tres apps separadas.
  - Roles: admin, cocina, comensal y cliente.
  - Detalle de RF por módulo.
  - Corrección de la regla de eliminar.
  - Reglas de contraseña e IVA.
  - Sección de identidad apuntando a `branding/`.

## Por qué

- El profesor confirmó que la paleta, las tipografías, el logo y las pantallas de NF03 solo eran ejemplos. Se propone una identidad moderna y accesible que conserva la idea: nombre, imagen mexicana y zarape de colores.
- El equipo decidió separar los módulos en tres apps.
- La regla de "siempre baja lógica" estaba mal. El documento original indica borrar si no hay registros relacionados y dar de baja si los hay.

## Pendientes

- Definir back end, motor de BD y cómo se mandan las comandas en tiempo real (kiosko → cocina → turnos).
- Confirmar la estructura del monorepo y dónde vive la lectura del QR de ventanilla.
- Hacer el lockup (isotipo + nombre) en vector con texto convertido a curvas.

## Archivos

- `branding/README.md`
- `branding/tokens.css`
- `branding/logos/isotipo.svg`
- `branding/logos/isotipo-maskable.svg`
- `branding/logos/isotipo-mono.svg`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-08-002-branding-y-decisiones.md`
