# Isotipo final: jarrito de barro envuelto en zarape

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** changed
- **Módulo:** Transversal
- **Requerimientos:** NF03

## Qué cambió

- El isotipo ahora es un **jarrito de barro** como los de café de olla: panza redonda, boca abierta y asa de lado, en color barro. Lo envuelve un **zarape con flecos** (crema, rosa, cempasúchil, talavera, crema) y tiene tres hilos de vapor.
- Variantes en `branding/logos/`:
  - `jarro.svg`: sin fondo.
  - `isotipo.svg`: cuadro claro.
  - `isotipo-oscuro.svg`: cuadro café.
  - `isotipo-maskable.svg`: para la PWA.
  - `jarro-mono.svg`: una tinta con `currentColor`. Reemplaza a `isotipo-mono.svg`, que se eliminó.
- Los SVG usan las variables `--logo-fondo`, `--logo-jarro`, `--logo-boca` y `--logo-vapor` con valor de respaldo, así se adaptan a claro y oscuro cuando se insertan en línea. Se agregaron a `branding/tokens.css` en los dos temas.
- Nuevo `branding/scripts/generar-logos.js`, que genera todas las variantes desde una sola geometría.
- Se actualizaron `branding/README.md`, `CLAUDE.md` y el sistema de marca publicado: logos, tokens `logo-*` y portada con la silueta del jarrito.

## Por qué

En el jarro anterior el zarape era una franja delgada y no se notaba. El equipo pidió la forma de los jarritos de barro mexicanos, con el zarape envolviéndolos y variantes para modo claro, modo oscuro y otros usos.

## Pendientes

- Lockup (jarro + "El Zarape") en vector con el texto convertido a curvas.
- Íconos PNG de la PWA (192, 512, maskable, apple-touch) generados desde los SVG al crear las apps.
- Confirmar si cambia el set de íconos de la UI (hoy Lucide).

## Archivos

- `branding/logos/jarro.svg`
- `branding/logos/isotipo.svg`
- `branding/logos/isotipo-oscuro.svg`
- `branding/logos/isotipo-maskable.svg`
- `branding/logos/jarro-mono.svg`
- `branding/logos/isotipo-mono.svg` (eliminado)
- `branding/scripts/generar-logos.js`
- `branding/tokens.css`
- `branding/README.md`
- `CLAUDE.md`
- `changelog/README.md`
- `changelog/2026-11-08-006-jarro-envuelto-en-zarape.md`
