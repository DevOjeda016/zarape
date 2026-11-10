# Jarro mono: el asa ya no se ve encima del cuerpo

- **Fecha:** 2026-11-08
- **Autor:** Daniel Ojeda Luna
- **Tipo:** fixed
- **Módulo:** Transversal
- **Requerimientos:** NF03

## Qué cambió

- En `jarro-mono.svg` las franjas del zarape son huecos recortados en el cuerpo. El extremo del asa quedaba debajo y se asomaba por esos huecos, así que parecía encimada sobre el jarro.
- El asa ahora lleva una máscara que la oculta dentro del cuerpo. Las franjas llegan limpias hasta el borde y el asa solo se ve por fuera.
- Se subió el nuevo `jarro-mono.svg` al sistema de marca publicado.

## Por qué

La entrada 007 movió los extremos del asa hacia dentro, pero eso no resolvía el problema real: el asa se veía a través de los huecos de la franja. Las versiones a color no tenían el problema, porque su cuerpo es sólido y tapa el asa.

## Archivos

- `branding/scripts/generar-logos.js`
- `branding/logos/jarro-mono.svg`
- `changelog/README.md`
- `changelog/2026-11-08-008-asa-encimada-en-mono.md`
